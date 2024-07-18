# Xournal++

A seamless integration with [Xournal++](https://xournalpp.github.io). Xournal++ is an open-source and cross-platform note taking application for digital, **handwritten notes** and PDF **annotations**.

## Features

-   Automatically **export** Xournal++ notes **to PDF** whenever they are modified, so that they can be linked, embedded, and viewed in Obsidian
-   Easily **create** new Xournal++ files (.xopp) directly from within Obsidian, accessible from the ribbon icon, file explorer, and command palette
-   Access the **"Edit in Xournal++"** option via an icon in the PDF preview as well as in file explorer (by clicking on `X++`), enabling quick navigation to the corresponding Xournal++ file.

## Prerequisites

Ensure you have [Xournal++](https://xournalpp.github.io) installed on your device.

If you run into any issues, you might have to manually add the Xournal++ installation path, refer to [Setting the Xournal++ Installation Path](https://github.com/jonjampen/obsidian-xournalpp/blob/master/docs/path.md) for more information.

## Usage

> Be mindful that any PDF files sharing the same name and location as Xournal++ (.xopp) files will be overwritten with the exported version. This ensures seamless integration and consistent file management within Obsidian (regular vault backups are therefore recommended).

1. Open Obsidian and got to **Settings → Community Plugins**
1. Turn on Community Plugins
1. Select **Browse** and search for `Xournal++`
1. Select **Install** and then **Enable**
1. The plugin is now installed. Select **Options** if you want to change the default plugin settings.

## Contributing and Feature Requests

Your feedback, contributions, and feature requests are valuable to the development of the plugin. Please submit any issues or suggestions via the [GitHub repository](https://github.com/jonjampen/obsidian-xournalpp/issues).

Contributions in any form are welcome. To contribute, create a pull request and feel free to reach out to me at any time.

### Local development

First, fork this [repository](https://github.com/jonjampen/obsidian-xournalpp), then run the following commands:

```bash
cd YOUR-OBSIDIAN-VAULT/.obsidian/plugins/
git clone git@github.com:YOUR-REPOSITORY
mv obsidian-xournalpp xournalpp
cd xournalpp
git checkout -b feature-branch
npm install
npm run dev
```

## Developer

This plugin is created by [Jon Jampen](mailto:hello@jonjampen.ch). I hope you find this plugin useful!
