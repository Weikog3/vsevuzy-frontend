import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vsevuzy-frontend', // <-- Укажите точное название вашего репозитория со слешами с двух сторон!
})