# Contributing to Xournal++ Integration

Your feedback, contributions, and feature requests are valuable to the development of the plugin. Please submit any issues or suggestions via our [GitHub Issues](https://github.com/jonjampen/obsidian-xournalpp/issues). You can also join our [Discord Community](https://discord.gg/VngwVHJQg5) to chat, ask questions, or send suggestions.

Contributions in any form are welcome! If you'd like to beta test the plugin, follow the instructions [here](../Beta-Testing).

## Local Development Workflow

Follow these steps to set up the codebase and verify your changes:

### 1. Clone & Set Up

First, fork the [repository](https://github.com/jonjampen/obsidian-xournalpp), then clone and install the dependencies:

```bash
git clone git@github.com:YOUR-USERNAME/obsidian-xournalpp.git
cd obsidian-xournalpp
npm install
```

### 2. Development Mode

Run the development server. This compiles changes on the fly and hot-reloads them inside the `/test-vault` folder:

```bash
npm run dev
```

Open `/test-vault` in Obsidian to see your changes dynamically updated.

### 3. Running Unit Tests

We use **Vitest** for testing with mocked Obsidian environments. Ensure all tests pass:

```bash
npm run test
```

### 4. Code Quality & Formatting

We enforce formatting and linting using Prettier and ESLint v9. Verify that your code complies with our style rules:

```bash
# Run the linter
npm run lint

# Check formatting
npm run format:check
```

### 5. Production Compilation

Compile the final production assets to ensure the TypeScript build passes:

```bash
npm run build
```

## Submitting Pull Requests

1. Create a descriptive feature branch: `git checkout -b feature/my-new-feature`
2. Commit your changes. Husky will run pre-commit hooks to verify formatting and linting on your staged files.
3. Push to your fork and submit a Pull Request targeting the `master` branch.
4. Make sure all CI checks (linting, tests, build) pass on GitHub.

Thank you for your help and feel free to reach out to [@jonjampen](https://github.com/jonjampen) for any questions.
