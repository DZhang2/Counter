import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, TextInput, Text, ActivityIndicator } from 'react-native';
import { db } from "./firebase/config"

export default function PlayerScreen({navigation}) {
  const [text, setText] = useState("")
  const [searching, setSearching] = useState(false)
  const [myKey, setMyKey] = useState("")

  const addUser = () => {
    db.ref('/queue').get().then((snapshot) => {
      if (!snapshot.exists()) {
        console.log("I'm first, pushing to queue")
        id = db.ref('/queue').push({
          username: text,
        }).key
        setMyKey(id)
      } else {
        console.log("I'm second, creating match...")
        checkQueue(snapshot.val())
      }
    })
    setSearching(true)
  }

  const createGame = (player1, player2, oppID) => {
    console.log("adding match")
    const game_id = db.ref('/games').push({
      p1_name: player1,
      p2_name: player2,
      p1_score: 0,
      p2_score: 0,
      p1_ready: false,
      p2_ready: false
    }, (error) => {
      if (error) {
        console.log("Problem during game creation")
      } else {
        db.ref('/details').push({
          for: oppID,
          p1_name: player1,
          p2_name: player2,
          game_id: game_id
        }, (error) => {
          if (error) {
            console.log("Couldn't get game details")
          } else {
            console.log("navigating (p1)")
            navigation.navigate("Multiplayer", {p1: player1, p2: player2, game_id: game_id, master: 1})
          }
        })
      }
    }).key
  }


  const checkQueue = (queue) => {
    for (id in queue) {
      const p2 = String(queue[id]["username"])
      db.ref('/queue/' + id).remove()
      createGame(text, p2, id)
      break
    }
  }

  // queue listener
  useEffect(() => {
    if (myKey != "") {
      db.ref('/details').on('value', snapshot => {
        console.log("CHECKING")
        if (snapshot.exists()) {
          const snap = snapshot.val()
          for (id in snap) {
            if (snap[id]["for"] == myKey) {
              console.log("navigating (p2)")
              navigation.navigate("Multiplayer", {p1: snap[id]["p1_name"], p2: snap[id]["p2_name"], game_id: snap[id]["game_id"], master: 2})
            }
          }
        }
      })
    }
    return () => {
      db.ref('/queue').off()
      db.ref('/details').off()
    }
  }, [myKey])

return(
  <View style={styles.container}>
      {!searching && <TextInput placeholder="Screen Name" value={text} onChangeText={setText}/>}
        {searching && <Text>{text}</Text>}
        {text.length > 0 && !searching ? <Button title="Search other players" onPress={() => addUser()}/> : null}
        {searching && <ActivityIndicator size="large" />}
    </View>
  )
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
})