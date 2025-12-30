import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ArticleCard = ({ article }) => {
  return (
    <Link to={`/article/${article.slug}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
        {/* Thumbnail Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.thumbnail_image || '/default-article-image.jpg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-emerald-400 text-white px-3 py-1 rounded-full text-sm">
              {article.Category?.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
            {article.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {article.introduction}
          </p>

          {/* Meta Information */}
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center">
              <img
                src={article.Author?.avatar_url || '/default-avatar.png'}
                alt={article.Author?.username}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{article.Author?.username}</span>
            </div>
            <span className="mx-2">•</span>
            <time>{format(new Date(article.created_at), 'MMM d, yyyy')}</time>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard; 