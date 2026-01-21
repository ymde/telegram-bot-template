import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  resolve: {
    alias: {
      "@core": resolve(__dirname, "src"),
      "@app": resolve(__dirname, "src/app"),
    },
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  build: {
    target: "node22",
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        /^node:/,
        /^@clickhouse/,
        /^@grammyjs/,
        /^@prisma/,
        "async_hooks",
        "dotenv",
        "envalid",
        "grammy",
        "grammy-guard",
        "grammy-middlewares",
        "lodash",
        "module-alias",
        "mysql",
        "pino",
        "pino-pretty",
        "prisma",
        "reflect-metadata",
        "typeorm",
      ],
    },
    minify: false,
    sourcemap: true,
  },
});
