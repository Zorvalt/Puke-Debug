# Puke-Debug
A VS Code extension that inserts emetic debug lines where you need them. Last resort option in debugging... The inserted debug outputs (puke points) contain the line number and the name of the file.  
This extension allows you to easily add thos horrible debug lines like:
```
fmt.Println('PUKE: filename: /README.md, line: 5') // PKDBG/Point
fmt.Println('PUKE: => 0 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = foo') // PKDBG
doThis()
fmt.Println('PUKE: => 1 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = bar') // PKDBG
doThat()
fmt.Println('PUKE: => 2 <=') // PKDBG/Sequence
fmt.Println('PUKE: my_var = foobar') // PKDBG

...
```
instead of
```
print('1')
doThis()
print('2')
doThat()
print('3')
...
```

## Experimental, use at your own risks
This is my first extension! It *seems to work* but I cannot guarantee anything.  
**I AM NOT RESPONSIBLE FOR ANY LOSS OF CODE OR OTHER PROBLEM YOU MIGHT ENCOUNTER**

## Why!?!?!?!?!
Because sometimes... In some very specific contexts... You cannot use a debugger...  
ONLY in those cases should you use this extension ! It is ***NOT*** a good way to debug!!!!!!!

## Features
* Insert
  * Puke-Points : filename and line
  * Sequences : Incrementing counter
  * Vairable exposure : name and value
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
* Repeat last puke output [Puke-Point or Sequence] (default shorcut: `ctrl + alt + p` / Mac: `ctrl + cmd + p`)
* Puke-Point
  * Insert new point
  * Clear all puke points in the current file
  * Update: Re-compute the line numbers
* Sequence
  * Insert new sequence (reset counter)
  * Insert next value in sequence
* Variable exposure
  * Insert name and value of selected variable

## Extension Settings
* Puke Point Format: The Puke-Point format with quotes. Use %line% and %filename% as tags for debug info.
  * Example: `"PUKE: filename: %filename%, line: %line%"`

* Sequence Format: The Sequence format with quotes. Use %seq_number% as tag for debug info.
  * Example: `"PUKE: => %seq_number% <="`

* Default variable exposure Format: The default variable exposure format with quotes. Use %name% as tag for debug info.
  * Example: `"PUKE: %name% = \" + %name%`

* Variable exposure Formats: Variable exposure format by filetype. Same format as above.
  * Languange identifiers can be found here: https://code.visualstudio.com/docs/languages/identifiers
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

* Output Formats: Output format by filetype. Same format as above.
  * Languange identifiers can be found here: https://code.visualstudio.com/docs/languages/identifiers
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

## Realease Notes

## [0.3.0](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.3.0)
Added support for:
* sequence prints. Each print increments a displayed counter
* variable exposure. Displays the selected variable in the format : 'name = value'

## [0.2.0](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.2.0)
Added support with default puke-point format for multiple languages:
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

## [0.1.1](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.1.1)
Better implementation and tested (by hand, for now) in different scenarios.  
Added commands :
* Settings for configuration
* Shortcurt for inserting
* Update all lines
* Auto-update on save
* Handles multiple cursors
* Respects indentation

## [0.0.1](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.0.1)
Implements working quickly coded first commands :
* Insert new puke point
* Clear all puke points in the current file