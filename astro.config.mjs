import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

export default defineConfig({
  integrations: [svelte()],
  output: "static",
  site: "https://SudevKiyadaTR.github.io",
  base: "/graphics-2026_playground-fifa-2026/",
});
