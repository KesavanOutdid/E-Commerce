const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { getNetworkIPs } = require('../utils/networkUtils');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce Multi-Vendor Platform API',
            version: '1.0.0',
            description: 'Complete API for E-Commerce Multi-Vendor Platform with Multi-Role System, KYC Approval Workflow, and Commission Management',
            contact: {
                name: 'API Support',
                email: 'info@outdidunified.com'
            }
        },
        servers: (() => {
            const PORT = process.env.PORT || 9000;
            const networkIPs = getNetworkIPs();
            const servers = [
                {
                    url: `http://localhost:${PORT}`,
                    description: 'Local server'
                }
            ];

            networkIPs.lan.forEach((ip, index) => {
                servers.push({
                    url: `http://${ip}:${PORT}`,
                    description: `Network Access (LAN${networkIPs.lan.length > 1 ? ` ${index + 1}` : ''})`
                });
            });

            networkIPs.wsl.forEach((ip, index) => {
                servers.push({
                    url: `http://${ip}:${PORT}`,
                    description: `Network Access (WSL${networkIPs.wsl.length > 1 ? ` ${index + 1}` : ''})`
                });
            });

            return servers;
        })(),
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
                User: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        roles: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Array of role IDs (1=Admin, 2=Seller, 3=Customer)'
                        },
                        roleNames: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        status: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Seller: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        shopName: { type: 'string' },
                        gstin: { type: 'string' },
                        panNumber: { type: 'string' },
                        kycApproved: { type: 'boolean' },
                        kycApprovedBy: { type: 'string' },
                        kycApprovedAt: { type: 'string', format: 'date-time' },
                        commissionPercentage: { type: 'number', minimum: 0, maximum: 100 },
                        bankDetails: {
                            type: 'object',
                            properties: {
                                accountNumber: { type: 'string' },
                                ifscCode: { type: 'string' },
                                bankName: { type: 'string' },
                                accountHolderName: { type: 'string' }
                            }
                        }
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
    apis: ['./routes/**/*.js', './controllers/**/*.js', './docs/swagger.yaml']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
    
    const PORT = process.env.PORT || 9000;
    const networkIPs = getNetworkIPs();
    const servers = [
        {
            url: `http://localhost:${PORT}`,
            description: 'Local server'
        }
    ];

    networkIPs.lan.forEach((ip, index) => {
        servers.push({
            url: `http://${ip}:${PORT}`,
            description: `Network Access (LAN${networkIPs.lan.length > 1 ? ` ${index + 1}` : ''})`
        });
    });

    networkIPs.wsl.forEach((ip, index) => {
        servers.push({
            url: `http://${ip}:${PORT}`,
            description: `Network Access (WSL${networkIPs.wsl.length > 1 ? ` ${index + 1}` : ''})`
        });
    });

    swaggerDocument.servers = servers;
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'E-Commerce Multi-Vendor Platform API',
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha'
        }
    }));
    
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocument);
    });
};

module.exports = { setupSwagger, swaggerSpec };
