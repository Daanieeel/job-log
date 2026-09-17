const plugin = require("tailwindcss");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["inline-import", { extensions: [".sql"] }],
      // WICHTIGER HINWEIS FUER SPAETER:
      // Dieses Plugin (react-native-reanimated/plugin) wird zwingend fuer das
      // AnimatedSplashOverlay (bzw. Worklets) benoetigt.
      // TODO: Sobald wir die Standard-Animationen nicht mehr brauchen,
      // entfernen wir das Plugin und die Pakete, um die App minimalistisch zu halten!
      "react-native-reanimated/plugin",
    ],
  };
};
