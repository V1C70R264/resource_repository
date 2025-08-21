import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetBase = env.VITE_DHIS2_URL || "https://play.dhis2.udsm.ac.tz";
  return {
    base: mode === 'production' ? './' : '/',
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy DHIS2 API in development to avoid CORS
        "/api": {
          target: targetBase,
          changeOrigin: true,
          secure: true,
          // keep path as-is (already starts with /api)
          rewrite: (p) => p,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
