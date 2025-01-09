<template lang="pug">
.todo__wrapper
  .todo__sidebar.flex.flex-column(ref="sidebarRef" :class="{ 'is-visible': isSidebarVisible }")
    .todo__sidebar--upper
      .todo__sidebar--header
        h1 {{ "Demo Todo List" }}
      .todo__sidebar--list
        ul
          li.todo__sidebar--list--item(v-for="todo in todoList" :key="todo.id" @click="selectTodo(todo.id)" 
          :class="{ 'todo__sidebar--list--item--selected': todo.id === selectedTodoId }") {{ `${todo.id}. ${todo.title}` }}
      .todo__sidebar--add.flex.content-center
        button.radius-10(@click="addTodoItem") {{ "Add Item" }}
    .todo__sidebar--downer.content-center.radius-10(@click="toggleRandomImage")
      img.image.radius-10(:src="randomImageUrl" alt="random image" v-if="randomImageUrl")
      
  .hambuger__icon(@click="toggleSidebar" v-if="!isSidebarVisible")
    span
    span
    span

  ItemForm(:item="todoList.find(todo => todo.id === selectedTodoId)" v-if="selectedTodoId !== null"
  @updateItem="handleUpdate" @deleteItem="handleDelete")
.overlay(v-if="isSidebarVisible" @click="toggleSidebar")
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TodoItem } from '@renderer/interfaces/todo'
import ItemForm from '@renderer/components/ItemForm.vue'
import { getRandomImage } from '@renderer/api/api'
import Swal from 'sweetalert2'
import { onMounted } from 'vue'
const selectedTodoId = ref<number | null>(null)
const isSidebarVisible = ref<boolean>(false)
const selectTodo = (id: number) => {
  selectedTodoId.value = id
}
const randomImageUrl = ref<string | null>(null)
const addTodoItem = () => {
  if (todoList.value.length === 10) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'You can only add up to 10 items!'
    })
    return
  }
  const newId = todoList.value.length + 1
  todoList.value.push({
    id: newId,
    title: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    inputUrl: '',
    content: ''
  })
  selectedTodoId.value = newId
}

const sidebarRef = ref<HTMLElement | null>(null)
const isFetching = ref(false)
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}
const toggleRandomImage = async () => {
  if (isFetching.value) return
  isFetching.value = true
  randomImageUrl.value = 'https://cdn.pixabay.com/animation/2024/11/20/14/47/14-47-08-827_512.gif'
  try {
    const data = await getRandomImage()
    randomImageUrl.value = data[0].url
  } catch (error) {
    console.error(error)
  } finally {
    isFetching.value = false
  }
}
const todoList = ref<TodoItem[]>([
  {
    id: 1,
    title: 'First Todo',
    startDate: '',
    endDate: '',
    imageUrl: '',
    inputUrl: '',
    content: 'This is the first todo item.'
  }
])
const handleUpdate = (updatedData: Partial<TodoItem>) => {
  const index = todoList.value.findIndex((todo) => todo.id === updatedData.id)
  if (index !== -1) {
    todoList.value[index] = { ...todoList.value[index], ...updatedData }
  }
}
const handleDelete = (id: number) => {
  const index = todoList.value.findIndex((todo) => todo.id === id)
  if (index !== -1) {
    todoList.value.splice(index, 1)
    if (todoList.value.length === 0) {
      selectedTodoId.value = null
      return
    }
    if (selectedTodoId.value === id) {
      selectedTodoId.value = todoList.value[0].id
    }
  }
}

onMounted(async () => {
  const data = await getRandomImage()
  randomImageUrl.value = data[0].url
  if (todoList.value.length > 0) selectedTodoId.value = todoList.value[0].id
})
</script>

<style lang="sass" scoped>
@use '../assets/variable' as var
.todo
  &__wrapper
    overflow: hidden

  &__sidebar
    width: 250px
    height: 100vh
    background-color: var.$primary-color
    position: fixed
    top: 0
    left: 0
    z-index: 2
    justify-content: space-between
    @media screen and (max-width: 768px)
      transform: translateX(-100%)
      transition: transform 0.3s ease
    &.is-visible
      transform: translateX(0)


  &__sidebar--header
    width: 100%
    h1
      width: 100%
      padding: 20px
      color: var.$text-color
      font-size: 20px
      font-weight: normal
  &__sidebar--list--item
    background: var.$secondary-color
    padding: 10px 20px
    width: 100%
    height: 48px
    margin-bottom: 5px
    cursor: pointer
    &--selected
      font-weight: bold
      position: relative
      &::after
        content: ""
        position: absolute
        right: 0px
        top: 50%
        transform: translateY(-50%)
        width: 0
        height: 0
        border-top: 24px solid transparent
        border-bottom: 24px solid transparent
        border-right: 24px solid #fff
  &__sidebar--add
    margin-top: 20px
    button
      border: none
      width: 210px
      height: 44px
      background-color: #E7FFE9
      font-size: 20px
      cursor: pointer
      transition: background-color 0.3s ease
      &:hover
        background-color: var.$secondary-color
  &__sidebar--downer
    width: 210px
    height: 60px
    margin: 20px auto
    background: var.$gray-color
    img
      object-position: center
.hambuger__icon
  position: absolute
  top: 20px
  left: 20px
  cursor: pointer
  display: none
  @media screen and (max-width: 768px)
    display: block
  span
    width: 30px
    height: 3px
    background-color: var.$text-color
    display: block
    margin-bottom: 5px
    &:last-child
      margin-bottom: 0


.overlay
  display: block
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: var.$overlay-color
  z-index: 1
</style>
