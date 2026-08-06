module.exports = function (api) {
  api.cache(true)

  return {
    // babel-preset-expo auto-injects react-native-worklets/plugin without options and
    // does not dedupe a manual copy, so its worklets/reanimated injection is disabled
    // and the plugin is added explicitly (last) with bundleMode enabled.
    // https://docs.swmansion.com/react-native-worklets/docs/bundleMode/setup
    presets: [['babel-preset-expo', { worklets: false, reanimated: false }]],
    plugins: [['react-native-worklets/plugin', { bundleMode: true }]],
  }
}
