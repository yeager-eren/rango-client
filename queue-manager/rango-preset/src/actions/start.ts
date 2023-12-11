import type { SwapStorage } from '../types';
import type { ExecuterActions } from '@yeager-dev/queue-manager-core';

import { notifier } from '../services/eventEmitter';
import { StepEventType, SwapActionTypes } from '../types';

export function start({
  schedule,
  next,
  getStorage,
}: ExecuterActions<SwapStorage, SwapActionTypes>): void {
  const swap = getStorage().swapDetails;

  const n = { event: { type: StepEventType.STARTED }, swap, step: null };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  notifier(n);

  schedule(SwapActionTypes.SCHEDULE_NEXT_STEP);
  next();
}
