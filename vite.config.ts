// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Three.js 기반 3D 그래프는 크기가 커서 Windows/OneDrive 환경에서
    // 개발 서버의 dependency optimizer가 오래 멈출 수 있다.
    // 개발 중에는 원본 ESM을 그대로 로드하고, 프로덕션 빌드는 정상 번들링한다.
    optimizeDeps: {
      exclude: [
        "react-force-graph-3d",
        "three",
        "three-spritetext",
      ],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
