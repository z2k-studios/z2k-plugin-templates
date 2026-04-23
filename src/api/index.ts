import type Z2KTemplatesPlugin from '../main';

export type Z2KTemplatesApi = ReturnType<typeof createApi>;

export function createApi(plugin: Z2KTemplatesPlugin) {
	return {
		meta: {
			/** The plugin's semver version string, from manifest.json. */
			getVersion: () => plugin.manifest.version,
			/** User-configured word for files ("note", "card", "file", etc.). */
			getNomenclature: () => plugin.settings.cardReferenceName,
		},
	};
}
