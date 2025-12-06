import { useState, useCallback, useRef, useEffect } from 'react';
import { AxiosError } from 'axios';

export type Service<TData, TParams extends any[]> = (...args: TParams) => Promise<TData>;

export interface Options<TData, TParams extends any[]> {
  manual?: boolean;
  defaultParams?: TParams;
  onBefore?: (params: TParams) => void;
  onSuccess?: (data: TData, params: TParams) => void;
  onError?: (e: AxiosError, params: TParams) => void;
  onFinally?: (params: TParams, data?: TData, e?: AxiosError) => void;
}

function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options: Options<TData, TParams> = {}
) {
  const {
    manual = false,
    defaultParams = [] as unknown as TParams,
    onBefore,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [data, setData] = useState<TData | undefined>();
  const [error, setError] = useState<AxiosError | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(!manual);
  const [isError, setIsError] = useState<boolean>(false);

  const paramsRef = useRef<TParams>(defaultParams);
  const serviceRef = useRef(service);

  const executeAsync = useCallback(async (...args: TParams): Promise<TData> => {
    debugger
    paramsRef.current = args;

    setIsLoading(true);
    onBefore?.(args);

    try {
      const start = performance.now();
      const res = await serviceRef.current(...args);
      if (performance.now() - start < 1000) {
        await new Promise(resolve => setTimeout(resolve, 600 - (performance.now() - start)));
      }

      setData(res);
      setError(undefined);
      setIsLoading(false);
      setIsError(false);

      onSuccess?.(res, args);
      onFinally?.(args, res, undefined);

      return res;
    } catch (err: any) {
      setError(err);
      setIsLoading(false);
      setIsError(true);

      onError?.(err, args);
      onFinally?.(args, undefined, err);

      throw err;
    }
  }, [onBefore, onSuccess, onError, onFinally]);

  const execute = useCallback((...args: TParams) => {
    executeAsync(...args).catch((error) => {
      if (!onError) {
        console.error('useRequest error:', error);
      }
    });
  }, [executeAsync, onError]);

  const refresh = useCallback((resetParams: boolean = false) => {
    if (resetParams) {
      paramsRef.current = defaultParams;
    }
    return execute(...paramsRef.current);
  }, [execute, defaultParams]);

  useEffect(() => {
    if (!manual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      execute(...defaultParams);
    }
  }, [manual, execute, defaultParams]);

  return {
    data,
    isLoading,
    isError,
    error,
    execute,
    executeAsync,
    refresh
  };
}

export default useRequest;