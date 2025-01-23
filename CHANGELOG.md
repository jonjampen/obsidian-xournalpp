# Changelog

All notable changes to this project will be documented in this file.

## [1.0.11] - 2025-01-23

### Fixed

- Fixing issue with spacing in custom Xournal++ path.

## [1.0.10] - 2024-12-16

### Added

-   Added option to delete both XOPP and corresponding PDF file from the file menu and the commands.
-   Added option to rename both XOPP and corresponding PDF file from the file menu and the commands.

### Improved

-   When selecting a folder for a new file the default folder is no longer set as the default input value but as the top option.

## [1.0.9] - 2024-11-12

### Fixed

-   Fixing wrong inserted link after file creation.
-   Using active folder as folder path when creating a new Xournal++ file through the file explorer context menu.

## [1.0.8] - 2024-11-03

### Added

-   Fuzzy suggest for selecting the folder when creating new files.
-   Added command to insert embedded PDF after file creation.
-   Added separate modal for setting a folder and naming the new file.

### Fixed

-   `X++` button didn't show immediately on app startup and threw an error. Now it appears right away when the app starts.

## [1.0.7] - 2024-10-08

### Added

-   Added commands to insert links for PDF, XOPP, or both after file creation.
-   Added setting to specify a default folder for new Xournal++ files.

### Improved

-   Added information to documentation for setting the installation path if both Obsidian and Xournal++ are installed through Flatpack.

## [1.0.6] - 2024-09-03

### Fixed

-   Fixes issue with nested .xopp files not opening since latest release (1.0.5).

## [1.0.5] - 2024-09-02

### Fixed

-   The plugin now uses the exec function instead of Obsidian's openFile method to open .xopp files. This resolves issues regarding wrong MIME-type association from Xournal++.

## [1.0.4] - 2024-07-18

### Added

-   Option to define a custom template for new Xournal++ files.

### Fixed

-   `template.xopp` is now embedded in the code. The file was previously not downloaded during the plugin install through Obsidian.

## [1.0.3] - 2024-06-25

### Fixed

-   Using quotes (") for the file path in the conversion command.

## [1.0.2] - 2024-05-22

### Fixed

-   Adding platform OS checks for finding Xournal++ installation path.
-   Adjusting minAppVersion to latest public build.
-   Removing plugin prefix for command ids.

## [1.0.1] - 2024-05-15

### Fixed

-   Fixing issues recognized by the review bot

## [1.0.0] - 2024-05-10

### Added

-   Automatically export Xournal++ notes to PDF whenever they are modified
-   Manually export all or current Xournal++ note(s) to PDF from the command palette
-   Create a new Xournal++ note form the ribbon icon, file explorer, folder context menu, and command palette
-   Directly open corresponding Xournal++ note from the PDF viewer and file explorer (by clicking on `x++`)
