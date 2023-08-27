import type { PropTypes } from './ConfirmSwapPage.types';
import type { BestRouteProps } from '@rango-dev/ui/dist/widget/ui/src/components/BestRoute/BestRoute.types';

import { i18n } from '@lingui/core';
import {
  BestRoute,
  Button,
  IconButton,
  RefreshIcon,
  SettingsIcon,
  styled,
  Tooltip,
  Typography,
  WalletIcon,
} from '@rango-dev/ui';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { HeaderButton } from '../../components/HeaderButtons/HeaderButtons.styles';
import { Layout } from '../../components/Layout';
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

export const route1: BestRouteProps = {
  type: 'list-item',
  recommended: true,
  input: { value: '1', usdValue: '30000' },
  output: { value: '3161.441024', usdValue: '26.890' },
  steps: [
    {
      swapper: {
        displayName: 'MayaProtocol',
        image: 'https://api.rango.exchange/swappers/maya.jpg',
      },
      from: {
        token: {
          displayName: 'BTC',
          image: 'https://api.rango.exchange/tokens/BTC/BTC.png',
        },
        chain: {
          displayName: 'BTC',
          image: 'https://api.rango.exchange/tokens/BTC/BTC.png',
        },
        price: {
          value: '1.00000000',
        },
      },
      to: {
        chain: {
          displayName: 'ETH',
          image: 'https://api.rango.exchange/blockchains/ethereum.svg',
        },
        token: {
          displayName: 'ETH',

          image: 'https://api.rango.exchange/tokens/ETH/ETH.png',
        },
        price: {
          value: '14.863736725876758517',
        },
      },
    },
    {
      swapper: {
        displayName: 'Satellite',
        image: 'https://api.rango.exchange/swappers/satellite.png',
      },
      from: {
        token: {
          displayName: 'ETH',
          image: 'https://api.rango.exchange/tokens/ETH/ETH.png',
        },
        chain: {
          displayName: 'ETH',
          image: 'https://api.rango.exchange/blockchains/ethereum.svg',
        },
        price: { value: '14.863736725876758517' },
      },
      to: {
        token: {
          displayName: 'ETH',
          image: 'https://api.rango.exchange/tokens/COSMOS/ETH.png',
        },
        chain: {
          displayName: 'OSMOSIS',
          image: 'https://api.rango.exchange/blockchains/osmosis.svg',
        },
        price: {
          value: '14.825674725876758517',
        },
      },
    },
    {
      swapper: {
        displayName: 'Osmosis',
        image: 'https://api.rango.exchange/swappers/osmosis.png',
      },
      from: {
        token: {
          displayName: 'ETH',
          image: 'https://api.rango.exchange/tokens/COSMOS/ETH.png',
        },
        chain: {
          displayName: 'OSMOSIS',
          image: 'https://api.rango.exchange/blockchains/osmosis.svg',
        },
        price: {
          value: '14.825674725876758517',
        },
      },
      to: {
        token: {
          displayName: 'ATOM',
          image: 'https://api.rango.exchange/tokens/COSMOS/ATOM.png',
        },
        chain: {
          displayName: 'OSMOSIS',
          image: 'https://api.rango.exchange/blockchains/osmosis.svg',
        },
        price: {
          value: '3161.441024',
        },
      },
    },
    {
      swapper: {
        displayName: 'IBC',
        image: 'https://api.rango.exchange/swappers/IBC.png',
      },
      from: {
        token: {
          displayName: 'ATOM',
          image: 'https://api.rango.exchange/tokens/COSMOS/ATOM.png',
        },
        chain: {
          displayName: 'OSMOSIS',
          image: 'https://api.rango.exchange/blockchains/osmosis.svg',
        },
        price: {
          value: '3161.441024',
        },
      },
      to: {
        token: {
          displayName: 'ATOM',
          image: 'https://api.rango.exchange/tokens/COSMOS/ATOM.png',
        },
        chain: {
          displayName: 'COSMOS',
          image: 'https://api.rango.exchange/blockchains/cosmos.svg',
        },
        price: {
          value: '3161.441024',
        },
      },
    },
  ],

  percentageChange: '7.51',
  warningLevel: 'high',
  totalFee: '9.90',
  totalTime: '23:00',
};

export function ConfirmSwapPage(props: PropTypes) {
  const { customDestinationEnabled } = props;
  const navigate = useNavigate();
  const [showWallets, setShowWallets] = useState(false);

  /*
   * useEffect(() => {
   *   setShowWallets(true);
   * }, []);
   */

  return (
    <Layout
      header={{
        title: 'Confirm Swap',
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
      <ConfirmWalletsModal
        open={showWallets}
        onClose={setShowWallets.bind(null, false)}
        customDestinationEnabled={customDestinationEnabled}
      />
      <Container>
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
        <BestRoute {...route1} />
        <div className="buttons">
          <div className="confirm-button">
            <Button variant="contained" type="primary" size="large" fullWidth>
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
