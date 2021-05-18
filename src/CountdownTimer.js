import React from 'react'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'

export default function CountdownTimer(props) {
  return (
    <CountdownCircleTimer
      key={props.isPlaying}
      duration={props.duration}
      colors={[
        ['#1E90FF', 0.33],
        ['#90EE90', 0.33],
      ]}
      isPlaying={props.isPlaying}
      isLinearGradient
      size={25}
      strokeWidth={6}
      onComplete={() => {
        return [true, 0]
      }}
    />
  )
}