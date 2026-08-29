/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./server/**/*.{vue,js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        // ACGSQ 风格色板
        acg: {
          bg: '#f2f4f7',          // 页面主背景浅灰
          card: '#ffffff',         // 卡片白色
          glass: 'rgba(245,245,245,0.75)', // 毛玻璃
          accent: '#dd3333',       // 红色强调（搜索按钮）
          blue: '#2997f7',
          green: '#19aa2c',
          orange: '#ff6f06',
          text: '#374151',
          subtext: '#6b7280',
          border: '#e5e7eb',
          dark: '#1b1d1f',         // 公告栏深灰
        },
        // 保留一些二次元粉紫色用于点缀
        sakura: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 20px rgba(0,0,0,0.15)',
        'card-sm': '0 2px 6px rgba(0,0,0,0.08)',
        'glass': '0 5px 20px rgba(0,0,0,0.1)',
        'hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
