"use client";

import React, { useState, useEffect } from "react";
import axios, { Axios } from "axios";
import Container from "@/components/common/Container";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
} from "lucide-react";
import { useSelector } from "react-redux";

const Page = () => {
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: replace with real userId from auth / redux
  const userId = useSelector((state) => state.user.value);

  // Fetch cart from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/v1/cart/singlecart/${userId?._id}`
        );

        const apiItems = res?.data?.data || [];

        // Map API format to UI format
        const mapped = apiItems.map((item) => {
          const product = item.product || {};
          const variants = item.variants || {};

          // per-item price from backend totalPrice
          const perItemPrice =
            item.quantity && item.quantity > 0
              ? item.totalPrice / item.quantity
              : product.price || 0;

          return {
            _id: item._id,
            productId: product._id,
            title: product.title,
            image: product.image?.[0],
            price: perItemPrice, // price used in UI & totals
            originalPrice:
              product.price && product.price > perItemPrice
                ? product.price
                : null,
            quantity: item.quantity,
            variants: variants._id || null,
            size: variants.size || null,
            color: variants.color || null,
            
            // backend didn't send stock; set a safe default
            stock: product.stock || 99,
          };
        });

        setCartItems(mapped);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId?._id]);

  const updateQuantity = (id, newQantity) => {
    console.log(id)
    axios.patch(`${process.env.NEXT_PUBLIC_API}/cart/updatecart/${userId?._id}`, {
      product : id.productId,
      variant: id.variants,
      quantity: newQantity,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    // if (newQuantity < 1) return;

    // setCartItems((prev) =>
    //   prev.map((item) => {
    //     if (item._id === id) {
    //       if (newQuantity <= item.stock) {
    //         return { ...item, quantity: newQuantity };
    //       } else {
    //         alert(`Only ${item.stock} items available`);
    //         return item;
    //       }
    //     }
    //     return item;
    //   })
    // );

    // TODO: also send update to backend (PATCH cart quantity)
  };

  const removeItem = (id) => {
    axios
      .delete(`${process.env.NEXT_PUBLIC_API}/cart/deletecart/${id}`)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo({ code: "SAVE10", discount: 10 });
    } else if (promoCode.toUpperCase() === "SAVE20") {
      setAppliedPromo({ code: "SAVE20", discount: 20 });
    } else {
      alert("Invalid promo code");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  // Loading state (while fetching cart)
  if (loading) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loading your cart...
            </h2>
            <p className="text-gray-600">Please wait a moment.</p>
          </div>
        </Container>
      </section>
    );
  }

  // If cart is empty
  if (!cartItems.length) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start
                shopping to fill it up!
              </p>
              <Link
                href="/allproducts"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Totals based on mapped items
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <Container>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl shadow-md p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link href={`/product/${item._id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <Link
                        href={`/product/${item._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Variant Info */}
                    {(item.size || item.color) && (
                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
                        {item.size && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Product Item */}
                    {item.quantity && (
                      <span className="bg-gray-100 px-3 text-sm text-gray-600 py-1 rounded-full">
                        Item: {item.quantity}
                      </span>
                    )}

                    {/* Price and Quantity */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ৳{item.price.toFixed(2)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ৳{item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border-2 border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-red-600 mt-2">
                        Maximum quantity reached ({item.stock} available)
                      </p>
                    )}

                    {/* Item Total */}
                    <div className="mt-3 text-right">
                      <span className="text-sm text-gray-600">
                        Item Total:{" "}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Button */}
            <Link
              href="/allproducts"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    disabled={appliedPromo}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  {appliedPromo ? (
                    <button
                      onClick={removePromoCode}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <Tag className="w-4 h-4" />
                    <span>
                      {appliedPromo.code} applied - {appliedPromo.discount}% off
                    </span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.discount}%)</span>
                    <span className="font-medium">-৳{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Shipping
                    {shipping === 0 && (
                      <span className="text-xs text-green-600">(Free)</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `৳${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium">৳{tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-gray-900">
                  ৳{total.toFixed(2)}
                </span>
              </div>

              {/* Free Shipping Banner */}
              {subtotal < 50 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Add{" "}
                      <span className="font-bold">
                        ৳{(50 - subtotal).toFixed(2)}
                      </span>{" "}
                      more to get{" "}
                      <span className="font-bold">FREE shipping</span>!
                    </p>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 mb-4"
              >
                Proceed to Checkout
              </Link>

              {/* Security Icons */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Secure Checkout</p>
                <div className="flex justify-center gap-2 text-gray-400">
                  <span className="text-2xl">🔒</span>
                  <span className="text-2xl">💳</span>
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Page;
