# TODO

## `.toAcceptProps()`

Allow passing: `{ style }`, becomes `<Component style={style} />`

## `.toBeInstantiatable()`

Allow passing named tuples. Why not?

## `.toBeAssignableTo()`

Show detailed error be rewriting:

```ts
expect<AnimatedStyle<AugmentedImageStyle>>().type.toBeAssignableFrom({
  resizeMode: 'cover',
  animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
  animationTimingFunction: cubicBezier(0.25, 0.1, 0.25, 1),
});
```

to:

```ts
{ let x: AnimatedStyle<AugmentedImageStyle>; const y = {
  resizeMode: 'cover',
  animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
  animationTimingFunction: cubicBezier(0.25, 0.1, 0.25, 1),
}; x = y; }
```
