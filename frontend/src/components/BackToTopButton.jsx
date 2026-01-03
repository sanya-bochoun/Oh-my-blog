import React, { useState, useEffect } from "react";

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // เช็คการเลื่อนหน้า
  useEffect(() => {
    const toggleVisibility = () => {
      // แสดงปุ่มเมื่อเลื่อนลงมาเกิน 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // ฟังก์ชันเลื่อนกลับไปด้านบน
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#26231E] hover:bg-[#464440] text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 cursor-pointer"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}

export default BackToTopButton;
