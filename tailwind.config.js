/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          bg: {
            light: '#ffffff',
            dark: '#191919',
          },
          sidebar: {
            light: '#fbfbfa',
            dark: '#202020',
          },
          hover: {
            light: '#efeee9',
            dark: '#2c2c2c',
          },
          border: {
            light: '#e9e9e7',
            dark: '#2f2f2f',
          },
          text: {
            primary: {
              light: '#37352f',
              dark: '#d4d4d4',
            },
            secondary: {
              light: '#787774',
              dark: '#9b9b9b',
            }
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
