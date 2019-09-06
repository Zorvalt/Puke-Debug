# Puke-Debug
A VS Code extension that inserts emetic debug lines where you need them. Last resort option in debugging...

## Why!?!?!?!?!
Because sometimes... In some very specific contexts... You cannot use a debugger...  
ONLY in those cases should you use this extension ! It is ***NOT*** a good way to debug!!!!!!!

## Features
The inserted debug outputs (puke points) contain the line number and the name of the file.  
This extension allows you to easily add thos horrible debug lines like:
```
print('PUKE-DEBUG: file: /src/foo, line: 6') //PKDBG
aMysteriousFunctionCall()
print('PUKE-DEBUG: file: /src/foo, line: 8') //PKDBG
aMysteriousFunctionCall2()
print('PUKE-DEBUG: file: /src/foo, line: 10') //PKDBG
...
```
instead of
```
print('1')
aMysteriousFunctionCall()
print('2')
aMysteriousFunctionCall2()
print('3')
...
```

### Current commands:
* Insert new puke point
* Clear all puke points in the current file

### Planned commands:
* Re-compute the line numbers
* Toggle (enable/disable) puke points

### Planned features:
* Auto-recompute line numbers on save
* If some code is selected, the commands only impact the selection

## Extension Settings
None yet.  
### Planned settings are:
* prefix: The beging of the debug line. Default = 'PUKE-DEBUG: '
* debug_function_name: The output function. Default = 'fmt.Println'
* comment_tag: The tag in the comment to recognize debug lines. Default = 'PKDBG'
* comment_prefix: The comment opening. Default = '//'
* auto_recompute_on_save: Enables automatic recomputation of line numbers on save

## Known Issues
Currently, line numbers are not recomputed when the file changes.

## Realease Notes

## 0.0.1
Implements working quickly coded first commands :
* Insert new puke point
* Clear all puke points in the current file