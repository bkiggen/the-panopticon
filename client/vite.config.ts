import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@server": path.resolve(__dirname, "../server"),
      "@prismaTypes": path.resolve(__dirname, "../server/src/types"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
