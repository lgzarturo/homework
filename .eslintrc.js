module.exports = {
  "env": {
      "node": true,
      "browser": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "ecmaVersion": 5
  },
  "rules": {
      "no-console": 0,
      "indent": [
          "error",
          2
      ],
      "linebreak-style": [
          "error",
          "unix"
      ],
      "quotes": [
          "error",
          "single"
      ],
      "semi": [
          "error",
          "always"
      ]
  }
};