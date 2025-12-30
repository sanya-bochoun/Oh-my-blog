import React from 'react';
import { Link } from 'react-router-dom';

const SearchDropdown = ({ results, isVisible, onSelect }) => {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className="absolute z-10 w-full bg-white shadow-lg rounded-lg mt-1 overflow-hidden border border-gray-200">
      <ul className="divide-y divide-gray-200">
        {results.map(result => (
          <li 
            key={result.id}
            className="p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(result.slug)}
          >
            <Link to={`/article/${result.slug}`} className="block">
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900">{result.title}</span>
                <span className="text-sm text-gray-500 truncate">{result.description}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDropdown; 