import Link from "next/link";

const CATEGORY_STYLES = {
  Exam: "bg-purple-100 text-purple-700",
  Event: "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-700",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Delete is not handled here — clicking Delete just asks the parent page to
// open its standalone confirmation modal (see ConfirmDeleteModal).
export default function NoticeCard({ notice, onRequestDelete }) {
  return (
    <div
      className={`relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        notice.priority === "Urgent" ? "border-red-300" : "border-violet-100"
      }`}
    >
      {notice.priority === "Urgent" && (
        <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow">
          Urgent
        </span>
      )}

      {notice.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={notice.image}
          alt=""
          className="mb-3 h-36 w-full rounded-lg object-cover"
        />
      )}

      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General
          }`}
        >
          {notice.category}
        </span>
        <span className="text-xs text-gray-400">{formatDate(notice.publishDate)}</span>
      </div>

      <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900">
        {notice.title}
      </h3>
      <p className="mb-4 line-clamp-3 whitespace-pre-line text-sm text-gray-600">
        {notice.body}
      </p>

      <div className="flex items-center gap-2 border-t pt-3">
        <Link
          href={`/notices/${notice.id}/edit`}
          className="rounded-lg border border-violet-200 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
        >
          Edit
        </Link>
        <button
          onClick={() => onRequestDelete(notice)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
