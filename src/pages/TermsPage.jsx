import LegalDocumentLayout, { LegalSection } from "../components/legal/LegalDocumentLayout.jsx";

const CONTACT_EMAIL = import.meta.env.VITE_PRIVACY_CONTACT_EMAIL || "cosmosktb4@gmail.com";

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Terms of Service"
      title="이용약관"
      description="COSMOS가 제공하는 알고리즘 학습, 문제 생성, 코드 채점, 데일리 배틀 서비스를 이용할 때 필요한 기준을 안내합니다."
      effectiveDate="2026년 11월 9일"
    >
      <LegalSection number="01" title="목적과 용어">
        <p>본 약관은 COSMOS와 회원 사이의 서비스 이용 조건, 권리와 의무, 책임 사항을 정하는 것을 목적으로 합니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>서비스:</strong> COSMOS가 제공하는 알고리즘 문제 생성·풀이·저장, 코드 및 자연어 풀이 평가, 학습 기록, 랭킹, 데일리 배틀 등의 기능</li>
          <li><strong>회원:</strong> 카카오 로그인을 통해 계정을 만들고 서비스를 이용하는 사람</li>
          <li><strong>이용자 콘텐츠:</strong> 회원이 입력하거나 제출한 코드, 자연어 풀이, 답안과 기타 자료</li>
        </ul>
      </LegalSection>

      <LegalSection number="02" title="약관의 효력과 변경">
        <p>회원이 카카오 로그인으로 서비스 이용을 시작하면 본 약관과 개인정보처리방침에 동의한 것으로 봅니다.</p>
        <p>서비스 운영 또는 법령 변경에 따라 약관이 개정될 수 있으며, 중요한 변경은 적용 전에 서비스 화면을 통해 안내합니다. 회원에게 불리한 중대한 변경은 합리적인 기간을 두고 고지합니다.</p>
      </LegalSection>

      <LegalSection number="03" title="계정과 로그인">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>회원은 본인 소유의 카카오 계정을 사용해야 하며, 계정 접근 정보를 안전하게 관리해야 합니다.</li>
          <li>타인의 계정을 이용하거나 계정을 양도·대여해서는 안 됩니다.</li>
          <li>비정상적인 접근이나 도용이 의심되면 즉시 운영자에게 알려야 합니다.</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="서비스의 내용">
        <p>COSMOS는 다음 기능의 전부 또는 일부를 제공합니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>난이도·카테고리 기반 AI 알고리즘 문제 생성</li>
          <li>코드 편집, 실행·채점과 자연어 풀이 평가</li>
          <li>문제 저장, 학습 기록, 포인트 및 랭킹</li>
          <li>정해진 시간에 같은 문제로 경쟁하는 데일리 배틀</li>
        </ul>
        <p>기능의 구체적인 내용과 제공 방식은 운영 상황에 따라 추가·변경될 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="05" title="AI 생성 결과와 채점 안내">
        <p>AI가 생성한 문제, 설명, 힌트와 평가는 확률적으로 만들어지므로 오류나 부정확한 내용이 포함될 수 있습니다. 중요한 학습이나 평가에 활용할 때에는 이용자가 내용을 다시 확인해야 합니다.</p>
        <p>코드 실행 환경, 네트워크 지연, 채점 데이터 오류 등으로 결과가 달라질 수 있으며, 명백한 오류가 확인되면 배틀 결과·포인트·랭킹을 합리적인 범위에서 정정할 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="06" title="회원의 의무">
        <p>회원은 다음 행위를 해서는 안 됩니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>서비스·서버·채점 시스템의 정상 작동을 방해하거나 취약점을 악용하는 행위</li>
          <li>자동화 도구를 이용한 과도한 요청, 비정상적인 점수·순위 조작 또는 배틀 부정행위</li>
          <li>타인의 권리나 개인정보를 침해하거나 불법·유해한 콘텐츠를 입력하는 행위</li>
          <li>서비스의 소스, 데이터 또는 콘텐츠를 허용 범위를 넘어 복제·배포·판매하는 행위</li>
          <li>법령, 본 약관 또는 서비스 내 안내를 위반하는 행위</li>
        </ul>
      </LegalSection>

      <LegalSection number="07" title="이용자 콘텐츠와 권리">
        <p>회원이 작성한 코드와 풀이에 대한 권리는 원칙적으로 회원에게 있습니다. 회원은 서비스 제공, 저장, 채점, 오류 분석과 품질 개선에 필요한 범위에서 COSMOS가 해당 콘텐츠를 처리하도록 허용합니다.</p>
        <p>타인의 저작권 등 권리를 침해하는 콘텐츠를 제출해서는 안 되며, 그로 인해 발생한 문제에 대한 책임은 해당 회원에게 있습니다.</p>
      </LegalSection>

      <LegalSection number="08" title="서비스 변경과 중단">
        <p>점검, 장애, 외부 서비스 변경, 천재지변, 보안상 긴급 조치 등 불가피한 사유가 있으면 서비스의 일부 또는 전부가 일시 중단될 수 있습니다.</p>
        <p>예측 가능한 중단이나 중요한 기능 변경은 가능한 범위에서 미리 안내합니다. 무료로 제공되는 기능은 운영상 필요에 따라 변경 또는 종료될 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="09" title="이용 제한">
        <p>회원이 본 약관을 위반하거나 서비스의 안전을 위협하는 경우 사전 안내 후 이용을 제한할 수 있습니다. 다만 긴급한 보안 대응이나 중대한 부정행위는 먼저 제한한 뒤 사유를 안내할 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="10" title="회원 탈퇴와 데이터 삭제">
        <p>회원은 <strong>내 문제 → 사용자 메뉴 → 회원 탈퇴</strong>에서 언제든 탈퇴를 신청할 수 있습니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>탈퇴 신청 즉시 로그아웃되고 계정 이용이 중지됩니다.</li>
          <li>신청 후 30일 동안 삭제가 유예되며, 이 기간에 카카오로 다시 로그인해 탈퇴를 취소할 수 있습니다.</li>
          <li>30일이 지나면 계정과 학습 기록이 삭제되며 복구할 수 없습니다.</li>
          <li>법령상 보관 의무가 있는 정보는 정해진 기간 동안 분리 보관될 수 있습니다.</li>
        </ul>
      </LegalSection>

      <LegalSection number="11" title="책임의 범위">
        <p>COSMOS는 안정적인 서비스 제공을 위해 노력합니다. 다만 무료 학습 보조 서비스의 특성상 AI 생성 결과의 완전성, 특정 목적 적합성, 항상 중단 없는 제공을 보증하지 않습니다.</p>
        <p>서비스의 고의 또는 중대한 과실로 이용자에게 직접 손해가 발생한 경우 관련 법령에 따라 책임을 부담합니다. 회원의 귀책사유, 외부 서비스 장애 또는 통제하기 어려운 사유로 발생한 손해에는 책임이 제한될 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="12" title="준거법과 분쟁 해결">
        <p>본 약관은 대한민국 법령을 따릅니다. 서비스 이용과 관련한 분쟁은 당사자 간 협의를 우선하며, 해결되지 않는 경우 관계 법령이 정한 관할 법원에서 처리합니다.</p>
      </LegalSection>

      <LegalSection number="13" title="운영자 문의">
        <p>서비스 이용, 계정, 약관과 관련한 문의는 아래 연락처로 보내 주세요.</p>
        <div className="rounded-xl border border-[var(--cosmos-border)] bg-[var(--cosmos-surface-deep)] px-4 py-3">
          <p className="font-semibold text-[var(--cosmos-text-primary)]">COSMOS 운영팀</p>
          <a className="mt-1 inline-block text-[var(--cosmos-accent-text)] underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
