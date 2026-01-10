const Product = require('../../../models/Product');
const ProductVariant = require('../../../models/ProductVariant');
const MainCategory = require('../../../models/MainCategory');
const SubCategory = require('../../../models/SubCategory');
const User = require('../../../models/User');
const { deleteCachePattern, deleteCache } = require('../../../services/redisService');
const { slugify } = require('../../../utils/help');
const { ObjectId } = require('mongodb');

exports.createProduct = async (req, res) => {
    try {
        if (req.roleId !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Only sellers can create products'
            });
        }

        const { productName, mainCategoryId, subCategoryId, description, shortDescription, userId, createdby, brand, highlights, specifications, warranty } = req.body;
        let { variants, attributes } = req.body;

        if (typeof attributes === 'string') {
            try {
                attributes = JSON.parse(attributes);
            } catch (e) {
                attributes = [];
            }
        }

        if (typeof variants === 'string') {
            try {
                variants = JSON.parse(variants);
            } catch (e) {
                variants = [];
            }
        }

        let parsedHighlights = highlights;
        if (typeof highlights === 'string') {
            try {
                parsedHighlights = JSON.parse(highlights);
            } catch (e) {
                parsedHighlights = [highlights];
            }
        }

        let parsedSpecifications = specifications;
        if (typeof specifications === 'string') {
            try {
                parsedSpecifications = JSON.parse(specifications);
            } catch (e) {
                parsedSpecifications = [];
            }
        }

        if (!productName || !mainCategoryId || !subCategoryId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'productName, mainCategoryId, subCategoryId, and userId are required fields'
            });
        }

        if (!variants || variants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one product variant is required'
            });
        }

        for (let i = 0; i < variants.length; i++) {
            const variantData = variants[i];
            const hasImageIndices = variantData.imageIndices && Array.isArray(variantData.imageIndices) && variantData.imageIndices.length > 0;
            const hasVariantFiles = req.files && req.files.some(f => f.fieldname === `variantImages_${i}`);

            if (!hasImageIndices && !hasVariantFiles) {
                return res.status(400).json({
                    success: false,
                    message: `Variant ${i + 1}: At least one image must be uploaded or selected`
                });
            }
        }

        const category = await SubCategory.findById(subCategoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'SubCategory not found'
            });
        }

        // Verify mainCategoryId matches subcategory's parentId
        const categoryParentId = category.parentId?.toString().trim();
        const providedMainCategoryId = mainCategoryId?.toString().trim();

        if (categoryParentId !== providedMainCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'The provided mainCategoryId does not match the subcategory\'s parent'
            });
        }

        const categoryAttributes = category.attributes || [];
        if (categoryAttributes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create product. Selected category has no attributes. Add attributes to the category first.'
            });
        }

        const normalizedSlug = slugify(productName);

        // Check if the product already exists for THIS seller
        const duplicateCheck = await Product.collection().findOne({
            slug: normalizedSlug,
            userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId
        });

        if (duplicateCheck) {
            return res.status(409).json({
                success: false,
                message: 'You have already created a product with this name'
            });
        }

        const existingMaster = await Product.collection().findOne({
            slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') }
        });
        const masterProductId = existingMaster ? (existingMaster.masterProductId || existingMaster.productId) : null;

        const allImages = req.files ? req.files.filter(f => f.fieldname === 'images').map(file => `/uploads/products/${file.filename}`) : [];

        // 1. Create Master Product (The "Flipkart Catalog" entry)
        const masterProductData = {
            productName,
            slug: normalizedSlug,
            description,
            shortDescription,
            brand,
            highlights: parsedHighlights,
            specifications: parsedSpecifications,
            warranty,
            mainCategoryId,
            subCategoryId,
            images: allImages,
            userId,
            roleId: 2,
            status: true,
            createdby
        };

        const masterProduct = await Product.create(masterProductData);
        const variantsCreated = [];

        // 2. Create Variants (The "Specific Offers" entries)
        for (let i = 0; i < variants.length; i++) {
            const variantData = variants[i];

            // Get images specifically for this variant
            const variantSpecificFiles = req.files
                ? req.files.filter(f => f.fieldname === `variantImages_${i}`).map(file => `/uploads/products/${file.filename}`)
                : [];

            // If imageIndices are provided, pick from the master images
            let variantImages = [];
            if (variantData.imageIndices && Array.isArray(variantData.imageIndices) && variantData.imageIndices.length > 0) {
                variantImages = variantData.imageIndices
                    .map(index => allImages[index])
                    .filter(img => img !== undefined);
            }

            // Combine indices-based images with direct uploads
            variantImages = [...variantImages, ...variantSpecificFiles];

            // Fallback to master images if variant has no images at all
            if (variantImages.length === 0) {
                variantImages = allImages;
            }

            const variant = await ProductVariant.create({
                productId: masterProduct.productId,
                sellerId: req.userId || userId,
                attributes: [...(attributes || []), ...(variantData.attributes || [])],
                price: parseFloat(variantData.price) || 0,
                salePrice: variantData.salePrice ? parseFloat(variantData.salePrice) : null,
                stock: parseInt(variantData.stock) || 0,
                images: variantImages,
                deliveryDays: variantData.deliveryDays || 3,
                pickupAddress: variantData.pickupAddress || null,
                approvalStatus: 'pending'
            });

            variantsCreated.push(variant.variantId);
        }

        await deleteCachePattern('products:list:*');

        res.status(201).json({
            success: true,
            message: `Product Master and ${variants.length} Variants created successfully.`,
            data: {
                productId: masterProduct.productId,
                variantIds: variantsCreated
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limitNum;

        const sellerId = ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId;
        let query = { userId: sellerId };

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$and = [
                { userId: sellerId },
                {
                    $or: [
                        { productName: searchRegex },
                        { slug: searchRegex },
                        { description: searchRegex }
                    ]
                }
            ];
            delete query.userId;
        }

        const [products, total] = await Promise.all([
            Product.collection().find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).toArray(),
            Product.collection().countDocuments(query)
        ]);

        const productsWithDetails = await Promise.all(products.map(async (product) => {
            const [mainCategory, subCategory, variants] = await Promise.all([
                product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
                product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
                ProductVariant.collection().find({
                    productId: product.productId,
                    sellerId: sellerId
                }).toArray()
            ]);

            return {
                ...product,
                mainCategoryName: mainCategory ? mainCategory.name : null,
                subCategoryName: subCategory ? subCategory.name : null,
                commissionPercentage: subCategory?.commissionPercentage || 0,
                variantsCount: variants.length,
                variants: variants
            };
        }));

        res.status(200).json({
            success: true,
            message: 'Seller products fetched successfully',
            data: {
                products: productsWithDetails,
                pagination: {
                    total,
                    page,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // Can be Master ID or Variant ID
        let { productName, description, shortDescription, attributes, price, salePrice, stock, deliveryDays, pickupAddress } = req.body;

        if (typeof pickupAddress === 'string') {
            try {
                pickupAddress = JSON.parse(pickupAddress);
            } catch (e) {
                // Keep as string if not JSON
            }
        }

        // 1. Check if it's a Master Product
        const masterProduct = await Product.findById(id);
        if (masterProduct) {
            if (masterProduct.userId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this master product' });
            }

            if (typeof attributes === 'string') {
                try { attributes = JSON.parse(attributes); } catch (e) { attributes = undefined; }
            }

            let parsedVariants = req.body.variants;
            if (typeof parsedVariants === 'string') {
                try { parsedVariants = JSON.parse(parsedVariants); } catch (e) { parsedVariants = undefined; }
            }

            const updateData = {
                productName,
                description,
                shortDescription,
                attributes: attributes !== undefined ? attributes : undefined
            };
            if (productName) updateData.slug = slugify(productName);

            if (req.files && req.files.length > 0) {
                const masterImages = req.files.filter(f => f.fieldname === 'images').map(file => `/uploads/products/${file.filename}`);
                if (masterImages.length > 0) {
                    updateData.images = [...(masterProduct.images || []), ...masterImages];
                }
            }

            // Remove undefined keys
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

            await Product.update(id, updateData);

            // 1.1 Update Variants if provided (Bulk update)
            if (parsedVariants && Array.isArray(parsedVariants)) {
                for (let i = 0; i < parsedVariants.length; i++) {
                    const vData = parsedVariants[i];
                    if (vData.variantId) {
                        const variantUpdateData = {
                            price: vData.price !== undefined ? parseFloat(vData.price) : undefined,
                            salePrice: vData.salePrice !== undefined ? parseFloat(vData.salePrice) : undefined,
                            stock: vData.stock !== undefined ? parseInt(vData.stock) : undefined,
                            deliveryDays: vData.deliveryDays !== undefined ? parseInt(vData.deliveryDays) : undefined,
                            pickupAddress: vData.pickupAddress !== undefined ? vData.pickupAddress : undefined,
                            attributes: vData.attributes !== undefined ? vData.attributes : undefined,
                            images: vData.existingImages // Use the existingImages list from frontend
                        };

                        // Add new variant-specific images if uploaded
                        if (req.files) {
                            const newVariantImages = req.files
                                .filter(f => f.fieldname === `variantImages_${i}`)
                                .map(file => `/uploads/products/${file.filename}`);

                            if (newVariantImages.length > 0) {
                                variantUpdateData.images = [...(variantUpdateData.images || []), ...newVariantImages];
                            }
                        }

                        Object.keys(variantUpdateData).forEach(key => variantUpdateData[key] === undefined && delete variantUpdateData[key]);

                        // Ensure this variant belongs to the seller
                        const existingVariant = await ProductVariant.findById(vData.variantId);
                        if (existingVariant && existingVariant.sellerId.toString() === req.userId.toString()) {
                            await ProductVariant.update(vData.variantId, variantUpdateData);
                        }
                    }
                }
            }

            await deleteCachePattern('products:list:*');
            return res.status(200).json({ success: true, message: 'Master product and its variants updated successfully' });
        }

        // 2. Check if it's a Variant
        const variant = await ProductVariant.findById(id);
        if (variant) {
            if (variant.sellerId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this variant' });
            }

            if (typeof attributes === 'string') {
                try { attributes = JSON.parse(attributes); } catch (e) { attributes = undefined; }
            }

            const variantUpdateData = {
                attributes: attributes !== undefined ? attributes : undefined,
                price: price !== undefined ? parseFloat(price) : undefined,
                salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                deliveryDays: deliveryDays !== undefined ? parseInt(deliveryDays) : undefined,
                pickupAddress: pickupAddress !== undefined ? pickupAddress : undefined
            };

            // Remove undefined keys
            Object.keys(variantUpdateData).forEach(key => variantUpdateData[key] === undefined && delete variantUpdateData[key]);

            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
                variantUpdateData.images = [...(variant.images || []), ...newImages];
            }

            await ProductVariant.update(id, variantUpdateData);
            await deleteCachePattern('products:list:*');
            return res.status(200).json({ success: true, message: 'Variant updated successfully' });
        }

        return res.status(404).json({ success: false, message: 'Product or Variant not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId;

        // 1. Fetch Master Product (Ensure it belongs to THIS seller)
        const product = await Product.collection().findOne({
            productId: id,
            userId: sellerId
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found or not authorized' });
        }

        // 2. Fetch only variants belonging to THIS seller for this product
        const variants = await ProductVariant.collection().find({
            productId: product.productId,
            sellerId: sellerId
        }).toArray();

        // 3. Fetch Category details
        const [mainCategory, subCategory, user] = await Promise.all([
            product.mainCategoryId ? MainCategory.findById(product.mainCategoryId) : null,
            product.subCategoryId ? SubCategory.findById(product.subCategoryId) : null,
            User.collection().findOne({
                $or: [
                    { userId: product.userId ? product.userId.toString() : null },
                    { _id: ObjectId.isValid(product.userId) ? new ObjectId(product.userId) : null }
                ].filter(q => q.userId !== null || q._id !== null)
            })
        ]);

        let sellerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        if (!sellerName) sellerName = user?.name || user?.email || 'Unknown';

        const variantsWithDetails = variants.map(variant => ({
            ...variant,
            sellerName,
            currentPrice: parseFloat(variant.salePrice) > 0 ? parseFloat(variant.salePrice) : parseFloat(variant.price)
        }));

        const minPriceVariant = variantsWithDetails.length > 0
            ? variantsWithDetails.reduce((prev, curr) => (prev.currentPrice < curr.currentPrice ? prev : curr))
            : null;

        const responseData = {
            ...product,
            mainCategoryName: mainCategory ? mainCategory.name : null,
            subCategoryName: subCategory ? subCategory.name : null,
            commissionPercentage: subCategory?.commissionPercentage || 0,
            sellerName,
            startingPrice: minPriceVariant ? minPriceVariant.currentPrice : 0,
            minPriceDetails: minPriceVariant ? {
                variantId: minPriceVariant.variantId,
                sellerName: minPriceVariant.sellerName,
                price: minPriceVariant.price,
                salePrice: minPriceVariant.salePrice,
                currentPrice: minPriceVariant.currentPrice,
                attributes: minPriceVariant.attributes
            } : null,
            variants: variantsWithDetails
        };

        res.status(200).json({
            success: true,
            message: 'Product details fetched successfully',
            data: responseData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Try deleting as Variant
        const variant = await ProductVariant.findById(id);
        if (variant) {
            if (variant.sellerId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to delete this variant' });
            }
            await ProductVariant.delete(id);
            await deleteCachePattern('products:list:*');
            return res.status(200).json({ success: true, message: 'Variant deleted successfully' });
        }

        // 2. Try deleting as Master Product
        const masterProduct = await Product.findById(id);
        if (masterProduct) {
            if (masterProduct.userId.toString() !== req.userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to delete this master product' });
            }

            // Delete Master and all its Variants
            await Promise.all([
                Product.collection().deleteOne({ productId: masterProduct.productId }),
                ProductVariant.collection().deleteMany({ productId: masterProduct.productId })
            ]);

            await deleteCachePattern('products:list:*');
            return res.status(200).json({ success: true, message: 'Master product and all its variants deleted successfully' });
        }

        return res.status(404).json({ success: false, message: 'Product or Variant not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addVariant = async (req, res) => {
    try {
        const { masterProductId } = req.params;
        const { price, salePrice, stock, attributes, deliveryDays, pickupAddress } = req.body;

        const masterProduct = await Product.findById(masterProductId);

        if (!masterProduct) {
            return res.status(404).json({ success: false, message: 'Master product not found' });
        }

        let parsedAttributes = attributes;
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes);
            } catch (e) {
                parsedAttributes = [];
            }
        }

        const images = req.files && req.files.length > 0
            ? req.files.map(file => `/uploads/products/${file.filename}`)
            : []; // If no images uploaded, variant might have no images (or we could default to master images if master had any)

        const variant = await ProductVariant.create({
            productId: masterProduct.productId,
            sellerId: req.userId,
            attributes: parsedAttributes || [],
            price: parseFloat(price) || 0,
            salePrice: salePrice ? parseFloat(salePrice) : null,
            stock: parseInt(stock) || 0,
            images: images,
            deliveryDays: deliveryDays || 3,
            pickupAddress: pickupAddress || null,
            approvalStatus: 'pending'
        });

        await deleteCachePattern('products:list:*');

        res.status(201).json({
            success: true,
            message: 'Variant added successfully to the master product',
            data: { variantId: variant.variantId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateVariant = exports.updateProduct;
exports.deleteVariant = exports.deleteProduct;

exports.checkProductBySlug = async (req, res) => {
    try {
        const { productName } = req.body;

        if (!productName || !productName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            });
        }

        const normalizedSlug = slugify(productName);

        const existingProduct = await Product.collection().findOne({
            slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') }
        });

        if (!existingProduct) {
            return res.status(200).json({
                success: true,
                exists: false,
                message: 'Product does not exist, you can create it'
            });
        }

        const alreadyListed = await ProductVariant.collection().findOne({
            productId: existingProduct.productId,
            sellerId: ObjectId.isValid(req.userId) ? new ObjectId(req.userId) : req.userId
        });

        const [mainCategory, subCategory] = await Promise.all([
            existingProduct.mainCategoryId ? MainCategory.findById(existingProduct.mainCategoryId) : null,
            existingProduct.subCategoryId ? SubCategory.findById(existingProduct.subCategoryId) : null
        ]);

        res.status(200).json({
            success: true,
            exists: true,
            alreadyListed: !!alreadyListed,
            message: alreadyListed
                ? 'You have already listed this product'
                : 'Product exists, you can add your price and stock',
            product: {
                productId: existingProduct.productId,
                productName: existingProduct.productName,
                slug: existingProduct.slug,
                description: existingProduct.description,
                shortDescription: existingProduct.shortDescription,
                images: existingProduct.images,
                mainCategoryId: existingProduct.mainCategoryId,
                subCategoryId: existingProduct.subCategoryId,
                mainCategoryName: mainCategory ? mainCategory.name : null,
                subCategoryName: subCategory ? subCategory.name : null,
                attributes: existingProduct.attributes,
                brand: existingProduct.brand || null,
                highlights: existingProduct.highlights || [],
                specifications: existingProduct.specifications || [],
                warranty: existingProduct.warranty || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
