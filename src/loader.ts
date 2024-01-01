import fs from "node:fs/promises";
import type { LoadFnOutput, LoadHookContext, ModuleFormat, ModuleSource } from "node:module";

export async function load(
  url: string,
  context: LoadHookContext,
  nextLoad: (
    url: string,
    context?: LoadHookContext,
  ) => Promise<{
    format: ModuleFormat;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    responseURL?: string | null;
    source?: ModuleSource;
  }>,
): Promise<LoadFnOutput> {
  const result = await nextLoad(url, context);

  const moduleSpecifier = result.responseURL ?? url;

  if (
    moduleSpecifier.endsWith("typescript/lib/typescript.js") ||
    moduleSpecifier.endsWith("typescript/lib/tsserverlibrary.js")
  ) {
    const fileContent = await fs.readFile(new URL(moduleSpecifier), {
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
