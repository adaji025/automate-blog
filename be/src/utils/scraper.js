const axios = require("axios");
const googleNewsScraper = require("google-news-scraper");
const { uploadImage } = require("./utils");
const BlogPost = require("../models/admin/BlogPost");
const generateSitemap = require("../sitemap");
const { jsonrepair } = require("jsonrepair");

const { OpenAI } = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const DATAFORSEO_USERNAME = process.env.DATAFORSEO_USERNAME;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const currentYear = new Date().getFullYear();

// Change Set to Map for storing terms with timestamps
const recentSearchTerms = new Map(); // Changed from Set to Map
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper function for exponential backoff retry
async function retryRequest(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, delay * 2 ** i));
    }
  }
}

const searchTerms = [
  // SaaS & Cloud
  "SaaS platform innovations news",
  "Cloud infrastructure developments",
  "SaaS pricing strategies trends",
  "Cloud computing security updates",
  "SaaS market growth news",
  "Enterprise cloud solutions trends",
  "SaaS startup funding news",
  "Cloud technology breakthroughs",
  "SaaS industry acquisitions",
  "Cloud-native development news",

  // Mobile Development
  "Mobile app development trends",
  "iOS development innovations",
  "Android app technology news",
  "Cross-platform development tools",
  "Mobile app security updates",
  "App monetization strategies",
  "Mobile UX design trends",
  "App development frameworks news",
  "Mobile app testing innovations",
  "Progressive web apps trends",

  // AI & Machine Learning
  "AI app development news",
  "Machine learning solutions trends",
  "AI business automation news",
  "Artificial intelligence startups",
  "AI development tools updates",
  "Machine learning platforms news",
  "AI integration solutions",
  "Conversational AI trends",
  "AI technology innovations",
  "Machine learning applications",

  // Web Development
  "Web application security news",
  "Web development frameworks",
  "Frontend development trends",
  "Backend technology updates",
  "Web performance optimization",
  "Web development tools news",
  "Full-stack development trends",
  "Web accessibility standards",
  "Web development automation",
  "Modern web architecture",

  // Enterprise Software
  "Enterprise software trends",
  "Business process automation",
  "Digital transformation news",
  "Enterprise technology updates",
  "Corporate software solutions",
  "Enterprise app development",
  "Business software innovations",
  "Enterprise system integration",
  "Corporate digital solutions",
  "Enterprise tech adoption",

  // Development Practices
  "Agile development methods",
  "DevOps practices trends",
  "Software testing innovations",
  "Code quality standards",
  "Development workflow tools",
  "Software architecture patterns",
  "Development team management",
  "Technical debt solutions",
  "Software deployment strategies",
  "Development productivity tools",

  // Startup & Business
  "Tech startup trends",
  "Software business strategies",
  "Tech industry investments",
  "Software market analysis",
  "Tech company acquisitions",
  "Software industry news",
  "Tech entrepreneurship trends",
  "Software business models",
  "Tech startup funding",
  "Software market dynamics",

  // Security & Compliance
  "Cybersecurity solutions news",
  "Data protection regulations",
  "Security compliance updates",
  "Privacy technology trends",
  "Security framework innovations",
  "Compliance software tools",
  "Data security strategies",
  "Privacy protection methods",
  "Security protocol updates",
  "Compliance technology news",

  // User Experience
  "UX design innovations",
  "User interface trends",
  "Digital experience platforms",
  "User research methods",
  "Interface design tools",
  "UX technology updates",
  "Digital interaction trends",
  "User engagement strategies",
  "Experience design news",
  "Interface testing tools",

  // Technology Innovation
  "Software innovation trends",
  "Tech breakthrough news",
  "Digital innovation updates",
  "Technology advancement news",
  "Software evolution trends",
  "Tech transformation news",
  "Digital disruption updates",
  "Innovation strategy news",
  "Technology future trends",
  "Digital innovation methods",
];

// Modified function to get random search term
function getUniqueSearchTerm() {
  // Clean up old terms from cache
  const now = Date.now();
  for (const [term, timestamp] of recentSearchTerms.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      recentSearchTerms.delete(term);
    }
  }

  // Filter out recently used terms
  const availableTerms = searchTerms.filter(
    (term) => !recentSearchTerms.has(term)
  );

  // If all terms were used recently, clear the cache
  if (availableTerms.length === 0) {
    recentSearchTerms.clear();
    const randomTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];
    recentSearchTerms.set(randomTerm, Date.now());
    return randomTerm;
  }

  // Select and cache a random term from available ones
  const selectedTerm =
    availableTerms[Math.floor(Math.random() * availableTerms.length)];
  recentSearchTerms.set(selectedTerm, Date.now());
  return selectedTerm;
}

// Modify fetchAINews to use the new function
async function fetchAINews() {
  try {
    const searchTerm = getUniqueSearchTerm();
    const articles = await googleNewsScraper({
      searchTerm,
      timeframe: "1d",
      limit: 2,
      prettyURLs: true,
      getArticleContent: false,
      puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    return articles.filter((a) => a.title && a.link);
  } catch (error) {
    console.error("Error fetching AI news:", error);
    return [];
  }
}

// Step 2: Analyze and Filter Top 5 Articles
async function filterTopArticles(articles) {
  if (!articles.length) return [];
  try {
    const response = await retryRequest(() =>
      axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-5-nano",
          messages: [
            {
              role: "system",
              content: `From the following list of articles, select the top 5 most trending AI news articles based on relevance, uniqueness, and engagement potential. Return the result as a JSON array containing the full article objects. Here are the articles: ${JSON.stringify(
                articles
              )}`,
            },
          ],
          response_format: { type: "json_object" }, // Optional: enforce JSON response if supported by the API
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
      )
    );

    // Parse the response content
    const content = response.data.choices[0].message.content;
    let topArticles;
    try {
      topArticles = JSON.parse(content);
    } catch {
      console.error("Response is not valid JSON:", content);
      // Fallback: If parsing fails, assume the response might be plain text and return the first 5 articles
      return articles.slice(0, 1);
    }

    // Ensure the response is an array and contains valid articles
    if (!Array.isArray(topArticles)) {
      console.error("Expected an array, got:", topArticles);
      return articles.slice(0, 1);
    }

    return topArticles.slice(0, 1); // Ensure we only return 5 articles
  } catch (error) {
    console.error("Error filtering articles:", error);
    return articles.slice(0, 1); // Fallback to top 5 unfiltered articles
  }
}

// Step 3: Enrich Data Using Perplexity API
async function enrichWithPerplexity(article) {
  try {
    const response = await retryRequest(() =>
      axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "sonar-pro",
          messages: [
            {
              role: "system",
              content: `You are an expert tech blogger, specializing in technology, SaaS, software, web, programming, mobile, AI, and machine learning, especially as they relate to helping SaaS founders launch and scale their own products. All your articles are at least 2,500 words and are published as Blog Articles or Founders Tutorials on behalf of the company.

You write highly engaging, timely, and story-driven articles using the latest, most relevant news provided by us. Each article must:

- Be directly based on the specific news item(s) supplied.
- Reference recent events, product updates, or industry shifts (mention product names, version numbers, or real-world terms when possible).
- Include a clear 'news hook' or 'change angle'—highlight what's new, changing, or controversial about the topic.
- Frame the headline and content as a story, comparison, or bold opinion (e.g., "Why [X] is Overtaking [Y] in 2024", "OpenAI's Supply Crunch: What It Means for SaaS").
- Avoid generic buzzwords and summary-only content; instead, add unique angles, predictions, or actionable insights.
- Weave our targeted keywords organically into the article.
- Be informative, actionable, and directly relevant for SaaS founders looking to learn, be inspired, or act on the news.
- Be written in a casual, engaging style: conversational, using first-person perspective ("I", "we", "my experience"), with personal company anecdotes or insights where appropriate.
- Use occasional humor, relatable industry examples, and clear, practical advice.
- Always reference or connect back to the news article provided, demonstrating its relevance to SaaS founders and the broader SaaS industry.

IMPORTANT CONTENT UNIQUENESS RULES:
1. Never use generic or common phrases that appear in many other articles
2. Create unique analogies and examples specific to the topic
3. Include original insights and perspectives not commonly found elsewhere
4. Use varied sentence structures and paragraph lengths
5. Incorporate real-world case studies and specific examples
6. Add unique data points or statistics when relevant
7. Create custom scenarios and hypothetical situations
8. Use industry-specific terminology in novel ways
9. Include original metaphors and comparisons
10. Develop unique frameworks or methodologies

You are writing on behalf Bles Software (as a founder and article writer) sharing valuable insights, and your aim is to make even complex news approachable, exciting, and actionable for SaaS entrepreneurs that want to build new SaaS software for building new businesses.

Return only valid JSON without any prefixes or explanations. Your response must be a single JSON object containing enrichedTitle and enrichedContent fields. Only update year references (like changing "2024" to "${currentYear}") when they appear in the original article. Don't force year mentions if they're not relevant to the content.

IMPORTANT: The enriched content field response MUST BE BETWEEN 2350 and 3450 WORDS, EXCLUDING HTML TAGS. This is a hard requirement. If the content is less than 2350 words and more than 3450 words, it will be considered unacceptable.

Writing style guidelines:
- Use conversational tone
- Share personal opinions and experiences
- Include practical examples from real-world scenarios
- Add personality through occasional humor and informal expressions
- Avoid corporate jargon and overly formal language
- Write as if having a coffee chat with a fellow developer
- Express genuine excitement about the topic

THE FOLLOWING IS A LIST OF KEYWORDS

Main Keywords:
app developer company, web application development, app developers, mobile app development, android app development, desktop application development, ai app development, salesforce developer, cross platform app development, software and web development company, ai app developer, app development cost, ios app development, app development app, web app development services, API integration services, applications developer, app making company, web and mobile app development companies, app and web development company, get mobile app, healthcare software development companies, web app development agencies

Secondary Keywords:
custom SaaS solutions, enterprise software development, digital transformation services, user experience optimization, e-commerce platform development, subscription based services, custom admin panel design, enterprise web solutions, AI driven software solutions, automated testing solutions, web and mobile integration, custom API development, scalable backend solutions, python application services, customized web portals, iOS development agency, android development services, blockchain solutions, custom CRM software, big data analytics integration, mobile app development, web application development, machine learning development, devops consulting, software consulting

IMPORTANT: Ensure one random primary keyword and up to 5 supporting and random secondary keywords is used only in the enriched content. (Best is to use the most possible from Main Keywords - for the primary and supporting)`,
            },
            {
              role: "user",
              content: `Reference article:
                Title: ${article.title}
                URL: ${article.link}
                
                Generate and return only this JSON structure:
                {
                  "enrichedTitle": "A tech-focused, timely, and story-driven title here (use ${currentYear} for any year references). The enrichedTitle MUST retain all specific product names, version numbers, company names, and unique news angles from the original title. Only rephrase for SEO and engagement—do NOT generalize or remove details. If the original title contains a comparison, controversy, or update, the enrichedTitle must keep that focus. IMPORTANT: DO NOT FORCE YEAR MENTIONS INTO THE TITLE IF THEY'RE NOT RELEVANT TO THE CONTENT. Make sure the title is unique, timely, and not similar to the original title for SEO purposes. Use concrete product names, version numbers, or real-world terms when possible.",
                  "enrichedContent": "HTML-formatted blog content here. The word count MUST NOT BE LESS THAN 2500 WORDS, EXCLUDING HTML TAGS. This is a hard requirement. Use one unique <h1> tag per article and limit it to 6 - 12 words, ensuring the primary target keyword is included naturally. Each major section should start with an <h2> tag. <h2> tag should contain 8 - 14 words and incorporate relevant secondary keywords. Use <h3> tag to introduce sub-sections when necessary. Keep <h3> tag concise with 6 - 10 words, reinforcing topic clarity and semantic structure."
                }

              The title should naturally reflect the core technology, news hook, or innovation from the news article, emphasizing its impact, advancements, or practical applications. The enrichedTitle must never be more generic than the original title. Be creative with the framing while staying true to the technical subject matter. The content should provide comprehensive analysis and insights about the technology, its current state, potential applications, and future implications. It should not deviate too much from the actual content. Be creative with the content while maintaining technical accuracy. Start content directly with first paragraph, no title tags. Do not include any citations, reference numbers, or footnotes in the content. Write in a clear, authoritative voice without needing to cite sources. IMPORTANT: Use ${currentYear} as the current year for all year-based references in both title and content if and only if they are relevant to the content. DO NOT FORCE YEAR MENTIONS INTO THE TITLE OR CONTENT IF THEY'RE NOT RELEVANT TO THE CONTENT. Example: Change "How you can scale your software product in 2024" to "How you can scale your software product in ${currentYear}." Also make sure the content is unique, has different wording, and adds something new to the topic.`,
            },
          ],
          max_tokens: 35000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          },
        }
      )
    );

    let content = response.data.choices[0].message.content;

    // Clean up the string before parsing
    content = jsonrepair(content);

    try {
      const enrichedData = JSON.parse(content);
      return {
        ...article,
        enrichedTitle: enrichedData.enrichedTitle,
        enrichedContent: enrichedData.enrichedContent,
        generated_at: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Problematic content:", content);
      // Fallback return if parsing fails
      return {
        ...article,
        enrichedTitle: article.title,
        enrichedContent: content,
        generated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error generating blog post:", error.response?.data);
    return article;
  }
}

async function enrichWithOpenAI(article) {
  try {
    const response = await retryRequest(() =>
      axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-5-nano",
          messages: [
            {
              role: "system",
              content: `You are an expert tech blogger, specializing in technology, SaaS, software, web, programming, mobile, AI, and machine learning, especially as they relate to helping SaaS founders launch and scale their own products. All your articles are at least 2,500 words and are published as Blog Articles or Founders Tutorials on behalf of the company.

You write highly engaging, timely, and story-driven articles using the latest, most relevant news provided by us. Each article must:

- Be directly based on the specific news item(s) supplied.
- Reference recent events, product updates, or industry shifts (mention product names, version numbers, or real-world terms when possible).
- Include a clear 'news hook' or 'change angle'—highlight what's new, changing, or controversial about the topic.
- Frame the headline and content as a story, comparison, or bold opinion (e.g., "Why [X] is Overtaking [Y] in 2024", "OpenAI's Supply Crunch: What It Means for SaaS").
- Avoid generic buzzwords and summary-only content; instead, add unique angles, predictions, or actionable insights.
- Weave our targeted keywords organically into the article.
- Be informative, actionable, and directly relevant for SaaS founders looking to learn, be inspired, or act on the news.
- Be written in a casual, engaging style: conversational, using first-person perspective ("I", "we", "my experience"), with personal company anecdotes or insights where appropriate.
- Use occasional humor, relatable industry examples, and clear, practical advice.
- Always reference or connect back to the news article provided, demonstrating its relevance to SaaS founders and the broader SaaS industry.

IMPORTANT CONTENT UNIQUENESS RULES:
1. Never use generic or common phrases that appear in many other articles
2. Create unique analogies and examples specific to the topic
3. Include original insights and perspectives not commonly found elsewhere
4. Use varied sentence structures and paragraph lengths
5. Incorporate real-world case studies and specific examples
6. Add unique data points or statistics when relevant
7. Create custom scenarios and hypothetical situations
8. Use industry-specific terminology in novel ways
9. Include original metaphors and comparisons
10. Develop unique frameworks or methodologies

You are writing on behalf Bles Software (as a founder and article writer) sharing valuable insights, and your aim is to make even complex news approachable, exciting, and actionable for SaaS entrepreneurs that want to build new SaaS software for building new businesses.

Return only valid JSON without any prefixes or explanations. Your response must be a single JSON object containing enrichedTitle and enrichedContent fields. Only update year references (like changing "2024" to "${currentYear}") when they appear in the original article. Don't force year mentions if they're not relevant to the content.

IMPORTANT: The enriched content field response MUST BE BETWEEN 2350 and 3450 WORDS, EXCLUDING HTML TAGS. This is a hard requirement. If the content is less than 2350 words and more than 3450 words, it will be considered unacceptable.

Writing style guidelines:
- Use conversational tone
- Share personal opinions and experiences
- Include practical examples from real-world scenarios
- Add personality through occasional humor and informal expressions
- Avoid corporate jargon and overly formal language
- Write as if having a coffee chat with a fellow developer
- Express genuine excitement about the topic

THE FOLLOWING IS A LIST OF KEYWORDS

Main Keywords:
app developer company, web application development, app developers, mobile app development, android app development, desktop application development, ai app development, salesforce developer, cross platform app development, software and web development company, ai app developer, app development cost, ios app development, app development app, web app development services, API integration services, applications developer, app making company, web and mobile app development companies, app and web development company, get mobile app, healthcare software development companies, web app development agencies

Secondary Keywords:
custom SaaS solutions, enterprise software development, digital transformation services, user experience optimization, e-commerce platform development, subscription based services, custom admin panel design, enterprise web solutions, AI driven software solutions, automated testing solutions, web and mobile integration, custom API development, scalable backend solutions, python application services, customized web portals, iOS development agency, android development services, blockchain solutions, custom CRM software, big data analytics integration, mobile app development, web application development, machine learning development, devops consulting, software consulting

IMPORTANT: Ensure one random primary keyword and up to 5 supporting and random secondary keywords is used only in the enriched content. (Best is to use the most possible from Main Keywords - for the primary and supporting)`,
            },
            {
              role: "user",
              content: `Reference article:
                Title: ${article.title}
                URL: ${article.link}
                
                Generate and return only this JSON structure:
                {
                  "enrichedTitle": "A tech-focused, timely, and story-driven title here (use ${currentYear} for any year references). The enrichedTitle MUST retain all specific product names, version numbers, company names, and unique news angles from the original title. Only rephrase for SEO and engagement—do NOT generalize or remove details. If the original title contains a comparison, controversy, or update, the enrichedTitle must keep that focus. IMPORTANT: DO NOT FORCE YEAR MENTIONS INTO THE TITLE IF THEY'RE NOT RELEVANT TO THE CONTENT. Make sure the title is unique, timely, and not similar to the original title for SEO purposes. Use concrete product names, version numbers, or real-world terms when possible.",
                  "enrichedContent": "HTML-formatted blog content here. The word count MUST NOT BE LESS THAN 2500 WORDS, EXCLUDING HTML TAGS. This is a hard requirement. Use one unique <h1> tag per article and limit it to 6 - 12 words, ensuring the primary target keyword is included naturally. Each major section should start with an <h2> tag. <h2> tag should contain 8 - 14 words and incorporate relevant secondary keywords. Use <h3> tag to introduce sub-sections when necessary. Keep <h3> tag concise with 6 - 10 words, reinforcing topic clarity and semantic structure."
                }

              The title should naturally reflect the core technology, news hook, or innovation from the news article, emphasizing its impact, advancements, or practical applications. The enrichedTitle must never be more generic than the original title. Be creative with the framing while staying true to the technical subject matter. The content should provide comprehensive analysis and insights about the technology, its current state, potential applications, and future implications. It should not deviate too much from the actual content. Be creative with the content while maintaining technical accuracy. Start content directly with first paragraph, no title tags. Do not include any citations, reference numbers, or footnotes in the content. Write in a clear, authoritative voice without needing to cite sources. IMPORTANT: Use ${currentYear} as the current year for all year-based references in both title and content if and only if they are relevant to the content. DO NOT FORCE YEAR MENTIONS INTO THE TITLE OR CONTENT IF THEY'RE NOT RELEVANT TO THE CONTENT. Example: Change "How you can scale your software product in 2024" to "How you can scale your software product in ${currentYear}." Also make sure the content is unique, has different wording, and adds something new to the topic.`,
            },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 35000,
        },
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
      )
    );

    let content = response.data.choices[0].message.content;

    // Clean up the string before parsing
    content = jsonrepair(content);

    try {
      const enrichedData = JSON.parse(content);
      return {
        ...article,
        enrichedTitle: enrichedData.enrichedTitle,
        enrichedContent: enrichedData.enrichedContent,
        generated_at: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Problematic content:", content);
      // Fallback return if parsing fails
      return {
        ...article,
        enrichedTitle: article.title,
        enrichedContent: content,
        generated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error generating blog post:", error.response?.data);
    return article;
  }
}

// Step 4: Extract SEO Keywords Using DataForSEO
async function extractSeoKeywords(article) {
  try {
    const response = await retryRequest(() =>
      axios.post(
        "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live",
        {
          data: [
            {
              search_partners: true,
              keywords: [
                "app developers",
                "web application development",
                "web app agency",
                "app developer company",
                "mobile app development",
                "create ai app",
                "desktop application development",
                "ai app development",
                "app development cost",
                "android app development",
                "cross platform app development",
                "ios app development",
                "app and web development company",
              ],
              sort_by: "relevance",
              include_adult_keywords: false,
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
          auth: {
            username: DATAFORSEO_USERNAME,
            password: DATAFORSEO_PASSWORD,
          },
        }
      )
    );

    const keywords = response.data.tasks[0]?.data?.["0"]?.keywords || [];
    return { ...article, seo_keywords: keywords };
  } catch (error) {
    console.error("Error extracting SEO keywords:", error);
    return article;
  }
}

// Add helper function to resolve image URL
async function resolveImageUrl(url) {
  try {
    const response = await axios.head(url, {
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept status codes in this range
      },
    });
    // If there's a redirect, follow it
    if (response.request.res.responseUrl) {
      return response.request.res.responseUrl;
    }
    return url;
  } catch (error) {
    console.error("Error resolving image URL:", error);
    return url;
  }
}

async function combineAllFunctions() {
  try {
    const articles = await fetchAINews();
    const topArticles = await filterTopArticles(articles);
    const enrichedArticles = await Promise.allSettled(
      topArticles.map(enrichWithOpenAI)
    );


    if (enrichedArticles.length > 0) {
      for (const article of enrichedArticles) {
        if (article.status === "fulfilled" && article.value.enrichedContent) {
          // Resolve the actual image URL before uploading
          const resolvedImageUrl = await resolveImageUrl(article.value.image);
          const imageUrl = await uploadImage(
            resolvedImageUrl,
            "bles-software-blog",
            "raw"
          );
          const dataToCreate = {
            title: article.value.enrichedTitle || article.value.title,
            content: article.value.enrichedContent,
            status: "published",
            duration: "5 minutes",
          };
          const assets = [
            { url: imageUrl.secureUrl, imgId: imageUrl.publicId },
          ];

          // save article to db
          const createdBlog = await BlogPost.create({
            ...dataToCreate,
            authorId: process.env.ADMIN_ID,
            assets,
            canonicalUrl:
              "https://bles-software.com/blog/developing-ai-chatbots-for-enhanced-customer-engagement-in-b2b",
          });

          // upsert to pinecone
          await upsertArticles([createdBlog]);
        } else {
          console.error("No enriched content generated, skipping blog creation.");
        }
      }
    }

    // update sitemap
    await generateSitemap();

    return enrichedArticles;
  } catch (error) {
    console.error("Error combining all functions:", error);
    return [];
  }
}

async function generateEmbedding(text) {
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-large", // 3072 dims
      input: text,
    });
    return res.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

async function upsertArticles(articles) {
  try {
    const vectors = await Promise.all(
      articles.map(async (article) => ({
        id: article._id,
        values: await generateEmbedding(article.title),
        metadata: {
          title: article.title,
          slug: article.slug,
          assets: JSON.stringify(article.assets),
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        },
      }))
    );
    await index.upsert(vectors);
    console.log("✅ Articles upserted to Pinecone.");
  } catch (error) {
    console.error("Error upserting articles:", error);
  }
}

async function deleteAnArticleFromPinecone(articleId) {
  try {
    await index.deleteOne(articleId);
    console.log("✅ Article deleted from Pinecone.");
  } catch (error) {
    console.error("Error deleting article from Pinecone:", error);
  }
}

async function updateAnArticleInPinecone(articleId, newArticle) {
  try {
    await index.update({
      id: articleId,
      values: await generateEmbedding(newArticle.title),
      metadata: {
        title: newArticle.title,
        slug: newArticle.slug,
        assets: JSON.stringify(newArticle.assets),
        createdAt: newArticle.createdAt,
        updatedAt: newArticle.updatedAt,
      },
    });
    console.log("✅ Article updated in Pinecone.");
  } catch (error) {
    console.error("Error updating article in Pinecone:", error);
  }
}

async function querySimilarArticles(queryName, topK = 6) {
  try {
    const queryEmbedding = await generateEmbedding(queryName);
    const result = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return result.matches.map((match) => ({
      // score: match.score,
      _id: match.id,
      title: match.metadata.title,
      slug: match.metadata.slug,
      assets: JSON.parse(match.metadata.assets),
      createdAt: match.metadata.createdAt,
      updatedAt: match.metadata.updatedAt,
      // metadata: match.metadata,
    }));
  } catch (error) {
    console.error("Error querying similar articles:", error);
    return [];
  }
}

async function processBlogPostsInBatchesAndUpsertToPinecone() {
  try {
    // Get all blog posts
    const allBlogPosts = await BlogPost.find({}).lean().select({
      content: 0,
    });
    const batchSize = 5;
    const delayBetweenBatches = 2 * 60 * 1000; // 2 minutes in milliseconds

    // Calculate total number of batches
    const totalBatches = Math.ceil(allBlogPosts.length / batchSize);
    console.log(`Total articles: ${allBlogPosts.length}`);
    console.log(
      `Will process in ${totalBatches} batches of ${batchSize} articles each`
    );

    for (let i = 0; i < totalBatches; i++) {
      // Get current batch of articles
      const start = i * batchSize;
      const end = Math.min(start + batchSize, allBlogPosts.length);
      const currentBatch = allBlogPosts.slice(start, end);

      console.log(
        `Processing batch ${i + 1}/${totalBatches} (Articles ${
          start + 1
        } to ${end})`
      );

      // Process current batch
      await upsertArticles(currentBatch);

      // If this isn't the last batch, wait before processing the next one
      if (i < totalBatches - 1) {
        console.log(
          `Waiting ${delayBetweenBatches / 1000} seconds before next batch...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    console.log("✅ All articles have been processed and upserted to Pinecone");
  } catch (error) {
    console.error("Error processing blog posts:", error);
  }
}

module.exports = {
  fetchAINews,
  filterTopArticles,
  enrichWithPerplexity,
  enrichWithOpenAI,
  extractSeoKeywords,
  combineAllFunctions,
  upsertArticles,
  querySimilarArticles,
  processBlogPostsInBatchesAndUpsertToPinecone,
  deleteAnArticleFromPinecone,
  updateAnArticleInPinecone,
};
