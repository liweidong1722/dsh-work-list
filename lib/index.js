import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
//#region src/index.ts
const name = "dsh-work-list";
const inject = ["webServer"];
const RPC_PATH = "/work-list/rpc";
const DATA_FILE = join(homedir(), ".dsh", "work-list.json");
async function readJsonBody(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	if (!chunks.length) return {};
	try {
		const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	} catch {
		return {};
	}
}
async function loadState() {
	try {
		return await readFile(DATA_FILE, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}
function revisionOf(raw) {
	if (raw === null) return null;
	return createHash("sha256").update(raw).digest("hex");
}
async function saveState(state) {
	if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("invalid work-list state");
	await mkdir(dirname(DATA_FILE), { recursive: true });
	const raw = JSON.stringify(state, null, 2) + "\n";
	const temp = DATA_FILE + ".tmp-" + process.pid;
	await writeFile(temp, raw, {
		encoding: "utf8",
		mode: 384
	});
	await rename(temp, DATA_FILE);
	return {
		raw,
		revision: revisionOf(raw)
	};
}
function apply(ctx) {
	const web = ctx.get("webServer");
	if (!web) return;
	ctx.effect(() => web.register({
		kind: "exact",
		path: RPC_PATH,
		handler: async (req, res) => {
			res.setHeader("content-type", "application/json; charset=utf-8");
			if (req.method !== "POST") {
				res.statusCode = 405;
				res.end(JSON.stringify({
					ok: false,
					error: "method not allowed"
				}));
				return;
			}
			try {
				const input = await readJsonBody(req);
				if (input.method === "load") {
					const raw = await loadState();
					res.statusCode = 200;
					res.end(JSON.stringify({
						ok: true,
						raw,
						revision: revisionOf(raw),
						path: "~/.dsh/work-list.json"
					}));
					return;
				}
				if (input.method === "save") {
					const args = input.args ?? {};
					const currentRaw = await loadState();
					const currentRevision = revisionOf(currentRaw);
					const hasBaseRevision = Object.prototype.hasOwnProperty.call(args, "baseRevision");
					const baseRevision = args.baseRevision === null ? null : typeof args.baseRevision === "string" ? args.baseRevision : void 0;
					if (!hasBaseRevision || baseRevision !== currentRevision) {
						res.statusCode = 409;
						res.end(JSON.stringify({
							ok: false,
							conflict: true,
							error: "work-list changed outside this page",
							raw: currentRaw,
							revision: currentRevision,
							path: "~/.dsh/work-list.json"
						}));
						return;
					}
					const saved = await saveState(args.state);
					res.statusCode = 200;
					res.end(JSON.stringify({
						ok: true,
						revision: saved.revision,
						path: "~/.dsh/work-list.json"
					}));
					return;
				}
				res.statusCode = 400;
				res.end(JSON.stringify({
					ok: false,
					error: "unknown method"
				}));
			} catch (error) {
				res.statusCode = 500;
				res.end(JSON.stringify({
					ok: false,
					error: String(error)
				}));
			}
		}
	}), "work-list: rpc");
}
//#endregion
export { apply, inject, name };
