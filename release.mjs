
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const v = process.argv[2];
if (!v) {
	const currentVersion = JSON.parse(readFileSync("package.json", "utf8")).version;
	console.error(`Current version: ${currentVersion}\nUsage: npm run release <version>`);
	process.exit(1);
}

function run(cmd, opts = {}) {
	return execSync(cmd, { stdio: "inherit", ...opts });
}
function runCapture(cmd) {
	return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}

function fileAddIfExists(path) {
	if (existsSync(path)) run(`git add ${path}`);
}

// --- Preflight: git sanity ---
try { run("git rev-parse --is-inside-work-tree"); } catch {
	console.error("Not a git repo."); process.exit(1);
}

run("git fetch --tags --prune");
let upstream = "";
try { upstream = runCapture("git rev-parse --abbrev-ref --symbolic-full-name @{u}"); }
catch { console.warn("No upstream configured; skipping remote ahead/behind check."); }

if (upstream) {
	const aheadBehind = runCapture(`git rev-list --left-right --count HEAD...${upstream}`).split(/\s+/);
	const [ahead, behind] = aheadBehind.map(n => parseInt(n, 10) || 0);
	if (behind > 0) {
		console.error(`Your branch is behind ${upstream} by ${behind} commit(s). Pull/merge first.`);
		process.exit(1);
	}
}

const status = runCapture("git status --porcelain");
if (status) {
	console.error("Working tree not clean. Commit or stash changes before releasing.");
	process.exit(1);
}

// --- 1) bump package.json ---
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.version = v;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

// --- 2) sync manifest.json ---
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
manifest.version = v;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t") + "\n");

// --- 3) update versions.json (optional) ---
if (existsSync("versions.json")) {
	const versions = JSON.parse(readFileSync("versions.json", "utf8"));
	versions[v] = manifest.minAppVersion;
	writeFileSync("versions.json", JSON.stringify(versions, null, "\t") + "\n");
}

// --- 4) build ---
run("node esbuild.config.mjs production");

// --- 5) zip payload ---
const includes = ["-i", "main.js", "-i", "manifest.json"];
if (existsSync("styles.css")) includes.push("-i", "styles.css");
run(`npx cross-zip ./ ./z2k-plugin-templates.zip ${includes.join(" ")}`);

// --- 6) commit, tag, push ---
run("git add package.json manifest.json");
fileAddIfExists("versions.json");
fileAddIfExists("z2k-plugin-templates.zip");
run(`git commit -m "release: v${v}"`);
run(`git tag v${v}`);
run("git push");
run("git push --tags");

console.log(`\n✅ Released v${v}`);
