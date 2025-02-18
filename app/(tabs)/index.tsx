// index.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Chatbot from '@/components/Chatbot';
import WelcomeScreen from '@/components/WelcomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default function App() {
  const [welcomeVisible, setWelcomeVisible] = useState(true);

  useEffect(() => {
    // Optionally, add logic to determine if the welcome screen should be shown
  }, []);

  const handleCloseWelcome = () => {
    setWelcomeVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <WelcomeScreen visible={welcomeVisible} onClose={handleCloseWelcome} />
      <Chatbot />
    </SafeAreaView>
  );
}

;
