/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // เพิ่มเส้นทางของไฟล์ที่ใช้ Tailwind
  ],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'sans-serif'],  // เปลี่ยนฟอนต์เป็น Inter
    },
  },
  plugins: [],
}
