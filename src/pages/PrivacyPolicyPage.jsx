import LegalDocumentLayout, { LegalSection } from "../components/legal/LegalDocumentLayout.jsx";

const CONTACT_EMAIL = import.meta.env.VITE_PRIVACY_CONTACT_EMAIL || "cosmosktb4@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Privacy Policy"
      title="개인정보처리방침"
      description="COSMOS는 알고리즘 학습 서비스를 제공하는 데 필요한 최소한의 개인정보만 처리하고, 이용자의 권리를 보호합니다."
      effectiveDate="2026년 11월 9일"
    >
      <LegalSection number="01" title="처리하는 개인정보와 이용 목적">
        <p>COSMOS는 다음 목적에 필요한 정보만 처리합니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>카카오 로그인:</strong> 카카오 회원 식별자, 닉네임, 프로필 이미지</li>
          <li><strong>맞춤형 학습:</strong> 문제 생성 조건, 저장한 문제, 풀이·제출 결과, 난이도·카테고리별 학습 기록과 포인트</li>
          <li><strong>코드 및 풀이 평가:</strong> 제출 코드, 선택 언어, 자연어 풀이, 채점 결과</li>
          <li><strong>데일리 배틀:</strong> 참여 상태, 제출 답안, 소요 시간, 순위</li>
          <li><strong>서비스 안정성:</strong> 접속 기록, IP 주소, 브라우저·기기 정보, 오류 기록</li>
        </ul>
        <p>이메일은 카카오로부터 제공받거나 별도로 수집하지 않습니다.</p>
      </LegalSection>

      <LegalSection number="02" title="수집 방법">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>카카오 OAuth 로그인 과정에서 이용자가 동의한 정보</li>
          <li>문제 생성·풀이·저장·배틀 등 서비스 이용 중 이용자가 직접 입력한 정보</li>
          <li>서비스 접속과 이용 과정에서 자동으로 생성되는 기술 정보</li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="보유 및 이용 기간">
        <p>회원 정보와 학습 기록은 회원 탈퇴 전까지 보유합니다. 탈퇴 신청 시 계정 이용이 즉시 중지되고, 복구를 위한 30일의 유예기간이 지난 뒤 계정과 학습 기록을 삭제합니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>인증용 Access/Refresh Token: 만료, 로그아웃 또는 탈퇴 처리 시까지</li>
          <li>탈퇴 계정 식별 및 복구 정보: 탈퇴 신청일로부터 30일</li>
          <li>관계 법령에 별도 보존 의무가 있는 정보: 해당 법령이 정한 기간</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="제3자 제공과 외부 서비스">
        <p>COSMOS는 원칙적으로 이용자의 개인정보를 판매하거나 제3자에게 제공하지 않습니다. 법령상 의무가 있거나 이용자가 별도로 동의한 경우에만 필요한 범위에서 제공합니다.</p>
        <p>서비스 제공 과정에서 다음 외부 서비스가 사용될 수 있습니다.</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>카카오:</strong> 소셜 로그인과 이용자 식별</li>
          <li><strong>클라우드 인프라:</strong> 서비스·데이터베이스 운영 및 보안</li>
          <li><strong>코드 채점 및 AI 처리 시스템:</strong> 코드 실행·채점, 문제와 자연어 풀이 평가</li>
          <li><strong>Microsoft Clarity:</strong> 기능이 활성화된 경우 서비스 이용 행태 분석과 품질 개선</li>
        </ul>
        <p>수탁사 또는 국외 처리 사항이 확정·변경되는 경우 대상, 목적, 항목, 국가, 보유기간을 본 방침을 통해 고지합니다.</p>
      </LegalSection>

      <LegalSection number="05" title="쿠키와 로컬 저장소">
        <p>로그인 유지를 위해 JavaScript로 읽을 수 없는 HttpOnly 인증 쿠키를 사용합니다. 화면 테마와 일부 편의 설정은 브라우저 로컬 저장소에 저장될 수 있습니다.</p>
        <p>브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 등 일부 기능을 이용할 수 없습니다.</p>
      </LegalSection>

      <LegalSection number="06" title="이용자의 권리와 행사 방법">
        <p>이용자는 자신의 개인정보를 조회·정정·삭제하고 처리 정지 또는 동의 철회를 요청할 수 있습니다. 회원 탈퇴는 <strong>내 문제 → 사용자 메뉴 → 회원 탈퇴</strong>에서 신청할 수 있습니다.</p>
        <p>탈퇴 신청 후 30일 이내에 카카오로 다시 로그인하면 안내 화면에서 탈퇴를 취소할 수 있습니다. 30일이 지나 완전히 삭제된 정보는 복구할 수 없습니다.</p>
      </LegalSection>

      <LegalSection number="07" title="개인정보의 파기">
        <p>보유기간이 끝나거나 처리 목적이 달성된 개인정보는 복구하기 어려운 방법으로 지체 없이 삭제합니다. 전자 파일은 재생할 수 없는 기술적 방법으로 삭제하고, 출력물은 분쇄하거나 소각합니다.</p>
      </LegalSection>

      <LegalSection number="08" title="안전성 확보 조치">
        <p>COSMOS는 접근 권한 관리, 인증정보 암호화·보호, 접속 기록 관리, 보안 업데이트와 최소 권한 원칙 등 개인정보 보호에 필요한 기술적·관리적 조치를 적용합니다.</p>
      </LegalSection>

      <LegalSection number="09" title="아동의 개인정보">
        <p>COSMOS는 만 14세 미만 아동을 대상으로 회원 서비스를 제공하지 않습니다. 만 14세 미만 이용자의 정보가 확인되면 필요한 확인 절차 후 삭제할 수 있습니다.</p>
      </LegalSection>

      <LegalSection number="10" title="개인정보 보호 문의">
        <p>개인정보 열람, 정정, 삭제, 처리 정지 및 기타 개인정보 보호 관련 문의는 아래 담당 창구로 접수할 수 있습니다.</p>
        <div className="rounded-xl border border-[var(--cosmos-border)] bg-[var(--cosmos-surface-deep)] px-4 py-3">
          <p className="font-semibold text-[var(--cosmos-text-primary)]">COSMOS 개인정보 보호 담당</p>
          <a className="mt-1 inline-block text-[var(--cosmos-accent-text)] underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </LegalSection>

      <LegalSection number="11" title="방침 변경">
        <p>본 방침이 변경되는 경우 시행 전에 서비스 화면을 통해 안내합니다. 이용자 권리에 중대한 변경이 있는 경우에는 충분한 기간을 두고 명확하게 알립니다.</p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
