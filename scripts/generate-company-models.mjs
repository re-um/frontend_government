import { mkdir, writeFile } from 'node:fs/promises'
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
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

function addRecycleMark(group, center, scale, surface) {
  const arrowShape = new Shape()
  arrowShape.moveTo(-1.15, -0.22)
  arrowShape.lineTo(0.25, -0.22)
  arrowShape.lineTo(0.25, -0.62)
  arrowShape.lineTo(1.18, 0)
  arrowShape.lineTo(0.25, 0.62)
  arrowShape.lineTo(0.25, 0.22)
  arrowShape.lineTo(-1.15, 0.22)
  arrowShape.closePath()

  ;[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
    const radius = scale * 0.66
    const arrow = addMesh(
      group,
      new ShapeGeometry(arrowShape),
      surface,
      [
        center[0] + Math.cos(angle) * radius,
        center[1] + Math.sin(angle) * radius,
        center[2],
      ],
      [0, 0, angle + Math.PI / 2],
    )
    arrow.scale.setScalar(scale * 0.48)
  })
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
  addRecycleMark(group, [4.65, -2.65, 4.13], 1.7, blue)
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
  addRecycleMark(group, [2.1, 0.35, 3.08], 2.2, badgeFace)

  // 전면 원형 유형 배지
  addMesh(group, new CylinderGeometry(2.65, 2.65, 0.5, 32), badgeFace, [6.3, -2.15, 3.25], [Math.PI / 2, 0, 0])
  addMesh(group, new TorusGeometry(2.25, 0.24, 10, 40), teal, [6.3, -2.15, 3.55])
  addRecycleMark(group, [6.3, -2.15, 3.62], 1.7, teal)
  return group
}

function consumerModel() {
  const group = new Group()
  const gray = material('#7b8895', 0.56, 0.34)
  const grayEdge = material('#465463', 0.68, 0.28)
  const inset = material('#142a3a', 0.5, 0.42)
  const lime = material('#7daa24', 0.44, 0.3)
  const limeLight = material('#a3e635', 0.32, 0.24)
  const glass = material('#4387a7', 0.34, 0.22)
  const badgeFace = material('#d8e0e5', 0.28, 0.38)

  // 회색 생산공장 본체와 옥상 테두리
  addMesh(group, new RoundedBoxGeometry(12.5, 8.1, 7.2, 5, 0.48), gray, [-0.8, -0.7, 0])
  addMesh(group, new RoundedBoxGeometry(13.1, 0.65, 7.7, 4, 0.2), grayEdge, [-0.8, -4.95, 0])
  ;[-5.8, 4.2].forEach((x) =>
    addMesh(group, new RoundedBoxGeometry(0.55, 0.75, 7.6, 3, 0.16), grayEdge, [x, 3.55, 0]),
  )
  ;[-3.6, 0.3, 4.2].forEach((x) =>
    addMesh(group, new RoundedBoxGeometry(2.8, 0.72, 0.48, 3, 0.16), glass, [x, 0.65, 3.72]),
  )
  addMesh(group, new RoundedBoxGeometry(3.4, 3.3, 0.5, 4, 0.22), inset, [-0.8, -2.65, 3.72])

  // 옥상 원료 저장탱크 2개와 연두색 안전 난간
  ;[
    { x: -3.25, height: 5.1 },
    { x: 1.2, height: 4.55 },
  ].forEach((tank) => {
    addMesh(group, new CylinderGeometry(1.65, 1.65, tank.height, 24), gray, [tank.x, 6.1, -0.55])
    ;[-1.3, 0, 1.3].forEach((offset) =>
      addMesh(group, new TorusGeometry(1.66, 0.12, 8, 28), grayEdge, [tank.x, 6.1 + offset, -0.55], [Math.PI / 2, 0, 0]),
    )
    addMesh(group, new TorusGeometry(1.86, 0.15, 8, 32), lime, [tank.x, 8.72, -0.55], [Math.PI / 2, 0, 0])
    ;[-1.55, -0.78, 0, 0.78, 1.55].forEach((offset) => {
      const angle = offset
      addMesh(
        group,
        new CylinderGeometry(0.09, 0.09, 0.85, 8),
        limeLight,
        [tank.x + Math.cos(angle) * 1.82, 9.1, -0.55 + Math.sin(angle) * 1.82],
      )
    })
    // 탱크 측면 사다리
    ;[-0.38, 0.38].forEach((offset) =>
      addMesh(group, new CylinderGeometry(0.09, 0.09, 5.15, 8), lime, [tank.x + 1.78 + offset, 6.05, -0.55]),
    )
    ;[-1.7, -0.85, 0, 0.85, 1.7].forEach((offset) =>
      addMesh(group, new RoundedBoxGeometry(0.92, 0.12, 0.16, 2, 0.04), lime, [tank.x + 1.78, 6.05 + offset, -0.55]),
    )
  })

  // 오른쪽에 적재된 완제품 박스
  ;[
    [5.2, -3.9, 0.9],
    [7, -3.9, 0.9],
    [8.8, -3.9, 0.9],
    [6.1, -2.1, 0.9],
    [7.9, -2.1, 0.9],
    [7, -0.3, 0.9],
  ].forEach(([x, y, z]) => {
    addMesh(group, new RoundedBoxGeometry(1.65, 1.65, 1.65, 3, 0.12), lime, [x, y, z])
    addMesh(group, new RoundedBoxGeometry(0.12, 1.68, 1.68, 2, 0.03), limeLight, [x, y, z])
    addMesh(group, new RoundedBoxGeometry(1.68, 0.12, 1.68, 2, 0.03), limeLight, [x, y, z])
  })

  // 전면 원형 재활용 배지
  addMesh(group, new CylinderGeometry(2.85, 2.85, 0.52, 32), badgeFace, [-5.15, -2.5, 3.7], [Math.PI / 2, 0, 0])
  addMesh(group, new TorusGeometry(2.45, 0.26, 10, 40), lime, [-5.15, -2.5, 4.02])
  addRecycleMark(group, [-5.15, -2.5, 4.1], 1.85, lime)
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
