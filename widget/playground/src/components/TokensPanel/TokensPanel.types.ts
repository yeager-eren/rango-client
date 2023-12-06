import type { Tokens } from '@rango-dev/ui';
import type { Token } from 'rango-sdk';

export type TokenType = Token & { checked?: boolean };
export interface PropTypes {
  list: TokenType[];
  selectedBlockchains: string[];
  onChange: (items?: { [blockchain: string]: Tokens }) => void;
  configTokens?: { [blockchain: string]: Tokens };
}

export interface TokensListProps {
  onChange: (item: TokenType) => void;
  onChangeAll: (selected: boolean) => void;
  showSelectedTokens: boolean;
  setShowSelectedTokens: (show: boolean) => void;
  list: TokenType[];
  isAllSelected: boolean;
}

export interface BlockchainProps {
  onClick: () => void;
  label: string;
  itemCountLabel: 'All' | number;
  isSelected: boolean;
}
