/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactCompiler is disabled — babel-plugin-react-compiler conflicts with
  // Turbopack's module adapter in Next.js 16 and causes the random
  // "adapterFn is not a function" TypeError at runtime.
  // Re-enable only after https://github.com/vercel/next.js/issues is resolved.
};

export default nextConfig;
