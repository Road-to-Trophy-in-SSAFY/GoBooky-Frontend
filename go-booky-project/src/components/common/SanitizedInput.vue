<template>
  <input
    :type="type"
    :value="modelValue"
    @input="handleInput"
    :placeholder="placeholder"
    :class="inputClass"
  />
</template>

<script setup>
import { watch } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  const sanitizedValue = DOMPurify.sanitize(event.target.value)
  emit('update:modelValue', sanitizedValue)
}

// 초기값도 sanitize
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const sanitizedValue = DOMPurify.sanitize(newValue)
      if (sanitizedValue !== newValue) {
        emit('update:modelValue', sanitizedValue)
      }
    }
  },
  { immediate: true },
)
</script>
