import * as vscode from 'vscode';
import * as utils from './utils';

export class PukePoints {
    private static make_comment(): string {
        return utils.make_comment() + '/Point';
    }

    private static make_puke_point(filename: string, line: string, languageID = ""): string {
        const puke_point = vscode.workspace.getConfiguration('puke-debug').pukePointFormat
            .replace('%filename%', filename)
            .replace('%line%', line);
        const sequenceComment = ' ' + PukePoints.make_comment() + '\n';
        return utils.outputFormat(languageID).replace('%output%', puke_point) + sequenceComment;
    }

    public static insert(editor: vscode.TextEditor) {
        const filename = utils.currentFileName(editor.document);
    
        editor.edit(function (editBuilder: vscode.TextEditorEdit) {
            // Inserts a puke point for each cursor(selection)
            for (let selection of editor.selections) {
                const indentation = utils.indentationOfLine(editor.document, selection.active.line);
                const position = new vscode.Position(selection.active.line + 1, 0);
                const lineDisplayed = position.line + 1;
                editBuilder.insert(
                    position,
                    indentation + PukePoints.make_puke_point(filename, lineDisplayed.toString(), editor.document.languageId)
                );
            }
        }).then(() => PukePoints.updateAll(editor));
    }
    
    public static updateAll(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(PukePoints.make_comment()) + '$', 'gm');
    
        let match;
        editor.edit(function(editBuilder: vscode.TextEditorEdit) {
            // Replaces each line containing a puke point with a new one
            while(match = regex.exec(text)) {
                const position = editor.document.positionAt(match.index);
                const beginOffset = editor.document.lineAt(position.line).firstNonWhitespaceCharacterIndex;
                const begin = new vscode.Position(position.line, beginOffset);
                const end = new vscode.Position(position.line + 1, 0);
                const filename = utils.currentFileName(editor.document);
                const line = (begin.line+1).toString();
                editBuilder.replace(
                    new vscode.Range(begin, end),
                    PukePoints.make_puke_point(filename, line, editor.document.languageId)
                );
            }
        });
    }
    
    public static clearAll(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(PukePoints.make_comment()) + '$', 'gm');
    
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
    }
}