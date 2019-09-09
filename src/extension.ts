import * as vscode from 'vscode';
import { PukePoints } from './PukePoint';
import { Sequence } from './Sequence';

enum Mode {
	PukePoint,
	Sequence
}

// Commands registration
export function activate(context: vscode.ExtensionContext) {
	let sequence = new Sequence();
	let mode = Mode.PukePoint;

	let disposable0 = vscode.commands.registerCommand('pukeDebug.insert', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor){
			switch(mode) {
				case Mode.PukePoint:
				PukePoints.insert(editor);
				break;

				case Mode.Sequence:
				sequence.insert(editor);
				break;
			}
		}
	});
	context.subscriptions.push(disposable0);

	let disposable1 = vscode.commands.registerCommand('pukeDebug.insertPukePoint', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.PukePoint;
			PukePoints.insert(editor);
		}
	});
	context.subscriptions.push(disposable1);


	let disposable2 = vscode.commands.registerCommand('pukeDebug.clearPukePoints', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.PukePoint;
			PukePoints.clearAll(editor);
		}
	});
	context.subscriptions.push(disposable2);

	let disposable3 = vscode.commands.registerCommand('pukeDebug.updatePukePoints', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.PukePoint;
			PukePoints.updateAll(editor);
		}
	});
	context.subscriptions.push(disposable3);

	vscode.workspace.onWillSaveTextDocument(() => {
		const editor = vscode.window.activeTextEditor;
		if (editor && mode === Mode.PukePoint && vscode.workspace.getConfiguration('puke-debug').updateOnSave) {
			PukePoints.updateAll(editor);
		}
	});

	let disposable4 = vscode.commands.registerCommand('pukeDebug.newSequence', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.Sequence;
			sequence.reset();
			sequence.insert(editor);
		}
	});
	context.subscriptions.push(disposable4);

	let disposable5 = vscode.commands.registerCommand('pukeDebug.nextSequence', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.Sequence;
			sequence.insert(editor);
		}
	});
	context.subscriptions.push(disposable5);

	let disposable6 = vscode.commands.registerCommand('pukeDebug.clearSequence', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			mode = Mode.Sequence;
			sequence.clearAll(editor);
		}
	});
	context.subscriptions.push(disposable6);
}

// this method is called when your extension is deactivated
export function deactivate() { }
