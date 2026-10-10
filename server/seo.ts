import type { Express } from "express";
import { SEO_BUSINESS, SEO_FAQS } from "../shared/seo-content";

interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  indexable: boolean;
  includeFaq: boolean;
}

const siteRoot = `${SEO_BUSINESS.siteUrl}/`;
const homeMetadata: PageMetadata = {
  title: SEO_BUSINESS.title,
  description: SEO_BUSINESS.descriptionAr,
  canonical: siteRoot,
  indexable: true,
  includeFaq: true,
};

function metadataForUrl(requestUrl: string): PageMetadata {
  const parsed = new URL(requestUrl, SEO_BUSINESS.siteUrl);
  const pathname =
    parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/+$/, "");

  if (pathname === "/" || pathname === "/menu") {
    return homeMetadata;
  }

  if (pathname === "/privacy") {
    return {
      title: "سياسة الخصوصية | إلوة كافيه – Elwa Coffee",
      description:
        "اطّلع على سياسة الخصوصية الخاصة بموقع إلوة كافيه وخدمات الطلب عبر الإنترنت.",
      canonical: `${SEO_BUSINESS.siteUrl}/privacy`,
      indexable: true,
      includeFaq: false,
    };
  }

  return {
    title: "Elwa Coffee | إلوة كافيه",
    description: SEO_BUSINESS.descriptionAr,
    canonical: `${SEO_BUSINESS.siteUrl}${pathname}`,
    indexable: false,
    includeFaq: false,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setMetaTag(
  html: string,
  attribute: "name" | "property",
  key: string,
  content: string,
): string {
  const escapedKey = escapeRegExp(key);
  const pattern = new RegExp(
    `<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`,
    "i",
  );
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}">`;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function buildStructuredData(metadata: PageMetadata) {
  const siteUrl = SEO_BUSINESS.siteUrl;
  const businessId = `${siteUrl}/#business`;
  const logoUrl = `${siteUrl}${SEO_BUSINESS.logoPath}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteRoot,
      name: SEO_BUSINESS.siteNameEn,
      alternateName: SEO_BUSINESS.siteNameAr,
      inLanguage: ["ar-SA", "en-SA"],
      publisher: { "@id": businessId },
    },
    {
      "@type": ["CafeOrCoffeeShop", "Organization"],
      "@id": businessId,
      name: SEO_BUSINESS.siteNameEn,
      alternateName: [
        SEO_BUSINESS.siteNameAr,
        SEO_BUSINESS.alternateNameEn,
      ],
      url: siteRoot,
      description: `${SEO_BUSINESS.descriptionAr} ${SEO_BUSINESS.descriptionEn}`,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
        width: 512,
        height: 512,
      },
      image: logoUrl,
      telephone: SEO_BUSINESS.branchPhoneE164,
      address: {
        "@type": "PostalAddress",
        streetAddress: "ج5921، بحره",
        addressLocality: "Bahrah",
        postalCode: "22826",
        addressCountry: "SA",
      },
      hasMap: SEO_BUSINESS.mapUrl,
      areaServed: {
        "@type": "Place",
        name: "Bahrah, Saudi Arabia",
      },
      servesCuisine: ["Coffee", "Espresso", "Specialty Coffee"],
      hasMenu: {
        "@type": "Menu",
        name: "Elwa Coffee Menu | قائمة إلوة",
        url: `${siteUrl}/menu`,
      },
      potentialAction: {
        "@type": "OrderAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/menu`,
          inLanguage: ["ar-SA", "en-SA"],
          actionPlatform: [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform",
          ],
        },
      },
    },
    {
      "@type": "WebPage",
      "@id": `${metadata.canonical}#webpage`,
      url: metadata.canonical,
      name: metadata.title,
      description: metadata.description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": businessId },
      inLanguage: "ar-SA",
    },
  ];

  if (metadata.includeFaq) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${siteRoot}#faq`,
      url: siteRoot,
      inLanguage: "ar-SA",
      mainEntity: SEO_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.questionAr,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answerAr,
        },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function injectSeoMetadata(html: string, requestUrl: string): string {
  const metadata = metadataForUrl(requestUrl);
  let output = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(metadata.title)}</title>`,
  );

  const robots = metadata.indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, follow";
  const logoUrl = `${SEO_BUSINESS.siteUrl}${SEO_BUSINESS.logoPath}`;

  for (const [attribute, key, content] of [
    ["name", "title", metadata.title],
    ["name", "description", metadata.description],
    ["name", "robots", robots],
    ["property", "og:title", metadata.title],
    ["property", "og:description", metadata.description],
    ["property", "og:url", metadata.canonical],
    ["property", "og:image", logoUrl],
    ["property", "og:image:alt", `${SEO_BUSINESS.siteNameEn} logo`],
    ["name", "twitter:title", metadata.title],
    ["name", "twitter:description", metadata.description],
    ["name", "twitter:url", metadata.canonical],
    ["name", "twitter:image", logoUrl],
    ["name", "twitter:image:alt", `${SEO_BUSINESS.siteNameEn} logo`],
  ] as const) {
    output = setMetaTag(output, attribute, key, content);
  }

  const canonicalTag = `<link rel="canonical" href="${escapeHtml(metadata.canonical)}">`;
  const canonicalPattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  output = canonicalPattern.test(output)
    ? output.replace(canonicalPattern, canonicalTag)
    : output.replace(/<\/head>/i, `    ${canonicalTag}\n  </head>`);

  const jsonLd = JSON.stringify(buildStructuredData(metadata))
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  const schemaTag = `<script type="application/ld+json" id="elwa-seo-jsonld">${jsonLd}</script>`;
  const schemaPattern =
    /<script\b(?=[^>]*\bid=["']elwa-seo-jsonld["'])[^>]*>[\s\S]*?<\/script>/i;
  output = schemaPattern.test(output)
    ? output.replace(schemaPattern, schemaTag)
    : output.replace(/<\/head>/i, `    ${schemaTag}\n  </head>`);

  return output;
}

export function registerSeoRoutes(app: Express): void {
  const cacheHeaders = { "Cache-Control": "public, max-age=3600" };
  const robotsText = `User-agent: *
Allow: /

Sitemap: ${SEO_BUSINESS.siteUrl}/sitemap.xml
`;
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteRoot}</loc></url>
  <url><loc>${SEO_BUSINESS.siteUrl}/privacy</loc></url>
</urlset>
`;
  const llmsText = `# ${SEO_BUSINESS.siteNameEn} (${SEO_BUSINESS.siteNameAr})

> Specialty coffee cafe in Bahrah, Saudi Arabia.

## Official information
- Location: ${SEO_BUSINESS.branchAddressEn}, Saudi Arabia
- Menu and online ordering: ${SEO_BUSINESS.siteUrl}/menu
- Branch directions: ${SEO_BUSINESS.mapUrl}
- Branch phone: ${SEO_BUSINESS.branchPhoneDisplay}

## Common questions
${SEO_FAQS.map((faq) => `- ${faq.questionEn} ${faq.answerEn}`).join("\n")}
`;

  app.get("/robots.txt", (_req, res) => {
    res.set({ ...cacheHeaders, "Content-Type": "text/plain; charset=utf-8" });
    res.send(robotsText);
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.set({ ...cacheHeaders, "Content-Type": "application/xml; charset=utf-8" });
    res.send(sitemapXml);
  });

  app.get("/llms.txt", (_req, res) => {
    res.set({ ...cacheHeaders, "Content-Type": "text/plain; charset=utf-8" });
    res.send(llmsText);
  });
}
