import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter, ErrorComponent } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import './index.css';

const isChunkLoadError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading CSS chunk')
    );
  }
  return false;
};

const RELOAD_KEY = 'chunk_error_reload';

const handleChunkError = () => {
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  const now = Date.now();
  if (!lastReload || now - Number(lastReload) > 10_000) {
    sessionStorage.setItem(RELOAD_KEY, String(now));
    window.location.reload();
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => {
    if (isChunkLoadError(error)) {
      handleChunkError();
      return null;
    }
    return <ErrorComponent error={error} />;
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

window.addEventListener('unhandledrejection', (event) => {
  if (isChunkLoadError(event.reason)) {
    event.preventDefault();
    handleChunkError();
  }
});

window.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLScriptElement && target.src?.includes('/static/')) {
      event.preventDefault();
      handleChunkError();
    }
  },
  true,
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
