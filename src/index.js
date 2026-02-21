const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Products API - Swagger',
}));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Root redirect to docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});
