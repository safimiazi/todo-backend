# Todo Module (NestJS + Prisma)

This module implements a **Todo management system** using **NestJS** and **Prisma** as ORM. It provides CRUD operations for Todos, supports filtering, pagination, search functionality, and user authentication.

---

## Features

### Todo Endpoints

1. **Create Todo**
   - Endpoint: `POST /todos/create`
   - Creates a new Todo for the authenticated user.
   - Accepts:
     ```json
     {
       "title": "Todo title",
       "description": "Optional description"
     }
     ```

2. **Get All Todos**
   - Endpoint: `GET /todos/get-all`
   - Fetches all Todos for the authenticated user.
   - Supports query parameters:
     - `status`: Filter by TodoStatus (e.g., PENDING, COMPLETED)
     - `page`: Pagination page number (default: 1)
     - `limit`: Items per page (default: 10)
     - `search`: Search Todos by title or description
   - Response includes metadata: total items, total pages, current page, limit.

3. **Get Todo By ID**
   - Endpoint: `GET /todos/:id`
   - Fetch a single Todo by its ID for the authenticated user.

4. **Update Todo**
   - Endpoint: `PUT /todos/:id`
   - Update Todo details like title, description, or status for the authenticated user.

5. **Delete Todo**
   - Endpoint: `DELETE /todos/:id`
   - Deletes a Todo by ID for the authenticated user.

---

### Authentication Endpoints

1. **Register User**
   - Endpoint: `POST /auth/register`
   - Creates a new user account.
   - Accepts:
     ```json
     {
       "name": "User Name",
       "email": "user@example.com",
       "password": "yourpassword"
     }
     ```
   - Response:
     ```json
     {
       "name": "User Name",
       "email": "user@example.com"
     }
     ```

2. **Login User**
   - Endpoint: `POST /auth/login`
   - Logs in an existing user.
   - Accepts:
     ```json
     {
       "email": "user@example.com",
       "password": "yourpassword"
     }
     ```
   - Response:
     ```json
     {
       "access_token": "jwt_token_here"
     }
     ```

> All Todo endpoints require a valid JWT token in the `Authorization` header:
