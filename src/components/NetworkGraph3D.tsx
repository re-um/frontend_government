import ForceGraph3D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
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
  emitter: '#3b82f6',
  processor: '#f97316',
  consumer: '#22c55e',
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

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-130 w-full overflow-hidden bg-white sm:min-h-180"
    >
      <ForceGraph3D<GraphNode, GraphLink>
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="#ffffff"
        showNavInfo={false}
        nodeLabel={(node) =>
          `<b>${node.name}</b><br/>월 취급량 ${node.amount}톤`
        }
        nodeVal={(node) => 4 + Math.sqrt(node.amount) * 0.8}
        nodeColor={(node) =>
          selectedCompanyId && !isConnectedToSelection(node.id)
            ? '#cbd5e1'
            : node.id === selectedCompanyId
              ? '#a3e635'
              : node.color
        }
        nodeOpacity={0.94}
        nodeResolution={24}
        nodeThreeObjectExtend
        nodeThreeObject={(node) => {
          const label = new SpriteText(node.name)
          label.color =
            node.id === selectedCompanyId ? '#365314' : '#0f172a'
          label.textHeight = node.id === selectedCompanyId ? 4.5 : 3.8
          label.position.y = 10.5
          label.backgroundColor =
            node.id === selectedCompanyId
              ? 'rgba(236, 252, 203, 0.96)'
              : 'rgba(255, 255, 255, 0.92)'
          label.padding = 2.5
          label.borderRadius = 4
          return label
        }}
        linkLabel={(link) =>
          `${link.material} · ${link.amount}톤`
        }
        linkColor={(link) =>
          selectedMatchId && link.id !== selectedMatchId
            ? '#dbe2ea'
            : link.color
        }
        linkWidth={(link) =>
          link.id === selectedMatchId
            ? 5
            : Math.max(1.2, Math.min(link.amount / 15, 3.5))
        }
        linkOpacity={0.66}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.92}
        linkDirectionalParticles={(link) =>
          link.status === 'active' ? 3 : link.status === 'approved' ? 1 : 0
        }
        linkDirectionalParticleWidth={2.8}
        linkDirectionalParticleSpeed={0.004}
        cooldownTicks={120}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.28}
        enableNodeDrag
        enableNavigationControls
        onNodeClick={(node) => onSelectCompany(node.id)}
        onLinkClick={(link) => onSelectMatch(link.id)}
        onBackgroundClick={onClearSelection}
        onEngineStop={() => graphRef.current?.zoomToFit(500, 70)}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-slate-50/90 to-transparent" />

      <div className="absolute left-3 top-3 z-10 hidden rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:block">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Network legend
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          <LegendItem color="#3b82f6" label="배출기업" />
          <LegendItem color="#f97316" label="중간처리기업" />
          <LegendItem color="#22c55e" label="수요기업" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
          <LineLegend color="#7c3aed" label="최종 승인" />
          <LineLegend color="#16a34a" label="산업공생 진행" />
          <LineLegend color="#94a3b8" label="응답 대기" dashed />
        </div>
      </div>

      <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-xl border border-slate-200 bg-white/92 p-1 shadow-md backdrop-blur">
        <button
          type="button"
          title="전체 보기"
          onClick={() => graphRef.current?.zoomToFit(500, 70)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="배치 다시 계산"
          onClick={() => graphRef.current?.d3ReheatSimulation()}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 w-max max-w-[calc(100%-24px)] -translate-x-1/2 rounded-full border border-slate-200 bg-white/92 px-4 py-2 text-center text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur sm:text-xs">
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
