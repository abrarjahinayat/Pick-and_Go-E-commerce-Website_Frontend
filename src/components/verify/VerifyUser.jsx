"use client"
import { userinfo } from '@/slices/userSlice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
const VerifyUser = ({children}) => {
      
    const dispatch = useDispatch()
    useEffect(()=>{
    const token = JSON.parse(localStorage.getItem('token'))

      axios.get(`${process.env.NEXT_PUBLIC_API}/auth/verifyuser`, {
        headers:{
            "token": token
        }
    }).then((res)=>{
        // console.log("User verified:", res.data)
        localStorage.setItem('token', JSON.stringify(res.data.token))
        dispatch(userinfo(res.data.data))
    }).catch((err)=>{
        console.error("User verification failed:", err)
    })
  
        },[])

  return (
    <div>{children}</div>
  )
}

export default VerifyUser