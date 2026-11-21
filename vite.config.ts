import {copyFileSync} from "node:fs";
import {resolve} from "node:path";
import {defineConfig} from "vite";
import {diaryEditor} from "./scripts/diary-editor";

export default defineConfig({
  base: "/new-luckhurst-wood/",
  plugins: [
    diaryEditor(),
    {
      name: "spa-404",
      closeBundle() {
        copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
      }
    }
  ]
});
