---
sidebar_position: 4
---

# Settings

To customize the plugin, go to **Settings → Xournal++**.

## Auto export Xournal++ files

-   **Description**: When enabled, this feature automatically converts Xournal++ (`.xopp`) files to PDF format every time they are modified. The PDF will share the same name as the `.xopp` file.
-   **Options**:
    -   Enabled: Automatically export `.xopp` files to PDFs on save.
    -   Disabled: Manual export only.
-   **Default**: Enabled.
-   **Use Case**: Automatically exports your Xournal++ notes to PDF whenever they are modified, so that they can be linked, embedded, and viewed in Obsidian.
-   **Warning**: Be aware that any PDF files sharing the same name and location as Xournal++ (.xopp) files will be overwritten with the exported version. Regular vault backups are therefore recommended.

## Xournal++ installation path

-   **Description**: Specifies the file path to the Xournal++ executable on your system.
-   **Purpose**: This setting needs to be set correctly for the plugin to work.
-   **Default**: System specific:
    -   Linux: `xournalpp`
    -   Windows: `"c:/Program Files/Xournal++/bin/xournalpp.exe"`
    -   macOS: `/Applications/Xournal++.app/Contents/MacOS/xournalpp`

If your path contains spaces, make sure to add double quotes around it (`"`).

> If you run into the following issue, you need to review this setting: `Error: Xournal++ path not setup correctly. Please check docs on how to set it up.`

### Finding the correct installation path

To find the right installation path for your system, you need to find out where Xournal++ is installed to. On Windows you need to link to the `.exe` file, which is usually found in the `Program Files` folder. On MacOS you need to link to the `xournalpp` file inside a `.app` folder, usually within the `Applications` folder. On Linux, if you have both Obsidian and Xournal++ installed through Flatpak, you can use `flatpak-spawn --host flatpak run com.github.xournalpp.xournalpp` (note: **do not** surround with double quotes as this is a command, not a path) as the installation path (more information: [Issue #2](https://github.com/jonjampen/obsidian-xournalpp/issues/2)).

## Xournal++ template path

-   **Description**: Sets the location of a template file used for creating new Xournal++ files.
-   **Supported Formats**: `.xopp` files only.
-   **Example Path**: `templates/template.xopp`.
-   **Default**: Not set. Uses the default Xournal++ template.
-   **Use Case**: Use this option if you have a custom Xournal++ template (e.g., with a set background, annotations, or layout) that you want applied when creating new files via the plugin.

### Creating a Xournal++ template

A Xournal++ template is just an `.xopp` file. So open Xournal++, modify the settings (like background, etc.), click `Save as`, and save the file in your Obsidian vault. Then set the `Xournal++ template path` in the plugin's settings to this file.

## Default path for new Xournal++ files

-   **Description**: This folder will be pre-selected when creating a new Xournal++ note, making it faster to save new files to this folder.
-   **Example Path**: `handwritten/`
-   **Default**: Not set.
-   **Use Case**: Use this option if you generally save Xournal++ files in the same folder.
