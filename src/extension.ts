import * as vscode from 'vscode';
import { PukePointController } from './PukePointController';
import { SequenceController } from './SequenceController';
import { ExposureController } from './ExposureController';

enum Mode {
	PukePoint,
	Sequence
}

function registerWithEditor<T>(commandName: string, command: (editor: vscode.TextEditor) => T): vscode.Disposable {
	return vscode.commands.registerCommand(commandName, () => {
		const editor = vscode.window.activeTextEditor;
		if (editor){
			return command(editor);
		}
	});
}

// Commands registration
export function activate(context: vscode.ExtensionContext) {
	let sequenceController = new SequenceController();
	let pukePointController = new PukePointController();
	let exposureController = new ExposureController();
	let mode = Mode.PukePoint;

	let command0 = registerWithEditor('pukeDebug.insert', async (editor) => {
		if(editor.selection.isSingleLine && !editor.selection.isEmpty) {
			return exposureController.insert(editor);
		}

		switch(mode) {
			case Mode.PukePoint:
				return pukePointController.insert(editor)
					.then(() =>pukePointController.updateAll(editor));
			break;

			case Mode.Sequence:
				return sequenceController.insert(editor);
			break;
		}
	});
	context.subscriptions.push(command0);

	let command1 = registerWithEditor('pukeDebug.insertPukePoint', async (editor) => {
		mode = Mode.PukePoint;
		return pukePointController.insert(editor).then(()=>pukePointController.updateAll(editor));
	});
	context.subscriptions.push(command1);


	let command2 = registerWithEditor('pukeDebug.clearPukePoints', (editor) => pukePointController.clearAll(editor));
	context.subscriptions.push(command2);

	let command3 = registerWithEditor('pukeDebug.updatePukePoints', (editor) => {
		mode = Mode.PukePoint;
		return pukePointController.updateAll(editor);
	});
	context.subscriptions.push(command3);

	vscode.workspace.onWillSaveTextDocument(() => {
		const editor = vscode.window.activeTextEditor;
		if (editor && vscode.workspace.getConfiguration('puke-debug').updateOnSave) {
			return pukePointController.updateAll(editor);
		}
	});

	let command4 = registerWithEditor('pukeDebug.newSequence', (editor) => {
		mode = Mode.Sequence;
		sequenceController.reset();
		return sequenceController.insert(editor);
	});
	context.subscriptions.push(command4);

	let command5 = registerWithEditor('pukeDebug.nextSequence', (editor) => {
		mode = Mode.Sequence;
		return sequenceController.insert(editor);
	});
	context.subscriptions.push(command5);

	let command6 = registerWithEditor('pukeDebug.clearSequence', (editor) => sequenceController.clearAll(editor));
	context.subscriptions.push(command6);

	let command7 = registerWithEditor('pukeDebug.insertExposure', (editor) => exposureController.insert(editor));
	context.subscriptions.push(command7);

	let command8 = registerWithEditor('pukeDebug.clearExposure', (editor) => exposureController.clearAll(editor));
	context.subscriptions.push(command8);

	let command9 = registerWithEditor('pukeDebug.clearAll', (editor) => {
		return pukePointController.clearAll(editor)
			.then(() => sequenceController.clearAll(editor))
			.then(() => exposureController.clearAll(editor));
	});
	context.subscriptions.push(command9);
}

// this method is called when your extension is deactivated
export function deactivate() { }
