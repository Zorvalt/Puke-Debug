import * as vscode from 'vscode';
import * as utils from './utils';

export class Sequence {
    private seqNumber = 0;

    private static make_comment(): string {
        return utils.make_comment() + '/Sequence';
    }

    private make_sequence_point(languageID = ""): string {
        const puke_point = vscode.workspace.getConfiguration('puke-debug').sequenceFormat
            .replace('%seq_number%', this.seqNumber.toString());
        const sequenceComment = ' ' + Sequence.make_comment() + '\n';
        return utils.outputFormat(languageID).replace('%output%', puke_point) + sequenceComment;
    }

    public reset() {
        this.seqNumber = 0;
    }

    public insert(editor: vscode.TextEditor) {
        const self = this;
    
        editor.edit(function (editBuilder: vscode.TextEditorEdit) {
            // Inserts a puke point for each cursor(selection)
            for (let selection of editor.selections) {
                const indentation = utils.indentationOfLine(editor.document, selection.active.line);
                const position = new vscode.Position(selection.active.line + 1, 0);
                editBuilder.insert(
                    position,
                    indentation + self.make_sequence_point(editor.document.languageId)
                );
                self.seqNumber += 1;
            }
        });
    }

    public clearAll(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(Sequence.make_comment()) + '$', 'gm');
    
        let match;
        editor.edit(function(editBuilder: vscode.TextEditorEdit) {
            // Deletes each line containing a puke point
            while(match = regex.exec(text)) {
                const position = editor.document.positionAt(match.index);
                const begin = new vscode.Position(position.line, 0);
                const end = new vscode.Position(position.line+1, 0);
                editBuilder.delete(new vscode.Range(begin, end));
            }
        });

        this.reset();
    }
}