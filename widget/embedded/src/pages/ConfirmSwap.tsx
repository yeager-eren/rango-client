import type { WalletType } from '@rango-dev/wallets-shared';

import { i18n } from '@lingui/core';
import { useManager } from '@rango-dev/queue-manager-react';
import {
  ConfirmSwap,
  Divider,
  HighSlippageWarning,
  LoadingFailedAlert,
  PercentageChange,
  RoutesOverview,
  TokenPreview,
} from '@rango-dev/ui';
import { useWallets } from '@rango-dev/wallets-core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConfirmSwapErrors } from '../components/ConfirmSwapErrors';
import { ConfirmSwapWarnings } from '../components/ConfirmSwapWarnings';
import { navigationRoutes } from '../constants/navigationRoutes';
import { HIGH_SLIPPAGE } from '../constants/swapSettings';
import { useConfirmSwap } from '../hooks/useConfirmSwap';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { useBestRouteStore } from '../store/bestRoute';
import { useMetaStore } from '../store/meta';
import { useSettingsStore } from '../store/settings';
import { useUiStore } from '../store/ui';
import { useWalletsStore } from '../store/wallets';
import { ConfirmSwapErrorTypes } from '../types';
import { numberToString } from '../utils/numbers';
import { getBestRouteStatus } from '../utils/routing';
import {
  confirmSwapDisabled,
  getPercentageChange,
  getTotalFeeInUsd,
  isValidCustomDestination,
} from '../utils/swap';
import {
  getKeplrCompatibleConnectedWallets,
  getRequiredChains,
  getSelectableWallets,
  isExperimentalChain,
} from '../utils/wallets';

import { ConfirmWalletsModal } from './ConfirmWalletsModal/ConfirmWalletsModal';

export function ConfirmSwapPage({
  customDestinationEnabled,
}: {
  customDestinationEnabled?: boolean;
}) {
  const navigate = useNavigate();
  const { navigateBackFrom } = useNavigateBack();
  const bestRoute = useBestRouteStore.use.bestRoute();
  const fetchingBestRoute = useBestRouteStore.use.loading();
  const fetchingBestRouteError = useBestRouteStore.use.error();
  const setSelectedSwap = useUiStore.use.setSelectedSwap();
  const { blockchains, tokens } = useMetaStore.use.meta();
  const loadingMetaStatus = useMetaStore.use.loadingStatus();
  const connectedWallets = useWalletsStore.use.connectedWallets();
  const customDestination = useWalletsStore.use.customDestination();
  const setCustomDestination = useWalletsStore.use.setCustomDestination();
  const initSelectedWallets = useWalletsStore.use.initSelectedWallets();
  const slippage = useSettingsStore.use.slippage();
  const customSlippage = useSettingsStore.use.customSlippage();
  const inputUsdValue = useBestRouteStore.use.inputUsdValue();
  const outputUsdValue = useBestRouteStore.use.outputUsdValue();
  const setInputAmount = useBestRouteStore.use.setInputAmount();
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');
  const bestRouteloadingStatus = getBestRouteStatus(
    fetchingBestRoute,
    !!fetchingBestRouteError
  );
  const [destinationChain, setDestinationChain] = useState<string>('');

  const [showWallets, setShowWallets] = useState(false);
  const { manager } = useManager();
  const {
    loading: fetchingConfirmedRoute,
    errors,
    warnings,
    confirmSwap,
  } = useConfirmSwap();

  const selectedSlippage = customSlippage || slippage;

  const showHighSlippageWarning = !errors.find(
    (error) => error.type === ConfirmSwapErrorTypes.INSUFFICIENT_SLIPPAGE
  );

  const { getWalletInfo, connect } = useWallets();

  const firstStep = bestRoute?.result?.swaps[0];
  const lastStep =
    bestRoute?.result?.swaps[bestRoute?.result?.swaps.length - 1];

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const fromAmount = numberToString(firstStep?.fromAmount, 4, 6);
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const toAmount = numberToString(lastStep?.toAmount, 4, 6);
  useEffect(() => {
    initSelectedWallets();
    if (customDestination) {
      setCustomDestination('');
    }
  }, []);
  const lastStepToBlockchain =
    bestRoute?.result?.swaps[bestRoute?.result?.swaps.length - 1].to.blockchain;
  const isWalletRequired = !!bestRoute?.result?.swaps.find(
    (swap) => swap.from.blockchain === lastStepToBlockchain
  );

  const selectableWallets = getSelectableWallets(
    connectedWallets,
    getWalletInfo,
    isWalletRequired ? '' : destinationChain
  );

  const handleConnectChain = (wallet: string) => {
    const network = wallet;
    getKeplrCompatibleConnectedWallets(selectableWallets).forEach(
      async (compatibleWallet: WalletType) =>
        connect?.(compatibleWallet, network)
    );
  };

  const totalFeeInUsd = getTotalFeeInUsd(bestRoute, tokens);

  const percentageChange =
    !inputUsdValue || !outputUsdValue || !outputUsdValue.gt(0)
      ? null
      : getPercentageChange(
          inputUsdValue.toNumber(),
          outputUsdValue.toNumber()
        );

  useEffect(() => {
    console.log('log');
    setShowWallets(true);
  }, []);
  return (
    <>
      {showWallets && (
        <ConfirmWalletsModal
          open={showWallets}
          onClose={setShowWallets.bind(null, false)}
          customDestinationEnabled={customDestinationEnabled}
        />
      )}
      <ConfirmSwap
        requiredWallets={getRequiredChains(bestRoute)}
        selectableWallets={selectableWallets}
        setCustomDestination={setCustomDestination}
        customDestination={customDestination}
        customDestinationEnabled={customDestinationEnabled}
        isValidCustomDestination={isValidCustomDestination}
        checkedDestination={!!destinationChain}
        setDestinationChain={setDestinationChain}
        onBack={navigateBackFrom.bind(null, navigationRoutes.confirmSwap)}
        onConfirm={async () => {
          await confirmSwap?.().then(async (swap) => {
            if (swap) {
              try {
                await manager?.create(
                  'swap',
                  { swapDetails: swap },
                  { id: swap.requestId }
                );
                setSelectedSwap(swap.requestId);
                navigate('/' + navigationRoutes.swaps + `/${swap.requestId}`, {
                  replace: true,
                });
                setTimeout(() => {
                  setInputAmount('');
                }, 0);
              } catch (e) {
                setDbErrorMessage('Error: ' + (e as any)?.message);
              }
            }
          });
        }}
        isWalletRequired={isWalletRequired}
        onChange={() => {
          //
        }}
        confirmDisabled={
          loadingMetaStatus !== 'success' ||
          confirmSwapDisabled(
            fetchingBestRoute,
            destinationChain,
            customDestination,
            bestRoute,
            selectableWallets
          )
        }
        handleConnectChain={(wallet) => handleConnectChain(wallet)}
        isExperimentalChain={(wallet) =>
          getKeplrCompatibleConnectedWallets(selectableWallets).length > 0
            ? isExperimentalChain(blockchains, wallet)
            : false
        }
        previewInputs={
          <>
            <TokenPreview
              chain={{
                displayName: firstStep?.from.blockchain || '',
                logo: firstStep?.from.blockchainLogo || '',
              }}
              token={{
                symbol: firstStep?.from.symbol || '',
                image: firstStep?.from.logo || '',
              }}
              usdValue={inputUsdValue ? numberToString(inputUsdValue) : null}
              amount={fromAmount}
              label={i18n.t('From')}
              loadingStatus={
                loadingMetaStatus !== 'success'
                  ? loadingMetaStatus
                  : bestRouteloadingStatus
              }
            />
            <Divider size={12} />
            <TokenPreview
              chain={{
                displayName: lastStep?.to.blockchain || '',
                logo: lastStep?.to.blockchainLogo || '',
              }}
              token={{
                symbol: lastStep?.to.symbol || '',
                image: lastStep?.to.logo || '',
              }}
              usdValue={outputUsdValue ? numberToString(outputUsdValue) : null}
              amount={toAmount}
              label={i18n.t('To')}
              loadingStatus={
                loadingMetaStatus !== 'success'
                  ? loadingMetaStatus
                  : bestRouteloadingStatus
              }
              percentageChange={
                !percentageChange ? null : (
                  <PercentageChange
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    percentageChange={numberToString(percentageChange, 0, 2)}
                    showPercentageChange={!!percentageChange?.lt(0)}
                  />
                )
              }
            />
          </>
        }
        previewRoutes={
          <RoutesOverview
            routes={bestRoute}
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            totalFee={numberToString(totalFeeInUsd, 0, 2)}
          />
        }
        loading={fetchingConfirmedRoute}
        errors={
          dbErrorMessage
            ? [dbErrorMessage, ...ConfirmSwapErrors(errors)]
            : ConfirmSwapErrors(errors)
        }
        warnings={ConfirmSwapWarnings(warnings)}
        extraMessages={
          <>
            {loadingMetaStatus === 'failed' && <LoadingFailedAlert />}
            {loadingMetaStatus === 'failed' && showHighSlippageWarning && (
              <Divider />
            )}
            <HighSlippageWarning
              selectedSlippage={selectedSlippage}
              highSlippage={selectedSlippage >= HIGH_SLIPPAGE}
              changeSlippage={() => navigate('/' + navigationRoutes.settings)}
            />
          </>
        }
        confirmButtonTitle={
          warnings.length > 0 || errors.length > 0
            ? `${i18n.t('Proceed anyway!')}`
            : `${i18n.t('Confirm swap!')}`
        }
      />
    </>
  );
}
