import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

const AnimatedTab = ({ tab, selected, darkMode, onSelect, styles }) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const selection = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(selection, {
      toValue: selected ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [selected, selection]);

  const animatePress = (value) => {
    Animated.spring(pressScale, {
      toValue: value,
      speed: 28,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={styles.bottomTabTouchTarget}
      onPress={() => onSelect(tab.key)}
      onPressIn={() => animatePress(0.94)}
      onPressOut={() => animatePress(1)}
      accessibilityRole="tab"
      accessibilityLabel={`Abrir ${tab.label}`}
      accessibilityState={{ selected }}
    >
      <Animated.View
        style={[
          styles.bottomTabContent,
          selected && styles.bottomTabContentActive,
          darkMode && styles.bottomTabContentDark,
          selected && darkMode && styles.bottomTabContentActiveDark,
          {
            transform: [
              { scale: Animated.multiply(pressScale, selection.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] })) },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bottomTabIndicator,
            {
              opacity: selection,
              transform: [{ scaleX: selection }],
            },
          ]}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.bottomTabLabel,
            darkMode && styles.bottomTabLabelDark,
          selected && styles.bottomTabLabelActive,
          selected && darkMode && styles.bottomTabLabelActiveDark,
        ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export const BottomTabBar = ({ tabs, activeTab, darkMode, onSelect, styles }) => (
  <View
    style={[styles.bottomTabBar, darkMode && styles.bottomTabBarDark]}
    accessibilityRole="tablist"
    accessibilityLabel="Navegação principal"
  >
    {tabs.map((tab) => (
      <AnimatedTab
        key={tab.key}
        tab={tab}
        selected={activeTab === tab.key}
        darkMode={darkMode}
        onSelect={onSelect}
        styles={styles}
      />
    ))}
  </View>
);
