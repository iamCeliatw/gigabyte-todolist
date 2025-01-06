<!-- src/components/VirtualKeyboard.vue -->
<template lang="pug">
.keyboard__wrapper
    //- input.keyboard(
    //- v-model="localInputText"
    //- placeholder="Search"
    //- )
    .simple-keyboard
    p#composition
    ol#candidates
    //- button(@click="purifyInputHandler") excute
    //- div(v-html="purifyInput")
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import DOMPurify from 'dompurify'

const props = defineProps({
  computerInput: {
    type: String,
    required: true
  }
})
const localInputText = ref(props.computerInput)
const purifyInput = ref('')
const purifyInputHandler = () => {
  purifyInput.value = localInputText.value
  purifyInput.value = DOMPurify.sanitize(localInputText.value)
}
const emit = defineEmits(['update:computerInput', 'searchItemHandler', 'showKeyboard'])
watch(localInputText, (newVal) => {
  console.log('newVal:', newVal)
  emit('update:computerInput', newVal)
})

onMounted(() => {
  let keyboard = new Keyboard({
    onKeyPress: (button) => onKeyPress(button),
    newLineOnEnter: true
  })

  keyboard.setOptions({
    layout: {
      default: [
        '` 1 2 3 4 5 6 7 8 9 0 - =',
        'q w e r t y u i o p {bksp} {close}',
        '{lock} a s d f g h j k l :',
        '{lang} z x c v b n m , . / @',
        '{space}'
      ],
      caps: [
        '` 1 2 3 4 5 6 7 8 9 0 - =',
        'Q W E R T Y U I O P {bksp} {close}',
        '{lock} A S D F G H J K L :',
        '{lang} Z X C V B N M < > ? @',
        '{space}'
      ],
      chinese: [
        'ㄅ ㄉ ˇ ˋ ㄓ ˊ ˙ ㄚ ㄞ ㄢ ㄦ {bksp}',
        'ㄆ ㄊ ㄍ ㄐ ㄔ ㄗ ㄧ ㄛ ㄟ ㄣ',
        'ㄇ ㄋ ㄎ ㄑ ㄕ ㄘ ㄨ ㄜ ㄠ ㄤ {close}',
        '{lang} ㄈ ㄌ ㄏ ㄒ ㄖ ㄙ ㄩ ㄝ ㄡ ㄥ {>} {<}',
        '{space}'
      ]
    },
    display: {
      '{lang}': '中/英',
      '{lock}': '大小寫',
      '{bksp}': 'Backspace',
      '{close}': 'Close',
      '{space}': 'Space',
      '{>}': '上一頁',
      '{<}': '下一頁'
    },
    preventMouseDownDefault: true
  })

  JSZhuyinServerIframeLoader.prototype.IFRAME_URL = 'https://timdream.org/jszhuyin/lib/frame.html'

  let webIME = new JSZhuyinWebIME({
    composition: document.getElementById('composition'),
    candidatesList: document.getElementById('candidates')
  })
  webIME.candidatesList.oncandidateselect = function (candidate) {
    console.log(candidate)
    localInputText.value += candidate[0]

    // 確認 focusInput 已定義且具有 value 屬性
    // if (focusInput && focusInput.value !== undefined) {
    //   focusInput.value = localInputText.value
    // } else {
    //   console.warn("focusInput is undefined or doesn't have a value property.")
    // }

    // 傳遞組字完成後的中文字符到 iframe
    const iframe = document.querySelector('iframe')
    console.log('iframe:::', iframe)
    if (iframe && iframe.contentWindow) {
      console.log('準備發送訊息至', iframe.contentWindow, '，訊息內容：', {
        type: 'input',
        value: localInputText.value
      })
      iframe.contentWindow.postMessage(
        { type: 'input', value: localInputText.value },
        'https://show.vyin.ai/teammusic?token=urped4vydv'
      )
      console.log('成功發送訊息至', iframe.contentWindow, '，訊息內容：', {
        type: 'input',
        value: localInputText.value
      })
    }
    resetInput()
    webIME.handleKey('Escape') // 清除候選列表
  }

  const onKeyPress = (button) => {
    console.log('Button pressed', button)
    if (
      !['{bksp}', '{close}', '{lang}', '{enter}', '{lock}', '{space}', '{>}', '{<}'].includes(
        button
      )
    ) {
      onChange(button)
    } else {
      handleBtn(button)
    }
  }

  // const onChange = (input) => {
  //   let reg = /[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]/
  //   if (reg.test(input)) {
  //     webIME.handleKey(input)
  //   } else {
  //     handleInsertPos(input)
  //   }

  //   console.log('Input changed', input)
  //   localInputText.value = focusInput.value
  // }
  const onChange = (input) => {
    let reg = /[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]/
    if (reg.test(input)) {
      webIME.handleKey(input)
    } else {
      handleInsertPos(input)
      // 通過 postMessage 將按鍵輸入值發送到 iframe
      const iframe = document.querySelector('iframe')
      console.log('準備發送訊息', '，訊息內容：', {
        type: 'input',
        value: localInputText.value
      })
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'input', value: input },
          'https://show.vyin.ai/teammusic?token=urped4vydv'
        )
        console.log('成功發送訊息', '訊息內容：', {
          type: 'input',
          value: input
        })
      }
    }
  }

  const handleBtn = (button) => {
    switch (button) {
      case '{bksp}':
        if (webIME.jszhuyin.symbols === '') {
          console.log(webIME.jszhuyin.symbols)
          handleInsertPos('slice')
        } else {
          console.log(webIME.jszhuyin.symbols)
          webIME.handleKey('Backspace')
          if (webIME.jszhuyin.symbols === '') {
            handleInsertPos('slice')
          }
        }

        // 發送刪除指令到 iframe
        const iframe = document.querySelector('iframe')
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: 'delete' },
            'https://show.vyin.ai/teammusic?token=urped4vydv'
          )
        }
        break
      case '{close}':
        //發送一個關閉鍵盤的指令到 父組件
        emit('showKeyboard')
        break
      case '{enter}':
        // handleInsertPos('\n')
        emit('searchItemHandler')
        break
      case '{space}':
        handleInsertPos(' ')
        break
      case '{>}':
        webIME.candidatesList.goBackPage()
        break
      case '{<}':
        webIME.candidatesList.goForwardPage()
        break
      case '{lang}':
        handleLang()
        break
      case '{lock}':
        handleCapsLock()
        break
      default:
    }
  }
  const handleInsertPos = (input) => {
    // 確保 focusInput 已定義且具有 selectionStart 屬性
    if (!focusInput || !focusInput.value) {
      console.warn("focusInput is undefined or doesn't have a value property.")
      return
    }

    let el = focusInput
    let pos = keyboard.getCaretPosition() || el.selectionStart
    console.log('input:', input)

    if (input !== 'slice') {
      el.value = el.value.slice(0, pos) + input + el.value.slice(pos)
      el.setSelectionRange(pos + 1, pos + 1)
    } else {
      pos = el.selectionStart
      let tmp = el.value.slice(0, pos)
      el.value = tmp.slice(0, -1) + el.value.slice(pos)
      el.setSelectionRange(pos - 1, pos - 1)
    }
  }
  const resetInput = () => {
    localInputText.value = '' // 清空 localInputText，避免重複傳送
  }
  const handleLang = () => {
    let currentLayout = keyboard.options.layoutName
    let lang = 'default'
    if (currentLayout === 'default' || currentLayout === 'caps') {
      lang = 'chinese'
    }
    setKeyboardOption(lang)
  }

  const handleCapsLock = () => {
    let currentLayout = keyboard.options.layoutName
    let toggle = 'default'

    if (currentLayout === 'default') {
      toggle = 'caps'
    }
    setKeyboardOption(toggle)
  }

  const setKeyboardOption = (layout) => {
    keyboard.setOptions({
      layoutName: layout
    })
  }

  let btn = document.getElementsByClassName('keyboard')
  let focusInput
  let zhuinOption = document.querySelector('#composition')
  let candidatesList = document.querySelector('#candidates')

  const showKeyboard = (event) => {
    document.querySelector('.simple-keyboard').style.display = 'block'
    document.querySelector('.simple-keyboard').style.bottom = '15px'
    zhuinOption.style.display = 'block'
    candidatesList.style.display = 'block'
    webIME.elements.input = event.target
    webIME.handleKey('Escape')
    webIME.candidatesList.setCandidates([])
    console.log(event.target.id)
    console.log(webIME)
    focusInput = event.target
    keyboard.setOptions({
      inputName: event.target.id
    })
  }

  const hideKeyboard = () => {
    document.querySelector('.simple-keyboard').style.display = 'none'
    document.querySelector('.simple-keyboard').style.bottom = '0px'
    // zhuinOption.style.display = 'none'
    // candidatesList.style.display = 'none'
  }

  // document.querySelectorAll('.keyboard').forEach((item, index) => {
  //   if (!item.id) {
  //     item.id = 'k' + index
  //   }

  //   item.addEventListener('focus', showKeyboard)
  //   item.addEventListener('touchstart', showKeyboard)
  //   item.addEventListener('blur', hideKeyboard)
  // })
  const preventBlur = (event) => {
    event.preventDefault()
  }

  // 在 `VirtualKeyboard` 上監聽 `blur` 事件並阻止它

  const keyboardElement = document.querySelector('.simple-keyboard')
  if (keyboardElement) {
    keyboardElement.addEventListener('blur', preventBlur)
  }
})
</script>

<style lang="sass">
.keyboard__wrapper
  position: fixed
  bottom: 230px
input
  background: transparent
  border: none
  border-bottom: 1px solid #fff
  color: #fff
  letter-spacing: 0.6px
  font-size: 20px
  &:focus
    outline: none
  &::placeholder
    color: #fff
    letter-spacing: 0.6px
    font-size: 20px

.simple-keyboard
  width: 99%
  // display: none
  position: fixed
  z-index: 9999
  left: 0px
  right: 0px
  margin: 0px auto

.jszhuyin
  display: none


p#composition
  position: fixed
  bottom: 290px
  color: #4a4a4a


ol#candidates
  z-index: 9999
  padding: 0px
  position: fixed
  bottom: 230px
  background-color: #989898
  width: 100%
  left: 0
  width: 100%

ol#candidates li
  display: table-cell
  padding: 5px 15px 5px 5px
  color: #f4f4f4
  cursor: pointer

button
  width: 80px
  height: 20px
</style>
