import {
  WalletTypes,
  CanSwitchNetwork,
  Connect,
  Subscribe,
  SwitchNetwork,
  canSwitchNetworkToEvm,
  getEvmAccounts,
  subscribeToEvm,
  switchNetworkForEvm,
  WalletInfo,
  EagerConnect,
  canConnectEagerlyToEvmProvider,
} from '@rango-dev/wallets-shared';
import { tokenpocket as tokenpocket_instance } from './helpers';
import signer from './signer';
import { SignerFactory, BlockchainMeta, evmBlockchains } from 'rango-types';

const WALLET = WalletTypes.TOKEN_POCKET;

export const config = {
  type: WALLET,
};

export const getInstance = tokenpocket_instance;
export const connect: Connect = async ({ instance }) => {
  // Note: We need to get `chainId` here, because for the first time
  // after opening the browser, wallet is locked, and don't give us accounts and chainId
  // on `check` phase, so `network` will be null. For this case we need to get chainId
  // whenever we are requesting accounts.
  const { accounts, chainId } = await getEvmAccounts(instance);

  return {
    accounts,
    chainId,
  };
};

export const subscribe: Subscribe = subscribeToEvm;

export const switchNetwork: SwitchNetwork = switchNetworkForEvm;

export const canSwitchNetworkTo: CanSwitchNetwork = canSwitchNetworkToEvm;

export const getSigners: (provider: any) => SignerFactory = signer;

export const eagerConnect: EagerConnect = async ({
  instance,
  meta,
  network,
}) => {
  try {
    const shouldTryEagerConnect = await canConnectEagerlyToEvmProvider({
      instance,
    });
    if (shouldTryEagerConnect) {
      return connect({ instance, meta, network });
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const getWalletInfo: (allBlockChains: BlockchainMeta[]) => WalletInfo = (
  allBlockChains
) => {
  const evms = evmBlockchains(allBlockChains);
  return {
    name: 'Token Pocket',
    img: 'https://raw.githubusercontent.com/rango-exchange/rango-types/main/assets/icons/wallets/tp.png',
    color: '#b2dbff',
    installLink: {
      CHROME:
        'https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii',
      BRAVE:
        'https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii',
      DEFAULT: 'https://www.tokenpocket.pro/en/download/app',
    },
    supportedChains: evms,
  };
};
