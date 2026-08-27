import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { mswLoader } from "msw-storybook-addon/csf3";
import { handlers } from "../src/lib/msw/handlers";
import "../src/index.css";

function withQueryClient(Story: React.ComponentType) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
}

// Link/useNavigate等、@tanstack/react-routerのAPIに依存するコンポーネントをStorybook上で単独描画するための最小限のルーター
function withRouter(Story: React.ComponentType) {
  const rootRoute = createRootRoute({ component: () => <Story /> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return <RouterProvider router={router} />;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: handlers,
  },
  loaders: [mswLoader()],
  decorators: [withQueryClient, withRouter],
};

export default preview;
