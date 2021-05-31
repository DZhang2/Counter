import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, TouchableOpacity, Dimensions } from 'react-native';
import CountdownTimer from './CountdownTimer'
import { db } from './firebase/config'

export default function Multiplayer({route}) {
  const PLAY_TIME = 30
  const [isPlaying, setIsPlaying] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [value, setValue] = useState(0)
  const [cacheValue, setCacheValue] = useState(0)
  const [ticking, setTicking] = useState(0)
  const [timer, setTimer] = useState(PLAY_TIME)
  const [incrementor, setIncrementor] = useState(1)
  const [opponentScore, setOpponentScore] = useState(0)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)

  const restart = () => {
    setTimer(PLAY_TIME)
    setIncrementor(1)
    setValue(0)
    setIsPlaying(false)
  }

  //set total time
  useEffect(() => {
    let interval = setTimeout(() => {
      if (isPlaying) {
        setTimer(timer => timer - 1)
        setTicking(ticking => ticking + 1)
      }
    }, 1000)
    if (timer === 0) {
      clearInterval(interval)
      if (value > opponentScore) {
        Alert.alert("You won!", `Your Score: ${value}, Opponent's Score: ${opponentScore}`)
        setWins(wins => wins + 1)
      } else if (value < opponentScore) {
        Alert.alert("You lost :(", `Your Score: ${value}, Opponent's Score: ${opponentScore}`)
        setLosses(losses => losses + 1)
      } else {
        Alert.alert("You tied")
      }
      restart()
    }
    return () => clearTimeout(interval)
  }, [ticking, isPlaying])

  //update player score
  useEffect(() => {
    if (Math.abs(value - cacheValue) > 0) {
      console.log("updating", route.params.master)
      const route_str = route.params.master == 1 ? "/p1_score" : "/p2_score"
      let update = {}
      update["/games/" + route.params.game_id + route_str] = value
      setCacheValue(value)
      db.ref().update(update)
    }
  }, [ticking])

  //listen for opponent score
  useEffect(() => {
    console.log("adding listener")
    const route_str = route.params.master == 1 ? "/p2_score" : "/p1_score"
    const gameRef = db.ref('/games/' + route.params.game_id + route_str)
    gameRef.on('value', (snapshot) => {
      console.log("listening", route.params.master)
      const data = snapshot.val()
      setOpponentScore(data)
    })
    return () => {
      gameRef.off()
    }
  }, [])

  const upgrade = () => {
    if (value < 100) {
      Alert.alert("Can't afford upgrade", "Need 100 points")
    } else {
      setValue(value => value - 100)
      setIncrementor(incrementor => incrementor + 1)
    }
  }

  const handleStart = () => {
    if (isPlaying) {
      setValue(value => value + incrementor)
    } else {
      const opp_route_str = route.params.master == 1 ? "/p2_ready" : "/p1_ready"
      db.ref('/games/' + route.params.game_id + opp_route_str).on('value', snapshot => {
        console.log("handle start listener")
        if (!isWaiting) {
          const route_str = route.params.master == 1 ? "/p1_ready" : "/p2_ready"
          let update = {}
          update['/games/' + route.params.game_id + route_str] = true
          db.ref().update(update)
          console.log(route.params.master, "ready")
          setIsWaiting(true)
        } 
        if (snapshot.val()) {
          console.log(route.params.master, "playing")
          setIsPlaying(true)
          setIsWaiting(false)
          db.ref('/games/' + route.params.game_id + opp_route_str).off()
          //master sets isReady to false for both players
          if (route.params.master == 1) {
            let updates = {}
            updates['/games/' + route.params.game_id + '/p1_ready'] = false
            updates['/games/' + route.params.game_id + '/p2_ready'] = false
            db.ref().update(updates)
          }
        }
      })
    }  
  }

  return (
    <View style={styles.container}>
      <Text>{route.params.master == 1 ? route.params.p1 : route.params.p2} vs. {route.params.master == 1 ? route.params.p2 : route.params.p1}</Text>
      <Text style={styles.largeText}>Multiplayer</Text>
      <Text style={styles.text}>Opponent Score: {opponentScore}</Text>
      <Text style={styles.text}>Time Left: {timer}</Text>
      <CountdownTimer isPlaying={isPlaying} duration={PLAY_TIME}/>
      <TouchableOpacity style = {styles.button} onPress={() => handleStart()}>
        <Text style={styles.largeText}>{(isPlaying) ? value : "Start"}</Text>
        <Text style={styles.text}>{isWaiting ? "...waiting for opponent" :  ""}</Text>
      </TouchableOpacity>
      <Button title="Upgrade (100)" onPress={() => upgrade()}/>
      <Text style={styles.text}>Incrementor: {incrementor}</Text>
      <Text style={styles.text}>Wins: {wins}, Losses: {losses}</Text>
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
  buttonContainer: {
    flex: 1,
    justifyContent: "center"
  },
  largeText: {
    fontSize: 40,
    textAlign: "center",
    paddingBottom: 20
  },
  text: {
    margin: 10,
    textAlign: "center",
    fontSize: 17
  },
  button: {
    justifyContent: "center",
    borderRadius: Dimensions.get('window').width * 0.7 / 2,
    height: Dimensions.get('window').width * 0.7,
    width: Dimensions.get('window').width * 0.7,
    margin: 10,
    backgroundColor: "#add8e6"
  }
})