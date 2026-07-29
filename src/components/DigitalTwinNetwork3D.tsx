import ForceGraph3D, {
  type ForceGraphMethods,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  FogExp2,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MOUSE,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Maximize2, Move, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type CompanyType = 'emitter' | 'processor' | 'consumer'
type MatchStatus = 'approved' | 'active' | 'pending'

interface TwinNode {
  id: string
  name: string
  type: CompanyType
  material: string
  amount: number
  color: string
  weight: number
}

interface TwinLink {
  id: string
  source: string
  target: string
  material: string
  amount: number
  status: MatchStatus
  color: string
  score: number
  carbonReduction: number
  weight: number
}

const nodeColors: Record<CompanyType, string> = {
  emitter: '#38bdf8',
  processor: '#2dd4bf',
  consumer: '#a3e635',
}

const linkColors: Record<MatchStatus, string> = {
  approved: '#a78bfa',
  active: '#22d3ee',
  pending: '#64748b',
}

export function DigitalTwinNetwork3D({
  companies,
  matches,
  visibleCompanyIds,
  selectedCompanyId,
  selectedMatchId,
  onSelectCompany,
  onSelectMatch,
  onClearSelection,
}: {
  companies: Array<{
    id: string
    name: string
    type: CompanyType
    material: string
    monthlyAmount: number
    connections: number
    approvedMatches: number
    status: MatchStatus
  }>
  matches: Array<{
    id: string
    source: string
    target: string
    material: string
    amount: number
    status: MatchStatus
    score: number
    carbonReduction: number
  }>
  visibleCompanyIds: Set<string>
  selectedCompanyId?: string
  selectedMatchId?: string
  onSelectCompany: (id: string) => void
  onSelectMatch: (id: string) => void
  onClearSelection: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef =
    useRef<ForceGraphMethods<TwinNode, TwinLink> | undefined>(undefined)
  const initialNodePositionsRef = useRef(
    new Map<string, { x: number; y: number; z: number }>(),
  )
  const [size, setSize] = useState({ width: 800, height: 680 })
  const [flowing, setFlowing] = useState(true)
  const [panMode, setPanMode] = useState(false)
  const [companyModels, setCompanyModels] = useState<
    Record<CompanyType, Group | null>
  >({
    emitter: null,
    processor: null,
    consumer: null,
  })

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const resize = () =>
      setSize({
        width: Math.max(container.clientWidth, 320),
        height: Math.max(container.clientHeight, 540),
      })
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    const loader = new GLTFLoader()
    Promise.all([
      loader.loadAsync('/models/company-emitter.glb'),
      loader.loadAsync('/models/company-processor.glb'),
      loader.loadAsync('/models/company-consumer.glb'),
    ]).then(([emitter, processor, consumer]) => {
      if (cancelled) return
      setCompanyModels({
        emitter: emitter.scene,
        processor: processor.scene,
        consumer: consumer.scene,
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const controls = graphRef.current?.controls()
    if (!controls) return
    controls.mouseButtons.LEFT = panMode ? MOUSE.PAN : MOUSE.ROTATE
    controls.update()
  }, [panMode])

  const graphData = useMemo(() => {
    const maxAmount = Math.max(...companies.map((company) => company.monthlyAmount), 1)
    const companyCarbon = new Map<string, number>()
    matches.forEach((match) => {
      companyCarbon.set(
        match.source,
        (companyCarbon.get(match.source) ?? 0) + match.carbonReduction,
      )
      companyCarbon.set(
        match.target,
        (companyCarbon.get(match.target) ?? 0) + match.carbonReduction,
      )
    })
    const maxCompanyCarbon = Math.max(...companyCarbon.values(), 1)
    const materialCounts = new Map<string, number>()
    companies.forEach((company) => {
      materialCounts.set(
        company.material,
        (materialCounts.get(company.material) ?? 0) + 1,
      )
    })
    const maxLinkAmount = Math.max(...matches.map((match) => match.amount), 1)
    const maxLinkCarbon = Math.max(
      ...matches.map((match) => match.carbonReduction),
      1,
    )

    const nodes: TwinNode[] = companies
      .filter((company) => visibleCompanyIds.has(company.id))
      .map((company) => ({
        id: company.id,
        name: company.name,
        type: company.type,
        material: company.material,
        amount: company.monthlyAmount,
        color: nodeColors[company.type],
        weight:
          (company.monthlyAmount / maxAmount) * 0.4 +
          ((companyCarbon.get(company.id) ?? 0) / maxCompanyCarbon) * 0.35 +
          ({ approved: 1, active: 0.75, pending: 0.4 }[company.status] * 0.15) +
          (1 / (materialCounts.get(company.material) ?? 1)) * 0.1,
      }))
    const ids = new Set(nodes.map((node) => node.id))
    const links: TwinLink[] = matches
      .filter((match) => ids.has(match.source) && ids.has(match.target))
      .map((match) => ({
        ...match,
        color: linkColors[match.status],
        weight:
          (match.amount / maxLinkAmount) * 0.4 +
          (match.score / 100) * 0.25 +
          (match.carbonReduction / maxLinkCarbon) * 0.2 +
          ({ approved: 1, active: 0.72, pending: 0.4 }[match.status] * 0.15),
      }))
    return { nodes, links }
  }, [companies, matches, visibleCompanyIds])

  useEffect(() => {
    initialNodePositionsRef.current.clear()
  }, [graphData])

  const createPlatform = (node: NodeObject<TwinNode>) => {
    const group = new Group()
    const selected = node.id === selectedCompanyId
    const color = selected ? '#bef264' : node.color
    const modelTemplate = companyModels[node.type]

    if (modelTemplate) {
      const model = modelTemplate.clone(true)
      model.traverse((child) => {
        if (!(child instanceof Mesh)) return
        child.castShadow = false
        child.receiveShadow = false
        child.material = child.material.clone()
        if (selected && 'color' in child.material) {
          child.material.color.lerp(new Color('#bef264'), 0.2)
        }
        if ('color' in child.material) {
          child.material.color.offsetHSL(0, 0.08, 0.1)
        }
        if ('metalness' in child.material) {
          child.material.metalness = Math.min(child.material.metalness, 0.62)
        }
        if ('roughness' in child.material) {
          child.material.roughness = Math.max(child.material.roughness, 0.32)
        }
      })
      model.rotation.set(0.08, 0.42, 0)
      group.add(model)

      const label = new SpriteText(node.name)
      label.color = '#ffffff'
      label.textHeight = selected ? 3.1 : 2.55
      label.position.y = node.type === 'processor' ? -9.5 : -8
      label.backgroundColor = selected
        ? 'rgba(45, 69, 12, 0.94)'
        : 'rgba(3, 10, 24, 0.94)'
      label.padding = 2.1
      label.borderRadius = 4
      group.add(label)

      group.scale.setScalar((0.9 + node.weight * 0.38) * (selected ? 1.08 : 1))
      return group
    }

    const pedestal = createPedestal(color, selected)
    pedestal.position.y = node.type === 'processor' ? -9.8 : -6.7
    group.add(pedestal)

    if (node.type === 'processor') {
      const glow = new Mesh(
        new SphereGeometry(selected ? 13.5 : 12, 24, 24),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: selected ? 0.2 : 0.11,
          depthWrite: false,
        }),
      )
      group.add(glow)

      const core = new Mesh(
        new SphereGeometry(8.2, 28, 28),
        new MeshPhysicalMaterial({
          color: new Color(color),
          roughness: 0.12,
          metalness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          transmission: 0.68,
          thickness: 2.8,
          ior: 1.38,
          transparent: true,
          opacity: 0.82,
          emissive: new Color(color),
          emissiveIntensity: 0,
        }),
      )
      group.add(core)

      const innerCore = new Mesh(
        new SphereGeometry(4.8, 20, 20),
        new MeshPhysicalMaterial({
          color: '#d5fff7',
          roughness: 0.2,
          metalness: 0.12,
          transparent: true,
          opacity: 0.78,
          emissive: new Color(color),
          emissiveIntensity: 0,
        }),
      )
      group.add(innerCore)

      ;[11, 13.5].forEach((radius, index) => {
        const orbit = new Mesh(
          new TorusGeometry(radius, index ? 0.1 : 0.16, 8, 40),
          new MeshBasicMaterial({
            color,
            transparent: true,
            opacity: index ? 0.45 : 0.8,
            depthWrite: false,
          }),
        )
        orbit.rotation.x = index ? Math.PI * 0.62 : Math.PI * 0.42
        orbit.rotation.y = index ? Math.PI * 0.2 : -Math.PI * 0.12
        group.add(orbit)
      })

      const symbol = new SpriteText('♻')
      symbol.color = '#ffffff'
      symbol.textHeight = 7
      symbol.position.z = 8
      group.add(symbol)
    } else {
      const bodyGeometry =
        node.type === 'emitter'
          ? new CylinderGeometry(5.4, 5.4, 8.4, 6, 1, false)
          : new RoundedBoxGeometry(8.4, 8.4, 8.4, 5, 1.25)
      const body = new Mesh(
        bodyGeometry,
        new MeshPhysicalMaterial({
          color: node.type === 'emitter' ? '#071a36' : '#10230d',
          metalness: 0.34,
          roughness: 0.16,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          transmission: node.type === 'consumer' ? 0.48 : 0.24,
          thickness: 1.8,
          transparent: true,
          opacity: selected ? 0.94 : 0.86,
          emissive: new Color(color),
          emissiveIntensity: 0,
        }),
      )
      body.rotation.set(0.1, 0.42, 0)
      group.add(body)

      const glassShell = new Mesh(
        bodyGeometry.clone(),
        new MeshPhysicalMaterial({
          color: new Color(color),
          roughness: 0.04,
          metalness: 0,
          clearcoat: 1,
          transmission: 0.82,
          thickness: 0.8,
          transparent: true,
          opacity: 0.14,
          emissive: new Color(color),
          emissiveIntensity: 0,
          depthWrite: false,
        }),
      )
      glassShell.scale.setScalar(1.14)
      glassShell.rotation.copy(body.rotation)
      group.add(glassShell)

      const edges = new LineSegments(
        new EdgesGeometry(bodyGeometry),
        new LineBasicMaterial({
          color,
          transparent: true,
          opacity: selected ? 1 : 0.86,
        }),
      )
      edges.rotation.copy(body.rotation)
      group.add(edges)

      const roleIcon = createRoleIcon(node.type, color)
      roleIcon.position.z = 5.1
      roleIcon.scale.set(5.6, 5.6, 1)
      group.add(roleIcon)
    }

    const label = new SpriteText(node.name)
    label.color = selected ? '#ecfccb' : '#e2e8f0'
    label.textHeight = selected ? 3.5 : node.type === 'processor' ? 3.2 : 2.7
    label.position.y = node.type === 'processor' ? -14 : -8.5
    label.backgroundColor = selected
      ? 'rgba(54, 83, 20, 0.92)'
      : 'rgba(3, 10, 24, 0.78)'
    label.padding = 2.2
    label.borderRadius = 5
    group.add(label)

    group.scale.setScalar(0.82 + node.weight * 0.42)
    return group
  }

  const initializeScene = () => {
    const scene = graphRef.current?.scene()
    if (!scene || scene.userData.twinInitialized) return
    scene.userData.twinInitialized = true
    new TextureLoader().load(
      '/assets/ai-space-network-bg.png',
      (texture) => {
        texture.colorSpace = SRGBColorSpace
        scene.background = texture
      },
      undefined,
      () => {
        scene.background = new Color('#020611')
      },
    )
    scene.fog = new FogExp2('#030712', 0.001)
    const ambientLight = new AmbientLight('#dbeafe', 2.1)
    ambientLight.name = 'company-model-ambient'
    scene.add(ambientLight)

    const hemisphereLight = new HemisphereLight('#dbeafe', '#102030', 2.4)
    hemisphereLight.name = 'company-model-hemisphere'
    scene.add(hemisphereLight)

    const keyLight = new DirectionalLight('#ffffff', 3.6)
    keyLight.name = 'company-model-key'
    keyLight.position.set(90, 120, 160)
    scene.add(keyLight)

    const fillLight = new DirectionalLight('#7dd3fc', 2.2)
    fillLight.name = 'company-model-fill'
    fillLight.position.set(-120, -40, 80)
    scene.add(fillLight)
    const renderer = graphRef.current?.renderer()
    renderer?.setClearColor(0x000000, 0)
    renderer?.setPixelRatio(
      Math.min(window.devicePixelRatio, size.width < 768 ? 1 : 1.5),
    )

    // 전국의 여러 네트워크가 화면 가장자리로 흩어지지 않도록
    // 노드의 반발력과 연결 거리를 줄이고 중심으로 모으는 힘을 높인다.
    graphRef.current?.d3Force('charge')?.strength(-18)
    graphRef.current?.d3Force('link')?.distance(31)
    graphRef.current?.d3Force('center')?.strength(0.62)

    ;[105, 155, 215, 285, 365].forEach((radius, index) => {
      const points: Vector3[] = []
      for (let step = 0; step < 64; step += 1) {
        const angle = (step / 64) * Math.PI * 2
        points.push(
          new Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.62,
            -150 - index * 5,
          ),
        )
      }
      const geometry = new BufferGeometry().setFromPoints(points)
      const orbit = new LineLoop(
        geometry,
        new LineBasicMaterial({
          color: index % 2 ? '#1d4ed8' : '#0891b2',
          transparent: true,
          opacity: 0.12,
        }),
      )
      scene.add(orbit)
    })
  }

  const focusNode = (node: NodeObject<TwinNode>) => {
    onSelectCompany(String(node.id))
  }

  const captureInitialLayout = () => {
    if (initialNodePositionsRef.current.size > 0) return
    graphData.nodes.forEach((node) => {
      const positionedNode = node as NodeObject<TwinNode>
      if (
        Number.isFinite(positionedNode.x) &&
        Number.isFinite(positionedNode.y)
      ) {
        initialNodePositionsRef.current.set(node.id, {
          x: positionedNode.x ?? 0,
          y: positionedNode.y ?? 0,
          z: positionedNode.z ?? 0,
        })
      }
    })
  }

  const restoreInitialLayout = () => {
    graphData.nodes.forEach((node) => {
      const position = initialNodePositionsRef.current.get(node.id)
      if (!position) return
      const positionedNode = node as NodeObject<TwinNode>
      positionedNode.x = position.x
      positionedNode.y = position.y
      positionedNode.z = position.z
      positionedNode.vx = 0
      positionedNode.vy = 0
      positionedNode.vz = 0
      positionedNode.fx = undefined
      positionedNode.fy = undefined
      positionedNode.fz = undefined
    })
    graphRef.current?.refresh()
    graphRef.current?.zoomToFit(600, 20)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-140 overflow-hidden bg-[#020611] sm:min-h-180"
    >
      <ForceGraph3D<TwinNode, TwinLink>
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        numDimensions={2}
        rendererConfig={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        backgroundColor="rgba(0, 0, 0, 0)"
        showNavInfo={false}
        nodeThreeObject={createPlatform}
        nodeLabel={(node) =>
          `<b>${node.name}</b><br/>${node.material} · ${node.amount}톤/월`
        }
        linkLabel={(link) => `${link.material} · ${link.amount}톤`}
        linkColor={(link) =>
          selectedMatchId && link.id !== selectedMatchId ? '#1e293b' : link.color
        }
        linkWidth={(link) =>
          link.id === selectedMatchId ? 3.2 : 0.55 + link.weight * 2.15
        }
        linkOpacity={0.76}
        linkCurvature={0.18}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.86}
        linkDirectionalParticles={(link) =>
          !flowing
            ? 0
            : link.id === selectedMatchId
              ? 7
              : link.status === 'pending'
                ? 0
                : Math.max(2, Math.round(link.weight * 5))
        }
        linkDirectionalParticleWidth={(link) =>
          link.id === selectedMatchId ? 3.2 : 1.65
        }
        linkDirectionalParticleSpeed={(link) => 0.0025 + link.weight * 0.005}
        cooldownTicks={75}
        d3AlphaDecay={0.04}
        d3VelocityDecay={0.34}
        enableNodeDrag={!panMode}
        enableNavigationControls
        onNodeClick={focusNode}
        onLinkClick={(link) => onSelectMatch(link.id)}
        onBackgroundClick={onClearSelection}
        onEngineTick={initializeScene}
        onEngineStop={captureInitialLayout}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(2,6,23,0)_0%,rgba(2,6,23,0.06)_55%,rgba(2,6,23,0.22)_100%)]" />

      <div className="absolute bottom-4 right-4 z-10 flex gap-1 rounded-xl border border-white/10 bg-slate-950/75 p-1 shadow-2xl backdrop-blur-xl">
        <TwinButton
          label={panMode ? '화면 이동 종료' : '화면 이동'}
          active={panMode}
          onClick={() => setPanMode((value) => !value)}
        >
          <Move className="h-4 w-4" />
        </TwinButton>
        <TwinButton
          label="전체 보기"
          onClick={() => graphRef.current?.zoomToFit(600, 20)}
        >
          <Maximize2 className="h-4 w-4" />
        </TwinButton>
        <TwinButton
          label="초기 배치로 복원"
          onClick={restoreInitialLayout}
        >
          <RotateCcw className="h-4 w-4" />
        </TwinButton>
        <TwinButton
          label={flowing ? '흐름 정지' : '흐름 재생'}
          onClick={() => setFlowing((value) => !value)}
        >
          {flowing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </TwinButton>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-400 backdrop-blur-xl md:block">
        {panMode
          ? '드래그 화면 이동 · 휠 확대 · 버튼을 다시 누르면 회전'
          : '드래그 회전 · 휠 확대 · 화면 이동 버튼으로 위치 조정'}
      </div>
    </div>
  )
}

function createPedestal(color: string, selected: boolean) {
  const group = new Group()
  const tiers = [
    { top: 7.6, bottom: 8.8, height: 1.1, y: -0.45, tone: '#050b15' },
    { top: 6.8, bottom: 7.6, height: 0.75, y: 0.45, tone: '#0a1727' },
    { top: 5.9, bottom: 6.5, height: 0.45, y: 1.05, tone: '#10243a' },
  ]

  tiers.forEach((tier, index) => {
    const base = new Mesh(
      new CylinderGeometry(tier.top, tier.bottom, tier.height, 8),
      new MeshPhysicalMaterial({
        color: tier.tone,
        metalness: 0.84 - index * 0.08,
        roughness: 0.48 + index * 0.05,
        clearcoat: 0.12,
        emissive: new Color(color),
        emissiveIntensity: 0,
      }),
    )
    base.position.y = tier.y
    group.add(base)
  })

  const topDisc = new Mesh(
    new CylinderGeometry(5.4, 5.4, 0.12, 48),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: selected ? 0.22 : 0.09,
      depthWrite: false,
    }),
  )
  topDisc.position.y = 1.32
  group.add(topDisc)
  return group
}

function createRoleIcon(type: CompanyType, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 160
  canvas.height = 160
  const context = canvas.getContext('2d')

  if (context) {
    context.clearRect(0, 0, 160, 160)
    context.strokeStyle = color
    context.fillStyle = color
    context.lineWidth = 8
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.shadowColor = color
    context.shadowBlur = 18

    if (type === 'emitter') {
      context.beginPath()
      context.moveTo(30, 120)
      context.lineTo(30, 70)
      context.lineTo(63, 88)
      context.lineTo(63, 65)
      context.lineTo(96, 84)
      context.lineTo(96, 42)
      context.lineTo(121, 42)
      context.lineTo(121, 120)
      context.closePath()
      context.stroke()
      context.fillRect(48, 101, 15, 19)
      context.fillRect(78, 101, 15, 19)
    } else {
      context.beginPath()
      context.moveTo(80, 25)
      context.lineTo(127, 51)
      context.lineTo(127, 105)
      context.lineTo(80, 133)
      context.lineTo(33, 105)
      context.lineTo(33, 51)
      context.closePath()
      context.stroke()
      context.beginPath()
      context.moveTo(33, 51)
      context.lineTo(80, 78)
      context.lineTo(127, 51)
      context.moveTo(80, 78)
      context.lineTo(80, 133)
      context.stroke()
      context.beginPath()
      context.arc(80, 78, 18, -0.8, 3.7)
      context.stroke()
      context.beginPath()
      context.moveTo(61, 65)
      context.lineTo(59, 86)
      context.lineTo(77, 78)
      context.fill()
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return new Sprite(
    new SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    }),
  )
}

function TwinButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={[
        'rounded-lg p-2 transition',
        active
          ? 'bg-cyan-400 text-slate-950'
          : 'text-slate-400 hover:bg-white/10 hover:text-cyan-300',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
