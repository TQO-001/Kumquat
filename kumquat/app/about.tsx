import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View style={ styles.container }>
      <Text style={styles.text} >About Screen</Text>
      <Link style={styles.button} href={"/"}>Home Page</Link>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    backgroundColor: "#333"
  },
  text: {
    fontSize: 28,
    color: "#fff",
  },
  button: {
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 16,
    textAlign: "center",
    marginTop: 20,
  }
})
