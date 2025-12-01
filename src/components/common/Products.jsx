import React from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'

const Products = ({ product }) => {


//   const handleAddToCart = (e) => {
//     e.preventDefault()
//     if (onAddToCart) {
//       onAddToCart(product)
//     } else {
//       console.log("Add to cart:", product)
//     }
//   }

//   const handleWishlist = (e) => {
//     e.preventDefault()
//     if (onAddToWishlist) {
//       onAddToWishlist(product)
//     } else {
//       console.log("Add to wishlist:", product)
//     }
//   }

  return (
    <div
    className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link href={`/allproducts/${product?.slug || product?._id}`}>
          <div className="relative h-80 w-full">
            {product?.image ? (
              <img
                src={product.image[0]}
                alt={product?.title || 'Product'}
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product?.discount && (
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{product.discount}%
            </div>
          )}
          {product?.isNew && (
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              New
            </div>
          )}
        </div>

        {/* Hover Actions - Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            // onClick={handleWishlist}
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-1 text-[12px] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
            //   onClick={handleAddToCart}
              className="flex-1 bg-white text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <Link
              href={`/checkout?product=${product?._id}`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center"
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
        <div className="flex items-center gap-2 mb-2">
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
          <p className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </p>
        )}
      </div>
    </div>
  )
}

export default Products