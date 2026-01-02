import React from 'react';
import defaultThumbnail from '../assets/default-thumbnail.jpg';

const BlogCard = ({
  slug,
  image,
  category,
  title,
  description,
  author,
  authorImage,
  date,
  onClick,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(slug);
  };

  const handleImageError = (e) => {
    if (e.target.src !== defaultThumbnail) {
      e.target.src = defaultThumbnail;
    }
  };

  return (
    <article className="blog-card" onClick={handleClick}>
      <div className="blog-card-image">
        <img 
          src={image || defaultThumbnail} 
          alt={title}
          onError={handleImageError}
        />
      </div>

      <div className="blog-card-content">
        <span className="blog-card-category">{category}</span>
        <h2 className="blog-card-title">{title}</h2>
        <p className="blog-card-description">{description}</p>

        <div className="blog-card-author">
          <img src={authorImage} alt={author} />
          <div>
            <p>{author}</p>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
