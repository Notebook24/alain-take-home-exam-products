# Products API Quick Start

## Description:
This API allows you to manage products using Dockerized Node.js and MySQL. This app supports full CRUD operations, as well as automated testing made using Jest and Supertest

## Features

- CRUD operations on products (Create, Read, Update, Delete)
- Input validation and error handling
- Pagination support for fetching products
- Dockerized environment for easy setup
- MySQL database utilization
- Optional environment variables for configuration

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Dependencies:** mysql2, express, supertest, jest (for testing)
- **Containerization:** Docker, Docker Compose

## Prerequisites

- Docker and Docker Compose must be installed.
- Make sure the following host ports are **free** on your machine before running the project:

| Service      | Host Port | Container Port |
|-------------|-----------|----------------|
| Node App    | 3000      | 3000           |
| MySQL DB    | 3307      | 3306           |

**If any of these ports are already in use, either stop the process using them or change the host port in `docker-compose.yml`.**

## How to Run

### 0. Install Docker and Git
1. Download and install Docker Desktop from this link: https://www.docker.com/products/docker-desktop/
2. During installation, make sure **WSL 2 backend** is selected if you are on Windows.
3. After installation, open Docker Desktop to make sure it’s running.
4. Verify Docker is working:
```bash
docker --version
docker-compose --version
```
5. Download and install Git.
6. Verify Git is installed:
```bash
git --version
```

### 1. Clone the repository
```bash
git clone https://github.com/Notebook24/alain-take-home-exam-products.git
cd alain-take-home-exam-products
```

### 2. Configure environment
**Copy .env.example file for Windows**
```bash
copy .env.example .env
```

**Copy .env.example file for MacOS/Linux**
```bash
cp .env.example .env
```

**This is the content of the .env.example file:**
```bash
DB_HOST=mysql-db
DB_USER=root
DB_PASSWORD=Choichoi22
DB_NAME=examDB
PORT=3000
```

**Note: There is no need to install MySQL, as the Docker Compose automatically creates the MySQL database**

### 3. Build and start the app using Docker
```bash
docker-compose up -d --build
```

### Check running containers
```bash
docker ps
```
**Should see:**
```bash
mysql:8.0
node-app (Express server)
```
**In the case that one or both is missing, restart the app**
```bash
docker-compose up -d
```

### 4. Example API Usage (curl)

- **Note:** curl syntax presented in this section are windows-specific.
- **Note:** Windows users may need to escape `&` in URLs with `^`. Mac/Linux users can use `&`.

**These are the input rules for creating or updating a product:**
- `id`: Primary key, auto-increment, automatically set (The system does not allow ID input)
- `name`: Product name, required (VARCHAR(20))
- `price`: Product price, required, must be greater than 0 (DECIMAL(12,2))
- `description`: Product description, required (VARCHAR(200))
- `stock_quantity`: Quantity in stock, must be greater than or equal to 0 (INTEGER)
- `weight`: Product weight, must be greater than 0 (DECIMAL(10,2))
- `created_at`: Timestamp when product is created (TIMESTAMP)
- `updated_at`: Timestamp when product is updated (TIMESTAMP)
- `expiry_date`: Optional expiry date (DATETIME). Must be later than the creation time. This rule is enforced in the Node.js API, not in the database schema, because MySQL cannot use a CHECK constraint referencing another column.
- `brand`: Brand name, required (VARCHAR(20))

- **Note:** The system automatically assigns value to `created_at` and `updated_at` fields upon creation. Any attempt to input a different value upon creation is overriden by the system to be the current time to ensure product transparency.
- **Note:** The user cannot update the `created_at`, `updated_at`, and `expiry_date` fields. These fields are automatically managed by the system and are usually uneditable in real-world scenarios to ensure product transparency.

**a. Create a product**
- **Example: Creating a product**
```bash
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d "{\"name\":\"Sample Product\",\"price\":99.99,\"description\":\"Test product\",\"stock_quantity\":10,\"weight\":1.5,\"expiry_date\":\"2025-12-31\",\"brand\":\"TestBrand\"}"
```
**Note:** CREATE requires proper HTTP method, typing URL in browser won't create.

**b. Get all products (pagination)**
- **For accessing Page 1, 10 products per page**
```bash
curl "http://localhost:3000/products?page=1^&limit=10"
```
- **For accessing Page 2, 10 products per page**
```bash
curl "http://localhost:3000/products?page=2^&limit=10"
```

**To access Page 2, 10 products per page, you may also put the following URL in the browser**
"http://localhost:3000/products?page=2^&limit=10"

**c. Get product by ID**
- **Example: Getting the product with id of 1**
```bash
curl http://localhost:3000/products/1
```

**d. Update product**
- **Example: Updating the product with id of 1, to have a price of 120.50**
```bash
curl -X PUT http://localhost:3000/products/1 -H "Content-Type: application/json" -d "{\"price\":120.50}"
```
**Note:** UPDATE requires proper HTTP method, typing URL in browser won't update.

**e. Delete product**
- **Example: Deleting the product with id of 1**
```bash
curl -X DELETE http://localhost:3000/products/1
```
**Note:** DELETE requires proper HTTP method, typing URL in browser won't delete.

### 5. Run tests
```bash
docker-compose run --rm node-app npm test
```

### 6. Stop the app
```bash
docker-compose down
```

**Data persists in Docker volumes, so products remain after stopping/restarting.**

**Base URL: http://localhost:3000**

