import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import EmojiCounter from '@/components/EmojiCounter';
import AsyncStorage from '@react-native-async-storage/async-storage';

const moods = ['😀', '😐', '😞', '😡', '😢', '😊'];

export default function MoodTrackerScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Store selected date
  const [savedMoods, setSavedMoods] = useState({});

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const storedMoods = await AsyncStorage.getItem('moods');
      if (storedMoods) {
        setSavedMoods(JSON.parse(storedMoods));
      }
    } catch (error) {
      console.error('Failed to load moods', error);
    }
  };

  const saveMood = async (day, mood) => {
    try {
      const updatedMoods = { ...savedMoods, [day]: mood };
      setSavedMoods(updatedMoods);
      await AsyncStorage.setItem('moods', JSON.stringify(updatedMoods));
    } catch (error) {
      console.error('Failed to save mood', error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString); // Set selected date
    setSelectedMood(savedMoods[day.dateString] || null); // Set the mood if already saved
    setModalVisible(true);
  };

  const handleMoodSelect = (mood) => {
    saveMood(selectedDate, mood); // Save mood for the selected date
    setSelectedMood(mood);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mood Tracker</Text>
        <Text style={styles.subHeaderText}>Track your moods daily</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={Object.keys(savedMoods).reduce((acc, date) => {
              acc[date] = { marked: true, dotColor: '#F5908E' }; // Highlight marked dates
              return acc;
            }, {})}
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: '#F5908E',
              arrowColor: '#F5908E',
            }}
          />
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Your Stats</Text>
          <EmojiCounter moods={savedMoods} />
        </View>
        <View style={styles.savedDataContainer}>
          <Text style={styles.savedDataHeader}>Saved Data</Text>
          {Object.keys(savedMoods).map((date) => (
            <Text key={date} style={styles.savedDataText}>
              {date}: {savedMoods[date]}
            </Text>
          ))}
        </View>
      </ScrollView>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling today?</Text>
            <View style={styles.moodSelectionContainer}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && styles.selectedMoodButton,
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedMood && (
              <Text style={styles.selectedMoodText}>
                Selected Mood: {selectedMood}
              </Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0, // Add padding to move everything down
    padding: 10,
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 20,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5908E',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5908E',
    marginBottom: 20,
  },
  moodSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodButton: {
    padding: 10,
    margin: 5,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  selectedMoodButton: {
    backgroundColor: '#F5908E',
  },
  moodEmoji: {
    fontSize: 24,
  },
  selectedMoodText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#F5908E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedDataContainer: {
    marginTop: 20,
  },
  savedDataHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F5908E',
  },
  savedDataText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
});

