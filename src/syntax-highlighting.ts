import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, type Extension } from "@codemirror/state";
import { classHighlighter, highlightTree } from "@lezer/highlight";
import { handlebarsLanguage } from "@xiechao/codemirror-lang-handlebars";

// ------------------------------------------------------------------------------------------------
// Handlebars syntax highlighting
// ------------------------------------------------------------------------------------------------

type SpanType = "normal" | "triple" | "comment" | "raw";
type Span = { from: number; to: number; type: SpanType };

export function handlebarsOverlay(): Extension {
	const spanMark = (cls: string) => Decoration.mark({class: cls});
	const tokMark  = (cls: string) => Decoration.mark({class: `cm-hbs-token ${cls}`});

	function build(view: EditorView): DecorationSet {
		const b = new RangeSetBuilder<Decoration>();

		for (const {from, to} of view.visibleRanges) {
			const text = view.state.doc.sliceString(from, to);

			for (const m of scanAll(text)) {
				const baseCls =
					m.type === "comment" ? "cm-hbs-comment" :
					m.type === "raw" ? "cm-hbs-raw" :
					m.type === "triple" ? "cm-hbs-triple" : "cm-hbs";

				// whole-span tint (lightweight)
				b.add(from + m.from, from + m.to, spanMark(baseCls));

				// deep tokenization with Handlebars Lezer (cap length for perf)
				const spanLen = m.to - m.from;
				if (spanLen <= 4000) {
					const slice = text.slice(m.from, m.to);
					const tree  = handlebarsLanguage.parser.parse(slice);

					// Use Lezer’s classHighlighter to get tag-based classes like "tok-string"
					highlightTree(tree, classHighlighter, (s: number, e: number, classes: string) => {
						// Map "tok-foo tok-bar" -> "cm-tok-foo cm-tok-bar"
						const cls = classes.split(/\s+/).map((c: string) => `cm-${c}`).join(" ");
						b.add(from + m.from + s, from + m.from + e, tokMark(cls));
					});
				}
			}
		}
		return b.finish();
	}

	return [
		// Theme defaults: inherit from Obsidian’s code vars
		EditorView.baseTheme({
			".cm-hbs": { color: "var(--text-faint)" },
			".cm-hbs-triple": { color: "var(--text-muted)" },
			".cm-hbs-comment": { color: "var(--text-faint)", fontStyle: "italic" },
			".cm-hbs-raw": { color: "var(--text-muted)" },

			/* token-level colors (from classHighlighter) */
			".cm-hbs-token.cm-tok-string": { color: "var(--code-string)" },
			".cm-hbs-token.cm-tok-number": { color: "var(--code-number)" },
			".cm-hbs-token.cm-tok-comment": { color: "var(--code-comment)", fontStyle: "italic" },
			".cm-hbs-token.cm-tok-keyword": { color: "var(--code-keyword)" },
			".cm-hbs-token.cm-tok-operator": { color: "var(--code-operator)" },
			".cm-hbs-token.cm-tok-variableName": { color: "var(--code-property)" },
			".cm-hbs-token.cm-tok-atom": { color: "var(--code-important)" },
			".cm-hbs-token.cm-tok-tagName": { color: "var(--code-tag)" },
			".cm-hbs-token.cm-tok-propertyName": { color: "var(--code-property)" },
		}),
		ViewPlugin.fromClass(class {
			decorations: DecorationSet;
			constructor(view: EditorView) { this.decorations = build(view); }
			update(u: ViewUpdate) {
				if (u.docChanged || u.viewportChanged) this.decorations = build(u.view);
			}
		}, { decorations: v => v.decorations })
	];
}

function scanAll(text: string): Span[] {
	const out: Span[] = [];
	let i = 0;
	while (i < text.length) {
		const j = text.indexOf("{{", i);
		if (j < 0) break;
		// skip escaped \{{ (odd number of backslashes)
		if (isEscapedAt(text, j)) { i = j + 2; continue; }
		const res = scanHandlebarsSpan(text, j);
		if (res) { out.push({ from: j, to: res.end, type: res.type }); i = res.end; }
		else { i = j + 2; }
	}
	return out;
}

// odd backslashes immediately before position => escaped
function isEscapedAt(text: string, pos: number): boolean {
	let b = 0; for (let k = pos - 1; k >= 0 && text.charCodeAt(k) === 92; k--) { b++; }
	return (b & 1) === 1;
}

function scanHandlebarsSpan(text: string, start: number): { end: number; type: SpanType } | null {
	if (!text.startsWith("{{", start)) { return null; }
	if (isEscapedAt(text, start)) { return null; }

	// support trim marker right after open: {{~... / {{{~...
	const afterOpen = start + 2;
	const hasTrimOpen = text.charCodeAt(afterOpen) === 126; // '~'
	const p = hasTrimOpen ? afterOpen + 1 : afterOpen;

	// Long comment: {{~!-- ... --}}
	if (text.startsWith("!--", p)) {
		const end = text.indexOf("--}}", p + 3);
		return end >= 0 ? { end: end + 4, type: "comment" } : null;
	}
	// Short comment: {{~! ... }}
	if (text.charCodeAt(p) === 33 /* '!' */) {
		const end = text.indexOf("}}", p + 1);
		// allow optional trim before close: ~}}
		return end >= 0 ? { end: end + 2, type: "comment" } : null;
	}

	// Raw block: {{{{~name}}}} ... {{{{/name~}}}}
	if (text.startsWith("{{{{", start)) {
		let q = start + 4;
		if (text.charCodeAt(q) === 126) { q++; } // optional ~ after {{{{
		const m = text.slice(q).match(/^\s*([A-Za-z_][\w:-]*)/);
		if (!m) { return null; }
		const name = m[1];
		const openRest = q + m[0].length;
		// find matching close: {{{{/name ... }}}}
		const closeHead = `{{{{/${name}`;
		let idx = text.indexOf(closeHead, openRest);
		if (idx < 0) { return null; }
		const endBraces = text.indexOf("}}}}", idx); // allows optional ~/ws before braces
		return endBraces >= 0 ? { end: endBraces + 4, type: "raw" } : null;
	}

	// Normal or triple mustache (allow trim after open)
	const triple = text.startsWith("{{{", start);
	let i = start + (triple ? 3 : 2);
	if (text.charCodeAt(i) === 126) { i++; } // skip {{~ or {{{~
	let inDQ = false, inSQ = false;

	while (i < text.length) {
		const ch = text.charCodeAt(i);
		if (inDQ) { if (ch === 34 && !isEscapedAt(text, i)) { inDQ = false; } i++; continue; } // "
		if (inSQ) { if (ch === 39 && !isEscapedAt(text, i)) { inSQ = false; } i++; continue; } // '
		if (ch === 34) { inDQ = true; i++; continue; }
		if (ch === 39) { inSQ = true; i++; continue; }
		// closer with optional trim before braces: ~}} or ~}}}
		if (text.charCodeAt(i) === 126 /* '~' */) {
			if (triple ? text.startsWith("}}}", i + 1) : text.startsWith("}}", i + 1)) {
				return { end: i + 1 + (triple ? 3 : 2), type: triple ? "triple" : "normal" };
			}
		}
		if (triple ? text.startsWith("}}}", i) : text.startsWith("}}", i)) {
			return { end: i + (triple ? 3 : 2), type: triple ? "triple" : "normal" };
		}
		i++;
	}
	return null;
}
