import { mkdir, writeFile } from 'node:fs/promises'
import {
  BoxGeometry,
  ConeGeometry,
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
  const gray = material('#788694', 0.56, 0.34)
  const grayEdge = material('#465565', 0.66, 0.28)
  const badgeFace = material('#d8e0e7', 0.3, 0.36)
  const inset = material('#18324a', 0.48, 0.38)
  const blue = material('#1769ad', 0.48, 0.27)
  const glass = material('#3b91c5', 0.34, 0.2)
  const smoke = new MeshStandardMaterial({
    color: '#dce5ea',
    metalness: 0,
    roughness: 0.95,
    transparent: true,
    opacity: 0.72,
  })

  // 참고 이미지처럼 밝고 단순한 공장 본체
  addMesh(group, new RoundedBoxGeometry(13.2, 6.1, 6.5, 5, 0.42), gray, [0, -2, 0])
  addMesh(group, new RoundedBoxGeometry(13.8, 0.65, 7, 4, 0.24), grayEdge, [0, -5.2, 0])

  // 파란색 톱니 지붕
  ;[-4.25, -0.4, 3.45].forEach((x) => {
    addMesh(
      group,
      new CylinderGeometry(2.45, 2.45, 6.25, 3),
      gray,
      [x, 2, 0],
      [Math.PI / 2, 0, Math.PI / 2],
    )
    addMesh(
      group,
      new RoundedBoxGeometry(3.7, 0.34, 6.5, 3, 0.12),
      blue,
      [x + 0.45, 3.15, 0],
      [0, 0, -0.48],
    )
  })

  // 전면 출입문과 가로 창
  addMesh(group, new RoundedBoxGeometry(2.65, 3.55, 0.5, 4, 0.2), inset, [-4.35, -2.25, 3.35])
  addMesh(group, new RoundedBoxGeometry(3.35, 2.5, 0.5, 4, 0.2), inset, [-0.8, -2.75, 3.35])
  ;[-4.1, -1.25, 1.6, 4.45].forEach((x) =>
    addMesh(group, new RoundedBoxGeometry(2.05, 0.75, 0.48, 3, 0.16), glass, [x, -0.25, 3.38]),
  )

  // 파란 띠가 있는 원통형 굴뚝 2개
  ;[
    { x: -4.8, y: 7.15, height: 8.8 },
    { x: -1.95, y: 6.55, height: 7.6 },
  ].forEach((stack) => {
    addMesh(group, new CylinderGeometry(1.05, 1.25, stack.height, 20), gray, [stack.x, stack.y, -1.4])
    addMesh(group, new CylinderGeometry(1.1, 1.1, 1.05, 20), blue, [stack.x, stack.y + 0.8, -1.4])
    addMesh(group, new TorusGeometry(1.08, 0.16, 8, 28), inset, [stack.x, stack.y + stack.height / 2, -1.4], [Math.PI / 2, 0, 0])
  })

  // 두 굴뚝에서 오른쪽으로 흘러가는 둥근 연기
  ;[
    { x: -4.8, y: 11.7, phase: 0 },
    { x: -1.95, y: 10.45, phase: 0.7 },
  ].forEach((stream) => {
    for (let index = 0; index < 6; index += 1) {
      const x = stream.x + index * 0.85
      const y = stream.y + index * 0.62 + Math.sin(index + stream.phase) * 0.28
      const radius = 0.58 + index * 0.1
      addMesh(group, new SphereGeometry(radius, 14, 10), smoke, [x, y, -1.4])
    }
  })

  // 전면 원형 재활용 배지
  addMesh(group, new CylinderGeometry(2.65, 2.65, 0.52, 32), badgeFace, [4.65, -2.65, 3.75], [Math.PI / 2, 0, 0])
  addMesh(group, new TorusGeometry(2.25, 0.24, 10, 40), blue, [4.65, -2.65, 4.05])
  ;[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
    const centerX = 4.65 + Math.cos(angle) * 0.92
    const centerY = -2.65 + Math.sin(angle) * 0.92
    const tangentX = -Math.sin(angle)
    const tangentY = Math.cos(angle)
    addMesh(
      group,
      new RoundedBoxGeometry(0.42, 1.2, 0.22, 2, 0.08),
      blue,
      [centerX, centerY, 4.13],
      [0, 0, angle],
    )
    addMesh(
      group,
      new ConeGeometry(0.52, 0.78, 3),
      blue,
      [centerX + tangentX * 0.72, centerY + tangentY * 0.72, 4.13],
      [0, 0, angle],
    )
  })
  return group
}

function processorModel() {
  const group = new Group()
  const gray = material('#778695', 0.55, 0.34)
  const grayEdge = material('#445363', 0.68, 0.27)
  const inset = material('#152a3a', 0.5, 0.42)
  const teal = material('#0f918c', 0.48, 0.28)
  const tealLight = material('#35c9bf', 0.35, 0.25)
  const tire = material('#111820', 0.36, 0.56)
  const waste = material('#a3adb4', 0.18, 0.7)
  const badgeFace = material('#d7e0e5', 0.28, 0.38)

  // 차량 하부와 청록색 처리 적재함
  addMesh(group, new RoundedBoxGeometry(13.8, 1.1, 5.6, 4, 0.28), grayEdge, [0, -3.7, 0])
  addMesh(group, new RoundedBoxGeometry(8.3, 7.3, 5.9, 5, 0.48), teal, [2.1, 0.4, 0])
  addMesh(group, new RoundedBoxGeometry(7.5, 0.55, 6.15, 3, 0.18), tealLight, [2.1, 4.15, 0])

  // 회색 운전석
  addMesh(group, new RoundedBoxGeometry(5.2, 5.7, 5.7, 6, 0.65), gray, [-5, -0.45, 0])
  addMesh(group, new RoundedBoxGeometry(4.25, 1.65, 0.5, 4, 0.2), inset, [-5, 0.65, 2.98])
  addMesh(group, new RoundedBoxGeometry(1.45, 1.85, 0.42, 3, 0.16), inset, [-2.75, -0.15, 2.85])
  addMesh(group, new RoundedBoxGeometry(3.2, 0.55, 0.45, 3, 0.16), grayEdge, [-5, -2.35, 2.95])
  ;[-6.45, -3.55].forEach((x) =>
    addMesh(group, new RoundedBoxGeometry(0.55, 0.42, 0.35, 2, 0.1), tealLight, [x, -1.8, 3.02]),
  )

  // 차량 바퀴
  ;[-4.9, 0.55, 4.5].forEach((x) => {
    ;[-3.05, 3.05].forEach((z) => {
      addMesh(group, new CylinderGeometry(1.15, 1.15, 0.65, 20), tire, [x, -3.75, z], [Math.PI / 2, 0, 0])
      addMesh(group, new CylinderGeometry(0.48, 0.48, 0.72, 16), gray, [x, -3.75, z], [Math.PI / 2, 0, 0])
    })
  })

  // 후면 폐합성수지 수거함과 압축 블록
  addMesh(group, new RoundedBoxGeometry(4.6, 3.2, 4.5, 4, 0.3), teal, [7.3, -2, 0])
  addMesh(group, new RoundedBoxGeometry(4, 0.45, 4.65, 3, 0.14), tealLight, [7.3, -0.35, 0])
  ;[-1.25, -0.42, 0.42, 1.25].forEach((xOffset) =>
    [-0.9, 0, 0.9].forEach((zOffset) =>
      addMesh(group, new RoundedBoxGeometry(0.65, 0.72, 0.65, 2, 0.12), waste, [7.3 + xOffset, 0.2, zOffset]),
    ),
  )
  ;[6.2, 7.55, 8.9].forEach((x) =>
    [1.75, 2.65].forEach((y) =>
      addMesh(group, new RoundedBoxGeometry(1.05, 1.05, 1.05, 2, 0.14), waste, [x, y, -1.8]),
    ),
  )

  // 적재함 측면의 선명한 재활용 마크
  ;[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
    const centerX = 2.1 + Math.cos(angle) * 1.45
    const centerY = 0.35 + Math.sin(angle) * 1.45
    const tangentX = -Math.sin(angle)
    const tangentY = Math.cos(angle)
    addMesh(
      group,
      new RoundedBoxGeometry(0.52, 1.55, 0.25, 2, 0.08),
      badgeFace,
      [centerX, centerY, 3.08],
      [0, 0, angle],
    )
    addMesh(
      group,
      new ConeGeometry(0.62, 0.9, 3),
      badgeFace,
      [centerX + tangentX * 0.9, centerY + tangentY * 0.9, 3.08],
      [0, 0, angle],
    )
  })

  // 전면 원형 유형 배지
  addMesh(group, new CylinderGeometry(2.65, 2.65, 0.5, 32), badgeFace, [6.3, -2.15, 3.25], [Math.PI / 2, 0, 0])
  addMesh(group, new TorusGeometry(2.25, 0.24, 10, 40), teal, [6.3, -2.15, 3.55])
  ;[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
    const centerX = 6.3 + Math.cos(angle) * 0.92
    const centerY = -2.15 + Math.sin(angle) * 0.92
    const tangentX = -Math.sin(angle)
    const tangentY = Math.cos(angle)
    addMesh(group, new RoundedBoxGeometry(0.42, 1.2, 0.22, 2, 0.08), teal, [centerX, centerY, 3.62], [0, 0, angle])
    addMesh(
      group,
      new ConeGeometry(0.52, 0.78, 3),
      teal,
      [centerX + tangentX * 0.72, centerY + tangentY * 0.72, 3.62],
      [0, 0, angle],
    )
  })
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
await exportModel('company-emitter-collector', emitterModel())
await exportModel('company-processor-reactor', processorModel())
await exportModel('company-consumer-factory', consumerModel())
