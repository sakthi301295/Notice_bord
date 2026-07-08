import prisma from "@/lib/prisma";
import { validateNotice } from "@/lib/validateNotice";

// Default body size limit (1mb) is too small for a base64-encoded image.
export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Urgent-first ordering is done here, in the DB query, not in the browser.
      // "Urgent" > "Normal" alphabetically, so ordering priority `desc` puts
      // every Urgent notice above every Normal notice, regardless of date.
      const notices = await prisma.notice.findMany({
        orderBy: [{ priority: "desc" }, { publishDate: "desc" }, { id: "desc" }],
      });
      return res.status(200).json(notices);
    } catch (err) {
      console.error("GET /api/notices failed:", err);
      return res.status(500).json({ error: "Failed to fetch notices." });
    }
  }

  if (req.method === "POST") {
    const { valid, errors, data } = validateNotice(req.body || {});
    if (!valid) {
      return res.status(400).json({ error: "Validation failed.", fields: errors });
    }
    try {
      const notice = await prisma.notice.create({ data });
      return res.status(201).json(notice);
    } catch (err) {
      console.error("POST /api/notices failed:", err);
      return res.status(500).json({ error: "Failed to create notice." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
