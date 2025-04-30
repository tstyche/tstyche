import "tstyche/react";

interface PluralProps {
  children: string | undefined;
  count: number;
}

function Plural({ children, count }: PluralProps) {
  return <>{count === 1 ? children : `${children}s`}</>;
}

<tst:test name="Plural">
  <tst:expect component={Plural}>
    <tst:toAcceptProps count={10} />
    <tst:toAcceptChildren>Sample</tst:toAcceptChildren>
  </tst:expect>

  <tst:expect component={Plural}>
    <tst:not>
      <tst:toAcceptProps />
    </tst:not>
    Sample
  </tst:expect>

  <tst:expect component={Plural}>
    <tst:toAcceptProps count={10} />
    <tst:not>
      <tst:toAcceptChildren>{123}</tst:toAcceptChildren>
    </tst:not>
  </tst:expect>

  <tst:expect component={Plural}>
    <tst:toAcceptProps count={10} />
    <tst:not>
      <tst:toAcceptChildren>
        {"Sample"}
        {"Sample"}
      </tst:toAcceptChildren>
    </tst:not>
  </tst:expect>
</tst:test>;
