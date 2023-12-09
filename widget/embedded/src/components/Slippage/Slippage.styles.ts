import { styled } from '@rango-dev/ui';

export const BaseContainer = styled('div', {
  paddingTop: '$5',
  paddingBottom: '22px',
});

export const SlippageChipsContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  flexWrap: 'wrap',
});

export const Head = styled('div', {
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  paddingBottom: '$10',
});

export const SlippageTooltipContainer = styled('div', {
  maxWidth: '280px',
  padding: '$10',
});
