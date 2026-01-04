# SEO Optimization Guide

## Overview
เอกสารนี้อธิบายเกี่ยวกับ SEO optimization features ที่มีในระบบ

## Frontend SEO Utilities

### Location
`frontend/src/utils/seo.js`

### Functions Available

#### `setArticleSEO(options)`
อัปเดต SEO meta tags สำหรับ article page

**Parameters:**
- `title` (string, required): Article title
- `description` (string, optional): Article description/excerpt
- `image` (string, optional): Article thumbnail image URL
- `url` (string, optional): Article URL
- `author` (string, optional): Author name
- `publishedTime` (string, optional): ISO 8601 date string
- `modifiedTime` (string, optional): ISO 8601 date string
- `tags` (array, optional): Array of tag strings

**Example:**
```javascript
import { setArticleSEO } from '../utils/seo';

setArticleSEO({
  title: 'My Article Title',
  description: 'Article description here',
  image: 'https://example.com/image.jpg',
  url: window.location.href,
  author: 'John Doe',
  publishedTime: '2024-01-01T00:00:00Z',
  modifiedTime: '2024-01-02T00:00:00Z',
  tags: ['technology', 'web development']
});
```

#### `setPageSEO(options)`
อัปเดต SEO meta tags สำหรับ page ทั่วไป

**Parameters:**
- `title` (string, required): Page title
- `description` (string, optional): Page description
- `image` (string, optional): Page image URL
- `url` (string, optional): Page URL

#### `setTitle(title)`
อัปเดต document title

#### `resetSEO()`
Reset SEO meta tags เป็นค่า default

#### `generateArticleStructuredData(options)`
สร้าง JSON-LD structured data สำหรับ article

#### `addStructuredData(data)`
เพิ่ม structured data script tag ไปยัง document head

#### `removeStructuredData()`
ลบ structured data script tag

## Usage in React Components

### Example: Article Detail Page

```javascript
import { useEffect } from 'react';
import { setArticleSEO, generateArticleStructuredData, addStructuredData, removeStructuredData } from '../utils/seo';

function ArticleDetail({ article }) {
  useEffect(() => {
    if (article) {
      // Set SEO meta tags
      setArticleSEO({
        title: article.title,
        description: article.excerpt || article.introduction,
        image: article.thumbnail_url || article.featured_image,
        url: window.location.href,
        author: article.author_name,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        tags: article.tags || []
      });

      // Add structured data
      const structuredData = generateArticleStructuredData({
        title: article.title,
        description: article.excerpt || article.introduction,
        image: article.thumbnail_url || article.featured_image,
        url: window.location.href,
        author: article.author_name,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at
      });
      addStructuredData(structuredData);
    }

    // Cleanup
    return () => {
      removeStructuredData();
    };
  }, [article]);

  return (
    // Your component JSX
  );
}
```

## Meta Tags Generated

### Basic Meta Tags
- `description`: Page/article description
- `keywords`: Comma-separated keywords/tags

### Open Graph Tags
- `og:title`: Title
- `og:description`: Description
- `og:image`: Image URL
- `og:url`: Page URL
- `og:type`: Type (article or website)
- `og:site_name`: Site name
- `article:author`: Author name (for articles)
- `article:published_time`: Published date (for articles)
- `article:modified_time`: Modified date (for articles)
- `article:tag`: Tags (for articles, multiple tags)

### Twitter Card Tags
- `twitter:card`: Card type (summary_large_image)
- `twitter:title`: Title
- `twitter:description`: Description
- `twitter:image`: Image URL

## Structured Data (JSON-LD)

ระบบสร้าง JSON-LD structured data ตาม Schema.org Article schema เพื่อช่วยให้ search engines เข้าใจ content ได้ดีขึ้น

## Environment Variables

ตั้งค่าใน `.env` file:
```
VITE_APP_URL=https://your-domain.com
```

## Best Practices

1. **Always set SEO tags when component mounts**
   - ใช้ `useEffect` เพื่อ set SEO tags เมื่อ component mount

2. **Cleanup on unmount**
   - Reset SEO tags หรือ remove structured data เมื่อ component unmount

3. **Use appropriate descriptions**
   - ใช้ excerpt หรือ introduction สำหรับ description
   - จำกัดความยาวประมาณ 150-160 characters

4. **Provide images**
   - ใช้ thumbnail_url หรือ featured_image
   - ขนาดแนะนำ: 1200x630px สำหรับ Open Graph

5. **Use proper date formats**
   - ใช้ ISO 8601 format สำหรับ dates (YYYY-MM-DDTHH:mm:ssZ)

## Testing

### Facebook Debugger
https://developers.facebook.com/tools/debug/

### Twitter Card Validator
https://cards-dev.twitter.com/validator

### Google Rich Results Test
https://search.google.com/test/rich-results

## Future Enhancements

1. **react-helmet Integration**
   - พิจารณาใช้ react-helmet หรือ react-helmet-async สำหรับการจัดการ meta tags ที่ดีขึ้น

2. **Sitemap Generation**
   - เพิ่ม sitemap.xml generation

3. **Robots.txt**
   - เพิ่ม robots.txt configuration

4. **Canonical URLs**
   - เพิ่ม canonical URLs สำหรับทุก page

