// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Obsidian Xournal++ Plugin",
    tagline: "Obsidian plugin that seamlessly integrates Xournal++ for handwritten notes and annotations.",
    favicon: "img/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: "https://jonjampen.github.io",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/obsidian-xournalpp/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "jonjampen", // Usually your GitHub org/user name.
    projectName: "obsidian-xournalpp", // Usually your repo name.

    onBrokenLinks: "throw",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: "./sidebars.js",
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: "https://github.com/jonjampen/obsidian-xournalpp/tree/master/docs",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: "img/docusaurus-social-card.jpg",
            colorMode: {
                respectPrefersColorScheme: true,
            },
            navbar: {
                title: "Obsidian Xournal++",
                logo: {
                    alt: "Obsidian Xournal++ Logo",
                    src: "img/logo.png",
                },
                items: [
                    {
                        type: "docSidebar",
                        sidebarId: "tutorialSidebar",
                        position: "left",
                        label: "Docs",
                    },
                    { to: "/installation", label: "Installation", position: "left" },
                    {
                        href: "https://github.com/jonjampen/obsidian-xournalpp",
                        label: "GitHub",
                        position: "right",
                    },
                ],
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "Plugin",
                        items: [
                            {
                                label: "Plugin Link",
                                to: "https://obsidian.md/plugins?id=xounralpp",
                            },
                            {
                                label: "Documentation",
                                to: "/docs/Home",
                            },
                        ],
                    },
                    {
                        title: "Community",
                        items: [
                            {
                                label: "Discord",
                                href: "https://discord.gg/VngwVHJQg5",
                            },
                            {
                                label: "Submit an issue",
                                href: "https://github.com/jonjampen/obsidian-xournalpp/issues",
                            },
                        ],
                    },
                    {
                        title: "More",
                        items: [
                            {
                                label: "GitHub",
                                href: "https://github.com/jonjampen/obsidian-xournalpp",
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Obsidian Xournal++ Plugin, built by <a href="https://jonjampen.ch" target="_blank">Jon Jampen</a> and awesome contributors.`,
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
            },
        }),
};

export default config;
