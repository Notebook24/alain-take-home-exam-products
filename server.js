/**
 * None of the code in this file was AI-generated.
 * All code was written manually by the developer.
 * The inline comments are merely for informative documentation.
 * 
 * Author: Alain Zuriel Z. Marcos
 */

const express = require('express');  //Import the Express framework for handling HTTP requests
const mysql = require('mysql2');     //Import MySQL client for Node.js

const app = express();
app.use(express.json());             //Middleware to parse JSON request bodies

const port = process.env.PORT || 3000;   //Default server port (3000)

/* Configure the MySQL connection with the pertinent details to reach the MySQL server
 * It creates a connection object with the host, user, password, and database. 
 *
 * host: MySQL server hostname
 * user: MySQL username
 * password: MySQL password
 * database: Database name to connect to in MySQL
 * charset: Sets the character encoding for MySQL connection, utf8mb4 supports all Unicode characters.
 */
const db = mysql.createConnection({      
    host: process.env.DB_HOST,    
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

//Function to connect to MySQL
db.connect(err => {
    if (err){
        console.error('Cannot connect to MySQL', err.message);
    } 
    else{
        console.log('Connected to MySQL!');
    }
});

/* SQL query to create the Products table if it does not exist
 *
 * id: Primary key, auto-increment
 * name: Product name, required
 * price: Product price, required, must be > 0
 * description: Product description, required
 * stock_quantity: Quantity in stock, must be >= 0
 * weight: Product weight, must be > 0
 * created_at: Timestamp when record is created
 * updated_at: Timestamp when record is updated
 * expiry_date: Optional expiry date, must not be before creation
 * brand: Brand name, required
 */
const createProductsTable = `
    CREATE TABLE IF NOT EXISTS Products(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK(price > 0),
    description VARCHAR(200) NOT NULL,
    stock_quantity INT NOT NULL CHECK(stock_quantity >= 0),
    weight DECIMAL(10,2) NOT NULL CHECK(weight > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME NULL,
    brand VARCHAR(20) NOT NULL
)`;

//Create the Products table
db.query(createProductsTable, (err) => {
    if (err){
        console.error("Error creating Products table:", err);
    } 
    else{
        console.log("Products table is ready!");
    }
});

/**
 * Method: GET /
 * Confirm if the application is working
 */
app.get("/", (req, res) => {
    res.status(200).json({message: "Products API is running"});
});

/**
 * Method: POST /products
 * Create a new product
 * Checks the request body, rejects invalid input
 * Inserts product data into the Products table
 */
app.post("/products", (req,res) => {
    const {name, price, description, stock_quantity, weight, expiry_date, brand} = req.body;

    //Assign created_at and updated_at fields to the current time
    const created_at = new Date();
    const updated_at = new Date();
    
    //Input validation for certain fields
    if (name == null || typeof name !== "string"){
        return res.status(400).json({error: "Name is required and must be a string"});
    }
    if (price == null || typeof price !== "number" || price <= 0){
        return res.status(400).json({error: "Price is required and must be a positive number"});
    }
    if (description == null || typeof description !== "string"){
        return res.status(400).json({error: "Description is required and must be a string"});
    }
    if (stock_quantity == null || typeof stock_quantity !== "number" || stock_quantity < 0){
        return res.status(400).json({error: "Stock quantity must be a number greater than or equal to 0"});
    }
    if (weight == null || typeof weight !== "number" || weight <= 0){
        return res.status(400).json({error: "Weight must be a positive number"});
    }
    if (brand == null || typeof brand !== "string"){
        return res.status(400).json({error: "Brand name is required and must be a string"});
    }
    if (expiry_date != null && new Date(expiry_date) < created_at){ 
        return res.status(400).json({error: "Expiry date cannot be before the creation date"}); 
    }
    
    //If all fields are valid inputs, insert the product into MySQL
    db.query("INSERT INTO Products (name, price, description, stock_quantity, weight, created_at, updated_at, expiry_date, brand) VALUES (?,?,?,?,?,?,?,?,?)", 
        [name, price, description, stock_quantity, weight, created_at, updated_at, expiry_date, brand], (err, result) => {
        if (err){
            return res.status(500).json({error: "Internal server error"});
        }
        res.status(201).json({product: {id: result.insertId, name, price, description, stock_quantity, weight, created_at, updated_at, expiry_date, brand}});
    });
});

/**
 * Method: GET /products
 * Retrieve all products, with pagination.
 */
app.get("/products", (req,res) => {
    const page = parseInt(req.query.page) || 1;     //Split into pages so the server does not need to load all products at once, can be manipulated by modifying the page query in the URL or using curl
    const limit = parseInt(req.query.limit) || 10;  //Only show 10 products per page on default, can be manipulated by modifying the limit query in the URL or using curl
    const offset = (page - 1) * limit;              //Used to only fetch a list of products starting from a specified product
    db.query("SELECT * FROM Products LIMIT ? OFFSET ?", [limit, offset], (err, result) => {  //Only retrieve certain number of products
        if (err){
            return res.status(500).json({error: "Internal server error"});
        }
        db.query("SELECT COUNT(*) AS total FROM Products", (err, countResult) => {  //Get total number of products for pagination info
            if (err){
                return res.status(500).json({error: "Internal server error"});
            }
            const totalItems = countResult[0].total;           //Get the total number of products
            const totalPages = Math.ceil(totalItems / limit);  //Get the total pages
            res.status(200).json({page, limit, totalItems, totalPages, products: result});
        });
    });
});

/**
 * Method: GET /products/:id
 * Retrieve a single product by ID
 */
app.get("/products/:id", (req,res) => {
    const productID = req.params.id;
    db.query("SELECT * FROM Products WHERE id = ?", [productID], (err, result) => {  //Get the product with the ID in the request parameters
        if (err){
            return res.status(500).json({error: "Internal server error"});
        }
        if (result.length === 0){
            return res.status(404).json({error: "Product not found"});
        }
        res.status(200).json({product: result[0]});
    });
});

/**
 * Method: PUT /products/:id
 * Update a product by ID
 */
app.put("/products/:id", (req,res) => {
    const productID = req.params.id;
    const productFields = req.body;
    let hasFields = false;

    //Prevent the modification of system managed fields
    if (productFields.created_at !== undefined || productFields.updated_at !== undefined || productFields.expiry_date !== undefined){
        return res.status(400).json({error: "created_at, updated_at, and expiry_date cannot be modified"});
    }

    //Check if there are any fields to update
    for (let field in productFields){
        hasFields = true;
        break;
    }

    if (!hasFields){
        return res.status(400).json({error: "Invalid data"})
    }

    //Input validation for certain fields
    if (productFields.name !== undefined && typeof productFields.name !== "string"){
        return res.status(400).json({error: "Name must be a string"});
    }
    if (productFields.price !== undefined && (typeof productFields.price !== "number" || productFields.price <= 0)) {
        return res.status(400).json({error: "Price must be a positive number"});
    }
    if (productFields.description !== undefined && typeof productFields.description !== "string"){
        return res.status(400).json({error: "Description must be a string"});
    }
    if (productFields.stock_quantity !== undefined && (typeof productFields.stock_quantity !== "number" || productFields.stock_quantity < 0)){
        return res.status(400).json({error: "Stock quantity must be a number >= 0"});
    }
    if (productFields.weight !== undefined && (typeof productFields.weight !== "number" || productFields.weight <= 0)){
        return res.status(400).json({error: "Weight must be a positive number"});
    }
    if (productFields.brand !== undefined && typeof productFields.brand !== "string"){
        return res.status(400).json({error: "Brand must be a string"});
    }

    //Dynamically build the SET clause, which is composed of the names of the fields provided in request body for SQL update query
    let setAttributes = "";
    let values = [];
    for (let field in productFields){
        if (setAttributes !== ""){
            setAttributes += ", ";
        }
        setAttributes += field + "=?";
        values.push(productFields[field]);
    }
    values.push(productID);

    if (setAttributes !== ""){
        setAttributes += ", ";
        setAttributes += "updated_at = CURRENT_TIMESTAMP";  //Auto-update the 'updated_at' field
    }

    db.query(`UPDATE Products SET ${setAttributes} WHERE id = ?`, values, (err, result) => {  //Update the product with the ID provided in request parameters
        if (err){
            return res.status(500).json({error: "Internal server error"});
        }

        if (result.affectedRows === 0){
            return res.status(404).json({error: "Product not found"});
        }

        db.query(`SELECT * FROM Products WHERE id = ?`, [productID], (err, result) => {  //Return the updated product
            if (err){
                return res.status(500).json({error: err});
            }
            res.status(200).json({product: result[0]});  
        });
    });
});


/**
 * Method: DELETE /products/:id
 * Delete a product by ID
 */
app.delete("/products/:id", (req,res) => {
    const productID = req.params.id;

    db.query(`DELETE FROM Products WHERE id = ?`, [productID], (err, result) => {  //Delete the product with the ID provided in request parameters
        if (err){
            return res.status(500).json({error: err});
        }

        if (result.affectedRows === 0){
            return res.status(404).json({error: "Product not found"});
        }

        res.status(200).json({message: "Product deleted successfully"});  
    });
});

//Display error 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({error: "Route not found"});
});

//Global handler for other errors
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({error: "Internal server error"});
});

//Export app and db for testing or external modules
module.exports = {app, db};

//Start server if the file is run directly
if (require.main === module){
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};





