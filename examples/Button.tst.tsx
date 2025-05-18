import "tstyche/react";

interface ButtonProps {
  text: string;
  type?: "reset" | "submit";
}

function Button({ text, type }: ButtonProps) {
  return <button type={type}>{text}</button>;
}

<tst:test name="Button">
  <tst:expect component={Button}>
    <tst:toAcceptProps text="Send" />
  </tst:expect>

  <tst:expect component={Button}>
    <tst:toAcceptProps text="Clear" type={"reset" as const} />
  </tst:expect>

  <tst:expect component={Button}>
    <tst:not>
      <tst:toAcceptProps text="Download" type={"button" as const} />
    </tst:not>
  </tst:expect>

  <tst:expect component={Button}>
    <tst:not>
      <tst:toAcceptProps />
    </tst:not>
  </tst:expect>

  <tst:expect component={Button}>
    <tst:not>
      <tst:toAcceptChildren>Nope</tst:toAcceptChildren>
    </tst:not>
  </tst:expect>
</tst:test>;
