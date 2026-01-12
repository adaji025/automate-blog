# API Documentation

This document provides comprehensive documentation for all API endpoints in the application.

## Base URL

```
/api/v1
```

## Authentication

Admin endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

The access token is obtained through the admin login or registration endpoints and expires after 1 hour.

---

## Public Endpoints

### Contact

#### Create Contact

Create a new contact submission.

**Endpoint:** `POST /api/v1/contact/create`

**Authentication:** Not required

**Request Body:**
```json
{
  "fullName": "string (required)",
  "email": "string (required, valid email)",
  "subject": "string (required)",
  "message": "string (required)",
  "phone": "string (required)",
  "captcha": "string (optional)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Contact created successfully",
  "data": {
    "_id": "string",
    "fullName": "string",
    "email": "string",
    "subject": "string",
    "message": "string",
    "phone": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

---

### Blog

#### Get Single Blog Post

Retrieve a single blog post by slug.

**Endpoint:** `GET /api/v1/user/blog/single/:slug`

**Authentication:** Not required

**URL Parameters:**
- `slug` (string, required) - The slug of the blog post

**Response:**
```json
{
  "status": 200,
  "message": "Blog post retrieved",
  "data": {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "content": "string",
    "duration": "string",
    "status": "string",
    "assets": ["string"],
    "canonicalUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

#### Get All Blog Posts

Retrieve a list of all blog posts.

**Endpoint:** `GET /api/v1/user/blog/list`

**Authentication:** Not required

**Response:**
```json
{
  "status": 200,
  "message": "Blog posts retrieved",
  "data": [
    {
      "_id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "duration": "string",
      "status": "string",
      "assets": ["string"],
      "canonicalUrl": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "error": null
}
```

#### Get Related Blog Posts

Get related blog posts based on a title.

**Endpoint:** `POST /api/v1/user/blog/related`

**Authentication:** Not required

**Request Body:**
```json
{
  "title": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Related blog posts retrieved",
  "data": [
    {
      "_id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "duration": "string",
      "status": "string",
      "assets": ["string"],
      "canonicalUrl": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "error": null
}
```

---

### Clutch

#### Create Clutch Submission

Create a new Clutch submission.

**Endpoint:** `POST /api/v1/clutch/create`

**Authentication:** Not required

**Request Body:**
```json
{
  "fullName": "string (required)",
  "email": "string (required, valid email)",
  "service": "string (required)",
  "profileLink": "string (optional)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Clutch submission created successfully",
  "data": {
    "_id": "string",
    "fullName": "string",
    "email": "string",
    "service": "string",
    "profileLink": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

---

### IP Location

#### Get Location from IP

Retrieve location information from an IP address.

**Endpoint:** `POST /api/v1/ip/location`

**Authentication:** Not required

**Request Body:**
```json
{
  "ip": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Location retrieved successfully",
  "data": {
    "ip": "string",
    "location": {
      "country": "string",
      "region": "string",
      "city": "string",
      "latitude": "number",
      "longitude": "number"
    }
  },
  "error": null
}
```

---

## Admin Endpoints

### Admin Authentication

#### Register Admin

Register a new admin user.

**Endpoint:** `POST /api/v1/admin/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email, must be unique)",
  "fullName": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Admin created successfully",
  "data": {
    "accessToken": "string (JWT token)"
  },
  "error": null
}
```

**Error Responses:**
- `400` - Email has been used
- `400` - Validation errors

---

#### Login Admin

Login as an admin user.

**Endpoint:** `POST /api/v1/admin/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "string (JWT token)"
  },
  "error": null
}
```

**Error Responses:**
- `404` - No account found
- `400` - Incorrect password
- `400` - Validation errors

---

#### Check Email

Check if an email exists in the system.

**Endpoint:** `POST /api/v1/admin/auth/email/check`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Email check completed",
  "data": {
    "exists": "boolean"
  },
  "error": null
}
```

---

#### Get Admin Role

Get the role of the authenticated admin user.

**Endpoint:** `GET /api/v1/admin/auth/role`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "status": 200,
  "message": "Role retrieved successfully",
  "data": {
    "role": "string"
  },
  "error": null
}
```

---

#### Request Password Reset

Request a password reset email.

**Endpoint:** `POST /api/v1/admin/auth/password-reset`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required, valid email)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Password reset email sent",
  "data": null,
  "error": null
}
```

**Error Responses:**
- `400` - No account with this email address

---

#### Verify Reset Token

Verify a password reset token.

**Endpoint:** `GET /api/v1/admin/auth/verify-reset/:token`

**Authentication:** Not required

**URL Parameters:**
- `token` (string, required) - The reset password token

**Response:**
```json
{
  "status": 200,
  "message": "Token verified successfully",
  "data": {
    "valid": true
  },
  "error": null
}
```

**Error Responses:**
- `400` - No valid token

---

#### Reset Password

Reset password using a valid token.

**Endpoint:** `POST /api/v1/admin/auth/reset-password/:token`

**Authentication:** Not required

**URL Parameters:**
- `token` (string, required) - The reset password token

**Request Body:**
```json
{
  "password": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Password reset successfully",
  "data": null,
  "error": null
}
```

**Error Responses:**
- `400` - No valid token
- `400` - Validation errors

---

### Admin Blog

#### Create Blog Post

Create a new blog post.

**Endpoint:** `POST /api/v1/admin/blog/create`

**Authentication:** Required (Bearer token, Admin role)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `title` (string, required)
- `content` (string, required)
- `duration` (string, required)
- `status` (string, required) - Must be either "published" or "pending"
- `assets` (file, required) - Image files (max 3 files, max 2MB each, formats: PNG, JPG, JPEG)

**Response:**
```json
{
  "status": 200,
  "message": "Blog post created successfully",
  "data": {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "content": "string",
    "duration": "string",
    "status": "string",
    "assets": ["string"],
    "authorId": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `400` - Validation errors
- `400` - Asset validation errors (format, size, or count)

---

#### Bulk Create Blog Posts

Create multiple blog posts at once.

**Endpoint:** `POST /api/v1/admin/blog/create/bulk`

**Authentication:** Required (Bearer token, Admin role)

**Request Body:**
```json
{
  "posts": [
    {
      "title": "string",
      "content": "string",
      "duration": "string",
      "status": "string",
      "assets": ["string"]
    }
  ]
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Blog posts created successfully",
  "data": {
    "created": "number",
    "posts": ["array of blog post objects"]
  },
  "error": null
}
```

---

#### Get Single Blog Post (Admin)

Get a single blog post by ID (includes author information).

**Endpoint:** `GET /api/v1/admin/blog/single/:blogPostId`

**Authentication:** Required (Bearer token, Admin role)

**URL Parameters:**
- `blogPostId` (string, required) - MongoDB ObjectId of the blog post

**Response:**
```json
{
  "status": 200,
  "message": "Blog post retrieved",
  "data": {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "content": "string",
    "duration": "string",
    "status": "string",
    "assets": ["string"],
    "authorId": "string",
    "canonicalUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

---

#### Get All Blog Posts (Admin)

Get a list of all blog posts (includes author information).

**Endpoint:** `GET /api/v1/admin/blog/list`

**Authentication:** Required (Bearer token, Admin role)

**Response:**
```json
{
  "status": 200,
  "message": "Blog posts retrieved",
  "data": [
    {
      "_id": "string",
      "title": "string",
      "slug": "string",
      "content": "string",
      "duration": "string",
      "status": "string",
      "assets": ["string"],
      "authorId": "string",
      "canonicalUrl": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "error": null
}
```

---

#### Update Blog Post

Update an existing blog post.

**Endpoint:** `PUT /api/v1/admin/blog/update/:blogPostId`

**Authentication:** Required (Bearer token, Admin role)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `blogPostId` (string, required) - MongoDB ObjectId of the blog post

**Request Body:**
- `title` (string, required)
- `content` (string, required)
- `duration` (string, required)
- `status` (string, required) - Must be either "published" or "pending"
- `assets` (file, optional) - Image files (max 3 files, max 2MB each, formats: PNG, JPG, JPEG)

**Response:**
```json
{
  "status": 200,
  "message": "Blog post updated successfully",
  "data": {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "content": "string",
    "duration": "string",
    "status": "string",
    "assets": ["string"],
    "authorId": "string",
    "canonicalUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "error": null
}
```

---

#### Delete Blog Post

Delete a blog post.

**Endpoint:** `DELETE /api/v1/admin/blog/delete/:blogPostId`

**Authentication:** Required (Bearer token, Admin role)

**URL Parameters:**
- `blogPostId` (string, required) - MongoDB ObjectId of the blog post

**Response:**
```json
{
  "status": 200,
  "message": "Blog post deleted successfully",
  "data": null,
  "error": null
}
```

---

### Admin Contact

#### Get Contact Leads

Get a list of all contact submissions.

**Endpoint:** `GET /api/v1/admin/contact/list`

**Authentication:** Required (Bearer token, Admin role)

**Response:**
```json
{
  "status": 200,
  "message": "Contact leads retrieved",
  "data": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "subject": "string",
      "message": "string",
      "phone": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "error": null
}
```

---

### Admin Clutch

#### Get Clutch List

Get a list of all Clutch submissions.

**Endpoint:** `GET /api/v1/admin/clutch/list`

**Authentication:** Required (Bearer token, Admin role)

**Response:**
```json
{
  "status": 200,
  "message": "Clutch submissions retrieved",
  "data": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "service": "string",
      "profileLink": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "error": null
}
```

---

## Response Format

All API responses follow a consistent format:

```json
{
  "status": "number (HTTP status code)",
  "message": "string (human-readable message)",
  "data": "object | array | null (response data)",
  "error": "object | null (error details, if any)"
}
```

### Status Codes

- `200` - Success
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing or invalid authentication token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Error Handling

### Validation Errors

When validation fails, the response will include error details:

```json
{
  "status": 400,
  "message": "Validation failed",
  "data": null,
  "error": {
    "field": "error message"
  }
}
```

### Authentication Errors

When authentication fails:

```json
{
  "status": 401,
  "message": "Unauthorized",
  "data": null,
  "error": "Invalid or missing token"
}
```

### Permission Errors

When the user doesn't have sufficient permissions:

```json
{
  "status": 403,
  "message": "Forbidden",
  "data": null,
  "error": "Insufficient permissions"
}
```

---

## Notes

1. **File Uploads**: Blog post creation and updates support file uploads using `multipart/form-data`. Maximum 3 image files per request, each up to 2MB. Supported formats: PNG, JPG, JPEG.

2. **Token Expiration**: Admin access tokens expire after 1 hour. Use the login endpoint to obtain a new token.

3. **CORS**: The API supports CORS for specific origins configured in the environment.

4. **Rate Limiting**: Consider implementing rate limiting for production use.

5. **Captcha**: Contact form submissions may include optional captcha verification using Friendly Captcha.

---

## Additional Endpoints

### Root Endpoint

**Endpoint:** `GET /`

**Description:** Welcome endpoint that generates the sitemap.

**Response:**
```json
{
  "status": 200,
  "message": "Welcome to automated blog api",
  "data": null,
  "error": null
}
```

### Fetch AI News

**Endpoint:** `GET /fetch-ai-news`

**Description:** Fetches and enriches AI news articles (internal use).

**Response:**
```json
{
  "status": 200,
  "message": "AI news fetched successfully",
  "data": ["array of enriched articles"],
  "error": null
}
```

### Update Blog with Canonical

**Endpoint:** `GET /update-blog-with-canonical`

**Description:** Updates blog posts with canonical URLs (internal use).

**Response:**
```json
{
  "status": 200,
  "message": "Successful",
  "data": null,
  "error": null
}
```

---

## Support

For issues or questions regarding the API, please contact the development team.


