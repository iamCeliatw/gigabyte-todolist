<template lang="pug">
.form__container
  .top__row
    .left-column
      label.form-label {{ "Title" }}
      input.form-input(type="text" v-model="localFormData.title" placeholder="new item title")

    .right-column
      label.form-label {{ "Date" }}
      .date-range
        input.date-input(type="date" v-model="localFormData.startDate")
        span {{ "~" }}
        input.date-input(type="date" v-model="localFormData.endDate")

  .image__row
    label.form-label.image {{ "Image" }}
    .image__container
      .image-upload-box
        button.upload-btn(type="button" @click="fileInputRef?.click()") {{ "Upload Image" }}
        p.or {{ "or" }}
        input.url-input(type="text" v-model="localFormData.inputUrl" placeholder="Please enter image URL")
        input.file-input(type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="onFileChange")

      .image-preview
        img.show-img.image(v-if="localFormData.imageUrl" :src="localFormData.imageUrl" alt="Preview" @error="handleImageError")
        .no-img(v-if="!localFormData.imageUrl") 

  .content__row
    label.form-label {{ "Content" }}
    textarea.content-textarea(
      v-model="localFormData.content"
      @input="onContentInput"
      placeholder="content..."
      
    )
    .count-display.flex.item-center.content-end 
      p {{ `200/${contentCount}` }}

  .delete-btn(@click="deleteItem")
    img.delete-img(src="/delete-icon.svg" alt="delete")
</template>

<script lang="ts" setup>
import type { TodoItem } from '@renderer/interfaces/todo'
import { ref, watch } from 'vue'
import Swal from 'sweetalert2'
type TodoItemUpdate = Partial<
  Pick<TodoItem, 'id' | 'title' | 'content' | 'startDate' | 'endDate' | 'imageUrl'>
>
const props = defineProps<{ item: TodoItem | null }>()
const emits = defineEmits<{
  (e: 'updateItem', updatedData: TodoItemUpdate): void
  (e: 'deleteItem', id: number): void
}>()

const isChecking = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const contentCount = ref<number>(0)
const inputUrl = ref<string>('')
const localFormData = ref<TodoItem>({
  id: 0,
  title: '',
  startDate: '',
  endDate: '',
  imageUrl: '',
  content: '',
  inputUrl: ''
})
const fieldsToWatch: (keyof TodoItem)[] = [
  'title',
  'content',
  'startDate',
  'endDate',
  'imageUrl',
  'inputUrl'
]

const deleteItem = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this item!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Deleted!', 'Your item has been deleted.', 'success')
      if (props.item?.id !== undefined) {
        emits('deleteItem', props.item.id)
      }
    }
  })
}

const createFieldWatch = (field: keyof TodoItem) => {
  watch(
    () => localFormData.value[field],
    (newVal) => {
      if (field === 'startDate' || field === 'endDate') {
        console.log('checking')
        if (!isChecking.value) checkField(field)
      }
      if (field === 'content' && typeof newVal === 'string') {
        if (newVal.length > 200) {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Content should be less than 200 characters!'
          })
          localFormData.value.content = newVal.slice(0, 200)
        }
        contentCount.value = newVal.length
      }
      if (field === 'inputUrl' && typeof newVal === 'string') {
        localFormData.value.imageUrl = newVal
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

fieldsToWatch.forEach(createFieldWatch)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const previewImage = e.target?.result as string
    localFormData.value.imageUrl = previewImage
    inputUrl.value = ''
  }
  reader.readAsDataURL(file)
}

const checkField = (field: keyof TodoItem) => {
  if (isChecking.value) {
    return
  }
  isChecking.value = true
  try {
    switch (field) {
      case 'startDate':
        if (localFormData.value.startDate && localFormData.value.endDate) {
          if (localFormData.value.startDate > localFormData.value.endDate) {
            console.log('situation 1')
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
            localFormData.value.startDate = localFormData.value.endDate
            return
          }
        }
        break
      case 'endDate':
        if (localFormData.value.startDate && localFormData.value.endDate) {
          if (localFormData.value.endDate < localFormData.value.startDate) {
            console.log('situation 2')
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
            localFormData.value.endDate = localFormData.value.startDate
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
@use '../assets/variable' as var
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

  .top__row,
  .image__row,
  .content__row,
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
  //   @media screen and (max-width: 768px)
  //     padding: 0


  .left-column,
  .right-column
    width: 100%
    @media (min-width: 768px)
      width: 50%
      padding: 0 1rem
    @media (max-width: 768px)
      margin-top: 1rem


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
    background: var.$gray-color
    border-radius: 4px
    border: none
    &:focus
      outline: none

  .date-input
    background: var.$gray-color
    color: var.$text-color
    border: none

  .image-upload-box
    display: flex
    flex-direction: column
    gap: 0.5rem
    height: 151px
    width: 100%
    justify-content: space-between
    padding-left: 1rem
    @media (max-width: 768px)
      width: 100%
      padding: 0


    .or
      text-align: center
      color: var.$text-color


    .upload-btn
      height: 51px
      transition: all 0.3s ease
      color: var.$text-color
      background: var.$light-green-color
      border: none
      border-radius: 4px
      cursor: pointer
      padding: 0.4rem 1rem
      transition: all 0.3s
      &:hover
        color: var.$text-color
        background: var.$secondary-color
      &:active
        color: var.$gray-color
        background: var.$light-green-color
    .url-input
      height: 51px


  .image-preview
    width: 100%
    height: 151px
    border-radius: 10px

    @media (max-width: 768px)
      width: 100%

    img
      border-radius: 10px
      object-position: center
      width: calc(100% - 1rem)
      padding-left: 0
      @media (max-width: 768px)
        width: 100%
    .no-img
      width: calc(100% - 1rem)
      background: var.$gray-color
      height: 100%
      border-radius: 10px
      @media (max-width: 768px)
        width: 100%
  .content__row
    flex-direction: column
    padding: 0 1rem
    position: relative
    @media (max-width: 768px)
      padding: 0

    textarea.content-textarea
      min-height: 100px
      resize: vertical
      border-radius: 10px
      background: var.$gray-color
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
      width: 83px
      height: 30px
      background-color: var.$light-green-color
      clip-path: polygon(35% 0, 100% 0, 100% 100%, 0% 100%)
      border-radius: 0 0 10px 0
      p
        color: var.$text-color
        font-size: 0.8rem
        padding: 0.2rem 0.5rem
        font-weight: bold
.delete-btn
  position: absolute
  top: 23px
  right: 17px
  width: 24px
  height: auto
  cursor: pointer
  img
    width: 100%
    height: 100%
</style>
