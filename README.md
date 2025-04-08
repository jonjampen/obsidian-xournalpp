# Xournal++

A seamless integration with [Xournal++](https://xournalpp.github.io). Xournal++ is an open-source and cross-platform note taking application for digital, **handwritten notes** and PDF **annotations**.

[Install Plugin](https://obsidian.md/plugins?id=xournalpp) | [Documentation](https://github.com/jonjampen/obsidian-xournalpp/wiki) | [GitHub](https://github.com/jonjampen/obsidian-xournalpp/) | [Discord](https://discord.gg/VngwVHJQg5)

## Features

-   Automatically **export** Xournal++ notes **to PDF** whenever they are modified, so that they can be linked, embedded, and viewed in Obsidian
-   Easily **create** new Xournal++ files (.xopp) directly from within Obsidian, accessible from the ribbon icon, file explorer, and command palette
-   Access the **"Edit in Xournal++"** option via an icon in the PDF preview as well as in file explorer (by clicking on `X++`), enabling quick navigation to the corresponding Xournal++ file.

## Usage

> Be mindful that any PDF files sharing the same name and location as Xournal++ (.xopp) files will be overwritten with the exported version. This ensures seamless integration and consistent file management within Obsidian (regular vault backups are therefore recommended).

1. Ensure you have [Xournal++](https://xournalpp.github.io) installed on your device
1. Open Obsidian and got to **Settings → Community Plugins**
1. Turn on Community Plugins
1. Select **Browse** and search for `Xournal++`
1. Select **Install** and then **Enable**
1. The plugin is now installed. Select **Options** if you want to change the default plugin settings.

You can head over to the [documentation](https://github.com/jonjampen/obsidian-xournalpp/wiki) for more information on how to use the plugin and customize the settings.

## ⚠️ Breaking Changes

Release [`v1.1.0`](https://github.com/jonjampen/obsidian-xournalpp/releases/tag/1.1.0) introduced a breaking change: if you have a space in your custom Xournal++ Installation path, be sure to add double quotes around it (`"`). Also see: [Release Notes](https://github.com/jonjampen/obsidian-xournalpp/releases/tag/1.1.0)

## Developer

This plugin is created and maintained by [Jon Jampen](mailto:hello@jonjampen.ch). Thanks to the contributors for their valuable input and improvements. I hope you find this plugin useful!
