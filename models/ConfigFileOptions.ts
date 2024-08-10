// This is a generated file. See: ../scripts/generate-types.js

/**
 * Options loaded from the configuration file.
 */
export interface ConfigFileOptions {
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
