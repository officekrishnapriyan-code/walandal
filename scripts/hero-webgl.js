import { prefersReducedMotion } from './utils.js';

export async function initHeroWebGL() {
  if (prefersReducedMotion()) return;
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let THREE;
  try { THREE = await import('three'); }
  catch { return; }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 4.2;

  // ---------- Mesh: displaced icosahedron ----------
  const geo = new THREE.IcosahedronGeometry(1.6, 4);
  const noiseGLSL = `
    // Simplex 3D noise (Ashima)
    vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.18 },
    uColor: { value: new THREE.Color('#14E0D5') },
  };

  const baseShader = (frag) => new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: noiseGLSL + `
      uniform float uTime;
      uniform float uAmp;
      varying float vNoise;
      void main(){
        vec3 p = position;
        float n = snoise(p * 0.9 + vec3(uTime * 0.25));
        p += normal * n * uAmp;
        vNoise = n;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: frag,
  });

  const fillMat = baseShader(`
    uniform vec3 uColor;
    varying float vNoise;
    void main(){
      float a = 0.08 + vNoise * 0.04;
      gl_FragColor = vec4(uColor * 0.85, a);
    }
  `);
  fillMat.depthWrite = false;

  const wireMat = baseShader(`
    uniform vec3 uColor;
    varying float vNoise;
    void main(){
      gl_FragColor = vec4(uColor, 0.35);
    }
  `);
  wireMat.wireframe = true;

  const meshFill = new THREE.Mesh(geo, fillMat);
  const meshWire = new THREE.Mesh(geo, wireMat);
  scene.add(meshFill, meshWire);

  // ---------- Particle field ----------
  const PARTICLE_COUNT = 800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: '#0FB9B1',
    size: 0.025,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // ---------- Resize ----------
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Mouse + scroll ----------
  let mx = 0, my = 0;
  let targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = mx * 0.0008 * 600;
    targetRotX = my * 0.0006 * 600;
  }, { passive: true });

  function fadeOnScroll() {
    const vh = window.innerHeight;
    const t = Math.min(1, Math.max(0, window.scrollY / (vh * 0.6)));
    canvas.style.opacity = String(1 - t);
  }
  window.addEventListener('scroll', fadeOnScroll, { passive: true });

  // ---------- Render with IO control ----------
  let running = true;
  const io = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
  }, { threshold: 0.01 });
  io.observe(canvas);

  const clock = new THREE.Clock();
  function animate() {
    if (running) {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      meshFill.rotation.y += 0.0008;
      meshWire.rotation.y = meshFill.rotation.y;
      meshFill.rotation.x += (targetRotX - meshFill.rotation.x) * 0.04;
      meshFill.rotation.y += (targetRotY - meshFill.rotation.y) * 0.04 * 0.3;
      meshWire.rotation.x = meshFill.rotation.x;

      points.rotation.y += 0.0004;
      points.rotation.x = Math.sin(t * 0.15) * 0.05;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }

  // Reveal canvas
  requestAnimationFrame(() => canvas.classList.add('is-ready'));
  animate();
}
