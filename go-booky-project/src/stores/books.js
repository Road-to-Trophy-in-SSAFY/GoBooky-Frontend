import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { categoriesData } from './categoriesData.js'

export const useBookStore = defineStore('book', () => {
  const books = ref([])
  const filteredBooks = ref([])
  const API_URL = 'http://127.0.0.1:8000'

  // 카테고리별로 서버에서 필터링된 책 목록을 받아오는 함수
  const getBooks = function (categoryPk = null) {
    let url = `${API_URL}/books/`
    if (categoryPk) {
      url += `?category=${categoryPk}`
    }
    axios({
      method: 'get',
      url,
    })
      .then((res) => {
        books.value = res.data
        filteredBooks.value = res.data
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // 프론트엔드에서만 필터링 (서버 필터링이 안 될 때 사용)
  const filterByCategory = function (categoryPk) {
    if (!categoryPk) {
      filteredBooks.value = books.value
    } else {
      filteredBooks.value = books.value.filter(
        (book) => book.category_name && getCategoryPkByName(book.category_name) === categoryPk,
      )
    }
  }

  function getCategoryPkByName(name) {
    const category = categoriesData.find((cat) => cat.fields.name === name)
    return category ? category.pk : null
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

  return { books, filteredBooks, getBooks, getBookById, getBookDetail, filterByCategory }
})
