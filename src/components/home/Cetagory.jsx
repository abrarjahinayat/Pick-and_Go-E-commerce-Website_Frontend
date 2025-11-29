"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API}/category/getallcategory`)
      .then((res) => {
        setCategories(res?.data?.data ?? [])
        // console.log("Categories:", res?.data?.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Category Load Error:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Loading Categories...</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-2xl h-40 mb-3"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">
            Discover our wide range of products
          </p>
        </div>

        {/* Category Grid */}
        <div className="flex flex-wrap gap-8 justify-center pt-8">
          {categories.map((category, index) => (
            <Link 
              href={`/category/${category?.slug || category?._id}`} 
              key={category?._id || index}
              className="group"
            >
              <div className="relative ">
                {/* Category Image */}
                <div className="relative h-48 w-48 overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                  {category?.image ? (
                    <img
                      src={category.image}
                      alt={category?.name || 'Category'}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <span className="text-4xl">🛍️</span>
                    </div>
                  )}
                </div>

                {/* Category Name - Outside and Above Image */}
                <div className="absolute  -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-[12px] whitespace-nowrap group-hover:text-blue-600 transition-colors duration-300">
                    {category?.name || 'Category'}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        {categories.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/categories"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default Category