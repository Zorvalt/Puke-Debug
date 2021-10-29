import * as assert from 'assert';
import * as vscode from 'vscode';

function setCursorsAtLines(editor: vscode.TextEditor, lineNumber: number | number[]) {
	const target_lines = (typeof lineNumber === 'number') ? [lineNumber] : lineNumber;

	editor.selections = target_lines.map((lineNumber) => {
		const position = editor.document.lineAt(lineNumber - 1).range.start;
		return new vscode.Selection(position, position);
	});
}

function selectInLine(editor: vscode.TextEditor, lineNumber: number, pattern: string) {
	const line = editor.document.lineAt(lineNumber - 1);
	const from_index = line.text.search(pattern);
	if (from_index === -1) {
		throw new Error(`pattern ${pattern} not found in line ${lineNumber}: ${line.text}`);
	}

	const from = new vscode.Position(lineNumber - 1, from_index);
	const to = new vscode.Position(lineNumber - 1, from_index + pattern.length);
	return new vscode.Selection(from, to);
}

function selectInMultipleLines(editor: vscode.TextEditor, target_lines: [lineNumber: number, pattern: string][]) {
	return target_lines.map(([lineNumber, pattern]) => selectInLine(editor, lineNumber, pattern));
}

function codeSnippet(code: string): string {
	const trimmed_code = code
		.replace(/^(\s*\n)*/, '') // Trim empty start lines
		.replace(/\n(\s*\n)*\s*$/, ''); // Trim empty end lines

	const lines = trimmed_code.split('\n');
	const indent_overflow = lines[0].search(/\S/);
	return lines.map((line) => line.substr(indent_overflow)).join('\n');
}

function pukeDebugTest(language: string, title: string, content: string, output: (filename: string) => string, steps: (editor: vscode.TextEditor) => Promise<void>) {
	const test_title = `[lang=${language}] ${title}`;

	return test(test_title, async () => {
		const tmp_document = await vscode.workspace.openTextDocument({ language, content });
		const editor = await vscode.window.showTextDocument(tmp_document);

		try {
			const expected = output(editor.document.fileName);

			await steps(editor);

			assert.strictEqual(editor.document.getText(), expected);
		} finally {
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	});
}

suite('Extension Test Suite', () => {
	pukeDebugTest("c", 'Insert 3 puke points',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: ${filename}, line: 7"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: ${filename}, line: 9"); //PKDBG/Point
				printf("Hello World!");
				printf("PUKE: filename: ${filename}, line: 11"); //PKDBG/Point
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, 9);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
			setCursorsAtLines(editor, 8);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
			setCursorsAtLines(editor, 7);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
		}
	);

	pukeDebugTest("c", 'Insert 3 puke points with 3 cursors',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: ${filename}, line: 7"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: ${filename}, line: 9"); //PKDBG/Point
				printf("Hello World!");
				printf("PUKE: filename: ${filename}, line: 11"); //PKDBG/Point
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, [7,8,9]);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
		}
	);

	pukeDebugTest("c", 'Update 3 puke points lines',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			// Nothing  //PKDBG/Point

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: __FILENAME__, line: -5"); //PKDBG/Point
				printf("Hello World!");
				printf("PUKE: filename: __FILENAME__, line: 17"); //PKDBG/Point
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: ${filename}, line: 7"); //PKDBG/Point

			printf("PUKE: filename: ${filename}, line: 9"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: ${filename}, line: 11"); //PKDBG/Point
				printf("Hello World!");
				printf("PUKE: filename: ${filename}, line: 13"); //PKDBG/Point
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			await vscode.commands.executeCommand("pukeDebug.updatePukePoints");
		}
	);

	pukeDebugTest("c", 'Clear 3 puke-points',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			await vscode.commands.executeCommand("pukeDebug.clearPukePoints");
		}
	);

	pukeDebugTest("c", 'Insert 3 puke-sequence prints',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				printf("Hello World!");
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, 8);
			await vscode.commands.executeCommand("pukeDebug.newSequence");
			setCursorsAtLines(editor, 10);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
			setCursorsAtLines(editor, 7);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
		}
	);

	pukeDebugTest("c", 'Insert puke-sequence with 3 cursors: new then next',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: => 0 <="); //PKDBG/Sequence
			printf("PUKE: => 3 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("PUKE: => 4 <="); //PKDBG/Sequence
				printf("Hello World!");
				printf("PUKE: => 2 <="); //PKDBG/Sequence
				printf("PUKE: => 5 <="); //PKDBG/Sequence
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, [7,8,9]);
			await vscode.commands.executeCommand("pukeDebug.newSequence");
			setCursorsAtLines(editor, [8,10,12]);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
		}
	);

	pukeDebugTest("c", 'Insert 3 puke-sequence prints after reset',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: => 2 <="); //PKDBG/Sequence
			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 0 <="); //PKDBG/Sequence
			printf("PUKE: => 2 <=");
			printf("PUKE: => 1 <="); //PKDBG/Sequence
			printf("x = %s", x);

			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				printf("Hello World!");
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, 8);
			await vscode.commands.executeCommand("pukeDebug.newSequence");
			setCursorsAtLines(editor, 10);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
			setCursorsAtLines(editor, 7);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");

			setCursorsAtLines(editor, 4);
			await vscode.commands.executeCommand("pukeDebug.newSequence");
			setCursorsAtLines(editor, 6);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
			setCursorsAtLines(editor, 3);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");
		}
	);

	pukeDebugTest("c", 'Clear 3 puke-sequence prints',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			await vscode.commands.executeCommand("pukeDebug.clearSequence");
		}
	);

	pukeDebugTest("c", 'Insert 3 puke-exposures',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				int x = 0;
				int y = x + 1;
				int z = y * 3;
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			editor.selection = selectInLine(editor, 10, "y");
			await vscode.commands.executeCommand("pukeDebug.insertExposure");
			editor.selection = selectInLine(editor, 12, "z");
			await vscode.commands.executeCommand("pukeDebug.insertExposure");
			editor.selection = selectInLine(editor, 9, "x");
			await vscode.commands.executeCommand("pukeDebug.insertExposure");
		}
	);

	pukeDebugTest("c", 'Insert 3 puke-exposures with 3 cursors',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				int x = 0;
				int y = x + 1;
				int z = y * 3;
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			editor.selections = selectInMultipleLines(editor, [[9, "x"], [10, "y"], [11, "z"]]);
			await vscode.commands.executeCommand("pukeDebug.insertExposure");
		}
	);

	pukeDebugTest("c", 'Clear 3 puke-exposures prints',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				int y = x + 1;
				int z = y * 3;
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			await vscode.commands.executeCommand("pukeDebug.clearExposure");
		}
	);

	pukeDebugTest("c", 'Main insert retains last insert mode 3 points + 3 seq.',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				printf("Hello World!");
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: => 0 <="); //PKDBG/Sequence
			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: => 2 <="); //PKDBG/Sequence
			printf("PUKE: filename: ${filename}, line: 9"); //PKDBG/Point
			int main() {
				printf("PUKE: filename: ${filename}, line: 11"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("Hello World!");
				printf("PUKE: filename: ${filename}, line: 14"); //PKDBG/Point
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			setCursorsAtLines(editor, 7);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
			setCursorsAtLines(editor, 9);
			await vscode.commands.executeCommand("pukeDebug.insert");
			setCursorsAtLines(editor, 3);
			await vscode.commands.executeCommand("pukeDebug.newSequence");
			setCursorsAtLines(editor, 11);
			await vscode.commands.executeCommand("pukeDebug.insert");
			setCursorsAtLines(editor, 13);
			await vscode.commands.executeCommand("pukeDebug.insertPukePoint");
			setCursorsAtLines(editor, 8);
			await vscode.commands.executeCommand("pukeDebug.nextSequence");

			await vscode.commands.executeCommand("pukeDebug.updatePukePoints");
		}
	);

	pukeDebugTest("c", 'Clear all pukes prints',
		codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			printf("PUKE: filename: __FILENAME__, line: 3"); //PKDBG/Point
			printf("PUKE: => 2 <="); //PKDBG/Sequence
			int main() {
				printf("PUKE: filename: __FILENAME__, line: 5"); //PKDBG/Point
				printf("PUKE: => 0 <="); //PKDBG/Sequence
				int x = 0;
				printf("x = %s", x); //PKDBG/Exposure
				int y = x + 1;
				printf("y = %s", y); //PKDBG/Exposure
				int z = y * 3;
				printf("z = %s", z); //PKDBG/Exposure
				printf("PUKE: filename: __FILENAME__, line: 7"); //PKDBG/Point
				printf("PUKE: => 1 <="); //PKDBG/Sequence
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		(filename: string) => codeSnippet(`
			#include <stdio.h>

			printf("PUKE: filename: __FILENAME__, line: 31");
			printf("PUKE: => 2 <=");
			printf("x = %s", x);

			int main() {
				int x = 0;
				int y = x + 1;
				int z = y * 3;
				printf("sum id %d", x+y+z);
				return 0;
			}
		`),
		async (editor: vscode.TextEditor) => {
			await vscode.commands.executeCommand("pukeDebug.clearAll");
		}
	);
});
