import { createBrowserRouter } from "react-router";
import AppShell from "./components/layout/AppShell.jsx";
import BattlePage from "./pages/BattlePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProblemGenerationPage from "./pages/ProblemGenerationPage.jsx";
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
      { index: true, Component: HomePage },
      { path: "problems/new", Component: ProblemGenerationPage },
      { path: "battle", Component: BattlePage },
      { path: "rankings", Component: RankingPage },
    ],
  },
]);
