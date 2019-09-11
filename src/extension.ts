import * as vscode from 'vscode';
import { PukePointEditor } from './PukePointEditor';
import { Sequence } from './SequenceEditor';
import { ExposureEditor } from './ExposureEditor';

enum Mode {
	PukePoint,
	Sequence
}

function registerWithEditor(commandName: string, command: (editor: vscode.TextEditor) => void): vscode.Disposable {
	return vscode.commands.registerCommand(commandName, () => {
		const editor = vscode.window.activeTextEditor;
		if (editor){
			command(editor);
		}
	});
}

// Commands registration
export function activate(context: vscode.ExtensionContext) {
	let sequence = new Sequence();
	let pukePointControler = new PukePointEditor();
	let exposureControler = new ExposureEditor();
	let mode = Mode.PukePoint;

	let command0 = registerWithEditor('pukeDebug.insert', (editor) => {
		if(editor.selection.isSingleLine && !editor.selection.isEmpty) {
			exposureControler.insert(editor);
		}

		switch(mode) {
			case Mode.PukePoint:
			pukePointControler.insert(editor).then(()=>pukePointControler.updateAll(editor));
			break;

			case Mode.Sequence:
			sequence.insert(editor);
			break;
		}
	});
	context.subscriptions.push(command0);

	let command1 = registerWithEditor('pukeDebug.insertPukePoint', (editor) => {
		mode = Mode.PukePoint;
		pukePointControler.insert(editor).then(()=>pukePointControler.updateAll(editor));
	});
	context.subscriptions.push(command1);


	let command2 = registerWithEditor('pukeDebug.clearPukePoints', (editor) => pukePointControler.clearAll(editor));
	context.subscriptions.push(command2);

	let command3 = registerWithEditor('pukeDebug.updatePukePoints', (editor) => {
		mode = Mode.PukePoint;
		pukePointControler.updateAll(editor);
	});
	context.subscriptions.push(command3);

	vscode.workspace.onWillSaveTextDocument(() => {
		const editor = vscode.window.activeTextEditor;
		if (editor && vscode.workspace.getConfiguration('puke-debug').updateOnSave) {
			pukePointControler.updateAll(editor);
		}
	});

	let command4 = registerWithEditor('pukeDebug.newSequence', (editor) => {
		mode = Mode.Sequence;
		sequence.reset();
		sequence.insert(editor);
	});
	context.subscriptions.push(command4);

	let command5 = registerWithEditor('pukeDebug.nextSequence', (editor) => {
			mode = Mode.Sequence;
			sequence.insert(editor);
	});
	context.subscriptions.push(command5);

	let command6 = registerWithEditor('pukeDebug.clearSequence', (editor) => sequence.clearAll(editor));
	context.subscriptions.push(command6);

	let command7 = registerWithEditor('pukeDebug.insertExposure', (editor) => exposureControler.insert(editor));
	context.subscriptions.push(command7);

	let command8 = registerWithEditor('pukeDebug.clearExposure', (editor) => exposureControler.clearAll(editor));
	context.subscriptions.push(command8);
}

// this method is called when your extension is deactivated
export function deactivate() { }
