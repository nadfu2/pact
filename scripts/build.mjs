// Builds Tailwind CSS, embeds it into App.tsx (ROAM_CSS), bundles with esbuild, copies public/ to dist/.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import * as esbuild from 'esbuild';
const run = (c) => execSync(c, { stdio: 'inherit' });
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/assets', { recursive: true });
run('npx tailwindcss -c tailwind.config.js -i src/in.css -o dist/assets/app.css --minify');
const css = readFileSync('dist/assets/app.css', 'utf8');
const src = readFileSync('src/App.tsx', 'utf8');
writeFileSync('src/App.tsx', src.replace(/^const ROAM_CSS = .*;$/m, () => 'const ROAM_CSS = ' + JSON.stringify(css) + ';'));
const opts = { entryPoints: ['src/main.jsx'], bundle: true, minify: true, loader: { '.tsx': 'tsx', '.jsx': 'jsx' }, define: { 'process.env.NODE_ENV': '"production"' }, target: 'es2019', outfile: 'dist/assets/app.js' };
if (process.argv.includes('--serve')) {
  const ctx = await esbuild.context(opts); await ctx.watch();
  cpSync('public', 'dist', { recursive: true });
  const { port } = await ctx.serve({ servedir: 'dist', port: 8765 });
  console.log('http://localhost:' + port);
} else {
  await esbuild.build(opts);
  cpSync('public', 'dist', { recursive: true });
  console.log('Built to dist/');
}
