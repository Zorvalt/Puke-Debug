import * as vscode from 'vscode';
import * as utils from './utils';
import { runInThisContext } from 'vm';

export abstract class AbstractPukeControler {
    protected commentSubTag: string;
    protected pukeFormatKey: string;

    constructor(commentSubTag: string, pukeFormatKey: string) {
        this.commentSubTag = commentSubTag;
        this.pukeFormatKey = pukeFormatKey;
    }
    /**
     * Builds the comment string at the end of a puke
     * @returns string A comment string with opening and closing tags
     */
    protected makeComment(): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        const optionalClosing = (' ' + conf.commentClosing).trimRight();
        return `${conf.commentOpening} ${conf.commentTAG}/${this.commentSubTag}` + optionalClosing;
    }
    /**
     * Fetches the puke format from the settings based on the pukeFormatKey given in constructor and the language
     * identifier given in parameter
     * If the pukeFormatKey/languageID does not match any setting, an exception is throwned
     * @param  {string} languageID The document's language identifier
     * @returns string A puke format string
     */
    protected getPukeFormat(languageID: string): string {
        // languageID is not used by default but may be needed by overriding methods
        const conf = vscode.workspace.getConfiguration('puke-debug');
        if (conf.hasOwnProperty(this.pukeFormatKey)) {
            return conf[this.pukeFormatKey];
        } else {
            throw new Error('Wrong setting key in this.pukeFormatKEy');
        }
    }
    /**
     * Fetches the print statement format from the settings based on the given language identifier
     * @param  {string} languageID The document's language identifier
     * @returns string A print statement format string
     */
    protected getOutputFormat(languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');
        let outputFormat = conf.defaultOutputFormat;
        if (languageID !== "" && conf.outputFormats.hasOwnProperty(languageID)) {
            outputFormat = conf.outputFormats[languageID];
        }
        return outputFormat;
    }
    /**
     * Builds the complete puke statemen with comment based on the pukeFormatKey given in constructor and the language
     * identifier given in parameter
     * If the pukeFormatKey/languageID does not match any setting, an exception is throwned
     * @param  {string} languageID The document's language identifier
     * @returns string
     */
    protected makePuke(languageID: string): string {
        const printStatement = this.getOutputFormat(languageID).replace('%output%', this.getPukeFormat(languageID));
        const comment = this.makeComment();
        return `${printStatement} ${comment}`;
    }
    /**
     * Hook for child class to override
     * This hook is execuded ONCE before a batch of inserts. It can be used to format a puke with a parameter that
     * does not depend on the line
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @param  {string} puke The puke string to format
     * @returns string The formated puke string
     */
    protected hookBeforeAllInsert(editor: vscode.TextEditor, puke: string): string { return puke; }

    
    /**
     * Hook for child class to override
     * This hook is execuded before EACH insert. It can be used to format a puke with a parameter that depends on the line
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @param  {vscode.TextLine} selectedLine The line after which the puke will be inserted
     * @param  {string} puke The puke string to format
     * @returns string The formated puke string
     */
    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string { return puke; }

    /**
     * Inserts a puke after each line with a cursor carret
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @returns Thenable A promise that resolves with a value indicating if the edits could be applied.
     */
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

    /**
     * Updates all pukes of this type in the document
     * A line that won't change is not replaced.
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @returns Thenable A promise that resolves with a value indicating if the edits could be applied.
     */
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

    /**
     * Removes all pukes of this type in the document
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @returns Thenable A promise that resolves with a value indicating if the edits could be applied.
     */
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