const deleteKeys = ["files", "scripts", "devDependencies", "packageManager"];

export const name = "tidy-package-json";

export function factory() {
  return {
    hooks: {
      beforeWorkspacePacking(_workspace: any, packageConfig: Record<string, unknown>) {
        for (const [key] of Object.entries(packageConfig)) {
          if (deleteKeys.includes(key)) {
            delete packageConfig[key];
          }
        }
      },
    },
  };
}
