import * as vscode from 'vscode';

// By Mathias Bynens
// From: https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
export function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
}

export function currentFileName(document: vscode.TextDocument): string {
    const rootPath = vscode.workspace.rootPath;
    let filename = document.fileName;
    if (rootPath && filename.startsWith(rootPath)) {
        filename = filename.substr(rootPath.length);
    }
    return filename;
}

