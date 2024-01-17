/** @type {import("prettier").Config} */
const config = {
  overrides: [
    {
      files: "*.json",
      options: { trailingComma: "none" },
    },
  ],
};

export default config;
