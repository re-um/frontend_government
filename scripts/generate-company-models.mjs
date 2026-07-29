import { mkdir, writeFile } from 'node:fs/promises'
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((value) => {
      this.result = value
      this.onloadend?.()
    })
  }
}

const material = (color, metalness = 0.7, roughness = 0.28) =>
  new MeshStandardMaterial({ color, metalness, roughness })

const addMesh = (group, geometry, surface, position = [0, 0, 0], rotation = [0, 0, 0]) => {
  const mesh = new Mesh(geometry, surface)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  group.add(mesh)
  return mesh
}

function emitterModel() {
  const group = new Group()
  const dark = material('#07182d', 0.88, 0.22)
  const blue = material('#1677d2', 0.72, 0.2)
  const steel = material('#7896b8', 0.92, 0.18)
  addMesh(group, new CylinderGeometry(4.5, 4.8, 7.8, 6), dark)
  addMesh(group, new CylinderGeometry(4.65, 4.65, 0.45, 6), blue, [0, 3.75, 0])
  addMesh(group, new CylinderGeometry(4.65, 4.65, 0.35, 6), blue, [0, -3.75, 0])
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2
    addMesh(
      group,
      new BoxGeometry(0.42, 4.8, 1.15),
      steel,
      [Math.cos(angle) * 4.15, 0, Math.sin(angle) * 4.15],
      [0, -angle, 0],
    )
  }
  ;[-1.45, 0, 1.45].forEach((x) =>
    addMesh(group, new BoxGeometry(0.8, 2.2, 0.28), blue, [x, 0.6, 4.18]),
  )
  addMesh(group, new CylinderGeometry(0.65, 0.8, 2.3, 12), steel, [-1.4, 4.9, 0])
  addMesh(group, new CylinderGeometry(0.5, 0.62, 3.1, 12), steel, [1.35, 5.3, 0.4])
  return group
}

function processorModel() {
  const group = new Group()
  const teal = material('#0c928b', 0.58, 0.2)
  const dark = material('#062525', 0.86, 0.24)
  const steel = material('#91b9ba', 0.9, 0.16)
  addMesh(group, new SphereGeometry(5.2, 32, 24), dark)
  addMesh(group, new SphereGeometry(4.55, 32, 24), teal)
  ;[0, Math.PI / 2].forEach((rotation) =>
    addMesh(group, new TorusGeometry(5.55, 0.24, 10, 64), steel, [0, 0, 0], [rotation, 0, 0]),
  )
  addMesh(group, new TorusGeometry(5.55, 0.24, 10, 64), steel, [0, 0, 0], [0, Math.PI / 2, 0])
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2
    addMesh(
      group,
      new CylinderGeometry(0.75, 0.95, 2.3, 12),
      steel,
      [Math.cos(angle) * 5.9, Math.sin(angle) * 5.9, 0],
      [0, 0, angle + Math.PI / 2],
    )
  }
  return group
}

function consumerModel() {
  const group = new Group()
  const body = material('#161b22', 0.74, 0.36)
  const inset = material('#070b10', 0.46, 0.48)
  const lime = material('#83b92c', 0.42, 0.32)
  const steel = material('#87929d', 0.82, 0.24)
  const product = material('#cbd5c2', 0.26, 0.5)

  // 중앙 생산설비 본체와 전면 개방형 생산실
  addMesh(group, new RoundedBoxGeometry(10.2, 6.7, 5.8, 6, 0.7), body, [-0.6, 0, 0])
  addMesh(group, new RoundedBoxGeometry(7.3, 4.25, 0.55, 5, 0.32), inset, [-0.2, -0.15, 3])
  addMesh(group, new RoundedBoxGeometry(7.4, 0.75, 0.7, 4, 0.24), lime, [-0.15, -1.25, 3.45])

  // 노출형 제조 롤러
  ;[-2.35, -0.8, 0.8, 2.35].forEach((x) => {
    addMesh(
      group,
      new CylinderGeometry(0.42, 0.42, 1.25, 14),
      steel,
      [x, 0.55, 3.45],
      [0, 0, Math.PI / 2],
    )
    addMesh(group, new TorusGeometry(0.58, 0.13, 8, 20), lime, [x, 0.55, 3.48])
  })

  // 왼쪽 재생원료 투입구
  addMesh(
    group,
    new CylinderGeometry(2.55, 2.8, 1.65, 20),
    steel,
    [-6.15, 0, 0],
    [0, 0, Math.PI / 2],
  )
  addMesh(group, new TorusGeometry(2.25, 0.42, 12, 40), lime, [-7, 0, 0], [0, Math.PI / 2, 0])
  addMesh(
    group,
    new CylinderGeometry(1.75, 1.75, 1.85, 20),
    inset,
    [-6.95, 0, 0],
    [0, 0, Math.PI / 2],
  )

  // 오른쪽 완제품 출하 도크와 컨베이어
  addMesh(group, new RoundedBoxGeometry(3.6, 5.1, 4.9, 5, 0.45), body, [6.25, -0.45, 0])
  addMesh(group, new RoundedBoxGeometry(2.75, 3.65, 0.45, 4, 0.22), inset, [6.25, -0.25, 2.55])
  addMesh(group, new RoundedBoxGeometry(4.2, 0.6, 3.2, 4, 0.2), steel, [7.4, -2.65, 1.25])
  addMesh(group, new RoundedBoxGeometry(1.1, 1.8, 1.1, 4, 0.2), product, [5.75, -0.95, 2.85])
  addMesh(group, new CylinderGeometry(0.55, 0.48, 1.75, 14), product, [6.85, -0.95, 2.85])

  // 상부 냉각 및 상태 모듈
  ;[-2.2, 0.1, 2.4].forEach((x) => {
    addMesh(group, new CylinderGeometry(1.05, 1.05, 0.45, 16), steel, [x, 3.55, 0])
    addMesh(group, new CylinderGeometry(0.72, 0.72, 0.5, 12), inset, [x, 3.82, 0])
  })
  ;[-1.05, -0.35, 0.35, 1.05].forEach((x) =>
    addMesh(group, new BoxGeometry(0.38, 0.38, 0.3), lime, [x + 0.2, 1.85, 3.05]),
  )
  return group
}

async function exportModel(name, model) {
  const exporter = new GLTFExporter()
  const data = await new Promise((resolve, reject) =>
    exporter.parse(model, resolve, reject, { binary: true, onlyVisible: true }),
  )
  await writeFile(new URL(`../public/models/${name}.glb`, import.meta.url), Buffer.from(data))
}

await mkdir(new URL('../public/models', import.meta.url), { recursive: true })
await exportModel('company-emitter', emitterModel())
await exportModel('company-processor', processorModel())
await exportModel('company-consumer-factory', consumerModel())
