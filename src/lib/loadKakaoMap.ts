/* eslint-disable prettier/prettier */
let kakaoMapPromise: Promise<void> | null = null;

export function loadKakaoMap(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("카카오 지도는 브라우저에서만 사용할 수 있습니다."),
    );
  }

  if (window.kakao?.maps) {
    return Promise.resolve();
  }

  if (kakaoMapPromise) {
    return kakaoMapPromise;
  }

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

  if (!appKey) {
    return Promise.reject(
      new Error("VITE_KAKAO_MAP_KEY가 설정되지 않았습니다."),
    );
  }

  kakaoMapPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-map-sdk="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.kakao.maps.load(resolve);
      });

      existingScript.addEventListener("error", () => {
        reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
      });

      return;
    }

    const script = document.createElement("script");

    script.dataset.kakaoMapSdk = "true";
    script.async = true;

    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js` +
      `?appkey=${appKey}` +
      `&autoload=false` +
      `&libraries=services,clusterer`;

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오 지도 객체를 찾을 수 없습니다."));
        return;
      }

      window.kakao.maps.load(resolve);
    };

    script.onerror = () => {
      kakaoMapPromise = null;
      reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapPromise;
}