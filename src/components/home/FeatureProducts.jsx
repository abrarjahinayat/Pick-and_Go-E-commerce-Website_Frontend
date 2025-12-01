"use client"


import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import Container from '../common/Container'

const FeatureProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Replace with your API endpoint
    axios
      .get(`${process.env.NEXT_PUBLIC_API}/products/allproducts`)
      .then((res) => {
        setProducts(res?.data?.data ?? [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Products Load Error:", err)
        setLoading(false)
      })
  }, [])

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product)
    // Add your cart logic here
  }

  const handleWishlist = (product) => {
    console.log("Add to wishlist:", product)
    // Add your wishlist logic here
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Loading Products...</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg h-80 mb-4"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <Container> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">
            Check out our handpicked collection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product?._id || index}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Product Image Container */}
              <div className="relative overflow-hidden bg-gray-100">
                <Link href={`/allproducts/${product?.slug || product?._id}`}>
                  <div className="relative h-80 w-full">
                    {product?.image ? (
                      <img
                        src={product.image.length > 0 ? product.image[0] : ''}
                        alt={product?.name || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <span className="text-6xl">📦</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Badges */}
                {product?.discountprice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{product.discountprice}%
                  </div>
                )}
                {product?.isNew && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    New
                  </div>
                )}

                {/* Hover Actions - Wishlist & Quick View */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleWishlist(product)}
                    className="bg-white p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <Link
                    href={`/product/${product?.slug || product?._id}`}
                    className="bg-white p-2 rounded-full shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                    aria-label="Quick view"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>

                {/* Hover Overlay with Add to Cart & Buy Now Buttons */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-white text-gray-900 py-1 px-1 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2  text-[12px]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      href={`/checkout?product=${product?._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5 px-1 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center text-[12px]"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/product/${product?.slug || product?._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product?.title || 'Product Name'}
                  </h3>
                </Link>

                {/* Rating */}
                {product?.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(product.rating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product?.reviews || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${product?.price || '0.00'}
                  </span>
                  {product?.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {product?.stock !== undefined && (
                  <p className={`text-xs mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/allproducts"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>

        </Container>
    </section>
  )
}

export default FeatureProducts