import React from 'react';
import aboutMeImg from '../assets/about_me/about-me.jpg';

function AboutMe() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] px-4 py-12 mt-15">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl flex flex-col items-center">
        {/* Local Profile Image */}
        <img
          src={aboutMeImg}
          alt="Sanya Bochoun"
          className="w-68 h-68 rounded-full object-cover mb-6 shadow"
        />
        <h1 className="text-3xl font-bold mb-2 text-center">Sanya Bochoun</h1>
        <h2 className="text-lg text-gray-600 mb-6 text-center">Full Stack Developer & Former Civil Engineer & App Master</h2>
        <p className="text-gray-700 text-base mb-4 text-left">
          Hello! My name is <b>Sanya Bochoun</b>. I started my career as a civil engineer, where I learned the importance of structure, precision, and problem-solving. After several years in the construction industry, I discovered my passion for technology and decided to transition into the world of software development.
        </p>
        <p className="text-gray-700 text-base mb-4 text-left">
          Today, I work as a <b>Full Stack Developer</b>, building modern web applications from the ground up. My engineering background helps me approach coding challenges with a unique perspective, focusing on both the big picture and the smallest details.
        </p>
        <p className="text-gray-700 text-base mb-4 text-left">
          I enjoy learning new technologies, collaborating with creative teams, and turning ideas into real products. Whether it's frontend, backend, or anything in between, I'm always excited to take on new challenges and grow as a developer.
        </p>
        <div className="mt-6 text-center flex flex-wrap justify-center gap-2">
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #CivilEngineerToCoder
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #FullStackDeveloper
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #ReactDeveloper
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #NextDeveloper
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #RestAPI
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
            #Techup
          </span>
        </div>
        {/* Share & Back to Home buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
          {/* Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              Share
            </button>
            <button
              onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href), '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595zm0 0"/></svg>
              Share
            </button>
            <button
              onClick={() => window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href), '_blank')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
              Share
            </button>
          </div>
          {/* Back to Home button */}
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutMe; 