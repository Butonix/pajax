SystemJS.config({
  transpiler: "plugin-babel",
  packages: {
    "pajax": {
      "format": "esm",
      "main": "pajax.js"
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.8"
  },
  packages: {}
});
