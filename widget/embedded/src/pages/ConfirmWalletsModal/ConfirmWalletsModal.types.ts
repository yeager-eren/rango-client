import type { WidgetConfig } from '../..';
import type { ConnectedWallet } from '../../store/wallets';
import type { PendingSwap } from '@rango-dev/queue-manager-rango-preset';

export type PropTypes = {
  open: boolean;
  onClose: () => void;
  supportedWallets: WidgetConfig['wallets'];
  multiWallets: boolean;
  config?: WidgetConfig;
  confirmSwap:
    | ((params: {
        selectedWallets: ConnectedWallet[];
        customDestination: string;
      }) => Promise<PendingSwap | undefined>)
    | null;
  confirmWallets: () => void;
  walletsConfirmed: boolean;
  loading: boolean;
  warning?: string[];
  customDestinationEnabled?: boolean;
};
