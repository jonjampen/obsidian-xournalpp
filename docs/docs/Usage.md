---
sidebar_position: 3
---

# Usage

## Corresponding PDF

By default, this plugin automatically exports all Xournal++ notes to PDF (you can do this manually too, see below). Those exported PDFs are referred to as the "corresponding PDF" of Xournal++ notes. Those corresponding PDFs share the same name and file location as the Xournal++ file. By default, only the corresponding PDFs are shown in the file explorer of Obsidian, not the Xournal++ files, however, even though they are technically a PDF, they are labeled as `X++` to show, that they have a corresponding Xournal++ note (and are not just a standalone PDF).

## Creating a new Xournal++ file

This plugin offers several options to create a new Xournal++ file from within Obsidian.

1. File Explorer: Open the file explorer and click on the ![pen tool](https://github.com/user-attachments/assets/7560dc83-2c38-44a4-9f8f-276b66c693c8) icon.
1. Folder Menu: Right-click on a folder in the file explorer and click on `Create new Xournal++`.
1. Command: Open your command palette and type `Xournal++: Create a new note` and press enter.
1. Ribbon Icon: Click on the ![pen tool](https://github.com/user-attachments/assets/7560dc83-2c38-44a4-9f8f-276b66c693c8) icon in the ribbon side bar. After that, a modal opens where you need to select the folder, where the new file will be saved to. By default, your [Default path](Settings#xournal-installation-path) is selected, so you can just press enter to select that. If you want to select another folder, start typing, use the arrow keys to move the selection up or down, and press `tab` to auto-complete the selected folder. Then press `enter` to select the active folder.

Then a new modal opens, asking for the file name. Enter it and press `enter`. Note that if you have the setting `Auto export Xournal++ files` disabled, you will not be able to see the newly created Xournal++ file in the Obsidian file explorer. This is because Obsidian hides `.xopp` files (and most other file types) by default. However, the file is still created and can be linked to. If you prefer to view the Xournal++ file in Obsidian, enabling the auto export setting is recommended (read more: [Settings](Settings#auto-export-xournal-files)).

## Opening a file in Xournal++ from Obsidian

There are several ways to open a specific file in Xournal++. First locate the corresponding PDF to your Xournal++ note, then follow either of the following options:

1. File Explorer: In the file explorer, click on the `X++` label next to the filename of the corresponding PDF.
1. File Menu: In the file explorer, right-click on the corresponding PDF and select `Open in Xournal++`
1. Command: Open the corresponding PDF and open the command palette and type `Xournal++: Open current note`.

## Renaming a Xournal++ file

To rename a Xournal++ file, locate the corresponding PDF (labeled with `X++`) and either use the command `Xournal++: Rename current PDF and corresponding Xournal++ note` or open the file menu and click `Rename PDF & Xournal++...`.

Use this option instead of renaming the `.xopp` manually, as it updates both the name of the Xournal++ and the corresponding PDF.

## Deleting a Xournal++ file

To delete a Xournal++ file, locate the corresponding PDF (labeled with `X++`) and either use the command `Xournal++: Delete current PDF and corresponding Xournal++ note` or open the file menu and click `Delete PDF & Xournal++...`.

Use this option instead of manually deleting the `.xopp`, as it deletes both the Xournal++ and corresponding PDF file.

## Manually exporting Xournal++ files to PDF

There is a setting that automatically exports all Xournal++ files to PDF whenever they are modified. It is recommended to turn this setting on. However, there is also the option to manually export Xournal++ files, either through the file menu `Update from Xournal++` or the command `Xournal++: Update current PDF` or `Xournal++: Export all notes to PDF`.
