# CLI-LOADER

A simple loading bar for the Node based CLIs.

## Refactor (v0.0.2)

I want to make support a % based system as well.

I also want to use change the gradient to a simplier function

```js
const gradient = [color1, color2, color3, color4, ...etc];
const loadingBar = [
  0, // Gradient Base
  0,
  1,
  2,
  3, // Gradient Tail
  4, // Gradient Head
  ...etc,
];
```

This will allow for a more customizable loading bar & will allow for a more customizable gradient, while being simpler to implement.

Also easier to implement a % based system.

## TODO: (v0.0.1)

- [ ] Turn into a module
  - [x] Add options
  - [ ] Add progress bar
- [ ] Add tests
- [ ] Add documentation
- [ ] Add Gif
