import { describe, expect, test } from "tstyche";

const Component = () => "test";

namespace Namespace {
  export const Component = () => "test";
}

describe("argument for 'source'", () => {
  const $component = () => "test";
  const _component = () => "test";
  const component = () => "test";

  function GenericComponent<T>({ a, b }: { a: T; b: T }) {
    return "test";
  }

  test("must be provided", () => {
    expect().type.toAcceptProps({ test: false });
  });

  test("must be an identifier of a JSX component", () => {
    expect({ a: "sample" }).type.toAcceptProps({ test: false });
    expect(() => {}).type.toAcceptProps({ test: false });
  });

  test("must an identifier that begins with an uppercase letter", () => {
    expect(component).type.toAcceptProps({});
  });

  test("allowed expressions", () => {
    expect(Component).type.toAcceptProps({});
    expect(Namespace.Component).type.toAcceptProps({});
    expect(GenericComponent).type.not.toAcceptProps({});
    expect(GenericComponent<string>).type.not.toAcceptProps({});
    expect($component).type.toAcceptProps({});
    expect(_component).type.toAcceptProps({});
  });
});

describe("type argument for 'source'", () => {
  type Component = () => React.JSX.Element;
  // biome-ignore lint/style/useNamingConvention: test
  type $component = () => React.JSX.Element;
  // biome-ignore lint/style/useNamingConvention: test
  type _component = () => React.JSX.Element;
  // biome-ignore lint/style/useNamingConvention: test
  type component = () => React.JSX.Element;

  test("must be an identifier of a JSX component", () => {
    expect<{ a: string }>().type.not.toAcceptProps({});
    expect<() => string>().type.not.toAcceptProps({});
  });

  test("must an identifier that begins with an uppercase letter", () => {
    expect<component>().type.toAcceptProps({});
  });

  test("allowed types", () => {
    expect<Component>().type.toAcceptProps({});
    expect<$component>().type.toAcceptProps({});
    expect<_component>().type.toAcceptProps({});
  });
});

describe("argument for 'target'", () => {
  test("must be provided", () => {
    // @ts-expect-error!
    expect(Component).type.toAcceptProps();
  });

  test("must be an object literal", () => {
    // @ts-expect-error!
    expect(Component).type.toAcceptProps("nope");
  });

  test("must only contain key-value pairs", () => {
    const b = "no";
    const c = { c: true };
    expect(Component).type.toAcceptProps({ a: "yes", b, ...c });
  });

  test("property keys must be static identifiers or string literals", () => {
    expect(Component).type.toAcceptProps({ ["a"]: "nope" });
  });
});
