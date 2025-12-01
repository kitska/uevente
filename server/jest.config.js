const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  // reporters: [
  //   "default",
  //   "<rootDir>/tests/jest-timer-reporter.js",
  // ],
  transform: {
    ...tsJestTransformCfg,
  },
};