const CATEGORIES = ["Exam", "Event", "General"];
const PRIORITIES = ["Normal", "Urgent"];

// Runs on the server (inside the API route). Returns { valid, errors, data }.
// `data` contains cleaned/coerced values ready to hand to Prisma.
export function validateNotice(body) {
  const errors = {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const bodyText = typeof body.body === "string" ? body.body.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const priority = typeof body.priority === "string" ? body.priority.trim() : "Normal";
  const publishDateRaw = body.publishDate;
  const image = typeof body.image === "string" && body.image.length > 0 ? body.image : null;

  if (!title) errors.title = "Title is required.";
  else if (title.length > 255) errors.title = "Title must be 255 characters or fewer.";

  if (!bodyText) errors.body = "Body is required.";

  if (!CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
  }

  if (!PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}.`;
  }

  let publishDate = null;
  if (!publishDateRaw) {
    errors.publishDate = "Publish date is required.";
  } else {
    const d = new Date(publishDateRaw);
    if (Number.isNaN(d.getTime())) {
      errors.publishDate = "Publish date is not a valid date.";
    } else {
      publishDate = d;
    }
  }

  // Basic guard so someone can't push an arbitrarily huge base64 blob into the DB.
  if (image && image.length > 6_000_000) {
    errors.image = "Image is too large.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { title, body: bodyText, category, priority, publishDate, image },
  };
}
