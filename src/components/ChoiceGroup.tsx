import React from "react";
import type { Choice } from "@/types";

const ChoiceGroup = ({
  name,
  choices,
  value,
  onChange,
}: {
  name: string;
  choices: Choice[];
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="grid gap-2">
      {choices.map((c) => {
        const selected = value === c.key;
        return (
          <label
            key={c.key}
            className={[
              "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition",
              selected
                ? "border-black bg-neutral-50"
                : "border-neutral-200 hover:bg-neutral-50",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={c.key}
              checked={selected}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 accent-black"
            />
            <div className="flex-1">
              <div className="font-medium">{c.key}</div>
              <div className="text-neutral-700">{c.text}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default ChoiceGroup;
