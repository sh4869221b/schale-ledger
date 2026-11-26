import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/worker.mjs',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  charset: 'utf8',
  minify: true,
  target: 'es2024',
  loader: { '.css': 'text', '.client': 'text' },
  logLevel: 'info',
});
