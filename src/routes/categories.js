const { Router } = require('express');
const db = require('../db');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 'electronics'
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: 'toys'
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos o categoría duplicada
 */
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campo requerido: name' });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (existing) {
    return res.status(400).json({ error: `Categoría '${name}' ya existe` });
  }

  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(category);
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: No se puede eliminar (tiene productos asociados)
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

  const products = db.prepare('SELECT COUNT(*) as count FROM products WHERE category = ?').get(category.name);
  if (products.count > 0) {
    return res.status(400).json({
      error: `No se puede eliminar: hay ${products.count} producto(s) en esta categoría`
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Categoría eliminada', category });
});

module.exports = router;
