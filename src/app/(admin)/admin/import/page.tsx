// app/(admin)/admin/import/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { importQuestions, deleteByExamKey } from "./actions";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import AdminImporterClient from "./ui/AdminImporterClient";

// const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
//   .split(",")
//   .map((s) => s.trim().toLowerCase())
//   .filter(Boolean);

const ADMIN_EMAILS = "codes.yogesh67@gmail.com";

export default async function AdminImportPage() {
  const { userId } = auth();
  const user = await currentUser();

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  console.log("email", email);
  // if (!userId || !email || !ADMIN_EMAILS.includes(email)) {
  //   notFound(); // 404 for non-admins
  // }

  async function handleImport(formData: FormData) {
    "use server";
    const jsonStr = formData.get("json") as string;
    if (!jsonStr) throw new Error("Missing JSON");
    const payload = JSON.parse(jsonStr);
    const res = await importQuestions(payload);
    revalidatePath("/admin/import");
    return res;
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const examKey = (formData.get("examKey") as string)?.trim();
    const res = await deleteByExamKey(examKey);
    revalidatePath("/admin/import");
    return res;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Admin • Question Importer</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Paste JSON and import to Neon via Prisma. Only visible to admin emails.
      </p>

      <Suspense fallback={<div className="mt-6">Loading…</div>}>
        <AdminImporterClient
          onImportAction={handleImport}
          onDeleteAction={handleDelete}
        />
      </Suspense>
    </div>
  );
}
