import type { PriceImpactWarningLevel, Step } from '@rango-dev/ui';

import { i18n } from '@lingui/core';
import { TokenAmount } from '@rango-dev/ui';
import React from 'react';

import { Container } from './QuoteSummary.styles';

type PropTypes = {
  from: Step['from'];
  to: Step['to'];
  percentageChange?: string | null;
  warningLevel: PriceImpactWarningLevel;
};

export function QuoteSummary(props: PropTypes) {
  const { from, to, percentageChange, warningLevel } = props;
  return (
    <Container>
      <TokenAmount
        direction="horizontal"
        label={i18n.t('Swap input')}
        type="input"
        price={{ value: from.price.value, usdValue: from.price.usdValue }}
        token={{
          displayName: from.token.displayName,
          image: from.token.image,
        }}
        chain={{ image: from.chain.image }}
      />
      <div className="separator" />
      <TokenAmount
        direction="horizontal"
        label={i18n.t('Estimated output')}
        type="output"
        price={{ value: to.price.value, usdValue: to.price.usdValue }}
        token={{
          displayName: to.token.displayName,
          image: to.token.image,
        }}
        chain={{ image: to.chain.image }}
        percentageChange={percentageChange}
        warningLevel={warningLevel}
      />
    </Container>
  );
}
