# Change Log

## [1.0.0](https://github.com/Zorvalt/Puke-Debug/releases/tag/v1.0.0)
Improved user experience:
* Puke prints are now inserted BEFORE current line.
  More logical for a lot of users, especially when using exposures:
    - the selected expression is probably meant to be displayed(for debug)
    before being used in the code.

Improved consistency amongs commands and settings:
* Renamed `pukePoint` commands to `Point` (e.g. `insertPukePoint` becomes `insertPoint`)
* Pluralized commands meant to affect multiple lines
* Renamed configuration `pukePointFormat` to `pointFormat`

Fix:
* multi-carret support for exposures

Implement first tests:
* Covering most basic usages

## [0.3.2](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.3.2)
Package updates:
* Bump path-parse from 1.0.6 to 1.0.7
* Bump glob-parent from 5.1.1 to 5.1.2

## [0.3.1](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.3.1)
Fixed inseting pukes with default format (file types not specified in settings)

## [0.3.0](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.3.0)
Added support for:
* Sequence prints. Each print increments a displayed counter
* Variable exposure. Displays the selected variable in the format : 'name = value'
* Comments format by language (in the settings)
* Stabilized code base (for evolution and maintenance)
* Fixed all known bugs
* Nice logo

## [0.2.0](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.2.0) - 2019-09-09
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

## [0.1.1](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.1.1) - 2019-09-09
Better implementation and tested (by hand, for now) in different scenarios.  
Added commands :
* Settings for configuration
* Shortcurt for inserting
* Update all lines
* Auto-update on save
* Handles multiple cursors
* Respects indentation

## [0.0.1](https://github.com/Zorvalt/Puke-Debug/releases/tag/v0.0.1) - 2019-09-06
Implements working quickly coded first commands :
* Insert new puke point
* Clear all puke points in the current file