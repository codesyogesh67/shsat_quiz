import type { Question } from "@/types";
import Image from "next/image";

const MediaRenderer = ({ media }: { media: Question["media"] }) => {
  if (!media) return null;

  if (media.type === "image") {
    const src =
      media.url ??
      (media.base64
        ? media.base64.startsWith("data:")
          ? media.base64
          : `data:image/png;base64,${media.base64}`
        : undefined);

    if (!src) return null;

    return (
      <div className="mt-3 relative h-64">
        <Image
          src={src}
          alt="question image"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 640px"
          unoptimized={src.startsWith("data:")}
        />
      </div>
    );
  }

  if (media.type === "graph") {
    const width = media.xAxis?.max ?? 100;
    const height = media.yAxis?.max ?? 100;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full h-48 border border-neutral-300"
      >
        {media.shapes?.map((shape, i) => {
          if (shape.type === "line" && shape.points.length >= 2) {
            const [p1, p2] = shape.points;
            return (
              <line
                key={i}
                x1={p1[0]}
                y1={height - p1[1]}
                x2={p2[0]}
                y2={height - p2[1]}
                stroke="black"
              />
            );
          }
          if (shape.type === "polygon") {
            const points = shape.points
              .map(([x, y]) => `${x},${height - y}`)
              .join(" ");
            return (
              <polygon
                key={i}
                points={points}
                fill={shape.fill === "shaded" ? "lightgray" : "none"}
                stroke="black"
              />
            );
          }
          return null;
        })}
      </svg>
    );
  }

  return null;
};

export default MediaRenderer;
