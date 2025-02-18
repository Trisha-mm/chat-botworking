// components/WelcomeScreen.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.welcomeText}>Hello!</Text>
          <Text style={styles.descriptionText}>
            This app is designed to support your mental health journey!
            Whether you're seeking someone to talk to, a space to reflect, or a tool to help manage your wellbeing,
            we are here for you. Please note that your data is not saved anywhere but your device. If you require urgent assistance, please contact help services (some can be found on the outreach page). 
            Please keep in mind, this app is a companion, not a substitute for professional help :)
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F5908E',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
