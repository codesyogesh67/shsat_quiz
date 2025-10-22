// app/exam/page.tsx
import ExamPicker from "@/components/exam/ExamPicker";

export const metadata = {
  title: "Start Exam | SHSAT Practice",
};

export default function ExamPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-10">
      <h1 className="text-3xl font-bold mb-6">Start a Full SHSAT Exam</h1>
      <p className="text-muted-foreground mb-8">
        Choose a past test or a random practice set. Once started, the exam will
        open in a new timed session.
      </p>

      <ExamPicker defaultSet="random" defaultCount={57} defaultMinutes={90} />
    </div>
  );
}
