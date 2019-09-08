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

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "puke-debug" is now active!');

	let disposable1 = vscode.commands.registerCommand('pukeDebug.insertPukePoint', () => {
		// current editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			// TODO If line is not empty, create new line

			const position = editor.selection.active;
			const line = position.line + 1;

			const rootPath = vscode.workspace.rootPath;
			let filename = editor.document.fileName;
			if (rootPath && filename.startsWith(rootPath)) {
				filename = filename.substr(rootPath.length);
			}

			editor.edit(function (editBuilder: vscode.TextEditorEdit) {
				editBuilder.insert(position, make_puke_point(filename, line.toString()));
			});

			// TODO Update line numbers of other debug
		}
	});

	context.subscriptions.push(disposable1);


	let disposable2 = vscode.commands.registerCommand('pukeDebug.clearPukePoints', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const text = editor.document.getText();
			const regex = new RegExp('^.+'+escapeRegExp(comment) + '$', 'gm');

			let match;
			editor.edit(function(editBuilder: vscode.TextEditorEdit) {
				while(match = regex.exec(text)) {
					const begin = editor.document.positionAt(match.index);
					const end = new vscode.Position(begin.line+1, 0);
					editBuilder.delete(new vscode.Range(begin, end));
				}
			});
		}
	});

	context.subscriptions.push(disposable2);


	// TODO Add a command to update debug line numbers which is triggered by saving the file

	// TODO Add commands to enable/disable/toggle debug lines

	// TODO Update all the commands to handle a selected range
}

// this method is called when your extension is deactivated
export function deactivate() { }
