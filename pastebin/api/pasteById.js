import redis from "../../lib/redis";
import { now } from "../../lib/time";

export default async function handler(req, res) {
  const { id } = req.query;
  const raw = await redis.get(`paste:${id}`);
  if (!raw) return res.status(404).json({ error: "Not found" });

  const paste = JSON.parse(raw);
  const current = now(req);

  if (paste.expires_at && current >= paste.expires_at) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.max_views && paste.views >= paste.max_views) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.views++;
  await redis.set(`paste:${id}`, JSON.stringify(paste));

  res.json({
    content: paste.content,
    remaining_views: paste.max_views
      ? Math.max(paste.max_views - paste.views, 0)
      : null,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null
  });
}
