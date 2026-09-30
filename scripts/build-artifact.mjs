// Turns the single-file build into page content for hosting: the host wraps
// the page in its own <!doctype>/<head>/<body>, so we keep only the title,
// styles, scripts and body markup.
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('dist-artifact/index.html', 'utf8');
const pick = (re) => [...src.matchAll(re)].map((m) => m[0]).join('\n');

const title = pick(/<title>[\s\S]*?<\/title>/g);
const meta = pick(/<meta name="(?:robots|description)"[^>]*>/g);
const styles = pick(/<style[\s\S]*?<\/style>/g);
const scripts = pick(/<script[\s\S]*?<\/script>/g);
const body = src.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '').trim();

const out = [title, meta, styles, body, scripts].join('\n');
writeFileSync('dist-artifact/carrier-delay-walkthrough.html', out);
console.log(`dist-artifact/carrier-delay-walkthrough.html ${(out.length / 1024).toFixed(0)} KB`);
