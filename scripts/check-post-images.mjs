import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fromHtml } from "hast-util-from-html";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const parser = unified().use(remarkParse);

function contentFiles(directory) {
	return readdirSync(directory, { withFileTypes: true })
		.sort((a, b) => a.name.localeCompare(b.name))
		.flatMap((entry) => {
			const filename = path.join(directory, entry.name);
			if (entry.isDirectory()) return contentFiles(filename);
			return entry.isFile() && /\.mdx?$/i.test(entry.name) ? [filename] : [];
		});
}

function imageReferences(source) {
	// Keep source positions while excluding YAML frontmatter from Markdown parsing.
	const markdown = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, (match) =>
		match.replace(/[^\r\n]/g, " "),
	);
	const tree = parser.parse(markdown);
	const definitions = new Map();
	const images = [];
	visit(tree, "definition", (node) => {
		if (!definitions.has(node.identifier)) definitions.set(node.identifier, node.url);
	});
	visit(tree, (node) => {
		const line = node.position?.start.line ?? 1;
		if (node.type === "image") images.push({ url: node.url, line });
		if (node.type === "imageReference" && definitions.has(node.identifier)) {
			images.push({ url: definitions.get(node.identifier), line });
		}
		if (node.type === "html") {
			visit(fromHtml(node.value, { fragment: true }), "element", (element) => {
				if (element.tagName === "img" && typeof element.properties.src === "string") {
					images.push({
						url: element.properties.src,
						line: line + (element.position?.start.line ?? 1) - 1,
					});
				}
			});
		}
	});
	return images;
}

function localImagePath(root, article, url) {
	// Remote URLs, data URLs, and fragment-only references require no local file.
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return null;
	const pathname = url.split(/[?#]/, 1)[0];
	let decoded;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		decoded = pathname;
	}
	if (decoded.startsWith("/")) return path.join(root, "public", decoded);
	if (decoded.startsWith("@/")) return path.join(root, "src", decoded.slice(2));
	return path.resolve(path.dirname(article), decoded);
}

export function checkPostImages(root) {
	const files = contentFiles(path.join(root, "src/content"));
	const missing = [];
	for (const article of files) {
		for (const image of imageReferences(readFileSync(article, "utf8"))) {
			const resolved = localImagePath(root, article, image.url);
			if (resolved === null) continue;
			let exists = false;
			try {
				exists = statSync(resolved).isFile();
			} catch {
				// Missing or inaccessible files are both unusable by the build.
			}
			if (!exists) {
				missing.push({ article: path.relative(root, article), ...image, resolved });
			}
		}
	}
	return { files: files.length, missing };
}

function escapeAnnotation(value) {
	return String(value)
		.replace(/%/g, "%25")
		.replace(/\r/g, "%0D")
		.replace(/\n/g, "%0A")
		.replace(/,/g, "%2C")
		.replace(/:/g, "%3A");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const { files, missing } = checkPostImages(process.cwd());
	for (const image of missing) {
		const message = `Missing local image "${image.url}" (resolved to ${image.resolved}). Upload the image or replace its path with a public image URL.`;
		console.error(`${image.article}:${image.line}: ${message}`);
		if (process.env.GITHUB_ACTIONS === "true") {
			console.error(
				`::error file=${escapeAnnotation(image.article)},line=${image.line},title=Missing local image::${escapeAnnotation(message)}`,
			);
		}
	}
	if (missing.length) {
		console.error(`Image path check failed: ${missing.length} missing local image(s).`);
		process.exitCode = 1;
	} else {
		console.log(`Image path check passed: ${files} content files checked.`);
	}
}
