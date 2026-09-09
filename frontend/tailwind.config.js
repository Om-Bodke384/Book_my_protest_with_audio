/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: {
          50: "#fff5f2",
          100: "#ffe6de",
          400: "#ff7a52",
          500: "#f4552b",
          600: "#dc3c14",
          700: "#b62d0c",
        },
        ink: {
          900: "#141315",
          800: "#211f22",
        },
      },
      fontFamily: {
        display: ["Archivo Black", "Arial Black", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grad-white": "linear-gradient(160deg, #ffffff 0%, #fdf6f3 45%, #fbe9e2 100%)",
        "grad-card": "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,244,240,0.7) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(220, 60, 20, 0.08)",
      },
    },
  },
  plugins: [],
};
