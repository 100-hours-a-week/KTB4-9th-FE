import { createBrowserRouter } from "react-router";
import AppShell from "./components/layout/AppShell.jsx";
import RootLayout from "./components/layout/RootLayout.jsx";
import BattlePage, { InvalidBattleRoutePage } from "./pages/BattlePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import ProblemGenerationPage from "./pages/ProblemGenerationPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import SolvePage from "./pages/SolvePage.jsx";
import SolveRoute from "./pages/SolveRoute.jsx";

export const router = createBrowserRouter([
  {
    // 주소가 없는 맨 바깥 레이아웃. 아래 모든 화면을 감싼다.
    Component: RootLayout,
    children: [
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/solve",
        Component: SolvePage,
      },
      {
        path: "/problems/:problemId",
        Component: SolveRoute,
      },
      {
        path: "/",
        Component: AppShell,
        children: [
          { index: true, Component: HomePage },
          { path: "problems/new", Component: ProblemGenerationPage },
          { path: "daily-battles", Component: BattlePage },
          { path: "daily-battles/*", Component: InvalidBattleRoutePage },
          { path: "rankings", Component: RankingPage },
          { path: "mypage", Component: MyPage },
        ],
      },
    ],
  },
]);
