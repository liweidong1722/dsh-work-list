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
					createdAt: Number.isFinite(task.createdAt) && Number.isFinite(new Date(task.createdAt).getTime()) ? task.createdAt : Date.now(),
					...Number.isFinite(task.deletedAt) ? { deletedAt: task.deletedAt } : {},
					...typeof task.deletedCategoryId === "string" && task.deletedCategoryId.trim() ? { deletedCategoryId: task.deletedCategoryId.trim() } : {}
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
		function removeTask(state, id, { deletedAt = Date.now() } = {}) {
			if (!state.tasks.some((task) => task.id === id && task.deletedAt === void 0)) return state;
			return {
				...state,
				tasks: state.tasks.map((task) => task.id === id ? {
					...task,
					deletedAt,
					deletedCategoryId: task.categoryId
				} : task)
			};
		}
		function restoreTask(state, id) {
			const task = state.tasks.find((candidate) => candidate.id === id && candidate.deletedAt !== void 0);
			if (!task) return state;
			const categoryId = typeof task.deletedCategoryId === "string" && state.categories.some((category) => category.id === task.deletedCategoryId) ? task.deletedCategoryId : "inbox";
			return {
				...state,
				tasks: state.tasks.map((candidate) => {
					if (candidate.id !== id) return candidate;
					const restored = {
						...candidate,
						categoryId
					};
					delete restored.deletedAt;
					delete restored.deletedCategoryId;
					return restored;
				})
			};
		}
		function permanentlyRemoveTask(state, id) {
			if (state.tasks.find((candidate) => candidate.id === id)?.deletedAt === void 0) return state;
			return {
				...state,
				tasks: state.tasks.filter((candidate) => candidate.id !== id)
			};
		}
		function emptyTrash(state) {
			const tasks = state.tasks.filter((task) => task.deletedAt === void 0);
			return tasks.length === state.tasks.length ? state : {
				...state,
				tasks
			};
		}
		function reorderTask(state, sourceId, targetId, position = "before") {
			if (sourceId === targetId) return state;
			const source = state.tasks.find((task) => task.id === sourceId && task.deletedAt === void 0);
			const target = state.tasks.find((task) => task.id === targetId && task.deletedAt === void 0);
			if (!source || !target || source.categoryId !== target.categoryId) return state;
			const tasks = [...state.tasks];
			const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
			const [moved] = tasks.splice(sourceIndex, 1);
			const targetIndex = tasks.findIndex((task) => task.id === targetId);
			const insertAt = position === "after" ? targetIndex + 1 : targetIndex;
			tasks.splice(insertAt, 0, moved);
			return {
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
.wl-toolbar-typography{display:flex;align-items:center;gap:5px;white-space:nowrap}
.wl-typography-label{font-size:11px;color:var(--wl-muted)}
.wl-size-button{width:27px;height:27px;border:0;border-radius:6px;background:transparent;color:var(--wl-text-2);font-size:17px;line-height:1;cursor:pointer}
.wl-size-button:hover:not(:disabled){background:color-mix(in srgb,var(--wl-brand) 9%,var(--wl-hover));color:var(--wl-text)}
.wl-size-button:disabled{opacity:.4;cursor:not-allowed}
.wl-size-value{min-width:36px;text-align:center;font-size:12px;color:var(--wl-text-2);font-variant-numeric:tabular-nums}
.wl-font-select{max-width:82px;height:28px;border:0;border-left:1px solid var(--wl-border);padding:0 2px 0 8px;background:transparent;color:var(--wl-text-2);font-size:11px;outline:none}
.wl-add{display:flex;align-items:flex-start;gap:10px;margin-bottom:19px;padding:11px 12px 11px 15px;border:1px solid var(--wl-border);border-radius:14px;background:var(--wl-surface);box-shadow:0 5px 16px rgba(42,53,79,.03)}
.wl-add-input{flex:1;min-width:60px;min-height:38px;max-height:180px;padding:8px 0;border:0;outline:none;overflow-y:auto;background:transparent;color:var(--wl-text);font:inherit;font-size:14px;line-height:1.55}
.wl-add-rich-input:empty::before{content:attr(data-placeholder);color:var(--wl-muted);pointer-events:none}
.wl-add-rich-input p,.wl-add-rich-input div{margin:.15em 0}.wl-add-rich-input ul,.wl-add-rich-input ol{margin:.25em 0 .35em 1.45em;padding:0}.wl-add-rich-input ul{list-style:disc}.wl-add-rich-input ul ul{list-style:circle}.wl-add-rich-input ul ul ul{list-style:square}.wl-add-rich-input ol{list-style:decimal}.wl-add-rich-input li{margin:.12em 0}.wl-add-rich-input blockquote{margin:.35em 0;padding-left:10px;border-left:3px solid var(--wl-border-2);color:var(--wl-muted)}.wl-add-rich-input hr{margin:9px 0;border:0;border-top:1px dashed var(--wl-border-2)}
.wl-add-rich-input h1{margin:.15em 0;color:#f0c45a!important;font-size:1.38em;line-height:1.45}.wl-add-rich-input h2{margin:.15em 0;color:#f0c45a!important;font-size:1.22em;line-height:1.5}.wl-add-rich-input h3{margin:.15em 0;color:#f0c45a!important;font-size:1.1em;line-height:1.55}.wl-add-rich-input h1 *,.wl-add-rich-input h2 *,.wl-add-rich-input h3 *{color:#f0c45a!important}
.wl-category-select{max-width:112px;margin-top:6px;border:0;background:transparent;color:var(--wl-muted);font-size:12px;outline:none}
.wl-add-submit{margin-top:3px;border:0;border-radius:8px;padding:8px 14px;background:var(--wl-brand);color:#fff;font-size:12px;font-weight:650;cursor:pointer;transition:transform .15s,filter .15s}
.wl-add-submit:hover:not(:disabled){filter:brightness(.94);transform:translateY(-1px)}
.wl-add-submit:disabled{opacity:.4;cursor:not-allowed}
.wl-layout{display:grid;grid-template-columns:194px minmax(0,1fr);gap:20px;align-items:start}
.wl-nav{padding:11px;border:1px solid var(--wl-border);border-radius:12px;background:var(--wl-surface)}
.wl-nav-label{padding:9px 10px 6px;color:var(--wl-muted);font-size:11px;font-weight:600;letter-spacing:.04em}
.wl-nav-section-head{display:flex;align-items:center;justify-content:space-between;padding-right:4px}
.wl-nav-section-head .wl-nav-label{flex:1}
.wl-nav-section-add{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:var(--wl-muted);font:inherit;font-size:16px;line-height:1;cursor:pointer}
.wl-nav-section-add:hover{background:var(--wl-hover);color:var(--wl-brand)}
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
.wl-category-form{display:flex;gap:5px;margin:1px 4px 6px 8px}
.wl-category-input{width:100%;min-width:0;border:1px solid var(--wl-border-2);border-radius:8px;padding:7px 8px;outline:none;font:inherit;font-size:12px;background:var(--wl-surface);color:var(--wl-text)}
.wl-category-save{border:0;border-radius:8px;padding:0 9px;background:var(--wl-brand);color:#fff;cursor:pointer}
.wl-content{min-width:0;padding:20px 22px;border:1px solid var(--wl-border);border-radius:12px;background:var(--wl-surface);box-shadow:0 2px 8px rgba(32,42,58,.02)}
.wl-content-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:19px}
.wl-view-title{margin:0;color:var(--wl-text-2);font-size:13px;font-weight:650;letter-spacing:.02em}
.wl-content-tools{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap}
.wl-search{display:flex;align-items:center;gap:6px;min-width:170px;height:32px;padding:0 8px;border:1px solid var(--wl-border);border-radius:8px;background:var(--wl-surface-2);color:var(--wl-muted)}
.wl-search:focus-within{border-color:var(--wl-brand);box-shadow:0 0 0 2px color-mix(in srgb,var(--wl-brand) 10%,transparent)}
.wl-search input{width:120px;min-width:0;border:0;outline:none;background:transparent;color:var(--wl-text);font:inherit;font-size:11px}
.wl-search input::placeholder{color:var(--wl-muted)}
.wl-search button{border:0;background:transparent;color:var(--wl-muted);font:inherit;font-size:15px;line-height:1;cursor:pointer}
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
.wl-task{position:relative}
.wl-task.is-drag-over{box-shadow:inset 0 2px 0 var(--wl-brand)}
.wl-drag-handle{display:grid;place-items:center;width:16px;height:24px;flex:0 0 auto;margin-top:3px;color:var(--wl-muted);font-size:13px;letter-spacing:-3px;cursor:grab;user-select:none;opacity:.45}
.wl-task:hover .wl-drag-handle{opacity:.9}.wl-drag-handle:active{cursor:grabbing}
.wl-task-summary{display:flex;align-items:center;gap:7px;width:100%;min-height:30px;padding:2px;border:0;background:transparent;color:#f0c45a;text-align:left;font:inherit;font-size:var(--wl-font-size);font-weight:650;line-height:1.5;cursor:pointer}
.wl-task-summary:hover{color:#f5cf73}.wl-task-chevron{display:inline-block;flex:0 0 auto;color:var(--wl-muted);font-size:17px;line-height:1;transition:transform .15s}
.wl-task.is-expanded .wl-task-chevron{transform:rotate(90deg)}
.wl-task-expanded{position:relative;padding:3px 2px 5px 21px}
.wl-task-body{padding:5px 7px;border-radius:7px;color:var(--wl-text);font-size:var(--wl-font-size);line-height:1.65;overflow-wrap:anywhere;cursor:text}
.wl-task-body:hover{background:color-mix(in srgb,var(--wl-hover) 70%,transparent)}
.wl-task-body p,.wl-task-body div{margin:.15em 0}.wl-task-body ul,.wl-task-body ol{margin:.25em 0 .35em 1.45em;padding:0}.wl-task-body ul{list-style:disc}.wl-task-body ul ul{list-style:circle}.wl-task-body ul ul ul{list-style:square}.wl-task-body ol{list-style:decimal}.wl-task-body li{margin:.12em 0;padding-left:.12em}.wl-task-body blockquote{margin:.35em 0;padding-left:10px;border-left:3px solid var(--wl-border-2);color:var(--wl-muted)}.wl-task-body hr{margin:9px 0;border:0;border-top:1px dashed var(--wl-border-2)}
.wl-task-body h1{margin:.3em 0 .2em;color:#f0c45a!important;font-size:1.38em}.wl-task-body h2{margin:.28em 0 .18em;color:#f0c45a!important;font-size:1.22em}.wl-task-body h3{margin:.24em 0 .15em;color:#f0c45a!important;font-size:1.1em}
.wl-task-body-empty{padding:5px 7px;color:var(--wl-muted);font-size:11px;cursor:text}.wl-task-body-empty:hover{background:color-mix(in srgb,var(--wl-hover) 70%,transparent);border-radius:7px}
.wl-task.is-complete .wl-task-summary{color:var(--wl-muted);text-decoration:line-through;text-decoration-color:var(--wl-border-2)}
.wl-global-toolbar{position:sticky;top:8px;z-index:30;margin:0 0 9px;background:var(--wl-surface-2);box-shadow:0 8px 24px rgba(20,28,44,.14)}
.wl-rich-toolbar.is-disabled{opacity:.72}.wl-rich-button:disabled,.wl-rich-format:disabled{cursor:default;opacity:.42}.wl-rich-button:disabled:hover{background:transparent;color:var(--wl-text-2)}
.wl-task.is-trash{align-items:center}.wl-task.is-trash .wl-task-summary{color:var(--wl-text-2);font-size:13px}.wl-task.is-trash .wl-task-expanded{padding-left:20px}
.wl-trash-action{flex:0 0 auto;padding:5px 8px;border:1px solid var(--wl-border);border-radius:6px;background:transparent;color:var(--wl-text-2);font:inherit;font-size:10px;cursor:pointer}.wl-trash-action:hover{border-color:var(--wl-brand);color:var(--wl-brand)}.wl-trash-action.is-danger:hover{border-color:#c65e68;color:#c65e68}
.wl-trash-section{margin-top:0}
.wl-task-delete:hover{background:#fff0f0;color:#c65e68}
.wl-group-empty{padding:8px 10px;color:#b2bac5;font-size:12px}
.wl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:195px;padding:25px 15px;text-align:center;color:#98a2b1}
.wl-empty-icon{display:grid;place-items:center;width:46px;height:46px;margin-bottom:12px;border-radius:15px;background:#f0f2ff;color:#7788ec}
.wl-empty-title{margin:0 0 6px;color:#737f92;font-size:14px;font-weight:650}
.wl-empty-copy{max-width:320px;margin:0;color:#a0a9b7;font-size:12px;line-height:1.7}
.wl-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:16px;color:#aab1bc;font-size:10px}.wl-foot-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;min-width:0}.wl-foot-action{padding:2px 3px;border:0;background:transparent;color:var(--wl-muted);font:inherit;font-size:10px;cursor:pointer}.wl-foot-action:hover{color:var(--wl-brand)}.wl-save-state{display:inline-flex;align-items:center;gap:5px;min-width:0}.wl-save-dot{width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:#64b58a}.wl-save-state.is-saving .wl-save-dot{background:#c3a45f}.wl-save-state.is-fallback .wl-save-dot{background:#d17a7a}
.wl-page.is-dark{--wl-bg:var(--dsw-alias-bg-base,#17191d);--wl-surface:var(--dsw-alias-bg-layer-1,#202329);--wl-surface-2:var(--dsw-alias-bg-layer-2,#24272d);--wl-text:var(--dsw-alias-label-primary,#e8eaed);--wl-text-2:var(--dsw-alias-label-secondary,#c1c6cf);--wl-muted:var(--dsw-alias-label-tertiary,#858c98);--wl-border:var(--dsw-alias-border-l1,#30343d);--wl-border-2:var(--dsw-alias-border-l2,#3a404a);--wl-brand:var(--dsw-alias-brand-primary,#7ea2ff);--wl-hover:var(--dsw-alias-interactive-bg-hover,#292d34)}
.wl-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:760px){.wl-page{padding:18px}.wl-top{align-items:flex-start;flex-direction:column;margin-bottom:17px}.wl-layout{grid-template-columns:1fr;gap:12px}.wl-content-top{align-items:flex-start;flex-direction:column}.wl-content-tools{width:100%;justify-content:flex-start}.wl-search{flex:1;min-width:160px}.wl-search input{width:100%}.wl-nav{display:flex;gap:5px;overflow:auto;padding:7px}.wl-nav-label,.wl-nav-section-head,.wl-category-form{display:none}.wl-nav-item{flex:0 0 auto}.wl-nav-delete{display:inline-flex}.wl-nav-button{width:auto;min-width:max-content;padding:0 10px}.wl-nav-count{margin-left:2px}.wl-content{padding:16px 13px}.wl-task-date{display:none}.wl-foot{align-items:flex-start;flex-direction:column}.wl-foot-actions{width:100%;justify-content:flex-start;flex-wrap:wrap}}
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
		function taskSummary(title, html) {
			if (typeof document !== "undefined" && html?.trim()) {
				const holder = document.createElement("div");
				holder.innerHTML = sanitizeRichHtml(html);
				const heading = holder.querySelector("h1,h2,h3")?.textContent?.trim();
				if (heading) return heading.slice(0, 160);
			}
			return title.split(/\r?\n/).find((line) => line.trim())?.trim().slice(0, 160) || "未命名事项";
		}
		function taskBodyHtml(title, html) {
			const summary = taskSummary(title, html);
			if (!html?.trim()) {
				const lines = title.split(/\r?\n/);
				const first = lines.findIndex((line) => line.trim());
				return first >= 0 ? plainTextToHtml(lines.slice(first + 1).join("\n").trim()) : "";
			}
			const safeHtml = sanitizeRichHtml(html);
			if (typeof document === "undefined") return safeHtml;
			const holder = document.createElement("div");
			holder.innerHTML = safeHtml;
			const heading = holder.querySelector("h1,h2,h3");
			if (heading) heading.remove();
			else {
				const firstElement = holder.firstElementChild;
				if (firstElement?.textContent?.trim() === summary) firstElement.remove();
			}
			return holder.innerHTML.trim();
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
			const [searchQuery, setSearchQuery] = (0, react.useState)("");
			const [draft, setDraft] = (0, react.useState)("");
			const [draftHtml, setDraftHtml] = (0, react.useState)("");
			const [draftActive, setDraftActive] = (0, react.useState)(false);
			const [draftCategory, setDraftCategory] = (0, react.useState)("inbox");
			const [categoryDraft, setCategoryDraft] = (0, react.useState)("");
			const [addingCategory, setAddingCategory] = (0, react.useState)(false);
			const [editingTitle, setEditingTitle] = (0, react.useState)(false);
			const [titleDraft, setTitleDraft] = (0, react.useState)("");
			const [editingTaskId, setEditingTaskId] = (0, react.useState)(null);
			const [editingTaskHtml, setEditingTaskHtml] = (0, react.useState)("");
			const [expandedTaskIds, setExpandedTaskIds] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [draggedTaskId, setDraggedTaskId] = (0, react.useState)(null);
			const [dragOverTaskId, setDragOverTaskId] = (0, react.useState)(null);
			const editorRef = (0, react.useRef)(null);
			const draftEditorRef = (0, react.useRef)(null);
			const editorShellRef = (0, react.useRef)(null);
			const formatToolbarRef = (0, react.useRef)(null);
			const selectionRef = (0, react.useRef)(null);
			const revisionRef = (0, react.useRef)(null);
			const historyRef = (0, react.useRef)([]);
			const historyIndexRef = (0, react.useRef)(-1);
			const importFileRef = (0, react.useRef)(null);
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
					const toolbar = formatToolbarRef.current;
					const target = event.target;
					if (!(target instanceof Node)) return;
					if (shell?.contains(target) || toolbar?.contains(target)) return;
					finishTaskEdit();
				};
				document.addEventListener("pointerdown", handlePointerDown, true);
				return () => document.removeEventListener("pointerdown", handlePointerDown, true);
			}, [editingTaskId]);
			const activeTasks = (0, react.useMemo)(() => state.tasks.filter((task) => task.deletedAt === void 0), [state.tasks]);
			const trashTasks = (0, react.useMemo)(() => state.tasks.filter((task) => task.deletedAt !== void 0), [state.tasks]);
			const counts = (0, react.useMemo)(() => {
				const result = {
					all: activeTasks.length,
					active: 0,
					completed: 0
				};
				for (const task of activeTasks) result[task.completed ? "completed" : "active"] += 1;
				return result;
			}, [activeTasks]);
			const visibleCategories = selectedCategory === "all" ? state.categories : selectedCategory === "trash" ? [] : state.categories.filter((category) => category.id === selectedCategory);
			const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
			const visibleTasks = (selectedCategory === "trash" ? trashTasks : activeTasks).filter((task) => {
				if (selectedCategory !== "all" && selectedCategory !== "trash" && task.categoryId !== selectedCategory) return false;
				if (selectedCategory !== "trash") {
					if (filter === "active" && task.completed) return false;
					if (filter === "completed" && !task.completed) return false;
				}
				if (normalizedSearch && !task.title.toLocaleLowerCase().includes(normalizedSearch)) return false;
				return true;
			});
			const hasAnyTask = visibleTasks.length > 0;
			const categoryName = (id) => state.categories.find((category) => category.id === id)?.name ?? "日常";
			const fontFamily = FONT_FAMILIES[state.fontFamily] ?? FONT_FAMILIES.system;
			function submitTask(event) {
				event.preventDefault();
				const html = sanitizeRichHtml(draftEditorRef.current?.innerHTML ?? draftHtml);
				const text = htmlToPlainText(html);
				if (!text) return;
				const categoryId = selectedCategory === "all" ? draftCategory : selectedCategory;
				setState((current) => addTask(current, text, {
					categoryId,
					html
				}));
				setDraft("");
				setDraftHtml("");
				if (draftEditorRef.current) draftEditorRef.current.innerHTML = "";
				selectionRef.current = null;
				historyRef.current = [];
				historyIndexRef.current = -1;
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
			function exportWorkList() {
				const raw = JSON.stringify(state, null, 2) + "\n";
				const blob = new Blob([raw], { type: "application/json;charset=utf-8" });
				const url = URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = `dsh-work-list-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
				document.body.appendChild(anchor);
				anchor.click();
				anchor.remove();
				URL.revokeObjectURL(url);
			}
			async function importWorkList(file) {
				try {
					const raw = await file.text();
					const parsed = JSON.parse(raw);
					if (!parsed || parsed.version !== 1) throw new Error("unsupported work-list version");
					finishTaskEdit();
					setState(decodeState(raw));
					setSelectedCategory("all");
					setFilter("active");
					setSearchQuery("");
					setExpandedTaskIds(/* @__PURE__ */ new Set());
				} catch {
					window.alert("导入失败：请选择有效的 dsh-work-list JSON 文件。");
				} finally {
					if (importFileRef.current) importFileRef.current.value = "";
				}
			}
			function toggleTaskExpanded(id) {
				setExpandedTaskIds((current) => {
					const next = new Set(current);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					return next;
				});
			}
			function startTaskDrag(event, id) {
				setDraggedTaskId(id);
				event.dataTransfer.effectAllowed = "move";
				event.dataTransfer.setData("text/plain", id);
			}
			function dropTask(event, targetId) {
				event.preventDefault();
				const sourceId = draggedTaskId || event.dataTransfer.getData("text/plain");
				if (!sourceId || sourceId === targetId) {
					setDragOverTaskId(null);
					return;
				}
				const rect = event.currentTarget.getBoundingClientRect();
				const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
				setState((current) => reorderTask(current, sourceId, targetId, position));
				setDraggedTaskId(null);
				setDragOverTaskId(null);
			}
			function beginTaskEdit(id, title, html) {
				const initialHtml = sanitizeRichHtml(html?.trim() ? html : plainTextToHtml(title));
				setExpandedTaskIds((current) => new Set(current).add(id));
				setDraftActive(false);
				selectionRef.current = null;
				historyRef.current = [initialHtml];
				historyIndexRef.current = 0;
				setEditingTaskId(id);
				setEditingTaskHtml(initialHtml);
			}
			function activeEditor() {
				if (editingTaskId) return editorRef.current;
				if (draftActive) return draftEditorRef.current;
				return null;
			}
			function rememberRichSelection() {
				const editor = activeEditor();
				const selection = window.getSelection();
				if (!editor || !selection || selection.rangeCount === 0) return;
				const range = selection.getRangeAt(0);
				const anchor = range.commonAncestorContainer;
				if (anchor === editor || editor.contains(anchor)) selectionRef.current = range.cloneRange();
			}
			function restoreRichSelection() {
				const editor = activeEditor();
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
				const editor = activeEditor();
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
				const editor = activeEditor();
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
				const editor = activeEditor();
				if (!editor) return;
				historyIndexRef.current = nextIndex;
				const html = historyRef.current[nextIndex] ?? "";
				editor.innerHTML = html;
				if (editingTaskId) setEditingTaskHtml(html);
				else {
					setDraftHtml(html);
					setDraft(htmlToPlainText(html));
				}
				editor.focus();
				placeCaretAtEnd();
			}
			function syncRichDraft() {
				const editor = activeEditor();
				if (draftActive && !editingTaskId && editor) {
					const html = sanitizeRichHtml(editor.innerHTML);
					setDraftHtml(html);
					setDraft(htmlToPlainText(html));
				}
				pushEditorHistory();
				rememberRichSelection();
			}
			function activateDraftEditor() {
				if (editingTaskId) finishTaskEdit();
				setDraftActive(true);
				selectionRef.current = null;
				const html = sanitizeRichHtml(draftEditorRef.current?.innerHTML ?? draftHtml);
				historyRef.current = [html];
				historyIndexRef.current = 0;
			}
			function runRichCommand(command, value) {
				if (!activeEditor()) return;
				restoreRichSelection();
				try {
					document.execCommand(command, false, value);
				} catch {}
				pushEditorHistory();
				const editor = activeEditor();
				if (draftActive && !editingTaskId && editor) {
					const html = sanitizeRichHtml(editor.innerHTML);
					setDraftHtml(html);
					setDraft(htmlToPlainText(html));
				}
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
			function renderTaskRow(task, isTrash = false) {
				const expanded = expandedTaskIds.has(task.id);
				const summary = taskSummary(task.title, task.html);
				const bodyHtml = taskBodyHtml(task.title, task.html);
				const isEditing = editingTaskId === task.id;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: `wl-task ${task.completed ? "is-complete" : ""} ${expanded ? "is-expanded" : ""} ${isTrash ? "is-trash" : ""} ${dragOverTaskId === task.id ? "is-drag-over" : ""}`,
					onDragOver: (event) => {
						if (!isTrash && draggedTaskId && draggedTaskId !== task.id) {
							event.preventDefault();
							setDragOverTaskId(task.id);
						}
					},
					onDragLeave: () => setDragOverTaskId((current) => current === task.id ? null : current),
					onDrop: (event) => {
						if (!isTrash) dropTask(event, task.id);
					},
					children: [
						!isTrash && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wl-drag-handle",
							draggable: true,
							role: "button",
							tabIndex: 0,
							title: "拖动排序",
							"aria-label": `拖动排序：${summary}`,
							onDragStart: (event) => startTaskDrag(event, task.id),
							onDragEnd: () => {
								setDraggedTaskId(null);
								setDragOverTaskId(null);
							},
							children: "⋮⋮"
						}),
						!isTrash && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "wl-check",
							type: "checkbox",
							checked: task.completed,
							"aria-label": `${task.completed ? "标记未完成" : "标记完成"}：${summary}`,
							onChange: () => setState((current) => toggleTask(current, task.id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "wl-task-main",
							children: isEditing && !isTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wl-editor-shell",
								ref: editorShellRef,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									ref: editorRef,
									autoFocus: true,
									className: "wl-task-edit",
									contentEditable: true,
									suppressContentEditableWarning: true,
									role: "textbox",
									"aria-multiline": "true",
									"aria-label": `编辑：${summary}`,
									dangerouslySetInnerHTML: { __html: editingTaskHtml },
									onInput: syncRichDraft,
									onKeyUp: rememberRichSelection,
									onMouseUp: rememberRichSelection,
									onKeyDown: handleTaskEditKey
								})
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "wl-task-summary",
								type: "button",
								"aria-expanded": expanded,
								onClick: () => toggleTaskExpanded(task.id),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "wl-task-chevron",
									"aria-hidden": "true",
									children: "›"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: summary })]
							}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "wl-task-expanded",
								children: bodyHtml ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "wl-task-body",
									title: isTrash ? void 0 : "点击编辑",
									onClick: isTrash ? void 0 : () => beginTaskEdit(task.id, task.title, task.html),
									dangerouslySetInnerHTML: { __html: bodyHtml }
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "wl-task-body-empty",
									title: isTrash ? void 0 : "点击编辑",
									onClick: isTrash ? void 0 : () => beginTaskEdit(task.id, task.title, task.html),
									children: isTrash ? "无更多内容" : "暂无正文内容"
								})
							})] })
						}),
						isTrash ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("time", {
								className: "wl-task-date",
								dateTime: new Date(task.deletedAt ?? Date.now()).toISOString(),
								children: ["删除于 ", taskDate(task.deletedAt ?? Date.now())]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "wl-trash-action",
								type: "button",
								onClick: () => setState((current) => restoreTask(current, task.id)),
								children: "还原"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "wl-trash-action is-danger",
								type: "button",
								onClick: () => {
									if (window.confirm(`永久删除“${summary}”？此操作无法恢复。`)) setState((current) => permanentlyRemoveTask(current, task.id));
								},
								children: "永久删除"
							})
						] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							selectedCategory !== "all" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "wl-task-category",
								children: categoryName(task.categoryId)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
								className: "wl-task-date",
								dateTime: new Date(task.createdAt).toISOString(),
								children: taskDate(task.createdAt)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "wl-task-delete",
								type: "button",
								"aria-label": `移到回收站：${summary}`,
								title: "移到回收站",
								onClick: () => setState((current) => removeTask(current, task.id)),
								children: "×"
							})
						] })
					]
				}, task.id);
			}
			function renderRichToolbar() {
				const editingTask = editingTaskId ? state.tasks.find((task) => task.id === editingTaskId) : void 0;
				const disabled = !editingTaskId && !draftActive;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: formatToolbarRef,
					className: `wl-rich-toolbar wl-global-toolbar ${disabled ? "is-disabled" : ""}`,
					role: "toolbar",
					"aria-label": "文字格式",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: "wl-rich-format",
							"aria-label": "段落样式",
							defaultValue: "p",
							disabled,
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
							title: "加粗 · Ctrl+B",
							disabled,
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
							title: "斜体 · Ctrl+I",
							disabled,
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
							title: "下划线 · Ctrl+U",
							disabled,
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
							disabled,
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
							title: "默认文字颜色",
							disabled,
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
							disabled,
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
							disabled,
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
							disabled,
							onMouseDown: (event) => {
								event.preventDefault();
								rememberRichSelection();
							},
							onClick: () => runRichCommand("foreColor", "#4e7fe8"),
							children: ["A", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-color-line is-blue" })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "wl-rich-button is-text",
							type: "button",
							title: "清除文字格式",
							disabled,
							onMouseDown: (event) => {
								event.preventDefault();
								rememberRichSelection();
							},
							onClick: () => runRichCommand("removeFormat"),
							children: "清格式"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-rich-sep" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "wl-rich-button is-text",
							type: "button",
							title: "无序列表 · Ctrl+Shift+8",
							disabled,
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
							title: "编号列表 · Ctrl+Shift+7",
							disabled,
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
							disabled,
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
							disabled,
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
							disabled,
							onMouseDown: (event) => {
								event.preventDefault();
								rememberRichSelection();
							},
							onClick: () => runRichCommand("insertHorizontalRule"),
							children: "虚线"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "wl-rich-sep" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "wl-toolbar-typography",
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
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "wl-rich-hint",
							children: editingTask ? `正在编辑：${taskSummary(editingTask.title, editingTask.html)}` : draftActive ? "正在新增事项" : "点击下方输入区后即可使用格式"
						})
					]
				});
			}
			function handleDraftKey(event) {
				const mod = event.ctrlKey || event.metaKey;
				const key = event.key.toLowerCase();
				if (mod && event.key === "Enter") {
					event.preventDefault();
					event.currentTarget.closest("form")?.requestSubmit();
					return;
				}
				if (mod && !event.shiftKey && (key === "b" || key === "i" || key === "u")) {
					event.preventDefault();
					runRichCommand(key === "b" ? "bold" : key === "i" ? "italic" : "underline");
					return;
				}
				if (mod && event.shiftKey && event.code === "Digit7") {
					event.preventDefault();
					runRichCommand("insertOrderedList");
					return;
				}
				if (mod && event.shiftKey && event.code === "Digit8") {
					event.preventDefault();
					runRichCommand("insertUnorderedList");
					return;
				}
				if (mod && key === "z") {
					event.preventDefault();
					applyHistoryStep(event.shiftKey ? 1 : -1);
					return;
				}
				if (mod && key === "y") {
					event.preventDefault();
					applyHistoryStep(1);
					return;
				}
				if (event.key === "Tab") {
					event.preventDefault();
					runRichCommand(event.shiftKey ? "outdent" : "indent");
				}
			}
			function handleTaskEditKey(event) {
				const mod = event.ctrlKey || event.metaKey;
				const key = event.key.toLowerCase();
				if (mod && !event.shiftKey && (key === "b" || key === "i" || key === "u")) {
					event.preventDefault();
					runRichCommand(key === "b" ? "bold" : key === "i" ? "italic" : "underline");
					return;
				}
				if (mod && event.shiftKey && event.code === "Digit7") {
					event.preventDefault();
					runRichCommand("insertOrderedList");
					return;
				}
				if (mod && event.shiftKey && event.code === "Digit8") {
					event.preventDefault();
					runRichCommand("insertUnorderedList");
					return;
				}
				if (mod && key === "z") {
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("header", {
							className: "wl-top",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
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
							] })
						}),
						selectedCategory !== "trash" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [renderRichToolbar(), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "wl-add",
							onSubmit: submitTask,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									className: "wl-sr-only",
									htmlFor: "wl-new-task",
									children: "添加一项"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									id: "wl-new-task",
									ref: draftEditorRef,
									className: "wl-add-input wl-add-rich-input",
									contentEditable: true,
									suppressContentEditableWarning: true,
									role: "textbox",
									"aria-multiline": "true",
									"aria-label": "添加一项",
									"data-placeholder": "记下要做的事 · Enter 换行 · Ctrl+Enter 添加",
									onFocus: activateDraftEditor,
									onInput: syncRichDraft,
									onKeyUp: rememberRichSelection,
									onMouseUp: rememberRichSelection,
									onKeyDown: handleDraftKey
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
						})] }),
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "wl-nav-section-head",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "wl-nav-label",
											children: "分类"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											className: "wl-nav-section-add",
											type: "button",
											title: "新建分类",
											"aria-label": "新建分类",
											onClick: () => {
												setAddingCategory((current) => !current);
												setCategoryDraft("");
											},
											children: "＋"
										})]
									}),
									addingCategory && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
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
									}),
									state.categories.map((category) => {
										const count = activeTasks.filter((task) => task.categoryId === category.id && !task.completed).length;
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "wl-nav-label",
										children: "其他"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										className: `wl-nav-button ${selectedCategory === "trash" ? "is-active" : ""}`,
										type: "button",
										onClick: () => {
											finishTaskEdit();
											setSelectedCategory("trash");
											setSearchQuery("");
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-icon",
												"aria-hidden": "true",
												children: "♲"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-name",
												children: "回收站"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "wl-nav-count",
												children: trashTasks.length
											})
										]
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
											children: selectedCategory === "trash" ? "回收站" : selectedCategory === "all" ? "我的工作笔记" : categoryName(selectedCategory)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "wl-content-tools",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: "wl-search",
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														"aria-hidden": "true",
														children: "⌕"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														value: searchQuery,
														onChange: (event) => setSearchQuery(event.target.value),
														placeholder: "搜索事项",
														"aria-label": "搜索事项"
													}),
													searchQuery && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														title: "清除搜索",
														"aria-label": "清除搜索",
														onClick: () => setSearchQuery(""),
														children: "×"
													})
												]
											}), selectedCategory === "trash" ? trashTasks.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												className: "wl-clear",
												type: "button",
												onClick: () => {
													if (window.confirm("清空回收站？此操作无法恢复。")) setState((current) => emptyTrash(current));
												},
												children: "清空回收站"
											}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
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
											}) })]
										})]
									}),
									hasAnyTask ? selectedCategory === "trash" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
										className: "wl-section wl-trash-section",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
											className: "wl-section-head",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
												className: "wl-section-title",
												children: "已删除事项"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "wl-section-count",
												children: [visibleTasks.length, " 项"]
											})]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "wl-task-list",
											children: visibleTasks.map((task) => renderTaskRow(task, true))
										})]
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: visibleCategories.map((category) => {
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
												children: tasks.map((task) => renderTaskRow(task))
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
												children: normalizedSearch ? "没有找到匹配事项" : selectedCategory === "trash" ? "回收站是空的" : filter === "completed" ? "还没有完成的事项" : "这页还很清爽"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "wl-empty-copy",
												children: normalizedSearch ? "换一个关键词试试，搜索会匹配事项里的全部文字内容。" : selectedCategory === "trash" ? "删除的事项会保留在这里，可以随时还原。" : "在上方写下第一件事，按 Ctrl+Enter 或点击「添加」。清单会自动保存到 ~/.dsh/work-list.json。"
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
										className: "wl-foot",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selectedCategory === "trash" ? `${trashTasks.length} 项在回收站` : `${counts.active} 项待完成` }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "wl-foot-actions",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: "wl-foot-action",
													type: "button",
													onClick: () => importFileRef.current?.click(),
													children: "导入"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: "wl-foot-action",
													type: "button",
													onClick: exportWorkList,
													children: "导出"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													ref: importFileRef,
													className: "wl-sr-only",
													type: "file",
													accept: "application/json,.json",
													onChange: (event) => {
														const file = event.target.files?.[0];
														if (file) importWorkList(file);
													}
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: `wl-save-state is-${saveStatus}`,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
														className: "wl-save-dot",
														"aria-hidden": "true"
													}), saveStatus === "saved" ? "已保存 · ~/.dsh/work-list.json" : saveStatus === "saving" ? "正在保存…" : saveStatus === "fallback" ? "宿主暂不可用 · 已保留浏览器缓存" : "正在读取清单…"]
												})
											]
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
