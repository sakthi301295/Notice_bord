import { useState } from "react";
import { useRouter } from "next/router";
import {
  PenSquare,
  FileText,
  Tag,
  Flag,
  Calendar,
  ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";

const CATEGORIES = ["Exam", "Event", "General"];
const PRIORITIES = ["Normal", "Urgent"];

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// mode: "create" | "edit"
export default function NoticeForm({ mode, initialNotice }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialNotice?.title || "");
  const [body, setBody] = useState(initialNotice?.body || "");
  const [category, setCategory] = useState(initialNotice?.category || "General");
  const [priority, setPriority] = useState(initialNotice?.priority || "Normal");
  const [publishDate, setPublishDate] = useState(
    toDateInputValue(initialNotice?.publishDate) || toDateInputValue(new Date())
  );
  const [image, setImage] = useState(initialNotice?.image || null);
  const [imagePreview, setImagePreview] = useState(initialNotice?.image || null);
  const [imageName, setImageName] = useState("");

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 5MB." }));
      return;
    }
    const base64 = await fileToBase64(file);
    setImage(base64);
    setImagePreview(base64);
    setImageName(file.name);
    setErrors((prev) => ({ ...prev, image: undefined }));
  }

  function clearImage() {
    setImage(null);
    setImagePreview(null);
    setImageName("");
  }

  function clientSideValidate() {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!body.trim()) next.body = "Body is required.";
    if (!CATEGORIES.includes(category)) next.category = "Choose a category.";
    if (!PRIORITIES.includes(priority)) next.priority = "Choose a priority.";
    if (!publishDate || Number.isNaN(new Date(publishDate).getTime())) {
      next.publishDate = "Enter a valid date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    // Client-side check for a fast UX signal — the API route re-validates on the server regardless.
    if (!clientSideValidate()) return;

    setSubmitting(true);
    const payload = { title, body, category, priority, publishDate, image };

    try {
      const url = mode === "create" ? "/api/notices" : `/api/notices/${initialNotice.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.fields) setErrors(data.fields);
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(mode === "create" ? "/?created=1" : "/?updated=1");
    } catch (err) {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <PenSquare className="h-4 w-4 text-violet-600" />
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          placeholder="e.g. Mid-semester exam schedule released"
        />
        <p className="mt-1.5 text-xs text-gray-500">Keep it short and clear.</p>
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Body */}
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <FileText className="h-4 w-4 text-violet-600" />
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          placeholder="Full details of the notice…"
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Provide all the relevant information about this notice.
        </p>
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
      </div>

      {/* Category / Priority */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Tag className="h-4 w-4 text-violet-600" />
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">Select the most relevant category.</p>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Flag className="h-4 w-4 text-violet-600" />
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">Set the importance level of this notice.</p>
          {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
        </div>
      </div>

      {/* Publish date */}
      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Calendar className="h-4 w-4 text-violet-600" />
          Publish Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={publishDate}
          onChange={(e) => setPublishDate(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:w-72"
        />
        <p className="mt-1.5 text-xs text-gray-500">Select the date to publish this notice.</p>
        {errors.publishDate && (
          <p className="mt-1 text-xs text-red-600">{errors.publishDate}</p>
        )}
      </div>

      {/* Image dropzone */}
      <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Notice Image <span className="font-normal text-gray-400">(optional)</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Upload an image to make your notice more engaging.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-300 bg-white px-3.5 py-2 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-50">
                <UploadCloud className="h-4 w-4" />
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="truncate text-xs text-gray-500">
                {imageName || (imagePreview ? "Current image kept" : "No file chosen")}
              </span>
              <span className="ml-auto shrink-0 text-xs text-gray-400">JPG, PNG up to 5MB</span>
            </div>

            {imagePreview && (
              <div className="relative mt-3 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-28 w-44 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-500 shadow ring-1 ring-gray-200 hover:text-red-600"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {errors.image && <p className="mt-2 text-xs text-red-600">{errors.image}</p>}
          </div>
        </div>
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{submitError}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
        >
          <UploadCloud className="h-4 w-4" />
          {submitting
            ? "Saving…"
            : mode === "create"
            ? "Create Notice"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
