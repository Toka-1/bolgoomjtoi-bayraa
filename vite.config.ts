import { defineConfig } from 'vite';
import { voiceRecorder } from './tools/voice-server.mjs';

// base './' keeps the build working from any sub-path (GitHub Pages, a plain folder).
// voiceRecorder() only runs on the dev server: record.html saves clips into public/voice.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
  plugins: [voiceRecorder()],
});
