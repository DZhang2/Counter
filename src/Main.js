import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Switch, TouchableOpacity, Dimensions } from 'react-native';
import CountdownTimer from './CountdownTimer'

export default function Main() {
  const PLAY_TIME = 60
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [value, setValue] = useState(0)
  const [ticking, setTicking] = useState(0)
  const [timer, setTimer] = useState(PLAY_TIME)

  //classic only
  const [incrementor, setIncrementor] = useState(1)
  const [auto, setAuto] = useState(0)
  const [autoTicker, setAutoTicker] = useState(0)
  const [gamble, setGamble] = useState(0)
  const [lottery, setLottery] = useState(100)
  const [gambleTicker, setGambleTicker] = useState(0)
  const [classicHighScore, setClassicHighScore] = useState(0)

  //reflex only
  const [randTicker, setRandTicker] = useState(0) 
  const [randomTime, setRandomTime] = useState(0)
  const [pointsAwarded, setPointsAwarded] = useState(0)
  const [reflexHighScore, setReflexHighScore] = useState(0)
  const [clicked, setClicked] = useState(false)

  const restart = () => {
    setTimer(PLAY_TIME)
    if (isEnabled) {
      setReflexHighScore(value > reflexHighScore ? value : reflexHighScore)
      setRandomTime(0)
      setRandTicker(100)
      setPointsAwarded(0)
    } else {
      setClassicHighScore(value > classicHighScore ? value : classicHighScore)
      setIncrementor(1)
      setAuto(0)
      setGamble(0)
      setLottery(100)
    }
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
      Alert.alert("Game Over!", `Final Score: ${value}`)
      restart()
    }
    return () => clearTimeout(interval)
  }, [ticking, isPlaying])

  //set random time
  useEffect(() => {
    let interval = setInterval(() => {
      if (isPlaying && isEnabled) {
        setRandTicker(randTicker => randTicker + 1)
      }
    }, 100)
    if (clicked && isEnabled) {
      clearInterval(interval)
      let points = Math.max((10 - Math.abs(randomTime - randTicker)), 0) * 10
      if (randomTime - randTicker <= 2) {
        points *= 2
      }
      setPointsAwarded(points)
      setValue(value + points)
      setRandTicker(0)
      setClicked(false)
      setRandomTime(Math.ceil(Math.random() * 12) + 3)
    }
    return () => clearTimeout(interval)
  }, [isPlaying, clicked, randTicker])

  //set autoclicker
  useEffect(() => {
    let interval = setInterval(() => {
      if (isPlaying && !isEnabled && auto > 0) {
        setValue(value => value + auto)
        setAutoTicker(autoTicker => autoTicker + 1)
      }
    }, 200)
    return () => clearTimeout(interval)
  }, [isPlaying, autoTicker, auto])

  //set gamble
  useEffect(() => {
    let interval = setInterval(() => {
      if (isPlaying && !isEnabled && gamble > 0) {
        const ticket = Math.random()
        if (ticket * 1000 <= gamble) {
          setValue(value => value + lottery)
        }
        setGambleTicker(gambleTicker => gambleTicker + 1)
      }
    }, 1000)
    return () => clearTimeout(interval)
  }, [isPlaying, gambleTicker, gamble])

  const upgrade = () => {
    if (value < 100) {
      Alert.alert("Can't afford upgrade", "Need 100 points")
    } else {
      setValue(value => value - 100)
      setIncrementor(incrementor => incrementor + 1)
    }
  }

  const autoClicker = () => {
    if (value < 50) {
      Alert.alert("Can't afford upgrade", "Need 50 points")
    } else {
      setValue(value => value - 50)
      setAuto(auto => auto + 1)
    }
  }

  const gambler = () => {
    if (value < 10) {
      Alert.alert("Can't affort upgrade", "Need 10 points")
    } else {
      setValue(value => value - 10)
      if (gamble < 250) {
        setGamble(gamble => gamble + 5)
        setLottery(lottery => lottery + 2)
      } else {
        setLottery(lottery => lottery + 5)
      }
    }
  }
  
  const toggleModes = () => {
    restart()
    setIsEnabled(previousState => !previousState)
  }

  return (
    <View style={styles.container}>
      <Switch style={{marginBottom: 20}}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleModes}
        value={isEnabled}
      />
      <Text style={styles.largeText}>{isEnabled ? "Reflex" : "Classic"}</Text>
      {!isEnabled && <Text style={styles.text}>Time Left: {timer}</Text>}
      <CountdownTimer isPlaying={isPlaying} duration={PLAY_TIME}/>
      {isEnabled && <Text style={styles.text}>Random Time: {(randomTime * 0.1).toFixed(1)}</Text>}
      {isEnabled && <Text style={styles.text}>+{pointsAwarded}</Text>}
      <TouchableOpacity style = {styles.button} onPress={() => {
        if (!isEnabled) {
          setValue(value => value + incrementor)
        }
        setClicked(true)
        if (!isPlaying) {
          setIsPlaying(true)
        }
      }}>
        <Text style={styles.largeText}>{(isPlaying) ? value : "Start"}</Text>
      </TouchableOpacity>
      {!isEnabled &&
      <View>
        <View style={{margin: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button title="U (100)" onPress={() => upgrade()}/>
          <Button title="A (50)" onPress={() => autoClicker()}/>
          <Button title="G (10)" onPress={() => gambler()}/>
        </View>
        <Text style={styles.text}>Incrementor: {incrementor}, Auto: {auto}</Text>
        <Text style={styles.text}>Lottery: {lottery}, Chances: {(gamble/1000).toFixed(3)}</Text>
      </View>
      }
      <Text style={styles.text}>Best: {isEnabled ? reflexHighScore : classicHighScore}</Text>
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