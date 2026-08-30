import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="technician-signup" />
      <Stack.Screen name="users" />
      <Stack.Screen name="recharges" />
    </Stack>
  );
}
