import * as vscode from 'vscode';

// TODO Put this in a config file
const prefix = 'PUKE-DEBUG: ';
const debug_function_name = 'fmt.Println';
const comment_tag = 'PKDBG';
const comment_prefix = '//';
const comment = comment_prefix + comment_tag;

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
			const position = editor.selection.active;
			const line = position.line + 1;

			const rootPath = vscode.workspace.rootPath;
			let filename = editor.document.fileName;
			if (rootPath && filename.startsWith(rootPath)) {
				filename = filename.substr(rootPath.length);
			}

			const debug_output = debug_function_name + '("' + prefix + ' filename: ' + filename + ', line: ' + line + '")' + comment;
			editor.edit(function (editBuilder: vscode.TextEditorEdit) {
				editBuilder.insert(position, debug_output);
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

			console.log('regex', regex);
			console.log('text', text);
			const commentMatches = text.match(regex);
			console.log('matches', commentMatches);

			if (commentMatches) {
				editor.edit(function(editBuilder: vscode.TextEditorEdit) {
					commentMatches.forEach(function(match) {
						const begin = editor.document.positionAt(text.indexOf(match));
						const end = new vscode.Position(begin.line+1, 0);
						editBuilder.delete(new vscode.Range(begin, end));
					});
				});
			}
		}
	});

	context.subscriptions.push(disposable2);


	// TODO Add a command to update debug line numbers which is triggered by saving the file
}

// this method is called when your extension is deactivated
export function deactivate() { }
