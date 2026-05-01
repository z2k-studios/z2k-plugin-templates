import { Plugin, TFile } from 'obsidian';
import type { HelperDelegate } from 'handlebars';
import type Z2KTemplatesPlugin from '../main';
import { createCommandsNamespace } from './commands';

export type Z2KTemplatesApi = ReturnType<typeof createApi>;
export type { CommandResult, JsonCommandPackage } from './commands';
export { CommandsDisabledError } from './commands';

export interface BuiltInContext {
	sourceFile?: TFile;
	existingFile?: TFile;
	templateName: string;
	templatePath: string;
}

export type BuiltInProvider = (ctx: BuiltInContext) => unknown;

export interface RegistrationHandle {
	unregister(): void;
}

export function createApi(plugin: Z2KTemplatesPlugin) {
	const registerAndAutoCleanup = (
		caller: Plugin,
		doRegister: () => void,
		doUnregister: () => void,
	): RegistrationHandle => {
		doRegister();
		let active = true;
		const unregister = () => {
			if (!active) { return; }
			active = false;
			doUnregister();
		};
		caller.register(unregister);
		return { unregister };
	};

	return {
		meta: {
			/** The plugin's semver version string, from manifest.json. */
			getVersion: () => plugin.manifest.version,
			/** User-configured word for files ("file", "note", "card", etc.). */
			getNomenclature: () => plugin.settings.cardReferenceName,
		},
		commands: createCommandsNamespace(plugin),
		helpers: {
			/**
			 * Register a custom Handlebars helper from another plugin.
			 * The helper is exposed as `{{pluginId__name}}` always, and as `{{name}}` if the bare name is unclaimed.
			 * Auto-unregisters when the calling plugin unloads.
			 */
			register(caller: Plugin, name: string, fn: HelperDelegate): RegistrationHandle {
				const pluginId = caller.manifest.id;
				return registerAndAutoCleanup(
					caller,
					() => plugin.registerPluginHelper(pluginId, name, fn),
					() => plugin.unregisterPluginHelper(pluginId, name),
				);
			},
			isRegistered(caller: Plugin, name: string): boolean {
				return plugin.hasPluginHelper(caller.manifest.id, name);
			},
			/** Whether the given plugin's helpers are currently enabled (master + per-plugin toggles). */
			isEnabled(caller: Plugin): boolean {
				return plugin.isPluginRegistrationEnabled(caller.manifest.id);
			},
		},
		builtInFields: {
			/**
			 * Register a built-in field provider from another plugin.
			 * The field is exposed as `{{pluginId__name}}` always, and as `{{name}}` if the bare name is unclaimed.
			 * The provider runs once per template invocation and returns the field's value.
			 * Auto-unregisters when the calling plugin unloads.
			 */
			register(caller: Plugin, name: string, provider: BuiltInProvider): RegistrationHandle {
				const pluginId = caller.manifest.id;
				return registerAndAutoCleanup(
					caller,
					() => plugin.registerPluginBuiltIn(pluginId, name, provider),
					() => plugin.unregisterPluginBuiltIn(pluginId, name),
				);
			},
			isRegistered(caller: Plugin, name: string): boolean {
				return plugin.hasPluginBuiltIn(caller.manifest.id, name);
			},
			isEnabled(caller: Plugin): boolean {
				return plugin.isPluginRegistrationEnabled(caller.manifest.id);
			},
		},
		/** Master toggle state for plugin-registered helpers and built-in fields. */
		isMasterEnabled(): boolean {
			return plugin.settings.pluginHelpersEnabled;
		},
	};
}
