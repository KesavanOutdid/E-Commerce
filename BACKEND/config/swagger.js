const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'E-Commerce API with Cart, Orders, and Payments',
            contact: {
                name: 'API Support',
                email: 'info@outdidunified.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Cart: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string' },
                                    qty: { type: 'number' },
                                    price: { type: 'number' }
                                }
                            }
                        },
                        status: { type: 'string', default: 'active' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string' },
                                    qty: { type: 'number' },
                                    price: { type: 'number' }
                                }
                            }
                        },
                        totalAmount: { type: 'number' },
                        status: { type: 'string' },
                        shippingAddress: { type: 'object' },
                        billingAddress: { type: 'object' },
                        paymentMethod: { type: 'string' },
                        paymentStatus: { type: 'string' },
                        orderDate: { type: 'string', format: 'date-time' },
                        deliveryDate: { type: 'string', format: 'date-time' },
                        trackingNumber: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Payment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        orderId: { type: 'string' },
                        userId: { type: 'string' },
                        amount: { type: 'number' },
                        paymentMethod: { type: 'string' },
                        status: { type: 'string' },
                        transactionId: { type: 'string' },
                        paymentGateway: { type: 'string' },
                        paymentDetails: { type: 'object' },
                        paymentDate: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/**/*.js', './controllers/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'E-Commerce API Documentation'
    }));
    
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

module.exports = { setupSwagger, swaggerSpec };
