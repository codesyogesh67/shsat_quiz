// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/(app|src|pages)/**": ["./src/lib/database/**"],
      "app/api/questions/route": ["./src/lib/database/**"],
    },
  },
};

export default nextConfig; // <-- ensures the file is a module
