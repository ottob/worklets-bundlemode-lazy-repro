import { useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

// The ONLY worklet in the app, and it lives in a module reachable solely through
// the `React.lazy(() => import('./AnimatedScreen'))` in App.js.
export default function AnimatedScreen() {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 })
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[styles.box, style]}>
      <Text style={styles.text}>If you can read this, the worklet resolved.</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#cfe8ff', borderRadius: 12, margin: 24, padding: 24 },
  text: { fontSize: 16, textAlign: 'center' },
})
