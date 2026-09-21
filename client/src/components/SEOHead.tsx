import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  keywords,
  image = '/og-image.jpg',
  imageWidth,
  imageHeight,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  siteName = 'FitFusion',
  noIndex = false
}: SEOHeadProps) {
  const { i18n } = useTranslation();
  const [location] = useLocation();

  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const baseUrl = window.location.origin;
    const currentPath = location;

    const cleanUrl = new URL(currentPath, baseUrl);
    cleanUrl.search = '';
    cleanUrl.hash = '';
    const canonicalUrl = cleanUrl.toString();

    const buildAlternateUrl = (lang: string) => {
      const url = new URL(currentPath, baseUrl);
      url.search = '';
      url.hash = '';
      url.searchParams.set('lang', lang);
      return url.toString();
    };

    document.documentElement.lang = currentLang;

    if (title) {
      document.title = title;
    }

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }

    let existingDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (!existingDescription) {
        existingDescription = document.createElement('meta');
        existingDescription.setAttribute('name', 'description');
        document.head.appendChild(existingDescription);
      }
      existingDescription.setAttribute('content', description);
    }

    if (keywords) {
      let existingKeywords = document.querySelector('meta[name="keywords"]');
      if (!existingKeywords) {
        existingKeywords = document.createElement('meta');
        existingKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(existingKeywords);
      }
      existingKeywords.setAttribute('content', keywords);
    }

    const existingHreflangs = document.querySelectorAll('link[rel="alternate"]:not([type="application/rss+xml"]), link[rel="canonical"]');
    existingHreflangs.forEach(link => link.remove());

    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', canonicalUrl);
    document.head.appendChild(canonical);

    const languages = ['en', 'hu', 'es'];
    languages.forEach(lang => {
      const hreflang = document.createElement('link');
      hreflang.setAttribute('rel', 'alternate');
      hreflang.setAttribute('hreflang', lang);
      hreflang.setAttribute('href', buildAlternateUrl(lang));
      document.head.appendChild(hreflang);
    });

    const xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    xDefault.setAttribute('href', buildAlternateUrl('en'));
    document.head.appendChild(xDefault);

    let ogLocale = document.querySelector('meta[property="og:locale"]');
    if (!ogLocale) {
      ogLocale = document.createElement('meta');
      ogLocale.setAttribute('property', 'og:locale');
      document.head.appendChild(ogLocale);
    }
    ogLocale.setAttribute('content', currentLang === 'hu' ? 'hu_HU' : currentLang === 'es' ? 'es_ES' : 'en_US');

    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', title);
    }

    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);
    }

    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement('meta');
      ogType.setAttribute('property', 'og:type');
      document.head.appendChild(ogType);
    }
    ogType.setAttribute('content', type);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);

    let ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteName) {
      ogSiteName = document.createElement('meta');
      ogSiteName.setAttribute('property', 'og:site_name');
      document.head.appendChild(ogSiteName);
    }
    ogSiteName.setAttribute('content', siteName);

    const existingOgImage = document.querySelector('meta[property="og:image"]');
    const existingOgImageWidth = document.querySelector('meta[property="og:image:width"]');
    const existingOgImageHeight = document.querySelector('meta[property="og:image:height"]');

    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

      let ogImage = existingOgImage;
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', fullImageUrl);

      // Only emit dimension metas when they are actually known — wrong
      // values are worse than none. The default og-image.jpg is 896x584.
      const dims =
        imageWidth && imageHeight
          ? { width: imageWidth, height: imageHeight }
          : image === '/og-image.jpg'
            ? { width: 896, height: 584 }
            : null;

      if (dims) {
        let ogImageWidth = existingOgImageWidth;
        if (!ogImageWidth) {
          ogImageWidth = document.createElement('meta');
          ogImageWidth.setAttribute('property', 'og:image:width');
          document.head.appendChild(ogImageWidth);
        }
        ogImageWidth.setAttribute('content', String(dims.width));

        let ogImageHeight = existingOgImageHeight;
        if (!ogImageHeight) {
          ogImageHeight = document.createElement('meta');
          ogImageHeight.setAttribute('property', 'og:image:height');
          document.head.appendChild(ogImageHeight);
        }
        ogImageHeight.setAttribute('content', String(dims.height));
      } else {
        if (existingOgImageWidth) existingOgImageWidth.remove();
        if (existingOgImageHeight) existingOgImageHeight.remove();
      }
    } else {
      if (existingOgImage) existingOgImage.remove();
      if (existingOgImageWidth) existingOgImageWidth.remove();
      if (existingOgImageHeight) existingOgImageHeight.remove();
    }

    if (type === 'article') {
      if (author) {
        let articleAuthor = document.querySelector('meta[property="article:author"]');
        if (!articleAuthor) {
          articleAuthor = document.createElement('meta');
          articleAuthor.setAttribute('property', 'article:author');
          document.head.appendChild(articleAuthor);
        }
        articleAuthor.setAttribute('content', author);
      }

      if (publishedTime) {
        let articlePublished = document.querySelector('meta[property="article:published_time"]');
        if (!articlePublished) {
          articlePublished = document.createElement('meta');
          articlePublished.setAttribute('property', 'article:published_time');
          document.head.appendChild(articlePublished);
        }
        articlePublished.setAttribute('content', publishedTime);
      }

      const existingModified = document.querySelector('meta[property="article:modified_time"]');
      if (modifiedTime) {
        let articleModified = existingModified;
        if (!articleModified) {
          articleModified = document.createElement('meta');
          articleModified.setAttribute('property', 'article:modified_time');
          document.head.appendChild(articleModified);
        }
        articleModified.setAttribute('content', modifiedTime);
      } else if (existingModified) {
        existingModified.remove();
      }
    }

    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', image ? 'summary_large_image' : 'summary');

    let twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (!twitterUrl) {
      twitterUrl = document.createElement('meta');
      twitterUrl.setAttribute('name', 'twitter:url');
      document.head.appendChild(twitterUrl);
    }
    twitterUrl.setAttribute('content', canonicalUrl);

    if (title) {
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', title);
    }

    if (description) {
      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }
      twitterDescription.setAttribute('content', description);
    }

    const existingTwitterImage = document.querySelector('meta[name="twitter:image"]');

    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
      let twitterImage = existingTwitterImage;
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute('content', fullImageUrl);
    } else {
      if (existingTwitterImage) existingTwitterImage.remove();
    }
  }, [i18n.language, location, title, description, keywords, image, imageWidth, imageHeight, type, author, publishedTime, modifiedTime, siteName, noIndex]);

  return null;
}
