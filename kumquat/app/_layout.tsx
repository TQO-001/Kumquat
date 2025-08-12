import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{headerTitle: titles.home}}/>
      <Stack.Screen 
        name="about"
        options={{headerTitle: titles.about}}/>
    </Stack>
  );
}

const titles = {
  home: "KumQuat",
  about: "About",
}
