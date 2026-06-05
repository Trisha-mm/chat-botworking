import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
  const [isReady, setIsReady] = useState(true);
  
  const getInitalData = async () => {
    const data = await AsyncStorage.getItem("isLoggedIn");
    console.log(data);
    if (data) {
      router.replace("/(tabs)");
    }
    setIsReady(false);
  };
  
  useEffect(() => {
    getInitalData();
  }, []);
  
  if (isReady) return;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.title}>Serenity</Text>

        <View style={styles.buttonContainer}>
          <Link
            href={{ pathname: "/login", params: { mode: "login" } }}
            asChild
          >
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
          </Link>

          <Link
            href={{ pathname: "/login", params: { mode: "signup" } }}
            asChild
          >
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 32,
    fontWeight: "600",
    color: "#F5908E",
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#F5908E",
    marginBottom: 60,
  },
  buttonContainer: {
    width: "100%",
    gap: 18,
  },
  button: {
    backgroundColor: "#F5908E",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
});