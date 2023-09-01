import type { RouteWarning } from '../types';

import { RouteWarningType } from '../types';

export function getRouteWarningMessage(warning: RouteWarning) {
  switch (warning.type) {
    case RouteWarningType.ROUTE_UPDATED:
      return 'Route has been updated.';
    case RouteWarningType.ROUTE_AND_OUTPUT_AMOUNT_UPDATED:
      return `Output amount changed to ${warning.newOutputAmount} (${warning.percentageChange}% change).`;
    case RouteWarningType.ROUTE_SWAPPERS_UPDATED:
      return 'Route swappers has been updated.';
    case RouteWarningType.ROUTE_COINS_UPDATED:
      return 'Route internal coins has been updated.';
    default:
      return '';
  }
}
