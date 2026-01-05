import redis from "../../lib/redis";
import { now } from "../../lib/time";
import escapeHtml from "escape-html";

export async function getServerSideProps({ params, req, res }) {
  const raw = await redis.get(`paste:${params.id}`);
  if (!raw) return { notFound: true };

  const paste = JSON.parse(raw);
  const current = now(req);

  if (paste.expires_at && current >= paste.expires_at) {
    return { notFound: true };
  }

  if (paste.max_views && paste.views >= paste.max_views) {
    return { notFound: true };
  }

  paste.views++;
  await redis.set(`paste:${params.id}`, JSON.stringify(paste));

  return {
    props: { content: escapeHtml(paste.content) }
  };
}

export default function Paste({ content }) {
  return <pre>{content}</pre>;
}
