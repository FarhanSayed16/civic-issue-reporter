// src/components/CategoriesBar.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const categories = [
  { value: "web-development",     label: "Web Development" },
  { value: "graphic-design",      label: "Graphic Design" },
  { value: "writing-translation", label: "Writing & Translation" },
  { value: "digital-marketing",   label: "Digital Marketing" },
  { value: "video-animation",     label: "Video & Animation" },
  { value: "music-audio",         label: "Music & Audio" },
  { value: "programming-tech",    label: "Programming & Tech" },
  { value: "business",            label: "Business" },
  { value: "lifestyle",           label: "Lifestyle" },
  // …add more here if needed
];

export default function CategoriesBar() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleClick = (cat) => {
    navigate(`/gigs?category=${encodeURIComponent(cat)}`);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 200; // adjust as needed
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative bg-white shadow-sm py-2">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 h-[100%] bg-white hover:bg-gray-100"
        aria-label="Scroll left"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {/* Categories container */}
      <div
        ref={containerRef}
        className="mx-8 flex space-x-3 overflow-hidden"
      >
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
            className="flex-shrink-0 px-4 py-2 border rounded-full text-sm font-medium hover:bg-blue-200 transition-all duration-300"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 h-[100%] bg-white hover:bg-gray-100"
        aria-label="Scroll right"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
