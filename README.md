# Ventage Mall — Malabo

Catálogo e-commerce estilo Zalando/Amazon-mini. Reserva por WhatsApp.

## Estructura

- `index.html` — página principal (SPA)
- `styles.css` — estilos
- `app.js` — lógica (catálogo, búsqueda, filtros, cesta, favoritos, WhatsApp)
- `products.js` — datos de productos (generado)
- `assets/products/*.jpg` — fotos de productos
- `assets/logo.jpg`, `assets/facade.jpg` — imágenes de marca

## Funcionalidades

- Búsqueda instantánea por marca, artículo o categoría
- Filtros por categoría (rayon) y marca
- Ordenación: destacados, precio ↑↓, ofertas primero, marca A–Z
- Ficha de producto con cantidad, precio promo −30%, productos similares
- Cesta persistente (localStorage) con envío agrupado por WhatsApp
- Favoritos persistentes
- Contador de rebajas en tiempo real
- Diseño responsive (mobile-first)
- SEO + datos estructurados (JSON-LD)

## Añadir / editar productos

Edita `products.js`:

```js
{
  "id": "nuevo-producto",        // único, kebab-case
  "brand": "Marca",
  "name": "Nombre del artículo",
  "rayon": "hombre|mujer|relojes|joyas|gafas|maletas",
  "price": 50000,                // precio original en XAF
  "promo": false,                // true = −30% automático
  "image": "assets/products/nuevo-producto.jpg"
}
```

Sube la foto a `assets/products/` con el mismo nombre del `id`.

## Despliegue

Conecta el repo a Vercel. No requiere build: es estático.
