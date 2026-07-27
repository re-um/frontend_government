import ForceGraph3D, {
  type ForceGraphMethods,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  EdgesGeometry,
  FogExp2,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  RingGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'
import { Maximize2, Pause, Play, RotateCcw } from 'lucide-react'
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
}

interface TwinLink {
  id: string
  source: string
  target: string
  material: string
  amount: number
  status: MatchStatus
  color: string
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
  }>
  matches: Array<{
    id: string
    source: string
    target: string
    material: string
    amount: number
    status: MatchStatus
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
  const initialFitDoneRef = useRef(false)
  const [size, setSize] = useState({ width: 800, height: 680 })
  const [flowing, setFlowing] = useState(true)

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

  const graphData = useMemo(() => {
    const nodes: TwinNode[] = companies
      .filter((company) => visibleCompanyIds.has(company.id))
      .map((company) => ({
        id: company.id,
        name: company.name,
        type: company.type,
        material: company.material,
        amount: company.monthlyAmount,
        color: nodeColors[company.type],
      }))
    const ids = new Set(nodes.map((node) => node.id))
    const links: TwinLink[] = matches
      .filter((match) => ids.has(match.source) && ids.has(match.target))
      .map((match) => ({ ...match, color: linkColors[match.status] }))
    return { nodes, links }
  }, [companies, matches, visibleCompanyIds])

  const createPlatform = (node: NodeObject<TwinNode>) => {
    const group = new Group()
    const selected = node.id === selectedCompanyId
    const color = selected ? '#bef264' : node.color
    if (node.type === 'processor') {
      const glow = new Mesh(
        new SphereGeometry(selected ? 12.5 : 11, 36, 36),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: selected ? 0.14 : 0.09,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      )
      group.add(glow)

      const core = new Mesh(
        new SphereGeometry(7.7, 40, 40),
        new MeshPhysicalMaterial({
          color: new Color(color),
          roughness: 0.08,
          metalness: 0.12,
          clearcoat: 1,
          transmission: 0.38,
          thickness: 2,
          transparent: true,
          opacity: 0.9,
          emissive: new Color(color),
          emissiveIntensity: selected ? 0.8 : 0.42,
        }),
      )
      group.add(core)

      ;[10, 12.4].forEach((radius, index) => {
        const orbit = new Mesh(
          new RingGeometry(radius, radius + (index ? 0.18 : 0.28), 64),
          new MeshBasicMaterial({
            color,
            transparent: true,
            opacity: index ? 0.32 : 0.68,
            side: 2,
            blending: AdditiveBlending,
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
      const cubeGeometry = new BoxGeometry(7.2, 7.2, 7.2)
      const cube = new Mesh(
        cubeGeometry,
        new MeshPhysicalMaterial({
          color: '#0b1d35',
          metalness: 0.55,
          roughness: 0.18,
          clearcoat: 1,
          transparent: true,
          opacity: selected ? 1 : 0.94,
          emissive: new Color(color),
          emissiveIntensity: selected ? 0.38 : 0.15,
        }),
      )
      cube.rotation.set(0.16, 0.38, 0)
      group.add(cube)

      const edges = new LineSegments(
        new EdgesGeometry(cubeGeometry),
        new LineBasicMaterial({
          color,
          transparent: true,
          opacity: selected ? 1 : 0.78,
          blending: AdditiveBlending,
        }),
      )
      edges.rotation.copy(cube.rotation)
      group.add(edges)

      const roleIcon = createRoleIcon(node.type, color)
      roleIcon.position.z = 4.5
      roleIcon.scale.set(5.2, 5.2, 1)
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

    return group
  }

  const initializeScene = () => {
    const scene = graphRef.current?.scene()
    if (!scene || scene.userData.twinInitialized) return
    scene.userData.twinInitialized = true
    scene.fog = new FogExp2('#030712', 0.001)

    // 전국의 여러 네트워크가 화면 가장자리로 흩어지지 않도록
    // 노드의 반발력과 연결 거리를 줄이고 중심으로 모으는 힘을 높인다.
    graphRef.current?.d3Force('charge')?.strength(-16)
    graphRef.current?.d3Force('link')?.distance(28)
    graphRef.current?.d3Force('center')?.strength(0.55)

    ;[105, 155, 215, 285, 365].forEach((radius, index) => {
      const points: Vector3[] = []
      for (let step = 0; step < 128; step += 1) {
        const angle = (step / 128) * Math.PI * 2
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
          blending: AdditiveBlending,
        }),
      )
      scene.add(orbit)
    })
  }

  const focusNode = (node: NodeObject<TwinNode>) => {
    onSelectCompany(String(node.id))
    const distance = 85
    const ratio =
      1 + distance / Math.hypot(node.x ?? 1, node.y ?? 1, node.z ?? 1)
    graphRef.current?.cameraPosition(
      {
        x: (node.x ?? 0) * ratio,
        y: (node.y ?? 0) * ratio,
        z: (node.z ?? 0) * ratio,
      },
      { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
      700,
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-140 overflow-hidden bg-[#030712] sm:min-h-180"
    >
      <ForceGraph3D<TwinNode, TwinLink>
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="#030712"
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
          link.id === selectedMatchId ? 3.2 : Math.max(0.7, link.amount / 32)
        }
        linkOpacity={0.64}
        linkCurvature={0.18}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.86}
        linkDirectionalParticles={(link) =>
          !flowing ? 0 : link.id === selectedMatchId ? 7 : link.status === 'pending' ? 0 : 3
        }
        linkDirectionalParticleWidth={(link) =>
          link.id === selectedMatchId ? 3.8 : 2.2
        }
        linkDirectionalParticleSpeed={0.005}
        cooldownTicks={130}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.3}
        enableNodeDrag
        enableNavigationControls
        onNodeClick={focusNode}
        onLinkClick={(link) => onSelectMatch(link.id)}
        onBackgroundClick={onClearSelection}
        onEngineTick={initializeScene}
        onEngineStop={() => {
          initializeScene()
          if (!initialFitDoneRef.current) {
            initialFitDoneRef.current = true
            graphRef.current?.zoomToFit(600, 20)
          }
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(30,64,175,0.18),transparent_42%,rgba(2,6,23,0.72)_100%)]" />

      <div className="absolute bottom-4 right-4 z-10 flex gap-1 rounded-xl border border-white/10 bg-slate-950/75 p-1 shadow-2xl backdrop-blur-xl">
        <TwinButton
          label="전체 보기"
          onClick={() => graphRef.current?.zoomToFit(600, 20)}
        >
          <Maximize2 className="h-4 w-4" />
        </TwinButton>
        <TwinButton
          label="배치 재계산"
          onClick={() => graphRef.current?.d3ReheatSimulation()}
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
        드래그 회전 · 휠 확대 · 플랫폼 선택 시 카메라 이동
      </div>
    </div>
  )
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
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
    >
      {children}
    </button>
  )
}
