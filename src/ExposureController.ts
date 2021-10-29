import * as vscode from 'vscode';
import { AbstractPukeController } from './AbstractPukeController';

export class ExposureController extends AbstractPukeController {
    constructor() {
        super('Exposure', '');
    }

    protected hookBeforeEachInsert(editor: vscode.TextEditor, selection: vscode.Range, puke: string): string {
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