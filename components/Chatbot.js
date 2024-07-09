// components/Chatbot.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: 'sk-proj-C5HjgwFQl6a262vq0HA4T3BlbkFJgrW4eN7rE4iuBBwMqxFp' });

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
        model: 'gpt-3.5-turbo',
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
          <View key={index} style={styles.message}>
            <Text style={message.role === 'assistant' ? styles.botMessage : message.role === 'system' ? styles.systemMessage : styles.userMessage}>
              {message.content}
            </Text>
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
    message: {
      marginBottom: 10,
    },
    systemMessage: {
      backgroundColor: '#007bff', // Blue background
      color: 'white',
      padding: 10,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    botMessage: {
      backgroundColor: '#007bff', // Blue background
      color: 'white',
      padding: 10,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    userMessage: {
      backgroundColor: '#e0e0e0',
      padding: 10,
      borderRadius: 20,
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

