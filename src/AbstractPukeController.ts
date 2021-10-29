import * as vscode from 'vscode';
import * as utils from './utils';

/**
 * This class represents a generic controller for puking.
 * It is intended to be inherited by specific controllers.
 * 
 * The controller handles basic or common actions such as :
 * - Formatting the insetions
 * - Inserting / updating / cleaning pukes
 * - Provides hooks for easy implementation of controllers
 */
export abstract class AbstractPukeController {
    protected commentSubTag: string;
    protected pukeFormatKey: string;

    protected constructor(commentSubTag: string, pukeFormatKey: string) {
        this.commentSubTag = commentSubTag;
        this.pukeFormatKey = pukeFormatKey;
    }

    /**
     * Builds a comment string to be placed at the end of a puke
     * @returns string A comment string with opening and closing tags
     */
    protected makeComment(languageID: string): string {
        const conf = vscode.workspace.getConfiguration('puke-debug');

        let commentFormat = conf.defaultCommentFormat;
        if (languageID !== "" && conf.commentFormats.hasOwnProperty(languageID)) {
            commentFormat = conf.commentFormats[languageID];
        }

        return commentFormat.replace('%comment%', `${conf.commentTAG}/${this.commentSubTag}`);
    }

    /**
     * Fetches the puke format from the settings based on the pukeFormatKey given in constructor and the language
     * identifier given in parameter
     * If the pukeFormatKey/languageID does not match any setting, an exception is thrown
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
     * Builds the complete puke statement with comment based on the pukeFormatKey given in constructor and the language
     * identifier given in parameter
     * If the pukeFormatKey/languageID does not match any setting, an exception is thrown
     * @param  {string} languageID The document's language identifier
     * @returns string
     */
    protected makePuke(languageID: string): string {
        const printStatement = this.getOutputFormat(languageID).replace('%output%', this.getPukeFormat(languageID));
        const comment = this.makeComment(languageID);
        return `${printStatement} ${comment}`;
    }

    /**
     * Hook for child class to override
     * This hook is executed ONCE before a batch of inserts. It can be used to format a puke with a parameter that
     * does not depend on the line
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @param  {string} puke The puke string to format
     * @returns string The formatted puke string
     */
    protected hookBeforeAllInsert(editor: vscode.TextEditor, puke: string): string { return puke; }

    /**
     * Hook for child class to override
     * This hook is executed before EACH insert. It can be used to format a puke with a parameter that depends on the line
     * @param  {vscode.TextEditor} editor An instance of vscode.TextEditor
     * @param  {vscode.TextLine} selectedLine The line before which the puke will be inserted
     * @param  {string} puke The puke string to format
     * @returns string The formatted puke string
     */
    protected hookBeforeEachInsert(editor: vscode.TextEditor, selectedLine: vscode.TextLine, puke: string): string { return puke; }

    /**
     * Inserts a puke before each line with a cursor caret
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
                
                const insert_position = new vscode.Position(selectedLine.lineNumber, 0);
                const indentation = selectedLine.text.substr(0, selectedLine.firstNonWhitespaceCharacterIndex);

                const formattedPuke = self.hookBeforeEachInsert(editor, selection, puke);
                editBuilder.insert(insert_position, indentation + formattedPuke + '\n');
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
        const comment = utils.escapeRegExp(this.makeComment(editor.document.languageId));
        const regex = new RegExp(comment + '\\s*$', 'gm');
    
        return editor.edit(function(editBuilder: vscode.TextEditorEdit) {
            // Replaces each line containing a puke point with a new one
            let match;
            while(match = regex.exec(text)) {
                const position = editor.document.positionAt(match.index);
                const selectedLine = editor.document.lineAt(position.line);
                const formattedPuke = self.hookBeforeEachInsert(editor, selectedLine, puke);

                if(selectedLine.text.trim() !== formattedPuke.trim()) {
                    const begin = new vscode.Position(position.line, selectedLine.firstNonWhitespaceCharacterIndex);
                    const end = new vscode.Position(position.line, selectedLine.range.end.character);
                    editBuilder.replace(new vscode.Range(begin, end), formattedPuke);
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
        const comment = utils.escapeRegExp(this.makeComment(editor.document.languageId));
        const regex = new RegExp(comment + '\\s*$', 'gm');
    
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