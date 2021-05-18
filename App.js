import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './src/Main'
import Home from './src/Home'
import Multiplayer from './src/Multiplayer'
import PlayerScreen from './src/PlayerScreen'

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{ title: '' }} />
        <Stack.Screen name="Main" component={Main} options={{ title: '' }}/>
        <Stack.Screen name="Multiplayer" component={Multiplayer} options={{ title: '' }}/>
        <Stack.Screen name="PlayerScreen" component={PlayerScreen} options={{ title: '' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}