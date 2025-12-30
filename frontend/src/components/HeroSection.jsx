import React from "react";
import defaultHeroImage from "../assets/hero-sec.jpg";

const HeroSection = () => {
  const heroImage = defaultHeroImage;
  const authorLabel = "-Author";
  const authorName = "Sanya B.";
  const authorBio =
    "I'm a full-stack app developer and avid football fan with a soft spot for dogs and cats. Whether I'm coding the next great mobile experience, exploring new travel destinations, or tinkering with cutting-edge technology, I bring the same passion and curiosity to everything I do";
  const authorExtraBio =
    "As an app developer and football aficionado, I fuse creativity with logic in every project. Off the clock, I'm hiking new trails with my dog, curled up reading about cat behavior, or testing out the newest gadgets.";

  return (
    <section className="hero-section flex flex-col justify-start items-center min-h-screen w-full">
      <div className="hero-container w-[375px] md:w-full sm:container mx-auto">
        <div className="hero-content w-full px-4 md:px-6 lg:px-8">
          <div className="hero-content-wrapper flex flex-col md:flex-row items-center justify-between w-full gap-[16px] md:gap-[48px] md:mt-[100px]">
            <article className="hero-text-section flex flex-col justify-center w-full md:w-1/3 mt-[52px] md:mt-[60px]">
              <div className="hero-text-card bg-[#F9F8F8] rounded-lg p-[16px] md:p-6 text-right w-full">
                <div className="title-container h-[96px] md:h-auto">
                  <h1 className="hero-title font-semibold text-[#26231E] text-center md:text-right"> 
                    <span className="block font-bold text-[44px] sm:text-[56px] md:text-[65px] leading-tight mb-4 text-left md:text-right">Stay</span>
                    <span className="block font-semibold text-[22px] sm:text-[32px] md:text-[40px] leading-tight mb-6 text-left md:text-right">Curious,<br/> Stay Motivated</span>
                  </h1>
                </div>
                {/* Mobile subtitle (ขึ้นบรรทัดใหม่ตามที่ต้องการ) */}
                <p className="hero-subtitle mt-10 sm:hidden md:text-right text-gray-500 text-[15px] text-left pl-0"> 
                  Unlock Endless Insights<br/>
                  at Your Fingertips—Your Daily<br/>
                  Spark of Inspiration and Knowledge
                </p>
                {/* Desktop/Tablet subtitle (เดิม) */}
                <p className="hero-subtitle hidden sm:block mt-6 md:text-right px-2 text-gray-500 text-[17px] text-left"> 
                  Unlock Endless Insights <br/>
                  at Your Fingertips—Your Daily <br/>
                  Spark of Inspiration and Knowledge.
                </p>
              </div>
            </article>

            {/* Center Section - Image */}
            <figure className="hero-image-wrapper flex items-center justify-center w-full md:w-1/3 mt-0 md:mt-[60px]">
              <div className="hero-image-container relative bg-[#FFFFFF] rounded-2xl overflow-hidden w-[343px] h-[470px] md:w-[386px] md:h-[529px]">
                <img
                  src={heroImage}
                  alt="Hero"
                  className="hero-image w-full h-full object-cover rounded-2xl"
                />
                <div className="hero-image-overlay absolute inset-0 bg-[#BEBBB1] opacity-25 rounded-2xl"></div>
              </div>
            </figure>

            {/* Right Section - Author Bio */}
            <aside className="author-section flex flex-col justify-center w-full md:w-1/3 pb-[24px] md:pb-0 mt-4 md:mt-[60px]">
              <div className="author-card bg-[#F9F8F8] rounded-lg p-[16px] md:p-6 text-left w-full">
                <div className="author-label-wrapper flex items-start mb-2">
                  <span className="author-label font-medium text-[#75716B] text-left text-[12px] leading-[20px] h-[20px]">
                    {authorLabel}
                  </span>
                </div>
                
                <h3 className="author-name font-semibold text-[#26231E] text-[24px] leading-[32px] text-left mb-3">
                  {authorName}
                </h3>
                
                <div className="author-bio-container">
                  <p className="author-bio font-medium text-[#75716B] text-[16px] leading-[24px] text-left">
                    {authorBio}
                  </p>
                  <p className="author-bio-extra font-medium text-[#75716B] text-[16px] leading-[24px] text-left mt-4">
                    {authorExtraBio}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
