<div align="center">
	<img width="256" src="resources/puke-debug.png" alt="Puke-Debug">
	<h1>Puke-Debug</h1>
</div>

A VS Code extension that inserts emetic debug lines where you need them. Last resort option in debugging...
The inserted debug outputs (puke points) contain the line number and the name of the file.  
This extension allows you to easily add those horrible debug lines like:
```go
fmt.Println('PUKE: filename: /README.md, line: 5') // PKDBG/Point
fmt.Println('PUKE: => 0 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = foo') // PKDBG/Exposure
doThis()
fmt.Println('PUKE: => 1 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = bar') // PKDBG/Exposure
doThat()
fmt.Println('PUKE: => 2 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = foobar') // PKDBG/Exposure
```
instead of
```go
print('1')
doThis()
print('2')
doThat()
print('3')
```

## Simple meta-example of puke-debugging puke-debug
![Demo](resources/puke-debug-demo.gif)

## More than a snippet
This extension keeps line numbers up to date when the file changes.
The puke points are updated when a new one is added or on file change.

## Experimental, use at your own risks
This is my first extension! It *seems to work*, but I cannot guarantee anything.  
**I AM NOT RESPONSIBLE FOR ANY LOSS OF CODE OR OTHER PROBLEM YOU MIGHT ENCOUNTER**

## Why!?!?!?!?!
First, this started as a joke because I saw a friend debug like this and I wanted to troll him.
But sometimes... In some very specific contexts... You cannot use a debugger...

A debugger allows you to inspect memory, create conditional breakpoints, test the real behavior and a lot more.
This extension is only here to help for very quick and easy problem to fix or when you have no other tool.  
If despite this warning, you still want to use this extension. Well... Thank you and have fun! :-)

## Get the extension
- [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=Zorvalt.puke-debug)
- [Open VSX](https://open-vsx.org/extension/Zorvalt/puke-debug)
- [GitHub release page](https://github.com/Zorvalt/Puke-Debug/releases)
- [GitHub repository](https://github.com/Zorvalt/Puke-Debug)

## Quick start
### Basics
There are three types of output :
* Puke-Points
  * The Puke-Points are simply print outputs that you can insert anywhere to check if your code runs it.
  You can format them to add a filename and line number.
* Sequences
  * The sequences are print outputs with a counter incrementing after each print.
  Use it to control the flow easily with little verbosity.
* Variable exposures
  * The variable exposures are print outputs that display a variable name and value. 
    It is not meant as a debugger replacement and is as simple as possible.
    Not nice formatting or whatsoever. You can still add it yourself in the settings, though.

### Typical usage
When you use the insert command: `ctrl + alt + p` (`ctrl + cmd + p` on mac).  
It will add a puke-point in your code, right after the current line.  
Before:
```javascript
let x = getTheCurrentValueOfMyComponentAbstractedFromAnInterfaceFactory();
```
After:
```javascript
let x = getTheCurrentValueOfMyComponentAbstractedFromAnInterfaceFactory();
console.log('PUKE: filename: /src/myFile.js, line: 2') // PKDBG/Point
```
If you select x (with your cursor) before running the command, you will obtain this:
```javascript
let x = getTheCurrentValueOfMyComponentAbstractedFromAnInterfaceFactory();
console.log('PUKE: x = ' + x) // PKDBG/Exposure
```
And finally, if you switch to sequence mode (see how in next section):
```javascript
let x = getTheCurrentValueOfMyComponentAbstractedFromAnInterfaceFactory();
console.log('PUKE: => 0 <=') // PKDBG/Sequence
```
When you changed mode, all subsequent inserts will stay in the same mode. Therefor, the next insert will give:
```javascript
let x = getTheCurrentValueOfMyComponentAbstractedFromAnInterfaceFactory();
console.log('PUKE: => 0 <=') // PKDBG/Sequence
...
...
console.log('PUKE: => 1 <=') // PKDBG/Sequence
```

### Changing mode
There are two modes: Puke-Points and Sequence. Variable exposures are inserted in both modes when text is selected.
To change mode, press the command `ctrl + alt + shift + p` (`ctrl + cmd + shift + p` on mac)
and then the key for the mode you want to switch to :
* `p` for Puke-Points
* `s` for Sequences

### Configuration
You can change all the outputs and specify different behaviors for different file types.
See the [Extension Settings](#extension-settings) section for details.

## Features
* Insert
  * Puke-Points : filename and line
  * Sequences : Incrementing counter
  * Variable exposure : name and value
* Auto-recompute line numbers on save
* Compatible with any language
  * Use your own format with %filename% and %line% tags
  * Choose the comment format
* Specific format based on file type
  * With defaults for some languages:
    * shellscript
    * c
    * cpp
    * csharp
    * go
    * java
    * javascript
    * makefile
    * php
    * python
    * rust
    * scala
    * typescript

### Current commands:
* Repeat last puke output [Puke-Point or Sequence] (default shortcut: `ctrl + alt + p` / Mac: `ctrl + cmd + p`)
* Puke-Point
  * Insert new point
  * Clear all puke points in the current file
  * Update: Re-compute the line numbers
* Sequence
  * Insert new sequence (reset counter)
  * Insert next value in sequence
* Variable Exposure
  * Insert name and value of selected variable

## Extension Settings
* Puke Point Format: The Puke-Point format with quotes. Use %line% and %filename% as tags for debug info.
  * Example: `"PUKE: filename: %filename%, line: %line%"`

* Sequence Format: The Sequence format with quotes. Use %seq_number% as tag for debug info.
  * Example: `"PUKE: => %seq_number% <="`

* Default Variable Exposure Format: The default variable exposure format with quotes. Use %name% as tag for debug info.
  * Example: `"PUKE: %name% = \" + %name%`

* Variable exposure Formats: Variable exposure format by file type. Same format as above.
  * Language identifiers can be found here: https://code.visualstudio.com/docs/languages/identifiers
  * Example:
  ```json
  {
    "shellscript": "\"%name% = ${%name%}\"",
    "c": "\"%name% = %s\", %name%",
    "cpp": "\"%name% = \" << %name%",
    "csharp": "\"%name% = \" + %name%",
    "go": "\"%name% = \", %name%",
    "java": "\"%name% = \" + %name%.toString()",
    "javascript": "\"%name% = \" + %name%",
    "makefile": "\"%name% = $%name%\"",
    "php": "\"%name% = \" . %name%",
    "python": "\"%name% = \" + str(%name%)",
    "rust": "\"%name% =  {:?}\", %name%",
    "scala": "\"%name% = \" + %name%.toString()",
    "typescript": "\"%name% = \" + %name%"
  }
  ```

* Default Output Format: The default output format. Use %output% as tag for debug info.
  * Example: `"print(%output%)"`

* Output Formats: Output format by file type. Same format as above.
  * Language identifiers can be found here: https://code.visualstudio.com/docs/languages/identifiers
  * Example:
  ```json
  {
    "shellscript": "echo %output%",
    "c": "printf(%output%);",
    "cpp": "std::cout << %output% << std::endl;",
    "csharp": "Console.WriteLine(%output%);",
    "go": "fmt.Println(%output%)",
    "java": "System.out.println(%output%);",
    "javascript": "console.log(%output%);",
    "makefile": "echo %output%",
    "php": "echo %output%;",
    "python": "print(%output%)",
    "rust": "dbg!(%output%);",
    "scala": "println(%output%)",
    "typescript": "console.log(%output%);"
  }
  ```

* Comment Opening: The string to open a comment
  * Example: `"//"` or `"/*"`

* Comment TAG: The comment tag to identify puke-points
  * Example: `"PKDBG"`

* Comment Closing: The string to close a comment
  * Example: `""` (with inline comment) or `"*/"` (with multiline comment)

* updateOnSave: Updates the Puke-Points on save

## Known Issues
No currently known issue. Feel free to signal it with an issue if you find one! :-)

## Release Notes
See the [CHANGELOG](https://github.com/Zorvalt/Puke-Debug/blob/master/CHANGELOG.md)

## Credits
Illustration(logo) by [simonecapasso](https://www.fiverr.com/simonecapasso)
