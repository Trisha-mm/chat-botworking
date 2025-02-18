import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>
        Need Professional Help? You're not alone, Reach Out to These Organizations:
      </Text>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.samhsa.gov/find-help/national-helpline')}
        >
          SAMHSA National Helpline
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.mentalhealth.gov/get-help/immediate-help')}
        >
          MentalHealth.gov Immediate Help
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.crisistextline.org/')}
        >
          Crisis Text Line
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.thehotline.org/')}
        >
          National Domestic Violence Hotline
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://suicidepreventionlifeline.org/')}
        >
          National Suicide Prevention Lifeline
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.trevorproject.org/')}
        >
          The Trevor Project
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.childhelp.org/')}
        >
          ChildHelp National Child Abuse Hotline
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.rainn.org/')}
        >
          RAINN (Rape, Abuse & Incest National Network)
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.veteranscrisisline.net/')}
        >
          Veterans Crisis Line
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.mhanational.org/')}
        >
          Mental Health America
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.afsp.org/')}
        >
          American Foundation for Suicide Prevention
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.anad.org/')}
        >
          National Association of Anorexia Nervosa and Associated Disorders (ANAD)
        </Text>
      </View>
      <View style={styles.linkContainer}>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL('https://www.nami.org/')}
        >
          National Alliance on Mental Illness (NAMI)
        </Text>
      </View>
    </ScrollView>
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
});
