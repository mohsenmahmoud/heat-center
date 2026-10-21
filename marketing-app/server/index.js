import { capabilities, config } from './config.js';
import { createApp } from './app.js';

if (!config.isLoopback) {
  console.error(`Refusing to start: HOST=${config.host} would expose the app to your network. This app is localhost-only; use HOST=127.0.0.1.`);
  process.exit(1);
}

const app = createApp();
app.listen(config.port, config.host, () => {
  const caps = capabilities();
  console.log(`\n  Marketing Studio → http://localhost:${config.port}\n`);
  console.log(`  Writer:  ${caps.writer ? `${caps.writer} (${caps.model})` : 'NOT CONFIGURED: add ANTHROPIC_API_KEY or GEMINI_API_KEY to .env (or MOCK_AI=true for demo mode)'}`);
  console.log(`  Stock:   ${caps.stock.join(', ') || 'off'}   Images: ${caps.images || 'off'}   Voice: ${caps.tts || 'off'}`);
  console.log(`  Login:   ${caps.authRequired ? 'password required' : 'no password (set APP_PASSWORD in .env to require one)'}\n`);
});
