import ForceGraph3D, {
  type ForceGraphMethods,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  FogExp2,
  GridHelper,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  RingGeometry,
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
    const material = new MeshPhysicalMaterial({
      color: new Color(color),
      metalness: 0.3,
      roughness: 0.22,
      clearcoat: 1,
      emissive: new Color(color),
      emissiveIntensity: selected ? 0.55 : 0.16,
    })
    const darkMaterial = new MeshPhysicalMaterial({
      color: '#102033',
      metalness: 0.65,
      roughness: 0.28,
      clearcoat: 0.8,
    })

    const platform = new Mesh(
      new CylinderGeometry(8.5, 9.2, 1.5, 6),
      darkMaterial,
    )
    platform.position.y = -1
    group.add(platform)

    const halo = new Mesh(
      new RingGeometry(9.2, selected ? 10.4 : 9.65, 6),
      new MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1,
        transparent: true,
        opacity: selected ? 0.9 : 0.45,
        side: 2,
      }),
    )
    halo.rotation.x = -Math.PI / 2
    halo.position.y = -0.18
    group.add(halo)

    if (node.type === 'emitter') {
      const factory = new Mesh(new BoxGeometry(9, 3.6, 6), material)
      factory.position.y = 1.5
      group.add(factory)
      ;[-2.5, 2.5].forEach((x) => {
        const chimney = new Mesh(
          new CylinderGeometry(0.65, 0.8, 6, 12),
          darkMaterial,
        )
        chimney.position.set(x, 5.6, 0.8)
        group.add(chimney)
      })
    } else if (node.type === 'processor') {
      const core = new Mesh(
        new CylinderGeometry(4.2, 5.3, 5.5, 6),
        material,
      )
      core.position.y = 2.1
      group.add(core)
      const upper = new Mesh(
        new CylinderGeometry(2.6, 3.5, 3.2, 6),
        darkMaterial,
      )
      upper.position.y = 6.3
      group.add(upper)
    } else {
      const building = new Mesh(new BoxGeometry(8.5, 4.5, 6.5), material)
      building.position.y = 2
      group.add(building)
      const roof = new Mesh(new BoxGeometry(6.5, 0.55, 7.4), darkMaterial)
      roof.position.y = 4.5
      group.add(roof)
    }

    const label = new SpriteText(node.name)
    label.color = selected ? '#ecfccb' : '#e2e8f0'
    label.textHeight = selected ? 3.6 : 3
    label.position.y = 13
    label.backgroundColor = selected
      ? 'rgba(54, 83, 20, 0.92)'
      : 'rgba(8, 18, 34, 0.88)'
    label.padding = 2.2
    label.borderRadius = 5
    group.add(label)

    return group
  }

  const initializeScene = () => {
    const scene = graphRef.current?.scene()
    if (!scene || scene.userData.twinInitialized) return
    scene.userData.twinInitialized = true
    scene.fog = new FogExp2('#07111f', 0.0013)
    const grid = new GridHelper(900, 36, '#164e63', '#172554')
    grid.position.y = -105
    grid.material.transparent = true
    grid.material.opacity = 0.18
    scene.add(grid)
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
      className="relative h-full min-h-140 overflow-hidden bg-[#07111f] sm:min-h-180"
    >
      <ForceGraph3D<TwinNode, TwinLink>
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="#07111f"
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
          link.id === selectedMatchId ? 4 : Math.max(1, link.amount / 22)
        }
        linkOpacity={0.72}
        linkCurvature={0.12}
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
          graphRef.current?.zoomToFit(600, 75)
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(14,116,144,0.12),transparent_48%,rgba(2,6,23,0.6)_100%)]" />

      <div className="absolute bottom-4 right-4 z-10 flex gap-1 rounded-xl border border-white/10 bg-slate-950/75 p-1 shadow-2xl backdrop-blur-xl">
        <TwinButton
          label="전체 보기"
          onClick={() => graphRef.current?.zoomToFit(600, 75)}
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
