import React from "react";

interface Props {}

const GridIn = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        inputMode="decimal"
        placeholder="Type a number (e.g., -4 or 3/10)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-72 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
};

export default GridIn;
