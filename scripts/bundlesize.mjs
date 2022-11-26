import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { execa } from "execa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToReadme = path.join(__dirname, "../README.md");

const readme = await readFile(pathToReadme, "utf-8");

const match = /<!-- bundle -->(?:.|\n|\r)*?<!-- bundlestop -->/.exec(readme);

const { stdout } = await execa("yarn", ["bundlesize"]);

function report() {
	return `<!-- bundle -->

\`\`\`shell

${stdout}
\`\`\`

<!-- bundlestop -->`;
}

if (match) {
	const update = readme.replace(match[0], report());
	await writeFile(pathToReadme, update);
}
