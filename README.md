# Top Service Server

A RESTful API server built with NestJS, PostgreSQL, Prisma, and TypeScript.

## Features

- 🚀 NestJS framework with dependency injection
- 🐘 PostgreSQL database
- 🔷 Prisma ORM with type safety
- 📘 TypeScript for type safety
- 🔄 Hot reload with Nest CLI
- 🛡️ Exception filters and validation pipes
- 📝 RESTful API architecture
- 🗃️ ProductType and User CRUD operations
- 📄 Pagination support

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (local installation or cloud database)
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd top-service-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL connection string:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/top_service?schema=public
```

For remote PostgreSQL, use:
```env
DATABASE_URL=postgresql://user:password@your-host:5432/top_service?schema=public
```

5. Generate Prisma Client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

Or push schema changes to database without migrations:
```bash
npm run db:push
```

## Running the Server

### Development Mode

Run the server with hot reload:
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### Production Mode

Build the TypeScript code:
```bash
npm run build
```

Start the server:
```bash
npm run start:prod
```

### Other Commands

- `npm run start` - Start in production mode
- `npm run start:debug` - Start with debug mode
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests

### Database Management

Generate Prisma Client after schema changes:
```bash
npm run db:generate
```

Run migrations:
```bash
npm run db:migrate
```

Open Prisma Studio (visual database browser):
```bash
npm run db:studio
```

Push schema changes to database without migrations:
```bash
npm run db:push
```

### Clean Build

Remove the build directory:
```bash
npm run clean
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health Check

```
GET /api/health
```

Returns the server status.

### Users

#### Get All Users (Paginated)
```
GET /api/users?page=0&size=10
```

Query Parameters:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10, max: 100)

Response:
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### Get User by ID
```
GET /api/users/:id
```

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 25
}
```

#### Delete User
```
DELETE /api/users/:id
```

### Product Types

#### Get All Product Types (Paginated)
```
GET /api/product-types?page=0&size=10
```

Query Parameters:
- `page` (optional): Page number, default 0
- `size` (optional): Number of items per page, default 10 (max 100)

Response Example:
```json
{
  "content": [
    {
      "id": 1,
      "name": "روغن موتور",
      "description": "نوع روغن موتور خودرو",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 14,
    "totalPages": 2
  }
}
```

#### Get Active Product Types Only (Paginated)
```
GET /api/product-types/active?page=0&size=10
```

#### Get Product Type by ID
```
GET /api/product-types/:id
```

#### Create Product Type
```
POST /api/product-types
Content-Type: application/json

{
  "name": "روغن موتور",
  "description": "نوع روغن موتور خودرو",
  "isActive": true
}
```

#### Update Product Type
```
PUT /api/product-types/:id
Content-Type: application/json

{
  "name": "فیلتر هوا",
  "description": "فیلتر هوای موتور",
  "isActive": false
}
```

#### Delete Product Type
```
DELETE /api/product-types/:id
```

## Project Structure

```
top-service-server/
├── prisma/
│   ├── schema.prisma        # Prisma schema (database models)
│   └── migrations/          # Database migrations
├── src/
│   ├── common/
│   │   └── filters/
│   │       └── http-exception.filter.ts  # Global exception filter
│   ├── prisma/
│   │   ├── prisma.service.ts  # Prisma Client service
│   │   └── prisma.module.ts   # Prisma module
│   ├── product-types/
│   │   ├── dto/
│   │   │   ├── create-product-type.dto.ts
│   │   │   └── update-product-type.dto.ts
│   │   ├── product-types.controller.ts
│   │   ├── product-types.service.ts
│   │   └── product-types.module.ts
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.controller.ts     # Root controller
│   ├── app.module.ts         # Root module
│   ├── app.service.ts        # Root service
│   └── main.ts               # Application entry point
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore file
├── nest-cli.json            # Nest CLI configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM with type safety
- **TypeScript** - Type-safe JavaScript
- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation

## Development

### Database Schema

The Prisma schema is defined in `prisma/schema.prisma`. After making changes to the schema:

1. Generate Prisma Client: `npm run db:generate`
2. Create migration: `npm run db:migrate`
3. (Optional) View changes in Prisma Studio: `npm run db:studio`

### NestJS Architecture

This project follows NestJS best practices:

- **Modules**: Organize features into modules
- **Controllers**: Handle HTTP requests
- **Services**: Business logic and data access
- **DTOs**: Data Transfer Objects for validation
- **Filters**: Global exception handling
- **Pipes**: Request validation and transformation
- **PrismaService**: Global database service

### Features

- **Dependency Injection**: Automatic dependency management
- **Decorators**: Clean, declarative code
- **Type Safety**: Full TypeScript support
- **Validation**: Automatic DTO validation
- **Error Handling**: Global exception filters
- **Pagination**: Built-in pagination support

## License

ISC
