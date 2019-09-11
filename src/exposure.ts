import * as vscode from 'vscode';
import * as utils from './utils';
import { AbstractPukeControler } from './AbstractPuke';

export class Exposure extends AbstractPukeControler {
    constructor() {
        super('Exposure', '');
    }

    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string {
        const selection = new vscode.Range(editor.selection.start, editor.selection.end);
        return puke.replace(/%name%/g, editor.document.getText(selection));
    }

    protected getPukeFormat(languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        let exposureFormat : string = conf.defaultExposureFormat;
        if (languageID !== "" && conf.exposureFormats.hasOwnProperty(languageID)) {
            exposureFormat = conf.exposureFormats[languageID];
        }
        return exposureFormat;
    }
}