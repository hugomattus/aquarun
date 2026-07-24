<template>
  <svg
    v-bind="attrs"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    v-html="svgContent"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="inline-block flex-shrink-0"
    style="display: inline-block; overflow: hidden;"
  />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import feather from 'feather-icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
})

const attrs = useAttrs()

const svgContent = computed(() => {
  const icon = feather.icons[props.name]
  return icon ? icon.contents : ''
})
</script>
