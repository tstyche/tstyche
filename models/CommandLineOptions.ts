// This is a generated file. See: ../scripts/generate-types.js

/**
 * Options passed through the command line.
 */
export interface CommandLineOptions {
    /**
     * The path to a TSTyche configuration file.
     */
    config?: string;
    /**
     * Force exit a stale process.
     */
    forceExit?: boolean;
    /**
     * Print the list of command line options with brief descriptions and exit.
     */
    help?: boolean;
    /**
     * Install specified versions of the 'typescript' package and exit.
     */
    install?: boolean;
    /**
     * Print the list of the selected test files and exit.
     */
    listFiles?: boolean;
    /**
     * Only run tests with matching name.
     */
    only?: string;
    /**
     * Remove all installed versions of the 'typescript' package and exit.
     */
    prune?: boolean;
    /**
     * Print the resolved configuration and exit.
     */
    showConfig?: boolean;
    /**
     * Skip tests with matching name.
     */
    skip?: string;
    /**
     * The list of TypeScript versions to be tested on.
     */
    target?: Array<string>;
    /**
     * Fetch the 'typescript' package metadata from the registry and exit.
     */
    update?: boolean;
    /**
     * Print the version number and exit.
     */
    version?: boolean;
    /**
     * Watch for changes and rerun related test files.
     */
    watch?: boolean;
}
