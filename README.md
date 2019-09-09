# Puke-Debug
A VS Code extension that inserts emetic debug lines where you need them. Last resort option in debugging... The inserted debug outputs (puke points) contain the line number and the name of the file.  
This extension allows you to easily add thos horrible debug lines like:
```
fmt.Println('PUKE-POINT: filename: /README.md, line: 5') // PKDBG
doThis()
fmt.Println('PUKE-POINT: filename: /README.md, line: 7') // PKDBG
doThat()
fmt.Println('PUKE-POINT: filename: /README.md, line: 9') // PKDBG
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
* Insert new puke point (default shorcut: `ctrl + alt + p` / Mac: `ctrl + cmd + p`)
* Clear all puke points in the current file
* Re-compute the line numbers

### Planned features:
* If some code is selected, the commands only impact the selection

## Extension Settings
* Default Puke Point Format: The default Puke-Point format. Use %line% and %filename% as tags for debug info.
  * Example: `"print('PUKE-POINT: filename: %filename%, line: %line%')"`

* Puke Point Formats: Puke-Point format by filetype. Same format as above.
  * Languange identifiers can be found here: https://code.visualstudio.com/docs/languages/identifiers
  * Example:
  ```json
  {
    "shellscript": "echo \"PUKE-POINT: filename: %filename%, line: %line%\"",
    "c": "printf(\"PUKE: filename: %filename%, line: %line%\");",
    "cpp": "std::cout \"PUKE: filename: %filename%, line: %line%\" << std::endl;",
    "csharp": "Console.WriteLine(\"PUKE: filename: %filename%, line: %line%\");",
    "go": "fmt.Println('PUKE: filename: %filename%, line: %line%')",
    "java": "System.out.println(\"PUKE: filename: %filename%, line: %line%\");",
    "javascript": "console.log('PUKE: filename: %filename%, line: %line%');",
    "makefile": "echo \"PUKE-POINT: filename: %filename%, line: %line%\"",
    "php": "echo \"PUKE-POINT: filename: %filename%, line: %line%\";",
    "python": "print('PUKE: filename: %filename%, line: %line%')",
    "rust": "dbg!(\"'PUKE: filename: %filename%, line: %line%'\");",
    "scala": "println(\"PUKE-POINT: filename: %filename%, line: %line%\")",
    "typescript": "console.log('PUKE: filename: %filename%, line: %line%');"
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
No currently known issue. Feel free to signal it if you find one! :-)

## Realease Notes

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