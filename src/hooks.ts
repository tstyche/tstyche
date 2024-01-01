import fs from "node:fs/promises";
import type { LoadHookContext, ModuleFormat, ModuleSource } from "node:module";

interface LoadFnOutput {
  format: ModuleFormat;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  responseURL?: string | undefined;
  shortCircuit?: boolean | undefined;
  source?: ModuleSource | null | undefined;
}

export async function load(
  moduleSpecifier: string,
  hookContext: LoadHookContext,
  nextLoad: (moduleSpecifier: string, hookContext?: LoadHookContext) => Promise<LoadFnOutput>,
): Promise<LoadFnOutput> {
  const result = await nextLoad(moduleSpecifier, hookContext);

  if (
    moduleSpecifier.endsWith("typescript/lib/typescript.js") ||
    moduleSpecifier.endsWith("typescript/lib/tsserverlibrary.js")
  ) {
    const fileContent = await fs.readFile(new URL(result.responseURL ?? moduleSpecifier), {
      encoding: "utf8",
    });

    const source = fileContent.replace(
      "isTypeAssignableTo,",
      "isTypeAssignableTo, isTypeIdenticalTo, isTypeSubtypeOf,",
    );

    return { format: result.format, source };
  }

  return result;
}
