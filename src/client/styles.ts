export const WORK_LIST_STYLES = `
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
.wl-content-tools{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap}
.wl-search{display:flex;align-items:center;gap:6px;min-width:170px;height:32px;padding:0 8px;border:1px solid var(--wl-border);border-radius:8px;background:var(--wl-surface-2);color:var(--wl-muted)}
.wl-search:focus-within{border-color:var(--wl-brand);box-shadow:0 0 0 2px color-mix(in srgb,var(--wl-brand) 10%,transparent)}
.wl-search input{width:120px;min-width:0;border:0;outline:none;background:transparent;color:var(--wl-text);font:inherit;font-size:11px}
.wl-search input::placeholder{color:var(--wl-muted)}
.wl-search button{border:0;background:transparent;color:var(--wl-muted);font:inherit;font-size:15px;line-height:1;cursor:pointer}
.wl-tool-button{height:30px;padding:0 9px;border:1px solid var(--wl-border);border-radius:7px;background:transparent;color:var(--wl-text-2);font:inherit;font-size:11px;cursor:pointer}
.wl-tool-button:hover{border-color:var(--wl-brand);color:var(--wl-brand);background:color-mix(in srgb,var(--wl-brand) 6%,transparent)}
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
@media(max-width:760px){.wl-page{padding:18px}.wl-top{align-items:flex-start;flex-direction:column;margin-bottom:17px}.wl-typography{align-self:flex-start}.wl-layout{grid-template-columns:1fr;gap:12px}.wl-content-top{align-items:flex-start;flex-direction:column}.wl-content-tools{width:100%;justify-content:flex-start}.wl-search{flex:1;min-width:160px}.wl-search input{width:100%}.wl-nav{display:flex;gap:5px;overflow:auto;padding:7px}.wl-nav-label,.wl-nav-add,.wl-category-form{display:none}.wl-nav-item{flex:0 0 auto}.wl-nav-delete{display:inline-flex}.wl-nav-button{width:auto;min-width:max-content;padding:0 10px}.wl-nav-count{margin-left:2px}.wl-content{padding:16px 13px}.wl-task-date{display:none}}
`
