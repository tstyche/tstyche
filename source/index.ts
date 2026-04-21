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

export { noop as omit, noop as pick, noopChain as describe, noopChain as expect, noopChain as it, noopChain as test };
