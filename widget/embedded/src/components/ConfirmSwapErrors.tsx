import type { ConfirmSwapError } from '../types';

import { ConfirmSwapErrorTypes } from '../types';

export function getConfirmSwapErrorMessage(error: ConfirmSwapError) {
  switch (error.type) {
    case ConfirmSwapErrorTypes.NO_ROUTE:
      return 'No routes found. Please try again later.';
    case ConfirmSwapErrorTypes.REQUEST_FAILED:
      return `Failed to confirm swap ${
        error.status ? `'status': ${error.status})` : ''
      }, please try again.`;
    case ConfirmSwapErrorTypes.ROUTE_UPDATED_WITH_HIGH_VALUE_LOSS:
      return 'Route updated and price impact is too high, try again later!';
    default:
      return '';
  }
}
