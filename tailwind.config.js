/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dasawisma: {
          DEFAULT: '#0F766E', // Hijau utama Dasawisma 
          light: '#ECFDF5',   // Hijau muda untuk background sidebar
          dark: '#115E59',    // Hijau gelap untuk efek hover
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'], // Menambahkan font Inter dan Poppins
      }
    },
  },
  plugins: [],
}