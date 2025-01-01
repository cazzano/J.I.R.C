/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#15803d",    // green-700
          secondary: "#1f2937",  // gray-800
          accent: "#0f766e",     // teal-700
          neutral: "#374151",    // gray-700
          "base-100": "#f9fafb", // gray-50
        },
      },
    ],
  },
}
