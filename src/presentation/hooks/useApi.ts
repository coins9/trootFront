import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../data/api/client';
import { useTranslation } from '../store/languageStore';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 화면마다 반복되는 조회/로딩/에러 처리를 한 곳으로 모은다.
 * 언마운트 후 setState 로 인한 경고를 막기 위해 마운트 여부를 추적한다.
 */
export function useApi<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> & { reload: () => void } {
  const { t } = useTranslation();
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const alive = useRef(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (alive.current) setState({ data, loading: false, error: null });
    } catch (e) {
      if (!alive.current) return;
      setState({
        data: null,
        loading: false,
        error: e instanceof ApiError ? e.userMessage : t('common.loadDataFailed'),
      });
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void run();
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: run };
}

/** 커서 페이지네이션 목록 — 무한 스크롤용 */
export function usePagedApi<T>(
  loader: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null; hasNext: boolean }>,
  deps: unknown[] = [],
) {
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alive = useRef(true);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const reqGen = useRef(0);

  const load = useCallback(async (reset: boolean) => {
    const gen = ++reqGen.current;
    if (reset) { setItems([]); setLoading(true); }
    else setLoadingMore(true);
    setError(null);

    try {
      const page = await loaderRef.current(reset ? undefined : cursor ?? undefined);
      if (!alive.current || gen !== reqGen.current) return;

      setItems((prev) => reset ? page.items : [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasNext(page.hasNext);
    } catch (e) {
      if (!alive.current || gen !== reqGen.current) return;
      setError(e instanceof ApiError ? e.userMessage : t('common.loadListFailed'));
    } finally {
      if (alive.current && gen === reqGen.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [cursor]);

  useEffect(() => {
    alive.current = true;
    void load(true);
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    // 이미 요청 중이거나 다음 페이지가 없으면 중복 호출을 막는다
    if (loading || loadingMore || !hasNext) return;
    void load(false);
  }, [loading, loadingMore, hasNext, load]);

  const reload = useCallback(() => {
    setCursor(null);
    void load(true);
  }, [load]);

  return { items, loading, loadingMore, error, hasNext, loadMore, reload, setItems };
}
