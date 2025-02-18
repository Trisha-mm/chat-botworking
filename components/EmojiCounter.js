// components/EmojiCounter.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmojiCounter = ({ moods }) => {
  const moodCounts = Object.values(moods).reduce((counts, mood) => {
    counts[mood] = (counts[mood] || 0) + 1;
    return counts;
  }, {});

  return (
    <View style={styles.container}>
      {Object.keys(moodCounts).map((mood) => (
        <View key={mood} style={styles.moodRow}>
          <Text style={styles.moodText}>{mood}</Text>
          <Text style={styles.countText}>{moodCounts[mood]}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  moodText: {
    fontSize: 18,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmojiCounter;
