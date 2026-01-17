
import { useMemo } from 'react';

export const useActionButtonState = (count: number, t: any) => {
  return useMemo(() => {
    const isSelfReadingPhase = count >= 7;

    let actionButtonLabel = t.start;
    let ariaLabel = t.startMemorizing;
    let actionButtonColor = 'bg-teal-600 hover:bg-teal-700';

    if (isSelfReadingPhase) {
      actionButtonLabel = t.reListen;
      ariaLabel = t.reListenAyah;
      actionButtonColor = 'bg-sky-600 hover:bg-sky-700';
    } else if (count > 0) {
      actionButtonLabel = t.again;
      ariaLabel = t.listenAgain;
    }

    return { actionButtonLabel, ariaLabel, actionButtonColor, isSelfReadingPhase };
  }, [count, t]);
};
