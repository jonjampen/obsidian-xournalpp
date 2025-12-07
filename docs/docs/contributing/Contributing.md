## Contributing and Feature Requests

Your feedback, contributions, and feature requests are valuable to the development of the plugin. Please submit any issues or suggestions via the [GitHub repository](https://github.com/jonjampen/obsidian-xournalpp/issues). You can also join our [Discord](https://discord.gg/VngwVHJQg5) to chat with me, ask questions, or send suggestions.

Contributions in any form are welcome. To contribute, create a pull request and feel free to reach out to me at any time. If you'd like to beta test the plugin, follow the instructions [here](../Beta-Testing).

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