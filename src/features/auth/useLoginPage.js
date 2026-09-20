export function useLoginPage() {
  const handleKakaoLogin = () => {
    const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("카카오 REST API 키와 Redirect URI를 확인해 주세요.");
      return;
    }

    const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
    authorizeUrl.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
    }).toString();

    window.location.assign(authorizeUrl.toString());
  };

  return { handleKakaoLogin };
}
