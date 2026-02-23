import globals from "globals";

export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node
            }
        },
        rules: {
            indent: ["error", 4],
            quotes: ["error", "double", { "allowTemplateLiterals": true }],
            curly: ["error", "all"],
            "no-console": "off"
        }
    }
];
