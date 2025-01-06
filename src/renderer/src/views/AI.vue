<template lang="pug">
.ai__wrapper
  input 
  #start
    button 開始錄音
</template>

<script setup>
import { onMounted } from 'vue'

// const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
// recognition.lang = 'zh-TW' // 設定語言，例如繁體中文
// recognition.interimResults = false // 是否返回中間結果
// recognition.continuous = false // 是否持續監聽

// recognition.onresult = (event) => {
//   const transcript = event.results[0][0].transcript
//   console.log('語音輸入結果：', transcript)
//   document.getElementById('output').innerText = transcript // 輸出到頁面
// }

// recognition.onerror = (event) => {
//   console.error('語音識別錯誤：', event.error)
// }
onMounted(() => {
  // recognition.start() // 開始監聽
  document.getElementById('start').addEventListener('click', () => {
    recognition.start() // 開始監聽
  })
})
</script>

<style lang="sass" scoped>
.ai
  &__wrapper
    width: 100%
    height: 100vh
    background: url('/images/ai-bg.png') no-repeat center center
    display: flex
    flex-direction: column
    align-items: center
    position: relative
  &__title--container
    width: 332px
    height: 96px
    margin: 120px 0 294px 0
    img
      width: 100%
      height: 100%
      object-fit: cover

  &__record--container
    width: 700px
    height: 700px
    position: relative
    img
      width: 100%
      height: 100%
      object-fit: cover
  &__player--container
    background: #1C1B20
    position: absolute
    top: 60vh
    left: 50%
    transform: translate(-50%, -50%)
  &__player--content
    position: relative
  &__quote
    position: absolute
    left: 1.5rem
    top: 4vh
    max-width: 80%
    width: 80%
    word-wrap: break-word
    h3
      text-overflow: ellipsis
      font-size: 2.5rem
      font-style: normal
      font-weight: 700
      line-height: 180%
      letter-spacing: 0.025rem
      color: #FFFFFF
  &__hint
    color: #FFFFFF
    margin: 12rem 0 3rem 0
    display: flex
    flex-direction: column
    align-items: center
    h1
      color: #FFF
      text-align: center
      font-size: 3rem
      font-style: normal
      font-weight: 700
      line-height: 180%
      letter-spacing: 0.03rem
    p
      color: #FFF
      font-size: 1.5rem
      font-style: normal
      font-weight: 400
      line-height: 150%
      letter-spacing: 0.135rem
canvas
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 1
  border-radius: 1.6rem
@keyframes rotate
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)
</style>
