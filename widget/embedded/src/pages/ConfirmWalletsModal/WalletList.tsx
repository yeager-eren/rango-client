/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Alert,
  SelectableWallet,
  Typography,
  WalletState,
} from '@rango-dev/ui';
import { KEPLR_COMPATIBLE_WALLETS } from '@rango-dev/wallets-shared';
import React from 'react';

import { useWallets, type WidgetConfig } from '../..';
import { useWalletList } from '../../hooks/useWalletList';
import { useMetaStore } from '../../store/meta';
import { useWalletsStore } from '../../store/wallets';
import {
  getAddress,
  getConciseAddress,
  isExperimentalChain,
} from '../../utils/wallets';

import { WalletButton } from './ConfirmWalletsModal';

type PropTypes = {
  chain: string;
  supportedWallets: WidgetConfig['wallets'];
  isSelected: (walletType: string, chain: string) => boolean;
  selectWallet: (walletType: string, chain: string) => void;
  multiWallets: boolean;
  config?: WidgetConfig;
  limit?: number;
  onShowMore: () => void;
};

export function WalletList(props: PropTypes) {
  const {
    supportedWallets,
    multiWallets,
    config,
    chain,
    isSelected,
    selectWallet,
    limit,
    onShowMore,
  } = props;
  const connectedWallets = useWalletsStore.use.connectedWallets();
  const { blockchains } = useMetaStore.use.meta();
  const { connect } = useWallets();
  const { wallets, error, onClickWallet } = useWalletList({
    supportedWallets,
    multiWallets,
    config,
    chain,
  });
  const numberOfSupportedWallets = wallets.length;
  const shouldShowMoreWallets = limit && numberOfSupportedWallets - limit > 0;

  return (
    <>
      {wallets.slice(0, limit).map((wallet) => {
        const address = getAddress({
          connectedWallets,
          walletType: wallet.type,
          chain,
        });
        const conciseAddress = address ? getConciseAddress(address) : '';

        const experimentalChain =
          KEPLR_COMPATIBLE_WALLETS.includes(wallet.type) &&
          isExperimentalChain(blockchains, chain);

        const experimentalChainNotAdded =
          wallet.state === WalletState.CONNECTED &&
          !connectedWallets.find(
            (connectedWallet) =>
              connectedWallet.walletType === wallet.type &&
              connectedWallet.chain === chain
          );

        const couldAddExperimentalChain =
          experimentalChain && experimentalChainNotAdded;

        const connectedWalletDescription = couldAddExperimentalChain
          ? `Add ${chain} chain`
          : conciseAddress;

        const onClick = async () => {
          if (wallet.state === WalletState.DISCONNECTED) {
            await onClickWallet(wallet.type);
            selectWallet(wallet.type, chain);
          } else if (couldAddExperimentalChain) {
            await connect(wallet.type, chain);
            selectWallet(wallet.type, chain);
          } else {
            selectWallet(wallet.type, chain);
          }
        };

        return (
          <>
            {error && <Alert type="error" title={error} />}
            <SelectableWallet
              key={wallet.type}
              description={connectedWalletDescription}
              onClick={onClick}
              selected={isSelected(wallet.type, chain)}
              {...wallet}
            />
          </>
        );
      })}
      {shouldShowMoreWallets && (
        <WalletButton selected={false} onClick={onShowMore.bind(null)}>
          <Typography variant="label" size="medium">
            Show more wallet
            <Typography variant="label" size="medium" color="$primary">
              &nbsp;+{numberOfSupportedWallets - (limit ?? 0)}
            </Typography>
          </Typography>
        </WalletButton>
      )}
    </>
  );
}
