import {
  Networks,
  WalletTypes,
  canSwitchNetworkToEvm,
  chooseInstance,
  getEvmAccounts,
  switchNetworkForEvm,
  CanSwitchNetwork,
  Connect,
  ProviderConnectResult,
  Subscribe,
  SwitchNetwork,
  WalletInfo,
  getSolanaAccounts,
  EagerConnect,
  canConnectEagerlyToEvmProvider,
} from '@rango-dev/wallets-shared';
import { brave as brave_instances } from './helpers';
import signer from './signer';
import {
  SignerFactory,
  isEvmBlockchain,
  isSolanaBlockchain,
  BlockchainMeta,
  evmBlockchains,
  solanaBlockchain,
} from 'rango-types';

const WALLET = WalletTypes.BRAVE;

export const config = {
  type: WALLET,
  defaultNetwork: Networks.ETHEREUM,
};

export const getInstance = brave_instances;

export const connect: Connect = async ({ instance, meta }) => {
  const evm_instance = chooseInstance(instance, meta, Networks.ETHEREUM);
  const sol_instance = chooseInstance(instance, meta, Networks.SOLANA);
  const results: ProviderConnectResult[] = [];
  const emptyWalletErrorCode = -32603;
  const emptyWalletCustomErrorMessage = 'Please create or import a wallet';
  let numberOfEmptyWallets = 0;

  if (evm_instance) {
    try {
      const evmAccounts = await getEvmAccounts(evm_instance);
      results.push(evmAccounts);
    } catch (error) {
      // To resolve this error: Catch clause variable type annotation must be any or unknown if specified
      const err = error as { code: number };
      if (err.code === emptyWalletErrorCode) {
        numberOfEmptyWallets += 1;
      } else throw error;
    }
  }

  if (sol_instance) {
    try {
      const solanaAccounts = await getSolanaAccounts({
        instance: sol_instance,
        meta,
      });
      results.push(solanaAccounts as ProviderConnectResult);
    } catch (error) {
      // To resolve this error: Catch clause variable type annotation must be any or unknown if specified
      const err = error as { code: number };
      if (err.code === emptyWalletErrorCode) {
        numberOfEmptyWallets += 1;
      } else throw error;
    }
  }

  if (numberOfEmptyWallets === instance.size)
    throw new Error(emptyWalletCustomErrorMessage);

  return results;
};

export const subscribe: Subscribe = ({
  instance,
  updateAccounts,
  meta,
  state,
  updateChainId,
}) => {
  const evm_instance = chooseInstance(instance, meta, Networks.ETHEREUM);
  const sol_instance = chooseInstance(instance, meta, Networks.SOLANA);

  evm_instance?.on('accountsChanged', (addresses: string[]) => {
    const eth_chainId = meta
      .filter(isEvmBlockchain)
      .find((blockchain) => blockchain.name === Networks.ETHEREUM)?.chainId;
    if (state.connected) {
      if (state.network != Networks.ETHEREUM && eth_chainId)
        updateChainId(eth_chainId);
      updateAccounts(addresses);
    }
  });

  evm_instance?.on('chainChanged', (chainId: string) => {
    updateChainId(chainId);
  });

  sol_instance?.on('accountChanged', async () => {
    if (state.network != Networks.SOLANA)
      updateChainId(meta.filter(isSolanaBlockchain)[0].chainId);
    const response = await sol_instance.connect();
    const account: string = response.publicKey.toString();
    updateAccounts([account]);
  });
};

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
  const solana = solanaBlockchain(allBlockChains);
  return {
    name: 'Brave',
    img: 'https://raw.githubusercontent.com/rango-exchange/rango-types/main/assets/icons/wallets/brave.png',
    installLink: {
      DEFAULT: 'https://brave.com/wallet/',
    },
    color: '#ef342f',
    supportedChains: [...evms, ...solana],
  };
};
