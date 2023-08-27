import type { Meta, StoryObj } from '@storybook/react';

import { SelectableWalletComponent } from './SelectableWallet';

const meta: Meta<typeof SelectableWalletComponent> = {
  component: SelectableWalletComponent,
};

export default meta;
type Story = StoryObj<typeof SelectableWalletComponent>;

export const Main: Story = {
  args: {
    title: 'Trust Wallet',
    description: '0x......',
    image: 'https://api.rango.exchange/blockchains/zksync.png',
    onClick: (type) => {
      console.log('Clicked on', type);
    },
    selected: true,
    type: 'wallet-connect-2',
  },
};
