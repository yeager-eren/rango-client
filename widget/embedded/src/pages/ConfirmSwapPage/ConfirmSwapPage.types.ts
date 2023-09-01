import type { WidgetConfig } from '../../types';

export type PropTypes = {
  customDestinationEnabled?: boolean;
  supportedWallets: WidgetConfig['wallets'];
  multiWallets: boolean;
  config?: WidgetConfig;
};
