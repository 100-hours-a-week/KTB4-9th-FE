import { Navigate, createBrowserRouter } from "react-router";
import AppShell from "./components/layout/AppShell.jsx";
import BattlePage from "./pages/BattlePage.jsx";
import HomePage from "./pages/DailyPage.jsx";
import GeneratePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: AppShell,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", Component: HomePage },
      { path: "generate", Component: GeneratePage },
      { path: "battle", Component: BattlePage },
      { path: "rankings", Component: RankingPage },
    ],
  },
]);
