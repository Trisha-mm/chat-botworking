// chabot.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import OpenAI from 'openai';
import { Avatar } from 'react-native-elements';

// Import the API key from your .env file using react-native-dotenv
import { OPENAI_API_KEY } from '@env';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: 'Hi, I am your virtual therapist, How are you feeling today?'
    }
  ]);
  const [input, setInput] = useState('');

  const handleInputChange = (text) => {
    setInput(text);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);

    console.log('User message:', input);
    console.log('Messages array:', newMessages);

    try {
      const completion = await openai.chat.completions.create({
        messages: newMessages,
        model: 'gpt-4o-mini',
      });

      console.log('Received completion from OpenAI:', completion);

      const botResponse = completion.choices[0].message.content;

      const updatedMessages = [...newMessages, { role: 'assistant', content: botResponse }];
      setMessages(updatedMessages);

      console.log('Bot response:', botResponse);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.chatbot}>
      <ScrollView style={styles.messages}>
        {messages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            {message.role !== 'user' && (
              <Avatar
                rounded
                size="medium"
                containerStyle={styles.avatar}
                source={{ uri: 'https://via.placeholder.com/150/FFB6C1/FFFFFF?text=B' }}
              />
            )}
            <View style={[
              styles.message, 
              message.role === 'user' && styles.userMessageBubble
            ]}>
              <Text
                style={
                  message.role === 'assistant'
                    ? styles.botMessage
                    : message.role === 'system'
                    ? styles.systemMessage
                    : styles.userMessage
                }
              >
                {message.content}
              </Text>
            </View>
            {message.role === 'user' && (
              <Avatar
                rounded
                size="medium"
                containerStyle={styles.userAvatar}
                source={{ uri: 'https://via.placeholder.com/150/ADD8E6/FFFFFF?text=U' }}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={handleInputChange}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  chatbot: {
    flex: 1,
    padding: 10,
  },
  messages: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  avatar: {
    marginRight: 10,
  },
  userAvatar: {
    marginLeft: 10,
  },
  message: {
    flex: 1,
  },
  userMessageBubble: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  systemMessage: {
    backgroundColor: '#F5908E',
    color: 'white',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  botMessage: {
    backgroundColor: '#F5908E',
    color: 'white',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#FAC8C7',
    color: 'black',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'flex-end',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});

export default Chatbot;
