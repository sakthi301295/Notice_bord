import prisma from "@/lib/prisma";
import { validateNotice } from "@/lib/validateNotice";

// Default body size limit (1mb) is too small for a base64-encoded image.
export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default async function handler(req, res) {
  const id = parseId(req.query.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid notice id." });
  }

  if (req.method === "GET") {
    try {
      const notice = await prisma.notice.findUnique({ where: { id } });
      if (!notice) return res.status(404).json({ error: "Notice not found." });
      return res.status(200).json(notice);
    } catch (err) {
      console.error(`GET /api/notices/${id} failed:`, err);
      return res.status(500).json({ error: "Failed to fetch notice." });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { valid, errors, data } = validateNotice(req.body || {});
    if (!valid) {
      return res.status(400).json({ error: "Validation failed.", fields: errors });
    }
    try {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Notice not found." });

      // Keep the existing image if the client didn't send a new one.
      const updateData = { ...data };
      if (updateData.image === null) updateData.image = existing.image;

      const notice = await prisma.notice.update({ where: { id }, data: updateData });
      return res.status(200).json(notice);
    } catch (err) {
      console.error(`PUT /api/notices/${id} failed:`, err);
      return res.status(500).json({ error: "Failed to update notice." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Notice not found." });

      await prisma.notice.delete({ where: { id } });
      return res.status(204).end();
    } catch (err) {
      console.error(`DELETE /api/notices/${id} failed:`, err);
      return res.status(500).json({ error: "Failed to delete notice." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
