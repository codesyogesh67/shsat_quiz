import React from "react";
import type { Question } from "@/types";
import ChoiceGroup from "./ChoiceGroup";
import Dot from "./Dot";
import GridIn from "./GridIn";
import MediaRenderer from "./MediaRenderer";

const QuestionCard = ({
  q,
  value,
  onChange,
  reveal,
  isCorrect,

}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
  reveal: boolean;
  isCorrect?: boolean;
 
}) => {
  return (
    <section
      className={[
        "rounded-2xl border bg-white p-5 shadow-sm",
        reveal
          ? isCorrect
            ? "border-emerald-400"
            : "border-rose-400"
          : "border-neutral-200",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0 rounded-full bg-black text-white w-8 h-8 flex items-center justify-center text-sm font-semibold">
          {q.index}
        </div>
        <div className="flex-1">
          <div className="prose prose-neutral max-w-none">
            <div dangerouslySetInnerHTML={{ __html: q.stem }} />
          </div>

          {/* NEW: render media */}
          {q.media && <MediaRenderer media={q.media} />}

          <div className="mt-4">
            {q.type === "MULTIPLE_CHOICE" ? (
              <ChoiceGroup
                name={`q-${q.id}`}
                choices={q.choices!}
                value={value}
                onChange={onChange}
              />
            ) : (
              <GridIn value={value} onChange={onChange} />
            )}
          </div>

          {reveal && (
            <div className="mt-3 text-sm">
              {isCorrect ? (
                <span className="inline-flex items-center gap-2 text-emerald-600">
                  <Dot ok /> Correct
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-rose-600">
                  <Dot /> Incorrect
                </span>
              )}
              <div className="mt-1 text-neutral-600">
                <span className="font-medium">Answer:</span>{" "}
                {q.type === "MULTIPLE_CHOICE" ? q.answer : q.answer}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuestionCard;
