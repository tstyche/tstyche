import type React from "react";
import { describe, expect, test } from "tstyche";

interface FirstProps {
  one?: string;
}

interface SecondProps {
  one: string | undefined;
  two?: boolean;
}

describe("when source is a function component", () => {
  class None {
    props: {};
    constructor(props: {}) {
      this.props = props;
    }

    render() {
      return <>{"none"}</>;
    }
  }

  class First {
    props: FirstProps;
    constructor(props: FirstProps) {
      this.props = props;
    }

    render() {
      return <>{`${this.props.one}`}</>;
    }
  }

  class Second {
    props: SecondProps;
    constructor(props: SecondProps) {
      this.props = props;
    }

    render() {
      return <>{`${this.props}`}</>;
    }
  }

  test("accepts props of the given type", () => {
    expect(None).type.toAcceptProps({});
    expect(None).type.not.toAcceptProps({}); // fail

    expect(None).type.not.toAcceptProps({ one: "sample" });
    expect(None).type.toAcceptProps({ one: "sample" }); // fail

    expect(First).type.toAcceptProps({});
    expect(First).type.not.toAcceptProps({}); // fail

    expect(First).type.toAcceptProps({ one: "sample" });
    expect(First).type.not.toAcceptProps({ one: "sample" }); // fail

    expect(Second).type.toAcceptProps({ one: "sample" });
    expect(Second).type.not.toAcceptProps({ one: "sample" }); // fail

    expect(Second).type.toAcceptProps({ one: "sample", two: true });
    expect(Second).type.not.toAcceptProps({ one: "sample", two: true }); // fail
  });

  test("property is required in props type", () => {
    expect(Second).type.not.toAcceptProps({});
    expect(Second).type.toAcceptProps({}); // fail

    expect(Second).type.not.toAcceptProps({ two: true });
    expect(Second).type.toAcceptProps({ two: true }); // fail
  });

  test("property does not exist in props type", () => {
    expect(First).type.not.toAcceptProps({ two: false });
    expect(First).type.toAcceptProps({ two: false }); // fail

    expect(First).type.not.toAcceptProps({ one: "sample", two: false });
    expect(First).type.toAcceptProps({ one: "sample", two: false }); // fail

    expect(Second).type.not.toAcceptProps({ three: 123 });
    expect(Second).type.toAcceptProps({ three: 123 }); // fail

    expect(Second).type.not.toAcceptProps({ two: "no", three: 123 });
    expect(Second).type.toAcceptProps({ two: "no", three: 123 }); // fail

    expect(Second).type.not.toAcceptProps({ one: "sample", two: "no", three: 123 });
    expect(Second).type.toAcceptProps({ one: "sample", two: "no", three: 123 }); // fail

    expect(Second).type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect(Second).type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect(First).type.not.toAcceptProps({ one: 1 });
    expect(First).type.toAcceptProps({ one: 1 }); // fail

    expect(Second).type.not.toAcceptProps({ one: 1 });
    expect(Second).type.toAcceptProps({ one: 1 }); // fail

    expect(Second).type.not.toAcceptProps({ one: 1, two: 2 });
    expect(Second).type.toAcceptProps({ one: 1, two: 2 }); // fail
  });
});

describe("when source is a type", () => {
  type None = () => React.JSX.Element;

  type First = ({ one }: FirstProps) => React.JSX.Element;

  type Second = (props: SecondProps) => React.JSX.Element;

  test("accepts props of the given type", () => {
    expect<None>().type.toAcceptProps({});
    expect<None>().type.not.toAcceptProps({}); // fail

    expect<None>().type.not.toAcceptProps({ one: "sample" });
    expect<None>().type.toAcceptProps({ one: "sample" }); // fail

    expect<None>().type.not.toAcceptProps({ one: "sample" });
    expect<None>().type.toAcceptProps({ one: "sample" }); // fail

    expect<First>().type.toAcceptProps({});
    expect<First>().type.not.toAcceptProps({}); // fail

    expect<First>().type.toAcceptProps({ one: "sample" });
    expect<First>().type.not.toAcceptProps({ one: "sample" }); // fail

    expect<Second>().type.toAcceptProps({ one: "sample" });
    expect<Second>().type.not.toAcceptProps({ one: "sample" }); // fail

    expect<Second>().type.toAcceptProps({ one: "sample", two: true });
    expect<Second>().type.not.toAcceptProps({ one: "sample", two: true }); // fail
  });

  test("property is required in props type", () => {
    expect<Second>().type.not.toAcceptProps({});
    expect<Second>().type.toAcceptProps({}); // fail

    expect<Second>().type.not.toAcceptProps({ two: true });
    expect<Second>().type.toAcceptProps({ two: true }); // fail
  });

  test("property does not exist in props type", () => {
    expect<First>().type.not.toAcceptProps({ two: false });
    expect<First>().type.toAcceptProps({ two: false }); // fail

    expect<First>().type.not.toAcceptProps({ one: "sample", two: false });
    expect<First>().type.toAcceptProps({ one: "sample", two: false }); // fail

    expect<Second>().type.not.toAcceptProps({ three: 123 });
    expect<Second>().type.toAcceptProps({ three: 123 }); // fail

    expect<Second>().type.not.toAcceptProps({ two: "no", three: 123 });
    expect<Second>().type.toAcceptProps({ two: "no", three: 123 }); // fail

    expect<Second>().type.not.toAcceptProps({ one: "sample", two: "no", three: 123 });
    expect<Second>().type.toAcceptProps({ one: "sample", two: "no", three: 123 }); // fail

    expect<Second>().type.not.toAcceptProps({ one: "sample", two: true, three: 123 });
    expect<Second>().type.toAcceptProps({ one: "sample", two: true, three: 123 }); // fail
  });

  test("property type is not assignable to prop type", () => {
    expect<First>().type.not.toAcceptProps({ one: 1 });
    expect<First>().type.toAcceptProps({ one: 1 }); // fail

    expect<Second>().type.not.toAcceptProps({ one: 1 });
    expect<Second>().type.toAcceptProps({ one: 1 }); // fail

    expect<Second>().type.not.toAcceptProps({ one: 1, two: 2 });
    expect<Second>().type.toAcceptProps({ one: 1, two: 2 }); // fail
  });
});
