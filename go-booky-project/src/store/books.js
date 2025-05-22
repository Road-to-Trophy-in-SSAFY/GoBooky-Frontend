import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useBookStore = defineStore(
  'book',
  () => {
    const books = ref([])
    const API_URL = 'http://127.0.0.1:8000'

    const getBooks = function () {
      axios({
        method: 'get',
        url: `${API_URL}/books/`,
      })
        .then((res) => {
          console.log(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }

    return { books, getBooks }
  },
  { persist: true },
)
