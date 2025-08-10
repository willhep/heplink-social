export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter Tight", "sans-serif"],
      },
      colors: {
        heplink: { red: "#ff0000", light: "#ff6666" }
      }
    },
  },
  plugins: [],
}
