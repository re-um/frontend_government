import { Factory, Recycle, Sparkles } from 'lucide-react'

type CompanyType = 'emitter' | 'processor' | 'consumer'
type MatchStatus = 'approved' | 'active' | 'pending'

interface OverviewCompany {
  id: string
  name: string
  type: CompanyType
  material: string
  monthlyAmount: number
}

interface OverviewMatch {
  id: string
  source: string
  target: string
  material: string
  amount: number
  status: MatchStatus
}

const positions: Record<string, { x: number; y: number }> = {
  'emitter-a': { x: 28, y: 20 },
  'emitter-b': { x: 73, y: 20 },
  'processor-a': { x: 50, y: 43 },
  'emitter-d': { x: 22, y: 60 },
  'processor-b': { x: 74, y: 59 },
  'consumer-a': { x: 48, y: 79 },
  'consumer-b': { x: 76, y: 76 },
}

const typeStyle: Record<
  CompanyType,
  { accent: string; panel: string; label: string }
> = {
  emitter: {
    accent: '#38bdf8',
    panel: 'border-sky-300/30 bg-sky-950/80 text-sky-50',
    label: '배출기업',
  },
  processor: {
    accent: '#2dd4bf',
    panel: 'border-teal-300/30 bg-teal-950/85 text-teal-50',
    label: '중간처리기업',
  },
  consumer: {
    accent: '#a3e635',
    panel: 'border-lime-300/30 bg-lime-950/80 text-lime-50',
    label: '수요기업',
  },
}

const statusColor: Record<MatchStatus, string> = {
  approved: '#a78bfa',
  active: '#22d3ee',
  pending: '#94a3b8',
}

export function IndustrialOverview({
  companies,
  matches,
  visibleCompanyIds,
  selectedCompanyId,
  selectedMatchId,
  onSelectCompany,
  onSelectMatch,
}: {
  companies: OverviewCompany[]
  matches: OverviewMatch[]
  visibleCompanyIds: Set<string>
  selectedCompanyId?: string
  selectedMatchId?: string
  onSelectCompany: (id: string) => void
  onSelectMatch: (id: string) => void
}) {
  const overviewCompanies = companies.filter(
    (company) => positions[company.id] && visibleCompanyIds.has(company.id),
  )
  const overviewIds = new Set(overviewCompanies.map((company) => company.id))
  const overviewMatches = matches.filter(
    (match) =>
      positions[match.source] &&
      positions[match.target] &&
      overviewIds.has(match.source) &&
      overviewIds.has(match.target),
  )

  return (
    <div className="relative min-h-130 overflow-auto bg-[#071321] sm:min-h-180">
      <div className="relative mx-auto aspect-[16/9] min-h-130 min-w-[820px] overflow-hidden sm:min-h-180">
        <img
          src="/assets/industrial-symbiosis-overview.png"
          alt="폐합성수지 산업공생 단지 조감도"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03101d]/15 via-transparent to-[#020817]/50" />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-label="기업 간 폐합성수지 이동 경로"
        >
          <defs>
            {Object.entries(statusColor).map(([status, color]) => (
              <marker
                key={status}
                id={`overview-arrow-${status}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
              </marker>
            ))}
            <filter id="overview-glow">
              <feGaussianBlur stdDeviation="0.45" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {overviewMatches.map((match, index) => {
            const source = positions[match.source]
            const target = positions[match.target]
            const color = statusColor[match.status]
            const midX = (source.x + target.x) / 2
            const midY =
              (source.y + target.y) / 2 - (index % 2 === 0 ? 4 : -3)

            return (
              <g
                key={match.id}
                onClick={() => onSelectMatch(match.id)}
                className="cursor-pointer"
              >
                <path
                  d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="3.5"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={match.id === selectedMatchId ? 0.65 : 0.42}
                  strokeOpacity={
                    selectedMatchId && match.id !== selectedMatchId ? 0.22 : 0.9
                  }
                  strokeDasharray={match.status === 'pending' ? '1 1' : undefined}
                  markerEnd={`url(#overview-arrow-${match.status})`}
                  filter="url(#overview-glow)"
                  className="transition-all"
                />
                <circle r="0.65" fill={color} filter="url(#overview-glow)">
                  <animateMotion
                    dur={`${3.2 + index * 0.28}s`}
                    repeatCount="indefinite"
                    path={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  />
                </circle>
              </g>
            )
          })}
        </svg>

        {overviewCompanies.map((company) => {
          const position = positions[company.id]
          const style = typeStyle[company.type]
          const selected = company.id === selectedCompanyId

          return (
            <button
              key={company.id}
              type="button"
              onClick={() => onSelectCompany(company.id)}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-left shadow-2xl backdrop-blur-md transition duration-200 hover:-translate-y-[55%] hover:scale-105 ${style.panel} ${
                selected
                  ? 'ring-2 ring-lime-300 ring-offset-2 ring-offset-slate-950/40'
                  : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10"
                  style={{ color: style.accent }}
                >
                  {company.type === 'processor' ? (
                    <Recycle className="h-4 w-4" />
                  ) : (
                    <Factory className="h-4 w-4" />
                  )}
                </span>
                <span>
                  <span className="block max-w-28 truncate text-xs font-bold">
                    {company.name}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-white/60">
                    {style.label}
                  </span>
                </span>
              </span>
              <span className="mt-1.5 flex items-center justify-between gap-3 border-t border-white/10 pt-1.5 text-[10px]">
                <span className="font-medium text-white/70">
                  {company.material}
                </span>
                <span className="font-bold" style={{ color: style.accent }}>
                  {company.monthlyAmount}톤/월
                </span>
              </span>
            </button>
          )
        })}

        <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-[#071321]/80 px-3 py-2 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            수도권 폐합성수지 산업공생 단지
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            현재 데이터 기반 조감도 프로토타입
          </p>
        </div>
      </div>
    </div>
  )
}
