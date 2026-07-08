import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import prisma from "@/lib/prisma";
import NoticeCard from "@/components/NoticeCard";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Toast from "@/components/Toast";

export async function getServerSideProps() {
  // Urgent-first ordering happens in the DB query, not in the browser.
  const notices = await prisma.notice.findMany({
    orderBy: [{ priority: "desc" }, { publishDate: "desc" }, { id: "desc" }],
  });

  return {
    props: {
      initialNotices: JSON.parse(JSON.stringify(notices)),
    },
  };
}

export default function Home({ initialNotices }) {
  const router = useRouter();
  const [notices, setNotices] = useState(initialNotices);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Show a success toast after redirecting back from the create/edit form,
  // then strip the query param so it doesn't reappear on refresh.
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.created) {
      setToastMessage("Notice created successfully.");
      router.replace("/", undefined, { shallow: true });
    } else if (router.query.updated) {
      setToastMessage("Notice updated successfully.");
      router.replace("/", undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.created, router.query.updated]);

  const handleRequestDelete = useCallback((notice) => {
    setDeleteError("");
    setNoticeToDelete(notice);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (deleting) return;
    setNoticeToDelete(null);
    setDeleteError("");
  }, [deleting]);

  async function handleConfirmDelete() {
    if (!noticeToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/notices/${noticeToDelete.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error("Delete failed.");
      }
      setNotices((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
      setNoticeToDelete(null);
      setToastMessage("Notice deleted successfully.");
    } catch (err) {
      setDeleteError("Could not delete this notice. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-indigo-50/30 to-white">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
              <p className="text-sm text-gray-500">
                {notices.length} notice{notices.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link
            href="/notices/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:from-violet-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add notice
          </Link>
        </div>

        {deleteError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {deleteError}
          </p>
        )}

        {notices.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-white/60 py-16 text-center">
            <p className="text-gray-500">No notices yet.</p>
            <Link
              href="/notices/new"
              className="mt-2 inline-block text-sm font-medium text-violet-700 hover:text-violet-900"
            >
              Create the first one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onRequestDelete={handleRequestDelete} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        notice={noticeToDelete}
        deleting={deleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
