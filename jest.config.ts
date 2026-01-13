// jest.config.js
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // ← crucial: removes .js from imports
  },
  transform: {}, // ← important: no transform = keep ESM
  // Optional but recommended:
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
};
