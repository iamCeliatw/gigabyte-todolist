<template lang="pug">
.form__container
  // 標題與日期區
  .top-row
    .left-column
      label.form-label {{ "Title" }}
      input.form-input(type="text" v-model="localFormData.title" placeholder="new item title")

    .right-column
      label.form-label {{ "Date" }}
      .date-range
        input.date-input(type="date" v-model="localFormData.startDate")
        span {{ "~" }}
        input.date-input(type="date" v-model="localFormData.endDate")

  // 圖片區
  .image-row
    label.form-label.image {{ "Image" }}
    .image__container
      .image-upload-box
        button.upload-btn(type="button" @click="handleFileClick") {{ "Upload Image" }}
        p.or {{ "or" }}
        input.url-input(type="text" v-model="localFormData.imageUrl" placeholder="Please enter image URL" @blur="onImageUrlBlur")

        input.file-input(type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="onFileChange")

      .image-preview
        img.show-img(v-if="localFormData.imageUrl" :src="localFormData.imageUrl" alt="Preview" @error="handleImageError")
        .no-img(v-if="!localFormData.imageUrl") 

  // 內容區
  .content-row
    label.form-label {{ "Content" }}
    textarea.content-textarea(
      v-model="localFormData.content"
      maxlength="200"
      @input="onContentInput"
      placeholder="content..."
      
    )
    .count-display.flex.content-center
      p 200/{{ contentCount }}

</template>

<script lang="ts" setup>
import type { TodoItem } from '@renderer/interfaces/todo'
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { postImage } from '@renderer/api/api'
const props = defineProps<{ item: TodoItem | null }>()
const emits = defineEmits<{
  (e: 'updateItem', updatedData: Partial<TodoItem>): void
}>()

const contentCount = ref(0)
const localFormData = ref<TodoItem>({
  id: 0,
  title: '',
  startDate: '',
  endDate: '',
  imageUrl: '',
  content: ''
})
const createFieldWatch = (field: keyof TodoItem) => {
  watch(
    () => localFormData.value[field],
    (newVal) => {
      if (field === 'startDate' || field === 'endDate') {
        if (!isChecking.value) checkField(field)
      }
      if (props.item && newVal !== props.item[field]) {
        emits('updateItem', {
          id: props.item.id,
          [field]: newVal
        })
      }
    }
  )
}
const isChecking = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleFileClick = () => {
  fileInputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const previewImage = e.target?.result as string
    console.log(previewImage)
    localFormData.value.imageUrl = previewImage
  }
  reader.readAsDataURL(file)
}

const checkField = (field: keyof TodoItem) => {
  console.log('!', field)
  if (isChecking.value) {
    return
  }
  isChecking.value = true
  try {
    switch (field) {
      case 'startDate':
        if (localFormData.value.startDate && localFormData.value.endDate) {
          if (localFormData.value.startDate > localFormData.value.endDate) {
            Swal.fire({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,

              icon: 'error',
              title: 'Oops...Input Error',
              text: 'start date should be less than end date'
            })
            localFormData.value.startDate = ''
            console.log('isChecking.value', isChecking.value)
            return
          }
        }
        break
      case 'endDate':
        if (localFormData.value.startDate && localFormData.value.endDate) {
          if (localFormData.value.endDate < localFormData.value.startDate) {
            Swal.fire({
              toast: true,
              position: 'center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,

              icon: 'error',
              title: 'Oops...Input Error',
              text: 'End date should be greater than start date'
            })
            localFormData.value.endDate = ''
            return
          }
        }
        break
    }
  } finally {
    isChecking.value = false
  }
}
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src =
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGNkZzdpajhleTI0YzRtNGFhYmY5d2IxZWV4eXRtc3h1eDl4NmhrayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TqiwHbFBaZ4ti/giphy.webp'
}
// 定義需要監聽的欄位
const fieldsToWatch: (keyof TodoItem)[] = ['title', 'content', 'startDate', 'endDate', 'imageUrl']

// 為每個欄位創建 watch
fieldsToWatch.forEach(createFieldWatch)

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      localFormData.value = JSON.parse(JSON.stringify(newItem))
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="sass" scoped>
@import '../assets/variable'
.form__container
  width: 100%
  max-width: calc(100% - 250px)
  margin-left: auto
  padding: 66px 25px 25px
  border-radius: 8px
  @media screen and (max-width: 768px)
    max-width: 100%
    margin-left: 0
    padding: 66px 15px 15px
  .top-row,
  .image-row,
  .content-row,
  .actions
    margin-bottom: 1rem
    display: flex
    flex-wrap: wrap
    align-items: center
  .image__container
    display: flex
    width: 100%
    gap: 2rem
    @media screen and (max-width: 768px)
      flex-wrap: wrap

  .form-label
    display: block
    font-weight: bold
    margin-bottom: 0.5rem
    width: 100%
  .image
    padding-left: 1rem


  .left-column,
  .right-column
    width: 100%
    @media (min-width: 768px)
      width: 50%
      padding: 0 1rem
      box-sizing: border-box



  .date-range
    display: flex
    align-items: center
    gap: 0.5rem


  .form-input,
  .date-input,
  .url-input,
  .content-textarea
    width: 100%
    font-size: 1rem
    height: 51px
    padding: 0.4rem 0.6rem
    border: 1px solid #ccc
    border-radius: 4px
    box-sizing: border-box


  .image-upload-box
    display: flex
    flex-direction: column
    gap: 0.5rem
    height: 151px
    width: 100%
    justify-content: space-between
    padding-left: 1rem
    @media (min-width: 768px)
      width: 50%


    .or
      text-align: center
      color: #888


    .upload-btn
      height: 51px
      transition: all 0.3s ease
      color: $text-color
      background: $light-green-color
      border: none
      border-radius: 4px
      cursor: pointer
      padding: 0.4rem 1rem
      transition: all 0.3s
      &:hover
        color: $text-color
        background: $secondary-color
      &:active
        color: $gray-color
        background: $light-green-color
    .url-input
      height: 51px


  .image-preview
    width: 100%
    height: 151px
    border-radius: 10px

    @media (min-width: 768px)
      width: 50%

    img
      width: 100%
      height: 100%
      display: block
      object-fit: cover
      border-radius: 10px
      object-position: center
    .no-img
      width: calc(100% - 1rem)
      background: $gray-color
      height: 100%
      border-radius: 10px



  .content-row
    flex-direction: column
    padding: 0 1rem
    position: relative

    textarea.content-textarea
      min-height: 100px
      resize: vertical
      border-radius: 10px
      background: $gray-color
      border: none
      resize: none

    .count-display
      margin-top: 0.2rem
      font-size: 0.9rem
      text-align: right
      color: #666
      position: absolute
      right: 1rem
      bottom: 0rem
      width: 80px
      height: 30px
      background-color: $light-green-color
      clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%)
      border-radius: 0 0 10px 0

      p
        color: $text-color
        font-size: 0.8rem
        padding: 0.2rem 0.5rem
        font-weight: bold
</style>
