import { prefersReducedMotion } from './utils.js';

export async function initHeroWebGL() {
  if (prefersReducedMotion()) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const { default: THREE } = await import('three');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
  camera.position.z = 4;

  // Icosahedron with wireframe
  const geo = new THREE.IcosahedronGeometry(1.6, 4);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x14E0D5, wireframe: true, transparent: true, opacity: 0.35
  });
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0x0FB9B1, transparent: true, opacity: 0.08, side: THREE.BackSide
  });
  const mesh = new THREE.Mesh(geo, fillMat);
  const wire = new THREE.Mesh(geo, wireMat);
  scene.add(mesh, wire);

  // Particles
  const pCount = 800;
  const pGeo   = new THREE.BufferGeometry();
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 10;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x0FB9B1, size: 0.015, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  scene.add(new THREE.Points(pGeo, pMat));

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  const observer = new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: 0 });
  observer.observe(canvas);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    t += 0.0008;
    mesh.rotation.y += 0.0008;
    wire.rotation.y += 0.0008;
    mesh.rotation.x += (my * 0.0006 - mesh.rotation.x) * 0.05;
    wire.rotation.x += (my * 0.0006 - wire.rotation.x) * 0.05;
    mesh.rotation.y += (mx * 0.0008 - mesh.rotation.y) * 0.02;
    wire.rotation.y += (mx * 0.0008 - wire.rotation.y) * 0.02;

    // Fade on scroll
    const progress = Math.min(window.scrollY / (window.innerHeight * 0.6), 1);
    renderer.domElement.style.opacity = 1 - progress;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
