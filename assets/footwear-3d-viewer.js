/**
 * Footwear 3D Canvas Engine using Three.js
 * Generates interactive 3D footwear models (Sneakers, Loafers, Boots, Sandals)
 * with studio lighting, materials, hover tilt, and smooth morphing/transitions.
 */

class Footwear3DViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      autoRotate: true,
      rotationSpeed: 0.008,
      accentColor: 0xff6b4a,
      primaryColor: 0x222226,
      secondaryColor: 0xf5f5f7,
      soleColor: 0xdddddf,
      type: 'sneakers'
    }, options);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shoeGroup = null;
    this.controls = null;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0.15, y: -0.6 };
    this.currentRotation = { x: 0.15, y: -0.6 };
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.2, 5.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Clear existing canvas if any
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting setup
    this.setupLights();

    // Floor & Shadow disc
    this.setupGround();

    // Build Shoe Model
    this.buildShoeModel(this.options.type);

    // Event Listeners
    this.bindEvents();

    // Start loop
    this.animate();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(5, 8, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Rim/Back Light (Cyan/White Luxury Glow)
    this.rimLight = new THREE.DirectionalLight(0x5ce1e6, 1.8);
    this.rimLight.position.set(-6, 4, -5);
    this.scene.add(this.rimLight);

    // Accent Underlight
    this.accentLight = new THREE.PointLight(this.options.accentColor, 2.5, 10);
    this.accentLight.position.set(0, -1.2, 0);
    this.scene.add(this.accentLight);

    // Warm Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    fillLight.position.set(0, -4, 4);
    this.scene.add(fillLight);
  }

  setupGround() {
    // Soft shadow contact disc
    const shadowGeo = new THREE.CircleGeometry(2.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.2;
    this.scene.add(shadowMesh);
  }

  buildShoeModel(type = 'sneakers') {
    if (this.shoeGroup) {
      this.scene.remove(this.shoeGroup);
    }

    this.shoeGroup = new THREE.Group();
    this.shoeGroup.position.set(0, 0, 0);

    const leatherMat = new THREE.MeshStandardMaterial({
      color: this.options.primaryColor,
      roughness: 0.35,
      metalness: 0.15,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: this.options.accentColor,
      roughness: 0.2,
      metalness: 0.4,
    });

    const secondaryMat = new THREE.MeshStandardMaterial({
      color: this.options.secondaryColor,
      roughness: 0.4,
      metalness: 0.1,
    });

    const soleMat = new THREE.MeshStandardMaterial({
      color: this.options.soleColor,
      roughness: 0.8,
      metalness: 0.05,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.1,
      metalness: 0.9,
    });

    if (type === 'sneakers') {
      this.createSneaker(leatherMat, accentMat, secondaryMat, soleMat);
    } else if (type === 'loafers') {
      this.createLoafer(leatherMat, accentMat, soleMat, chromeMat);
    } else if (type === 'boots') {
      this.createBoot(leatherMat, accentMat, soleMat, chromeMat);
    } else if (type === 'sandals') {
      this.createSandal(leatherMat, accentMat, soleMat, chromeMat);
    } else {
      this.createSneaker(leatherMat, accentMat, secondaryMat, soleMat);
    }

    this.shoeGroup.scale.set(1.4, 1.4, 1.4);
    this.shoeGroup.rotation.y = this.targetRotation.y;
    this.shoeGroup.rotation.x = this.targetRotation.x;
    this.scene.add(this.shoeGroup);
  }

  createSneaker(leatherMat, accentMat, secondaryMat, soleMat) {
    // Sole
    const soleGeo = new THREE.BoxGeometry(3.2, 0.45, 1.35);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.6, 0);
    sole.castShadow = true;
    sole.receiveShadow = true;
    this.shoeGroup.add(sole);

    // Tread lines
    for (let i = -1.2; i <= 1.2; i += 0.4) {
      const treadGeo = new THREE.BoxGeometry(0.12, 0.1, 1.4);
      const tread = new THREE.Mesh(treadGeo, accentMat);
      tread.position.set(i, -0.8, 0);
      this.shoeGroup.add(tread);
    }

    // Main Upper Body
    const upperGeo = new THREE.CylinderGeometry(0.65, 0.72, 2.4, 32);
    upperGeo.rotateZ(Math.PI / 2);
    const upper = new THREE.Mesh(upperGeo, leatherMat);
    upper.scale.set(1, 0.6, 0.9);
    upper.position.set(-0.1, -0.1, 0);
    upper.castShadow = true;
    this.shoeGroup.add(upper);

    // Toe Cap
    const toeGeo = new THREE.SphereGeometry(0.68, 32, 16);
    toeGeo.scale(1.1, 0.6, 0.95);
    const toe = new THREE.Mesh(toeGeo, secondaryMat);
    toe.position.set(1.1, -0.25, 0);
    toe.castShadow = true;
    this.shoeGroup.add(toe);

    // Heel Counter
    const heelGeo = new THREE.SphereGeometry(0.72, 32, 16);
    heelGeo.scale(0.9, 1.1, 0.9);
    const heel = new THREE.Mesh(heelGeo, secondaryMat);
    heel.position.set(-1.1, 0.2, 0);
    heel.castShadow = true;
    this.shoeGroup.add(heel);

    // Collar / Ankle Opening
    const collarGeo = new THREE.TorusGeometry(0.55, 0.15, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, accentMat);
    collar.position.set(-0.6, 0.65, 0);
    this.shoeGroup.add(collar);

    // Tongue
    const tongueGeo = new THREE.BoxGeometry(1.2, 0.15, 0.6);
    tongueGeo.rotateZ(-0.4);
    const tongue = new THREE.Mesh(tongueGeo, secondaryMat);
    tongue.position.set(0.1, 0.45, 0);
    this.shoeGroup.add(tongue);

    // Dynamic Futuristic Swoosh / Stripe
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.9, 0.1, 0.66),
      new THREE.Vector3(-0.2, -0.1, 0.72),
      new THREE.Vector3(0.6, 0.2, 0.64),
      new THREE.Vector3(1.1, -0.1, 0.55),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
    const stripe = new THREE.Mesh(tubeGeo, accentMat);
    this.shoeGroup.add(stripe);

    const stripe2 = stripe.clone();
    stripe2.scale.set(1, 1, -1);
    this.shoeGroup.add(stripe2);

    // Laces
    for (let i = 0; i < 4; i++) {
      const laceGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
      laceGeo.rotateX(Math.PI / 2);
      const lace = new THREE.Mesh(laceGeo, accentMat);
      lace.position.set(-0.3 + i * 0.28, 0.35 + i * 0.05, 0);
      lace.rotation.z = -0.1;
      this.shoeGroup.add(lace);
    }
  }

  createLoafer(leatherMat, accentMat, soleMat, chromeMat) {
    // Sleek leather sole with stacked heel
    const soleGeo = new THREE.BoxGeometry(3.3, 0.25, 1.25);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.65, 0);
    sole.castShadow = true;
    this.shoeGroup.add(sole);

    const heelGeo = new THREE.BoxGeometry(0.8, 0.35, 1.2);
    const heel = new THREE.Mesh(heelGeo, soleMat);
    heel.position.set(-1.1, -0.8, 0);
    this.shoeGroup.add(heel);

    // Sculpted upper
    const upperGeo = new THREE.CylinderGeometry(0.6, 0.68, 2.5, 32);
    upperGeo.rotateZ(Math.PI / 2);
    const upper = new THREE.Mesh(upperGeo, leatherMat);
    upper.scale.set(1, 0.5, 0.85);
    upper.position.set(-0.05, -0.3, 0);
    upper.castShadow = true;
    this.shoeGroup.add(upper);

    // Tapered Almond Toe
    const toeGeo = new THREE.ConeGeometry(0.65, 1.2, 32);
    toeGeo.rotateZ(-Math.PI / 2);
    toeGeo.scale(0.5, 1.1, 0.85);
    const toe = new THREE.Mesh(toeGeo, leatherMat);
    toe.position.set(1.2, -0.4, 0);
    this.shoeGroup.add(toe);

    // Loafer Vamp / Apron Stitching
    const apronGeo = new THREE.TorusGeometry(0.45, 0.04, 16, 32);
    apronGeo.rotateX(Math.PI / 2);
    apronGeo.scale(1.4, 0.8, 1);
    const apron = new THREE.Mesh(apronGeo, accentMat);
    apron.position.set(0.3, -0.05, 0);
    this.shoeGroup.add(apron);

    // Metallic Bit / Snaffle Ornament
    const bitGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
    bitGeo.rotateX(Math.PI / 2);
    const bit = new THREE.Mesh(bitGeo, chromeMat);
    bit.position.set(0.2, 0.02, 0);
    this.shoeGroup.add(bit);

    // Bit Rings
    const ringGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
    const ringLeft = new THREE.Mesh(ringGeo, chromeMat);
    ringLeft.position.set(0.2, 0.02, 0.35);
    this.shoeGroup.add(ringLeft);

    const ringRight = new THREE.Mesh(ringGeo, chromeMat);
    ringRight.position.set(0.2, 0.02, -0.35);
    this.shoeGroup.add(ringRight);
  }

  createBoot(leatherMat, accentMat, soleMat, chromeMat) {
    // Rugged Commando Sole
    const soleGeo = new THREE.BoxGeometry(3.4, 0.45, 1.35);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.6, 0);
    sole.castShadow = true;
    this.shoeGroup.add(sole);

    const heelGeo = new THREE.BoxGeometry(0.9, 0.5, 1.3);
    const heel = new THREE.Mesh(heelGeo, soleMat);
    heel.position.set(-1.1, -0.85, 0);
    this.shoeGroup.add(heel);

    // Lower Shoe
    const lowerGeo = new THREE.CylinderGeometry(0.65, 0.7, 2.4, 32);
    lowerGeo.rotateZ(Math.PI / 2);
    const lower = new THREE.Mesh(lowerGeo, leatherMat);
    lower.scale.set(1, 0.55, 0.9);
    lower.position.set(0, -0.15, 0);
    this.shoeGroup.add(lower);

    // Chunky Toe
    const toeGeo = new THREE.SphereGeometry(0.68, 32, 16);
    toeGeo.scale(1.1, 0.6, 0.95);
    const toe = new THREE.Mesh(toeGeo, leatherMat);
    toe.position.set(1.1, -0.25, 0);
    this.shoeGroup.add(toe);

    // Chelsea High Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.55, 0.6, 1.7, 32);
    const shaft = new THREE.Mesh(shaftGeo, leatherMat);
    shaft.position.set(-0.4, 0.65, 0);
    this.shoeGroup.add(shaft);

    // Elastic Side Gusset (Signature Chelsea boot feature)
    const gussetGeo = new THREE.BoxGeometry(0.45, 1.1, 0.05);
    const gussetMat = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.9 });
    const gussetL = new THREE.Mesh(gussetGeo, gussetMat);
    gussetL.position.set(-0.4, 0.75, 0.56);
    this.shoeGroup.add(gussetL);

    const gussetR = new THREE.Mesh(gussetGeo, gussetMat);
    gussetR.position.set(-0.4, 0.75, -0.56);
    this.shoeGroup.add(gussetR);

    // Pull Tab
    const tabGeo = new THREE.BoxGeometry(0.12, 0.45, 0.15);
    const tab = new THREE.Mesh(tabGeo, accentMat);
    tab.position.set(-0.95, 1.4, 0);
    tab.rotation.z = -0.2;
    this.shoeGroup.add(tab);
  }

  createSandal(leatherMat, accentMat, soleMat, chromeMat) {
    // Sculpted Ergonomic Footbed & Platform Sole
    const soleGeo = new THREE.BoxGeometry(3.3, 0.4, 1.4);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.6, 0);
    sole.castShadow = true;
    this.shoeGroup.add(sole);

    // Cork/Suede Footbed
    const bedGeo = new THREE.BoxGeometry(3.2, 0.15, 1.35);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x4a3c31, roughness: 0.85 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, -0.35, 0);
    this.shoeGroup.add(bed);

    // Wide Front Cross Strap 1
    const strap1Geo = new THREE.TorusGeometry(0.7, 0.12, 16, 32, Math.PI);
    strap1Geo.rotateY(Math.PI / 2);
    strap1Geo.scale(0.9, 0.7, 1);
    const strap1 = new THREE.Mesh(strap1Geo, leatherMat);
    strap1.position.set(0.6, -0.3, 0);
    strap1.rotation.y = 0.25;
    this.shoeGroup.add(strap1);

    // Wide Cross Strap 2
    const strap2 = strap1.clone();
    strap2.position.set(-0.2, -0.25, 0);
    strap2.rotation.y = -0.25;
    this.shoeGroup.add(strap2);

    // Buckle Detail
    const buckleGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
    const buckle = new THREE.Mesh(buckleGeo, chromeMat);
    buckle.position.set(-0.2, 0.15, 0.7);
    buckle.rotation.y = Math.PI / 2;
    this.shoeGroup.add(buckle);
  }

  setColors({ primary, accent, secondary, sole }) {
    if (primary) this.options.primaryColor = primary;
    if (accent) {
      this.options.accentColor = accent;
      if (this.accentLight) this.accentLight.color.set(accent);
    }
    if (secondary) this.options.secondaryColor = secondary;
    if (sole) this.options.soleColor = sole;

    this.buildShoeModel(this.options.type);
  }

  setType(type) {
    if (this.options.type === type) return;
    this.options.type = type;
    
    // GSAP morph spin
    if (window.gsap && this.shoeGroup) {
      gsap.to(this.shoeGroup.scale, {
        x: 0.1, y: 0.1, z: 0.1,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          this.buildShoeModel(type);
          this.shoeGroup.scale.set(0.1, 0.1, 0.1);
          gsap.to(this.shoeGroup.scale, {
            x: 1.4, y: 1.4, z: 1.4,
            duration: 0.45,
            ease: 'back.out(1.5)'
          });
        }
      });
    } else {
      this.buildShoeModel(type);
    }
  }

  bindEvents() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.012;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.7, this.targetRotation.x + deltaY * 0.01));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Touch support
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.015;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.7, this.targetRotation.x + deltaY * 0.012));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.shoeGroup) {
      // Auto floating oscillation
      this.shoeGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;

      if (!this.isDragging && this.options.autoRotate) {
        this.targetRotation.y += this.options.rotationSpeed;
      }

      // Smooth damping interpolation
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;

      this.shoeGroup.rotation.x = this.currentRotation.x;
      this.shoeGroup.rotation.y = this.currentRotation.y;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.innerHTML = '';
      this.renderer.dispose();
    }
  }
}

window.Footwear3DViewer = Footwear3DViewer;
