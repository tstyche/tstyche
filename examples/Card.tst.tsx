import type { ReactNode } from "react";
import { expect, test } from "tstyche";

interface CardProps {
  title: string;
  children: ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <>
      <h2>{title}</h2>
      {children}
    </>
  );
}

test("accepts props?", () => {
  expect(Card).type.toAcceptProps({ title: "Hello", children: "Click me" });
  expect(Card).type.toAcceptProps({ title: "Hello", children: <span>Click me</span> });

  expect(Card).type.not.toAcceptProps({ title: "Hello" });
  expect(Card).type.not.toAcceptProps({});
});
