import type { PropTypes } from './ConfirmWalletsModal.types';
import type { WalletType } from '@rango-dev/wallets-shared';

import * as Collapsible from '@radix-ui/react-collapsible';
import { allProviders } from '@rango-dev/provider-all';
import {
  Alert,
  Button,
  ChevronDownIcon,
  Modal,
  SelectableWalletComponent,
  styled,
  TextField,
  Typography,
  WalletIcon,
} from '@rango-dev/ui';
import { useWallets } from '@rango-dev/wallets-core';
import { getCosmosExperimentalChainInfo } from '@rango-dev/wallets-shared';
import { type BlockchainMeta, isCosmosBlockchain } from 'rango-sdk';
import React, { useState } from 'react';

import { useBestRouteStore } from '../../store/bestRoute';
import { useMetaStore } from '../../store/meta';
import { useWalletsStore } from '../../store/wallets';
import { confirmSwapDisabled } from '../../utils/swap';
import {
  getKeplrCompatibleConnectedWallets,
  getSelectableWallets,
} from '../../utils/wallets';

import { getRequiredWallets, isValidAddress } from './ConfirmWallets.helpers';
import { CollapsibleContent } from './ConfirmWallets.styles';

const Title = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const isExperimentalChain = (
  blockchains: BlockchainMeta[],
  wallet: string
): boolean => {
  const cosmosExperimentalChainInfo = getCosmosExperimentalChainInfo(
    Object.entries(blockchains)
      .map(([, blockchainMeta]) => blockchainMeta)
      .filter(isCosmosBlockchain)
  );
  return cosmosExperimentalChainInfo && !!cosmosExperimentalChainInfo[wallet];
};

export function ConfirmWalletsModal(props: PropTypes) {
  const { open, onClose, customDestinationEnabled } = props;
  const bestRoute = useBestRouteStore.use.bestRoute();
  const connectedWallets = useWalletsStore.use.connectedWallets();
  const customDestination = useWalletsStore.use.customDestination();
  // const setCustomDestination = useWalletsStore.use.setCustomDestination();
  const requiredWallets = getRequiredWallets(bestRoute);

  const [destination, setDestination] = useState(customDestination);

  const [showCustomDestination, setShowCustomDestination] = useState(false);
  const { getWalletInfo, connect } = useWallets();

  const lastStepToBlockchain =
    bestRoute?.result?.swaps[bestRoute?.result?.swaps.length - 1].to.blockchain;
  const isWalletRequired = !!bestRoute?.result?.swaps.find(
    (swap) => swap.from.blockchain === lastStepToBlockchain
  );

  const { blockchains } = useMetaStore.use.meta();

  const handleConnectChain = (wallet: string) => {
    const network = wallet;
    getKeplrCompatibleConnectedWallets(selectableWallets).forEach(
      async (compatibleWallet: WalletType) =>
        connect?.(compatibleWallet, network)
    );
  };

  const isExperimental = (wallet: string): boolean =>
    getKeplrCompatibleConnectedWallets(selectableWallets).length > 0
      ? isExperimentalChain(blockchains, wallet)
      : false;

  const [selectableWallets, setSelectableWallets] = useState(
    getSelectableWallets(
      connectedWallets,
      getWalletInfo,
      isWalletRequired ? '' : lastStepToBlockchain
    )
  );

  const onChange = (walletType: string, chain: string) =>
    setSelectableWallets((wallets) =>
      wallets.map((wallet) => {
        if (wallet.walletType === walletType && wallet.chain === chain) {
          return { ...wallet, selected: !wallet.selected };
        }
        return wallet;
      })
    );
  const container = document.querySelector('#swap-box') as HTMLDivElement;
  console.log({ container });
  console.log({ providers: allProviders()[0].getWalletInfo(blockchains) });
  const supportedWallets = (chain: string) =>
    allProviders().filter(
      (wallet) =>
        !!wallet
          .getWalletInfo(blockchains)
          .supportedChains.find(
            (supportedChain) => supportedChain.name === chain
          )
    );

  return (
    <Modal open={open} onClose={onClose} container={container} anchor="center">
      {requiredWallets.map((requiredWallet, index) => {
        const filteredWallets = supportedWallets(requiredWallet);

        const chainName = requiredWallet.toLowerCase();
        const key = `wallet-${index}`;
        return (
          <div key={key}>
            <Title>
              <Typography
                variant="title"
                size="xmedium">{`Your ${chainName} wallets`}</Typography>
              <Typography
                variant="label"
                color="$neutral500"
                size="medium">{`You need to connect a ${chainName} wallet.`}</Typography>
            </Title>
            {(isWalletRequired ||
              (!isWalletRequired && !showCustomDestination)) && (
              <>
                {/* <div>
                    <Alert type="error">
                      You need to connect a compatible wallet with
                      {requiredWallet}.
                    </Alert>
                  </div> */}
                {isExperimental?.(requiredWallet) && (
                  <Button
                    variant="contained"
                    type="primary"
                    onClick={() => handleConnectChain?.(requiredWallet)}>
                    {`Add ${requiredWallet} chain to Cosmos wallets`}
                  </Button>
                )}
              </>
            )}
            {filteredWallets.map((wallet) => {
              return (
                <>
                  <SelectableWalletComponent
                    key={wallet.walletType}
                    title={wallet.name}
                    description={wallet.address}
                    image={wallet.image}
                    onClick={onChange.bind(
                      null,
                      wallet.walletType,
                      wallet.chain
                    )}
                    selected={wallet.selected}
                    type={wallet.walletType}
                  />
                  <div>
                    <Collapsible.Root
                      open={showCustomDestination}
                      onOpenChange={setShowCustomDestination}>
                      <Collapsible.Trigger>
                        <Button
                          variant="ghost"
                          prefix={<WalletIcon size={18} color="info" />}
                          suffix={<ChevronDownIcon size={10} color="gray" />}>
                          Send to a Different address
                        </Button>
                      </Collapsible.Trigger>
                      <CollapsibleContent>
                        <TextField
                          variant="ghost"
                          placeholder={`Enter ${wallet.chain} address`}
                          value={customDestination}
                          disabled={!customDestinationEnabled}
                        />
                      </CollapsibleContent>
                    </Collapsible.Root>
                  </div>
                </>
              );
            })}
            {index === requiredWallets.length - 1 &&
              customDestinationEnabled && (
                <>
                  <div>
                    <Collapsible.Root
                      open={showCustomDestination}
                      onOpenChange={(checked) => {
                        if (!checked) {
                          setDestination('');
                          setSelectableWallets((selectableWallets) => {
                            let found = false;
                            return selectableWallets.map((selectableWallet) => {
                              if (
                                !found &&
                                selectableWallet.chain === lastStepToBlockchain
                              ) {
                                found = true;
                                return {
                                  ...selectableWallet,
                                  selected: true,
                                };
                              }
                              return selectableWallet;
                            });
                          });
                        } else {
                          if (!isWalletRequired) {
                            setSelectableWallets((selectableWallets) =>
                              selectableWallets.map((selectableWallet) => {
                                if (
                                  selectableWallet.chain ===
                                  lastStepToBlockchain
                                ) {
                                  return {
                                    ...selectableWallet,
                                    selected: false,
                                  };
                                }
                                return selectableWallet;
                              })
                            );
                          }
                        }
                      }}>
                      <Collapsible.Trigger>
                        <Button
                          variant="ghost"
                          prefix={<WalletIcon size={18} color="info" />}
                          suffix={<ChevronDownIcon size={10} color="gray" />}>
                          Send to a Different address
                        </Button>
                      </Collapsible.Trigger>
                      <CollapsibleContent>
                        <>
                          <TextField
                            placeholder="Your destination address"
                            value={destination}
                            onChange={(e) => {
                              setDestination(e.target.value);
                            }}
                          />
                          {!!customDestination &&
                            !isValidAddress(
                              blockchains.find(
                                (chain) => chain.name === lastStepToBlockchain
                              )!,
                              customDestination
                            ) && (
                              <div>
                                <Alert type="error">
                                  Not a valid {requiredWallet} address.
                                </Alert>
                              </div>
                            )}
                        </>
                      </CollapsibleContent>
                    </Collapsible.Root>
                  </div>
                </>
              )}
          </div>
        );
      })}
      {/* {requiredWallets.map((requiredWallet) => {
          const chainName = requiredWallet.toLowerCase();
          const filteredWallets = wallets.filter(
            (wallet) => wallet.chain === requiredWallet
          );
          return (
            <div key={requiredWallet}>
              <Title>
                <Typography
                  variant="title"
                  size="xmedium">{`Your ${chainName} wallets`}</Typography>
                <Typography
                  variant="label"
                  size="medium">{`You need to connect a ${chainName} wallet.`}</Typography>
              </Title>
              {filteredWallets.map((wallet) => {
                return (
                  <>
                    <SelectableWallet
                      key={wallet.walletType}
                      title={wallet.name}
                      description={wallet.address}
                      image={wallet.image}
                      onClick={onSelectWallet.bind(null, wallet)}
                      selected={wallet.selected}
                      type={wallet.walletType}
                    />
                    <div>
                      <Collapsible.Root
                        open={showCustomDestination}
                        onOpenChange={setShowCustomDestination}>
                        <Collapsible.Trigger>
                          <Button
                            variant="ghost"
                            prefix={<WalletIcon size={18} color="info" />}
                            suffix={<ChevronDownIcon size={10} color="gray" />}>
                            Send to a Different address
                          </Button>
                        </Collapsible.Trigger>
                        <CollapsibleContent>
                          <TextField
                            variant="ghost"
                            placeholder={`Enter ${wallet.chain} address`}
                            value={customDestination}
                            disabled={!customDestinationEnabled}
                          />
                        </CollapsibleContent>
                      </Collapsible.Root>
                    </div>
                  </>
                );
              })}
            </div>
          );
        })} */}
      <Button
        disabled={confirmSwapDisabled(
          false,
          lastStepToBlockchain!,
          customDestination,
          bestRoute,
          selectableWallets
        )}
        onClick={onClose}
        variant="contained"
        type="primary">
        Confirm
      </Button>
    </Modal>
  );
}
