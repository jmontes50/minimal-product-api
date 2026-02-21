const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'products.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE
  );
`);

// Seed data
function seed() {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();

  if (categoryCount.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const categories = ['electronics', 'clothing', 'books', 'accessories'];
    const insertMany = db.transaction((items) => {
      for (const item of items) insertCategory.run(item);
    });
    insertMany(categories);
    console.log('✓ Categories seeded');
  }

  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, image, category, stock)
      VALUES (@name, @description, @price, @image, @category, @stock)
    `);

    const products = [
      // === ELECTRONICS (6) ===
      {
        name: 'Laptop Pro 15"',
        description: 'Potente laptop para profesionales con procesador de última generación',
        price: 1299.99,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        category: 'electronics',
        stock: 15
      },
      {
        name: 'Auriculares Bluetooth',
        description: 'Auriculares inalámbricos con cancelación de ruido activa',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'electronics',
        stock: 30
      },
      {
        name: 'Smartphone X200',
        description: 'Teléfono inteligente con pantalla AMOLED de 6.5" y cámara de 108MP',
        price: 899.99,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        category: 'electronics',
        stock: 20
      },
      {
        name: 'Tablet Ultra 10"',
        description: 'Tablet ligera con stylus incluido, ideal para diseño y notas',
        price: 549.99,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        category: 'electronics',
        stock: 12
      },
      {
        name: 'Monitor Curvo 27"',
        description: 'Monitor QHD 144Hz con panel IPS para gaming y productividad',
        price: 399.99,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
        category: 'electronics',
        stock: 8
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con switches Cherry MX e iluminación RGB personalizable',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400',
        category: 'electronics',
        stock: 35
      },
      // === CLOTHING (6) ===
      {
        name: 'Camiseta Algodón Premium',
        description: 'Camiseta de algodón 100% orgánico, corte regular',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        category: 'clothing',
        stock: 50
      },
      {
        name: 'Jeans Slim Fit',
        description: 'Pantalón de mezclilla stretch con corte slim fit moderno',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        category: 'clothing',
        stock: 40
      },
      {
        name: 'Chaqueta de Cuero',
        description: 'Chaqueta de cuero sintético con forro interior térmico',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        category: 'clothing',
        stock: 15
      },
      {
        name: 'Zapatillas Running Pro',
        description: 'Zapatillas deportivas con amortiguación de gel y suela antideslizante',
        price: 119.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        category: 'clothing',
        stock: 25
      },
      {
        name: 'Sudadera con Capucha',
        description: 'Sudadera unisex de algodón french terry, ideal para el día a día',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
        category: 'clothing',
        stock: 60
      },
      {
        name: 'Camisa Formal Slim',
        description: 'Camisa de vestir en algodón egipcio con corte entallado',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        category: 'clothing',
        stock: 30
      },
      // === BOOKS (6) ===
      {
        name: 'JavaScript: The Good Parts',
        description: 'Libro clásico sobre las mejores prácticas de JavaScript',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
        category: 'books',
        stock: 20
      },
      {
        name: 'Clean Code',
        description: 'Guía esencial de Robert C. Martin sobre cómo escribir código limpio y mantenible',
        price: 35.00,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        category: 'books',
        stock: 18
      },
      {
        name: 'Design Patterns',
        description: 'Patrones de diseño: elementos de software orientado a objetos reutilizable',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
        category: 'books',
        stock: 10
      },
      {
        name: 'El Programador Pragmático',
        description: 'De aprendiz a maestro: consejos prácticos para desarrolladores modernos',
        price: 38.50,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        category: 'books',
        stock: 14
      },
      {
        name: 'Introducción a los Algoritmos',
        description: 'Referencia completa sobre algoritmos y estructuras de datos (CLRS)',
        price: 55.00,
        image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400',
        category: 'books',
        stock: 8
      },
      {
        name: 'Python Crash Course',
        description: 'Introducción práctica a la programación con Python, orientada a proyectos',
        price: 30.00,
        image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
        category: 'books',
        stock: 22
      },
      // === ACCESSORIES (6) ===
      {
        name: 'Mochila para Laptop',
        description: 'Mochila resistente al agua con compartimento acolchado para laptop de hasta 15"',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        category: 'accessories',
        stock: 25
      },
      {
        name: 'Reloj Smartwatch Sport',
        description: 'Reloj inteligente con GPS, monitor cardíaco y resistencia al agua IP68',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'accessories',
        stock: 18
      },
      {
        name: 'Gafas de Sol Polarizadas',
        description: 'Gafas con protección UV400 y lentes polarizadas, montura ligera',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        category: 'accessories',
        stock: 40
      },
      {
        name: 'Billetera de Cuero',
        description: 'Billetera compacta de cuero genuino con protección RFID',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
        category: 'accessories',
        stock: 35
      },
      {
        name: 'Correa para Apple Watch',
        description: 'Correa de silicona deportiva compatible con Apple Watch Series 4-9',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
        category: 'accessories',
        stock: 50
      },
      {
        name: 'Funda para Laptop 14"',
        description: 'Funda acolchada de neopreno con bolsillo exterior para accesorios',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
        category: 'accessories',
        stock: 30
      }
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) insertProduct.run(item);
    });
    insertMany(products);
    console.log('✓ Products seeded');
  }
}

seed();

module.exports = db;
