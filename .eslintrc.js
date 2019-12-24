module.exports = {
  env: {
    es6: true,
    commonjs: true,
    node: true,
    browser: true
  },
  extends: ['airbnb-base', 'prettier', 'plugin:node/recommended'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  ecmaFeatures: {
    modules: true,
    spread: true
  },
  rules: {
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 0,
    'linebreak-style': ['error', 'unix'],
    'no-unused-vars': 'warn',
    'prettier/prettier': 'error',
    'func-names': 'off',
    'no-process-exit': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'object-shorthand': 'off',
    'class-methods-use-this': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-param-reassign': 'warn'
  }
};
