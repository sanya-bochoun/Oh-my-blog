import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ContactMe() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // สามารถเพิ่มฟังก์ชันส่งอีเมลหรือ API ได้ที่นี่
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Contact Me</h1>
        {submitted ? (
          <>
            <div className="text-green-600 text-center font-medium mb-6">Thank you for reaching out! I will get back to you as soon as possible.</div>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-2"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-left">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-left">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-left">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="Write your message here..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Send Message
              </button>
            </form>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mt-4"
            >
              Back to Home
            </button>
          </>
        )}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <div>Or email me at <a href="mailto:sbeak@email.com" className="text-blue-600 underline">sbeakjib@gmail.com</a></div>
        </div>
      </div>
    </div>
  );
}

export default ContactMe; 