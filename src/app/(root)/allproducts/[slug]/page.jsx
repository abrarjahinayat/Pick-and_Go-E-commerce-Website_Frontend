"use client"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import Container from "@/components/common/Container"
import {
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Star,
  Plus,
  Minus,
} from "lucide-react"

const Page = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.NEXT_PUBLIC_API}/products/productslug/${slug}`)
      .then((res) => {
        const p = res?.data?.data ?? null
        setProduct(p)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Product Load Error:", err)
        setProduct(null)
        setLoading(false)
      })
  }, [slug])

  // Derive images
  const images = product?.images || product?.image || ["/placeholder.jpg"]
  const imagesArray = Array.isArray(images) ? images : [images]

  // Derive sizes/colors: prefer explicit arrays; otherwise derive from variants
  const variantList = Array.isArray(product?.variants) ? product.variants : []
  const sizesFromVariants = Array.from(new Set(variantList.map((v) => v.size).filter(Boolean)))
  const colorsFromVariants = Array.from(new Set(variantList.map((v) => v.color).filter(Boolean)))

  const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes : sizesFromVariants
  const colors = Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : colorsFromVariants

  // After product loads, preselect sensible defaults if not already selected
  useEffect(() => {
    if (!product) return

    // prefer explicit fields but fallback to derived lists
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0])
    }
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0])
    }

    // reset image index
    setSelectedImage(0)
    setQuantity(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]) // intentionally only when product changes

  // Find selectedVariant with flexible matching:
  // If both size and color exist in data, match both.
  // If only color exists, match by color. If only size exists, match by size.
  const selectedVariant =
    variantList.find((v) => {
      const sizeExists = sizesFromVariants.length > 0 || (Array.isArray(product?.sizes) && product.sizes.length > 0)
      const colorExists = colorsFromVariants.length > 0 || (Array.isArray(product?.colors) && product.colors.length > 0)

      const sizeMatches = !sizeExists || !selectedSize ? true : v.size === selectedSize
      const colorMatches = !colorExists || !selectedColor ? true : v.color === selectedColor

      return sizeMatches && colorMatches
    }) ?? null

  // availableStock: if multi-variant use matched variant stock else product.stock / totalStock
  const availableStock =
    product?.variantType === "MultiVarient"
      ? selectedVariant?.stock ?? 0
      : product?.stock ?? product?.totalStock ?? 0

  const handleAddToCart = () => {
    if (product?.variantType === "MultiVarient") {
      // If sizes exist in UI, ensure selection
      if (sizes.length > 0 && !selectedSize) {
        alert("Please select a size")
        return
      }
      if (colors.length > 0 && !selectedColor) {
        alert("Please select a color")
        return
      }

      if (!selectedVariant) {
        alert("Selected variant is not available")
        return
      }

      if (selectedVariant.stock < quantity) {
        alert(`Only ${selectedVariant.stock} items available for this variant`)
        return
      }

      console.log("Add to cart:", {
        product,
        variant: selectedVariant,
        quantity,
        selectedSize,
        selectedColor,
      })
    } else {
      if (availableStock < quantity) {
        alert(`Only ${availableStock} items available`)
        return
      }
      console.log("Add to cart:", { product, quantity })
    }
    // TODO: add your cart logic here
  }

  const handleAddToWishlist = () => {
    console.log("Add to wishlist:", product)
    // TODO: wishlist logic
  }

  const incrementQuantity = () => {
    if (quantity < availableStock) setQuantity((q) => q + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((q) => q - 1)
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-300 h-6 w-1/2 rounded"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="py-12">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <Container>
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
                <img src={imagesArray[selectedImage]} alt={product?.title || product?.name} className="w-full h-full object-cover" />
                {product?.discount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">-{product.discount}% OFF</div>
                )}
              </div>

              {imagesArray.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagesArray.map((img, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)} className={`relative overflow-hidden rounded-lg aspect-square border-2 transition-all ${selectedImage === index ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"}`}>
                      <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product?.title || product?.name}</h1>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product?.rating || 4) ? "fill-yellow-400" : "fill-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">{product?.rating || 4.5} ({product?.reviews || 128} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-gray-900">${product?.price ?? "0.00"}</span>
                  {product?.originalPrice && <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${availableStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {availableStock > 0 ? (product?.variantType === "MultiVarient" && (selectedSize || selectedColor) ? `In Stock (${availableStock} available)` : `In Stock (${product?.stock ?? availableStock})`) : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product?.description || "High-quality product..."}</p>
              </div>

              {/* Size selection only if sizes exist */}
              {product?.variantType === "MultiVarient" && sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Size <span className="text-red-500">*</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const sizeHasStock = variantList.some((v) => (v.size === size) && (v.stock > 0))
                      return (
                        <button key={size} onClick={() => { setSelectedSize(size); setQuantity(1) }} disabled={!sizeHasStock}
                          className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${selectedSize === size ? "border-blue-600 bg-blue-50 text-blue-600" : sizeHasStock ? "border-gray-300 hover:border-gray-400 text-gray-700" : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"}`}>
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Color selection only if colors exist */}
              {product?.variantType === "MultiVarient" && colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Color <span className="text-red-500">*</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const colorHasStock = variantList.some((v) => (v.color === color) && (v.stock > 0) && (!selectedSize || v.size === selectedSize))
                      return (
                        <button key={color} onClick={() => { setSelectedColor(color); setQuantity(1) }} disabled={!colorHasStock}
                          className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${selectedColor === color ? "border-blue-600 bg-blue-50 text-blue-600" : colorHasStock ? "border-gray-300 hover:border-gray-400 text-gray-700" : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"}`}>
                          {color}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg">
                    <button onClick={decrementQuantity} className="p-3 hover:bg-gray-100 transition-colors" disabled={quantity <= 1}><Minus className="w-4 h-4" /></button>
                    <span className="px-6 py-2 font-semibold text-lg">{quantity}</span>
                    <button onClick={incrementQuantity} className="p-3 hover:bg-gray-100 transition-colors" disabled={quantity >= availableStock}><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-sm text-gray-600">{availableStock} pieces available</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button onClick={handleAddToCart} disabled={availableStock <= 0} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button onClick={handleAddToWishlist} className="bg-gray-100 text-gray-900 font-semibold p-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

           {
  product?.variantType === "MultiVarient" && (
    // Only show the warning if a selection is missing for an option that actually exists
    ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          Please select{" "}
          {sizes.length > 0 && !selectedSize && "size"}
          {sizes.length > 0 && !selectedSize && colors.length > 0 && !selectedColor && " and "}
          {colors.length > 0 && !selectedColor && "color"}
          {" "}before adding to cart
        </p>
      </div>
    )
  )
}


              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg"><Truck className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-sm font-semibold text-gray-900">Free Shipping</p><p className="text-xs text-gray-600">On orders over $50</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg"><Shield className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-sm font-semibold text-gray-900">Secure Payment</p><p className="text-xs text-gray-600">100% secure</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg"><RefreshCw className="w-5 h-5 text-purple-600" /></div>
                  <div><p className="text-sm font-semibold text-gray-900">Easy Returns</p><p className="text-xs text-gray-600">30-day return</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">SKU:</span><span className="font-medium text-gray-900">{product?.sku || "PG-" + (product?._id?.slice(-6) ?? "000000")}</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Category:</span><span className="font-medium text-gray-900">{product?.category || "Fashion"}</span></div>
                  <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Brand:</span><span className="font-medium text-gray-900">{product?.brand || "Pick & Go"}</span></div>
                  <div className="flex justify-between py-2"><span className="text-gray-600">Availability:</span><span className={`font-medium ${availableStock > 0 ? "text-green-600" : "text-red-600"}`}>{availableStock > 0 ? "In Stock" : "Out of Stock"}</span></div>
                  {product?.variantType === "MultiVarient" && (<div className="flex justify-between py-2 border-t border-gray-100 pt-2"><span className="text-gray-600">Variant Type:</span><span className="font-medium text-gray-900">MultiVarient</span></div>)}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h3>
                <div className="space-y-3 text-sm text-gray-600"><p>• Free standard shipping on orders over $50</p><p>• Express shipping available at checkout</p><p>• Estimated delivery: 3-7 business days</p><p>• International shipping available</p></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default Page
