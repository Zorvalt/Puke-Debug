import * as vscode from 'vscode';
import * as utils from './utils';
import { runInThisContext } from 'vm';

export abstract class AbstractPukeControler {
    protected commentSubTag: string;
    protected pukeformat: string;

    constructor(commentSubTag: string, pukeFormat: string) {
        this.commentSubTag = commentSubTag;
        this.pukeformat = pukeFormat;
    }

    protected makeComment(): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        const optionalClosing = (' ' + conf.commentClosing).trimRight();
        return `${conf.commentOpening} ${conf.commentTAG}/${this.commentSubTag}` + optionalClosing;
    }

    protected getPukeFormat(languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');

        if (conf.hasOwnProperty(this.pukeformat)) {
            return conf[this.pukeformat];
        } else {
            console.error('makePuke()', 'Wrong setting key in this.pukeformat');
            return "";
        }
    }

    protected getOutputFormat(languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        let outputFormat = conf.defaultOutputFormat;
        if (languageID !== "" && conf.outputFormats.hasOwnProperty(languageID)) {
            outputFormat = conf.outputFormats[languageID];
        }
        return outputFormat;
    }

    protected makePuke(languageID: string): string {
        const printStatement = this.getOutputFormat(languageID).replace('%output%', this.getPukeFormat(languageID));
        const comment = this.makeComment();
        return `${printStatement} ${comment}`;
    }

    protected hookBeforeAllInsert(editor: vscode.TextEditor, puke: string): string { return puke; }
    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string { return puke; }

    public insert(editor: vscode.TextEditor): Thenable<boolean> {
        let puke = this.hookBeforeAllInsert(editor, this.makePuke(editor.document.languageId));
        let self = this;
        return editor.edit(function (editBuilder: vscode.TextEditorEdit) {
            // Inserts a puke for each cursor(selection)
            for (let selection of editor.selections) {
                const selectedLine = editor.document.lineAt(selection.active);
                const position = new vscode.Position(selectedLine.lineNumber, selectedLine.range.end.character);
                const indentation = selectedLine.text.substr(0, selectedLine.firstNonWhitespaceCharacterIndex);
                const formatedPuke = self.hookBeforeEachInsert(editor, selectedLine, puke);
                editBuilder.insert(position, '\n' + indentation + formatedPuke);
            }
        });
    }

    public updateAll(editor: vscode.TextEditor): Thenable<boolean> {
        const text = editor.document.getText();
        let puke = this.hookBeforeAllInsert(editor, this.makePuke(editor.document.languageId));
        let self = this;
        
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(this.makeComment()) + '\\s*$', 'gm');
    
        return editor.edit(function(editBuilder: vscode.TextEditorEdit) {
            // Replaces each line containing a puke point with a new one
            let match;
            while(match = regex.exec(text)) {
                const position = editor.document.positionAt(match.index);
                const selectedLine = editor.document.lineAt(position.line);
                const formatedPuke = self.hookBeforeEachInsert(editor, selectedLine, puke);

                if(selectedLine.text.trim() !== formatedPuke.trim()) {
                    const begin = new vscode.Position(position.line, selectedLine.firstNonWhitespaceCharacterIndex);
                    const end = new vscode.Position(position.line, selectedLine.range.end.character);
                    editBuilder.replace(new vscode.Range(begin, end), formatedPuke);
                }
            }
        });
    }

    public clearAll(editor: vscode.TextEditor): Thenable<boolean> {
        const text = editor.document.getText();
        // Matches all lines ending with the puke-point comment
        const regex = new RegExp(utils.escapeRegExp(this.makeComment()) + '\\s*$', 'gm');
    
        return editor.edit(function(editBuilder: vscode.TextEditorEdit) {
            // Deletes each line containing a puke point
            let match;
            while(match = regex.exec(text)) {
                const position = editor.document.positionAt(match.index);
                const begin = new vscode.Position(position.line, 0);
                const end = new vscode.Position(position.line+1, 0);
                editBuilder.delete(new vscode.Range(begin, end));
            }
        });
    }
}