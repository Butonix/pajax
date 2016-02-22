SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  transpiler: "plugin-babel",
  map: {
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.5"
  }
});
