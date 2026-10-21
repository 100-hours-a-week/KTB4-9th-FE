import { useParams } from "react-router";
import SolvePage from "./SolvePage.jsx";

// 문제가 바뀌면 이전 문제의 상태(카테고리 공개 여부, 입력한 풀이 등)가 남지 않도록 풀이 화면을 새로 만든다.
// (알림에서 다른 문제로 이동하면 주소 형태가 같아서 화면이 그대로 재사용되기 때문)
export default function SolveRoute() {
  const { problemId } = useParams();
  return <SolvePage key={problemId} />;
}
