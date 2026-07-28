import ForceGraph3D, {
  type ForceGraphMethods,
  type NodeObject,
} from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
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
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FlaskConical, Maximize2, Pause, Play, RotateCcw } from 'lucide-react'
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
  simulationMode,
  onToggleSimulation,
  onSimulationProposal,
}: {
  companies: Array<{
    id: string
    name: string
    type: CompanyType
    material: string
    monthlyAmount: number
    connections: number
    approvedMatches: number
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
  simulationMode: boolean
  onToggleSimulation: () => void
  onSimulationProposal: (
    proposal: { sourceId: string; targetId: string } | null,
  ) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef =
    useRef<ForceGraphMethods<TwinNode, TwinLink> | undefined>(undefined)
  const [size, setSize] = useState({ width: 800, height: 680 })
  const [flowing, setFlowing] = useState(true)
  const activeProposalRef = useRef<string | null>(null)

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
    const maxAmount = Math.max(...companies.map((company) => company.monthlyAmount), 1)
    const maxConnections = Math.max(...companies.map((company) => company.connections), 1)
    const maxApproved = Math.max(...companies.map((company) => company.approvedMatches), 1)
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
          (company.connections / maxConnections) * 0.35 +
          (company.monthlyAmount / maxAmount) * 0.3 +
          ((companyCarbon.get(company.id) ?? 0) / maxCompanyCarbon) * 0.2 +
          (company.approvedMatches / maxApproved) * 0.15,
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

  const createPlatform = (node: NodeObject<TwinNode>) => {
    const group = new Group()
    const selected = node.id === selectedCompanyId
    const color = selected ? '#bef264' : node.color

    const pedestal = createPedestal(color, selected)
    pedestal.position.y = node.type === 'processor' ? -9.8 : -6.7
    group.add(pedestal)

    if (node.type === 'processor') {
      const glow = new Mesh(
        new SphereGeometry(selected ? 13.5 : 12, 40, 40),
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: selected ? 0.2 : 0.11,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      )
      group.add(glow)

      const core = new Mesh(
        new SphereGeometry(8.2, 48, 48),
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
          emissiveIntensity: selected ? 0.62 : 0.24,
        }),
      )
      group.add(core)

      const innerCore = new Mesh(
        new SphereGeometry(4.8, 32, 32),
        new MeshPhysicalMaterial({
          color: '#d5fff7',
          roughness: 0.2,
          metalness: 0.12,
          transparent: true,
          opacity: 0.78,
          emissive: new Color(color),
          emissiveIntensity: selected ? 0.72 : 0.36,
        }),
      )
      group.add(innerCore)

      ;[11, 13.5].forEach((radius, index) => {
        const orbit = new Mesh(
          new TorusGeometry(radius, index ? 0.1 : 0.16, 12, 80),
          new MeshBasicMaterial({
            color,
            transparent: true,
            opacity: index ? 0.45 : 0.8,
            blending: AdditiveBlending,
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
          emissiveIntensity: selected ? 0.48 : 0.16,
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
          emissiveIntensity: selected ? 0.24 : 0.06,
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
          blending: AdditiveBlending,
        }),
      )
      edges.rotation.copy(body.rotation)
      group.add(edges)

      const roleIcon = createRoleIcon(node.type, color)
      roleIcon.position.z = 5.1
      roleIcon.scale.set(5.6, 5.6, 1)
      group.add(roleIcon)
    }

    if (selected) {
      ;[12.5, 15].forEach((radius, index) => {
        const pulse = new Mesh(
          new RingGeometry(radius, radius + 0.18, 72),
          new MeshBasicMaterial({
            color,
            transparent: true,
            opacity: index ? 0.22 : 0.48,
            blending: AdditiveBlending,
            depthWrite: false,
            side: 2,
          }),
        )
        pulse.rotation.x = Math.PI / 2
        pulse.position.y = node.type === 'processor' ? -10 : -7
        group.add(pulse)
      })
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
    scene.fog = new FogExp2('#030712', 0.001)

    const composer = graphRef.current?.postProcessingComposer()
    if (composer) {
      const bloom = new UnrealBloomPass(
        new Vector2(size.width, size.height),
        size.width < 768 ? 0.18 : 0.32,
        0.28,
        0.86,
      )
      composer.addPass(bloom)
    }

    // 전국의 여러 네트워크가 화면 가장자리로 흩어지지 않도록
    // 노드의 반발력과 연결 거리를 줄이고 중심으로 모으는 힘을 높인다.
    graphRef.current?.d3Force('charge')?.strength(-13)
    graphRef.current?.d3Force('link')?.distance(24)
    graphRef.current?.d3Force('center')?.strength(0.62)

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
    if (simulationMode) return
    onSelectCompany(String(node.id))
  }

  const detectSimulationTarget = (
    node: NodeObject<TwinNode>,
    translate?: { x: number; y: number },
  ) => {
    if (!simulationMode) return
    if (translate && Math.hypot(translate.x, translate.y) < 24) return
    const sourceId = String(node.id)
    const endpointId = (endpoint: string | TwinNode) =>
      typeof endpoint === 'object' ? String(endpoint.id) : String(endpoint)
    const sourceNetwork = new Set<string>([sourceId])
    const queue = [sourceId]

    while (queue.length > 0) {
      const currentId = queue.shift()!
      graphData.links.forEach((link) => {
        const linkSource = endpointId(link.source)
        const linkTarget = endpointId(link.target)
        const neighbor =
          linkSource === currentId
            ? linkTarget
            : linkTarget === currentId
              ? linkSource
              : null
        if (neighbor && !sourceNetwork.has(neighbor)) {
          sourceNetwork.add(neighbor)
          queue.push(neighbor)
        }
      })
    }

    const candidates = graphData.nodes
      .filter(
        (candidate) =>
          candidate.id !== sourceId &&
          !sourceNetwork.has(candidate.id) &&
          Number.isFinite(candidate.x) &&
          Number.isFinite(candidate.y),
      )
      .map((candidate) => ({
        candidate,
        distance: Math.hypot(
          (candidate.x ?? 0) - (node.x ?? 0),
          (candidate.y ?? 0) - (node.y ?? 0),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)

    const nearest = candidates[0]
    if (nearest) {
      const proposalKey = `${sourceId}:${nearest.candidate.id}`
      if (activeProposalRef.current === proposalKey) return
      activeProposalRef.current = proposalKey
      onSimulationProposal({
        sourceId,
        targetId: nearest.candidate.id,
      })
    } else if (activeProposalRef.current) {
      activeProposalRef.current = null
      onSimulationProposal(null)
    }
  }

  const handleSimulationDrop = (
    node: NodeObject<TwinNode>,
    translate: { x: number; y: number },
  ) => {
    if (!simulationMode) return
    detectSimulationTarget(node, translate)
    node.fx = undefined
    node.fy = undefined
    node.fz = undefined
    graphRef.current?.d3ReheatSimulation()
  }

  const exitSimulation = () => {
    activeProposalRef.current = null
    onSimulationProposal(null)
    graphData.nodes.forEach((node) => {
      node.fx = undefined
      node.fy = undefined
      node.fz = undefined
    })
    onToggleSimulation()
    graphRef.current?.d3ReheatSimulation()
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-140 overflow-hidden bg-[#020611] bg-[url('/assets/ai-space-network-bg.png')] bg-cover bg-center sm:min-h-180"
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
        backgroundColor="rgba(2, 6, 17, 0.28)"
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
        cooldownTicks={130}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.3}
        enableNodeDrag
        enableNavigationControls
        onNodeClick={focusNode}
        onNodeDrag={detectSimulationTarget}
        onNodeDragEnd={handleSimulationDrop}
        onLinkClick={(link) => onSelectMatch(link.id)}
        onBackgroundClick={onClearSelection}
        onEngineTick={initializeScene}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.14)_48%,rgba(2,6,23,0.5)_100%)]" />

      <button
        type="button"
        onClick={simulationMode ? exitSimulation : onToggleSimulation}
        className={[
          'absolute right-4 top-4 z-10 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xl backdrop-blur-xl transition',
          simulationMode
            ? 'border-lime-300/60 bg-lime-300 text-slate-950'
            : 'border-white/15 bg-slate-950/75 text-slate-200 hover:border-cyan-300/50 hover:text-cyan-200',
        ].join(' ')}
      >
        <FlaskConical className="h-4 w-4" />
        {simulationMode ? '시뮬레이션 종료' : '조합 시뮬레이션'}
      </button>

      {simulationMode && (
        <div className="pointer-events-none absolute left-1/2 top-17 z-10 -translate-x-1/2 rounded-full border border-lime-300/30 bg-slate-950/80 px-4 py-2 text-xs font-medium text-lime-200 shadow-xl backdrop-blur-xl">
          기업을 다른 네트워크 가까이 드래그해 가상 조합을 비교하세요.
        </div>
      )}

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
        roughness: 0.2 + index * 0.05,
        clearcoat: 1,
        emissive: new Color(color),
        emissiveIntensity: selected ? 0.16 : 0.035,
      }),
    )
    base.position.y = tier.y
    group.add(base)
  })

  const lightBand = new Mesh(
    new TorusGeometry(7.25, 0.12, 8, 64),
    new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: selected ? 0.9 : 0.48,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
  lightBand.rotation.x = Math.PI / 2
  lightBand.position.y = 0.88
  group.add(lightBand)

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
