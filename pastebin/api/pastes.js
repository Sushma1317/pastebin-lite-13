import { nanoid } from "nanoid";
import redis from "../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);
  const created = Date.now();

  const paste = {
    id,
    content,
    created_at: created,
    expires_at: ttl_seconds ? created + ttl_seconds * 1000 : null,
    max_views: max_views ?? null,
    views: 0
  };

  await redis.set(`paste:${id}`, JSON.stringify(paste));

  res.status(200).json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`
  });
}
