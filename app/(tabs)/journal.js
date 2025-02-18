import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUOTES = [
  "The best time for new beginnings is now.",
  "Every day is a fresh start.",
  "You are capable of amazing things.",
  "Believe in yourself and all that you are.",
  "Dream it. Wish it. Do it."
];

export default function Journal() {
  const [selectedDate, setSelectedDate] = useState('');
  const [journalEntries, setJournalEntries] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    // Load journal entries from AsyncStorage when the component mounts
    const loadJournalEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem('journalEntries');
        if (storedEntries) {
          setJournalEntries(JSON.parse(storedEntries));
        }
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      }
    };

    loadJournalEntries();

    // Set a random quote when the component mounts
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setCurrentQuote(QUOTES[randomIndex]);
  }, []);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setCurrentEntry(journalEntries[day.dateString] || '');
    setModalVisible(true);
  };

  const saveEntry = async () => {
    const updatedEntries = { ...journalEntries, [selectedDate]: currentEntry };
    setJournalEntries(updatedEntries);

    try {
      // Save the updated journal entries to AsyncStorage
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }

    setModalVisible(false);
  };

  const deleteEntry = async () => {
    const updatedEntries = { ...journalEntries };
    delete updatedEntries[selectedDate];
    setJournalEntries(updatedEntries);

    try {
      // Remove the journal entry from AsyncStorage
      await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }

    setCurrentEntry('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Journal</Text>
        <Text style={styles.subHeaderText}>Select a date to add or view your entries</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              ...Object.keys(journalEntries).reduce((acc, date) => {
                acc[date] = { marked: true, dotColor: '#F5908E' };
                return acc;
              }, {}),
            }}
            theme={{
              selectedDayBackgroundColor: '#F5908E',
              todayTextColor: '#F5908E',
              arrowColor: '#F5908E',
              dotColor: '#F5908E',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
            }}
          />
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Entries Made: {Object.keys(journalEntries).length}</Text>
        </View>
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{currentQuote}</Text>
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Journal Entry for {selectedDate}</Text>
            <TextInput
              style={styles.input}
              value={currentEntry}
              onChangeText={setCurrentEntry}
              placeholder="Write your thoughts..."
              multiline
            />
            <View style={styles.buttonContainer}>
              <Button title="Save" onPress={saveEntry} color="#8BC34A" />
              <Button title="Delete" onPress={deleteEntry} color="#F44336" />
              <Button title="Close" onPress={() => setModalVisible(false)} color="#999" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5908E',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  calendarContainer: {
    marginTop: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#333',
  },
  quoteContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '60%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5908E',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
