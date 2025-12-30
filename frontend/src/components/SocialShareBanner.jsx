import React, { useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { HiOutlineClipboard, HiOutlineClipboardCheck } from 'react-icons/hi';
import { AiOutlineLike, AiFillLike } from 'react-icons/ai';
import { toast } from 'sonner';
import { FaCheck } from 'react-icons/fa';

const SocialShareBanner = ({ likes = 0, url }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md bg-[#25c964] text-white shadow-lg rounded-lg pointer-events-auto flex items-center`}
          style={{ 
            borderRadius: '0.75rem',
            padding: '12px 16px',
            minWidth: '300px'
          }}
        >
          <div className="flex-1 flex items-start ">
            <FaCheck className="mr-2 mt-1" />
            <div>
              <div className="font-medium text-white text-left ">Copied!</div>
              <div className="text-sm text-white text-left whitespace-nowrap">This article has been copied to your clipboard.</div>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-6 h-6 flex items-center justify-center text-white"
          >
            ×
          </button>
        </div>
      ));
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between h-auto lg:h-20 p-4 border-t border-b border-gray-200 bg-[#f0efeb] rounded-2xl">
      <button 
        onClick={handleLike}
        className="flex items-center justify-center gap-[6px] px-6 py-2 bg-white rounded-[999px] border border-[#brown/white] h-[48px] w-full lg:w-auto mb-3 lg:mb-0 cursor-pointer"
      >
        {isLiked ? <AiFillLike className="text-blue-500 text-xl" /> : <AiOutlineLike className="text-xl" />}
        <span className="text-gray-700">{likeCount}</span>
      </button>

      <div className="flex items-center gap-3">
        <button 
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-[6px] h-[48px] px-6 py-2 bg-white rounded-[999px] border border-[#brown/white] min-w-[135px] lg:w-[185px] cursor-pointer"
        >
          <div className="flex items-center gap-1">
            {isCopied ? <HiOutlineClipboardCheck className="text-green-500 text-xl" /> : <HiOutlineClipboard className="text-xl" />}
            <span className="text-gray-700 whitespace-nowrap">Copy link</span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center h-[48px] w-[48px] rounded-full bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            <FaFacebookF className="h-5 w-5" />
          </button>
          <button 
            onClick={() => handleShare('linkedin')}
            className="flex items-center justify-center h-[48px] w-[48px] rounded-full bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
          >
            <FaLinkedinIn className="h-5 w-5" />
          </button>
          <button 
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center h-[48px] w-[48px] rounded-full bg-blue-400 text-white hover:bg-blue-500 cursor-pointer"
          >
            <FaTwitter className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialShareBanner; 