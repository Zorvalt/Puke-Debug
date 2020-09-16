import * as vscode from 'vscode';
import { AbstractPukeController } from './AbstractPukeController';

export class PukePointController extends AbstractPukeController {
    constructor() {
        super('Point', 'pukePointFormat');
    }

    protected hookBeforeAllInsert(editor: vscode.TextEditor, puke: string): string {
        let filename = editor.document.uri.fsPath;
        const workspace = vscode.workspace.getWorkspaceFolder(editor.document.uri);

        if (workspace) {
            let rootPath = workspace.uri.fsPath;
            if (filename.startsWith(rootPath)) {
                filename = filename.substr(rootPath.length);
            }
        }
        return puke.replace('%filename%', filename);
    }

    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string {
        return puke.replace('%line%', (selectedLine.lineNumber+1).toString());
    }
}