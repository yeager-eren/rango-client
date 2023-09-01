/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { PropTypes } from './ConfirmSwapPage.types';
import type { PriceImpactWarningLevel } from '@rango-dev/ui/dist/widget/ui/src/components/PriceImpact/PriceImpact.types';

import { i18n } from '@lingui/core';
import { useManager } from '@rango-dev/queue-manager-react';
import {
  Alert,
  BestRoute,
  Button,
  IconButton,
  MessageBox,
  Modal,
  RefreshIcon,
  SettingsIcon,
  styled,
  Tooltip,
  Typography,
  WalletIcon,
} from '@rango-dev/ui';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getConfirmSwapErrorMessage } from '../../components/ConfirmSwapErrors';
import { getRouteWarningMessage } from '../../components/ConfirmSwapWarnings';
import { HeaderButton } from '../../components/HeaderButtons/HeaderButtons.styles';
import { Layout } from '../../components/Layout';
import { navigationRoutes } from '../../constants/navigationRoutes';
import { HIGHT_PRICE_IMPACT, LOW_PRICE_IMPACT } from '../../constants/routing';
import { useConfirmSwap } from '../../hooks/useConfirmSwap';
import { useBestRouteStore } from '../../store/bestRoute';
import { useMetaStore } from '../../store/meta';
import { useSettingsStore } from '../../store/settings';
import { useUiStore } from '../../store/ui';
import { SlippageWarningType } from '../../types';
import {
  numberToString,
  secondsToString,
  totalArrivalTime,
} from '../../utils/numbers';
import { getPercentageChange, getTotalFeeInUsd } from '../../utils/swap';
import { formatBestRoute } from '../ConfirmWalletsModal/ConfirmWallets.helpers';
import { ConfirmWalletsModal } from '../ConfirmWalletsModal/ConfirmWalletsModal';

const Container = styled('div', {
  position: 'relative',
  width: '100%',
  height: '593px',
  '& .title': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '$10',
  },
  '& .icon': {
    width: '$24',
    height: '$24',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .buttons': {
    width: '100%',
    position: 'absolute',
    bottom: '$0',
    display: 'flex',
    justifyContent: 'space-between',
    filter: 'drop-shadow(white 0 -10px 10px)',
  },
  '& .confirm-button': {
    flexGrow: 1,
    paddingRight: '$10',
  },
});

export function ConfirmSwapPage(props: PropTypes) {
  const { customDestinationEnabled, multiWallets, supportedWallets, config } =
    props;
  const navigate = useNavigate();
  const [showWallets, setShowWallets] = useState(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string>('');
  const [showSlippageWarning, setShowSlippageWarning] = useState(false);
  const bestRoute = useBestRouteStore.use.bestRoute();
  const [walletsConfirmed, setWalletsConfirmed] = useState(false);
  const inputAmount = useBestRouteStore.use.inputAmount();
  const outputAmount = useBestRouteStore.use.outputAmount();
  const inputUsdValue = useBestRouteStore.use.inputUsdValue();
  const outputUsdValue = useBestRouteStore.use.outputUsdValue();
  const setInputAmount = useBestRouteStore.use.setInputAmount();
  const setSelectedSwap = useUiStore.use.setSelectedSwap();
  const { tokens } = useMetaStore.use.meta();
  const slippage = useSettingsStore.use.slippage();
  const customSlippage = useSettingsStore.use.customSlippage();
  const { manager } = useManager();
  const selectedSlippage = customSlippage || slippage;
  const { confirmSwap, cancel, loading, warnings, error } = useConfirmSwap();
  const routeWarning = warnings.route;
  const balanceWarnings = warnings.balance;
  const slippageWarning = warnings.slippage;
  const totalFeeInUsd = getTotalFeeInUsd(bestRoute, tokens);
  const percentageChange = numberToString(
    getPercentageChange(
      inputUsdValue?.toNumber() ?? 0,
      outputUsdValue?.toNumber() ?? 0
    ),
    2,
    2
  );
  let warningLevel: PriceImpactWarningLevel = undefined;
  if (parseFloat(percentageChange) >= HIGHT_PRICE_IMPACT) {
    warningLevel = 'high';
  } else if (parseFloat(percentageChange) >= LOW_PRICE_IMPACT) {
    warningLevel = 'low';
  }

  const onClose = () => {
    cancel();
    setShowWallets(false);
  };

  const onConfirm = async () => {
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
  };

  const onClick = async () => {
    if (warnings.slippage) {
      setShowSlippageWarning(true);
    } else {
      await onConfirm();
    }
  };

  useEffect(() => {
    setShowWallets(true);
  }, []);

  useEffect(() => {
    if (!showWallets && !walletsConfirmed) {
      navigate(navigationRoutes.home);
    }
  }, [showWallets, walletsConfirmed]);

  return (
    <Layout
      header={{
        title: 'Confirm Swap',
        onBack: navigate.bind(null, -1),
        hasConnectWallet: true,
        suffix: (
          <Tooltip side="bottom" content={i18n.t('Settings')}>
            <HeaderButton size="small" variant="ghost">
              <SettingsIcon size={18} color="black" />
            </HeaderButton>
          </Tooltip>
        ),
      }}>
      <Modal
        anchor="bottom"
        open={showSlippageWarning}
        prefix={
          <Button
            size="small"
            onClick={() => navigate('/' + navigationRoutes.settings)}>
            <Typography variant="label" size="medium" color="$neutral500">
              Change settings
            </Typography>
          </Button>
        }
        container={document.querySelector('#swap-box') as HTMLDivElement}
        onClose={setShowSlippageWarning.bind(null, (prevState) => !prevState)}>
        {slippageWarning && (
          <MessageBox
            type="warning"
            title={
              slippageWarning.type === SlippageWarningType.HIGH_SLIPPAGE
                ? 'High slippage'
                : 'Low slippage'
            }
            description={
              slippageWarning.type === SlippageWarningType.HIGH_SLIPPAGE
                ? i18n.t(
                    'highSlippage',
                    { selectedSlippage },
                    {
                      message:
                        ' Caution, your slippage is high (={selectedSlippage}). Your trade may be front run.',
                    }
                  )
                : i18n.t(
                    'increaseSlippage',

                    { minRequiredSlippage: slippageWarning.slippage },
                    {
                      message:
                        'We recommend you to increase slippage to at least {minRequiredSlippage} for this route.',
                    }
                  )
            }>
            <Button
              style={{ marginTop: '10px' }}
              type="primary"
              variant="contained"
              fullWidth
              onClick={onConfirm}>
              Confirm anyway
            </Button>
          </MessageBox>
        )}
      </Modal>
      <ConfirmWalletsModal
        open={showWallets}
        onClose={onClose}
        customDestinationEnabled={customDestinationEnabled}
        multiWallets={multiWallets}
        supportedWallets={supportedWallets}
        config={config}
        walletsConfirmed={walletsConfirmed}
        loading={loading}
        warning={balanceWarnings?.messages}
        confirmWallets={setWalletsConfirmed.bind(null, true)}
        confirmSwap={confirmSwap}
      />
      <Container>
        {error && (
          <Alert type="error" title={getConfirmSwapErrorMessage(error)} />
        )}
        {dbErrorMessage && <Alert type="error" title={dbErrorMessage} />}
        {routeWarning && (
          <Alert type="error" title={getRouteWarningMessage(routeWarning)} />
        )}

        <div className="title">
          <Typography variant="title" size="small">
            You get
          </Typography>
          <Button variant="ghost">
            <div className="icon">
              <RefreshIcon size={16} />
            </div>
          </Button>
        </div>
        {bestRoute && (
          <BestRoute
            steps={formatBestRoute(bestRoute) ?? []}
            input={{
              value: numberToString(inputAmount, 6, 6),
              usdValue: numberToString(inputUsdValue, 6, 6),
            }}
            output={{
              value: numberToString(outputAmount, 6, 6),
              usdValue: numberToString(outputUsdValue, 6, 6),
            }}
            totalFee={numberToString(totalFeeInUsd, 0, 2)}
            totalTime={secondsToString(totalArrivalTime(bestRoute))}
            recommended={true}
            type="swap-preview"
            percentageChange={percentageChange}
            warningLevel={warningLevel}
          />
        )}
        <div className="buttons">
          <div className="confirm-button">
            <Button
              variant="contained"
              type="primary"
              size="large"
              fullWidth
              onClick={onClick}>
              Start Swap
            </Button>
          </div>
          <IconButton
            variant="contained"
            type="primary"
            size="large"
            style={{ width: '48px', height: '48px' }}
            onClick={setShowWallets.bind(null, true)}>
            <WalletIcon size={24} />
          </IconButton>
        </div>
      </Container>
    </Layout>
  );
}
