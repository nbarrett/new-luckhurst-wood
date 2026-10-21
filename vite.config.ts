import {copyFileSync} from "node:fs";
import {resolve} from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
  base: "/new-luckhurst-wood/",
  plugins: [
    {
      name: "spa-404",
      closeBundle() {
        copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
      }
    }
  ]
});
