module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    semi: ['error', 'always'],
    indent: ['error', 2],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_|next' }],
  },
};
