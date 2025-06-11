import prettier from 'eslint-plugin-prettier';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      "node_modules/**/*",
      "dist/**/*"
    ]
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'prettier': prettier
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module"
      }
    },
    rules: {
      "no-console": "warn",
      "prettier/prettier": "error",
      ...eslintConfigPrettier.rules
    }
  }
];
