import { TFile, TFolder } from 'obsidian';

// Path-based file/folder abstractions — can represent both Obsidian-indexed
// and hidden (dot-prefixed) files that Obsidian doesn't index.
export interface PathFile {
	path: string;
	basename: string;
	extension: string;
	parentPath: string;
	parentName: string;
}

export interface PathFolder {
	path: string;
	name: string;
	parentPath: string;
}

export function pathFileFrom(filePath: string): PathFile {
	const norm = normalizeFullPath(filePath);
	const lastSlash = norm.lastIndexOf('/');
	const parentPath = lastSlash >= 0 ? norm.substring(0, lastSlash) : '';
	const fileName = lastSlash >= 0 ? norm.substring(lastSlash + 1) : norm;
	const dotIndex = fileName.lastIndexOf('.');
	const basename = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
	const extension = dotIndex > 0 ? fileName.substring(dotIndex + 1) : '';
	const parentName = parentPath.includes('/') ? parentPath.substring(parentPath.lastIndexOf('/') + 1) : parentPath;
	return { path: norm, basename, extension, parentPath, parentName };
}

export function pathFolderFrom(folderPath: string): PathFolder {
	const norm = normalizeFullPath(folderPath);
	const lastSlash = norm.lastIndexOf('/');
	const name = lastSlash >= 0 ? norm.substring(lastSlash + 1) : norm;
	const parentPath = lastSlash >= 0 ? norm.substring(0, lastSlash) : '';
	return { path: norm, name, parentPath };
}

export function pathFileFromTFile(file: TFile): PathFile {
	return {
		path: file.path,
		basename: file.basename,
		extension: file.extension,
		parentPath: file.parent?.path ?? '',
		parentName: file.parent?.name ?? '',
	};
}

export function pathFolderFromTFolder(folder: TFolder): PathFolder {
	return {
		path: folder.path,
		name: folder.name,
		parentPath: folder.parent?.path ?? '',
	};
}

export function isSubPathOf(child: string, parent: string): boolean {
	const normParent = normalizeFullPath(parent);
	const normChild = normalizeFullPath(child);
	if (normParent === '') { return true; } // root is parent of everything
	if (normChild === normParent) { return true; }
	return normChild.startsWith(normParent + '/');
}

export function joinPath(...parts: string[]): string {
	return normalizeFullPath(parts.join('/'));
}

// Path normalizer used everywhere we accept user-provided or constructed paths.
// Does what Obsidian's normalizePath() does (slash cleanup, non-breaking space replacement,
// Unicode NFC normalization) PLUS resolves '..' and './' segments — needed for our
// hierarchical template paths. We use this in place of Obsidian's normalizePath because
// Obsidian's stops short of segment resolution, which we depend on for cross-folder lookups.
export function normalizeFullPath(path: string): string {
	path = path
		.trim()
		.replace(/ /g, ' ')   // Replace non-breaking spaces with regular spaces (matches Obsidian's normalizePath)
		.normalize('NFC')          // Unicode NFC normalization (matches Obsidian's normalizePath; aligns macOS NFD paths)
		.replace(/\\/g, '/')       // Normalize backslashes to '/'
		.replace(/\/{2,}/g, '/')   // Collapse multiple slashes
		.replace(/^\.\//, '')      // Remove leading "./"
		.replace(/^\/+/, '')       // Remove leading slashes
		.replace(/\/+$/, '');      // Remove trailing slashes
	// Resolve ".." segments
	const segments = path.split('/');
	const resolved: string[] = [];
	for (const seg of segments) {
		if (seg === '..') {
			resolved.pop(); // Go up one level
		} else if (seg !== '.' && seg !== '') {
			resolved.push(seg);
		}
	}
	return resolved.join('/');
}
