import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { palette, radius } from '../theme';

type Props = {
  progress: number; // 0 - 1
};

export function ProgressBar({ progress }: Props) {
  const animated = useMemo(() => new Animated.Value(progress), []);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [animated, progress]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: animated.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: palette.secondary,
  },
});
