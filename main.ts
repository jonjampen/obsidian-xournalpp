import { Plugin } from 'obsidian';
import { checkXoppSetup } from 'src/checks';
import { createCommands } from 'src/commands';
import { setupListeners } from 'src/listeners';
import { createRibbonIcons } from 'src/ribbonIcons';

export default class XoppPlugin extends Plugin {
    onload() {
      setupListeners(this);
      createCommands(this);
      createRibbonIcons(this);
      checkXoppSetup();
    }

    onunload() {}
}
