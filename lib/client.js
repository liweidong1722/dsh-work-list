window.__ModuleLoader__.load({
	id: "dsh-work-list",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/model.mjs
		const STORAGE_KEY = "dsh-work-list:v1";
		const DEFAULT_CATEGORIES = [
			{
				id: "inbox",
				name: "日常",
				builtIn: true,
				tone: "#8190a5"
			},
			{
				id: "work",
				name: "工作",
				builtIn: true,
				tone: "#8190a5"
			},
			{
				id: "study",
				name: "学习",
				builtIn: true,
				tone: "#8190a5"
			},
			{
				id: "life",
				name: "生活",
				builtIn: true,
				tone: "#8190a5"
			}
		];
		const FONT_FAMILIES = {
			system: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Microsoft YaHei\", sans-serif",
			rounded: "\"Arial Rounded MT Bold\", \"Microsoft YaHei\", sans-serif",
			serif: "Georgia, \"Songti SC\", \"SimSun\", serif"
		};
		const DEFAULT_FONT_SIZE = 16;
		const MIN_FONT_SIZE = 12;
		const MAX_FONT_SIZE = 24;
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function makeId(prefix = "item") {
			return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;
		}
		function createInitialState() {
			return {
				version: 1,
				title: "工作清单",
				categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
				tasks: [],
				fontSize: DEFAULT_FONT_SIZE,
				fontFamily: "system"
			};
		}
		function decodeState(raw) {
			if (typeof raw !== "string" || raw.length === 0) return createInitialState();
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return createInitialState();
			}
			if (!isRecord(parsed) || parsed.version !== 1) return createInitialState();
			const savedCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
			const categories = DEFAULT_CATEGORIES.map((defaultCategory) => {
				const saved = savedCategories.find((category) => isRecord(category) && category.id === defaultCategory.id);
				return {
					...defaultCategory,
					name: typeof saved?.name === "string" && saved.name.trim() ? saved.name.trim().slice(0, 32) : defaultCategory.name
				};
			});
			const seenIds = new Set(categories.map((category) => category.id));
			for (const category of savedCategories) {
				if (!isRecord(category) || typeof category.id !== "string" || typeof category.name !== "string") continue;
				const id = category.id.trim();
				const name = category.name.trim().slice(0, 32);
				if (!id || !name || seenIds.has(id)) continue;
				seenIds.add(id);
				categories.push({
					id,
					name,
					builtIn: false,
					tone: "#8190a5"
				});
			}
			const categoryIds = new Set(categories.map((category) => category.id));
			const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : []).flatMap((task) => {
				if (!isRecord(task) || typeof task.title !== "string" || !task.title.trim()) return [];
				return [{
					id: typeof task.id === "string" && task.id ? task.id : makeId("task"),
					title: task.title.trim().slice(0, 4e3),
					html: typeof task.html === "string" ? task.html.slice(0, 2e4) : "",
					categoryId: typeof task.categoryId === "string" && categoryIds.has(task.categoryId) ? task.categoryId : "inbox",
					completed: task.completed === true,
					createdAt: Number.isFinite(task.createdAt) && Number.isFinite(new Date(task.createdAt).getTime()) ? task.createdAt : Date.now()
				}];
			});
			const fontFamily = Object.hasOwn(FONT_FAMILIES, parsed.fontFamily) ? parsed.fontFamily : "system";
			const fontSize = Number.isFinite(parsed.fontSize) ? Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.round(parsed.fontSize))) : DEFAULT_FONT_SIZE;
			return {
				version: 1,
				title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : "工作清单",
				categories,
				tasks,
				fontSize,
				fontFamily
			};
		}
		function addTask(state, title, { categoryId = "inbox", id = makeId("task"), createdAt = Date.now(), html = "" } = {}) {
			const text = typeof title === "string" ? title.trim().slice(0, 4e3) : "";
			if (!text) return state;
			const safeCategoryId = state.categories.some((category) => category.id === categoryId) ? categoryId : "inbox";
			const safeHtml = typeof html === "string" ? html.slice(0, 2e4) : "";
			return {
				...state,
				tasks: [...state.tasks, {
					id,
					title: text,
					html: safeHtml,
					categoryId: safeCategoryId,
					completed: false,
					createdAt
				}]
			};
		}
		function updateTaskContent(state, id, title, html = "") {
			const text = typeof title === "string" ? title.trim().slice(0, 4e3) : "";
			const safeHtml = typeof html === "string" ? html.slice(0, 2e4) : "";
			if (!text || !state.tasks.some((task) => task.id === id)) return state;
			return {
				...state,
				tasks: state.tasks.map((task) => task.id === id ? {
					...task,
					title: text,
					html: safeHtml
				} : task)
			};
		}
		function toggleTask(state, id) {
			if (!state.tasks.some((task) => task.id === id)) return state;
			return {
				...state,
				tasks: state.tasks.map((task) => task.id === id ? {
					...task,
					completed: !task.completed
				} : task)
			};
		}
		function removeTask(state, id) {
			return {
				...state,
				tasks: state.tasks.filter((task) => task.id !== id)
			};
		}
		function clearCompleted(state) {
			const tasks = state.tasks.filter((task) => !task.completed);
			return tasks.length === state.tasks.length ? state : {
				...state,
				tasks
			};
		}
		function addCategory(state, name, { id = makeId("category") } = {}) {
			const cleanName = typeof name === "string" ? name.trim().slice(0, 32) : "";
			if (!cleanName || state.categories.some((category) => category.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) return state;
			return {
				...state,
				categories: [...state.categories, {
					id,
					name: cleanName,
					builtIn: false,
					tone: "#8190a5"
				}]
			};
		}
		function removeCategory(state, id) {
			const category = state.categories.find((candidate) => candidate.id === id);
			if (!category || category.builtIn) return state;
			return {
				...state,
				categories: state.categories.filter((candidate) => candidate.id !== id),
				tasks: state.tasks.map((task) => task.categoryId === id ? {
					...task,
					categoryId: "inbox"
				} : task)
			};
		}
		function renameTitle(state, title) {
			const cleanTitle = typeof title === "string" ? title.trim().slice(0, 80) : "";
			return cleanTitle ? {
				...state,
				title: cleanTitle
			} : state;
		}
		function setTypography(state, { fontSize = state.fontSize, fontFamily = state.fontFamily } = {}) {
			const safeSize = Number.isFinite(fontSize) ? Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.round(fontSize))) : state.fontSize;
			const safeFamily = Object.hasOwn(FONT_FAMILIES, fontFamily) ? fontFamily : state.fontFamily;
			if (safeSize === state.fontSize && safeFamily === state.fontFamily) return state;
			return {
				...state,
				fontSize: safeSize,
				fontFamily: safeFamily
			};
		}
		//#endregion
		//#region src/client/rpc.ts
		const RPC_PATH = "/work-list/rpc";
		async function post(body) {
			return fetch(RPC_PATH, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
		}
		async function loadWorkList() {
			const response = await post({
				method: "load",
				args: {}
			});
			const result = await response.json();
			if (!response.ok || result.ok === false) throw new Error(result.error || "work-list load failed");
			return result;
		}
		async function saveWorkList(state, baseRevision) {
			const response = await post({
				method: "save",
				args: {
					state,
					baseRevision
				}
			});
			const result = await response.json();
			if (response.status === 409 && result.conflict) return result;
			if (!response.ok || result.ok === false) throw new Error(result.error || "work-list save failed");
			return result;
		}
		//#endregion
		//#region src/client/richText.ts
		function escapeHtml(text) {
			return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
		}
		function plainTextToHtml(text) {
			return escapeHtml(text).replace(/\n/g, "<br>");
		}
		const RICH_TAGS = /* @__PURE__ */ new Set([
			"P",
			"DIV",
			"BR",
			"STRONG",
			"B",
			"EM",
			"I",
			"U",
			"S",
			"STRIKE",
			"UL",
			"OL",
			"LI",
			"BLOCKQUOTE",
			"H1",
			"H2",
			"H3",
			"FONT",
			"SPAN",
			"HR"
		]);
		function sanitizeRichHtml(raw) {
			if (typeof document === "undefined") return "";
			const template = document.createElement("template");
			template.innerHTML = raw;
			const scrub = (root) => {
				for (const child of Array.from(root.childNodes)) {
					if (child.nodeType === Node.COMMENT_NODE) {
						child.remove();
						continue;
					}
					if (child.nodeType !== Node.ELEMENT_NODE) continue;
					const element = child;
					const tag = element.tagName;
					if (!RICH_TAGS.has(tag)) {
						const fragment = document.createDocumentFragment();
						while (element.firstChild) fragment.appendChild(element.firstChild);
						element.replaceWith(fragment);
						scrub(root);
						continue;
					}
					for (const attribute of Array.from(element.attributes)) {
						const name = attribute.name.toLowerCase();
						const value = attribute.value.trim();
						if (tag === "FONT" && name === "color" && /^#?[0-9a-f]{3,8}$/i.test(value)) continue;
						if (tag === "SPAN" && name === "style") {
							const probe = document.createElement("span");
							probe.setAttribute("style", value);
							const safe = [];
							const color = probe.style.getPropertyValue("color");
							const background = probe.style.getPropertyValue("background-color");
							if (color) safe.push(`color:${color}`);
							if (background) safe.push(`background-color:${background}`);
							if (safe.length) element.setAttribute("style", safe.join(";"));
							else element.removeAttribute("style");
							continue;
						}
						element.removeAttribute(attribute.name);
					}
					scrub(element);
				}
			};
			scrub(template.content);
			return template.innerHTML;
		}
		function htmlToPlainText(html) {
			if (typeof document === "undefined") return "";
			const holder = document.createElement("div");
			holder.innerHTML = sanitizeRichHtml(html);
			return (holder.innerText || holder.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
		}
		//#endregion
		//#region src/client/styles.ts
		const WORK_LIST_STYLES = `
.wl-page{--wl-bg:var(--dsw-alias-bg-base,#f7f8fa);--wl-surface:var(--dsw-alias-bg-layer-1,#fff);--wl-surface-2:var(--dsw-alias-bg-layer-2,#fff);--wl-text:var(--dsw-alias-label-primary,#252525);--wl-text-2:var(--dsw-alias-label-secondary,#61666d);--wl-muted:var(--dsw-alias-label-tertiary,#989da5);--wl-border:var(--dsw-alias-border-l1,#e8e9eb);--wl-border-2:var(--dsw-alias-border-l2,#dde0e4);--wl-brand:var(--dsw-alias-brand-primary,#4e7fe8);--wl-hover:var(--dsw-alias-interactive-bg-hover,#f4f5f7);box-sizing:border-box;min-height:100%;height:100%;overflow:auto;padding:clamp(16px,2.6vw,34px);color:var(--wl-text);background:var(--wl-bg);font-family:var(--wl-font-family);font-size:var(--wl-font-size)}
.wl-page *{box-sizing:border-box}
.wl-frame{max-width:1080px;margin:0 auto}
.wl-top{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:2px 0 26px}
.wl-eyebrow{display:none}
.wl-title{display:flex;align-items:center;gap:9px;margin:0;color:var(--wl-text);font-size:clamp(24px,2.6vw,30px);font-weight:650;letter-spacing:-.025em}
.wl-title-edit{border:0;background:transparent;color:var(--wl-muted);padding:5px;cursor:pointer;border-radius:8px;font-size:16px}
.wl-title-edit:hover{background:var(--wl-hover);color:var(--wl-text-2)}
.wl-title-input{width:min(420px,65vw);padding:8px 10px;border:1px solid var(--wl-border-2);border-radius:9px;font:inherit;font-size:26px;color:var(--wl-text);background:var(--wl-surface);outline:none}
.wl-subtitle{margin:8px 0 0;color:var(--wl-muted);font-size:13px}
.wl-typography{display:flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid var(--wl-border);border-radius:12px;background:var(--wl-surface);color:var(--wl-text-2);box-shadow:0 3px 12px rgba(39,52,80,.025)}
.wl-typography-label{font-size:12px;color:var(--wl-muted)}
.wl-size-button{width:27px;height:27px;border:0;border-radius:7px;background:var(--wl-hover);color:var(--wl-text-2);font-size:17px;line-height:1;cursor:pointer}
.wl-size-button:hover:not(:disabled){background:color-mix(in srgb,var(--wl-brand) 9%,var(--wl-hover));color:var(--wl-text)}
.wl-size-button:disabled{opacity:.4;cursor:not-allowed}
.wl-size-value{min-width:36px;text-align:center;font-size:12px;color:var(--wl-text-2);font-variant-numeric:tabular-nums}
.wl-font-select{max-width:92px;border:0;border-left:1px solid var(--wl-border);padding:4px 2px 4px 8px;background:transparent;color:var(--wl-text-2);font-size:12px;outline:none}
.wl-add{display:flex;align-items:flex-start;gap:10px;margin-bottom:19px;padding:11px 12px 11px 15px;border:1px solid var(--wl-border);border-radius:14px;background:var(--wl-surface);box-shadow:0 5px 16px rgba(42,53,79,.03)}
.wl-add-mark{display:grid;place-items:center;width:26px;height:26px;flex:0 0 auto;border-radius:7px;background:color-mix(in srgb,var(--wl-brand) 11%,transparent);color:var(--wl-brand);font-size:21px;line-height:1}
.wl-add-input{flex:1;min-width:60px;min-height:38px;max-height:180px;padding:8px 0;border:0;outline:none;resize:none;overflow-y:auto;background:transparent;color:var(--wl-text);font:inherit;font-size:14px;line-height:1.55}
.wl-add-input::placeholder{color:var(--wl-muted)}
.wl-category-select{max-width:112px;margin-top:6px;border:0;background:transparent;color:var(--wl-muted);font-size:12px;outline:none}
.wl-add-submit{margin-top:3px;border:0;border-radius:8px;padding:8px 14px;background:var(--wl-brand);color:#fff;font-size:12px;font-weight:650;cursor:pointer;transition:transform .15s,filter .15s}
.wl-add-submit:hover:not(:disabled){filter:brightness(.94);transform:translateY(-1px)}
.wl-add-submit:disabled{opacity:.4;cursor:not-allowed}
.wl-layout{display:grid;grid-template-columns:194px minmax(0,1fr);gap:20px;align-items:start}
.wl-nav{padding:11px;border:1px solid var(--wl-border);border-radius:12px;background:var(--wl-surface)}
.wl-nav-label{padding:9px 10px 6px;color:var(--wl-muted);font-size:11px;font-weight:600;letter-spacing:.04em}
.wl-nav-button{display:flex;align-items:center;gap:10px;width:100%;min-height:38px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:var(--wl-text-2);text-align:left;font:inherit;font-size:13px;cursor:pointer}
.wl-nav-button:hover{background:var(--wl-hover);color:var(--wl-text-2)}
.wl-nav-button.is-active{background:color-mix(in srgb,var(--wl-brand) 11%,transparent);color:var(--wl-brand);font-weight:650}
.wl-nav-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--wl-text-2)}
.wl-nav-button.is-active .wl-nav-name{color:var(--wl-brand)}
.wl-nav-count{color:var(--wl-muted);font-size:11px;font-variant-numeric:tabular-nums}
.wl-nav-icon{display:grid;place-items:center;width:18px;height:18px;flex:0 0 auto;color:var(--wl-muted)}
.wl-nav-button.is-active .wl-nav-icon{color:var(--wl-brand)}
.wl-nav-item{display:flex;align-items:center;gap:2px}.wl-nav-item>.wl-nav-button{flex:1;min-width:0}
.wl-nav-delete{display:none;place-items:center;width:24px;height:28px;flex:0 0 auto;border:0;border-radius:7px;background:transparent;color:#aab1bd;font-size:16px;line-height:1;cursor:pointer}
.wl-nav-item:hover .wl-nav-delete,.wl-nav-delete:focus-visible{display:inline-flex}
.wl-nav-delete:hover{background:#fff0f0;color:#c35862}
.wl-nav-add{display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding:9px 10px;border:1px dashed var(--wl-border-2);border-radius:9px;background:transparent;color:var(--wl-muted);text-align:left;font:inherit;font-size:12px;cursor:pointer}
.wl-nav-add:hover{border-color:var(--wl-brand);color:var(--wl-brand);background:color-mix(in srgb,var(--wl-brand) 6%,transparent)}
.wl-category-form{display:flex;gap:5px;margin-top:7px}
.wl-category-input{width:100%;min-width:0;border:1px solid var(--wl-border-2);border-radius:8px;padding:7px 8px;outline:none;font:inherit;font-size:12px;background:var(--wl-surface);color:var(--wl-text)}
.wl-category-save{border:0;border-radius:8px;padding:0 9px;background:var(--wl-brand);color:#fff;cursor:pointer}
.wl-content{min-width:0;padding:20px 22px;border:1px solid var(--wl-border);border-radius:12px;background:var(--wl-surface);box-shadow:0 2px 8px rgba(32,42,58,.02)}
.wl-content-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:19px}
.wl-view-title{margin:0;color:var(--wl-text-2);font-size:13px;font-weight:650;letter-spacing:.02em}
.wl-filter{display:flex;align-items:center;gap:3px;padding:3px;border-radius:9px;background:var(--wl-hover)}
.wl-filter-button{padding:6px 10px;border:0;border-radius:7px;background:transparent;color:var(--wl-muted);font:inherit;font-size:11px;cursor:pointer}
.wl-filter-button.is-active{background:var(--wl-surface-2);color:var(--wl-brand);box-shadow:0 1px 4px rgba(30,42,70,.06)}
.wl-clear{border:0;background:transparent;color:#9aa3b1;font:inherit;font-size:11px;cursor:pointer}
.wl-clear:hover{color:#c35d68}
.wl-section{margin-top:20px}
.wl-section:first-child{margin-top:0}
.wl-section-head{display:flex;align-items:center;gap:9px;margin:0 0 9px;padding:0 1px 8px;border-bottom:1px solid var(--wl-border)}
.wl-section-title{margin:0;color:var(--wl-muted);font-size:12px;font-weight:650;letter-spacing:.04em}
.wl-section-count{color:var(--wl-muted);font-size:11px}
.wl-task-list{display:flex;flex-direction:column;gap:2px}
.wl-task{display:flex;align-items:flex-start;gap:11px;min-height:43px;padding:6px 8px;border-radius:9px;transition:background .15s}
.wl-task:hover{background:var(--wl-hover)}
.wl-check{appearance:none;display:grid;place-items:center;width:18px;height:18px;flex:0 0 auto;margin:6px 0 0;border:1.5px solid var(--wl-border-2);border-radius:3px;background:var(--wl-surface);cursor:pointer;transition:all .15s}
.wl-check:checked{border-color:var(--wl-brand);background:var(--wl-brand)}
.wl-check:checked::after{content:"";width:7px;height:4px;border:solid white;border-width:0 0 1.8px 1.8px;transform:rotate(-45deg) translate(1px,-1px)}
.wl-check:focus-visible{outline:3px solid rgba(104,124,243,.22);outline-offset:2px}
.wl-task-main{flex:1;min-width:0}.wl-task-title{min-width:0;padding:3px 2px;color:var(--wl-text);font-size:var(--wl-font-size);line-height:1.65;overflow-wrap:anywhere;cursor:text}.wl-task-title p,.wl-task-title div{margin:.15em 0}.wl-task-title ul,.wl-task-title ol{margin:.25em 0 .35em 1.45em;padding:0}.wl-task-title ul{list-style:disc}.wl-task-title ul ul{list-style:circle}.wl-task-title ul ul ul{list-style:square}.wl-task-title ol{list-style:decimal}.wl-task-title li{margin:.12em 0;padding-left:.12em}.wl-task-title blockquote{margin:.35em 0;padding-left:10px;border-left:3px solid var(--wl-border-2);color:var(--wl-muted)}.wl-task-title hr{margin:9px 0;border:0;border-top:1px dashed var(--wl-border-2)}.wl-task-edit{min-width:0;min-height:58px;max-height:360px;padding:9px 11px;border:1px solid var(--wl-border-2);border-radius:7px;outline:none;overflow-y:auto;background:var(--wl-surface);color:var(--wl-text);font:inherit;font-size:var(--wl-font-size);line-height:1.68;overflow-wrap:anywhere}.wl-task-edit:focus{border-color:var(--wl-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--wl-brand) 14%,transparent)}.wl-task-edit p,.wl-task-edit div{margin:.15em 0}.wl-task-edit ul,.wl-task-edit ol{margin:.25em 0 .35em 1.45em;padding:0}.wl-task-edit ul{list-style:disc}.wl-task-edit ul ul{list-style:circle}.wl-task-edit ul ul ul{list-style:square}.wl-task-edit ol{list-style:decimal}.wl-task-edit li{margin:.12em 0}.wl-task-edit blockquote{margin:.35em 0;padding-left:10px;border-left:3px solid var(--wl-border-2);color:var(--wl-muted)}.wl-task-edit hr{margin:9px 0;border:0;border-top:1px dashed var(--wl-border-2)}.wl-rich-toolbar{display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin:0 0 7px;padding:5px 6px;border:1px solid var(--wl-border);border-radius:9px;background:var(--wl-surface-2);box-shadow:0 5px 18px rgba(40,52,78,.06)}.wl-rich-button{position:relative;display:grid;place-items:center;min-width:29px;height:28px;padding:0 7px;border:0;border-radius:6px;background:transparent;color:var(--wl-text-2);font:inherit;font-size:13px;cursor:pointer}.wl-rich-button:hover{background:var(--wl-hover);color:var(--wl-text)}.wl-rich-button.is-text{min-width:44px}.wl-rich-button b{font-size:16px}.wl-rich-sep{width:1px;height:18px;margin:0 2px;background:var(--wl-border)}.wl-rich-hint{margin-left:auto;color:var(--wl-muted);font-size:10px;white-space:nowrap}.wl-rich-format{height:28px;padding:0 24px 0 8px;border:0;border-radius:6px;outline:none;background:transparent;color:var(--wl-text);font:inherit;font-size:12px;cursor:pointer}.wl-rich-format:hover{background:var(--wl-hover)}.wl-color-button{font-weight:600;line-height:1}.wl-color-line{position:absolute;left:7px;right:7px;bottom:4px;height:2px;border-radius:2px}.wl-color-line.is-default{background:var(--wl-text)}.wl-color-line.is-muted{background:#9a9a9a}.wl-color-line.is-red{background:#e34d59}.wl-color-line.is-blue{background:#4e7fe8}.wl-task-title h1,.wl-task-edit h1{margin:.3em 0 .2em;color:#f0c45a!important;font-size:1.38em;line-height:1.45}.wl-task-title h2,.wl-task-edit h2{margin:.28em 0 .18em;color:#f0c45a!important;font-size:1.22em;line-height:1.5}.wl-task-title h3,.wl-task-edit h3{margin:.24em 0 .15em;color:#f0c45a!important;font-size:1.1em;line-height:1.55}.wl-task-title h1 *,.wl-task-title h2 *,.wl-task-title h3 *,.wl-task-edit h1 *,.wl-task-edit h2 *,.wl-task-edit h3 *{color:#f0c45a!important}
.wl-task.is-complete .wl-task-title{color:var(--wl-muted);text-decoration:line-through;text-decoration-color:var(--wl-border-2)}
.wl-task-category{flex:0 0 auto;color:var(--wl-muted);font-size:10px}
.wl-task-date{flex:0 0 auto;color:var(--wl-muted);font-size:10px;font-variant-numeric:tabular-nums}
.wl-task-delete{display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:7px;background:transparent;color:#b5bcc8;font-size:17px;line-height:1;cursor:pointer;opacity:0}
.wl-task:hover .wl-task-delete,.wl-task-delete:focus-visible{opacity:1}
.wl-task-delete:hover{background:#fff0f0;color:#c65e68}
.wl-group-empty{padding:8px 10px;color:#b2bac5;font-size:12px}
.wl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:195px;padding:25px 15px;text-align:center;color:#98a2b1}
.wl-empty-icon{display:grid;place-items:center;width:46px;height:46px;margin-bottom:12px;border-radius:15px;background:#f0f2ff;color:#7788ec}
.wl-empty-title{margin:0 0 6px;color:#737f92;font-size:14px;font-weight:650}
.wl-empty-copy{max-width:320px;margin:0;color:#a0a9b7;font-size:12px;line-height:1.7}
.wl-foot{display:flex;justify-content:space-between;gap:10px;margin-top:16px;color:#aab1bc;font-size:10px}.wl-save-state{display:inline-flex;align-items:center;gap:5px}.wl-save-dot{width:6px;height:6px;border-radius:50%;background:#64b58a}.wl-save-state.is-saving .wl-save-dot{background:#c3a45f}.wl-save-state.is-fallback .wl-save-dot{background:#d17a7a}
.wl-page.is-dark{--wl-bg:var(--dsw-alias-bg-base,#17191d);--wl-surface:var(--dsw-alias-bg-layer-1,#202329);--wl-surface-2:var(--dsw-alias-bg-layer-2,#24272d);--wl-text:var(--dsw-alias-label-primary,#e8eaed);--wl-text-2:var(--dsw-alias-label-secondary,#c1c6cf);--wl-muted:var(--dsw-alias-label-tertiary,#858c98);--wl-border:var(--dsw-alias-border-l1,#30343d);--wl-border-2:var(--dsw-alias-border-l2,#3a404a);--wl-brand:var(--dsw-alias-brand-primary,#7ea2ff);--wl-hover:var(--dsw-alias-interactive-bg-hover,#292d34)}
.wl-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:760px){.wl-page{padding:18px}.wl-top{align-items:flex-start;flex-direction:column;margin-bottom:17px}.wl-typography{align-self:flex-start}.wl-layout{grid-template-columns:1fr;gap:12px}.wl-nav{display:flex;gap:5px;overflow:auto;padding:7px}.wl-nav-label,.wl-nav-add,.wl-category-form{display:none}.wl-nav-item{flex:0 0 auto}.wl-nav-delete{display:inline-flex}.wl-nav-button{width:auto;min-width:max-content;padding:0 10px}.wl-nav-count{margin-left:2px}.wl-content{padding:16px 13px}.wl-task-date{display:none}}
`;
		//#endregion
		//#region src/client/theme.ts
		function detectWorkListScheme() {
			if (typeof document === "undefined") return "light";
			if (document.documentElement.style.colorScheme !== "") return document.body.hasAttribute("data-ds-dark-theme") ? "dark" : "light";
			const attr = document.documentElement.getAttribute("data-theme") ?? document.body.getAttribute("data-theme");
			const value = String(attr ?? "").toLowerCase();
			if (value.includes("light") || value.includes("latte")) return "light";
			if (value.includes("dark") || value.includes("frappe") || value.includes("macchiato") || value.includes("mocha")) return "dark";
			return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		//#endregion
		//#region src/client/WorkListPanel.tsx
		const FILTERS = [
			{
				id: "active",
				label: "待完成"
			},
			{
				id: "completed",
				label: "已完成"
			},
			{
				id: "all",
				label: "全部"
			}
		];
		const FONT_LABELS = {
			system: "系统",
			rounded: "圆润",
			serif: "衬线"
		};
		function taskDate(value) {
			const date = new Date(value);
			if (!Number.isFinite(date.getTime())) return "";
			return new Intl.DateTimeFormat("zh-CN", {
				month: "numeric",
				day: "numeric"
			}).format(date);
		}
		function growTextarea(element) {
			element.style.height = "auto";
			element.style.height = `${Math.min(Math.max(element.scrollHeight, 38), 180)}px`;
		}
		function ListGlyph() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8.5 6.5h11M8.5 12h11M8.5 17.5h11",
					stroke: "currentColor",
					strokeWidth: "1.7",
					strokeLinecap: "round"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m3.5 6.5 1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 17.5l1.2 1.2 2-2.4",
					stroke: "currentColor",
					strokeWidth: "1.7",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})]
			});
		}
		function WorkListPanel() {
			const [state, setState] = (0, react.useState)(createInitialState);
			const [loaded, setLoaded] = (0, react.useState)(false);
			const [scheme, setScheme] = (0, react.useState)(detectWorkListScheme);
			const [saveStatus, setSaveStatus] = (0, react.useState)("loading");
			const [selectedCategory, setSelectedCategory] = (0, react.useState)("all");
			const [filter, setFilter] = (0, react.useState)("active");
			const [draft, setDraft] = (0, react.useState)("");
			const [draftCategory, setDraftCategory] = (0, react.useState)("inbox");
			const [categoryDraft, setCategoryDraft] = (0, react.useState)("");
			const [addingCategory, setAddingCategory] = (0, react.useState)(false);
			const [editingTitle, setEditingTitle] = (0, react.useState)(false);
			const [titleDraft, setTitleDraft] = (0, react.useState)("");
			const [editingTaskId, setEditingTaskId] = (0, react.useState)(null);
			const [editingTaskHtml, setEditingTaskHtml] = (0, react.useState)("");
			const editorRef = (0, react.useRef)(null);
			const editorShellRef = (0, react.useRef)(null);
			const selectionRef = (0, react.useRef)(null);
			const revisionRef = (0, react.useRef)(null);
			const historyRef = (0, react.useRef)([]);
			const historyIndexRef = (0, react.useRef)(-1);
			(0, react.useEffect)(() => {
				const sync = () => setScheme(detectWorkListScheme());
				sync();
				const bodyObserver = new MutationObserver(sync);
				const rootObserver = new MutationObserver(sync);
				bodyObserver.observe(document.body, {
					attributes: true,
					attributeFilter: ["data-ds-dark-theme", "data-theme"]
				});
				rootObserver.observe(document.documentElement, {
					attributes: true,
					attributeFilter: ["style", "data-theme"]
				});
				const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
				media?.addEventListener?.("change", sync);
				return () => {
					bodyObserver.disconnect();
					rootObserver.disconnect();
					media?.removeEventListener?.("change", sync);
				};
			}, []);
			(0, react.useEffect)(() => {
				let active = true;
				(async () => {
					let next = createInitialState();
					try {
						const result = await loadWorkList();
						if (!active) return;
						revisionRef.current = result.revision ?? null;
						if (typeof result.raw === "string" && result.raw.trim()) next = decodeState(result.raw);
						else {
							const cached = window.localStorage.getItem(STORAGE_KEY);
							next = decodeState(cached);
							if (cached) {
								const saved = await saveWorkList(next, revisionRef.current);
								if (saved.conflict) {
									revisionRef.current = saved.revision ?? null;
									next = decodeState(saved.raw ?? null);
								} else revisionRef.current = saved.revision ?? revisionRef.current;
							}
						}
						if (!active) return;
						setState(next);
						setSaveStatus("saved");
					} catch {
						try {
							next = decodeState(window.localStorage.getItem(STORAGE_KEY));
						} catch {
							next = createInitialState();
						}
						if (!active) return;
						setState(next);
						setSaveStatus("fallback");
					} finally {
						if (active) setLoaded(true);
					}
				})();
				return () => {
					active = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!loaded) return;
				setSaveStatus((current) => current === "fallback" ? current : "saving");
				const timer = window.setTimeout(() => {
					saveWorkList(state, revisionRef.current).then((result) => {
						if (result.conflict) {
							revisionRef.current = result.revision ?? null;
							const latest = decodeState(result.raw ?? null);
							setState(latest);
							try {
								window.localStorage.removeItem(STORAGE_KEY);
							} catch {}
							setSaveStatus("saved");
							return;
						}
						revisionRef.current = result.revision ?? revisionRef.current;
						try {
							window.localStorage.removeItem(STORAGE_KEY);
						} catch {}
						setSaveStatus("saved");
					}).catch(() => {
						try {
							window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
						} catch {}
						setSaveStatus("fallback");
					});
				}, 180);
				return () => window.clearTimeout(timer);
			}, [loaded, state]);
			(0, react.useEffect)(() => {
				if (!editingTaskId) return;
				const handlePointerDown = (event) => {
					const shell = editorShellRef.current;
					const target = event.target;
					if (!shell || !(target instanceof Node) || shell.contains(target)) return;
					finishTaskEdit();
				};
				document.addEventListener("pointerdown", handlePointerDown, true);
				return () => document.removeEventListener("pointerdown", handlePointerDown, true);
			}, [editingTaskId]);
			const counts = (0, react.useMemo)(() => {
				const result = {
					all: state.tasks.length,
					active: 0,
					completed: 0
				};
				for (const task of state.tasks) result[task.completed ? "completed" : "active"] += 1;
				return result;
			}, [state.tasks]);
			const visibleCategories = selectedCategory === "all" ? state.categories : state.categories.filter((category) => category.id === selectedCategory);
			const visibleTasks = state.tasks.filter((task) => {
				if (selectedCategory !== "all" && task.categoryId !== selectedCategory) return false;
				if (filter === "active") return !task.completed;
				if (filter === "completed") return task.completed;
				return true;
			});
			const hasAnyTask = visibleTasks.length > 0;
			const categoryName = (id) => state.categories.find((category) => category.id === id)?.name ?? "日常";
			const fontFamily = FONT_FAMILIES[state.fontFamily] ?? FONT_FAMILIES.system;
			function submitTask(event) {
				event.preventDefault();
				const categoryId = selectedCategory === "all" ? draftCategory : selectedCategory;
				setState((current) => addTask(current, draft, { categoryId }));
				setDraft("");
			}
			function submitCategory(event) {
				event.preventDefault();
				const id = makeId("category");
				const next = addCategory(state, categoryDraft, { id });
				if (next === state) return;
				setState(next);
				setSelectedCategory(id);
				setDraftCategory(id);
				setCategoryDraft("");
				setAddingCategory(false);
			}
			function saveTitle(event) {
				event.preventDefault();
				setState((current) => renameTitle(current, titleDraft));
				setEditingTitle(false);
			}
			function beginTaskEdit(id, title, html) {
				const initialHtml = sanitizeRichHtml(html?.trim() ? html : plainTextToHtml(title));
				selectionRef.current = null;
				historyRef.current = [initialHtml];
				historyIndexRef.current = 0;
				setEditingTaskId(id);
				setEditingTaskHtml(initialHtml);
			}
			function rememberRichSelection() {
				const editor = editorRef.current;
				const selection = window.getSelection();
				if (!editor || !selection || selection.rangeCount === 0) return;
				const range = selection.getRangeAt(0);
				const anchor = range.commonAncestorContainer;
				if (anchor === editor || editor.contains(anchor)) selectionRef.current = range.cloneRange();
			}
			function restoreRichSelection() {
				const editor = editorRef.current;
				if (!editor) return;
				editor.focus();
				const range = selectionRef.current;
				if (!range) return;
				const selection = window.getSelection();
				if (!selection) return;
				selection.removeAllRanges();
				selection.addRange(range);
			}
			function pushEditorHistory() {
				const editor = editorRef.current;
				if (!editor) return;
				const html = sanitizeRichHtml(editor.innerHTML);
				const history = historyRef.current;
				const index = historyIndexRef.current;
				if (history[index] === html) return;
				const next = history.slice(0, index + 1);
				next.push(html);
				if (next.length > 120) next.shift();
				historyRef.current = next;
				historyIndexRef.current = next.length - 1;
			}
			function placeCaretAtEnd() {
				const editor = editorRef.current;
				if (!editor) return;
				const range = document.createRange();
				range.selectNodeContents(editor);
				range.collapse(false);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
				selectionRef.current = range.cloneRange();
			}
			function applyHistoryStep(direction) {
				const nextIndex = historyIndexRef.current + direction;
				if (nextIndex < 0 || nextIndex >= historyRef.current.length) return;
				const editor = editorRef.current;
				if (!editor) return;
				historyIndexRef.current = nextIndex;
				const html = historyRef.current[nextIndex] ?? "";
				editor.innerHTML = html;
				setEditingTaskHtml(html);
				editor.focus();
				placeCaretAtEnd();
			}
			function syncRichDraft() {
				pushEditorHistory();
				rememberRichSelection();
			}
			function runRichCommand(command, value) {
				restoreRichSelection();
				try {
					document.execCommand(command, false, value);
				} catch {}
				pushEditorHistory();
				rememberRichSelection();
			}
			function finishTaskEdit() {
				if (!editingTaskId) return;
				const html = sanitizeRichHtml(editorRef.current?.innerHTML ?? editingTaskHtml);
				const text = htmlToPlainText(html);
				if (text && html !== editingTaskHtml) setState((current) => updateTaskContent(current, editingTaskId, text, html));
				setEditingTaskId(null);
				setEditingTaskHtml("");
				selectionRef.current = null;
				historyRef.current = [];
				historyIndexRef.current = -1;
			}
			function cancelTaskEdit() {
				setEditingTaskId(null);
				setEditingTaskHtml("");
				selectionRef.current = null;
				historyRef.current = [];
				historyIndexRef.current = -1;
			}
			function handleTaskEditKey(event) {
				const mod = event.ctrlKey || event.metaKey;
				if (mod && event.key.toLowerCase() === "z") {
					event.preventDefault();
					applyHistoryStep(event.shiftKey ? 1 : -1);
					return;
				}
				if (mod && event.key.toLowerCase() === "y") {
					event.preventDefault();
					applyHistoryStep(1);
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					cancelTaskEdit();
					return;
				}
				if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
					event.preventDefault();
					finishTaskEdit();
					return;
				}
				if (event.key === "Tab") {
					event.preventDefault();
					runRichCommand(event.shiftKey ? "outdent" : "indent");
				}
			}
			const rootStyle = {
				"--wl-font-size": `${state.fontSize}px`,
				"--wl-font-family": fontFamily
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: `wl-page is-${scheme}`,
				style: rootStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: WORK_LIST_STYLES }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "wl-frame",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "wl-top",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "wl-eyebrow",
									children: "MY NOTE · WORK LIST"
								}),
								editingTitle ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
									onSubmit: saveTitle,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										autoFocus: true,
										className: "wl-title-input",
										value: titleDraft,
										maxLength: 80,
										onChange: (event) => setTitleDraft(event.target.value),
										onBlur: () => {
											if (titleDraft.trim()) setState((current) => renameTitle(current, titleDraft));
											setEditingTitle(false);
										},
										onKeyDown: (event) => {
											if (event.key === "Escape") setEditingTitle(false);
										},
										"aria-label": "清单标题"
									})
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h1", {
									className: "wl-title",
									children: [state.title, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "wl-title-edit",
										type: "button",
										title: "编辑标题",
										"aria-label": "编辑标题",
										onClick: () => {
											setTitleDraft(state.title);
											setEditingTitle(true);
										},
										children: "✎"
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "wl-subtitle",
									children: "像记笔记一样整理工作，勾掉一项，就前进一步。"
								})
							] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "wl-typography",
								"aria-label": "文字设置",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "wl-typography-label",
										children: "字体"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "wl-size-button",
										type: "button",
										"aria-label": "缩小字号",
										disabled: state.fontSize <= 12,
										onClick: () => setState((current) => setTypography(current, { fontSize: current.fontSize - 1 })),
										children: "−"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("output", {
										className: "wl-size-value",
										"aria-live": "polite",
										children: [state.fontSize, "px"]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "wl-size-button",
										type: "button",
										"aria-label": "放大字号",
										disabled: state.fontSize >= 24,
										onClick: () => setState((current) => setTypography(current, { fontSize: current.fontSize + 1 })),
										children: "＋"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										className: "wl-sr-only",
										htmlFor: "wl-font-family",
										children: "字体样式"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										id: "wl-font-family",
										className: "wl-font-select",
										value: state.fontFamily,
										onChange: (event) => setState((current) => setTypography(current, { fontFamily: event.target.value })),
										children: Object.entries(FONT_LABELS).map(([id, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: id,
											children: label
										}, id))
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "wl-add",
							onSubmit: submitTask,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wl-add-mark",
									"aria-hidden": "true",
									children: "＋"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									className: "wl-sr-only",
									htmlFor: "wl-new-task",
									children: "添加一项"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									id: "wl-new-task",
									className: "wl-add-input",
									value: draft,
									rows: 1,
									maxLength: 4e3,
									placeholder: "记下要做的事 · Enter 换行 · Ctrl+Enter 添加",
									onChange: (event) => setDraft(event.target.value),
									onInput: (event) => growTextarea(event.currentTarget),
									onKeyDown: (event) => {
										if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
											event.preventDefault();
											event.currentTarget.form?.requestSubmit();
										}
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									className: "wl-category-select",
									"aria-label": "事项分类",
									value: selectedCategory === "all" ? draftCategory : selectedCategory,
									onChange: (event) => setDraftCategory(event.target.value),
									children: state.categories.map((category) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: category.id,
										children: category.name
									}, category.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "wl-add-submit",
									type: "submit",
									disabled: !draft.trim(),
									children: "添加"
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wl-layout",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
								className: "wl-nav",
								"aria-label": "清单分类",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "wl-nav-label",
										children: "NOTEBOOK"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										className: `wl-nav-button ${selectedCategory === "all" ? "is-active" : ""}`,
										type: "button",
										onClick: () => setSelectedCategory("all"),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-icon",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListGlyph, {})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-name",
												children: "全部事项"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-count",
												children: counts.all
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "wl-nav-label",
										children: "分类"
									}),
									state.categories.map((category) => {
										const count = state.tasks.filter((task) => task.categoryId === category.id && !task.completed).length;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "wl-nav-item",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												className: `wl-nav-button ${selectedCategory === category.id ? "is-active" : ""}`,
												type: "button",
												onClick: () => setSelectedCategory(category.id),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "wl-nav-icon",
														"aria-hidden": "true",
														children: "◦"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "wl-nav-name",
														children: category.name
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "wl-nav-count",
														children: count
													})
												]
											}), !category.builtIn && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												className: "wl-nav-delete",
												type: "button",
												title: `删除分类 ${category.name}`,
												"aria-label": `删除分类 ${category.name}`,
												onClick: () => {
													setState((current) => removeCategory(current, category.id));
													if (selectedCategory === category.id) setSelectedCategory("all");
												},
												children: "×"
											})]
										}, category.id);
									}),
									addingCategory ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
										className: "wl-category-form",
										onSubmit: submitCategory,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
												className: "wl-sr-only",
												htmlFor: "wl-new-category",
												children: "新分类名称"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												id: "wl-new-category",
												autoFocus: true,
												className: "wl-category-input",
												value: categoryDraft,
												maxLength: 32,
												placeholder: "分类名称",
												onChange: (event) => setCategoryDraft(event.target.value),
												onKeyDown: (event) => {
													if (event.key === "Escape") {
														setAddingCategory(false);
														setCategoryDraft("");
													}
												}
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												className: "wl-category-save",
												type: "submit",
												"aria-label": "保存分类",
												children: "✓"
											})
										]
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: "wl-nav-add",
										type: "button",
										onClick: () => setAddingCategory(true),
										children: "＋ 新建分类"
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: "wl-content",
								"aria-label": "工作清单内容",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "wl-content-top",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
											className: "wl-view-title",
											children: selectedCategory === "all" ? "我的工作笔记" : categoryName(selectedCategory)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: 10
											},
											children: [counts.completed > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												className: "wl-clear",
												type: "button",
												onClick: () => setState((current) => clearCompleted(current)),
												children: "清空已完成"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "wl-filter",
												role: "group",
												"aria-label": "事项筛选",
												children: FILTERS.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: `wl-filter-button ${filter === option.id ? "is-active" : ""}`,
													type: "button",
													"aria-pressed": filter === option.id,
													onClick: () => setFilter(option.id),
													children: option.label
												}, option.id))
											})]
										})]
									}),
									hasAnyTask ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: visibleCategories.map((category) => {
										const tasks = visibleTasks.filter((task) => task.categoryId === category.id);
										if (selectedCategory === "all" && tasks.length === 0) return null;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
											className: "wl-section",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
												className: "wl-section-head",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
													className: "wl-section-title",
													children: category.name
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "wl-section-count",
													children: [tasks.length, " 项"]
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "wl-task-list",
												children: tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: `wl-task ${task.completed ? "is-complete" : ""}`,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
															className: "wl-check",
															type: "checkbox",
															checked: task.completed,
															"aria-label": `${task.completed ? "标记未完成" : "标记完成"}：${task.title}`,
															onChange: () => setState((current) => toggleTask(current, task.id))
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
															className: "wl-task-main",
															children: editingTaskId === task.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																className: "wl-editor-shell",
																ref: editorShellRef,
																children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
																	className: "wl-rich-toolbar",
																	role: "toolbar",
																	"aria-label": "文字格式",
																	children: [
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
																			className: "wl-rich-format",
																			"aria-label": "段落样式",
																			defaultValue: "p",
																			onMouseDown: rememberRichSelection,
																			onChange: (event) => runRichCommand("formatBlock", event.target.value),
																			children: [
																				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																					value: "p",
																					children: "正文"
																				}),
																				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																					value: "h1",
																					children: "标题 1"
																				}),
																				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																					value: "h2",
																					children: "标题 2"
																				}),
																				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
																					value: "h3",
																					children: "标题 3"
																				})
																			]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-rich-sep" }),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "加粗",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("bold"),
																			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "B" })
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "斜体",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("italic"),
																			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { children: "I" })
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "下划线",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("underline"),
																			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("u", { children: "U" })
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "删除线",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("strikeThrough"),
																			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("s", { children: "S" })
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-rich-sep" }),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																			className: "wl-rich-button wl-color-button",
																			type: "button",
																			title: "黑色文字",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("foreColor", scheme === "dark" ? "#e8eaed" : "#252525"),
																			children: ["A", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-color-line is-default" })]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																			className: "wl-rich-button wl-color-button",
																			type: "button",
																			title: "灰色文字",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("foreColor", "#9a9a9a"),
																			children: ["A", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-color-line is-muted" })]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																			className: "wl-rich-button wl-color-button",
																			type: "button",
																			title: "红色文字",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("foreColor", "#e34d59"),
																			children: ["A", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-color-line is-red" })]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
																			className: "wl-rich-button wl-color-button",
																			type: "button",
																			title: "蓝色文字",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("foreColor", "#4e7fe8"),
																			children: ["A", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-color-line is-blue" })]
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-rich-sep" }),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button is-text",
																			type: "button",
																			title: "无序列表",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("insertUnorderedList"),
																			children: "• 列表"
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button is-text",
																			type: "button",
																			title: "编号列表",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("insertOrderedList"),
																			children: "1. 列表"
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "减少缩进",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("outdent"),
																			children: "⇤"
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button",
																			type: "button",
																			title: "增加缩进",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("indent"),
																			children: "⇥"
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																			className: "wl-rich-button is-text",
																			type: "button",
																			title: "插入虚线分隔",
																			onMouseDown: (event) => {
																				event.preventDefault();
																				rememberRichSelection();
																			},
																			onClick: () => runRichCommand("insertHorizontalRule"),
																			children: "虚线"
																		}),
																		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																			className: "wl-rich-hint",
																			children: "Ctrl+Enter 保存"
																		})
																	]
																}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																	ref: editorRef,
																	autoFocus: true,
																	className: "wl-task-edit",
																	contentEditable: true,
																	suppressContentEditableWarning: true,
																	role: "textbox",
																	"aria-multiline": "true",
																	"aria-label": `编辑：${task.title}`,
																	dangerouslySetInnerHTML: { __html: editingTaskHtml },
																	onInput: syncRichDraft,
																	onKeyUp: rememberRichSelection,
																	onMouseUp: rememberRichSelection,
																	onKeyDown: handleTaskEditKey
																})]
															}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
																className: "wl-task-title",
																title: "点击编辑",
																onClick: () => beginTaskEdit(task.id, task.title, task.html),
																dangerouslySetInnerHTML: { __html: sanitizeRichHtml(task.html?.trim() ? task.html : plainTextToHtml(task.title)) }
															})
														}),
														selectedCategory !== "all" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: "wl-task-category",
															children: category.name
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
															className: "wl-task-date",
															dateTime: new Date(task.createdAt).toISOString(),
															children: taskDate(task.createdAt)
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															className: "wl-task-delete",
															type: "button",
															"aria-label": `删除：${task.title}`,
															title: "删除事项",
															onClick: () => setState((current) => removeTask(current, task.id)),
															children: "×"
														})
													]
												}, task.id))
											})]
										}, category.id);
									}) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "wl-empty",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "wl-empty-icon",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ListGlyph, {})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "wl-empty-title",
												children: filter === "completed" ? "还没有完成的事项" : "这页还很清爽"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "wl-empty-copy",
												children: "在上方写下第一件事，按 Enter 或点击「添加」。清单会自动保存到 ~/.dsh/work-list.json。"
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
										className: "wl-foot",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [counts.active, " 项待完成"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: `wl-save-state is-${saveStatus}`,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: "wl-save-dot",
												"aria-hidden": "true"
											}), saveStatus === "saved" ? "已保存 · ~/.dsh/work-list.json" : saveStatus === "saving" ? "正在保存…" : saveStatus === "fallback" ? "宿主暂不可用 · 已保留浏览器缓存" : "正在读取清单…"]
										})]
									})
								]
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/index.tsx
		const PANEL_ID = "dsh-work-list";
		function WorkListIcon({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M8.5 6.5h11M8.5 12h11M8.5 17.5h11",
					stroke: "currentColor",
					strokeWidth: "1.7",
					strokeLinecap: "round"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m3.5 6.5 1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 17.5l1.2 1.2 2-2.4",
					stroke: "currentColor",
					strokeWidth: "1.7",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})]
			});
		}
		/** Ask Cordis to wait until the host has declared each official shell slot. */
		const inject = ["slots"];
		/** Register the global main panel and its official sidebar row. */
		function apply(ctx) {
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID
			}, WorkListPanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 35,
				label: "工作清单"
			}, WorkListIcon));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
