const fs = require("fs");
const path = require("path");
const https = require("https");

const destDir = path.join(__dirname, "../test-vault/.obsidian/plugins/hot-reload");

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
    const file = fs.createWriteStream(dest);
    https
        .get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(`Downloaded ${path.basename(dest)} to test-vault.`);
            });
        })
        .on("error", (err) => {
            fs.unlink(dest, () => {});
            console.error(`Failed to download ${path.basename(dest)}:`, err.message);
        });
}

// Download the official Hot Reload plugin files
download("https://raw.githubusercontent.com/pjeby/hot-reload/master/main.js", path.join(destDir, "main.js"));
download(
    "https://raw.githubusercontent.com/pjeby/hot-reload/master/manifest.json",
    path.join(destDir, "manifest.json")
);

// Create .hotreload file in xournalpp plugin directory for hot-reload plugin detection
const pluginDir = path.join(__dirname, "../test-vault/.obsidian/plugins/xournalpp");
if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
}
fs.writeFileSync(path.join(pluginDir, ".hotreload"), "");
console.log("Created .hotreload in test-vault plugin directory.");
