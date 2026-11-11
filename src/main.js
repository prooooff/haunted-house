import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  brickTexture,
  roofTexture,
  woodTexture,
  grassTexture,
  stoneTexture,
  signTexture,
} from './textures.js'

// ---------- Слайдери ----------
const el = (id) => document.getElementById(id)
const fogSlider = el('fog-density')
const ghostSlider = el('ghost-speed')
const doorSlider = el('door-light')
const moonSlider = el('moon-light')
const sunSlider = el('sun-elevation')
const grassSlider = el('grass-repeat')

// ---------- Рендерер ----------
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
el('app').appendChild(renderer.domElement)

// ---------- Сцена, туман, камера ----------
const scene = new THREE.Scene()
const fogColor = new THREE.Color('#0b1026')
scene.fog = new THREE.FogExp2(fogColor, Number(fogSlider.value))
scene.background = fogColor

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500)
camera.position.set(9, 5, 13)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 1.5, 0)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.02

// ---------- Небо (Sky) + зірки ----------
const sky = new Sky()
sky.scale.setScalar(220)
scene.add(sky)
const skyU = sky.material.uniforms
skyU.turbidity.value = 10
skyU.rayleigh.value = 1.2
skyU.mieCoefficient.value = 0.005
skyU.mieDirectionalG.value = 0.8

function updateSun() {
  const elev = THREE.MathUtils.degToRad(Number(sunSlider.value))
  const sun = new THREE.Vector3().setFromSphericalCoords(1, Math.PI / 2 - elev, 0.4)
  skyU.sunPosition.value.copy(sun)
}
sunSlider.addEventListener('input', updateSun)
updateSun()

const stars = (() => {
  const n = 900
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const r = 130 + Math.random() * 70
    const t = Math.random() * Math.PI * 2
    const p = Math.acos(Math.random() * 0.9)
    pos[i * 3] = r * Math.sin(p) * Math.cos(t)
    pos[i * 3 + 1] = r * Math.cos(p) + 20
    pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dfeaff', size: 0.35, sizeAttenuation: true }))
})()
scene.add(stars)

// ---------- Освітлення ----------
scene.add(new THREE.AmbientLight('#20304f', 1.1))

const moon = new THREE.DirectionalLight('#bcd2ff', Number(moonSlider.value))
moon.position.set(12, 22, 6)
moon.castShadow = true
moon.shadow.mapSize.set(2048, 2048)
Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, far: 60 })
moon.shadow.bias = -0.0005
scene.add(moon)
moonSlider.addEventListener('input', () => { moon.intensity = Number(moonSlider.value) })

const doorLight = new THREE.PointLight('#ffb36b', Number(doorSlider.value), 14, 2)
doorLight.position.set(0, 2.4, 2.4)
scene.add(doorLight)

// ---------- Матеріали (текстури) ----------
const grassMap = grassTexture()
const grassMat = new THREE.MeshStandardMaterial({ map: grassMap, roughness: 0.9 })
grassMap.repeat.set(Number(grassSlider.value), Number(grassSlider.value))
grassSlider.addEventListener('input', () => {
  const v = Number(grassSlider.value)
  grassMap.repeat.set(v, v)
  grassMap.needsUpdate = true
})

const brickMat = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.85 })
const roofMat = new THREE.MeshStandardMaterial({ map: roofTexture(), roughness: 0.75 })
const woodMat = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.7 })
const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.9 })
const signMat = new THREE.MeshStandardMaterial({ map: signTexture('RIP'), roughness: 0.8 })
const fenceMat = new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.85 })
const windowMat = new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb84d', emissiveIntensity: 1.6 })

// ---------- Земля ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), grassMat)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// ---------- Будинок ----------
const house = new THREE.Group()
scene.add(house)

const walls = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 3), brickMat)
walls.position.y = 1.2
walls.castShadow = walls.receiveShadow = true
house.add(walls)

const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.8, 4), roofMat)
roof.position.y = 2.4 + 0.9
roof.rotation.y = Math.PI / 4
roof.castShadow = true
house.add(roof)

const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), brickMat)
chimney.position.set(1, 3.1, 0.4)
chimney.castShadow = true
house.add(chimney)

const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.08), woodMat)
door.position.set(0, 0.7, 1.5)
door.castShadow = true
house.add(door)

function addWindow(x, y, z, ry) {
  const w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), windowMat)
  w.position.set(x, y, z)
  w.rotation.y = ry
  house.add(w)
}
addWindow(-1, 1.5, 1.51, 0)
addWindow(1, 1.5, 1.51, 0)
addWindow(1.51, 1.5, -0.8, Math.PI / 2)
addWindow(1.51, 1.5, 0.8, Math.PI / 2)

// ---------- Паркан (кругова огорожа) ----------
const fence = new THREE.Group()
scene.add(fence)
const postGeo = new THREE.BoxGeometry(0.16, 1, 0.16)
for (let i = 0; i < 22; i++) {
  const a = (i / 22) * Math.PI * 2
  const post = new THREE.Mesh(postGeo, fenceMat)
  post.position.set(Math.cos(a) * 8, 0.5, Math.sin(a) * 8)
  post.castShadow = true
  fence.add(post)
}
for (const h of [0.55, 0.85]) {
  const rail = new THREE.Mesh(new THREE.TorusGeometry(8, 0.05, 8, 80), fenceMat)
  rail.rotation.x = Math.PI / 2
  rail.position.y = h
  fence.add(rail)
}

// ---------- Надгробки ----------
for (let i = 0; i < 7; i++) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.15), stoneMat)
  const a = Math.random() * Math.PI * 2
  const r = 3.5 + Math.random() * 3.2
  g.position.set(Math.cos(a) * r, 0.4, Math.sin(a) * r)
  g.rotation.y = Math.random() * Math.PI
  g.castShadow = g.receiveShadow = true
  scene.add(g)
}

// ---------- Дерев'яна табличка ----------
const sign = new THREE.Group()
const signPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), woodMat)
signPost.position.y = 0.6
signPost.castShadow = true
sign.add(signPost)
const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.06), signMat)
board.position.y = 1.25
board.castShadow = true
sign.add(board)
sign.position.set(2.2, 0, 4.5)
sign.rotation.y = -0.5
scene.add(sign)

// ---------- Каміння ----------
const rockMat = new THREE.MeshStandardMaterial({ color: '#7a7a7a', roughness: 0.95 })
for (let i = 0; i < 4; i++) {
  const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.35), rockMat)
  const a = Math.random() * Math.PI * 2
  const rad = 5 + Math.random() * 2
  r.position.set(Math.cos(a) * rad, 0.15, Math.sin(a) * rad)
  r.rotation.set(Math.random(), Math.random(), Math.random())
  r.castShadow = true
  scene.add(r)
}

// ---------- Привиди ----------
const ghostMat = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#8fd8ff',
  emissiveIntensity: 0.9,
  transparent: true,
  opacity: 0.85,
  roughness: 0.4,
})
const ghosts = []
for (let i = 0; i < 3; i++) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 7), ghostMat)
  body.position.y = 0.7
  body.castShadow = true
  g.add(body)
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#0a1620' })
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat)
  eye.position.set(0.18, 0.85, 0.4)
  g.add(eye)
  const eye2 = eye.clone()
  eye2.position.x = -0.18
  g.add(eye2)
  g.position.set((i - 1) * 3, 0, 3 + i * 1.5)
  scene.add(g)
  ghosts.push({ group: g, phase: i * 2.1 })
}

// ---------- Анімація ----------
const clock = new THREE.Clock()
function animate() {
  const t = clock.getElapsedTime()
  const speed = Number(ghostSlider.value)

  // привиди: плавання + обертання
  ghosts.forEach(({ group, phase }, i) => {
    group.position.y = 0.2 + Math.sin(t * speed * 1.4 + phase) * 0.5
    group.position.x = (i - 1) * 3 + Math.cos(t * speed * 0.5 + phase) * 1.2
    group.position.z = 3 + i * 1.5 + Math.sin(t * speed * 0.4 + phase) * 1.5
    group.rotation.y = t * speed * 0.7 + i
  })

  // миготіння світла біля дверей
  const flicker = 0.7 + Math.sin(t * 13) * 0.15 + Math.sin(t * 7.3) * 0.1 + Math.sin(t * 29) * 0.05
  doorLight.intensity = Number(doorSlider.value) * flicker

  // туман
  scene.fog.density = Number(fogSlider.value)

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

// ---------- Розмір вікна ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
