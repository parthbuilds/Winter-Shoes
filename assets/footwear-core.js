/**
 * SSENSE Luxury Footwear Interaction Suite
 * Features:
 * - Mobile Slide-out Category & Collections Drawer
 * - True Sticky Details Panel beside Left Scrolling Cards
 * - Flat Horizontal Ground Shadows (No Angle Tilt)
 * - 3-Shoe Floating Stage with Centered Brand Name & SEE MORE button
 * - Mouse drag, Touch swipe, Trackpad wheel gesture & direct sibling click cycling
 * - Dynamic Store Currency & Variants Dropdown
 * - AJAX Add-to-Bag & Redirect to Luxury Cart Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Store State
  const Store = {
    shoes: [],
    filteredShoes: [],
    currentIndex: 0,
    activeCategory: 'all',
    currentView: 'carousel', // 'carousel', 'grid', 'detail'
    previousView: 'carousel',
    cartCount: 0
  };

  // 1. Load Data Island
  const dataScript = document.getElementById('footwear-collection-data');
  if (dataScript) {
    try {
      Store.shoes = JSON.parse(dataScript.textContent);
      Store.filteredShoes = [...Store.shoes];
    } catch (e) {
      console.warn('Error parsing footwear data island:', e);
    }
  }

  // 2. DOM Cache
  const heroSection = document.getElementById('hero-carousel-section');
  const heroSidebar = document.getElementById('hero-left-sidebar');
  const heroCarouselStage = document.getElementById('hero-carousel-stage');
  const heroCarouselMeta = document.getElementById('hero-carousel-meta');
  const inPlaceDetailHud = document.getElementById('in-place-detail-hud');
  const inPlaceScrollGallery = document.getElementById('in-place-scroll-gallery');

  const gridSection = document.getElementById('collection-grid-section');
  const globalBackBtn = document.getElementById('global-back-btn');
  const navCartBadge = document.getElementById('nav-cart-badge');

  // Mobile Drawer Elements
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileDrawerCloseBtn = document.getElementById('mobile-drawer-close-btn');

  // Carousel Elements
  const imgLeft = document.getElementById('img-shoe-left');
  const imgCenter = document.getElementById('img-shoe-center');
  const imgRight = document.getElementById('img-shoe-right');

  const slotLeft = document.getElementById('floating-shoe-left');
  const slotCenter = document.getElementById('floating-shoe-center');
  const slotRight = document.getElementById('floating-shoe-right');

  const brandHeading = document.getElementById('carousel-brand-heading');
  const productSubtitle = document.getElementById('carousel-product-subtitle');
  const btnSeeMore = document.getElementById('carousel-see-more-action');

  const btnPrev = document.getElementById('btn-carousel-prev');
  const btnNext = document.getElementById('btn-carousel-next');

  // HUD Elements (In-Place Details)
  const hudBrandTitle = document.getElementById('hud-brand-title');
  const hudShoeSubtitle = document.getElementById('hud-shoe-subtitle');
  const hudShoePrice = document.getElementById('hud-shoe-price');
  const hudSizeDropdown = document.getElementById('hud-size-dropdown');
  const hudAddCartBtn = document.getElementById('hud-add-cart-action');

  // Scroll Gallery Elements
  const galleryPhotoFront = document.getElementById('gallery-photo-front');
  const galleryPhotoHeel = document.getElementById('gallery-photo-heel');
  const galleryFullDesc = document.getElementById('gallery-full-description');

  // View Switcher Buttons
  const topGridBtn = document.getElementById('top-view-grid-btn');
  const topCarouselBtn = document.getElementById('top-view-carousel-btn');
  const gridGridBtn = document.getElementById('grid-view-grid-btn');
  const gridCarouselBtn = document.getElementById('grid-view-carousel-btn');

  // 3. MOBILE DRAWER CONTROLS
  function openMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawerOverlay.classList.remove('hidden');
    setTimeout(() => {
      mobileDrawerOverlay.classList.remove('opacity-0');
      mobileDrawer.classList.remove('-translate-x-full');
    }, 10);
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawer.classList.add('-translate-x-full');
    mobileDrawerOverlay.classList.add('opacity-0');
    setTimeout(() => {
      mobileDrawerOverlay.classList.add('hidden');
    }, 300);
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (mobileDrawerCloseBtn) mobileDrawerCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

  // 4. 3-SHOE DEPTH CAROUSEL RENDER & TRANSITIONS
  function renderCarousel(direction = 'next') {
    if (!Store.filteredShoes || Store.filteredShoes.length === 0) return;

    const total = Store.filteredShoes.length;
    const current = Store.filteredShoes[Store.currentIndex];
    const prevIdx = (Store.currentIndex - 1 + total) % total;
    const nextIdx = (Store.currentIndex + 1) % total;

    const prevShoe = Store.filteredShoes[prevIdx];
    const nextShoe = Store.filteredShoes[nextIdx];

    if (window.gsap && imgCenter) {
      const offsetX = direction === 'next' ? 60 : -60;
      gsap.fromTo(imgCenter,
        { opacity: 0, x: offsetX, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );

      gsap.fromTo([brandHeading, productSubtitle],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }

    if (imgCenter && current) {
      imgCenter.src = current.image_primary;
      imgCenter.alt = current.title;
    }
    if (imgLeft && prevShoe) {
      imgLeft.src = prevShoe.image_primary;
      imgLeft.alt = prevShoe.title;
    }
    if (imgRight && nextShoe) {
      imgRight.src = nextShoe.image_primary;
      imgRight.alt = nextShoe.title;
    }

    if (brandHeading && current) {
      brandHeading.textContent = current.brand;
    }
    if (productSubtitle && current) {
      productSubtitle.textContent = current.subtitle || `${current.title} | ${current.price_formatted}`;
    }
  }

  function advanceNext() {
    if (!Store.filteredShoes.length || Store.currentView === 'detail') return;
    Store.currentIndex = (Store.currentIndex + 1) % Store.filteredShoes.length;
    renderCarousel('next');
  }

  function advancePrev() {
    if (!Store.filteredShoes.length || Store.currentView === 'detail') return;
    Store.currentIndex = (Store.currentIndex - 1 + Store.filteredShoes.length) % Store.filteredShoes.length;
    renderCarousel('prev');
  }

  if (btnNext) btnNext.addEventListener('click', advanceNext);
  if (btnPrev) btnPrev.addEventListener('click', advancePrev);
  if (slotRight) slotRight.addEventListener('click', advanceNext);
  if (slotLeft) slotLeft.addEventListener('click', advancePrev);

  // 5. MOUSE DRAG & TOUCH SWIPE & WHEEL GESTURE CONTROLS
  let startX = 0;
  let isDragging = false;
  let wheelTimeout = null;

  if (heroCarouselStage) {
    heroCarouselStage.addEventListener('mousedown', (e) => {
      if (Store.currentView !== 'carousel') return;
      isDragging = true;
      startX = e.clientX;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || Store.currentView !== 'carousel') return;
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) advanceNext();
        else advancePrev();
        isDragging = false;
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    heroCarouselStage.addEventListener('touchstart', (e) => {
      if (Store.currentView !== 'carousel') return;
      startX = e.touches[0].clientX;
    }, { passive: true });

    heroCarouselStage.addEventListener('touchend', (e) => {
      if (Store.currentView !== 'carousel') return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      if (Math.abs(deltaX) > 35) {
        if (deltaX < 0) advanceNext();
        else advancePrev();
      }
    }, { passive: true });

    heroCarouselStage.addEventListener('wheel', (e) => {
      if (Store.currentView !== 'carousel') return;
      if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 35) {
        e.preventDefault();
        if (wheelTimeout) return;
        wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 320);
        if (e.deltaX > 15 || e.deltaY > 15) advanceNext();
        else if (e.deltaX < -15 || e.deltaY < -15) advancePrev();
      }
    }, { passive: false });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (Store.currentView === 'carousel') {
      if (e.key === 'ArrowRight') advanceNext();
      if (e.key === 'ArrowLeft') advancePrev();
    }
  });

  // 6. SUBCATEGORY & COLLECTION LIVE FILTERING
  function applySubcategoryFilter(targetVal) {
    const target = (targetVal || '').toLowerCase();
    Store.activeCategory = target;

    document.querySelectorAll('[data-filter-category], [data-filter-collection]').forEach(link => {
      const linkVal = (link.dataset.filterCollection || link.dataset.filterCategory || '').toLowerCase();
      if (linkVal === Store.activeCategory) {
        link.classList.add('text-[#111111]', 'font-bold');
        link.classList.remove('text-[#777777]');
        const underlineSpan = link.querySelector('span');
        if (underlineSpan) underlineSpan.classList.add('underline');
      } else {
        link.classList.remove('text-[#111111]', 'font-bold');
        link.classList.add('text-[#777777]');
        const underlineSpan = link.querySelector('span');
        if (underlineSpan) underlineSpan.classList.remove('underline');
      }
    });

    if (Store.activeCategory === 'all' || !Store.activeCategory) {
      Store.filteredShoes = [...Store.shoes];
    } else {
      Store.filteredShoes = Store.shoes.filter(s => 
        (s.collections || []).includes(Store.activeCategory) ||
        (s.category || '').toLowerCase() === Store.activeCategory ||
        (s.title || '').toLowerCase().includes(Store.activeCategory)
      );
      if (Store.filteredShoes.length === 0) {
        Store.filteredShoes = [...Store.shoes];
      }
    }

    Store.currentIndex = 0;
    renderCarousel('next');

    // Filter cards in grid view
    document.querySelectorAll('.shoe-card-item').forEach(card => {
      const cCat = (card.dataset.category || '').toLowerCase();
      const match = (Store.activeCategory === 'all' || cCat === Store.activeCategory || cCat.includes(Store.activeCategory));
      card.style.display = match ? 'flex' : 'none';
    });

    closeMobileDrawer();
  }

  document.querySelectorAll('[data-filter-category], [data-filter-collection]').forEach(link => {
    link.addEventListener('click', (e) => {
      const val = link.dataset.filterCollection || link.dataset.filterCategory;
      if (val) {
        e.preventDefault();
        applySubcategoryFilter(val);
      }
    });
  });

  // Search input filters
  const searchInputs = [
    document.getElementById('hero-search-input'), 
    document.getElementById('grid-search-input'),
    document.getElementById('mobile-drawer-search')
  ];
  searchInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          applySubcategoryFilter(Store.activeCategory);
          return;
        }
        Store.filteredShoes = Store.shoes.filter(s =>
          s.title.toLowerCase().includes(query) ||
          s.brand.toLowerCase().includes(query) ||
          (s.category || '').toLowerCase().includes(query)
        );
        if (Store.filteredShoes.length > 0) {
          Store.currentIndex = 0;
          renderCarousel('next');
        }
      });
    }
  });

  // 7. VIEW SWITCHING (Carousel <-> Grid View with Back Button)
  function setViewMode(mode) {
    if (mode === Store.currentView) return;
    Store.previousView = Store.currentView;
    Store.currentView = mode;

    if (mode === 'carousel') {
      if (topCarouselBtn) topCarouselBtn.classList.add('active');
      if (topGridBtn) topGridBtn.classList.remove('active');
      if (gridCarouselBtn) gridCarouselBtn.classList.add('active');
      if (gridGridBtn) gridGridBtn.classList.remove('active');

      if (globalBackBtn) globalBackBtn.classList.add('hidden');

      gridSection.classList.add('hidden');
      gridSection.classList.remove('opacity-100');

      heroSection.classList.remove('hidden');
      if (window.gsap) {
        gsap.fromTo(heroSection, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }
      renderCarousel('next');

    } else if (mode === 'grid') {
      if (topGridBtn) topGridBtn.classList.add('active');
      if (topCarouselBtn) topCarouselBtn.classList.remove('active');
      if (gridGridBtn) gridGridBtn.classList.add('active');
      if (gridCarouselBtn) gridCarouselBtn.classList.remove('active');

      if (globalBackBtn) {
        globalBackBtn.classList.remove('hidden');
        globalBackBtn.classList.add('flex');
        if (window.gsap) {
          gsap.fromTo(globalBackBtn, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
        }
      }

      heroSection.classList.add('hidden');
      heroSection.classList.remove('opacity-100');

      gridSection.classList.remove('hidden');
      gridSection.classList.add('opacity-100');
      if (window.gsap) {
        gsap.fromTo(gridSection, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    }
  }

  if (topGridBtn) topGridBtn.addEventListener('click', () => setViewMode('grid'));
  if (topCarouselBtn) topCarouselBtn.addEventListener('click', () => setViewMode('carousel'));
  if (gridGridBtn) gridGridBtn.addEventListener('click', () => setViewMode('grid'));
  if (gridCarouselBtn) gridCarouselBtn.addEventListener('click', () => setViewMode('carousel'));

  // 8. IN-PLACE DETAIL TRANSITION & DYNAMIC VARIANTS
  window.showProductDetail = function(productId) {
    const shoe = Store.shoes.find(s => String(s.id) === String(productId)) || Store.filteredShoes[Store.currentIndex] || Store.shoes[0];
    if (!shoe) return;

    Store.previousView = Store.currentView;
    Store.currentView = 'detail';

    if (gridSection && !gridSection.classList.contains('hidden')) {
      gridSection.classList.add('hidden');
      heroSection.classList.remove('hidden');
    }

    if (hudBrandTitle) hudBrandTitle.textContent = shoe.brand;
    if (hudShoeSubtitle) hudShoeSubtitle.textContent = shoe.subtitle || `${shoe.title} | ${shoe.price_formatted}`;
    if (hudShoePrice) hudShoePrice.textContent = shoe.price_formatted;

    // Populate Dynamic Variant Dropdown
    if (hudSizeDropdown) {
      hudSizeDropdown.innerHTML = '';
      if (shoe.variants && shoe.variants.length > 0) {
        shoe.variants.forEach(v => {
          const opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = v.title + (v.price ? ` - ${v.price}` : '');
          hudSizeDropdown.appendChild(opt);
        });
      } else {
        ['39', '40', '41', '42', '43', '44'].forEach(sz => {
          const opt = document.createElement('option');
          opt.value = sz;
          opt.textContent = `Size ${sz}`;
          hudSizeDropdown.appendChild(opt);
        });
      }
    }

    const gallery = shoe.gallery || [shoe.image_primary, shoe.image_secondary || shoe.image_primary];
    if (imgCenter) imgCenter.src = shoe.image_primary;
    if (galleryPhotoFront) galleryPhotoFront.src = gallery[0] || shoe.image_primary;
    if (galleryPhotoHeel) galleryPhotoHeel.src = gallery[1] || shoe.image_secondary || gallery[0];
    const mobileGalleryDesc = document.getElementById('mobile-gallery-description');
    if (galleryFullDesc) galleryFullDesc.textContent = shoe.description || shoe.material;
    if (mobileGalleryDesc) mobileGalleryDesc.textContent = shoe.description || shoe.material;

    if (window.gsap) {
      const tl = gsap.timeline();

      if (heroSidebar) tl.to(heroSidebar, { x: -40, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
      tl.to([slotLeft, slotRight, btnPrev, btnNext], { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 0);
      tl.to(heroCarouselMeta, { opacity: 0, y: 15, duration: 0.25, ease: 'power2.in' }, 0);

      tl.add(() => {
        heroCarouselMeta.classList.add('hidden');
        inPlaceDetailHud.classList.remove('hidden');
        inPlaceDetailHud.classList.add('grid');
        inPlaceScrollGallery.classList.remove('hidden');
        inPlaceScrollGallery.classList.add('flex');

        if (globalBackBtn) {
          globalBackBtn.classList.remove('hidden');
          globalBackBtn.classList.add('flex');
          gsap.fromTo(globalBackBtn, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
        }
      });

      tl.fromTo(inPlaceDetailHud, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );

      tl.fromTo(inPlaceScrollGallery,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
        "-=0.2"
      );
    } else {
      if (heroSidebar) heroSidebar.style.opacity = '0';
      slotLeft.style.opacity = '0';
      slotRight.style.opacity = '0';
      heroCarouselMeta.classList.add('hidden');
      inPlaceDetailHud.classList.remove('hidden');
      inPlaceDetailHud.classList.add('grid');
      inPlaceDetailHud.style.opacity = '1';
      inPlaceScrollGallery.classList.remove('hidden');
      inPlaceScrollGallery.classList.add('grid');
      inPlaceScrollGallery.style.opacity = '1';
      if (globalBackBtn) {
        globalBackBtn.classList.remove('hidden');
        globalBackBtn.classList.add('flex');
      }
    }
  };

  if (btnSeeMore) {
    btnSeeMore.addEventListener('click', () => {
      const active = Store.filteredShoes[Store.currentIndex] || Store.shoes[0];
      if (active) window.showProductDetail(active.id);
    });
  }

  // Back Button Action
  if (globalBackBtn) {
    globalBackBtn.addEventListener('click', () => {
      if (Store.currentView === 'grid') {
        setViewMode('carousel');
        return;
      }

      if (window.gsap) {
        const tl = gsap.timeline({
          onComplete: () => {
            inPlaceDetailHud.classList.add('hidden');
            inPlaceDetailHud.classList.remove('grid');
            inPlaceScrollGallery.classList.add('hidden');
            inPlaceScrollGallery.classList.remove('flex', 'grid');
            heroCarouselMeta.classList.remove('hidden');

            const returnView = Store.previousView || 'carousel';
            if (returnView === 'carousel') {
              globalBackBtn.classList.add('hidden');
              heroSection.classList.remove('hidden');
              if (heroSidebar) gsap.to(heroSidebar, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
              gsap.to([slotLeft, slotRight, btnPrev, btnNext], { opacity: 0.65, scale: 0.76, duration: 0.35 });
              gsap.to(heroCarouselMeta, { opacity: 1, y: 0, duration: 0.35 });
              renderCarousel('next');
            } else {
              gridSection.classList.remove('hidden');
              gridSection.classList.add('opacity-100');
              gsap.fromTo(gridSection, { opacity: 0 }, { opacity: 1, duration: 0.35 });
            }
            Store.currentView = returnView;
          }
        });

        tl.to(inPlaceDetailHud, { opacity: 0, y: 25, duration: 0.25, ease: 'power2.in' });
        tl.to(inPlaceScrollGallery, { opacity: 0, duration: 0.25 }, 0);
        if (Store.previousView === 'carousel') {
          tl.to(globalBackBtn, { opacity: 0, duration: 0.2 }, 0);
        }
      } else {
        inPlaceDetailHud.classList.add('hidden');
        inPlaceScrollGallery.classList.add('hidden');
        heroCarouselMeta.classList.remove('hidden');
        if (Store.previousView === 'carousel') {
          globalBackBtn.classList.add('hidden');
        }
        setViewMode(Store.previousView || 'carousel');
      }
    });
  }

  // Accordions in Scroll Gallery
  document.querySelectorAll('.ssense-acc-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const chevron = btn.querySelector('.acc-chevron');
      const isHidden = panel.classList.contains('hidden');

      if (isHidden) {
        panel.classList.remove('hidden');
        if (chevron) chevron.textContent = '▴';
        if (window.gsap) {
          gsap.fromTo(panel, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.2 });
        }
      } else {
        panel.classList.add('hidden');
        if (chevron) chevron.textContent = '⌵';
      }
    });
  });

  // 9. AJAX ADD TO CART & REDIRECT TO CART PAGE
  if (hudAddCartBtn) {
    hudAddCartBtn.addEventListener('click', async () => {
      const selectedVariantId = hudSizeDropdown ? hudSizeDropdown.value : null;
      const activeShoe = Store.filteredShoes[Store.currentIndex] || Store.shoes[0];

      hudAddCartBtn.innerHTML = `<span>ADDING...</span>`;
      hudAddCartBtn.disabled = true;

      try {
        let targetVariantId = null;
        if (selectedVariantId && selectedVariantId !== 'default' && !isNaN(Number(selectedVariantId))) {
          targetVariantId = Number(selectedVariantId);
        } else if (activeShoe.variants && activeShoe.variants.length > 0 && !isNaN(Number(activeShoe.variants[0].id))) {
          targetVariantId = Number(activeShoe.variants[0].id);
        } else if (!isNaN(Number(activeShoe.id))) {
          targetVariantId = Number(activeShoe.id);
        }

        if (!targetVariantId) {
          window.location.href = '/cart';
          return;
        }

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetVariantId, quantity: 1 })
        });

        const data = await res.json();
        Store.cartCount += 1;

        if (navCartBadge) {
          navCartBadge.textContent = Store.cartCount;
          navCartBadge.classList.remove('hidden');
        }

        hudAddCartBtn.innerHTML = `<span>✓ ADDED! GOING TO BAG...</span>`;
        hudAddCartBtn.classList.add('bg-emerald-700');

        setTimeout(() => {
          window.location.href = '/cart';
        }, 500);

      } catch (e) {
        console.error('Cart error:', e);
        window.location.href = '/cart';
      }
    });
  }

  // Initial Load
  renderCarousel('next');
});
