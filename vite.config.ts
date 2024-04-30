import { defineConfig } from "vite";
import { resolve } from "path"
import vue from "@vitejs/plugin-vue";

export default defineConfig(() => ({
  plugins: [vue()],
  resolve: {
    alias: {
      "~main": resolve(__dirname, "pages/main"),
      "~setting": resolve(__dirname, "pages/config"),
      "~utils": resolve(__dirname, "utils"),
      "~components": resolve(__dirname, "pages/components"),
      "~assets": resolve(__dirname, "assets")
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
    minify: true,
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "pages/main/index.html"),
        setting: resolve(__dirname, "pages/config/index.html"),
      },
      output: {}
    },
  }
}));
