import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // যদি `next/image` ব্যবহার করে থাকেন, তাহলে নিচের অপশনটিও যুক্ত করে দিতে পারেন:
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
