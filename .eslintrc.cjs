module.exports = {
    root: true,
    env: { node: true, es2022: true },
    parser: "@typescript-eslint/parser",
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: ["@typescript-eslint", "import", "unused-imports"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier"
    ],
    rules: {
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "import/order": [
            "error",
            {
                "newlines-between": "always",
                "alphabetize": { "order": "asc", "caseInsensitive": true }
            }
        ]
    },
    settings: {
        "import/resolver": { typescript: true }
    }
};
