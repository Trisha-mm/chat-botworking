// CopingSkillsToolbox.tsx

import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

// Coping strategies data
const copingStrategies = [
  { id: '1', title: 'Deep Breathing', description: 'Take deep breaths for 5 minutes to calm your mind.' },
  { id: '2', title: 'Grounding Exercise', description: 'Focus on your surroundings: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.' },
  { id: '3', title: 'Positive Affirmation', description: 'Say to yourself: “I am capable, I am strong, I am enough.”' },
  { id: '4', title: 'Progressive Muscle Relaxation', description: 'Tense and then relax each muscle group, starting from your toes to your head.' },
  { id: '5', title: 'Mindfulness Meditation', description: 'Spend 10 minutes focusing on your breath and observing your thoughts without judgment.' },
  { id: '6', title: 'Nature Walk', description: 'Take a walk outside to connect with nature and clear your mind.' },
  { id: '7', title: 'Journaling', description: 'Write down your thoughts and feelings to process them more effectively.' },
  { id: '8', title: 'Visualization', description: 'Imagine a peaceful scene, such as a beach or forest, to help relax your mind.' },
  { id: '9', title: 'Art Therapy', description: 'Create art, whether through drawing, painting, or crafting, to express your emotions.' },
  { id: '10', title: 'Listening to Music', description: 'Listen to your favorite songs to uplift your mood and reduce stress.' },
];

export default function CopingSkillsToolbox() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.linkContainer}
      onPress={() => {
        setSelectedStrategy(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.linkText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Coping Skills Toolbox</Text>
      <FlatList
        data={copingStrategies}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          {selectedStrategy && (
            <>
              <Text style={styles.modalTitle}>{selectedStrategy.title}</Text>
              <ScrollView style={styles.modalDescriptionContainer}>
                <Text style={styles.modalDescription}>{selectedStrategy.description}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Set background color to white
    padding: 20,
    marginTop: 50, // Move the content further down
  },
  headerText: {
    fontSize: 24,
    color: '#F5908E', // Dark pink color for text
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F5908E',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  linkText: {
    fontSize: 18,
    color: '#fff', // White color for text
    textDecorationLine: 'underline',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 0,
    margin: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#ffffff', // Modal title color
  },
  modalDescriptionContainer: {
    maxHeight: 200,
    marginBottom: 20,
    padding: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#ffffff', // Modal description color
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#F5908E', // Button background color
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#ffffff', // Button text color
    fontWeight: 'bold',
  },
});


