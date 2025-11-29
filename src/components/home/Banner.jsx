"use client";
import React, { useState, useEffect } from "react";
import Container from "../common/Container";
import axios from "axios";
import Slider from "react-slick";

const Banner = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API}/banner/getallbanner`)
      .then((res) => {
        setBanners(res?.data?.data ?? []);
        // console.log("Banners:", res?.data?.data);
      })
      .catch((err) => {
        console.error("Banner Load Error:", err);
      });
  }, []);

  // Slick slider settings
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    arrows: true,
    cssEase: "ease-in-out",
  };

  return (
    <section className="my-6">
      <Container>
        <Slider {...settings}>
          {banners.map((item) => (
            <div key={item._id} className="w-full">
              <img
                src={item.image}
                alt="banner"
                className="w-full h-[500px] object-cover rounded-xl object-cover"
              />
            </div>
          ))}
        </Slider>
      </Container>
    </section>
  );
};

export default Banner;
