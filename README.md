# Puke-Debug
A VS Code extension that inserts emetic debug lines where you need them. Last resort option in debugging... The inserted debug outputs (puke points) contain the line number and the name of the file.  
This extension allows you to easily add thos horrible debug lines like:
```
print('PUKE-DEBUG: file: /src/foo, line: 6') // PKDBG
doThis()
print('PUKE-DEBUG: file: /src/foo, line: 8') // PKDBG
doThat()
print('PUKE-DEBUG: file: /src/foo, line: 10') // PKDBG
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
* Use your own format with %filename% and %line% tags

### Current commands:
* Insert new puke point (shorcut: `ctrl + insert`)
* Clear all puke points in the current file
* Re-compute the line numbers

### Planned commands:
* Toggle (enable/disable) puke points

### Planned features:
* If some code is selected, the commands only impact the selection
* Specific format based on file type
  * With defaults for some current languages

## Extension Settings
* pukePointFormat: Puke-Point format. Use %line% and %filename% as tags for debug info.
  * Example: `"print('PUKE-POINT: filename: %filename%, line: %line%')"`

* commentOpening: The string to open a comment
  * Example: `"//"` or `"/*"`

* commentTAG: The comment tag to identify puke-points
  * Example: `"PKDBG"`

* commentClosing: The string to close a comment
  * Example: `""` (with inline comment) or `"*/"` (with multiline comment)

* updateOnSave: Updates the Puke-Points on save

## Known Issues
No currently known issue. Feel free to signal it if you find one! :-)

## Realease Notes

## 0.1.0 (upcoming)
Better implementation and tested (by hand, for now) in different scenarios.  
Added commands :
* Settings for configuration
* Shortcurt for inserting
* Update all lines
* Auto-update on save
* Handles multiple cursors
* Respects indentation

## 0.0.1
Implements working quickly coded first commands :
* Insert new puke point
* Clear all puke points in the current file