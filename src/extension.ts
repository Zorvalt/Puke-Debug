import * as vscode from 'vscode';

// By Mathias Bynens
// From: https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
}

function make_comment(): string {
	const conf = vscode.workspace.getConfiguration('puke-debug');
	return conf.commentOpening + ' ' + conf.commentTAG + (' ' + conf.commentClosing).trimRight();
}

function make_puke_point(filename: string, line: string): string {
	const puke_point = vscode.workspace.getConfiguration('puke-debug').pukePointFormat;
	return puke_point.replace('%filename%', filename).replace('%line%', line) + ' ' + make_comment() + '\n';
}

function currentFileName(document: vscode.TextDocument): string {
	const rootPath = vscode.workspace.rootPath;
	let filename = document.fileName;
	if (rootPath && filename.startsWith(rootPath)) {
		filename = filename.substr(rootPath.length);
	}
	return filename;
}

function indentationOfLine(document: vscode.TextDocument, line: number): string {
	const currntLine = document.lineAt(line);
	return currntLine.text.substr(0, currntLine.firstNonWhitespaceCharacterIndex);
}

function updatePukePoints(editor: vscode.TextEditor) {
	const text = editor.document.getText();
	// Matches all lines ending with the puke-point comment
	const regex = new RegExp(escapeRegExp(make_comment()) + '$', 'gm');

	let match;
	editor.edit(function(editBuilder: vscode.TextEditorEdit) {
		while(match = regex.exec(text)) {
			const position = editor.document.positionAt(match.index);
			const beginOffset = editor.document.lineAt(position.line).firstNonWhitespaceCharacterIndex;
			const begin = new vscode.Position(position.line, beginOffset);
			const end = new vscode.Position(position.line + 1, 0);
			const filename = currentFileName(editor.document);
			const line = (begin.line+1).toString();
			editBuilder.replace(new vscode.Range(begin, end), make_puke_point(filename, line));
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "puke-debug" is now active!');

	let disposable1 = vscode.commands.registerCommand('pukeDebug.insertPukePoint', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const filename = currentFileName(editor.document);

			editor.edit(function (editBuilder: vscode.TextEditorEdit) {
				for (let selection of editor.selections) {
					const indentation = indentationOfLine(editor.document, selection.active.line);
					const position = new vscode.Position(selection.active.line + 1, 0);
					const lineDisplayed = position.line + 1;
					editBuilder.insert(position, indentation + make_puke_point(filename, lineDisplayed.toString()));
				}
			}).then(() => updatePukePoints(editor));
		}
	});

	context.subscriptions.push(disposable1);


	let disposable2 = vscode.commands.registerCommand('pukeDebug.clearPukePoints', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const text = editor.document.getText();
			// Matches all lines ending with the puke-point comment
			const regex = new RegExp(escapeRegExp(make_comment()) + '$', 'gm');

			let match;
			editor.edit(function(editBuilder: vscode.TextEditorEdit) {
				while(match = regex.exec(text)) {
					const position = editor.document.positionAt(match.index);
					const begin = new vscode.Position(position.line, 0);
					const end = new vscode.Position(position.line+1, 0);
					editBuilder.delete(new vscode.Range(begin, end));
				}
			});
		}
	});

	context.subscriptions.push(disposable2);

	let disposable3 = vscode.commands.registerCommand('pukeDebug.updatePukePoints', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) { updatePukePoints(editor); }
	});
	context.subscriptions.push(disposable3);

	vscode.workspace.onWillSaveTextDocument(() => {
		const editor = vscode.window.activeTextEditor;
		if (editor && vscode.workspace.getConfiguration('puke-debug').updateOnSave) {
			updatePukePoints(editor);
		}
	});

	// TODO Add commands to enable/disable/toggle debug lines

	// TODO Update all the commands to handle a selected range
}

// this method is called when your extension is deactivated
export function deactivate() { }
