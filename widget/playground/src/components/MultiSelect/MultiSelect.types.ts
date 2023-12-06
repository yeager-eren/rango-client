import type { Tokens } from '@rango-dev/ui';
import type { Token } from 'rango-sdk';

export interface CommonListProps {
  type: 'Blockchains' | 'Bridges' | 'DEXs' | 'Wallets';
  defaultSelectedItems: string[];
  list: MapSupportedList[];
  onChange: (items?: string[]) => void;
}

interface TokensListProps {
  type: 'Tokens';
  list: Token[];
  selectedBlockchains: string[];
  configTokens: { [blockchain: string]: Tokens };
  onChange: (items?: { [blockchain: string]: Tokens }) => void;
}
export type MuliSelectPropTypes = (TokensListProps | CommonListProps) & {
  value?: string[];
  label: string;
  icon: React.ReactNode;
};

export interface MultiSelectChipProps {
  label: string;
  variant?: 'contained' | 'outlined';
}

export type MapSupportedList = {
  title: string;
  logo: string;
  name: string;
  supportedNetworks?: string[];
};
