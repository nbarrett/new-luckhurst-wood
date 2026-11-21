// The diary edit page: hide or restore photos and write day notes, saved to
// the S3 diary list so the live site changes straight away. Only served by
// `npm run dev` (never built), only to this Mac, at /__diary/.
import {readFileSync} from "node:fs";
import type {IncomingMessage, ServerResponse} from "node:http";
import {join} from "node:path";
import type {Plugin} from "vite";
import {fetchDiaryList, putDiaryList} from "./diary-list.mjs";

const page = join(import.meta.dirname, "diary-editor.html");
const loopback = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function send(res: ServerResponse, status: number, type: string, body: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = "";
    req.on("data", (chunk) => {
      text += chunk;
      if (text.length > 2_000_000) {
        reject(new Error("too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(text));
    req.on("error", reject);
  });
}

export function diaryEditor(): Plugin {
  return {
    name: "diary-editor",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__diary", async (req, res) => {
        if (!loopback.has(req.socket.remoteAddress ?? "")) {
          send(res, 403, "text/plain", "The diary edit page only works on this Mac.");
          return;
        }
        try {
          const path = (req.url ?? "/").split("?")[0];
          if (req.method === "GET" && (path === "/" || path === "")) {
            send(res, 200, "text/html; charset=utf-8", readFileSync(page, "utf8"));
          } else if (req.method === "GET" && path === "/list") {
            send(res, 200, "application/json", JSON.stringify(await fetchDiaryList()));
          } else if (req.method === "PUT" && path === "/list") {
            if (req.headers["content-type"] !== "application/json" || req.headers.origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)) {
              send(res, 400, "text/plain", "Bad request");
              return;
            }
            putDiaryList(JSON.parse(await readBody(req)));
            send(res, 200, "application/json", JSON.stringify({saved: true}));
          } else {
            send(res, 404, "text/plain", "Not found");
          }
        } catch (error) {
          send(res, 500, "text/plain", error instanceof Error ? error.message : String(error));
        }
      });
    }
  };
}
