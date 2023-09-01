export type PriceImpactWarningLevel = 'low' | 'high' | undefined;

export type PriceImpactProps = {
  size: 'small' | 'large';
  outputUsdValue?: string;
  percentageChange?: string;
  warningLevel?: PriceImpactWarningLevel;
};
