<template lang="pug">
.ai__wrapper
    img(src="/images/outside_img.jpg")
</template>

<script setup>
import { onMounted } from 'vue'

</script>

<style lang="sass" scoped>
.ai__wrapper
    width: 1080px
    height: 1920px
    img
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center 
</style>
