import { styled } from '@yeager-dev/ui';

export const MainContainer = styled('div', {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: '$widget',
  boxSizing: 'border-box',
  '& *, *::before, *::after': {
    boxSizing: 'inherit',
    listStyleType: 'none',
  },
  '& *:focus-visible': {
    outlineColor: '$info500',
    transition: 'none',
  },
});
