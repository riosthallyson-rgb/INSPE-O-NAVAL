import React from 'react';
import { Stack } from 'expo-router';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </AppErrorBoundary>
  );
}
