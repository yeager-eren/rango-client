import type { WidgetConfig } from '../types';

import { i18n } from '@lingui/core';
import {
  Alert,
  Divider,
  LoadingFailedAlert,
  Spinner,
  styled,
  Typography,
  Wallet,
} from '@rango-dev/ui';
import React from 'react';

import { Layout } from '../components/Layout';
import { navigationRoutes } from '../constants/navigationRoutes';
import { useNavigateBack } from '../hooks/useNavigateBack';
import { useWalletList } from '../hooks/useWalletList';
import { useMetaStore } from '../store/meta';

interface PropTypes {
  supportedWallets: WidgetConfig['wallets'];
  multiWallets: boolean;
  config?: WidgetConfig;
}

const ListContainer = styled('div', {
  display: 'grid',
  gap: '$10',
  gridTemplateColumns: ' repeat(3, minmax(0, 1fr))',
  alignContent: 'baseline',
  padding: '$15 $8 $20 0',
  overflowY: 'auto',
  height: 490,
});

const LoaderContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  position: 'absolute',
  top: '50%',
});

const Container = styled('div', {
  textAlign: 'center',
});

export function WalletsPage({
  supportedWallets,
  multiWallets,
  config,
}: PropTypes) {
  const loadingMetaStatus = useMetaStore.use.loadingStatus();
  const { navigateBackFrom } = useNavigateBack();
  const { wallets, onClickWallet, error } = useWalletList({
    supportedWallets,
    multiWallets,
    config,
  });

  return (
    <Layout
      header={{
        title: i18n.t('Connect Wallets'),
        onBack: navigateBackFrom.bind(null, navigationRoutes.wallets),
      }}>
      <Container>
        {error && (
          <>
            <Alert type="error" title={error} />
            <Divider direction="vertical" size={16} />
          </>
        )}
        {loadingMetaStatus === 'loading' && (
          <LoaderContainer className="loader">
            <Spinner size={24} />
          </LoaderContainer>
        )}
        {loadingMetaStatus === 'failed' && <LoadingFailedAlert />}
        <Typography variant="title" size="xmedium" align="center">
          Choose a wallet to connect.
        </Typography>
        <ListContainer>
          {loadingMetaStatus === 'success' &&
            wallets.map((wallet, index) => {
              const key = `wallet-${index}-${wallet.type}`;
              return (
                <Wallet
                  {...wallet}
                  key={key}
                  onClick={(type) => {
                    void onClickWallet(type);
                  }}
                />
              );
            })}
        </ListContainer>
      </Container>
    </Layout>
  );
}
