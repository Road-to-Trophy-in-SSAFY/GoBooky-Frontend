import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { categoriesData } from './categoriesData.js'

export const useBookStore = defineStore('book', () => {
  const books = ref([]) // 현재 API에서 받아온 모든 책 목록
  const filteredBooks = ref([]) // 화면에 표시될 필터링된 책 목록
  const searchResults = ref([]) // 검색 결과를 별도로 저장
  const isLoading = ref(false)
  const API_URL = 'http://127.0.0.1:8000'
  const currentSearchQuery = ref('') // 현재 검색어 저장
  const currentCategory = ref(null) // 현재 카테고리 저장
  const hasSearchResults = ref(false) // 검색 결과가 있는지 여부

  // 카테고리별로 서버에서 필터링된 책 목록을 받아오는 함수
  const getBooks = function (categoryPk = null) {
    isLoading.value = true
    currentCategory.value = categoryPk
    currentSearchQuery.value = '' // 검색어 초기화
    hasSearchResults.value = false // 검색 결과 상태 초기화

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
        searchResults.value = [] // 검색 결과 초기화
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  // 검색 함수
  const searchBooks = function (query) {
    if (!query) {
      getBooks(currentCategory.value)
      return
    }

    isLoading.value = true
    currentSearchQuery.value = query // 현재 검색어 저장

    axios({
      method: 'get',
      url: `${API_URL}/books/search/`,
      params: { q: query },
    })
      .then((res) => {
        books.value = res.data
        searchResults.value = res.data // 검색 결과 저장
        hasSearchResults.value = true // 검색 결과 있음으로 설정

        // 카테고리 필터가 있으면 클라이언트 측에서 추가 필터링
        if (currentCategory.value) {
          filteredBooks.value = res.data.filter(
            (book) =>
              book.category_name &&
              getCategoryPkByName(book.category_name) === currentCategory.value,
          )
        } else {
          filteredBooks.value = res.data
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  // 검색 결과 내에서 카테고리 필터링
  const filterSearchResultsByCategory = function (categoryPk) {
    currentCategory.value = categoryPk

    if (!hasSearchResults.value) {
      // 검색 결과가 없으면 일반 카테고리 필터링 사용
      getBooks(categoryPk)
      return
    }

    // 로딩 상태 표시
    isLoading.value = true

    // 검색 결과 내에서 카테고리 필터링
    if (!categoryPk) {
      // 카테고리가 없으면 모든 검색 결과 표시
      filteredBooks.value = searchResults.value
    } else {
      // 해당 카테고리의 검색 결과만 필터링
      filteredBooks.value = searchResults.value.filter(
        (book) => book.category_name && getCategoryPkByName(book.category_name) === categoryPk,
      )
    }

    // 로딩 상태 해제 (짧은 지연 후)
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }

  // 검색 결과 초기화 (전체 도서 목록으로 돌아가기)
  const clearSearchResults = function () {
    currentSearchQuery.value = ''
    hasSearchResults.value = false
    searchResults.value = []
    getBooks(currentCategory.value)
  }

  // 프론트엔드에서만 필터링 (서버 필터링이 안 될 때 사용)
  const filterByCategory = function (categoryPk) {
    currentCategory.value = categoryPk

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

  return {
    books,
    filteredBooks,
    searchResults,
    isLoading,
    currentSearchQuery,
    currentCategory,
    hasSearchResults,
    getBooks,
    searchBooks,
    filterSearchResultsByCategory,
    clearSearchResults,
    getBookById,
    getBookDetail,
    filterByCategory,
  }
})
