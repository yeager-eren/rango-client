export type PropTypes = {
  open: boolean;
  onClose: () => void;
  /*
   * wallets: SelectableWallet[];
   * onSelectWallet: (wallet: SelectableWallet) => void;
   * requiredWallets: string[];
   * onChange: (w: SelectableWallet) => void;
   * isExperimentalChain?: (wallet: string) => boolean;
   * handleConnectChain?: (wallet: string) => void;
   * errors?: ReactNode[];
   * warnings?: ReactNode[];
   * extraMessages?: ReactNode;
   * customDestination?: string;
   * checkedDestination: boolean;
   * setDestinationChain: (chain: string) => void;
   * setCustomDestination: (customDestination: string) => void;
   */
  customDestinationEnabled?: boolean;
};
