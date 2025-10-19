export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
  extend: {
    colors: {
      background: "var(--background)",
      foreground: "var(--foreground)",
      secondary: "var(--secondary)",
      border: "var(--border)",
      input: "var(--input)",
    },
  },
  },
  plugins: [],
}