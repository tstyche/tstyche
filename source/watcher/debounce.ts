export function debounce(delay: number) {
  return function<This, Args extends Array<unknown>, Return>(
    target: (this: This, ...args: Args) => Return,
    _context: unknown,
  ): (this: This, ...args: Args) => Return {
    let timeout: NodeJS.Timeout | undefined;

    return function(this: This, ...args: Args) {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        target.apply(this, args);
      }, delay);
    } as (this: This, ...args: Args) => Return;
  };
}
