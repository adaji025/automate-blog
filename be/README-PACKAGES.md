# Backend Package Dependencies

This document explains the purpose and usage of each package installed in the backend application.

## Production Dependencies

### Core Framework & Server

#### `express` (^4.21.2)
**Purpose:** Web application framework for Node.js  
**Usage:** Main HTTP server framework that handles routing, middleware, and request/response processing. Used throughout the application for all API endpoints.

#### `mongoose` (^8.9.5)
**Purpose:** MongoDB object modeling tool  
**Usage:** ODM (Object Document Mapper) for MongoDB. Used to define schemas, models, and interact with the database. All database operations (BlogPost, Admin, Contact, Clutch models) use Mongoose.

#### `mongodb` (^6.12.0)
**Purpose:** Official MongoDB driver for Node.js  
**Usage:** Low-level MongoDB driver. Used by Mongoose under the hood and also directly in some validators for ObjectId validation.

---

### Authentication & Security

#### `jsonwebtoken` (^9.0.2)
**Purpose:** JSON Web Token implementation  
**Usage:** Generates and verifies JWT tokens for admin authentication. Used in `middleware/authToken.js` and `controllers/admin/auth.js` for secure admin login and session management.

#### `bcryptjs` (^2.4.3)
**Purpose:** Password hashing library  
**Usage:** Hashes and verifies admin passwords securely. Used in the Admin model to encrypt passwords before storing them in the database.

---

### File Upload & Media Management

#### `express-fileupload` (^1.5.1)
**Purpose:** Middleware for handling file uploads  
**Usage:** Processes multipart/form-data file uploads. Used in blog post creation/update endpoints to handle image uploads before sending to Cloudinary.

#### `cloudinary` (^2.5.1)
**Purpose:** Cloud-based image and video management service  
**Usage:** Uploads, stores, and manages images for blog posts. Used in `utils/utils.js` to upload images to Cloudinary and retrieve secure URLs.

#### `cloudinary-build-url` (^0.2.4)
**Purpose:** Utility for building Cloudinary URLs  
**Usage:** Constructs Cloudinary image URLs with transformations. Used for generating optimized image URLs with specific dimensions, formats, or effects.

---

### Data Processing & Validation

#### `express-validator` (^7.2.1)
**Purpose:** Middleware for request validation  
**Usage:** Validates incoming request data (body, params, query). Used in all validators (`validators/admin/auth.js`, `validators/blog.js`, etc.) to ensure data integrity before processing.

#### `validator` (^13.12.0)
**Purpose:** String validation and sanitization library  
**Usage:** Provides additional validation functions. Used by express-validator for email validation, string checks, and other data validation tasks.

#### `jsonrepair` (^3.12.0)
**Purpose:** Repairs malformed JSON strings  
**Usage:** Fixes broken JSON that might be returned from AI APIs. Used in `utils/scraper.js` to repair JSON responses from OpenAI/Perplexity that might have formatting issues.

---

### AI & Machine Learning

#### `openai` (^4.91.1)
**Purpose:** Official OpenAI API client  
**Usage:** Interacts with OpenAI's API for content generation. Used in `utils/scraper.js` to:
- Generate blog post content from news articles
- Filter and analyze articles
- Create embeddings for Pinecone vector search

#### `@pinecone-database/pinecone` (^5.1.1)
**Purpose:** Pinecone vector database client  
**Usage:** Stores and queries vector embeddings for semantic search. Used in `utils/scraper.js` to:
- Store blog post embeddings for similarity search
- Enable "related articles" functionality
- Power semantic search capabilities

---

### Web Scraping & Data Collection

#### `google-news-scraper` (^2.7.0)
**Purpose:** Scrapes Google News for articles  
**Usage:** Fetches recent news articles from Google News. Used in `utils/scraper.js` to automatically discover and fetch AI/tech news articles for blog generation.

#### `axios` (^1.8.0)
**Purpose:** HTTP client for making API requests  
**Usage:** Makes HTTP requests to external APIs. Used for:
- Calling OpenAI API
- Calling Perplexity API
- Calling DataForSEO API
- Making general HTTP requests throughout the application

---

### Automation & Scheduling

#### `croner` (^9.0.0)
**Purpose:** Cron job scheduler for Node.js  
**Usage:** Schedules automated blog generation tasks. Used in `utils/blogAutomation.js` to run blog generation every 5 minutes automatically.

---

### Email Services

#### `mailgun.js` (^11.1.0)
**Purpose:** Mailgun email service client  
**Usage:** Sends transactional emails. Used in `controllers/admin/auth.js` to send password reset emails to admin users.

---

### Utilities & Helpers

#### `mongoose-slug-updater` (^3.3.0)
**Purpose:** Automatically generates URL-friendly slugs  
**Usage:** Creates unique slugs from blog post titles. Used in the BlogPost model to automatically generate SEO-friendly URLs (e.g., "my-blog-post-title").

#### `randomatic` (^3.1.1)
**Purpose:** Generate random strings  
**Usage:** Creates random tokens and strings. Used in `controllers/admin/auth.js` to generate password reset tokens.

#### `dayjs` (^1.11.13)
**Purpose:** Lightweight date manipulation library  
**Usage:** Parses, validates, manipulates, and displays dates. Used in `controllers/admin/blog.js` for date formatting and manipulation.

#### `dotenv` (^16.4.7)
**Purpose:** Loads environment variables from .env file  
**Usage:** Reads environment variables from `.env` file into `process.env`. Used at the start of `index.js` and other files to load configuration.

---

### Sitemap Generation

#### `sitemap` (^8.0.0)
**Purpose:** Generates XML sitemaps  
**Usage:** Creates sitemap.xml files for SEO. Used in `sitemap.js` to generate sitemaps that include all blog posts and static pages for search engine indexing.

---

### IP Geolocation

#### `apiip.net` (^1.3.0)
**Purpose:** IP geolocation service  
**Usage:** Gets location information from IP addresses. Used in `controllers/ip.js` to determine user location based on their IP address.

---

### Form Data Handling

#### `form-data` (^4.0.1)
**Purpose:** Creates multipart/form-data streams  
**Usage:** Handles form data for file uploads and API requests. Used internally by axios and express-fileupload for processing multipart requests.

---

### CORS

#### `cors` (^2.8.5)
**Purpose:** Cross-Origin Resource Sharing middleware  
**Usage:** Enables cross-origin requests from the frontend. Used in `index.js` to allow the frontend (running on different ports/domains) to make API requests.

---

## Development Dependencies

### Code Quality & Linting

#### `eslint` (^9.18.0)
**Purpose:** JavaScript/Node.js linter  
**Usage:** Identifies and reports code quality issues, enforces coding standards. Used to maintain consistent code style and catch potential bugs.

#### `@eslint/js` (^9.18.0)
**Purpose:** ESLint's recommended JavaScript rules  
**Usage:** Provides recommended ESLint rules for JavaScript. Used in `eslint.config.mjs` as the base configuration.

#### `globals` (^15.14.0)
**Purpose:** Global variables definitions for ESLint  
**Usage:** Defines Node.js and browser global variables for ESLint. Used in ESLint configuration to prevent false positives for Node.js globals.

---

### Development Tools

#### `nodemon` (^3.1.9)
**Purpose:** Automatically restarts Node.js application on file changes  
**Usage:** Development server that watches for file changes and restarts the server. Used in the `dev` script for hot-reloading during development.

---

## Package Categories Summary

### Core Application
- `express` - Web framework
- `mongoose`, `mongodb` - Database
- `dotenv` - Configuration

### Authentication & Security
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `cors` - Cross-origin security

### File & Media Handling
- `express-fileupload` - File uploads
- `cloudinary`, `cloudinary-build-url` - Image management
- `form-data` - Form processing

### AI & Automation
- `openai` - AI content generation
- `@pinecone-database/pinecone` - Vector search
- `croner` - Task scheduling
- `google-news-scraper` - News scraping

### Data Validation & Processing
- `express-validator`, `validator` - Input validation
- `jsonrepair` - JSON fixing
- `dayjs` - Date handling

### Utilities
- `mongoose-slug-updater` - URL slugs
- `randomatic` - Random strings
- `sitemap` - SEO sitemaps
- `apiip.net` - IP geolocation
- `axios` - HTTP requests
- `mailgun.js` - Email sending

### Development
- `eslint`, `@eslint/js`, `globals` - Code quality
- `nodemon` - Development server

---

## Installation

All packages are installed via npm:

```bash
npm install
```

This reads from `package.json` and installs all dependencies listed above.

## Version Management

The `^` symbol in version numbers (e.g., `^4.21.2`) means:
- Install the latest compatible version
- Allows minor and patch updates
- Prevents major version updates that might break compatibility

## Security Considerations

- **bcryptjs**: Used for secure password storage (never store plain text passwords)
- **jsonwebtoken**: Secures API authentication (tokens expire after 1 hour)
- **express-validator**: Prevents injection attacks and validates all inputs
- **cors**: Configured to only allow requests from trusted origins

## Performance Notes

- **mongoose**: Uses connection pooling for efficient database connections
- **cloudinary**: CDN-backed image delivery for fast image loading
- **Pinecone**: Vector database optimized for similarity search
- **croner**: Lightweight scheduler with minimal overhead

## Common Issues & Solutions

### Missing Environment Variables
Many packages require environment variables. See `.env.example` or check individual package documentation.

### Version Conflicts
If you encounter version conflicts, try:
```bash
npm install --legacy-peer-deps
```

### Build Errors
Some packages (like `google-news-scraper`) require Puppeteer. Install Chrome:
```bash
npm run install-puppeteer
```

---

**Last Updated:** 2024  
**Node.js Version:** >=18.0.0 (as specified in package.json engines)

