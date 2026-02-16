/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d10",
        steel: "#151a21",
        ember: "#d97706",
        haze: "#8ea3b0"
      }
    }
  },
  plugins: []
};
