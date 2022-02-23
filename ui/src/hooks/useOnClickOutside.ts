import { useCallback, useEffect } from 'react';

const useOnClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside?: (event: MouseEvent) => void,
) => {
  const onClick = useCallback(
    (event: MouseEvent) => {
      if (!onClickOutside) {
        return;
      }
      // This instanceof check is because not all event targets are elements,
      // but this will be true for all the cases we care about here.
      // https://stackoverflow.com/questions/28900077/why-is-event-target-not-element-in-typescript
      if (event.target && event.target instanceof Element) {
        if (ref.current && !ref.current.contains(event.target)) {
          onClickOutside(event);
        }
      }
    },
    [onClickOutside, ref],
  );

  useEffect(() => {
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('click', onClick);
    };
  }, [onClick]);
};

export default useOnClickOutside;
