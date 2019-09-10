import * as vscode from 'vscode';
import * as utils from './utils';

export class Exposure {
    private static make_comment(): string {
        return utils.make_comment() + '/Exposure';
    }

    private static make_exposure(selection: string, languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        let exposureFormat : string = conf.defaultExposureFormat;
        if (languageID !== "" && conf.exposureFormats.hasOwnProperty(languageID)) {
            exposureFormat = conf.exposureFormats[languageID];
        }

        const output = exposureFormat.replace(/%name%/g, selection);
        return utils.outputFormat(languageID).replace('%output%', output) + ' ' + Exposure.make_comment() + '\n';
    }

    public static insert(editor: vscode.TextEditor) {
        editor.edit(function (editBuilder: vscode.TextEditorEdit) {
            const indentation = utils.indentationOfLine(editor.document, editor.selection.active.line);
            const position = new vscode.Position(editor.selection.active.line + 1, 0);
            const selection = new vscode.Range(editor.selection.start, editor.selection.end);

            editBuilder.insert(
                position,
                indentation + Exposure.make_exposure(editor.document.getText(selection), editor.document.languageId)
            );
        });
    }

    public static clearAll(editor: vscode.TextEditor) {
        const text = editor.document.getText();
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(Exposure.make_comment()) + '$', 'gm');
    
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