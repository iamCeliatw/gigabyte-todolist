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
        if localFormData && localFormData.imageUrl
          img(:src="localFormData.imageUrl" alt="Preview")


  // 內容區
  .content-row
    label.form-label {{ "Content" }}
    textarea.content-textarea(
      v-model="localFormData.content"
      maxlength="200"
      @input="onContentInput"
      placeholder="content..."
    )
    .count-display {{ contentCount }}/200

</template>

<script lang="ts" setup>
import type { TodoItem } from '@renderer/interfaces/todo'
import { computed } from 'vue'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ item: TodoItem | null }>()
const emits = defineEmits<{
  (e: 'updateItem', updatedData: Partial<TodoItem>): void
}>()
const previewImage = ref<string | null>(null)

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
      if (props.item && newVal !== props.item[field]) {
        emits('updateItem', {
          id: props.item.id,
          [field]: newVal
        })
      }
    }
  )
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
    gap: 1rem
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
    @media (min-width: 768px)
      width: 50%
      padding: 0 1rem
      box-sizing: border-box


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
    padding: 0 1rem
    background: $gray-color
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


  .content-row
    flex-direction: column
    padding: 0 1rem

    textarea.content-textarea
      min-height: 100px
      resize: vertical


    .count-display
      margin-top: 0.2rem
      font-size: 0.9rem
      text-align: right
      color: #666
</style>
