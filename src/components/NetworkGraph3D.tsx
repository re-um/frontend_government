import ForceGraph3D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import {
  AdditiveBlending,
  Color,
  FogExp2,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
} from 'three'
import { Maximize2, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type CompanyType = 'emitter' | 'processor' | 'consumer'
type MatchStatus = 'approved' | 'active' | 'pending'

interface GraphCompany {
  id: string
  name: string
  type: CompanyType
  monthlyAmount: number
}

interface GraphMatch {
  id: string
  source: string
  target: string
  material: string
  amount: number
  status: MatchStatus
}

interface GraphNode {
  id: string
  name: string
  type: CompanyType
  amount: number
  color: string
}

interface GraphLink {
  id: string
  source: string
  target: string
  material: string
  amount: number
  status: MatchStatus
  color: string
}

const nodeColors: Record<CompanyType, string> = {
  emitter: '#2878ff',
  processor: '#ff7a18',
  consumer: '#00b875',
}

const linkColors: Record<MatchStatus, string> = {
  approved: '#7c3aed',
  active: '#16a34a',
  pending: '#94a3b8',
}

export function NetworkGraph3D({
  companies,
  matches,
  visibleCompanyIds,
  selectedCompanyId,
  selectedMatchId,
  onSelectCompany,
  onSelectMatch,
  onClearSelection,
}: {
  companies: GraphCompany[]
  matches: GraphMatch[]
  visibleCompanyIds: Set<string>
  selectedCompanyId?: string
  selectedMatchId?: string
  onSelectCompany: (companyId: string) => void
  onSelectMatch: (matchId: string) => void
  onClearSelection: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef =
    useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined)
  const [size, setSize] = useState({ width: 800, height: 720 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      setSize({
        width: Math.max(container.clientWidth, 320),
        height: Math.max(container.clientHeight, 520),
      })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = companies
      .filter((company) => visibleCompanyIds.has(company.id))
      .map((company) => ({
        id: company.id,
        name: company.name,
        type: company.type,
        amount: company.monthlyAmount,
        color: nodeColors[company.type],
      }))

    const visibleIds = new Set(nodes.map((node) => node.id))
    const links: GraphLink[] = matches
      .filter(
        (match) =>
          visibleIds.has(match.source) && visibleIds.has(match.target),
      )
      .map((match) => ({
        ...match,
        color: linkColors[match.status],
      }))

    return { nodes, links }
  }, [companies, matches, visibleCompanyIds])

  const isConnectedToSelection = (nodeId: string) => {
    if (!selectedCompanyId) return true
    return (
      nodeId === selectedCompanyId ||
      graphData.links.some((link) => {
        const source =
          typeof link.source === 'object' ? link.source.id : link.source
        const target =
          typeof link.target === 'object' ? link.target.id : link.target
        return (
          (source === selectedCompanyId && target === nodeId) ||
          (target === selectedCompanyId && source === nodeId)
        )
      })
    )
  }

  const createNodeObject = (node: NodeObject<GraphNode>) => {
    const group = new Group()
    const isSelected = node.id === selectedCompanyId
    const isDimmed = Boolean(
      selectedCompanyId && !isConnectedToSelection(String(node.id)),
    )
    const radius =
      node.type === 'processor'
        ? 5.1 + Math.sqrt(node.amount) * 0.12
        : 3.7 + Math.sqrt(node.amount) * 0.1
    const baseColor = isDimmed
      ? '#334155'
      : isSelected
        ? '#84cc16'
        : node.color

    const glow = new Mesh(
      new SphereGeometry(radius * 1.48, 28, 28),
      new MeshPhysicalMaterial({
        color: new Color(baseColor),
        transparent: true,
        opacity: isDimmed ? 0.025 : isSelected ? 0.14 : 0.055,
        roughness: 0.15,
        metalness: 0.05,
        emissive: new Color(baseColor),
        emissiveIntensity: isSelected ? 1.2 : 0.65,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    group.add(glow)

    const core = new Mesh(
      new SphereGeometry(radius, 36, 36),
      new MeshPhysicalMaterial({
        color: new Color(baseColor),
        roughness: 0.12,
        metalness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        transmission: isDimmed ? 0.1 : 0.22,
        thickness: 1.5,
        transparent: true,
        opacity: isDimmed ? 0.25 : 0.94,
        emissive: new Color(baseColor),
        emissiveIntensity: isSelected ? 0.42 : 0.1,
      }),
    )
    group.add(core)

    if (!isDimmed) {
      const shell = new Mesh(
        new SphereGeometry(radius * 1.3, 20, 14),
        new MeshPhysicalMaterial({
        color: new Color(isSelected ? '#65a30d' : baseColor),
        transparent: true,
          opacity: isSelected ? 0.28 : 0.13,
        roughness: 0.2,
        emissive: new Color(baseColor),
          emissiveIntensity: 0.25,
          wireframe: true,
          depthWrite: false,
        }),
      )
      shell.rotation.x = Math.PI * 0.12
      shell.rotation.y = Math.PI * 0.2
      group.add(shell)
    }

    if (node.type === 'processor' || isSelected) {
      const label = new SpriteText(node.name)
      label.color = isSelected ? '#ecfccb' : '#e2e8f0'
      label.textHeight = isSelected ? 3.8 : 3.15
      label.position.y = -(radius + 5.5)
      label.backgroundColor = isSelected
        ? 'rgba(63, 98, 18, 0.88)'
        : 'rgba(15, 23, 42, 0.82)'
      label.padding = 2.2
      label.borderRadius = 5
      group.add(label)
    }

    return group
  }

  const initializeSpace = () => {
    const scene = graphRef.current?.scene()
    if (!scene || scene.userData.spaceInitialized) return

    scene.userData.spaceInitialized = true
    scene.fog = new FogExp2('#07101e', 0.0014)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-130 w-full overflow-hidden bg-[#07101e] sm:min-h-180"
    >
      <ForceGraph3D<GraphNode, GraphLink>
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="#07101e"
        showNavInfo={false}
        nodeLabel={(node) =>
          `<b>${node.name}</b><br/>월 취급량 ${node.amount}톤`
        }
        nodeThreeObject={createNodeObject}
        linkLabel={(link) =>
          `${link.material} · ${link.amount}톤`
        }
        linkColor={(link) =>
          selectedMatchId && link.id !== selectedMatchId
            ? '#1e293b'
            : link.color
        }
        linkWidth={(link) =>
          link.id === selectedMatchId
            ? 3.2
            : Math.max(0.65, Math.min(link.amount / 32, 1.65))
        }
        linkOpacity={0.5}
        linkCurvature={(link) =>
          link.status === 'pending' ? 0.025 : link.status === 'active' ? 0.07 : 0.1
        }
        linkDirectionalArrowLength={2.4}
        linkDirectionalArrowRelPos={0.88}
        linkDirectionalParticles={(link) =>
          link.id === selectedMatchId
            ? 7
            : link.status === 'active'
              ? 4
              : link.status === 'approved'
                ? 1
                : 0
        }
        linkDirectionalParticleWidth={(link) =>
          link.id === selectedMatchId ? 3.2 : 2
        }
        linkDirectionalParticleSpeed={(link) =>
          link.id === selectedMatchId ? 0.009 : 0.0045
        }
        cooldownTicks={120}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.28}
        enableNodeDrag
        enableNavigationControls
        onNodeClick={(node) => onSelectCompany(node.id)}
        onLinkClick={(link) => onSelectMatch(link.id)}
        onBackgroundClick={onClearSelection}
        onEngineTick={initializeSpace}
        onEngineStop={() => {
          initializeSpace()
          graphRef.current?.zoomToFit(500, 70)
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_52%_42%,rgba(37,99,235,0.12)_0%,rgba(8,18,34,0.2)_38%,rgba(3,9,19,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.055] [background-image:linear-gradient(rgba(148,163,184,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.8)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="pointer-events-none absolute -left-24 top-[38%] z-[1] h-64 w-[34rem] -rotate-12 rounded-full bg-cyan-500/6 blur-[90px]" />
      <div className="pointer-events-none absolute -right-24 top-[18%] z-[1] h-64 w-[32rem] rotate-12 rounded-full bg-indigo-500/8 blur-[100px]" />

      <div className="absolute bottom-4 left-4 z-10 hidden rounded-2xl border border-white/[0.08] bg-[#0b1526]/80 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:block">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300/70">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          Network Intelligence
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-300">
          <LegendItem color="#2878ff" label="배출기업" />
          <LegendItem color="#ff7a18" label="중간처리기업" />
          <LegendItem color="#00b875" label="수요기업" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-2 text-[11px] text-slate-400">
          <LineLegend color="#7c3aed" label="최종 승인" />
          <LineLegend color="#16a34a" label="산업공생 진행" />
          <LineLegend color="#94a3b8" label="응답 대기" dashed />
        </div>
      </div>

      <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-xl border border-white/[0.08] bg-[#0b1526]/80 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <button
          type="button"
          title="전체 보기"
          onClick={() => graphRef.current?.zoomToFit(500, 70)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="배치 다시 계산"
          onClick={() => graphRef.current?.d3ReheatSimulation()}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden rounded-full border border-white/[0.08] bg-[#0b1526]/80 px-4 py-2 text-center text-[11px] font-medium text-slate-400 shadow-lg backdrop-blur-xl lg:block">
        드래그로 회전 · 휠/핀치로 확대 · 노드를 잡아 위치 이동
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

function LineLegend({
  color,
  label,
  dashed = false,
}: {
  color: string
  label: string
  dashed?: boolean
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-5 border-t-2 ${dashed ? 'border-dashed' : ''}`}
        style={{ borderColor: color }}
      />
      {label}
    </span>
  )
}
