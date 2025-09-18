/**
 * None of the code in this file was AI-generated.
 * All code was written manually by the developer.
 * The inline comments are merely for informative documentation.
 * 
 * Author: Alain Zuriel Z. Marcos
 */

const request = require('supertest');
const { app, db } = require('../server');

describe('Products API', () => {
    //Test by creating a new product
    it('Create a new product', async () => {
        const res = await request(app)
            .post('/products')
            .send({
                name: 'Bear Brand',
                price: 100,
                description: 'Good milks',
                stock_quantity: 10,
                weight: 1.5,
                expiry_date: '2025-12-31',
                brand: 'Nestle'
            });

        expect(res.statusCode).toEqual(201);  //Ensure the product was created successfully
        expect(res.body.product).toHaveProperty('id');
        
        //Clean the table up by deleting the created product
        await request(app).delete(`/products/${res.body.product.id}`);
    });

    //Test by fetching a product by ID
    it('Fetch the created product', async () => {
        //Test by creating a new product to fetch
        const createRes = await request(app)
            .post('/products')
            .send({
                name: 'Bear Brand',
                price: 100,
                description: 'Good milks',
                stock_quantity: 10,
                weight: 1.5,
                expiry_date: '2025-12-31',
                brand: 'Nestle'
            });
        const productId = createRes.body.product.id;

        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toEqual(200);  //Ensure the product was fetched successfully
        expect(res.body.product.name).toBe('Bear Brand');
        
        //Clean the table up by deleting the created product
        await request(app).delete(`/products/${productId}`);
    });

    //Test by updating a product by ID
    it('Update the product', async () => {
        const createRes = await request(app)
            .post('/products')
            .send({
                name: 'Bear Brand',
                price: 100,
                description: 'Good milks',
                stock_quantity: 10,
                weight: 1.5,
                expiry_date: '2025-12-31',
                brand: 'Nestle'
            });
        const productId = createRes.body.product.id;

        const res = await request(app).put(`/products/${productId}`).send({price: 150});  //update price or product to 150

        expect(res.statusCode).toEqual(200);
        expect(Number(res.body.product.price)).toBe(150);  //Ensure the product was updated successfully

        await request(app).delete(`/products/${productId}`);
    });

    //Test by deleting a product by ID
    it('Delete the product', async () => {
        const createRes = await request(app)
            .post('/products')
            .send({
                name: 'Bear Brand',
                price: 100,
                description: 'Good milks',
                stock_quantity: 10,
                weight: 1.5,
                expiry_date: '2025-12-31',
                brand: 'Nestle'
            });
        const productId = createRes.body.product.id;

        const res = await request(app).delete(`/products/${productId}`);
        expect(res.statusCode).toEqual(200);  //Ensure the product was deleted successfully
        expect(res.body.message).toBe('Product deleted successfully');
    });

    //Test validation: negative price should fail
    it('Fail to create a product with negative price', async () => {
        const res = await request(app)
            .post('/products')
            .send({
                name: 'MILO',
                price: -50,
                description: 'MILO with invalid price',
                stock_quantity: 5,
                weight: 1.0,
                expiry_date: '2025-12-31',
                brand: 'Nestle'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Price/);
    });

    //Test validation: missing required fields should fail
    it('Fail to create a product with missing required fields', async () => {
        const res = await request(app)
            .post('/products')
            .send({
                price: 50,
                stock_quantity: 5,
                weight: 1.0
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Name/);
    });

    //Test by fetching a non-existent product
    it('Return 404 for a non-existent product', async () => {
        const res = await request(app).get('/products/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Product not found');
    });

    //Test by updating a product with invalid field
    it('Fail to update product with invalid field', async () => {
        const createRes = await request(app)
            .post('/products')
            .send({
                name: 'Acer',
                price: 2000,
                description: 'Acer laptop',
                stock_quantity: 10,
                weight: 1.5,
                expiry_date: '2025-12-31',
                brand: 'Acer'
            });
        const productId = createRes.body.product.id;

        const res = await request(app).put(`/products/${productId}`).send({price: -100});

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toMatch(/Price/);

        await request(app).delete(`/products/${productId}`);
    });

    //Test by deleting a non-existent product
    it('Return 404 when deleting a non-existent product', async () => {
        const res = await request(app).delete('/products/999999');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Product not found');
    });
});

//Close DB connection after all tests
afterAll(() => {
    db.end();
});
