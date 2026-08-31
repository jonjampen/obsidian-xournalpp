# Xournalpp

<p align="center">
  <a href="https://github.com/jonjampen/obsidian-xournalpp/actions/workflows/ci.yml">
    <img src="https://github.com/jonjampen/obsidian-xournalpp/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <a href="https://github.com/jonjampen/obsidian-xournalpp/releases">
    <img src="https://img.shields.io/github/v/release/jonjampen/obsidian-xournalpp?include_prereleases&color=blue&style=flat-square" alt="Latest Release" />
  </a>
  <a href="https://community.obsidian.md/plugins/xournalpp">
    <img src="https://img.shields.io/badge/Obsidian-Community_Plugin-purple?style=flat-square" alt="Obsidian Plugin" />
  </a>
  <a href="https://discord.gg/VngwVHJQg5">
    <img src="https://img.shields.io/badge/discord-join_chat-5865F2?logo=discord&style=flat-square" alt="Discord" />
  </a>
</p>

A seamless integration with [Xournal++](https://xournalpp.github.io). Xournal++ is an open-source, cross-platform note-taking application for digital, **handwritten notes** and PDF **annotations**. This plugin bridges Xournal++ with your Obsidian vault.

[Install Plugin](https://community.obsidian.md/plugins/xournalpp) | [Documentation Site](https://jonjampen.github.io/obsidian-xournalpp/) | [Report an Issue](https://github.com/jonjampen/obsidian-xournalpp/issues) | [Discord](https://discord.gg/VngwVHJQg5)

## Features

- **🔄 Automatic PDF Export:** Automatically exports Xournal++ notes (`.xopp`) to PDF whenever they are modified, allowing them to be linked, embedded, and viewed inside Obsidian.
- **➕ Easy Creation:** Create new Xournal++ files directly from the ribbon icon, file explorer context menu, or command palette.
- **⚡ Direct Editing:** Click the edit icon in the PDF toolbar or select "Edit in Xournal++" from the file explorer context menu to instantly open the file in Xournal++.
- **🎨 Custom Templates:** Configure default page sizes, grid backgrounds, and custom colors when creating new notes.

## How to Install

1. Install [Xournal++](https://xournalpp.github.io) on your system.
2. In Obsidian, go to **Settings → Community Plugins** and turn them on.
3. Select **Browse**, search for `Xournalpp`, and click **Install** then **Enable**.
4. Configure the path where Xournal++ is installed on your system in the plugin settings (leave empty if installed in the default system path).

> [!IMPORTANT]
> Any PDF files sharing the exact same name and location as a Xournal++ (`.xopp`) file will be overwritten with the exported version when modified. Ensure your vault is backed up.

## Contributing

Contributions are welcome! For guidelines on how to contribute code, report bugs, or request features, please see our [Contributing Guide](https://jonjampen.github.io/obsidian-xournalpp/docs/contributing/) in the documentation.

## Maintainer

This plugin is created and maintained by [Jon Jampen](mailto:hello@jonjampen.ch). Thanks to the contributors for their valuable input and improvements. I hope you find this plugin useful!

[Support on Ko-fi](https://ko-fi.com/jonjampen)
