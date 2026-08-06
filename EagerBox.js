import { StyleSheet, Text } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

// An eagerly-imported worklet. Its only job is to make the app realistic: a real
// app always has *some* animation in its always-loaded shell, so the worklets
// runtime and bundle are fully initialised before any lazy screen mounts.
export default function EagerBox() {
  const opacity = useSharedValue(1)
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[styles.box, style]}>
      <Text style={styles.text}>Eager worklet OK</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#d8f5d8', borderRadius: 8, marginBottom: 16, padding: 12 },
  text: { fontSize: 13, textAlign: 'center' },
})
