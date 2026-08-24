# SSENSE Luxury Footwear Theme — Shopify Integration & Deployment Guide

This guide walks you through deploying the complete **SSENSE Luxury Footwear 3D Carousel & Studio Gallery Experience** directly to your live or staging Shopify store.

---

## 📁 1. Project Directory Structure

Your theme files are organized according to Shopify Online Store 2.0 architecture standards:

```text
Shopify store shoes/
├── assets/
│   ├── logo.svg                     # Centered brand SVG logo
│   ├── footwear-theme.css           # Core styling, 3D transforms & sticky layout
│   ├── footwear-core.js            # GSAP animations, swipe/drag, AJAX cart & modal logic
│   └── shoes/
│       ├── 70.png ... 75.png        # Transparent shoe cutouts
├── layout/
│   └── theme.liquid                 # Master theme shell with sticky nav & mobile drawer
├── sections/
│   ├── footwear-hero-3d-carousel.liquid  # 3D Depth Floating Carousel & In-Place Details
│   └── footwear-collection-grid.liquid   # Responsive 3-Column Luxury Grid View
├── templates/
│   └── index.liquid                 # Homepage Liquid template
└── config/
    └── settings_schema.json         # Shopify Customizer Schema
```

---

## 🚀 2. Deployment Methods

You can upload and activate this theme using either **Shopify CLI** (recommended for developers) or the **Shopify Admin Theme Editor** (manual upload).

---

### Method A: Deploy via Shopify CLI (Recommended)

1. **Install & Login to Shopify CLI**:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   shopify auth login --store your-store-name.myshopify.com
   ```

2. **Push Theme Files to Shopify**:
   ```bash
   cd "/Users/parth/Developer/Shopify store shoes"
   
   # Push as a development draft theme to preview safely:
   shopify theme dev --store your-store-name.myshopify.com
   
   # Or push directly to your store's theme library:
   shopify theme push --store your-store-name.myshopify.com
   ```

3. **Publish Theme**:
   - Go to **Shopify Admin > Online Store > Themes**.
   - Locate your uploaded theme under **Theme Library** and click **Publish**.

---

### Method B: Manual Upload via Shopify Admin

1. **Open the Theme Code Editor**:
   - Log into **Shopify Admin**.
   - Navigate to **Online Store > Themes**.
   - On your active theme (e.g., Dawn or a blank OS 2.0 theme), click **Actions (⋯) > Edit code**.

2. **Upload Asset Files**:
   - In the sidebar, navigate to **Assets** and click **Add a new asset**:
     - Upload [logo.svg](file:///Users/parth/Developer/Shopify%20store%20shoes/assets/logo.svg)
     - Upload [footwear-theme.css](file:///Users/parth/Developer/Shopify%20store%20shoes/assets/footwear-theme.css)
     - Upload [footwear-core.js](file:///Users/parth/Developer/Shopify%20store%20shoes/assets/footwear-core.js)
     - Upload your transparent product images (`70.png`, `71.png`, etc.) or host them in Shopify Files (**Content > Files**).

3. **Create/Update Layout File**:
   - Open or create `layout/theme.liquid`.
   - Copy the contents from [layout/theme.liquid](file:///Users/parth/Developer/Shopify%20store%20shoes/layout/theme.liquid).
   - Ensure the GSAP CDN scripts and stylesheet links are placed inside the `<head>`:
     ```liquid
     <script src="https://cdn.tailwindcss.com"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
     <link rel="stylesheet" href="{{ 'footwear-theme.css' | asset_url }}">
     ```

4. **Create Section Files**:
   - In the sidebar under **Sections**, click **Add a new section**:
     - Name: `footwear-hero-3d-carousel.liquid`
     - Paste contents from [sections/footwear-hero-3d-carousel.liquid](file:///Users/parth/Developer/Shopify%20store%20shoes/sections/footwear-hero-3d-carousel.liquid).
   - Click **Add a new section**:
     - Name: `footwear-collection-grid.liquid`
     - Paste contents from [sections/footwear-collection-grid.liquid](file:///Users/parth/Developer/Shopify%20store%20shoes/sections/footwear-collection-grid.liquid).

5. **Update Homepage Template**:
   - In `templates/index.liquid`, render the sections:
     ```liquid
     {% section 'footwear-hero-3d-carousel' %}
     {% section 'footwear-collection-grid' %}
     ```

6. Click **Save** on all modified files.

---

## 🛍️ 3. Connecting Live Shopify Products & Collections

To replace the mock dataset with live Shopify products dynamically:

### Mapping Liquid Product Data
In [sections/footwear-hero-3d-carousel.liquid](file:///Users/parth/Developer/Shopify%20store%20shoes/sections/footwear-hero-3d-carousel.liquid), you can output your footwear collection directly into the data island:

```liquid
<script id="footwear-collection-data" type="application/json">
[
  {% for product in collections['shoes'].products %}
    {
      "id": {{ product.id | json }},
      "title": {{ product.title | json }},
      "brand": {{ product.vendor | default: 'ATELIER NOIR' | json }},
      "category": {{ product.type | default: 'sneakers' | downcase | json }},
      "price": {{ product.price | json }},
      "price_formatted": "{{ product.price | money_without_trailing_zeros }}$",
      "subtitle": "{{ product.title }} | {{ product.price | money_without_trailing_zeros }}$",
      "image_primary": {{ product.featured_image | image_url: width: 1200 | json }},
      "image_secondary": {{ product.images[1] | default: product.featured_image | image_url: width: 1200 | json }},
      "gallery": [
        {{ product.featured_image | image_url: width: 1200 | json }},
        {{ product.images[1] | default: product.featured_image | image_url: width: 1200 | json }}
      ],
      "description": {{ product.description | strip_html | truncatewords: 40 | json }},
      "material": "Upper: Leather / Suede. Sole: Molded Rubber. Made in Italy.",
      "available_sizes": [39, 40, 41, 42, 43, 44, 45, 46],
      "colorways": ["#111111", "#ffffff"]
    }{% unless forloop.last %},{% endunless %}
  {% endfor %}
]
</script>
```

---

## 🛒 4. AJAX Cart & Checkout Integration

The theme uses Shopify's official Cart API (`/cart/add.js` and `/cart.js`):
- When a user clicks **ADD TO CART**, [assets/footwear-core.js](file:///Users/parth/Developer/Shopify%20store%20shoes/assets/footwear-core.js) sends an asynchronous `POST` request with the selected variant size.
- The cart counter badge in the sticky header dynamically increments with a bounce micro-animation.
- Integrates seamlessly with standard Shopify checkout flows.

---

## 🎨 5. Key Features Included in this Suite

1. **Dead-Center Luxury SVG Logo**:
   - Sits mathematically dead-center in the sticky top navigation header across all screen sizes.
2. **3D Floating Stage with Ground Shadows**:
   - Upright main and sibling shoes with dedicated horizontal ground shadows.
3. **In-Place Detail View Transition**:
   - Clicking **SEE MORE** smoothly pins the active shoe and slides in the bottom HUD and product details from the bottom.
4. **Desktop Sticky Details Panel**:
   - The right details container sticks to the viewport under the navigation while the left tall studio cards scroll.
5. **Mobile Sliding Drawer (Hamburger Menu)**:
   - High z-index category drawer housing `RECHERCHER` and `SHOES` subcategory filtering on mobile.
6. **Double-View Switcher**:
   - Toggle between the 3D Depth Carousel and the 3-Column Luxury Product Grid at any time.

---

## 🔍 6. Testing & Quality Checklist

| Component | Expected Behavior |
| :--- | :--- |
| **Top Navigation** | Centered SVG logo, bold MEN/WOMAN active styling, sticky on scroll |
| **View Switcher** | Embedded in top right header, toggles between 3D Carousel and Grid View |
| **Desktop Carousel** | Upright sibling shoes, flat horizontal shadows, circular arrow buttons |
| **Interaction Gestures** | Mouse drag, touch swipe, trackpad wheel, and arrow keys cycle shoes |
| **Detail Transition** | Sibling shoes fade, center shoe stays, details glide in from the bottom |
| **Sticky Details** | Right details panel stays pinned while left tall 3:4 studio cards scroll |
| **Mobile Layout** | Top-left ☰ button triggers slide-out category drawer, large center shoe |
| **Cart Integration** | Size selector + ADD TO CART triggers Shopify `/cart/add.js` and updates badge |
