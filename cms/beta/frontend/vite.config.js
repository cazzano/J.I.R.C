import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_USERNAME': JSON.stringify(env.VITE_USERNAME),
      'import.meta.env.VITE_PASSWORD': JSON.stringify(env.VITE_PASSWORD)
    }
  };
});
