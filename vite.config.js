import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     port: 5174,
//     // host: true, // allows external access (useful on EC2/VM)
//   },
// });

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      allowedHosts: ["api.twentytwohealth.com"], // ✅ important
      // host: true,
    },
    // Use environment variable to determine base path
    base: env.VITE_ENVIRONMENT === "production" ? "/" : "/",
  };
});
