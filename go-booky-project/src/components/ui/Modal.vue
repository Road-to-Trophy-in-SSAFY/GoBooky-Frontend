<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <slot>{{ text }}</slot>
      <button @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ text: String })
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-align: center;
}
button {
  margin-top: 1.5rem;
  background: #42b983;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
