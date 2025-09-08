# Todo Module (NestJS + Prisma)

This module implements a **Todo management system** using **NestJS** and **Prisma** as ORM. It provides CRUD operations for Todos, supports filtering, pagination, and search functionality.

---

## Features

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

## Structure

### Controller (`TodoController`)
- Handles incoming HTTP requests.
- Maps routes to service methods.
- Uses `@Req()` to extract authenticated `userId`.

### Service (`TodoService`)
- Contains business logic for Todos.
- Delegates database operations to the repository.
- Handles pagination and search metadata.

### Repository (`TodoRepository` interface)
- Defines the contract for database operations.
- Includes methods:
  - `create(todo: Partial<Todo>): Promise<Todo>`
  - `findAll(userId, status?, page?, limit?, search?): Promise<{ todos: Todo[], totalItems: number }>`
  - `findById(id, userId): Promise<Todo | null>`
  - `update(id, userId, data): Promise<Todo>`
  - `delete(id, userId): Promise<void>`

### Database
- **Prisma** ORM connected to a MySQL database.
- `Todo` model contains fields like `id`, `title`, `description`, `status`, and `userId`.

---

## Usage

1. Install dependencies:
```bash
npm install
