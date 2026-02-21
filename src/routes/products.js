const { Router } = require('express');
const db = require('../db');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 'Laptop Pro 15"'
 *         description:
 *           type: string
 *           example: 'Potente laptop para profesionales'
 *         price:
 *           type: number
 *           example: 1299.99
 *         image:
 *           type: string
 *           example: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
 *         category:
 *           type: string
 *           example: 'electronics'
 *         stock:
 *           type: integer
 *           example: 15
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *           example: 'Nuevo Producto'
 *         description:
 *           type: string
 *           example: 'Descripción del producto'
 *         price:
 *           type: number
 *           example: 49.99
 *         image:
 *           type: string
 *           example: 'https://example.com/image.jpg'
 *         category:
 *           type: string
 *           example: 'electronics'
 *         stock:
 *           type: integer
 *           example: 10
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de productos por página
 *     responses:
 *       200:
 *         description: Lista de productos con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let products;
  let total;

  if (category) {
    products = db.prepare('SELECT * FROM products WHERE category = ? LIMIT ? OFFSET ?').all(category, limitNum, offset);
    total = db.prepare('SELECT COUNT(*) as count FROM products WHERE category = ?').get(category).count;
  } else {
    products = db.prepare('SELECT * FROM products LIMIT ? OFFSET ?').all(limitNum, offset);
    total = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  }

  res.json({
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', (req, res) => {
  const { name, description, price, image, category, stock } = req.body;

  if (!name || price == null || !category || stock == null) {
    return res.status(400).json({ error: 'Campos requeridos: name, price, category, stock' });
  }

  // Verify category exists
  const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(category);
  if (!cat) {
    return res.status(400).json({ error: `Categoría '${category}' no existe` });
  }

  const result = db.prepare(`
    INSERT INTO products (name, description, price, image, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, description || null, price, image || null, category, stock);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  const { name, description, price, image, category, stock } = req.body;

  if (category) {
    const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(category);
    if (!cat) {
      return res.status(400).json({ error: `Categoría '${category}' no existe` });
    }
  }

  db.prepare(`
    UPDATE products SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      image = COALESCE(?, image),
      category = COALESCE(?, category),
      stock = COALESCE(?, stock)
    WHERE id = ?
  `).run(
    name || null,
    description || null,
    price != null ? price : null,
    image || null,
    category || null,
    stock != null ? stock : null,
    req.params.id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Producto eliminado', product: existing });
});

module.exports = router;
