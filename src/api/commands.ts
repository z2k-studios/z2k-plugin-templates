import type Z2KTemplatesPlugin from '../main';

/** Outcome of a successfully executed command. */
export type CommandResult = {
	kind: 'create' | 'continue' | 'insertBlock';
	filePath: string;
	/** True when the file was finalized (all fields resolved, template YAML stripped). False means the file is still WIP. */
	finalized: boolean;
};

/**
 * A JSON command package. Mirrors the URI/JSON directive surface, plus the
 * API-only `openInEditor` flag. Arbitrary extra keys are treated as field data,
 * same as the URI/JSON path.
 */
export type JsonCommandPackage = {
	cmd: 'new' | 'continue' | 'upsert' | 'insertblock';
	templatePath?: string;
	blockPath?: string;
	templateContents?: string;
	blockContents?: string;
	existingFilePath?: string;
	destDir?: string;
	destHeader?: string;
	prompt?: 'none' | 'remaining' | 'all';
	finalize?: boolean;
	location?: 'file-top' | 'file-bottom' | 'header-top' | 'header-bottom' | number;
	fileTitle?: string;
	fieldData?: string | Record<string, unknown>;
	/** When true, brings the created or modified file to focus in the workspace after execution. Default false. */
	openInEditor?: boolean;
} & Record<string, unknown>;

/** Thrown by `performJsonPackage` when the user has disabled this caller (reserved for #195). */
export class CommandsDisabledError extends Error {
	constructor(message = "Z2K Templates commands are disabled.") {
		super(message);
		this.name = 'CommandsDisabledError';
	}
}

export function createCommandsNamespace(plugin: Z2KTemplatesPlugin) {
	const isEnabled = (): boolean => true;

	return {
		/** Whether commands may currently be executed by this caller. Reserved for per-plugin toggles (#195). */
		isEnabled,

		/**
		 * Execute a JSON command package. Errors propagate as rejected promises;
		 * no toasts are shown. Returns the file that was created or modified and
		 * whether it was finalized.
		 */
		async performJsonPackage(pkg: JsonCommandPackage): Promise<CommandResult> {
			if (!isEnabled()) {
				throw new CommandsDisabledError();
			}
			const cmd = typeof pkg.cmd === 'string' ? pkg.cmd.toLowerCase() : '';
			if (cmd === 'fromjson') {
				throw new Error("performJsonPackage: 'fromJson' is a URI-only wrapper. Pass the inner package directly.");
			}
			// showNotices: false — programmatic caller shouldn't produce user-visible toasts
			return await plugin.processCommand(pkg, false, true);
		},
	};
}
