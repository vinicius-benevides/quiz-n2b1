import { useEffect, useRef } from 'react';

type AsyncEffect = () => Promise<void> | void;

type Options = {
  cleanup?: () => void;
};

export function useAsyncEffect(effect: AsyncEffect, deps: React.DependencyList, options: Options = {}) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const maybePromise = effect();

    return () => {
      isMounted.current = false;
      options.cleanup?.();
      if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
        (maybePromise as Promise<void>).catch(() => {
          /* swallow async errors on unmount */
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return isMounted;
}
