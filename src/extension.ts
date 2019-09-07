import * as vscode from 'vscode';

// TODO Put this in a config file
const puke_point_format = 'fmt.Println(\'PUKE-POINT: filename: %filename%, line: %line%\')';
const comment_tag = 'PKDBG';
const comment_prefix = '//';
const comment_sufix = '';
const comment = ' ' + comment_prefix + ' ' + comment_tag + ' ' + comment_sufix;

// By Mathias Bynens
// From: https://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript
function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
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

			const puke_point = puke_point_format.replace('%filename%', filename).replace('%line%', line.toString()) + comment;
			editor.edit(function (editBuilder: vscode.TextEditorEdit) {
				editBuilder.insert(position, puke_point);
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
