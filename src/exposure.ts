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
        return utils.outputFormat(languageID).replace('%output%', output) + Exposure.make_comment() + '\n';
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
}