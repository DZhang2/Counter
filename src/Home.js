import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function Home({navigation}) {
  return(
    <View style={styles.container}>
      <Text style={styles.text}>Counter</Text>
      <Button title="Singleplayer" onPress={() => navigation.navigate("Main")}/>
      <Button title="Multiplayer" onPress={() => navigation.navigate("PlayerScreen")}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
    paddingTop: 50,
    paddingLeft: 50,
    paddingRight: 50,
  },
  text: {
    fontSize: 40,
    textAlign: "center",
    margin: 10
  }
})