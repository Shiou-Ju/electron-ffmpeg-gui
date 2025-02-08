// FIXME: maybe does not need this file
module.exports = {
  parser: "typescript-eslint-parser",
  plugins: ["typescript"],
  rules: {
    "typescript/class-name-casing": "error",
    eqeqeq: [
      "error",
      "always",
      {
        null: "ignore",
      },
    ],
  },
};
