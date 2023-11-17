// Get All Products
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: Get all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   year:
 *                     type: number
 *                   description:
 *                     type: string
 *                   category_id:
 *                     type: string
 */

// Create Product
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     consumes:
 *       - application/multipart/form-data
 *     parameters:
 *       - name: name
 *         in: formData
 *         type: string
 *         required: true
 *         description: The name of the product.
 *       - name: images
 *         in: formData
 *         type: array
 *         items:
 *           type: file
 *         required: true
 *         description: Images of the product.
 *       - name: price
 *         in: formData
 *         type: number
 *         required: true
 *         description: The price of the product.
 *       - name: size
 *         in: formData
 *         type: string
 *         description: The size of the product variant.
 *       - name: color
 *         in: formData
 *         type: string
 *         description: The color of the product variant.
 *       - name: quantity
 *         in: formData
 *         type: number
 *         description: The quantity of the product variant.
 *       - name: inStock
 *         in: formData
 *         type: boolean
 *         description: The stock status of the product variant.
 *       - name: description
 *         in: formData
 *         type: string
 *         description: The description of the product variant.
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 price:
 *                   type: number
 *                 details:
 *                   type: object
 *                   properties:
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           size:
 *                             type: string
 *                           color:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           inStock:
 *                             type: boolean
 *                           description:
 *                             type: string
 *                     category:
 *                       type: string
 *                     publishers:
 *                       type: string
 */
