import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    {
        ignores: [
            "node_modules/",
            "main.js",
            "esbuild.config.mjs",
            "version-bump.mjs",
            "tests/mocks/",
            "docs/**",
            "vitest.config.mts",
            "test-vault/**",
            "scripts/**",
        ],
    },
    ...obsidianmd.configs.recommended,
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: ["./tsconfig.json", "./tsconfig.test.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,

            // Disable settings tab deprecations to keep compatibility with Obsidian < 1.13.0
            "obsidianmd/settings-tab/no-deprecated-display": "off",
            "obsidianmd/settings-tab/prefer-setting-definitions": "off",

            // Disable command ID rules to be able to use xournalpp in command ids
            "obsidianmd/commands/no-plugin-id-in-command-id": "off",

            // Disable sentence-case rule to support Title Case in UI
            "obsidianmd/ui/sentence-case": "off",

            semi: ["error", "always"],
            quotes: ["error", "double", { avoidEscape: true }],
            curly: ["error", "multi-line"],
            eqeqeq: ["error", "always", { null: "ignore" }],
            "no-var": "error",
            "prefer-const": "error",
            "no-debugger": "error",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/no-deprecated": "off",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
    // Test-specific overrides to allow mocking and disable strict checks
    {
        files: ["tests/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
            "obsidianmd/no-tfile-tfolder-cast": "off",
            "obsidianmd/hardcoded-config-path": "off",
            "eslint-comments/no-restricted-disable": "off",
            "eslint-comments/require-description": "off",
            "eslint-comments/no-use": "off",
        },
    },
    // Allow lint-staged dependency in package.json
    {
        files: ["package.json"],
        rules: {
            "depend/ban-dependencies": [
                "error",
                {
                    allowed: ["lint-staged"],
                },
            ],
        },
    },
];
