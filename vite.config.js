import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',            // Dòng này giúp file .js hiểu được code React
    include: /src\/.*\.js$/,  
    exclude: [],
  },
})