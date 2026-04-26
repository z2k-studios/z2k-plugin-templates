
import moment from 'moment';   // npm i moment
import Handlebars, { HelperOptions } from 'handlebars';   // npm i handlebars
import { parse } from '@handlebars/parser';   // npm i @handlebars/parser
import type { AST } from '@handlebars/parser';
import YAML, { isMap, YAMLMap } from 'yaml';   // npm i yaml
import { evaluate } from 'mathjs';   // npm i mathjs
import numeral from 'numeral';   // npm i numeral @types/numeral

class Z2KTemplateEngine {
	private static getBuiltInVars(): Record<string, VarValueType> {
		const builtIns: Record<string, VarValueType> = {};
		builtIns["now"] = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
		builtIns["date"] = moment().format("YYYY-MM-DD");
		builtIns["time"] = moment().format("HH:mm");
		builtIns["utcTime"] = moment.utc().format("HH:mm:ss [UTC]");
		builtIns["today"] = moment().format("YYYY-MM-DD");
		builtIns["yesterday"] = moment().subtract(1, 'days').format("YYYY-MM-DD");
		builtIns["tomorrow"] = moment().add(1, 'days').format("YYYY-MM-DD");
		builtIns["timestamp"] = moment().format("YYYYMMDDHHmmss");
		builtIns["dayOfWeek"] = moment().format("dddd");
		builtIns["weekNum"] = moment().format("WW");
		builtIns["year"] = moment().format("YYYY");
		builtIns["yearWeek"] = moment().format("YYYY-[w]WW");
		builtIns["yearMonth"] = moment().format("YYYY-MM");
		builtIns["yearMonthName"] = moment().format("YYYY-MM MMMM");
		builtIns["yearQuarter"] = moment().format("YYYY-[Q]Q");
		return builtIns;
	}
	private static getHelperFunctions(): { [name: string]: Handlebars.HelperDelegate } {
		const helperFunctions: { [name: string]: Handlebars.HelperDelegate } = {};
		// getArg retrieves positional arguments, excluding the Handlebars options object (last element)
		const getArg = <T=string>(args: unknown[], idx: number, fallback: T): T => {
			// Only access args[idx] if idx is within valid range (excluding options object)
			if (idx >= 0 && idx < args.length - 1) {
				return (args[idx] as T) ?? fallback;
			}
			return fallback;
		};

		helperFunctions["fieldInfo"] = function(options: any) { return ""; };
		helperFunctions["fi"] = helperFunctions["fieldInfo"];
		helperFunctions["fieldOutput"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			// fieldName is passed as a PathExpression, so Handlebars resolves it to its value
			const fieldValue = options.hash?.fieldName ?? getArg(args, 0, null);
			return fieldValue;
		};
		helperFunctions["fo"] = helperFunctions["fieldOutput"];

		helperFunctions["formatDate"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			let format: unknown = options.hash?.format ?? getArg(args, 0, null);
			let value:  unknown = options.hash?.value  ?? getArg(args, 1, null);
			// If no value provided, use current date/time
			const dateValue = value == null ? new Date() : value;
			const m = moment(dateValue as moment.MomentInput);
			if (!m.isValid()) { return dateValue; }
			const formatStr = typeof format === 'string' ? format : "YYYY-MM-DD";
			return m.format(formatStr);
		};
		helperFunctions["formatString"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			let value:    unknown = options.hash?.value    ?? getArg(args, 0, null);
			let template: unknown = options.hash?.template ?? getArg(args, 1, "{{value}}");
			if (value == null) { return value; }
			const templateStr = typeof template === 'string' ? template : "{{value}}";
			return templateStr.replace(/\{\{value\}\}/g, String(value));
		};
		helperFunctions["formatStringToUpper"] = (value: unknown) => {
			return (value == null) ? value : String(value).toUpperCase();
		};
		helperFunctions["formatStringToLower"] = (value: unknown) => {
			return (value == null) ? value : String(value).toLowerCase();
		};
		helperFunctions["formatStringSpacify"] = (value: unknown) => {
			if (value == null) { return value; }
			let str = String(value);
			str = str.charAt(0).toUpperCase() + str.slice(1);
			return str
				.replace(/([a-z0-9])([A-Z])/g, '$1 $2')      // ParseXML → Parse XML, GLTF2L → GLTF2 L
				.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // XMLFile → XML File, HTTPServer → HTTP Server
				.trim();
			// return (value == null) ? value : String(value).replace(/([A-Z])/g, ' $1').trim();
		};
		helperFunctions["formatStringBulletize"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			let value:  unknown = options.hash?.value  ?? getArg(args, 0, null);
			let indent: unknown = options.hash?.indent ?? getArg(args, 1, 0);
			let start:  unknown = options.hash?.start  ?? getArg(args, 2, "");
			let end:    unknown = options.hash?.end    ?? getArg(args, 3, "");

			if (value == null) { return value; }

			if (typeof indent === "number") {
				indent = "    ".repeat(indent) + "- ";
			} else if (typeof indent !== "string") {
				indent = "- ";
			}

			let str: string;
			if (Array.isArray(value)) {
				str = value.map(v => `${indent}${String(v)}`).join('\n');
			} else if (typeof value === 'string') {
				str = value.split('\n').map(v => `${indent}${v}`).join('\n');
			} else {
				str = `${indent}${String(value)}`; // Fallback for non-string/array values
			}
			if (typeof start === 'string') { str = start + str; }
			if (typeof end === 'string') { str = str + end; }
			return str;
		};
		helperFunctions["formatStringTrim"] = (value: unknown) => {
			if (value == null) { return value; }
			return String(value).trim();
		};
		helperFunctions["formatStringRaw"] = (value: unknown) => {
			if (value == null) { return value; }
			return new Handlebars.SafeString(String(value));
		};
		helperFunctions["formatStringFileFriendly"] = (value: unknown) => {
			if (value == null) { return value; }

			// Windows reserved names (case-insensitive)
			const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

			let result = String(value)
				// Replace illegal Windows filesystem characters with space
				.replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
				// Collapse multiple spaces into single space
				.replace(/\s+/g, ' ')
				// Remove leading dots and spaces
				.replace(/^[.\s]+/, '')
				// Remove trailing dots and spaces
				.replace(/[.\s]+$/, '')
				.trim();

			// Handle case where entire name was dots (like "." or "..")
			if (result === '') { return '_'; }

			// Prefix Windows reserved names
			if (reservedNames.test(result.replace(/\.[^.]*$/, ''))) {
				result = '_' + result;
			}

			return result;
		};
		const slugify = (value: unknown): string => {
			if (value == null) { return ''; }
			return String(value)
				.toLowerCase()
				.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
				.replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (except spaces and hyphens)
				.replace(/\s+/g, '-') // Spaces to hyphens
				.replace(/-+/g, '-') // Collapse multiple hyphens
				.replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
		};
		helperFunctions["formatStringSlugify"] = (value: unknown) => {
			if (value == null) { return value; }
			return slugify(value);
		};
		helperFunctions["formatStringEncodeURI"] = (value: unknown) => {
			if (value == null) { return value; }
			return encodeURIComponent(String(value));
		};
		helperFunctions["formatStringEncodeBase64"] = (value: unknown) => {
			if (value == null) { return value; }
			return btoa(String(value));
		};
		helperFunctions["formatStringCommafy"] = (value: unknown) => {
			if (value == null) { return value; }
			if (Array.isArray(value)) {
				return value.join(', ');
			}
			return String(value);
		};

		// Number Formatting Helpers
		helperFunctions["formatNumber"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			const format = getArg(args, 1, '0,0');
			if (value == null) { return value; }
			const num = Number(value);
			if (isNaN(num)) { return value; }
			return numeral(num).format(String(format));
		};
		helperFunctions["formatNumberToFixed"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			const decimals = getArg(args, 1, 0);
			if (value == null) { return value; }
			const num = Number(value);
			if (isNaN(num)) { return value; }
			return num.toFixed(Number(decimals) || 0);
		};

		// Data Structure Helpers
		helperFunctions["arr"] = (...args: unknown[]) => {
			// Remove the Handlebars options object from the end
			args.pop();
			return args;
		};
		helperFunctions["obj"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			return options.hash;
		};

		// Linking Helpers
		helperFunctions["wikilink"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			let value:       unknown = options.hash?.value       ?? getArg(args, 0, null);
			let displayText: unknown = options.hash?.displayText ?? getArg(args, 1, null);
			if (value == null) { return value; }
			if (typeof value === 'string' && value.startsWith("[[") && value.endsWith("]]")) {
				if (displayText == null || displayText === "") { return value; } // Already a wikilink with no name
				return value.replace(/\]\]$/, `|${String(displayText)}]]`); // Already a wikilink, just add the name
			}
			if (displayText == null || displayText === "") { return `[[${String(value)}]]`; } // No display text
			return `[[${String(value)}|${String(displayText)}]]`;
		};
		helperFunctions["url"] = (...args: unknown[]) => {
			const options = args[args.length - 1] as HelperOptions;
			let value:       unknown = options.hash?.value       ?? getArg(args, 0, null);
			let displayText: unknown = options.hash?.displayText ?? getArg(args, 1, null);
			if (value == null) { return value; }
			if (displayText == null || displayText === "") { return `[${String(value)}](${String(value)})`; }
			return `[${String(displayText)}](${String(value)})`;
		};
		helperFunctions["hashtag"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			if (value == null) { return value; }
			return `#${String(value)}`;
		};
		helperFunctions["google"] = (...args: unknown[]) => {
			const searchText = getArg(args, 0, null);
			const displayText = getArg(args, 1, null);
			if (searchText == null) { return searchText; }
			const slug = slugify(searchText);
			const url = `https://google.com/search?q=${slug}`;
			const display = displayText != null ? String(displayText) : url;
			return `[${display}](${url})`;
		};
		helperFunctions["chatGPT"] = (...args: unknown[]) => {
			const chatText = getArg(args, 0, null);
			const displayText = getArg(args, 1, null);
			if (chatText == null) { return chatText; }
			const encoded = encodeURIComponent(String(chatText));
			const url = `https://chatgpt.com/?prompt=${encoded}`;
			const display = displayText != null ? String(displayText) : String(chatText);
			return `[${display}](${url})`;
		};
		helperFunctions["wikipedia"] = (...args: unknown[]) => {
			const searchText = getArg(args, 0, null);
			const displayText = getArg(args, 1, null);
			if (searchText == null) { return searchText; }
			const slug = slugify(searchText);
			const url = `https://en.wikipedia.org/w/index.php?search=${slug}`;
			const display = displayText != null ? String(displayText) : url;
			return `[${display}](${url})`;
		};

		// Comparison Helpers
		helperFunctions["eq"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			return a === b;
		};
		helperFunctions["ne"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			return a !== b;
		};
		helperFunctions["lt"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			if (a == null || b == null) { return false; }
			return a < b;
		};
		helperFunctions["lte"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			if (a == null || b == null) { return false; }
			return a <= b;
		};
		helperFunctions["gt"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			if (a == null || b == null) { return false; }
			return a > b;
		};
		helperFunctions["gte"] = (...args: unknown[]) => {
			const a = getArg(args, 0, null);
			const b = getArg(args, 1, null);
			if (a == null || b == null) { return false; }
			return a >= b;
		};

		// Math Helpers
		helperFunctions["add"] = (...args: unknown[]) => {
			const a = getArg(args, 0, 0);
			const b = getArg(args, 1, 0);
			return Number(a) + Number(b);
		};
		helperFunctions["subtract"] = (...args: unknown[]) => {
			const a = getArg(args, 0, 0);
			const b = getArg(args, 1, 0);
			return Number(a) - Number(b);
		};
		helperFunctions["multiply"] = (...args: unknown[]) => {
			const a = getArg(args, 0, 0);
			const b = getArg(args, 1, 0);
			return Number(a) * Number(b);
		};
		helperFunctions["divide"] = (...args: unknown[]) => {
			const a = getArg(args, 0, 0);
			const b = getArg(args, 1, 1);
			if (Number(b) === 0) { return null; }
			return Number(a) / Number(b);
		};
		helperFunctions["calc"] = (...args: unknown[]) => {
			const expr = getArg(args, 0, null);
			if (expr == null) { return null; }
			try {
				const result = evaluate(String(expr));
				return typeof result === 'number' ? result : null;
			} catch {
				return null;
			}
		};
		helperFunctions["dateAdd"] = (...args: unknown[]) => {
			const days = getArg(args, 0, 0);
			const sourceTime = getArg(args, 1, null);
			const base = sourceTime != null ? moment(sourceTime) : moment();
			if (!base.isValid()) { return null; }
			// Convert days to milliseconds to support fractional days (e.g., 1/24 for one hour)
			const totalMs = Number(days) * 24 * 60 * 60 * 1000;
			return base.add(totalMs, 'milliseconds').toDate();
		};
		helperFunctions["random"] = (...args: unknown[]) => {
			const arr = getArg<unknown>(args, 0, null);
			if (!Array.isArray(arr) || arr.length === 0) { return null; }
			return arr[Math.floor(Math.random() * arr.length)];
		};

		// Type Conversion Helpers
		helperFunctions["toNumber"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			if (value == null) { return null; }
			const num = Number(value);
			return isNaN(num) ? null : num;
		};
		helperFunctions["toBool"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			if (value == null) { return false; }
			if (typeof value === 'boolean') { return value; }
			const str = String(value).toLowerCase();
			return str === 'true' || str === '1' || str === 'yes' || str === 'y' || str === 'on' || str === 'enabled' || str === 'enable';
		};
		helperFunctions["toString"] = (...args: unknown[]) => {
			const value = getArg(args, 0, null);
			return value == null ? '' : String(value);
		};

		return helperFunctions;
	}
	static reducedRenderContent(content: VarValueType, context: Record<string, any> = {}, processEscapes: boolean = false, userHelpers?: Record<string, Function>): VarValueType {
		if (Array.isArray(content)) {
			let renderedArray: VarValueType[] = [];
			for (const item of content) {
				renderedArray.push(this.reducedRenderContent(item, context, processEscapes, userHelpers));
			}
			return renderedArray;
		}
		if (typeof content !== 'string') { return content; }

		// Merge built-in helpers with user-provided helpers (user helpers override built-ins)
		const allHelpers = { ...this.getHelperFunctions(), ...userHelpers };

		// Single Expression vs Template Rendering
		//
		// GP Note: this was marked with a documentation flag. Claude and I went around on it many 
		// times, and we don't fully understand what this means, but we did make a reference in the 
		// documentation at:
		//    reference_manual/Template Fields/Field Types#Type Preservation in Expressions
		//
		// When content is exactly `{{expression}}` with no surrounding text, we treat it as
		// an expression evaluation that should preserve the return type (array, number, boolean, etc.).
		// When content has any text outside the braces (e.g., `Hello {{name}}` or `{{a}} and {{b}}`),
		// it's treated as template rendering and always returns a string.
		//
		// Why this matters: Handlebars always stringifies output during template rendering.
		// For example, `{{arr "a" "b"}}` would return the array ["a", "b"] from the helper,
		// but Handlebars converts it to "a,b" when rendering. This is correct for templates
		// (you want string output), but wrong for expression evaluation (you want the actual value).
		//
		// To preserve types for single expressions, we wrap the inner expression in a capture
		// helper that stashes the evaluated result before Handlebars stringifies it.
		// For helper calls, we use subexpression syntax: `{{__capture__ (helperCall arg)}}`
		// For value lookups, we pass directly: `{{__capture__ varName}}`
		// Parentheses in Handlebars mean "call as helper", so using them on plain values fails.
		//
		// We use the AST to detect single expressions rather than regex, because regex can't
		// reliably distinguish `{{a}}` from `{{a}} and {{b}}` or handle nested braces correctly.
		// If content isn't parseable as Handlebars (e.g., raw user content in clipboard/sourceText
		// that happens to contain '{{' or unmatched quotes), it has no template expressions to
		// evaluate — return it as-is. Genuine template bugs in author-declared content will still
		// surface during the main render pass over the template body.
		let ast: AST.Program;
		try {
			ast = parse(content);
		} catch {
			return content;
		}
		const isSingleExpression = ast.body.length === 1 && ast.body[0].type === 'MustacheStatement';
		if (isSingleExpression) {
			const mustache = ast.body[0] as AST.MustacheStatement;
			// Extract the inner expression (everything between {{ and }})
			const [startChar, endChar] = this.getCharNumsFromLoc(content, mustache.loc);
			let innerContent = content.substring(startChar, endChar);
			// Remove outer {{ }} and whitespace control tildes
			innerContent = innerContent.replace(/^\{\{~?\s*/, '').replace(/\s*~?\}\}$/, '');

			let capturedValue: VarValueType = undefined;
			const helpers = { ...allHelpers };
			helpers["__capture274__"] = (value: VarValueType) => {
				capturedValue = value;
				return "";
			};
			// Detect if this is a helper call that needs subexpression syntax (parentheses)
			const isHelperCall = (() => {
				// Has params or hash → definitely a helper call
				if (mustache.params?.length > 0 || mustache.hash?.pairs?.length > 0) {
					return true;
				}
				// Not a PathExpression (e.g., literal) → not a helper call
				if (mustache.path.type !== 'PathExpression') {
					return false;
				}
				// Check if base name is a registered helper
				const path = mustache.path as AST.PathExpression;
				const baseName = path.parts[0];
				return typeof baseName === 'string' && baseName in allHelpers;
			})();
			// Only use parentheses for helper calls (subexpression syntax)
			// For value lookups, pass directly without parentheses
			const wrappedContent = isHelperCall
				? `{{__capture274__ (${innerContent})}}`
				: `{{__capture274__ ${innerContent}}}`;
			// Validate original content before execution
			this.validateHandlebarsTemplate(content, helpers, context, ast);
			try {
				const renderFn = Handlebars.compile(wrappedContent);
				renderFn(context, { helpers });
			} catch (e: any) {
				throw this.wrapHandlebarsError(e, content);
			}
			if (processEscapes && typeof capturedValue === 'string') {
				capturedValue = this.processStringEscapes(capturedValue);
			}
			return capturedValue;
		}

		// Template rendering - always returns string
		let preserveExpressions: Record<string, string> = {};
		let preprocessedContent = this.preserveExpressionsPreprocess(content, ast, preserveExpressions, context, "", true);
		// Validate before execution
		this.validateHandlebarsTemplate(content, allHelpers, context, ast);
		let renderedContent: string;
		try {
			const renderFn = Handlebars.compile(preprocessedContent);
			renderedContent = renderFn(context, { helpers: allHelpers });
		} catch (e: any) {
			throw this.wrapHandlebarsError(e, content);
		}
		let unescapedContent = this.unescapeMostHtmlEntities(renderedContent);
		renderedContent = this.preserveExpressionsPostprocess(unescapedContent, preserveExpressions);
		if (processEscapes) {
			renderedContent = this.processStringEscapes(renderedContent);
		}
		return renderedContent;
	}
	// Converts \n → newline, \t → tab, \\ → backslash
	private static processStringEscapes(str: string): string {
		return str
			.replace(/\\\\/g, '\x00')  // Temporarily replace \\ with placeholder
			.replace(/\\n/g, '\n')
			.replace(/\\t/g, '\t')
			.replace(/\x00/g, '\\');   // Restore \\ as single backslash
	}

	// Pre-check for common Handlebars errors before execution
	private static validateHandlebarsTemplate(
		content: string,
		helpers: Record<string, Function>,
		context: Record<string, any>,
		ast?: AST.Program
	): void {
		if (!ast) { ast = parse(content); }

		const checkNode = (node: AST.Node) => {
			if (node.type === 'MustacheStatement' || node.type === 'BlockStatement') {
				const statement = node as AST.MustacheStatement | AST.BlockStatement;
				if (statement.path.type === 'PathExpression') {
					const pathExpr = statement.path as AST.PathExpression;
					const name = pathExpr.original;
					const hasArgs = statement.params.length > 0 || (statement.hash?.pairs?.length ?? 0) > 0;
					// Check our custom helpers AND Handlebars built-in helpers
					const isHelper = name in helpers || name in Handlebars.helpers;
					const isInContext = name in context;
					// If it has arguments, it must be a helper call
					if (hasArgs && !isHelper) {
						if (isInContext) {
							throw new Error(`'${name}' is a value, not a helper function. Cannot call it with arguments.`);
						} else {
							throw new Error(`Helper '${name}' not found. Check for typos or ensure it's registered.`);
						}
					}
				}
			}
			// Recurse into child nodes
			if (node.type === 'Program') {
				(node as AST.Program).body.forEach(checkNode);
			} else if (node.type === 'BlockStatement') {
				const block = node as AST.BlockStatement;
				checkNode(block.program);
				if (block.inverse) { checkNode(block.inverse); }
			}
		};

		ast.body.forEach(checkNode);
	}

	// Wrap Handlebars errors with context about what template was being evaluated
	private static wrapHandlebarsError(error: Error, templateContent: string): Error {
		const preview = templateContent.length > 100
			? templateContent.substring(0, 100) + '...'
			: templateContent;
		return new Error(`Handlebars error in '${preview}': ${error.message}`);
	}

	static reducedGetDependencies(val: VarValueType): string[] {
		if (Array.isArray(val)) {
			let dependencies: string[] = [];
			for (const item of val) {
				dependencies.push(...this.reducedGetDependencies(item));
			}
			return Array.from(new Set(dependencies));
		} else if (typeof val === 'string') {
			// Values can legitimately hold raw user content (clipboard, sourceText, creator, etc.)
			// that isn't valid Handlebars. A value that can't be parsed has no discoverable
			// template references — return []. Genuine template bugs in author-declared field
			// values will still surface at render time.
			try {
				return this.getVarReferences(parse(val));
			} catch {
				return [];
			}
		} else {
			return [];
		}
	}
	// Collects all field names referenced in a fieldInfo's string properties
	static getFieldInfoDependencies(fieldInfo: FieldInfo): string[] {
		// Raw-content fields (clipboard, sourceText, and anything tagged by the author)
		// never contain intentional template expressions, so they have no discoverable deps.
		if (fieldInfo.directives?.includes('raw-content')) { return []; }
		const deps: string[] = [];
		const scan = (val: VarValueType | undefined) => {
			if (val !== undefined) { deps.push(...this.reducedGetDependencies(val)); }
		};
		scan(fieldInfo.value);
		scan(fieldInfo.prompt);
		scan(fieldInfo.suggest);
		scan(fieldInfo.fallback);
		if (fieldInfo.opts) { fieldInfo.opts.forEach(scan); }
		return [...new Set(deps)];
	}
	static async parseTemplate(content: string, systemBlocksContent: string, globalBlockContent: string, path: string, getBlockCallback: (name: string, path: string) => Promise<[found: boolean, content: string, filePath: string]>): Promise<TemplateState> {
		// systemBlocksContent is kept separate because its fieldInfos should be overridden by everything else
		// globalBlockContent is parsed first (after built-ins) and prepended to template content
		let state: TemplateState = {
			templates: [],
			templateASTs: [],
			preprocessedTemplates: [],

			templatesYaml: [],
			templateASTsYaml: [],
			preprocessedTemplatesYaml: [],

			fieldInfos: {},
			referencedFields: new Set(),
			declaredFields: new Set(),
			resolvedValues: {},
			metadata: {},
		}

		// Priority chain: built-in < global < system < block < main
		let fieldInfosBySource: Array<{ source: 'built-in' | 'global' | 'system' | 'main' | 'block', fieldInfos: Record<string, FieldInfo> }> = [];
		this.addBuiltInVarFieldInfos(fieldInfosBySource);
		// Parse global block (after built-ins, before everything else)
		if (globalBlockContent && globalBlockContent.trim() !== "") {
			globalBlockContent = this.normalizeFieldAliases(globalBlockContent);
			const { fm: globalFm, body: globalBody } = Z2KYamlDoc.splitFrontmatter(globalBlockContent);
			if (globalFm && globalFm.trim() !== "") {
				const globalYamlAST = parse(globalFm);
				const globalFieldInfos = this.combineFieldInfoss(
					this.getDefaultFieldInfos(globalYamlAST),
					this.getCustomFieldInfos(globalFm, globalYamlAST)
				);
				fieldInfosBySource.push({ source: 'global', fieldInfos: globalFieldInfos });
			}
			if (globalBody && globalBody.trim() !== "") {
				const globalAst = parse(globalBody);
				const globalFieldInfos = this.combineFieldInfoss(
					this.getDefaultFieldInfos(globalAst),
					this.getCustomFieldInfos(globalBody, globalAst)
				);
				fieldInfosBySource.push({ source: 'global', fieldInfos: globalFieldInfos });
				// Prepend global block body to main body (after YAML frontmatter)
				const { fm: mainFm, body: mainBody } = Z2KYamlDoc.splitFrontmatter(content);
				content = Z2KYamlDoc.joinFrontmatter(mainFm, globalBody + mainBody);
			}
		}
		const dirPath = path.substring(0, path.lastIndexOf('/')) || '';
		await this.parseTemplateRec(state, content, systemBlocksContent, dirPath, 'main', getBlockCallback, fieldInfosBySource, new Set([path]));
		state.fieldInfos = this.combineFieldInfosBySource(fieldInfosBySource);
		this.collectReferencedFields(state);
		this.expandFieldDependencies(state);
		this.applyGlobalFallbackHandling(state);
		this.applyDirectivesAndFieldInfoValues(state);
		return state;
	}
	private static addBuiltInVarFieldInfos(fieldInfosBySource: Array<{ source: 'built-in' | 'global' | 'system' | 'main' | 'block', fieldInfos: Record<string, FieldInfo> }>): void {
		// Create fieldInfos for the built-in vars
		const builtIns = this.getBuiltInVars();
		let builtInFieldInfos: Record<string, FieldInfo> = {};
		for (const [key, value] of Object.entries(builtIns)) {
			builtInFieldInfos[key] = {
				fieldName: key,
				directives: ["no-prompt"],
				value: value,
			};
		}
		fieldInfosBySource.push({
			source: 'built-in',
			fieldInfos: builtInFieldInfos
		});
	};
	private static normalizeFieldAliases(content: string): string {
		// Parse AST and replace field alias names (noteTitle, cardTitle → fileTitle)
		if (!content || content.trim() === "") return content;

		const ast = parse(content);
		const replacements: { start: number; end: number; text: string }[] = [];

		function visit(node: AST.Node) {
			switch (node.type) {
				case 'Program':
					(node as AST.Program).body.forEach(visit);
					break;
				case 'MustacheStatement':
					const mustache = node as AST.MustacheStatement;
					if (mustache.path.type === 'PathExpression') {
						checkPath(mustache.path as AST.PathExpression);
					}
					mustache.params?.forEach(visit);
					mustache.hash?.pairs?.forEach(pair => visit(pair.value));
					break;
				case 'BlockStatement':
					const block = node as AST.BlockStatement;
					if (block.path.type === 'PathExpression') {
						checkPath(block.path as AST.PathExpression);
					}
					block.params?.forEach(visit);
					block.hash?.pairs?.forEach(pair => visit(pair.value));
					visit(block.program);
					if (block.inverse) { visit(block.inverse); }
					break;
				case 'SubExpression':
					const subexpr = node as AST.SubExpression;
					if (subexpr.path.type === 'PathExpression') {
						checkPath(subexpr.path as AST.PathExpression);
					}
					subexpr.params?.forEach(visit);
					subexpr.hash?.pairs?.forEach(pair => visit(pair.value));
					break;
				case 'PartialStatement':
				case 'PartialBlockStatement':
					const partial = node as AST.PartialStatement | AST.PartialBlockStatement;
					partial.params?.forEach(visit);
					partial.hash?.pairs?.forEach(pair => visit(pair.value));
					if ('program' in partial && partial.program) {
						visit(partial.program);
					}
					break;
				case 'PathExpression':
					checkPath(node as AST.PathExpression);
					break;
			}
		}

		function checkPath(path: AST.PathExpression) {
			if (path.original === 'noteTitle' || path.original === 'cardTitle') {
				const [start, end] = Z2KTemplateEngine.getCharNumsFromLoc(content, path.loc);
				replacements.push({ start, end, text: 'fileTitle' });
			}
		}

		visit(ast);

		// Apply all edits back-to-front to keep indices valid
		replacements.sort((a, b) => b.start - a.start);
		let out = content;
		for (const r of replacements) {
			out = out.slice(0, r.start) + r.text + out.slice(r.end);
		}
		return out;
	}

	private static async parseTemplateRec(
		state: TemplateState, content: string, systemBlocksContent: string, path: string, source: 'built-in' | 'global' | 'system' | 'main' | 'block',
		getBlockCallback: (name: string, path: string) => Promise<[found: boolean, content: string, filePath: string]>,
		fieldInfosBySource: Array<{ source: 'built-in' | 'global' | 'system' | 'main' | 'block', fieldInfos: Record<string, FieldInfo> }>,
		includeChain: Set<string> = new Set()
	): Promise<void> {
		// Normalize field aliases first, before any other parsing
		content = this.normalizeFieldAliases(content);
		systemBlocksContent = this.normalizeFieldAliases(systemBlocksContent);

		let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
		let systemFm = "";
		let systemBody = "";
		if (systemBlocksContent && systemBlocksContent.trim() !== "") {
			({ fm: systemFm, body: systemBody } = Z2KYamlDoc.splitFrontmatter(systemBlocksContent));
		}

		// Extract fieldInfos but defer pushing until after block recursion
		// This ensures outer blocks override inner blocks (children before self)
		let fmFieldInfos: Record<string, FieldInfo> | null = null;

		if (fm && fm.trim() !== "") {
			let yamlAST = parse(fm);
			fmFieldInfos = this.combineFieldInfoss(this.getDefaultFieldInfos(yamlAST), this.getCustomFieldInfos(fm, yamlAST));

			// Add in the system blocks frontmatter, if any
			// This is done separately so that we can keep system fieldInfos separate
			if (systemFm && systemFm.trim() !== "") {
				let systemYamlAST = parse(systemFm);
				let systemFieldInfos = this.combineFieldInfoss(this.getDefaultFieldInfos(systemYamlAST), this.getCustomFieldInfos(systemFm, systemYamlAST));
				fieldInfosBySource.push({ source: 'system', fieldInfos: systemFieldInfos });

				// Merge and reparse the YAML frontmatter, with system blocks first
				fm = Z2KYamlDoc.mergeLastWins([systemFm, fm]);
				yamlAST = parse(fm);
			}
			state.templatesYaml.push(fm);
			state.templateASTsYaml.push(yamlAST);
			state.preprocessedTemplatesYaml.push(fm); // No preprocessing for YAML frontmatter

		}

		let ast = parse(body);
		let bodyFieldInfos = this.combineFieldInfoss(this.getDefaultFieldInfos(ast), this.getCustomFieldInfos(body, ast));

		// Add in the system blocks body, if any
		if (systemBody && systemBody.trim() !== "") {
			// Prepend the system blocks body to the main body
			let systemAst = parse(systemBody);
			let systemFieldInfos = this.combineFieldInfoss(this.getDefaultFieldInfos(systemAst), this.getCustomFieldInfos(systemBody, systemAst));
			fieldInfosBySource.push({ source: 'system', fieldInfos: systemFieldInfos });

			body = systemBody + body;
			ast = parse(body);
		}

		const { preprocessedContent, blockNames, locations } = this.preprocessTemplateContent(body, ast, state);
		state.templates.push(body);
		state.preprocessedTemplates.push(preprocessedContent);
		state.templateASTs.push(parse(preprocessedContent)); // Reparse the preprocessed content to get correct AST for blocks

		// Recurse into nested blocks FIRST
		for (let i = 0; i < blockNames.length; i++) {
			let [ found, blockContent, blockFilePath ] = await getBlockCallback(blockNames[i], path);
			if (!found) {
				throw new TemplateError(`Block not found: ${blockNames[i]}`, body, locations[i], `Tried to resolve relative to path '${path}'`);
			}
			if (includeChain.has(blockFilePath)) {
				throw new TemplateError(
					`Circular include detected: '${blockNames[i]}' is already included in the current chain`,
					body, locations[i],
					`Include chain: ${[...includeChain].join(' -> ')} -> ${blockFilePath}`
				);
			}
			const blockDirPath = blockFilePath.substring(0, blockFilePath.lastIndexOf('/')) || '';
			const childChain = new Set(includeChain);
			childChain.add(blockFilePath);
			await this.parseTemplateRec(state, blockContent, "", blockDirPath, 'block', getBlockCallback, fieldInfosBySource, childChain);
		}

		// THEN push this template's fieldInfos (after nested blocks, so outer wins over inner)
		if (fmFieldInfos) {
			fieldInfosBySource.push({ source, fieldInfos: fmFieldInfos });
		}
		fieldInfosBySource.push({ source, fieldInfos: bodyFieldInfos });
	}

	private static getVarReferences(ast: AST.Program): string[] {
		// Traverse the AST to find all top-level variable references
		const references = new Set<string>();

		function visit(node: AST.Node) {
			switch (node.type) {
				case 'Program':
					const program = node as AST.Program;
					program.body.forEach(visit);
					break;
				case 'MustacheStatement':
					const mustache = node as AST.MustacheStatement;
					// Only treat callee as a var if it's a bare mustache (no params/hash)
					if (mustache.path.type === 'PathExpression' &&
						(!mustache.params || mustache.params.length === 0) &&
						(!mustache.hash || mustache.hash.pairs.length === 0)) {
						addPath(mustache.path as AST.PathExpression);
					}
					mustache.params?.forEach(visit);
					mustache.hash?.pairs?.forEach(pair => visit(pair.value));
					break;
				case 'BlockStatement':
					const block = node as AST.BlockStatement;
					block.params?.forEach(visit);
					block.hash?.pairs?.forEach(pair => visit(pair.value));
					visit(block.program);
					if (block.inverse) { visit(block.inverse); }
					break;
				case 'SubExpression':
					const subexpr = node as AST.SubExpression;
					subexpr.params?.forEach(visit);
					subexpr.hash?.pairs?.forEach(pair => visit(pair.value));
					break;
				case 'PartialStatement':
				case 'PartialBlockStatement':
					const partial = node as AST.PartialStatement | AST.PartialBlockStatement;
					partial.params?.forEach(visit);
					partial.hash?.pairs?.forEach(pair => visit(pair.value));
					if ('program' in partial && partial.program) {
						visit(partial.program);
					}
					break;
				case 'PathExpression':
					addPath(node as AST.PathExpression);
					break;
			}
		}

		function addPath(path: AST.PathExpression) {
			// Only extract single-segment, non-data paths (excluding 'this')
			if (path.data) { return; }
			if (path.parts.length !== 1) { return; }
			if (path.original === 'this') { return; }
			const part = path.parts[0];
			if (typeof part !== 'string') { return; }
			// Normalize aliases: noteTitle and cardTitle → fileTitle
			let fieldName = part;
			if (fieldName === 'noteTitle' || fieldName === 'cardTitle') {
				fieldName = 'fileTitle';
			}
			references.add(fieldName);
		}

		visit(ast);
		return [...references];
	}
	private static getDefaultFieldInfos(ast: AST.Program): Record<string, FieldInfo> {
		// Make bare fieldInfos for standalone variable references
		// References inside strings (prompt, suggest, fallback, value, opts) are handled by expandFieldDependencies
		const references = this.getVarReferences(ast);
		const defaultFieldInfos: Record<string, FieldInfo> = {};
		for (const ref of references) {
			defaultFieldInfos[ref] = { fieldName: ref };
		}
		return defaultFieldInfos;
	}
	private static getCustomFieldInfos(content: string, ast: AST.Program): Record<string, FieldInfo> {
		// Traverse the AST and find and validate all fieldInfo mustache statements
		// Extract source text and wrap for deferred evaluation
		function expressionToString(expr: AST.Expression): string {
			const [start, end] = Z2KTemplateEngine.getCharNumsFromLoc(content, expr.loc);
			let source = content.substring(start, end);

			// Strip outer parentheses from SubExpression
			if (expr.type === 'SubExpression') {
				source = source.replace(/^\(|\)$/g, '');
			}

			return `{{${source}}}`;
		}

		// Helper to parse value from AST expression
		function parseValue(expr: AST.Expression): VarValueType {
			if (expr.type === 'StringLiteral') return (expr as AST.StringLiteral).value;
			if (expr.type === 'NumberLiteral') return (expr as AST.NumberLiteral).value;
			if (expr.type === 'BooleanLiteral') return (expr as AST.BooleanLiteral).value;
			if (expr.type === 'UndefinedLiteral') return undefined;
			if (expr.type === 'NullLiteral') return undefined;
			// PathExpression or SubExpression - defer evaluation
			return expressionToString(expr);
		}

		// Traverse the AST and find all variable references and fieldInfo mustache statements
		function visit(node: AST.Node) {
			if (node.type === 'Program') {
				const program = node as AST.Program;
				program.body.forEach(visit);
				return;
			}

			if (node.type !== 'MustacheStatement') { return; }
			const mustache = node as AST.MustacheStatement;
			if (mustache.path.type !== 'PathExpression') { return; }
			const path = mustache.path as AST.PathExpression;
			if (!['fieldInfo', 'fieldOutput', 'fi', 'fo'].includes(path.original)) { return; }
			const helperName = path.original;

			// Validate and collect positional params (fieldName, prompt, suggest, type)
			const positional = mustache.params.map((p, i) => {
				if (i === 0) {
					if (p.type === 'PathExpression') { return (p as AST.PathExpression).original; }
					throw new TemplateError(`fieldName must be a bare identifier (unquoted)`, content, mustache.loc);
				}
				return parseValue(p);
			});

			// Validate and collect named params
			const named: Record<string, VarValueType> = {};
			mustache.hash?.pairs?.forEach(pair => {
				if (pair.key === 'fieldName') {
					if (pair.value.type === 'PathExpression') {
						named['fieldName'] = (pair.value as AST.PathExpression).original;
					} else {
						throw new TemplateError(`fieldName must be a bare identifier (unquoted)`, content, pair.value.loc ?? mustache.loc);
					}
					return;
				}

				// Special handling for opts array
				if (pair.key === 'opts') {
					// Allow either (arr ...) SubExpression or comma-delimited string
					if (pair.value.type === 'SubExpression') {
						const sub = pair.value as AST.SubExpression;
						if (sub.path.type !== 'PathExpression' || (sub.path as AST.PathExpression).original !== 'arr') {
							throw new TemplateError(`opts must be either an array using (arr ...) helper or a comma-delimited string`, content, pair.value.loc ?? mustache.loc);
						}
						named['opts'] = sub.params.map(parseValue);
					} else if (pair.value.type === 'StringLiteral') {
						// Parse comma-delimited string - all values remain as strings
						const str = (pair.value as AST.StringLiteral).value;
						named['opts'] = str.split(',').map(s => s.trim());
					} else {
						throw new TemplateError(`opts must be either an array using (arr ...) helper or a comma-delimited string`, content, pair.value.loc ?? mustache.loc);
					}
					return;
				}

				// Special handling for directives (convert to array if string)
				if (pair.key === 'directives') {
					const val = parseValue(pair.value);
					if (typeof val === 'string') {
						named['directives'] = val.split(',').map(s => s.trim());
					} else {
						throw new TemplateError(`directives must be a string (comma delimited list)`, content, pair.value.loc ?? mustache.loc);
					}
					return;
				}

				named[pair.key] = parseValue(pair.value);
			});

			// Merge (named overrides positional)
			const merged = {
				fieldName: (named['fieldName'] ?? positional[0]) as string | undefined,
				prompt: named['prompt'] ?? positional[1] as VarValueType | undefined,
				suggest: named['suggest'] ?? positional[2] as VarValueType | undefined,
				type: named['type'] ?? positional[3] as VarValueType | undefined,
				opts: named['opts'] as VarValueType[] | undefined,
				fallback: named['fallback'] as VarValueType | undefined,
				directives: named['directives'] as string[] | undefined,
				value: named['value'] as VarValueType | undefined,
			};

			if (!merged.fieldName) {
				throw new TemplateError(`Missing fieldName in ${helperName}`, content, mustache.loc);
			}

			// Validate and set fields
			const fieldInfo: FieldInfo = { fieldName: merged.fieldName };
			if (merged.prompt !== undefined) { fieldInfo.prompt = merged.prompt; }
			if (merged.suggest !== undefined) { fieldInfo.suggest = merged.suggest; }
			if (merged.fallback !== undefined) { fieldInfo.fallback = merged.fallback; }

			// Validate type
			if (merged.type !== undefined) {
				const typeStr = String(merged.type).toLowerCase();
				// Find matching DataType (case-insensitive)
				const matchedType = DataTypeValues.find(dt => dt.toLowerCase() === typeStr);
				if (matchedType) {
					fieldInfo.type = matchedType;
				} else {
					throw new TemplateError(`Invalid data type: '${merged.type}'`, content, mustache.loc);
				}

				// Validate opts for select types
				if (fieldInfo.type === 'singleSelect' || fieldInfo.type === 'multiSelect') {
					if (!merged.opts) {
						throw new TemplateError(`opts required for type '${fieldInfo.type}'`, content, mustache.loc);
					}
					if (merged.opts.length === 0) {
						throw new TemplateError(`opts cannot be empty for type '${fieldInfo.type}'`, content, mustache.loc);
					}
					fieldInfo.opts = merged.opts;
				} else if (merged.opts) {
					throw new TemplateError(`opts not allowed for type '${fieldInfo.type}'`, content, mustache.loc);
				}
			}

			// Parse directives
			if (merged.directives) {
				fieldInfo.directives = [];
				for (const dir of merged.directives) {
					if (!DirectiveValues.includes(dir as Directive)) {
						throw new TemplateError(`Unknown directive '${dir}' in ${helperName}`, content, mustache.loc);
					}
					// Remove counterparts (later wins)
					const counterparts = DirectiveCounterparts[dir];
					if (counterparts) {
						fieldInfo.directives = fieldInfo.directives.filter(d => !counterparts.includes(d));
					}
					if (!fieldInfo.directives.includes(dir as Directive)) {
						fieldInfo.directives.push(dir as Directive);
					}
				}
			}

			if (merged.value !== undefined) {
				fieldInfo.value = merged.value;
			}

			const mergedFieldInfo = Z2KTemplateEngine.combineFieldInfos(fieldInfos[merged.fieldName], fieldInfo);
			if (mergedFieldInfo) { fieldInfos[merged.fieldName] = mergedFieldInfo; }
		}

		let fieldInfos: Record<string, FieldInfo> = {};
		visit(ast);
		return fieldInfos;
	}

	// source fieldInfos override target fieldInfos
	private static combineFieldInfos(target: FieldInfo | undefined, source: FieldInfo | undefined): FieldInfo | undefined {
		// Needs special merging logic for directives
		if (!target && !source) { return undefined; }
		if (!target) { return source; }
		if (!source) { return target; }
		const combined: FieldInfo = { ...target, ...source };
		if (target?.directives || source?.directives) {
			// Start with target directives
			let directives: Directive[] = target.directives ? [...target.directives] : [];
			// Add source directives, removing counterparts (later wins)
			if (source.directives) {
				for (const dir of source.directives) {
					const counterparts = DirectiveCounterparts[dir];
					if (counterparts) {
						directives = directives.filter(d => !counterparts.includes(d));
					}
					if (!directives.includes(dir)) {
						directives.push(dir);
					}
				}
			}
			combined.directives = directives;
		}
		return combined;
	}
	private static combineFieldInfoss(targets: Record<string, FieldInfo>, sources: Record<string, FieldInfo>): Record<string, FieldInfo> {
		const combined: Record<string, FieldInfo> = { ...targets };
		for (const [key, sourceFieldInfo] of Object.entries(sources)) {
			const targetFieldInfo = combined[key];
			combined[key] = this.combineFieldInfos(targetFieldInfo, sourceFieldInfo)!;
		}
		return combined;
	}
	private static combineFieldInfosBySource(fieldInfosBySource: Array<{ source: 'built-in' | 'global' | 'system' | 'main' | 'block', fieldInfos: Record<string, FieldInfo> }>): Record<string, FieldInfo> {
		// Combine fieldInfos in order of priority: built-in < global < system < block < main
		let combinedFieldInfos: Record<string, FieldInfo> = {};
		let priority = ['built-in', 'global', 'system', 'block', 'main'];
		for (const source of priority) {
			for (const sourceEntry of fieldInfosBySource) {
				if (sourceEntry.source === source) {
					for (const [key, fieldInfo] of Object.entries(sourceEntry.fieldInfos)) {
						combinedFieldInfos[key] = this.combineFieldInfos(combinedFieldInfos[key], fieldInfo)!;
					}
				}
			}
		}
		return combinedFieldInfos;
	}
	// Ensures every field referenced in fieldInfo string properties exists as a fieldInfo entry,
	// and that transitively-needed fields are marked as referenced
	private static expandFieldDependencies(state: TemplateState): void {
		let changed = true;
		while (changed) {
			changed = false;
			for (const [fieldName, fieldInfo] of Object.entries(state.fieldInfos)) {
				for (const dep of this.getFieldInfoDependencies(fieldInfo)) {
					if (!state.fieldInfos[dep]) {
						state.fieldInfos[dep] = { fieldName: dep };
						changed = true;
					}
					if (state.referencedFields.has(fieldName) && !state.referencedFields.has(dep)) {
						state.referencedFields.add(dep);
						changed = true;
					}
				}
			}
		}
	}
	private static preprocessTemplateContent(content: string, ast: AST.Program, state: TemplateState): { preprocessedContent: string, blockNames: string[], locations: AST.SourceLocation[] } {
		// Extract block names and rename them to `block_${index}` format

		const blockNames: string[] = [];
		const locations: AST.SourceLocation[] = [];
		let preprocessedContent = content;
		let indexOffset = state.templates.length + 1;
		const replacements: { start: number; end: number; text: string }[] = [];

		function visit(node: AST.Node) {
			if (node.type === 'Program') {
				(node as AST.Program).body.forEach(visit);
			} else if (node.type === 'PartialStatement') {
				const partial = node as AST.PartialStatement;
				const nameNodeType = partial.name.type as any; // runtime doesn't match the typing
				let name: string;
				if (nameNodeType === 'PathExpression') {
					name = (partial.name as AST.PathExpression).original;
				} else if (nameNodeType === 'StringLiteral') {
					name = (partial.name as unknown as AST.StringLiteral).value;
				} else if (nameNodeType === 'SubExpression') {
					throw new TemplateError("Dynamic block names are not supported", content, partial.name.loc); // DOCS
				} else {
					throw new TemplateError(`Unknown block name type: ${nameNodeType}`, content, partial.name.loc);
				}
				if (name.startsWith("[[") && name.endsWith("]]")) {
					name = name.slice(2, -2).trim(); // Support wikilink brackets // DOCS
				}

				// Replace the block name in the content string using the AST locations
				let [charStart, charEnd] = Z2KTemplateEngine.getCharNumsFromLoc(content, partial.name.loc);
				const newName = `block_${indexOffset + blockNames.length}`;
				replacements.push({ start: charStart, end: charEnd, text: newName });
				blockNames.push(name);
				locations.push(partial.name.loc);
			}
		}

		visit(ast);

		// Apply all edits against the original content, back-to-front to keep indices valid
		replacements.sort((a, b) => b.start - a.start);
		let out = content;
		for (const r of replacements) { out = out.slice(0, r.start) + r.text + out.slice(r.end); }
		preprocessedContent = out;

		return { preprocessedContent, blockNames, locations };
	}
	private static applyGlobalFallbackHandling(state: TemplateState): void {
		// Merge all YAML frontmatter to get the final z2k_template_default_fallback_handling value
		const mergedYaml = Z2KYamlDoc.mergeLastWins(state.templatesYaml);
		if (!mergedYaml || mergedYaml.trim() === "") {
			return; // No YAML to process
		}
		const doc = Z2KYamlDoc.fromString(mergedYaml);
		const globalFallbackHandling = doc.get("z2k_template_default_fallback_handling");
		if (!globalFallbackHandling || typeof globalFallbackHandling !== 'string') {
			return; // No global fallback handling setting
		}

		// Map the YAML value to the corresponding directive
		let directiveToApply: Directive | null = null;
		const normalizedValue = globalFallbackHandling.toLowerCase().trim();
		switch (normalizedValue) {
			case "finalize-clear":
				directiveToApply = "finalize-clear";
				break;
			case "finalize-preserve":
				directiveToApply = "finalize-preserve";
				break;
			case "finalize-suggest":
				directiveToApply = "finalize-suggest";
				break;
			default:
				// Invalid value - ignore it
				return;
		}

		// Apply the directive to all fields that don't already have a finalize directive
		for (const fieldInfo of Object.values(state.fieldInfos)) {
			const hasFinalizeDirective = fieldInfo.directives?.some(d =>
				d === "finalize-clear" || d === "finalize-preserve" || d === "finalize-suggest"
			);
			if (!hasFinalizeDirective) {
				// Add the global directive
				if (!fieldInfo.directives) {
					fieldInfo.directives = [];
				}
				fieldInfo.directives.push(directiveToApply!);
			}
		}
	}
	private static applyDirectivesAndFieldInfoValues(state: TemplateState): void {
		// A case could be made that these should be done in the plugin, not the engine

		// Go through the directives and apply their effects to the fieldInfos
		for (const fieldInfo of Object.values(state.fieldInfos)) {
			if (!!fieldInfo.directives) {
				for (const directive of fieldInfo.directives) {
					switch (directive) {
						case "required": break;
						case "no-prompt": break;
						case "finalize-clear":
							if (fieldInfo.fallback === undefined) { fieldInfo.fallback = ""; }
							break;
						case "finalize-preserve":
							if (fieldInfo.fallback === undefined) { fieldInfo.fallback = `\\{{${fieldInfo.fieldName}}}`; }
							break;
						case "finalize-suggest":
							if (fieldInfo.fallback === undefined && fieldInfo.suggest !== undefined) {
								fieldInfo.fallback = fieldInfo.suggest;
							}
							break;
					}
				}
			}
			// Fields with value= should not be prompted - add no-prompt directive
			// Resolution happens later via plugin after all data sources are loaded
			if (fieldInfo.value !== undefined) {
				if (!fieldInfo.directives) { fieldInfo.directives = []; }
				if (!fieldInfo.directives.includes('no-prompt')) {
					fieldInfo.directives.push('no-prompt');
				}
			}
		}
	}
	private static collectReferencedFields(state: TemplateState): void {
		// Collect all fields actually referenced in template body (not just declared via fi)
		// This is used to determine which fields should be prompted
		const refs = state.referencedFields;
		const decls = state.declaredFields;

		function addIfFieldRef(node: AST.Node | undefined) {
			if (node?.type === 'PathExpression') {
				const path = node as AST.PathExpression;
				// Only top-level vars (not "this.foo" or "@index")
				if (path.parts.length === 1 && typeof path.parts[0] === 'string' && !path.data) {
					refs.add(path.parts[0]);
				}
			}
		}

		function getDeclaredFieldName(stmt: AST.MustacheStatement | AST.SubExpression): string | undefined {
			// fi/fo field name comes from first positional param or hash `fieldName=`
			const namedPair = stmt.hash?.pairs?.find(p => p.key === 'fieldName');
			if (namedPair && namedPair.value.type === 'PathExpression') {
				return (namedPair.value as AST.PathExpression).original;
			}
			const first = stmt.params?.[0];
			if (first?.type === 'PathExpression') {
				return (first as AST.PathExpression).original;
			}
			return undefined;
		}

		function visit(node: AST.Node) {
			switch (node.type) {
				case 'Program':
					(node as AST.Program).body.forEach(visit);
					break;
				case 'MustacheStatement':
				case 'SubExpression': {
					const stmt = node as AST.MustacheStatement | AST.SubExpression;
					// Check if this is a fi/fo declaration (not a reference)
					const helperName = stmt.path.type === 'PathExpression' ? (stmt.path as AST.PathExpression).original : '';
					const isFieldInfoHelper = ['fi', 'fo', 'fieldInfo', 'fieldOutput'].includes(helperName);
					if (isFieldInfoHelper) {
						// fi/fo are declarations - record name in declaredFields, don't count params as references
						const declaredName = getDeclaredFieldName(stmt);
						if (declaredName) { decls.add(declaredName); }
						// But DO add the field to referencedFields for fo (it outputs the value)
						if ((helperName === 'fo' || helperName === 'fieldOutput') && stmt.params?.[0]?.type === 'PathExpression') {
							addIfFieldRef(stmt.params[0]);
						}
						break;
					}
					const isBare = !stmt.params?.length && !stmt.hash?.pairs?.length;
					if (isBare) { addIfFieldRef(stmt.path); }
					stmt.params?.forEach(addIfFieldRef);
					stmt.hash?.pairs?.forEach(pair => addIfFieldRef(pair.value));
					// Recurse into nested SubExpressions
					stmt.params?.forEach(p => { if (p.type === 'SubExpression') visit(p); });
					stmt.hash?.pairs?.forEach(pair => { if (pair.value.type === 'SubExpression') visit(pair.value); });
					break;
				}
				case 'BlockStatement': {
					const block = node as AST.BlockStatement;
					block.params?.forEach(addIfFieldRef);
					block.hash?.pairs?.forEach(pair => addIfFieldRef(pair.value));
					visit(block.program);
					if (block.inverse) { visit(block.inverse); }
					break;
				}
				// PartialStatement - skip (block invocations handled via separate ASTs)
			}
		}

		// Walk all body ASTs (main template + all blocks)
		for (const ast of state.templateASTs) {
			visit(ast);
		}
		// Walk all YAML ASTs
		for (const ast of state.templateASTsYaml) {
			visit(ast);
		}
	}

	static renderTemplate(state: TemplateState, finalize: boolean, userHelpers?: Record<string, Function>): { fm: string; body: string } {
		// Merge built-in helpers with user-provided helpers (user helpers override built-ins)
		const allHelpers = { ...this.getHelperFunctions(), ...userHelpers };
		// Make a map of all the expressions to preserve
		let preserveExpressions: Record<string, string> = {};
		for (let i = 0; i < state.templates.length; i++) {
			state.preprocessedTemplates[i] = this.preserveExpressionsPreprocess(
				state.preprocessedTemplates[i], state.templateASTs[i], preserveExpressions, state.resolvedValues, `b${i}_`, finalize);
		}
		if (finalize) {
			this.removeFieldInfosAndComments(state);
		}
		// Render the template with the handlebars context
		let body: string;
		try {
			const renderFn = Handlebars.compile(state.preprocessedTemplates[0]);
			let blocks: Record<string, any> = {};
			for (let i = 1; i < state.templates.length; i++) {
				blocks[`block_${i}`] = Handlebars.compile(state.preprocessedTemplates[i]);
			}
			body = renderFn(state.resolvedValues, {
				helpers: allHelpers,
				partials: blocks,
			});
		} catch (e: any) {
			throw this.wrapHandlebarsError(e, state.templates[0]);
		}
		body = this.unescapeMostHtmlEntities(body);
		body = this.preserveExpressionsPostprocess(body, preserveExpressions);

		let preserveExpressionsYaml: Record<string, string> = {};
		const renderedYaml: string[] = [];
		for (let i = 0; i < state.templatesYaml.length; i++) {
			state.preprocessedTemplatesYaml[i] = this.preserveExpressionsPreprocess(
				state.preprocessedTemplatesYaml[i], state.templateASTsYaml[i], preserveExpressionsYaml, state.resolvedValues, `y${i}_`, finalize);
			let fmRendered: string;
			try {
				const fmRenderFn = Handlebars.compile(state.preprocessedTemplatesYaml[i]);
				fmRendered = fmRenderFn(state.resolvedValues, { helpers: allHelpers });
			} catch (e: any) {
				throw this.wrapHandlebarsError(e, state.templatesYaml[i]);
			}
			fmRendered = this.unescapeMostHtmlEntities(fmRendered);
			fmRendered = this.preserveExpressionsPostprocess(fmRendered, preserveExpressionsYaml);
			if (fmRendered && fmRendered.trim() !== "") {
				renderedYaml.push(fmRendered);
			}
		}

		const mergedFm = Z2KYamlDoc.mergeLastWins(renderedYaml);
		return { fm: mergedFm, body: body };
	}
	private static removeFieldInfosAndComments(state: TemplateState) {
		// Go through all templates and remove any remaining (non-preserved) fieldInfo/fi expressions and comments
		// This is done manually so that we can remove the entire line if the expression/comment is the only thing on it
		// No need to remove fieldOutput/fo expressions, as they output the value directly
		// Re-parse the templates because the preservation step may have changed character positions
		for (let i = 0; i < state.templates.length; i++) {
			let ast = parse(state.preprocessedTemplates[i]);
			let content = state.preprocessedTemplates[i];
			const replacements: { start: number; end: number; replacement: string }[] = [];

			function visit(node: AST.Node) {
				if (node.type === 'MustacheStatement') {
					const mustache = node as AST.MustacheStatement;
					if (mustache.path.type === 'PathExpression') {
						const path = mustache.path as AST.PathExpression;
						if (path.original === 'fieldInfo' || path.original === 'fi') {
							let [charStart, charEnd] = Z2KTemplateEngine.getCharNumsFromLoc(content, mustache.loc);
							replacements.push({ start: charStart, end: charEnd, replacement: '' });
						}
					}
				} else if (node.type === 'CommentStatement') {
					const comment = node as AST.CommentStatement;
					let [charStart, charEnd] = Z2KTemplateEngine.getCharNumsFromLoc(content, comment.loc);
					replacements.push({ start: charStart, end: charEnd, replacement: '' });
				}

				if (node.type === 'Program') {
					const program = node as AST.Program;
					program.body.forEach(visit);
				}
			}

			visit(ast);

			// Apply replacements in reverse order
			replacements.sort((a, b) => b.start - a.start);
			let result = content;
			for (let { start, end, replacement } of replacements) {
				// If surrounded by newlines, remove trailing newline too
				const hasLeadingNewline = start > 0 && result[start - 1] === '\n';
				const hasTrailingNewline = end < result.length && result[end] === '\n';
				if (hasLeadingNewline && hasTrailingNewline) {
					end++;
				}

				result = result.substring(0, start) + replacement + result.substring(end);
			}
			state.preprocessedTemplates[i] = result;
		}
	}

	private static preserveExpressionsPreprocess(content: string, ast: AST.Program, preserveExpressions: Record<string, string>, context: Record<string, any>, idPrefix: string, finalize: boolean): string {
		// Go through ast and replace any expressions in the content that contain a field not in existingFields with a temporary placeholder,
		// and add the original expression to preserveExpressions so it can be added back later.
		// This should actually preserve fieldInfo and fieldOutput helpers for undefined values as well, as they contain the variable in them
		// Use the AST, finding the start/end locations of matched expressions,
		// then replace these segments in the original content with the placeholders (__z2kpres_b0_0__, etc)

		let placeholderCount = 0;
		const replacements: { start: number; end: number; replacement: string }[] = [];

		// Helper: recursively collect all PathExpressions from a node
		function collectPaths(node: AST.Node, includeCallee = false): AST.PathExpression[] {
			const paths: AST.PathExpression[] = [];

			function walk(n: AST.Node) {
				if (n.type === 'PathExpression') {
					paths.push(n as AST.PathExpression);
				} else if (
					n.type === 'MustacheStatement' ||
					n.type === 'BlockStatement' ||
					n.type === 'SubExpression'
				) {
					const nodeWithParams = n as AST.MustacheStatement | AST.BlockStatement | AST.SubExpression;
					nodeWithParams.params?.forEach(walk);
					nodeWithParams.hash?.pairs?.forEach(pair => walk(pair.value));
					// include the callee path when requested (needed for bare {{Author}})
					if (includeCallee) {
						const anyWithPath = n as any;
						if (anyWithPath.path && anyWithPath.path.type === 'PathExpression') {
							paths.push(anyWithPath.path as AST.PathExpression);
						}
					}
				}
				if (n.type === 'BlockStatement') {
					const block = n as AST.BlockStatement;
					walk(block.program);
					if (block.inverse) walk(block.inverse);
				} else if (n.type === 'PartialBlockStatement') {
					const partial = n as AST.PartialBlockStatement;
					walk(partial.program);
				} else if (n.type === 'Program') {
					const program = n as AST.Program;
					program.body.forEach(walk);
				}
			}

			walk(node);
			return paths;
		}

		// Helper: determine if any path in expression is undefined in context
		function containsUndefinedVar(node: AST.Node): boolean {
			// For helpers with params/hash, skip callee; include callee for bare {{Var}}
			let includeCallee = false;
			if (node.type === 'MustacheStatement' || node.type === 'SubExpression') {
				const n = node as AST.MustacheStatement | AST.SubExpression;
				includeCallee = !((n.params?.length ?? 0) > 0 || (n.hash?.pairs?.length ?? 0) > 0);
			}
			const paths = collectPaths(node, includeCallee);
			return paths.some(path => {
				// only top-level variable
				const base = path.parts[0];
				if (typeof base !== 'string') {
					// Note: not going to support dynamic paths like {{(lookup "key").foo}} or {{(concat "user").foo}}
					throw new TemplateError(`Unsupported dynamic path: (${path.original})`, content, path.loc);
				}
				return !(base in context);
			});
		}

		// Walk AST and collect replacements
		function visit(node: AST.Node) {
			// fieldInfo/fi declarations are metadata (render to "") — always preserve during non-finalize
			// so they survive "Save for Now" and are available for subsequent "Continue filling" operations
			const isFieldInfoDeclaration = node.type === 'MustacheStatement' &&
				(node as AST.MustacheStatement).path.type === 'PathExpression' &&
				['fieldInfo', 'fi'].includes(
					((node as AST.MustacheStatement).path as AST.PathExpression).original);
			const shouldPreserve =
				((node.type === 'MustacheStatement' || node.type === 'SubExpression') && containsUndefinedVar(node)) ||
				(node.type === 'CommentStatement' && !finalize) ||
				(isFieldInfoDeclaration && !finalize);

			if (shouldPreserve) {
				let [charStart, charEnd] = Z2KTemplateEngine.getCharNumsFromLoc(content, node.loc);
				const original = content.substring(charStart, charEnd);
				const placeholder = `__z2kpres_${idPrefix}${placeholderCount++}__`;
				preserveExpressions[placeholder] = original;
				replacements.push({ start: charStart, end: charEnd, replacement: placeholder });
			}

			if (node.type === 'Program') {
				const program = node as AST.Program;
				program.body.forEach(visit);
			}
		}

		visit(ast);

		// Apply replacements in reverse order to preserve indexes
		replacements.sort((a, b) => b.start - a.start);
		let result = content;
		for (const { start, end, replacement } of replacements) {
			result = result.slice(0, start) + replacement + result.slice(end);
		}

		return result;
	}
	private static preserveExpressionsPostprocess(content: string, preserveExpressions: Record<string, string>): string {
		// Replace the placeholders in content with the original expressions from preserveExpressions
		return content.replace(/__z2kpres_[A-Za-z0-9_]+__/g, id => preserveExpressions[id] || "");
	}
	// private static preprocessResolvedValues(resolvedValues: Record<string, VarValueType>): Record<string, VarValueType> {
	// 	// Convert to defaults as needed
	// }

	private static getCharNumsFromLoc(content: string, loc: AST.SourceLocation): [number, number] {
		const lines = content.split('\n');
		let charStart = 0;
		for (let i = 0; i < loc.start.line - 1; i++) {
			charStart += lines[i].length + 1; // +1 for newline
		}
		charStart += loc.start.column;
		let charEnd = 0;
		for (let i = 0; i < loc.end.line - 1; i++) {
			charEnd += lines[i].length + 1; // +1 for newline
		}
		charEnd += loc.end.column;
		return [charStart, charEnd];
	}
	private static unescapeMostHtmlEntities(str: string): string {
		// Handlebars converts things like `'` to `&#x27;`
		return str
			.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // hex entities
			.replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))        // decimal entities
			.replace(/&quot;/g, '"')
			.replace(/&apos;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}

	// resolveVarsFromJSON(state: TemplateState, jsonData: Record<string, any>): TemplateState {
	// 	for (const varInfo of state.mergedVarInfoMap.values()) {
	// 		// Skip if already resolved
	// 		if (varInfo.resolvedValue !== undefined) continue;

	// 		// Handle dot notation for nested fields
	// 		const path = varInfo.fieldName.split('.');
	// 		let val = jsonData as any;
	// 		let resolved = true;

	// 		// Navigate through the path
	// 		for (const segment of path) {
	// 			if (val && typeof val === 'object' && segment in val) {
	// 				val = val[segment];
	// 			} else {
	// 				resolved = false;
	// 				break;
	// 			}
	// 		}
	// 		if (!resolved) {continue;}

	// 		let parsed: VarValueType | undefined;
	// 		switch (varInfo.dataType) {
	// 			case 'text':
	// 			case 'singleSelect':
	// 			case 'titleText':
	// 				parsed = typeof val === 'string' ? val : String(val);
	// 				break;
	// 			case 'number':
	// 				const num = Number(val);
	// 				parsed = isNaN(num) ? undefined : num;
	// 				break;
	// 			case 'date':
	// 				const m = moment(val);
	// 				parsed = m.isValid() ? m : undefined;
	// 				break;
	// 			case 'boolean':
	// 				if (typeof val === 'boolean') { parsed = val; }
	// 				else if (val === 'true') { parsed = true; }
	// 				else if (val === 'false') { parsed = false; }
	// 				break;
	// 			case 'multiSelect':
	// 				if (Array.isArray(val)) {
	// 					parsed = val.filter(x => typeof x === 'string');
	// 				} else if (typeof val === 'string') {
	// 					try {
	// 						const parsedArr = JSON.parse(val);
	// 						if (Array.isArray(parsedArr)) {
	// 							parsed = parsedArr.filter(x => typeof x === 'string');
	// 						}
	// 					} catch {}
	// 				}
	// 				break;
	// 		}

	// 		if (parsed !== undefined) {
	// 			varInfo.resolvedValue = parsed;
	// 			varInfo.valueSource = 'json-data';
	// 		}
	// 	}
	// 	return state;
	// }

	// static deepMergeParsedYaml(target: ParsedYaml, source: ParsedYaml): void {
	// 	function isPlainObject(val: any): val is ParsedYaml {
	// 		return typeof val === 'object' && val !== null && !Array.isArray(val) &&
	// 			!(val instanceof SegmentList) && !(val instanceof AssembledTemplate);
	// 	}

	// 	for (const key of Object.keys(source)) {
	// 		if (!(key in target)) {
	// 			target[key] = source[key];
	// 			continue;
	// 		}
	// 		const targetVal = target[key];
	// 		const sourceVal = source[key];

	// 		if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
	// 			Z2KTemplateEngine.deepMergeParsedYaml(targetVal as ParsedYaml, sourceVal as ParsedYaml);
	// 		}
	// 		// Else: skip existing or incompatible types
	// 	}
	// }
}

// We deliberately do NOT use Obsidian's FileManager.processFrontMatter for our YAML work.
// processFrontMatter parses via js-yaml, which discards comments during the parse-and-serialize
// round-trip. Templates frequently contain explanatory YAML comments that must survive across
// merges, hierarchical block composition, and field updates. We use the `yaml` package's Document
// API (parseDocument + Document#toString) with keepSourceTokens to preserve comments end-to-end.
// If a future maintainer is tempted to "modernize" by switching to processFrontMatter, this will
// silently strip user comments from every frontmatter touch.
class Z2KYamlDoc {
	constructor(public doc: YAML.Document.Parsed) {}

	static fromString(src: string): Z2KYamlDoc {
		return new Z2KYamlDoc(
			YAML.parseDocument(src || "", { keepSourceTokens: true })
		);
	}

	toString(): string {
		if (this.doc.errors.length > 0) {
			const details = this.doc.errors.map(e => e.message).join("; ");
			throw new Error(`YAML frontmatter has errors: ${details}`);
		}
		const s = this.doc.toString().trim();
		return s && s !== "{}" ? s : "";
	}

	static splitFrontmatter(src: string): { fm: string; body: string } {
		const lines = src.split(/\r?\n/);
		if (lines[0] === '---') {
			for (let i = 1; i < lines.length; i++) {
				if (lines[i] === '---') {
					return { fm: lines.slice(1, i).join("\n"), body: lines.slice(i + 1).join("\n") };
				}
			}
		}
		return { fm: "", body: src };
	}

	static joinFrontmatter(fm: string, body: string): string {
		return fm ? `---\n${fm}\n---\n${body}` : body;
	}

	static pathStringToArray(path: string): (string | number)[] {
		return path.split('.').map(p => {
			const n = Number(p);
			return Number.isInteger(n) && p.trim() !== '' && String(n) === p
				? n
				: p;
		});
	}

	static pathArrayToString(path: (string | number)[]): string {
		return path.map(p => {
			if (typeof p === 'number') {
				return String(p);
			} else if (p.includes('.') || p.includes(' ')) {
				return `"${p}"`; // Quote if it contains dots or spaces
			} else {
				return p; // No quotes needed
			}
		}).join('.');
	}

	static yamlKeyToString(key: any): string {
		if (key == null) { return ""; }
		if (typeof key === "string") { return key; }
		try { return YAML.stringify(key).trim(); } catch { return String(key); }
	}

	get(path: string | (string|number)[], keepScalar = false) {
		const arr = typeof path === "string"
			? Z2KYamlDoc.pathStringToArray(path)
			: path;
		return this.doc.getIn(arr, keepScalar);
	}

	set(path: string | (string|number)[], value: unknown) {
		const arr = typeof path === "string"
			? Z2KYamlDoc.pathStringToArray(path)
			: path;
		this.doc.setIn(arr, value);
	}

	del(path: string | (string|number)[]) {
		const arr = typeof path === "string"
			? Z2KYamlDoc.pathStringToArray(path)
			: path;
		this.doc.deleteIn(arr);
	}

	// Merge multiple rendered YAML strings into one while preserving comments where the
	// last occurrence of a top-level key wins; later duplicates override earlier ones.
	static mergeLastWins(yamls: string[]): string {
		const out = Z2KYamlDoc.fromString("");
		const root = out.doc.createNode({}) as YAMLMap.Parsed<YAML.ParsedNode, YAML.ParsedNode | null>;
		out.doc.contents = root as unknown as YAML.ParsedNode;
		const map = out.doc.contents as YAMLMap.Parsed<YAML.ParsedNode, YAML.ParsedNode | null>;
		(map as any).flow = false; // Keep in block style (multiline, indented)

		for (const raw of yamls) {
			if (!raw || !raw.trim()) { continue; }
			const doc = Z2KYamlDoc.fromString(raw.trim());
			const contents = doc.doc.contents;
			if (!(contents && isMap(contents) && Array.isArray((contents as any).items))) {
				// Non-map roots (seq/scalar) are ignored for frontmatter merge.
				continue;
			}
			for (const pair of (contents as any).items) {
				const kStr = Z2KYamlDoc.yamlKeyToString(pair.key);
				// Remove existing key if present (last-wins)
				const items = (map as any).items as any[];
				const existingIndex = items.findIndex((p: any) => Z2KYamlDoc.yamlKeyToString(p.key) === kStr);
				if (existingIndex !== -1) { items.splice(existingIndex, 1); }

				// Recreate nodes in 'out' doc; copy comments so we keep annotations.
				const k = out.doc.createNode((pair.key as any)?.toJSON ? (pair.key as any).toJSON() : (pair.key as any)?.value ?? kStr) as YAML.ParsedNode;
				const v = out.doc.createNode((pair.value as any)?.toJSON ? (pair.value as any).toJSON() : (pair.value as any)?.value) as YAML.ParsedNode;
				(k as any).commentBefore = (pair.key as any)?.commentBefore ?? (k as any).commentBefore;
				(k as any).comment = (pair.key as any)?.comment ?? (k as any).comment;
				(v as any).commentBefore = (pair.value as any)?.commentBefore ?? (v as any).commentBefore;
				(v as any).comment = (pair.value as any)?.comment ?? (v as any).comment;
				if ((pair.value as any)?.flow !== undefined) { (v as any).flow = (pair.value as any).flow; }
				(map as any).add({ key: k, value: v });
			}
		}

		const s = out.toString().trim();
		return s && s !== "{}" ? s : "";
	}
}

// All plugin-reserved YAML keys — one struct, not separate "metadata" vs "skip list"
interface TemplateMetadata {
	z2k_template_name?: string;
	z2k_template_version?: string;
	z2k_template_author?: string;
	z2k_template_suggested_title?: string;
	z2k_template_description?: string;
	z2k_template_type?: string;
	z2k_template_default_fallback_handling?: string;
	z2k_default?: boolean;
}

interface TemplateState {
	templates: string[];
	templateASTs: AST.Program[];
	preprocessedTemplates: string[];

	templatesYaml: string[];
	templateASTsYaml: AST.Program[];
	preprocessedTemplatesYaml: string[];

	fieldInfos: Record<string, FieldInfo>; // There should be a fieldInfo for every field (so we can know what fields are in the template)
	referencedFields: Set<string>; // Fields actually used in template (not just declared via fi)
	declaredFields: Set<string>; // Fields declared via fi/fo helpers (not necessarily referenced)
	resolvedValues: Record<string, VarValueType>;
	metadata: TemplateMetadata;
}

type DataType = "text" | "number" | "date" | "datetime" | "boolean" | "singleSelect" | "multiSelect" | "titleText";
let DataTypeValues: DataType[] = ["text", "number", "date", "datetime", "boolean", "singleSelect", "multiSelect", "titleText"];

type Directive = "required" | "not-required" | "prompt" | "no-prompt" | "finalize-clear" | "finalize-preserve" | "finalize-suggest" | "raw-content";
let DirectiveValues: Directive[] = ["required", "not-required", "prompt", "no-prompt", "finalize-clear", "finalize-preserve", "finalize-suggest", "raw-content"];
const DirectiveCounterparts: Record<string, Directive[]> = {
	"required": ["not-required"],
	"not-required": ["required"],
	"prompt": ["no-prompt"],
	"no-prompt": ["prompt"],
	"finalize-clear": ["finalize-preserve", "finalize-suggest"],
	"finalize-preserve": ["finalize-clear", "finalize-suggest"],
	"finalize-suggest": ["finalize-clear", "finalize-preserve"],
};

type VarValueType = string | number | boolean | VarValueType[] | null | undefined;

interface FieldInfo {
	fieldName: string;
	prompt?: VarValueType;
	suggest?: VarValueType;
	type?: DataType;
	opts?: VarValueType[];
	fallback?: VarValueType;
	directives?: Directive[];
	value?: VarValueType;
}

class TemplateError extends Error {
	description: string;
	constructor(message: string, content: string, loc: AST.SourceLocation, extraInfo?: string) {
		super(message);
		this.name = "TemplateError";
		const lines = content.split('\n');
		const line = lines[loc.start.line - 1] ?? '';
		const pointerLine = ' '.repeat(loc.start.column) + '^'.repeat(
			Math.max(1, loc.end.column - loc.start.column)
		);
		this.description = `${line}\n${pointerLine}`;
		if (extraInfo) {
			this.description += `\n${extraInfo}`;
		}
	}
}

export {
	Z2KTemplateEngine,
	Z2KYamlDoc,
	TemplateError,
	Handlebars,
};
export type {
	TemplateState,
	TemplateMetadata,
	DataType,
	VarValueType,
	FieldInfo,
};
