// this allows us to import png and svg images
// into .tsx files.
declare module '*.png' {
  const pngValue: any;
  export default pngValue;
}

declare module '*.gif' {
  const gifValue: any;
  export default gifValue;
}

declare module '*.svg' {
  const content: any;
  export default content;
}
