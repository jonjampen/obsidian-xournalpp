import { Plugin } from 'obsidian';
import { createCommands } from 'src/commands';
import { setupListeners } from 'src/listeners';
import { createRibbonIcons } from 'src/ribbonIcons';

export default class XoppPlugin extends Plugin {
    onload() {
		setupListeners(this);
		createCommands(this);
		createRibbonIcons(this);
    }

    onunload() {}
}
