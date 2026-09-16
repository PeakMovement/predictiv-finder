import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070d",
        marble: "#f4f2ee",
        coldblue: "#3fa9f5",
      },
    },
  },
  plugins: [],
};
export default config;
