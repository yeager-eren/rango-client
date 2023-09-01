import type { WidgetConfig } from '../types';
import type { WalletInfo } from '@rango-dev/ui';

import { WalletState } from '@rango-dev/ui';
import { useWallets } from '@rango-dev/wallets-core';
import { type WalletType, WalletTypes } from '@rango-dev/wallets-shared';
import { useEffect, useRef, useState } from 'react';

import { useUiStore } from '../store/ui';
import { configWalletsToWalletName } from '../utils/providers';
import { getlistWallet, sortWalletsBasedOnState } from '../utils/wallets';

const ALL_SUPPORTED_WALLETS = Object.values(WalletTypes);

interface Params {
  supportedWallets: WidgetConfig['wallets'];
  multiWallets: boolean;
  config?: WidgetConfig;
  chain?: string;
}
export function useWalletList(params: Params) {
  const { multiWallets, supportedWallets, config, chain } = params;
  const { state, disconnect, getWalletInfo, connect } = useWallets();
  const wallets = getlistWallet(
    state,
    getWalletInfo,
    configWalletsToWalletName(supportedWallets, {
      walletConnectProjectId: config?.walletConnectProjectId,
    }) || ALL_SUPPORTED_WALLETS,
    chain
  );
  const walletsRef = useRef<WalletInfo[]>();

  const sortedWallets = sortWalletsBasedOnState(wallets);
  const [error, setError] = useState('');
  const toggleConnectWalletsButton =
    useUiStore.use.toggleConnectWalletsButton();

  const onClickWallet = async (type: WalletType) => {
    const wallet = state(type);
    try {
      if (error) {
        setError('');
      }
      if (wallet.connected) {
        await disconnect(type);
      } else {
        if (
          !multiWallets &&
          !!wallets.find((w) => w.state === WalletState.CONNECTED)
        ) {
          return;
        }
        await connect(type);
      }
    } catch (e) {
      setError('Error: ' + (e as any)?.message);
    }
  };
  const disconnectConnectingWallets = () => {
    const connectingWallets =
      walletsRef.current?.filter(
        (wallet) => wallet.state === WalletState.CONNECTING
      ) || [];
    for (const wallet of connectingWallets) {
      void disconnect(wallet.type);
    }
  };
  useEffect(() => {
    toggleConnectWalletsButton();
    return () => {
      disconnectConnectingWallets();
      toggleConnectWalletsButton();
    };
  }, []);

  useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  return {
    wallets: sortedWallets,
    error,
    onClickWallet,
  };
}
