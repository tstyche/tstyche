export interface FileSystemEntries {
  directories: Array<string>;
  files: Array<string>;
}

export interface FileSystemEntryMeta {
  isDirectory: () => boolean;
  isFile: () => boolean;
  isSymbolicLink: () => boolean;
}

export type FileTree = Record<string, string>;
