import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  retainSearchParams,
} from "@tanstack/react-router";

import TanstackQueryLayout from "./integrations/tanstack-query/layout";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import IndexPage from "./routes/index.tsx";
import RootDocument from "./components/root-document.tsx";
import AboutPage from "./routes/about.tsx";
import CorpusPage from "./routes/corpus.tsx";

const searchSchema = z.object({
  "toggle-mirag": z.boolean().optional(),
});
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Mindful RAG",
      },
    ],
  }),
  component: RootComponent,

  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
      <TanstackQueryLayout />
    </RootDocument>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => Route,
  path: "/",
  component: IndexPage,
});
const corpusRoute = createRoute({
  getParentRoute: () => Route,
  path: "/corpus",
  component: CorpusPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => Route,
  path: "/about",
  component: AboutPage,
});

const routeTree = Route.addChildren([indexRoute, aboutRoute, corpusRoute]);

const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanstackQuery.Provider>
        <RouterProvider router={router} />
      </TanstackQuery.Provider>
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
