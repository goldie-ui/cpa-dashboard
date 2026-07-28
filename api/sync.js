import { put, get } from "@vercel/blob";
import crypto from "node:crypto";

const MAX_BYTES = 512 * 1024;               // 512KB — 공부 기록 수년치도 충분
const KEY_RE = /^[A-Za-z0-9_-]{24,80}$/;

// 동기화 키를 그대로 저장 경로로 쓰지 않고 해시해서 사용.
// 저장소를 들여다봐도 키 원문은 남지 않는다.
function pathFor(key) {
  const h = crypto.createHash("sha256").update("cpa-sync:" + key).digest("hex");
  return `sync/${h}.json`;
}

function readKey(req) {
  if (req.method === "GET") {
    const q = req.query || {};
    return String(q.key || "");
  }
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  return String((b && b.key) || "");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const key = readKey(req);
  if (!KEY_RE.test(key)) {
    return res.status(400).json({ error: "bad_key" });
  }
  const path = pathFor(key);

  try {
    if (req.method === "GET") {
      let r = null;
      try {
        r = await get(path, { access: "private", useCache: false });
      } catch (e) {
        if (e && e.name === "BlobNotFoundError") return res.status(200).json({ found: false });
        throw e;
      }
      if (!r || r.statusCode !== 200 || !r.stream) return res.status(200).json({ found: false });
      const text = await new Response(r.stream).text();
      let data;
      try { data = JSON.parse(text); }
      catch { return res.status(200).json({ found: false }); }
      return res.status(200).json({ found: true, data });
    }

    if (req.method === "POST" || req.method === "PUT") {
      let b = req.body;
      if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
      if (!b || typeof b.data !== "object" || b.data === null) {
        return res.status(400).json({ error: "bad_body" });
      }
      const payload = JSON.stringify(b.data);
      if (Buffer.byteLength(payload, "utf8") > MAX_BYTES) {
        return res.status(413).json({ error: "too_large" });
      }
      await put(path, payload, {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      });
      return res.status(200).json({ ok: true, bytes: Buffer.byteLength(payload, "utf8") });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    return res.status(500).json({ error: "server_error", message: String((e && e.message) || e) });
  }
}
