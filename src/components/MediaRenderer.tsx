import React from "react";

const MediaRenderer = ({ media }: { media: Question["media"] }) => {
  if (!media) return null;

  if (media.type === "image") {
    return (
      <div className="mt-3">
        <img
          src={media.url || media.base64}
          alt="question graph"
          className="max-h-64 object-contain mx-auto"
        />
      </div>
    );
  }

  if (media.type === "graph") {
    // simple SVG renderer
    return (
      <svg
        viewBox={`0 0 ${media.xAxis?.max} ${media.yAxis?.max}`}
        className="mt-3 w-full h-48 border border-neutral-300"
      >
        {media.shapes?.map((shape, i) => {
          if (shape.type === "line") {
            return (
              <line
                key={i}
                x1={shape.points[0][0]}
                y1={media.yAxis!.max - shape.points[0][1]}
                x2={shape.points[1][0]}
                y2={media.yAxis!.max - shape.points[1][1]}
                stroke="black"
              />
            );
          }
          if (shape.type === "polygon") {
            const points = shape.points
              .map(([x, y]) => `${x},${media.yAxis!.max - y}`)
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
