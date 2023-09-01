/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { ConnectedWallet } from '../store/wallets';
import type {
  ConfirmSwapError,
  ConfirmSwapWarnings,
  PendingSwapSettings,
} from '../types';
import type { PendingSwap } from '@rango-dev/queue-manager-rango-preset';
import type { BestRouteResponse } from 'rango-sdk';

import { calculatePendingSwap } from '@rango-dev/queue-manager-rango-preset';
import BigNumber from 'bignumber.js';
import { useEffect, useRef, useState } from 'react';

import { HIGH_SLIPPAGE } from '../constants/swapSettings';
import { httpService } from '../services/httpService';
import { fetchBestRoute, useBestRouteStore } from '../store/bestRoute';
import { useMetaStore } from '../store/meta';
import { useSettingsStore } from '../store/settings';
import { useWalletsStore } from '../store/wallets';
import {
  ConfirmSwapErrorTypes,
  RouteWarningType,
  SlippageWarningType,
} from '../types';
import { numberToString } from '../utils/numbers';
import {
  isNumberOfSwapsChanged,
  isRouteChanged,
  isRouteInternalCoinsUpdated,
  isRouteSwappersUpdated,
} from '../utils/routing';
import {
  createBestRouteRequestBody,
  getBalanceWarnings,
  getMinRequiredSlippage,
  getOutputRatio,
  getPercentageChange,
  getRouteOutputAmount,
  getWalletsForNewSwap,
  hasProperSlippage,
  isOutputAmountChangedALot,
  outputRatioHasWarning,
} from '../utils/swap';

type ConfirmSwap = {
  loading: boolean;
  error: ConfirmSwapError | null;
  warnings: ConfirmSwapWarnings;
  confirmSwap: (() => Promise<PendingSwap | undefined>) | null;
  refresh: () => void;
  cancel: () => void;
};

type Params = {
  selectedWallets?: ConnectedWallet[];
  customDestination?: string;
};

export function useConfirmSwap(): ConfirmSwap {
  const fromToken = useBestRouteStore.use.fromToken();
  const toToken = useBestRouteStore.use.toToken();
  const inputAmount = useBestRouteStore.use.inputAmount();
  const initialRoute = useBestRouteStore.use.bestRoute();
  const setBestRoute = useBestRouteStore.use.setBestRoute();
  const inputUsdValue = useBestRouteStore.use.inputUsdValue();
  const affiliateRef = useSettingsStore.use.affiliateRef();
  const affiliatePercent = useSettingsStore.use.affiliatePercent();
  const affiliateWallets = useSettingsStore.use.affiliateWallets();

  const connectedWallets = useWalletsStore.use.connectedWallets();
  const destination = useWalletsStore.use.customDestination();
  const selectedWallets = connectedWallets.filter(
    (connectedWallet) => connectedWallet.selected
  );
  console.log({ selectedWallets });
  const meta = useMetaStore.use.meta();
  const customSlippage = useSettingsStore.use.customSlippage();
  const slippage = useSettingsStore.use.slippage();
  const disabledLiquiditySources =
    useSettingsStore.use.disabledLiquiditySources();
  const userSlippage = customSlippage || slippage;
  const confirmed = useRef(false);
  const confirmedRouteRef = useRef<BestRouteResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmSwapError | null>(null);
  const initialWarningsState: ConfirmSwapWarnings = {
    balance: null,
    route: null,
    slippage: null,
  };
  const [warnings, setWarnings] =
    useState<ConfirmSwapWarnings>(initialWarningsState);

  const cancel = () => abortControllerRef.current?.abort();

  const refresh = () => {
    setLoading(true);
    setWarnings(initialWarningsState);
    setError(null);
    fetchBestRoute();
  };

  useEffect(() => {
    return cancel;
  }, []);

  if (!fromToken || !toToken || !inputAmount || !initialRoute) {
    return {
      loading: false,
      warnings: initialWarningsState,
      error: null,
      confirmSwap: null,
      refresh,
      cancel,
    };
  }

  const confirmSwap = async (
    params?: Params
  ): Promise<PendingSwap | undefined> => {
    if (!confirmed.current) {
      abortControllerRef.current = new AbortController();

      setLoading(true);

      const requestBody = createBestRouteRequestBody(
        fromToken,
        toToken,
        inputAmount,
        connectedWallets,
        params?.selectedWallets ?? selectedWallets,
        disabledLiquiditySources,
        userSlippage,
        affiliateRef,
        affiliatePercent,
        affiliateWallets,
        initialRoute,
        params?.customDestination ?? destination
      );

      try {
        const confirmedRoute = await httpService().getBestRoute(requestBody, {
          signal: abortControllerRef.current?.signal,
        });

        abortControllerRef.current = null;

        setLoading(false);

        if (
          !confirmedRoute.result ||
          !new BigNumber(confirmedRoute.requestAmount).isEqualTo(
            new BigNumber(inputAmount || '-1')
          )
        ) {
          setError({
            type: ConfirmSwapErrorTypes.NO_ROUTE,
          });
          return;
        }

        const confirmSwapState: Pick<ConfirmSwap, 'error' | 'warnings'> = {
          error: null,
          warnings: { route: null, balance: null, slippage: null },
        };

        const routeChanged = isRouteChanged(initialRoute, confirmedRoute);

        if (routeChanged) {
          setBestRoute(confirmedRoute);
          const newRouteOutputUsdValue = new BigNumber(
            confirmedRoute.result?.outputAmount || '0'
          ).multipliedBy(toToken.usdPrice || 0);

          const outputRatio = getOutputRatio(
            inputUsdValue,
            newRouteOutputUsdValue
          );
          const highValueLoss = outputRatioHasWarning(
            inputUsdValue,
            outputRatio
          );

          if (highValueLoss) {
            confirmSwapState.error = {
              type: ConfirmSwapErrorTypes.ROUTE_UPDATED_WITH_HIGH_VALUE_LOSS,
            };
          } else if (isOutputAmountChangedALot(initialRoute, confirmedRoute)) {
            confirmSwapState.warnings.route = {
              type: RouteWarningType.ROUTE_AND_OUTPUT_AMOUNT_UPDATED,
              newOutputAmount: numberToString(
                getRouteOutputAmount(confirmedRoute)
              ),
              percentageChange: numberToString(
                getPercentageChange(
                  getRouteOutputAmount(initialRoute),
                  getRouteOutputAmount(confirmedRoute)
                ),
                null,
                2
              ),
            };
          } else if (
            isRouteInternalCoinsUpdated(initialRoute, confirmedRoute)
          ) {
            confirmSwapState.warnings.route = {
              type: RouteWarningType.ROUTE_COINS_UPDATED,
            };
          } else if (isNumberOfSwapsChanged(initialRoute, confirmedRoute)) {
            confirmSwapState.warnings.route = {
              type: RouteWarningType.ROUTE_UPDATED,
            };
          } else if (isRouteSwappersUpdated(initialRoute, confirmedRoute)) {
            confirmSwapState.warnings.route = {
              type: RouteWarningType.ROUTE_SWAPPERS_UPDATED,
            };
          }
        }

        const balanceWarnings = getBalanceWarnings(
          confirmedRoute,
          selectedWallets
        );
        const enoughBalance = balanceWarnings.length === 0;

        if (!enoughBalance) {
          confirmSwapState.warnings.balance = {
            messages: balanceWarnings,
          };
        }

        const minRequiredSlippage = getMinRequiredSlippage(initialRoute);
        const highSlippage = userSlippage > HIGH_SLIPPAGE;

        if (!hasProperSlippage(userSlippage.toString(), minRequiredSlippage)) {
          confirmSwapState.warnings.slippage = {
            type: SlippageWarningType.INSUFFICIENT_SLIPPAGE,
            slippage: minRequiredSlippage,
          };
        } else if (highSlippage) {
          confirmSwapState.warnings.slippage = {
            type: SlippageWarningType.HIGH_SLIPPAGE,
            slippage: userSlippage.toString(),
          };
        }

        if (!confirmed.current) {
          confirmed.current = true;
          setError(confirmSwapState.error);
          setWarnings(confirmSwapState.warnings);
          confirmedRouteRef.current = confirmedRoute;
        }
        return;
      } catch (error) {
        if ((error as any)?.code === 'ERR_CANCELED') {
          return;
        }

        const status = (error as any)?.response?.status;

        setLoading(false);
        setError({
          type: ConfirmSwapErrorTypes.REQUEST_FAILED,
          status,
        });

        return;
      }
    } else {
      const swapSettings: PendingSwapSettings = {
        slippage: userSlippage.toString(),
        disabledSwappersGroups: disabledLiquiditySources,
      };
      if (!error && confirmedRouteRef.current) {
        setError(null);
        setWarnings(initialWarningsState);
        confirmed.current = false;

        const newSwap = calculatePendingSwap(
          inputAmount.toString(),
          confirmedRouteRef.current,
          getWalletsForNewSwap(selectedWallets),
          swapSettings,
          false,
          meta
        );
        return newSwap;
      }
      return;
    }
  };

  return {
    loading,
    warnings,
    error,
    confirmSwap,
    refresh,
    cancel,
  };
}
