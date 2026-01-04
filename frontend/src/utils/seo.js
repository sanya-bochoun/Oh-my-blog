/**
 * SEO Utility Functions
 * สำหรับจัดการ meta tags, Open Graph, และ structured data
 */

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://my-personal-blog-five.vercel.app';
const SITE_NAME = 'Oh!myBlog';
const DEFAULT_DESCRIPTION = 'Personal blog sharing thoughts, experiences, and knowledge';
const DEFAULT_IMAGE = `${SITE_URL}/logo.svg`;

/**
 * อัปเดต document title
 */
export const setTitle = (title) => {
  if (title) {
    document.title = `${title} | ${SITE_NAME}`;
  } else {
    document.title = SITE_NAME;
  }
};

/**
 * อัปเดต meta tag
 */
export const setMetaTag = (name, content, attribute = 'name') => {
  if (!content) return;
  
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * ลบ meta tag
 */
export const removeMetaTag = (name, attribute = 'name') => {
  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) {
    element.remove();
  }
};

/**
 * อัปเดต SEO meta tags สำหรับ article
 */
export const setArticleSEO = ({
  title,
  description,
  image,
  url,
  author,
  publishedTime,
  modifiedTime,
  tags = []
}) => {
  // Title
  setTitle(title);

  // Basic meta tags
  setMetaTag('description', description || DEFAULT_DESCRIPTION);
  setMetaTag('keywords', tags.join(', '));

  // Open Graph tags
  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description || DEFAULT_DESCRIPTION, 'property');
  setMetaTag('og:image', image || DEFAULT_IMAGE, 'property');
  setMetaTag('og:url', url || window.location.href, 'property');
  setMetaTag('og:type', 'article', 'property');
  setMetaTag('og:site_name', SITE_NAME, 'property');
  
  if (author) {
    setMetaTag('article:author', author, 'property');
  }
  if (publishedTime) {
    setMetaTag('article:published_time', publishedTime, 'property');
  }
  if (modifiedTime) {
    setMetaTag('article:modified_time', modifiedTime, 'property');
  }
  tags.forEach(tag => {
    setMetaTag('article:tag', tag, 'property');
  });

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description || DEFAULT_DESCRIPTION);
  setMetaTag('twitter:image', image || DEFAULT_IMAGE);
};

/**
 * อัปเดต SEO meta tags สำหรับ page ทั่วไป
 */
export const setPageSEO = ({
  title,
  description,
  image,
  url
}) => {
  setTitle(title);

  setMetaTag('description', description || DEFAULT_DESCRIPTION);

  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description || DEFAULT_DESCRIPTION, 'property');
  setMetaTag('og:image', image || DEFAULT_IMAGE, 'property');
  setMetaTag('og:url', url || window.location.href, 'property');
  setMetaTag('og:type', 'website', 'property');
  setMetaTag('og:site_name', SITE_NAME, 'property');

  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description || DEFAULT_DESCRIPTION);
  setMetaTag('twitter:image', image || DEFAULT_IMAGE);
};

/**
 * Reset SEO meta tags เป็นค่า default
 */
export const resetSEO = () => {
  setTitle(null);
  setMetaTag('description', DEFAULT_DESCRIPTION);
  setMetaTag('og:title', SITE_NAME, 'property');
  setMetaTag('og:description', DEFAULT_DESCRIPTION, 'property');
  setMetaTag('og:image', DEFAULT_IMAGE, 'property');
  setMetaTag('og:type', 'website', 'property');
  setMetaTag('twitter:card', 'summary');
  setMetaTag('twitter:title', SITE_NAME);
  setMetaTag('twitter:description', DEFAULT_DESCRIPTION);
};

/**
 * สร้าง JSON-LD structured data สำหรับ article
 */
export const generateArticleStructuredData = ({
  title,
  description,
  image,
  url,
  author,
  publishedTime,
  modifiedTime
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || DEFAULT_IMAGE,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
};

/**
 * เพิ่ม structured data script tag
 */
export const addStructuredData = (data) => {
  // ลบ script เดิมถ้ามี
  const existingScript = document.getElementById('structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = 'structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * ลบ structured data script tag
 */
export const removeStructuredData = () => {
  const script = document.getElementById('structured-data');
  if (script) {
    script.remove();
  }
};

