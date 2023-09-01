import type { PropTypes } from './ConfirmWalletsModal.types';

import * as Collapsible from '@radix-ui/react-collapsible';
import {
  Alert,
  Button,
  ChevronDownIcon,
  ChevronLeftIcon,
  Divider,
  IconButton,
  Modal,
  styled,
  TextField,
  Typography,
  WalletIcon,
} from '@rango-dev/ui';
import React, { useState } from 'react';

import { useBestRouteStore } from '../../store/bestRoute';
import { useMetaStore } from '../../store/meta';
import { useWalletsStore } from '../../store/wallets';
import { confirmSwapDisabled } from '../../utils/swap';
import { getRequiredChains } from '../../utils/wallets';

import { getRequiredWallets, isValidAddress } from './ConfirmWallets.helpers';
import { CollapsibleContent } from './ConfirmWallets.styles';
import { WalletList } from './WalletList';

const NUMBER_OF_WALLETS_TO_DISPLAY = 2;

const Title = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const ListContainer = styled('div', {
  display: 'grid',
  gap: '$10',
  gridTemplateColumns: ' repeat(3, minmax(0, 1fr))',
  alignContent: 'baseline',
  paddingRight: '$8',
  // height: 490,
});

export const WalletButton = styled('button', {
  borderRadius: '$xm',
  padding: '$10',
  border: '0',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '$neutral200',
  alignItems: 'center',
  cursor: 'pointer',
  width: 110,
  position: 'relative',
  '&:hover': {
    backgroundColor: '$surface600',
    opacity: '0.8',
  },
  variants: {
    selected: {
      true: {
        outlineWidth: 1,
        outlineColor: '$secondary',
        outlineStyle: 'solid',
      },
    },
  },
});
const Trigger = styled(Collapsible.Trigger, {
  border: 'none',
  outline: 'none',
  width: '100%',
  backgroundColor: 'transparent',
});

const ShowMoreHeader = styled('div', {
  padding: '$20',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '$neutral200',
  position: 'relative',
  width: '100%',
});

const NavigateBack = styled(IconButton, { position: 'absolute', left: '$20' });

const WalletsContainer = styled('div', {
  padding: '$4 $20 $20 $20',
  '& .wallets-list': {
    display: 'grid',
    gap: '$10',
    gridTemplateColumns: ' repeat(3, minmax(0, 1fr))',
    alignContent: 'baseline',
    paddingRight: '$8',
  },
});

const CollapsibleRoot = styled(Collapsible.Root, {
  backgroundColor: '$neutral200',
  borderRadius: '$sm',
});

const CustomDestinationButton = styled(Button, {
  width: '100%',
  borderRadius: '$10',
  padding: '$15 !important',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '$neutral200 !important',
});

const CustomDestination = styled('div', {
  padding: '$10 $0',
  '& .button__content': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .alarms': { paddingTop: '5px' },
});

const ExpandedIcon = styled('div', {
  transition: 'all 300ms ease',
  variants: {
    orientation: {
      down: {
        transform: 'rotate(0)',
      },
      up: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

const ConfirmButton = styled('div', {
  width: 'calc(100% - 40px)',
  position: 'absolute',
  bottom: '$20',
  display: 'flex',
  filter: 'drop-shadow(white 0 -10px 10px)',
});

const StyledTextField = styled(TextField, {
  padding: '$0 $15 $15 $15',
});

export function ConfirmWalletsModal(props: PropTypes) {
  const {
    open,
    onClose,
    customDestinationEnabled = true,
    multiWallets,
    supportedWallets,
    config,
    confirmWallets,
    walletsConfirmed,
    confirmSwap,
    loading,
    warning,
  } = props;
  const { blockchains } = useMetaStore.use.meta();
  const bestRoute = useBestRouteStore.use.bestRoute();
  const connectedWallets = useWalletsStore.use.connectedWallets();
  const customDestination = useWalletsStore.use.customDestination();
  const selectWallets = useWalletsStore.use.selectWallets();
  const setCustomDestination = useWalletsStore.use.setCustomDestination();
  const [showMoreWalletFor, setShowMoreWalletFor] = useState('');
  const requiredWallets = getRequiredWallets(bestRoute);
  const [destination, setDestination] = useState(customDestination);
  const [showCustomDestination, setShowCustomDestination] = useState(false);

  const initSelectedWallets = () => {
    const requiredChains = getRequiredChains(bestRoute);
    const selectedWallets: string[] = [];
    requiredChains.forEach((chain) => {
      const anyWalletSelected = !connectedWallets.find(
        (connectedWallet) =>
          connectedWallet.chain === chain && connectedWallet.selected
      );

      if (!anyWalletSelected) {
        const firstWalletWithMatchedChain = connectedWallets.find(
          (wallet) => wallet.chain === chain
        );
        if (firstWalletWithMatchedChain) {
          selectedWallets.push(firstWalletWithMatchedChain.walletType);
        }
      }
    });
    return connectedWallets.map((connectedWallet) => {
      if (
        selectedWallets.includes(connectedWallet.walletType) &&
        !connectedWallet.selected
      ) {
        return { ...connectedWallet, selected: true };
      }
      return connectedWallet;
    });
  };

  const [selectableWallets, setSelectableWallets] = useState(
    initSelectedWallets().map((item) => ({
      walletType: item.walletType,
      chain: item.chain,
    }))
  );

  const lastStepToBlockchain =
    bestRoute?.result?.swaps[bestRoute?.result?.swaps.length - 1].to.blockchain;
  const isWalletRequired = !!bestRoute?.result?.swaps.find(
    (swap) => swap.from.blockchain === lastStepToBlockchain
  );

  const lastStepToBlockchainMeta = blockchains.find(
    (chain) => chain.name === lastStepToBlockchain
  );

  const isSelected = (walletType: string, chain: string) =>
    !!selectableWallets.find(
      (selectableWallet) =>
        selectableWallet.walletType === walletType &&
        selectableWallet.chain === chain
    );
  const onChange = (walletType: string, chain: string) => {
    return setSelectableWallets((wallets) =>
      wallets
        .filter((selectableWallet) => selectableWallet.chain !== chain)
        .concat({ walletType, chain })
    );
  };

  const onConfirm = async () => {
    const selectedWallets = connectedWallets.filter((connectedWallet) =>
      selectableWallets.find(
        (selectableWallet) =>
          selectableWallet.chain === connectedWallet.chain &&
          selectableWallet.walletType === connectedWallet.walletType
      )
    );
    await confirmSwap?.({ selectedWallets, customDestination: destination });
    if (!warning?.length) {
      selectWallets(selectableWallets);
      setCustomDestination(destination);
      confirmWallets();
      onClose();
    } else if (warning?.length && !walletsConfirmed) {
      confirmWallets();
    } else if (warning?.length && walletsConfirmed) {
      selectWallets(selectableWallets);
      setCustomDestination(destination);
      onClose();
    }
  };

  const modalContainer = document.querySelector('#swap-box') as HTMLDivElement;
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!showMoreWalletFor}
      container={modalContainer}
      {...(showMoreWalletFor && {
        containerStyle: { padding: '$0' },
        prefix: (
          <ShowMoreHeader>
            <NavigateBack
              variant="ghost"
              onClick={setShowMoreWalletFor.bind(null, '')}>
              <ChevronLeftIcon size={16} />
            </NavigateBack>
            <Typography
              variant="headline"
              size="small">{`Your ${showMoreWalletFor} wallets`}</Typography>
          </ShowMoreHeader>
        ),
      })}
      anchor="center">
      {showMoreWalletFor && (
        <WalletsContainer>
          <div className="wallets-list">
            <WalletList
              chain={showMoreWalletFor}
              isSelected={isSelected}
              selectWallet={onChange}
              multiWallets={multiWallets}
              supportedWallets={supportedWallets}
              config={config}
              onShowMore={setShowMoreWalletFor.bind(null, showMoreWalletFor)}
            />
          </div>
        </WalletsContainer>
      )}
      {!showMoreWalletFor && (
        <>
          {requiredWallets.map((requiredWallet, index) => {
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
                <Divider size={24} />
                <ListContainer>
                  <WalletList
                    chain={requiredWallet}
                    isSelected={isSelected}
                    selectWallet={onChange}
                    multiWallets={multiWallets}
                    supportedWallets={supportedWallets}
                    config={config}
                    limit={NUMBER_OF_WALLETS_TO_DISPLAY}
                    onShowMore={setShowMoreWalletFor.bind(null, requiredWallet)}
                  />
                </ListContainer>
                {index !== requiredWallets.length - 1 && <Divider size={32} />}
                {index === requiredWallets.length - 1 &&
                  customDestinationEnabled && (
                    <>
                      <CustomDestination>
                        <CollapsibleRoot
                          open={showCustomDestination}
                          onOpenChange={(checked) => {
                            if (!checked) {
                              setDestination('');
                              setSelectableWallets((selectableWallets) => {
                                let found = false;
                                return selectableWallets.map(
                                  (selectableWallet) => {
                                    if (
                                      !found &&
                                      selectableWallet.chain ===
                                        lastStepToBlockchain
                                    ) {
                                      found = true;
                                      return {
                                        ...selectableWallet,
                                        selected: true,
                                      };
                                    }
                                    return selectableWallet;
                                  }
                                );
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
                          <Trigger
                            onClick={setShowCustomDestination.bind(
                              null,
                              (prevState) => !prevState
                            )}>
                            <CustomDestinationButton
                              fullWidth
                              suffix={
                                <ExpandedIcon
                                  orientation={
                                    showCustomDestination ? 'up' : 'down'
                                  }>
                                  <ChevronDownIcon size={10} color="gray" />
                                </ExpandedIcon>
                              }>
                              <div className="button__content">
                                <WalletIcon size={18} color="info" />
                                <Divider size={4} direction="horizontal" />
                                <Typography variant="label" size="medium">
                                  Send to a Different address
                                </Typography>
                              </div>
                            </CustomDestinationButton>
                          </Trigger>
                          <CollapsibleContent open={showCustomDestination}>
                            <>
                              <Divider size={4} />
                              <StyledTextField
                                placeholder="Your destination address"
                                value={destination}
                                onChange={(e) => {
                                  setDestination(e.target.value);
                                }}
                              />
                            </>
                          </CollapsibleContent>
                        </CollapsibleRoot>
                        {!!destination &&
                          showCustomDestination &&
                          lastStepToBlockchainMeta &&
                          !isValidAddress(
                            lastStepToBlockchainMeta,
                            destination
                          ) && (
                            <div className="alarms">
                              <Alert
                                variant="alarm"
                                type="error"
                                title={`Address ${destination} doesn't match the blockchain address`}
                              />
                            </div>
                          )}
                      </CustomDestination>
                    </>
                  )}
              </div>
            );
          })}
          <ConfirmButton>
            <Button
              loading={loading}
              disabled={confirmSwapDisabled(
                loading,
                showCustomDestination,
                destination,
                lastStepToBlockchain ?? '',
                bestRoute,
                selectableWallets
              )}
              onClick={onConfirm}
              variant="contained"
              type="primary"
              fullWidth
              size="large">
              {warning?.length ? 'Proceed Anyway!' : 'Confirm'}
            </Button>
          </ConfirmButton>
        </>
      )}
    </Modal>
  );
}
