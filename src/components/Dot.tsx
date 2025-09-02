const Dot = ({ ok = false }: { ok?: boolean }) => {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        ok ? "bg-green-500" : "bg-rose-500"
      }`}
    />
  );
};

export default Dot;
