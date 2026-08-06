import { lazy, Suspense, useState } from 'react'
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import EagerBox from './EagerBox'

// Swap these two lines to see the difference.
//
//   lazy   -> AnimatedScreen lands in an async chunk, its worklet is missing from
//             the worklets bundle, and pressing the button aborts the process.
//   static -> the worklet is in the main bundle and everything works.
//
const AnimatedScreen = lazy(() => import('./AnimatedScreen'))
// import AnimatedScreen from './AnimatedScreen'

export default function App() {
  const [show, setShow] = useState(false)

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Worklets Bundle Mode + React.lazy</Text>
      <EagerBox />
      <Text style={styles.body}>
        Press the button to mount a lazily-imported screen whose only worklet is a
        `useAnimatedStyle`. Expected: it fades in. Actual: the app dies with SIGABRT.
      </Text>
      <Button title="Mount lazy animated screen" onPress={() => setShow(true)} />
      <View style={styles.slot}>
        {show && (
          <Suspense fallback={<Text style={styles.body}>Loading…</Text>}>
            <AnimatedScreen />
          </Suspense>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 16, textAlign: 'center' },
  slot: { minHeight: 140 },
})
