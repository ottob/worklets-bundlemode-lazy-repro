const { getDefaultConfig } = require('expo/metro-config')
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode')

// https://docs.swmansion.com/react-native-worklets/docs/bundleMode/setup
module.exports = getBundleModeMetroConfig(getDefaultConfig(__dirname))
