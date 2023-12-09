import type { WalletStateContentProps } from './SwapDetailsModal.types';

import { MessageBox, Wallet } from '@rango-dev/ui';
import { useWallets } from '@rango-dev/wallets-react';
import React from 'react';

import { getContainer } from '../../utils/common';
import { mapStatusToWalletState } from '../../utils/wallets';

import { WalletContainer } from './SwapDetailsModal.styles';

export const WalletStateContent = (props: WalletStateContentProps) => {
  const { type, title, currentStepWallet, message, showWalletButton } = props;
  const { connect, getWalletInfo, state } = useWallets();
  const walletType = currentStepWallet?.walletType;
  const walletState = !!walletType && mapStatusToWalletState(state(walletType));
  const walletInfo = !!walletType && getWalletInfo(walletType);
  const shouldShowWallet = showWalletButton && walletState && walletInfo;
  return (
    <>
      <MessageBox type={type} title={title} description={message} />
      {shouldShowWallet && (
        <WalletContainer>
          <Wallet
            container={getContainer()}
            title={walletInfo.name}
            image={walletInfo.img}
            type={walletType}
            state={walletState}
            link={walletInfo.installLink}
            onClick={async () => connect(walletType)}
          />
        </WalletContainer>
      )}
    </>
  );
};
