# Products API

API REST de productos y categorías construida con Express, SQLite y documentada con Swagger.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

## Documentación

Una vez levantado el servidor, visita [http://localhost:3000/api-docs](http://localhost:3000/api-docs) para ver la documentación interactiva de Swagger.

## Endpoints

### Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos (filtro: `?category=`) |
| GET | `/api/products/:id` | Obtener producto por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

### Categorías
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

## Deploy en Render

1. Crear un **Web Service** en [render.com](https://render.com)
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variable**: `BASE_URL` = URL del servicio en Render

## Seed automático

Al iniciar, si la base de datos está vacía, se insertan automáticamente productos y categorías de ejemplo.
