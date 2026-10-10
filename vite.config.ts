import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const developmentPlugins: PluginOption[] = [];
if (process.env.NODE_ENV !== "production") {
  const runtimeErrorOverlay = (
    await import("@replit/vite-plugin-runtime-error-modal")
  ).default;
  developmentPlugins.push(runtimeErrorOverlay());
  if (process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    developmentPlugins.push(cartographer());
  }
}

export default defineConfig({
  base: process.env.SANDBOX_PREVIEW_BASE ? `${process.env.SANDBOX_PREVIEW_BASE}/` : "/",
  plugins: [react(), ...developmentPlugins],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "client", "src", "assets", "template-placeholders"),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    target: 'es2020',
    cssMinify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      // Capacitor packages only exist in the native iOS/Android runtime.
      // Externalizing them prevents Vite from trying to bundle them during
      // the web production build (Render, Vercel, etc.).
      external: [
        '@capacitor/browser',
        '@capacitor/core',
        '@capacitor/ios',
        '@capacitor/app',
        '@capacitor/haptics',
        '@capacitor/keyboard',
        '@capacitor/status-bar',
        '@capacitor/push-notifications',
        '@vladmandic/face-api',
      ],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: process.env.REPL_ID
      ? { host: process.env.REPLIT_DEV_DOMAIN, clientPort: 443, protocol: "wss" }
      : { clientPort: 5000 },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query', 'wouter', 'lucide-react', 'i18next', 'react-i18next'],
    exclude: ['@vladmandic/face-api', 'face-api.js', 'sharp'],
  },
});
