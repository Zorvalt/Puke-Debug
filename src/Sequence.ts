import * as vscode from 'vscode';
import { AbstractPukeControler } from './AbstractPuke';

export class Sequence extends AbstractPukeControler {
    private seqNumber = 0;

    constructor() {
        super('Sequence', 'sequenceFormat');
    }

    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string {
        const seqNumber = this.seqNumber.toString();
        this.seqNumber += 1;
        return puke.replace('%seq_number%', seqNumber);
    }

    public reset() {
        this.seqNumber = 0;
    }

    public clearAll(editor: vscode.TextEditor) {
        super.clearAll(editor);
        this.reset();
    }
}