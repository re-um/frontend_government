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
  const dark = material('#17202b', 0.74, 0.36)
  const inset = material('#070c13', 0.5, 0.46)
  const blue = material('#1677c8', 0.48, 0.28)
  const steel = material('#8998a8', 0.82, 0.25)
  const glass = material('#58c7ff', 0.3, 0.2)
  const smoke = new MeshStandardMaterial({
    color: '#b9d7e8',
    metalness: 0,
    roughness: 0.9,
    transparent: true,
    opacity: 0.55,
  })

  // 한눈에 공장으로 읽히는 넓은 본체
  addMesh(group, new RoundedBoxGeometry(13.2, 6.2, 6.4, 5, 0.48), dark, [-1, -1.6, 0])
  addMesh(group, new RoundedBoxGeometry(12.4, 0.7, 6.7, 3, 0.2), steel, [-1, -4.9, 0])

  // 스케치의 톱니형 공장 지붕 실루엣
  ;[-5.1, -1.7, 1.7].forEach((x) => {
    addMesh(
      group,
      new CylinderGeometry(2.25, 2.25, 5.9, 3),
      dark,
      [x, 2.15, 0],
      [Math.PI / 2, 0, Math.PI / 2],
    )
    addMesh(
      group,
      new CylinderGeometry(2.35, 2.35, 0.38, 3),
      blue,
      [x, 2.15, 3.08],
      [Math.PI / 2, 0, Math.PI / 2],
    )
  })

  // 전면 출입구, 창문과 폐합성수지 배출 표시
  addMesh(group, new RoundedBoxGeometry(3.3, 3.8, 0.5, 4, 0.22), inset, [-3.8, -1.95, 3.22])
  addMesh(group, new RoundedBoxGeometry(2.65, 0.55, 0.58, 3, 0.16), blue, [-3.8, -0.75, 3.48])
  ;[-0.8, 1.1, 3].forEach((x) =>
    addMesh(group, new RoundedBoxGeometry(1.25, 1.45, 0.45, 3, 0.18), glass, [x, -1.5, 3.3]),
  )

  // 오른쪽 높은 굴뚝
  addMesh(group, new RoundedBoxGeometry(3.25, 11.8, 3.25, 5, 0.42), dark, [6.3, 2.1, 0])
  addMesh(group, new RoundedBoxGeometry(3.65, 0.65, 3.65, 3, 0.2), steel, [6.3, 8.15, 0])
  addMesh(group, new RoundedBoxGeometry(3.05, 0.45, 3.05, 3, 0.16), blue, [6.3, 8.55, 0])
  addMesh(group, new RoundedBoxGeometry(1.05, 6.9, 0.5, 3, 0.18), inset, [6.3, 2.25, 1.75])
  addMesh(group, new RoundedBoxGeometry(0.55, 6.2, 0.58, 3, 0.16), blue, [6.3, 2.25, 2.02])

  // 굴뚝에서 부드럽게 굽어 올라가는 세 줄의 연기
  ;[-0.85, 0, 0.85].forEach((offset, streamIndex) => {
    for (let index = 0; index < 5; index += 1) {
      const y = 9.4 + index * 1.25
      const x = 6.3 + offset + Math.sin(index * 1.1 + streamIndex) * 0.55
      const radius = 0.52 + index * 0.13
      addMesh(group, new SphereGeometry(radius, 14, 10), smoke, [x, y, offset * 0.35])
    }
  })

  // 공장 바깥 방향으로 나온 압축 폐플라스틱 베일
  addMesh(group, new RoundedBoxGeometry(3.6, 1.15, 2.1, 4, 0.22), steel, [-7.15, -3.45, 0.35])
  addMesh(group, new RoundedBoxGeometry(1.55, 1.25, 1.55, 3, 0.18), blue, [-8.15, -2.65, 0.35])
  return group
}

function processorModel() {
  const group = new Group()
  const dark = material('#151c22', 0.76, 0.34)
  const inset = material('#071014', 0.52, 0.44)
  const teal = material('#128b84', 0.48, 0.28)
  const steel = material('#89989c', 0.84, 0.24)
  const inputBlue = material('#176bb7', 0.5, 0.3)
  const outputLime = material('#82b72b', 0.46, 0.3)

  // 다단계 원통형 처리 챔버
  ;[
    { y: 2.8, height: 4.1, radius: 4.35 },
    { y: -0.95, height: 3.35, radius: 4.15 },
    { y: -4.25, height: 3.2, radius: 4.05 },
  ].forEach((stage) => {
    addMesh(
      group,
      new CylinderGeometry(stage.radius, stage.radius, stage.height, 24),
      dark,
      [0, stage.y, 0],
    )
  })

  ;[5.05, 0.95, -2.65, -5.95].forEach((y) =>
    addMesh(group, new TorusGeometry(4.42, 0.28, 10, 48), steel, [0, y, 0], [Math.PI / 2, 0, 0]),
  )

  // 상단 파쇄 호퍼와 맞물림 커터
  addMesh(group, new CylinderGeometry(4.7, 3.7, 2.1, 6), dark, [0, 6.15, 0])
  addMesh(group, new CylinderGeometry(4.82, 4.82, 0.32, 6), teal, [0, 7.15, 0])
  ;[-1.35, 1.35].forEach((x) => {
    addMesh(
      group,
      new CylinderGeometry(0.82, 0.82, 3.2, 12),
      steel,
      [x, 5.75, 2.7],
      [0, 0, Math.PI / 2],
    )
    ;[-1.1, 0, 1.1].forEach((offset) =>
      addMesh(group, new TorusGeometry(1.02, 0.18, 8, 18), teal, [x + offset, 5.75, 2.7]),
    )
  })

  // 세척·선별 및 펠릿 상태 확인창
  addMesh(group, new RoundedBoxGeometry(1.8, 3.05, 0.45, 4, 0.24), inset, [0, 2.9, 4.18])
  addMesh(group, new RoundedBoxGeometry(1.18, 2.4, 0.52, 4, 0.2), teal, [0, 2.9, 4.38])
  addMesh(group, new RoundedBoxGeometry(3.1, 1.45, 0.45, 4, 0.22), inset, [0, -4.25, 3.88])
  ;[-0.9, -0.3, 0.3, 0.9].forEach((x) =>
    addMesh(group, new SphereGeometry(0.22, 10, 8), outputLime, [x, -4.25, 4.18]),
  )

  // 건조·여과 밴드
  ;[-1.55, -0.75, 0.05, 0.85, 1.65].forEach((x) =>
    addMesh(group, new BoxGeometry(0.32, 2.15, 0.34), steel, [x, -0.95, 4.02]),
  )

  // 좌측 폐합성수지 유입 포트 / 우측 재생원료 배출 포트
  ;[3.25, 0, -3.25].forEach((y) => {
    addMesh(
      group,
      new CylinderGeometry(0.95, 1.18, 2.2, 14),
      steel,
      [-4.85, y, 0],
      [0, 0, Math.PI / 2],
    )
    addMesh(
      group,
      new CylinderGeometry(0.72, 0.72, 0.55, 14),
      inputBlue,
      [-5.95, y, 0],
      [0, 0, Math.PI / 2],
    )
    addMesh(
      group,
      new CylinderGeometry(0.95, 1.18, 2.2, 14),
      steel,
      [4.85, y, 0],
      [0, 0, Math.PI / 2],
    )
    addMesh(
      group,
      new CylinderGeometry(0.72, 0.72, 0.55, 14),
      outputLime,
      [5.95, y, 0],
      [0, 0, Math.PI / 2],
    )
  })

  addMesh(group, new CylinderGeometry(4.55, 4.85, 0.65, 20), steel, [0, -6.3, 0])
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
