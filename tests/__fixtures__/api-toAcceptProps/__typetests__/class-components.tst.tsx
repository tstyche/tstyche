// biome-ignore lint/correctness/noUndeclaredDependencies: test
import React from "react";
import { describe, expect, test } from "tstyche";

interface FirstProps {
  one?: string;
}

interface SecondProps {
  one: string | undefined;
  two?: boolean;
}

class None extends React.Component {
  override props: {};
  constructor(props: {}) {
    super(props);
    this.props = props;
  }

  override render() {
    return <>{"none"}</>;
  }
}

class First extends React.Component<FirstProps> {
  override props: FirstProps;
  constructor(props: FirstProps) {
    super(props);
    this.props = props;
  }

  override render() {
    return <>{`${this.props.one}`}</>;
  }
}

class Second extends React.Component<SecondProps> {
  override props: SecondProps;
  constructor(props: SecondProps) {
    super(props);
    this.props = props;
  }

  override render() {
    return <>{`${this.props}`}</>;
  }
}

describe("when source is a function component", () => {
  test("accepts props of the given type", () => {
    expect(None).type.toAcceptProps({});
    expect(None).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({});
    expect(First).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({ one: "sample" });
    expect(First).type.not.toAcceptProps({ one: "sample" }); // fail

    expect(Second).type.toAcceptProps({ one: "sample" });
    expect(Second).type.not.toAcceptProps({ one: "sample" }); // fail

    const oneProp = { one: "sample" };
    expect(Second).type.toAcceptProps({ ...oneProp });
    expect(Second).type.not.toAcceptProps({ ...oneProp }); // fail

    expect(Second).type.toAcceptProps({ one: "sample", two: true });
    expect(Second).type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const twoProps = { one: "sample", two: true };
    expect(Second).type.toAcceptProps({ ...twoProps });
    expect(Second).type.not.toAcceptProps({ ...twoProps }); // fail
  });

  test("does not accept props of the given type", () => {
    expect(None).type.not.toAcceptProps({ one: "sample" });
    expect(None).type.toAcceptProps({ one: "sample" }); // fail: Property 'one' does not exist

    expect(First).type.not.toAcceptProps({ one: 1 });
    expect(First).type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    expect(First).type.not.toAcceptProps({ two: false });
    expect(First).type.toAcceptProps({ two: false }); // fail: Property 'two' does not exist

    expect(First).type.not.toAcceptProps({ one: "sample", two: false });
    expect(First).type.toAcceptProps({ one: "sample", two: false }); // fail: Property 'two' does not exist

    expect(Second).type.not.toAcceptProps({});
    expect(Second).type.toAcceptProps({}); // fail: Property 'one' is missing

    expect(Second).type.not.toAcceptProps({ one: 1 });
    expect(Second).type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    const oneProp = { one: 1 };
    expect(Second).type.not.toAcceptProps({ ...oneProp });
    expect(Second).type.toAcceptProps({ ...oneProp }); // fail: Type 'number' is not assignable

    expect(Second).type.not.toAcceptProps({ one: "sample", two: 2 });
    expect(Second).type.toAcceptProps({ one: "sample", two: 2 }); // fail: Type 'number' is not assignable

    const twoProps = { one: "sample", two: 2 };
    expect(Second).type.not.toAcceptProps({ ...twoProps });
    expect(Second).type.toAcceptProps({ ...twoProps }); // fail: Type 'number' is not assignable

    expect(Second).type.not.toAcceptProps({ two: true });
    expect(Second).type.toAcceptProps({ two: true }); // fail: Property 'one' is missing

    expect(Second).type.not.toAcceptProps({ three: 123 });
    expect(Second).type.toAcceptProps({ three: 123 }); // fail: Property 'three' does not exist

    expect(Second).type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect(Second).type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail: Property 'three' does not exist
  });
});

describe("when source is a type", () => {
  type NoneConstructor = new () => None;

  type FirstConstructor = new ({ one }: FirstProps) => First;

  type SecondConstructor = new (props: SecondProps) => Second;

  test("accepts props of the given type", () => {
    expect<NoneConstructor>().type.toAcceptProps({});
    expect<NoneConstructor>().type.not.toAcceptProps({}); // fail

    expect<FirstConstructor>().type.toAcceptProps({});
    expect<FirstConstructor>().type.not.toAcceptProps({}); // fail

    expect<FirstConstructor>().type.toAcceptProps({ one: "sample" });
    expect<FirstConstructor>().type.not.toAcceptProps({ one: "sample" }); // fail

    expect<SecondConstructor>().type.toAcceptProps({ one: "sample" });
    expect<SecondConstructor>().type.not.toAcceptProps({ one: "sample" }); // fail

    const oneProp = { one: "sample" };
    expect<SecondConstructor>().type.toAcceptProps({ ...oneProp });
    expect<SecondConstructor>().type.not.toAcceptProps({ ...oneProp }); // fail

    expect<SecondConstructor>().type.toAcceptProps({ one: "sample", two: true });
    expect<SecondConstructor>().type.not.toAcceptProps({ one: "sample", two: true }); // fail

    const twoProps = { one: "sample", two: true };
    expect<SecondConstructor>().type.toAcceptProps({ ...twoProps });
    expect<SecondConstructor>().type.not.toAcceptProps({ ...twoProps }); // fail
  });

  test("does not accept props of the given type", () => {
    expect<NoneConstructor>().type.not.toAcceptProps({ one: "sample" });
    expect<NoneConstructor>().type.toAcceptProps({ one: "sample" }); // fail: Property 'one' does not exist

    expect<FirstConstructor>().type.not.toAcceptProps({ one: 1 });
    expect<FirstConstructor>().type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    expect<FirstConstructor>().type.not.toAcceptProps({ two: false });
    expect<FirstConstructor>().type.toAcceptProps({ two: false }); // fail: Property 'two' does not exist

    expect<FirstConstructor>().type.not.toAcceptProps({ one: "sample", two: false });
    expect<FirstConstructor>().type.toAcceptProps({ one: "sample", two: false }); // fail: Property 'two' does not exist

    expect<SecondConstructor>().type.not.toAcceptProps({});
    expect<SecondConstructor>().type.toAcceptProps({}); // fail: Property 'one' is missing

    expect<SecondConstructor>().type.not.toAcceptProps({ one: 1 });
    expect<SecondConstructor>().type.toAcceptProps({ one: 1 }); // fail: Type 'number' is not assignable

    const oneProp = { one: 1 };
    expect<SecondConstructor>().type.not.toAcceptProps({ ...oneProp });
    expect<SecondConstructor>().type.toAcceptProps({ ...oneProp }); // fail: Type 'number' is not assignable

    expect<SecondConstructor>().type.not.toAcceptProps({ one: "sample", two: 2 });
    expect<SecondConstructor>().type.toAcceptProps({ one: "sample", two: 2 }); // fail: Type 'number' is not assignable

    const twoProps = { one: "sample", two: 2 };
    expect<SecondConstructor>().type.not.toAcceptProps({ ...twoProps });
    expect<SecondConstructor>().type.toAcceptProps({ ...twoProps }); // fail: Type 'number' is not assignable

    expect<SecondConstructor>().type.not.toAcceptProps({ two: true });
    expect<SecondConstructor>().type.toAcceptProps({ two: true }); // fail: Property 'one' is missing

    expect<SecondConstructor>().type.not.toAcceptProps({ three: 123 });
    expect<SecondConstructor>().type.toAcceptProps({ three: 123 }); // fail: Property 'three' does not exist

    expect<SecondConstructor>().type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect<SecondConstructor>().type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail: Property 'three' does not exist
  });
});
