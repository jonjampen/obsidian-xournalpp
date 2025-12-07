import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
    {
        ignores: ["node_modules/", "main.js", "esbuild.config.mjs", "version-bump.mjs", "tests/mocks/", "docs/**"],
    },
    {
        files: ["src/**/*.ts", "tests/**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,

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
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
];
