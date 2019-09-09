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

export function indentationOfLine(document: vscode.TextDocument, line: number): string {
    const currntLine = document.lineAt(line);
    return currntLine.text.substr(0, currntLine.firstNonWhitespaceCharacterIndex);
}

export function make_comment(): string {
	const conf = vscode.workspace.getConfiguration('puke-debug');
	return conf.commentOpening + ' ' + conf.commentTAG + (' ' + conf.commentClosing).trimRight();
}

export function outputFormat(languageID: string): string {
    const conf = vscode.workspace.getConfiguration('puke-debug');
    let outputFormat = conf.defaultOutputFormat;
    if (languageID !== "" && conf.outputFormats.hasOwnProperty(languageID)) {
        outputFormat = conf.outputFormats[languageID];
    }
    return outputFormat;
}
