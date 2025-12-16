import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // 디버깅을 위해 터미널에 키 로딩 상태 출력 (보안을 위해 앞 5자리만 출력)
  if (env.API_KEY) {
    console.log(`✅ API_KEY loaded successfully: ${env.API_KEY.substring(0, 5)}...`);
  } else {
    console.log("⚠️ API_KEY not found in .env file.");
  }

  return {
    plugins: [react()],
    define: {
      // process.env.API_KEY를 코드에서 사용할 수 있게 문자열로 치환
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});