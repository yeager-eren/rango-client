import type { SignerFactory } from 'rango-types';

import { DefaultCosmosSigner } from '@yeager-dev/signer-cosmos';
import { getNetworkInstance, Networks } from '@yeager-dev/wallets-shared';
import { DefaultSignerFactory, TransactionType as TxType } from 'rango-types';

export default function getSigners(provider: any): SignerFactory {
  const cosmosProvider = getNetworkInstance(provider, Networks.COSMOS);
  const signers = new DefaultSignerFactory();
  signers.registerSigner(
    TxType.COSMOS,
    new DefaultCosmosSigner(cosmosProvider)
  );
  return signers;
}
