function doNothing() {
  // does nothing
}

const noopChain: () => void = new Proxy(doNothing, {
  apply() {
    return noopChain;
  },
  get() {
    return noopChain;
  },
});

export { noopChain as describe, noopChain as expect, noopChain as it, noopChain as test };
