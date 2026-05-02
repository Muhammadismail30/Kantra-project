/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kantra-dark': '#1A1A24',
        'kantra-purple': '#7B61FF',
        'kantra-bg': '#0a0a0c',
      },
    },
  },
  plugins: [],
}