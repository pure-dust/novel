import {defineConfig} from "vite";
import {resolve} from "path"
import vue from "@vitejs/plugin-vue";

export default defineConfig(async () => ({
  plugins: [vue()],
  resolve: {
    alias: {
      "~main": resolve(__dirname, "pages/main"),
      "~setting": resolve(__dirname, "pages/config"),
      "~utils": resolve(__dirname, "utils")
    }
  },
  clearScreen: true,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      sourcemap: !!process.env.TAURI_DEBUG,
      input: {
        index: resolve(__dirname, "pages/main/index.html"),
        setting: resolve(__dirname, "pages/config/index.html"),
      },
      output: {}
    },
  }
}));
