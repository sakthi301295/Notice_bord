import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import prisma from "@/lib/prisma";
import NoticeForm from "@/components/NoticeForm";

export async function getServerSideProps({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return { notFound: true };
  }

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) {
    return { notFound: true };
  }

  return {
    props: {
      notice: JSON.parse(JSON.stringify(notice)),
    },
  };
}

export default function EditNotice({ notice }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-indigo-50/40 to-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notices
        </Link>

        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl shadow-violet-100/50">
          <div className="flex items-center justify-between border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
                <PenLine className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Notice</h1>
                <p className="text-sm text-gray-500">Update the details of this notice.</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <NoticeForm mode="edit" initialNotice={notice} />
          </div>
        </div>
      </div>
    </div>
  );
}
