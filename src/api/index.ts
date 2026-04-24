import type Z2KTemplatesPlugin from '../main';
import { createCommandsNamespace } from './commands';

export type Z2KTemplatesApi = ReturnType<typeof createApi>;
export type { CommandResult, JsonCommandPackage } from './commands';
export { CommandsDisabledError } from './commands';

export function createApi(plugin: Z2KTemplatesPlugin) {
	return {
		meta: {
			/** The plugin's semver version string, from manifest.json. */
			getVersion: () => plugin.manifest.version,
			/** User-configured word for files ("note", "card", "file", etc.). */
			getNomenclature: () => plugin.settings.cardReferenceName,
		},
		commands: createCommandsNamespace(plugin),
	};
}
