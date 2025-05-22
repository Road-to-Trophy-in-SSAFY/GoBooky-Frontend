import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useBookStore = defineStore('book', () => {
  const books = ref([])
  const API_URL = 'http://127.0.0.1:8000'

  const getBooks = function () {
    axios({
      method: 'get',
      url: `${API_URL}/books/`,
    })
      .then((res) => {
        books.value = res.data
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const getBookById = function (id) {
    return books.value.find((book) => book.id === id)
  }

  const getBookDetail = async function (id) {
    try {
      const res = await axios.get(`${API_URL}/books/${id}/`)
      return res.data
    } catch (err) {
      console.log(err)
      return null
    }
  }

  return { books, getBooks, getBookById, getBookDetail }
})
