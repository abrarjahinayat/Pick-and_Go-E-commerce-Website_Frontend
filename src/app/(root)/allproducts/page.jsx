import Container from '@/components/common/Container'
import Products from '@/components/common/Products'
import React from 'react'


 async function gellAllProducts() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/products/allproducts`, { cache: 'no-store' })
    const data = await res.json()
    return data
  }

const page = async () => {

  let {data} = await gellAllProducts()


  return (
    <section className=" pb-10 bg-gradient-to-b from-gray-50 to-white">
      <Container>

       <h2 className="text-4xl text-center py-10 font-bold text-gray-900 mb-3">
            All Products
          </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

    {
      data?.map((item)=>(
        <Products product={item} key={item._id}/>
      ))
    }
      </div>
    </Container>

    
    </section>
  )
}

export default page