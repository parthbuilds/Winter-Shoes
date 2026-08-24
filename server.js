const express = require('express');
const { Liquid } = require('liquidjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Liquid engine
const engine = new Liquid({
  root: [
    path.resolve(__dirname, 'layout'),
    path.resolve(__dirname, 'templates'),
    path.resolve(__dirname, 'sections'),
    path.resolve(__dirname, 'snippets')
  ],
  extname: '.liquid',
  cache: false
});

// Register standard Shopify Liquid tags / filters
engine.registerFilter('asset_url', (input) => `/assets/${input}`);
engine.registerFilter('escape', (input) => (input ? String(input).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''));
engine.registerFilter('money', (input) => `$${(input / 100).toFixed(2)}`);
engine.registerFilter('default', (input, defaultVal) => (input !== undefined && input !== null && input !== '' ? input : defaultVal));

// Register Shopify tags
function registerBlockTag(tagName, endTagName) {
  engine.registerTag(tagName, {
    parse: function(tagToken, remainTokens) {
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream
        .on(`tag:${endTagName}`, () => stream.stop())
        .on('template', () => {})
        .on('end', () => {
          throw new Error(`tag ${tagName} not closed with ${endTagName}`);
        });
      stream.start();
    },
    render: function() {
      return '';
    }
  });
}

registerBlockTag('schema', 'endschema');
registerBlockTag('stylesheet', 'endstylesheet');
registerBlockTag('javascript', 'endjavascript');

app.engine('liquid', engine.express());
app.set('views', [
  path.resolve(__dirname, 'templates'),
  path.resolve(__dirname, 'layout')
]);
app.set('view engine', 'liquid');

// Serve static assets
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use(express.json());

// In-memory cart
let cart = {
  items: [],
  item_count: 0,
  total_price: 0
};

// Generic Luxury Designer Dataset
const footwearProducts = [
  {
    id: 1,
    title: "Crystals Kinetic High-Top",
    brand: "ATELIER NOIR",
    category: "sneakers",
    price: 159000,
    price_formatted: "1590$",
    subtitle: "Crystals Kinetic High-Top | 1590$",
    image_primary: "/assets/shoes/70.png",
    image_secondary: "/assets/shoes/74.png",
    gallery: [
      "/assets/shoes/70.png",
      "/assets/shoes/74.png"
    ],
    description: "Low-top panelled mesh and technical canvas sneakers in navy and off-white. Ergonomic cushioned footbed with responsive shock-absorbing midsole. Round cap toe and padded collar. Made in Italy.",
    material: "Upper: Suede, Leather & Technical Canvas. Sole: Molded vulcanized rubber.",
    available_sizes: [39, 40, 41, 42, 43, 44, 45, 46],
    colorways: ["#3d7a42", "#dbe84a"]
  },
  {
    id: 2,
    title: "Chunky Suede Platform Loafers",
    brand: "STUDIO EDITION",
    category: "loafers",
    price: 97500,
    price_formatted: "975$",
    subtitle: "Chunky Suede Platform Loafers | 975$",
    image_primary: "/assets/shoes/71.png",
    image_secondary: "/assets/shoes/75.png",
    gallery: [
      "/assets/shoes/71.png",
      "/assets/shoes/75.png"
    ],
    description: "Handcrafted Italian buffed suede chunky platform loafers in camel tan. Molded cleated rubber lug sole with tonal topstitching and reinforced moc toe.",
    material: "Upper: Calfskin Suede. Sole: High-traction Rubber. Made in Italy.",
    available_sizes: [39, 40, 41, 42, 43, 44, 45],
    colorways: ["#c4a47c", "#1a1a1a"]
  },
  {
    id: 3,
    title: "Calfskin Minimalist Court Sneakers",
    brand: "ESSENTIALS LAB",
    category: "sneakers",
    price: 39500,
    price_formatted: "395$",
    subtitle: "Calfskin Minimalist Court Sneakers | 395$",
    image_primary: "/assets/shoes/72.png",
    image_secondary: "/assets/shoes/70.png",
    gallery: [
      "/assets/shoes/72.png",
      "/assets/shoes/70.png"
    ],
    description: "Low-top buffed leather sneakers in rich cognac brown. Gold-tone logo stamp at outer heel. Tonal lace-up closure with padded collar and textured rubber sole.",
    material: "Upper: 100% Calfskin. Lining: Leather. Sole: Rubber.",
    available_sizes: [40, 41, 42, 43, 44, 45],
    colorways: ["#8b5a2b", "#ffffff"]
  },
  {
    id: 4,
    title: "Perforated Suede Wingtip Brogues",
    brand: "HERITAGE ATELIER",
    category: "boots",
    price: 35000,
    price_formatted: "350$",
    subtitle: "Perforated Suede Wingtip Brogues | 350$",
    image_primary: "/assets/shoes/73.png",
    image_secondary: "/assets/shoes/71.png",
    gallery: [
      "/assets/shoes/73.png",
      "/assets/shoes/71.png"
    ],
    description: "Derby-style wingtip brogues in charcoal grey suede. Classic brogue perforations with stacked leather heel and Goodyear welted sole.",
    material: "Upper: Charcoal Suede. Sole: Stacked Leather & Rubber. Made in Portugal.",
    available_sizes: [39, 40, 41, 42, 43, 44],
    colorways: ["#3a3a3a", "#5a5a5a"]
  },
  {
    id: 5,
    title: "Navy Grain Leather Sneakers",
    brand: "MONOCHROME STUDIO",
    category: "sneakers",
    price: 85000,
    price_formatted: "850$",
    subtitle: "Navy Grain Leather Sneakers | 850$",
    image_primary: "/assets/shoes/74.png",
    image_secondary: "/assets/shoes/72.png",
    gallery: [
      "/assets/shoes/74.png",
      "/assets/shoes/72.png"
    ],
    description: "Low-top full-grain calf leather sneakers in deep navy blue. Contrast white laces and off-white vulcanized rubber cupsole. Ergonomic memory-foam insole.",
    material: "Upper: Grain Calf Leather. Lining: Calfskin. Sole: Rubber.",
    available_sizes: [40, 41, 42, 43, 44, 45, 46],
    colorways: ["#1c2d42", "#ffffff"]
  },
  {
    id: 6,
    title: "Dual Canvas Skate Sneakers",
    brand: "AVANT GARDE",
    category: "sandals",
    price: 65000,
    price_formatted: "650$",
    subtitle: "Dual Canvas Skate Sneakers | 650$",
    image_primary: "/assets/shoes/75.png",
    image_secondary: "/assets/shoes/73.png",
    gallery: [
      "/assets/shoes/75.png",
      "/assets/shoes/73.png"
    ],
    description: "Two-tone low-top skate sneakers in denim blue and warm stone canvas. Seamless vulcanized rubber sidewall with signature herringbone tread pattern.",
    material: "Upper: Heavy Canvas & Suede. Sole: Vulcanized Rubber.",
    available_sizes: [39, 40, 41, 42, 43, 44, 45],
    colorways: ["#4a6b82", "#d2b48c"]
  }
];

// Helper to render sections cleanly
function cleanSectionContent(filename) {
  const filePath = path.resolve(__dirname, 'sections', `${filename}.liquid`);
  let content = fs.readFileSync(filePath, 'utf8');
  // Strip {% schema %}...{% endschema %} for clean preview render
  content = content.replace(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/gi, '');
  return content;
}

// Main store route
app.get('/', async (req, res) => {
  try {
    const heroSectionLiquid = cleanSectionContent('footwear-hero-3d-carousel');
    const gridSectionLiquid = cleanSectionContent('footwear-collection-grid');

    const heroSectionHtml = await engine.parseAndRender(heroSectionLiquid, {});
    const gridSectionHtml = await engine.parseAndRender(gridSectionLiquid, {});

    const contentForLayout = `
      ${heroSectionHtml}
      ${gridSectionHtml}
      <script id="footwear-collection-data" type="application/json">
        ${JSON.stringify(footwearProducts)}
      </script>
    `;

    const html = await engine.renderFile('theme', {
      page_title: "SSENSE | Luxury Footwear & Shoes",
      page_description: "Curated luxury footwear featuring high-fashion Sneakers, Sandals, Loafers, and Boots.",
      content_for_layout: contentForLayout,
      content_for_header: "<!-- Shopify Header Hooks Mock -->"
    });

    res.send(html);
  } catch (err) {
    console.error('Render error:', err);
    res.status(500).send(`Server Error: ${err.message}`);
  }
});

// JSON API endpoints
app.get('/products/footwear.json', (req, res) => {
  const category = req.query.category;
  if (category && category !== 'all') {
    return res.json(footwearProducts.filter(p => p.category === category));
  }
  res.json(footwearProducts);
});

app.post('/cart/add.js', (req, res) => {
  const { id, quantity = 1, properties = {} } = req.body;
  const product = footwearProducts.find(p => p.id === parseInt(id));
  
  if (product) {
    cart.items.push({
      ...product,
      quantity,
      properties
    });
    cart.item_count += quantity;
    cart.total_price += product.price * quantity;
    return res.json({ success: true, cart });
  }
  res.status(404).json({ error: "Product not found" });
});

app.get('/cart.js', (req, res) => {
  res.json(cart);
});

app.listen(PORT, () => {
  console.log(`✨ SSENSE Luxury Footwear Store running locally at http://localhost:${PORT}`);
});
