// This is a generated file. See: ../scripts/generate-types.js

/**
 * Options loaded from the configuration file.
 */
export interface ConfigFileOptions {
    /**
     * Stop running tests after the first failed assertion.
     */
    failFast?: boolean;
    /**
     * The list of TSTyche plugins.
     */
    plugins?: Array<string>;
    /**
     * The path to a directory containing files of a test project.
     */
    rootPath?: string;
    /**
     * The list of TypeScript versions to be tested on.
     */
    target?: Array<string>;
    /**
     * The list of glob patterns matching the test files.
     */
    testFileMatch?: Array<string>;
}
