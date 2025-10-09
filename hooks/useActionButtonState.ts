import { useMemo } from 'react';

export const useActionButtonState = (count: number) => {
  return useMemo(() => {
    const isSelfReadingPhase = count >= 7;

    let actionButtonLabel = 'ابدأ';
    let ariaLabel = 'ابدأ الحفظ';
    let actionButtonColor = 'bg-teal-600 hover:bg-teal-700';

    if (isSelfReadingPhase) {
      actionButtonLabel = 'إعادة الاستماع';
      ariaLabel = 'إعادة الاستماع للآية';
      actionButtonColor = 'bg-sky-600 hover:bg-sky-700';
    } else if (count > 0) {
      actionButtonLabel = 'مرة كمان';
      ariaLabel = 'الاستماع مرة أخرى';
    }

    return { actionButtonLabel, ariaLabel, actionButtonColor, isSelfReadingPhase };
  }, [count]);
};