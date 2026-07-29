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
  const frame = material('#17230c', 0.72, 0.34)
  const lime = material('#82bb22', 0.46, 0.3)
  const steel = material('#a7b99a', 0.82, 0.26)
  const intake = material('#263a13', 0.62, 0.38)

  addMesh(group, new RoundedBoxGeometry(2.25, 7.4, 2.8, 5, 0.42), frame, [-4.15, -1.35, 0])
  addMesh(group, new RoundedBoxGeometry(2.25, 7.4, 2.8, 5, 0.42), frame, [4.15, -1.35, 0])
  addMesh(group, new RoundedBoxGeometry(1.45, 5.9, 1.95, 4, 0.3), lime, [-4.15, -1.35, 0.45])
  addMesh(group, new RoundedBoxGeometry(1.45, 5.9, 1.95, 4, 0.3), lime, [4.15, -1.35, 0.45])

  addMesh(group, new TorusGeometry(4.15, 1.12, 12, 48, Math.PI), frame, [0, 2.3, 0])
  addMesh(group, new TorusGeometry(4.15, 0.48, 10, 48, Math.PI), lime, [0, 2.3, 0.42])

  addMesh(
    group,
    new CylinderGeometry(2.25, 2.65, 1.15, 16),
    steel,
    [0, -0.35, 1.15],
    [Math.PI / 2, 0, 0],
  )
  addMesh(
    group,
    new CylinderGeometry(1.58, 1.58, 1.35, 16),
    intake,
    [0, -0.35, 1.85],
    [Math.PI / 2, 0, 0],
  )
  addMesh(group, new TorusGeometry(1.65, 0.2, 10, 32), lime, [0, -0.35, 2.58])

  ;[-4.15, 4.15].forEach((x) => {
    addMesh(group, new CylinderGeometry(1.35, 1.6, 0.55, 8), steel, [x, -5.15, 0])
    addMesh(group, new CylinderGeometry(0.72, 0.72, 1.2, 12), lime, [x, 3.05, 0])
  })
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
await exportModel('company-consumer-gate', consumerModel())
