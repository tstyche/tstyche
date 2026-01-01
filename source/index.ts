function noop() {
  // does nothing
}

const noopChain: () => void = new Proxy(noop, {
  apply() {
    return noopChain;
  },
  get() {
    return noopChain;
  },
});

export {
  noopChain as describe,
  noopChain as expect,
  noopChain as it,
  noop as omit,
  noop as pick,
  noopChain as test,
  noopChain as when,
};
