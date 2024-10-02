# Setting the Xournal++ Installation Path

If you run into the following error or encounter any other issues, you might have to set the path to your Xournal++ installation manually.

```
Error: Xournal++ path not setup correctly. Please check docs on how to set it up.
```

## Defaults

The defaults are the following:

-   Linux: `xournalpp`
-   Windows: `c:\Program Files\Xournal++\bin\xournalpp.exe`
-   MacOS: `/Applications/Xournal++.app/Contents/MacOS/xournalpp`

By default, this plugin will try through all the above options.

## Manually Setting the Xournal++ Path

To manually set the Xournal++ installation path, open Obsidian and go to **Settings -> Xournal++** and set the path to whatever is right on your system.

### Find the Right Xournal++ Installation Path

To find the right installation path for your system, you need to find out where Xournal++ is installed to. On Windows you need to link to the `.exe` file, which is usually found in the `Program Files` folder. On MacOS you need to link to the `xournalpp` file inside a `.app` folder, usually within the `Applications` folder. On Linux, if you have both Obsidian and Xournal++ installed through Flatpack, you can use `flatpak-spawn --host flatpak run com.github.xournalpp.xournalpp` as the installation path (more information: [Issue #2](https://github.com/jonjampen/obsidian-xournalpp/issues/2)).
