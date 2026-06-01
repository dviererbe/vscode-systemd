# Change Log

All notable changes to the VS Code systemd extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* unit explorer enhancements:
  * filter value displayed in header
  * commands/context menu items (configure filter, clear filter)
  * refresh on interval (default: every 5 seconds)
* zoom and pan control to startup time plot
* progress indication for systemd-analyze plot command

### Changed

* merged system and user unit explorers into a single unified view
* open unit file via inline icon (replaces tree-item click)

### Fixed

* replaced incorrect changelog file included in the package

## [0.0.1] - 15 May 2026

### Initial release

* systemd system/user unit explorer
  * configurable display (tree item label, description, icon)
  * sorting, grouping, and filtering options
  * interactive unit management (enable, disable, start, stop, restart)
  * journal viewing
* language services (folding, hover, symbols)
* unit file installation
* service startup visualization

[unreleased]: https://github.com/dviererbe/vscode-systemd/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/dviererbe/vscode-systemd/releases/tag/v0.0.1
