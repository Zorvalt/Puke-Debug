import * as vscode from 'vscode';
import { AbstractPukeController } from './AbstractPukeController';

export class SequenceController extends AbstractPukeController {
    private seqNumber = 0;

    constructor() {
        super('Sequence', 'sequenceFormat');
    }

    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.Range, puke: string): string {
        const seqNumber = this.seqNumber.toString();
        this.seqNumber += 1;
        return puke.replace('%seq_number%', seqNumber);
    }

    public reset() {
        this.seqNumber = 0;
    }

    public clearAll(editor: vscode.TextEditor): Thenable<boolean> {
        this.reset();
        return super.clearAll(editor);
    }
}