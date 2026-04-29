import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ĐÂY LÀ ĐOẠN LỆNH CỨU MẠNG: Cấm Vite đụng vào thư viện lỗi
  optimizeDeps: {
    exclude: ['lightningcss']
  }
})