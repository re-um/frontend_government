/* eslint-disable prettier/prettier */
import { createFileRoute } from '@tanstack/react-router'
import cytoscape, {
  type Core,
  type EdgeSingular,
  type ElementDefinition,
  type NodeSingular,
} from 'cytoscape'
import {
  Building2,
  Factory,
  Filter,
  Map as MapIcon,
  Network,
  RotateCcw,
  Search,
  Share2,
  Truck,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { KakaoNetworkMap } from '../components/KakaoNetworkMap'

export const Route = createFileRoute('/network')({
  component: NetworkMapPage,
})

type CompanyType = 'emitter' | 'processor' | 'consumer'
type MatchStatus = 'approved' | 'active' | 'pending'
type ViewMode = 'graph' | 'map'

interface CompanyDetail {
  id: string
  name: string
  type: CompanyType
  region: string
  material: string
  monthlyAmount: number
  connections: number
  approvedMatches: number
  status: MatchStatus
  description: string
  latitude: number
  longitude: number
}

interface MatchDetail {
  id: string
  source: string
  target: string
  material: string
  amount: number
  score: number
  roi: number
  carbonReduction: number
  status: MatchStatus
}

const companyTypeLabel: Record<CompanyType, string> = {
  emitter: '배출기업',
  processor: '중간처리기업',
  consumer: '수요기업',
}

const companyTypeIcon: Record<CompanyType, string> = {
  emitter: '배',
  processor: '중',
  consumer: '수',
}

const statusLabel: Record<MatchStatus, string> = {
  approved: '최종 승인',
  active: '산업공생 진행',
  pending: '응답 대기',
}

const companies: CompanyDetail[] = [
  {
    id: 'emitter-a',
    name: '한국패키징',
    type: 'emitter',
    region: '경기 화성시',
    material: '폐PP',
    monthlyAmount: 80,
    connections: 3,
    approvedMatches: 1,
    status: 'approved',
    description: '식품 포장재 생산 과정에서 폐PP가 발생하는 공급기업',
    latitude: 37.1995,
    longitude: 126.8312,
  },
  {
    id: 'emitter-b',
    name: '대성플라스틱',
    type: 'emitter',
    region: '인천 남동구',
    material: '폐PE',
    monthlyAmount: 65,
    connections: 3,
    approvedMatches: 1,
    status: 'active',
    description: '산업용 포장재 생산 과정에서 폐PE가 발생하는 공급기업',
    latitude: 37.4112,
    longitude: 126.7315,
  },
  {
    id: 'emitter-c',
    name: '한빛산업',
    type: 'emitter',
    region: '충남 천안시',
    material: '폐PET',
    monthlyAmount: 45,
    connections: 2,
    approvedMatches: 0,
    status: 'pending',
    description: 'PET 소재 제품 생산 과정에서 폐PET가 발생하는 공급기업',
    latitude: 36.8151,
    longitude: 127.1139,
  },
  {
    id: 'emitter-d',
    name: '서광화학',
    type: 'emitter',
    region: '대전 대덕구',
    material: '폐PP',
    monthlyAmount: 52,
    connections: 2,
    approvedMatches: 1,
    status: 'active',
    description: '산업용 부품 제조 과정에서 폐PP가 발생하는 공급기업',
    latitude: 36.3466,
    longitude: 127.4156,
  },
  {
    id: 'emitter-e',
    name: '동아소재',
    type: 'emitter',
    region: '대구 달서구',
    material: '폐PET',
    monthlyAmount: 58,
    connections: 2,
    approvedMatches: 1,
    status: 'approved',
    description: '섬유 원사 가공 과정에서 폐PET가 발생하는 공급기업',
    latitude: 35.8299,
    longitude: 128.5327,
  },
  {
    id: 'emitter-f',
    name: '남해산업',
    type: 'emitter',
    region: '부산 강서구',
    material: '폐PE',
    monthlyAmount: 49,
    connections: 1,
    approvedMatches: 0,
    status: 'pending',
    description: '포장재 제조 공정에서 폐PE가 발생하는 공급기업',
    latitude: 35.2122,
    longitude: 128.9806,
  },
  {
    id: 'processor-a',
    name: '그린리사이클',
    type: 'processor',
    region: '경기 안산시',
    material: 'PP·PE',
    monthlyAmount: 150,
    connections: 5,
    approvedMatches: 2,
    status: 'approved',
    description: '폐합성수지 선별·세척·파쇄 공정을 운영하는 중간처리기업',
    latitude: 37.3219,
    longitude: 126.8309,
  },
  {
    id: 'processor-b',
    name: '에코순환',
    type: 'processor',
    region: '충북 청주시',
    material: 'PET·PP',
    monthlyAmount: 90,
    connections: 4,
    approvedMatches: 1,
    status: 'active',
    description: '폐PET 선별 및 플레이크 생산이 가능한 중간처리기업',
    latitude: 36.6424,
    longitude: 127.489,
  },
  {
    id: 'processor-c',
    name: '청정자원',
    type: 'processor',
    region: '전북 전주시',
    material: 'PE·PP',
    monthlyAmount: 110,
    connections: 4,
    approvedMatches: 2,
    status: 'approved',
    description: '세척·분쇄·압출 공정을 운영하는 중간처리기업',
    latitude: 35.8242,
    longitude: 127.148,
  },
  {
    id: 'processor-d',
    name: '영남리프로',
    type: 'processor',
    region: '경북 구미시',
    material: 'PET·PP·PE',
    monthlyAmount: 95,
    connections: 4,
    approvedMatches: 1,
    status: 'active',
    description: '재생원료 전처리를 수행하는 중간처리기업',
    latitude: 36.1195,
    longitude: 128.3446,
  },
  {
    id: 'consumer-a',
    name: '새론소재',
    type: 'consumer',
    region: '경기 평택시',
    material: '재생 PP',
    monthlyAmount: 60,
    connections: 2,
    approvedMatches: 1,
    status: 'approved',
    description: '재생 PP 원료를 활용해 자동차 부품을 생산하는 수요기업',
    latitude: 36.9921,
    longitude: 127.1129,
  },
  {
    id: 'consumer-b',
    name: '미래건재',
    type: 'consumer',
    region: '충남 아산시',
    material: '재생 PE',
    monthlyAmount: 50,
    connections: 2,
    approvedMatches: 1,
    status: 'active',
    description: '재생 PE를 건축자재 생산에 활용하는 수요기업',
    latitude: 36.7898,
    longitude: 127.0018,
  },
  {
    id: 'consumer-c',
    name: '청명섬유',
    type: 'consumer',
    region: '경북 경산시',
    material: '재생 PET',
    monthlyAmount: 40,
    connections: 2,
    approvedMatches: 0,
    status: 'pending',
    description: '재생 PET 원료 기반 섬유 제품을 생산하는 수요기업',
    latitude: 35.8251,
    longitude: 128.7415,
  },
  {
    id: 'consumer-d',
    name: '한결모빌리티',
    type: 'consumer',
    region: '울산 북구',
    material: '재생 PP',
    monthlyAmount: 55,
    connections: 2,
    approvedMatches: 1,
    status: 'approved',
    description: '재생 PP 기반 자동차 내장재를 생산하는 수요기업',
    latitude: 35.5827,
    longitude: 129.3613,
  },
  {
    id: 'consumer-e',
    name: '서해케미칼',
    type: 'consumer',
    region: '전남 여수시',
    material: '재생 PE',
    monthlyAmount: 47,
    connections: 2,
    approvedMatches: 1,
    status: 'active',
    description: '재생 PE 원료를 산업용 자재에 활용하는 수요기업',
    latitude: 34.7604,
    longitude: 127.6622,
  },
  {
    id: 'consumer-f',
    name: '제주에코텍',
    type: 'consumer',
    region: '제주 제주시',
    material: '재생 PET',
    monthlyAmount: 28,
    connections: 1,
    approvedMatches: 0,
    status: 'pending',
    description: '재생 PET 활용 소비재를 생산하는 수요기업',
    latitude: 33.4996,
    longitude: 126.5312,
  },
]

const matches: MatchDetail[] = [
  { id: 'match-1', source: 'emitter-a', target: 'processor-a', material: '폐PP', amount: 60, score: 94, roi: 18.6, carbonReduction: 42.5, status: 'approved' },
  { id: 'match-2', source: 'processor-a', target: 'consumer-a', material: '재생 PP', amount: 55, score: 92, roi: 17.2, carbonReduction: 39.8, status: 'approved' },
  { id: 'match-3', source: 'emitter-b', target: 'processor-a', material: '폐PE', amount: 48, score: 87, roi: 14.1, carbonReduction: 31.4, status: 'active' },
  { id: 'match-4', source: 'processor-a', target: 'consumer-b', material: '재생 PE', amount: 45, score: 85, roi: 13.8, carbonReduction: 29.7, status: 'active' },
  { id: 'match-5', source: 'emitter-c', target: 'processor-b', material: '폐PET', amount: 40, score: 81, roi: 11.4, carbonReduction: 24.2, status: 'pending' },
  { id: 'match-6', source: 'processor-b', target: 'consumer-c', material: '재생 PET', amount: 38, score: 79, roi: 10.9, carbonReduction: 22.8, status: 'pending' },
  { id: 'match-7', source: 'emitter-d', target: 'processor-b', material: '폐PP', amount: 44, score: 84, roi: 12.7, carbonReduction: 26.4, status: 'active' },
  { id: 'match-8', source: 'processor-b', target: 'consumer-d', material: '재생 PP', amount: 41, score: 82, roi: 12.1, carbonReduction: 23.5, status: 'active' },
  { id: 'match-9', source: 'emitter-e', target: 'processor-d', material: '폐PET', amount: 51, score: 91, roi: 16.3, carbonReduction: 36.8, status: 'approved' },
  { id: 'match-10', source: 'processor-d', target: 'consumer-c', material: '재생 PET', amount: 46, score: 88, roi: 14.6, carbonReduction: 32.1, status: 'approved' },
  { id: 'match-11', source: 'emitter-f', target: 'processor-d', material: '폐PE', amount: 35, score: 76, roi: 9.4, carbonReduction: 18.7, status: 'pending' },
  { id: 'match-12', source: 'processor-c', target: 'consumer-e', material: '재생 PE', amount: 43, score: 86, roi: 13.3, carbonReduction: 28.6, status: 'approved' },
  { id: 'match-13', source: 'emitter-b', target: 'processor-c', material: '폐PE', amount: 39, score: 80, roi: 10.8, carbonReduction: 22.4, status: 'active' },
  { id: 'match-14', source: 'emitter-a', target: 'processor-c', material: '폐PP', amount: 32, score: 78, roi: 10.1, carbonReduction: 19.5, status: 'pending' },
  { id: 'match-15', source: 'processor-c', target: 'consumer-f', material: '재생 PET', amount: 21, score: 72, roi: 8.2, carbonReduction: 12.4, status: 'pending' },
]

function NetworkMapPage() {
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<Core | null>(null)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [companyType, setCompanyType] = useState<CompanyType | 'all'>('all')
  const [status, setStatus] = useState<MatchStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyDetail | null>(companies[3])
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)

  const filteredCompanyIds = useMemo(() => {
    return new Set(
      companies
        .filter((company) => {
          const matchesKeyword =
            !searchKeyword.trim() ||
            company.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            company.material
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()) ||
            company.region.toLowerCase().includes(searchKeyword.toLowerCase())

          const matchesType =
            companyType === 'all' || company.type === companyType

          const matchesStatus =
            status === 'all' || company.status === status

          return matchesKeyword && matchesType && matchesStatus
        })
        .map((company) => company.id),
    )
  }, [companyType, searchKeyword, status])

  const graphElements = useMemo<ElementDefinition[]>(() => {
    const nodeElements: ElementDefinition[] = companies.map((company) => ({
      data: {
        id: company.id,
        label: company.name,
        type: company.type,
        typeLabel: companyTypeIcon[company.type],
        connectionCount: company.connections,
        visible: filteredCompanyIds.has(company.id),
      },
      classes: company.type,
    }))

    const edgeElements: ElementDefinition[] = matches.map((match) => ({
      data: {
        id: match.id,
        source: match.source,
        target: match.target,
        label: `${match.amount}톤`,
        amount: match.amount,
        status: match.status,
        visible:
          filteredCompanyIds.has(match.source) &&
          filteredCompanyIds.has(match.target),
      },
      classes: match.status,
    }))

    return [...nodeElements, ...edgeElements]
  }, [filteredCompanyIds])

  useEffect(() => {
    if (viewMode !== 'graph' || !graphContainerRef.current) {
      return
    }

    const cy = cytoscape({
      container: graphContainerRef.current,
      elements: graphElements,
      minZoom: 0.45,
      maxZoom: 2.2,
      wheelSensitivity: 0.18,
      boxSelectionEnabled: false,
      autoungrabify: false,
      style: [
        {
          selector: 'node',
          style: {
            width: 'mapData(connectionCount, 1, 4, 48, 76)',
            height: 'mapData(connectionCount, 1, 4, 48, 76)',
            label: 'data(label)',
            'font-size': 12,
            'font-weight': 700,
            'text-valign': 'bottom',
            'text-margin-y': 12,
            color: '#111827',
            'background-color': '#ffffff',
            'border-width': 4,
            'border-color': '#94a3b8',
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'node.emitter',
          style: {
            'border-color': '#2563eb',
            'background-color': '#dbeafe',
          },
        },
        {
          selector: 'node.processor',
          style: {
            'border-color': '#ea580c',
            'background-color': '#ffedd5',
          },
        },
        {
          selector: 'node.consumer',
          style: {
            'border-color': '#16a34a',
            'background-color': '#dcfce7',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 7,
            'border-color': '#18181b',
            'background-color': '#fef08a',
          },
        },
        {
          selector: 'node.dimmed',
          style: {
            opacity: 0.16,
          },
        },
        {
          selector: 'node.hidden-by-filter',
          style: {
            display: 'none',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 'mapData(amount, 0, 100, 2, 7)',
            label: 'data(label)',
            'font-size': 10,
            color: '#475569',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': "3px",
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1.1,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'edge.approved',
          style: {
            width: 5,
            'line-color': '#7c3aed',
            'target-arrow-color': '#7c3aed',
          },
        },
        {
          selector: 'edge.active',
          style: {
            width: 4,
            'line-color': '#16a34a',
            'target-arrow-color': '#16a34a',
          },
        },
        {
          selector: 'edge.pending',
          style: {
            width: 3,
            'line-style': 'dashed',
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            opacity: 0.1,
          },
        },
        {
          selector: 'edge.hidden-by-filter',
          style: {
            display: 'none',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        fit: true,
        padding: 60,
        nodeRepulsion: () => 9500,
        idealEdgeLength: () => 145,
        edgeElasticity: () => 100,
        gravity: 0.22,
        numIter: 1200,
      },
    })

    cyRef.current = cy

    cy.nodes().forEach((node) => {
      const id = node.id()
      const isVisible = filteredCompanyIds.has(id)
      node.toggleClass('hidden-by-filter', !isVisible)
    })

    cy.edges().forEach((edge) => {
      const sourceVisible = filteredCompanyIds.has(edge.source().id())
      const targetVisible = filteredCompanyIds.has(edge.target().id())
      edge.toggleClass(
        'hidden-by-filter',
        !(sourceVisible && targetVisible),
      )
    })

    cy.on('tap', 'node', (event) => {
      const node = event.target as NodeSingular
      const company = companies.find((item) => item.id === node.id())

      if (!company) {
        return
      }

      setSelectedCompany(company)
      setSelectedMatch(null)

      cy.elements().removeClass('dimmed')
      cy.elements().addClass('dimmed')
      node.removeClass('dimmed')
      node.closedNeighborhood().removeClass('dimmed')
    })

    cy.on('tap', 'edge', (event) => {
      const edge = event.target as EdgeSingular
      const match = matches.find((item) => item.id === edge.id())

      if (!match) {
        return
      }

      setSelectedMatch(match)
      setSelectedCompany(null)

      cy.elements().removeClass('dimmed')
      cy.elements().addClass('dimmed')
      edge.removeClass('dimmed')
      edge.source().removeClass('dimmed')
      edge.target().removeClass('dimmed')
    })

    cy.on('tap', (event) => {
      if (event.target !== cy) {
        return
      }

      cy.elements().removeClass('dimmed')
      setSelectedCompany(null)
      setSelectedMatch(null)
    })

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [graphElements, filteredCompanyIds, viewMode])

  const resetGraph = () => {
    setSearchKeyword('')
    setCompanyType('all')
    setStatus('all')
    setSelectedCompany(null)
    setSelectedMatch(null)

    const cy = cyRef.current

    if (!cy) {
      return
    }

    cy.elements().removeClass('dimmed hidden-by-filter')
    cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 350,
      fit: true,
      padding: 60,
      nodeRepulsion: () => 9500,
      idealEdgeLength: () => 145,
    }).run()
  }

  const focusSearchResult = () => {
    const keyword = searchKeyword.trim().toLowerCase()

    if (!keyword || !cyRef.current) {
      return
    }

    const company = companies.find(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.material.toLowerCase().includes(keyword),
    )

    if (!company) {
      return
    }

    const node = cyRef.current.getElementById(company.id)

    if (!node.length) {
      return
    }

    setSelectedCompany(company)
    setSelectedMatch(null)

    cyRef.current.elements().addClass('dimmed')
    node.removeClass('dimmed')
    node.closedNeighborhood().removeClass('dimmed')
    cyRef.current.animate({
      center: { eles: node },
      zoom: 1.3,
      duration: 300,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 lg:px-6">
      <header className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Network className="h-4 w-4" />
            컨소시엄 관리
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            산업공생 네트워크맵
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            승인된 컨소시엄과 기업 간 자원순환 연결 현황을 확인합니다.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <SummaryCard label="연결 기업" value="8개" />
          <SummaryCard label="승인 조합" value="2건" />
          <SummaryCard label="예상 감축" value="190.4t" />
        </div>
      </header>

      <section className="grid min-h-180 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <aside className="border-b border-slate-200 bg-slate-50/80 p-4 xl:border-b-0 xl:border-r">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Filter className="h-4 w-4" />
              필터
            </div>
            <button
              type="button"
              onClick={resetGraph}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </button>
          </div>

          <FilterSection title="기업 검색">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    focusSearchResult()
                  }
                }}
                placeholder="기업명 또는 재질"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </FilterSection>

          <FilterSection title="기업 유형">
            <FilterButton
              active={companyType === 'all'}
              onClick={() => setCompanyType('all')}
            >
              <Users className="h-4 w-4" />
              전체 기업
            </FilterButton>
            <FilterButton
              active={companyType === 'emitter'}
              onClick={() => setCompanyType('emitter')}
            >
              <Factory className="h-4 w-4 text-blue-600" />
              배출기업
            </FilterButton>
            <FilterButton
              active={companyType === 'processor'}
              onClick={() => setCompanyType('processor')}
            >
              <Truck className="h-4 w-4 text-orange-600" />
              중간처리기업
            </FilterButton>
            <FilterButton
              active={companyType === 'consumer'}
              onClick={() => setCompanyType('consumer')}
            >
              <Building2 className="h-4 w-4 text-green-600" />
              수요기업
            </FilterButton>
          </FilterSection>

          <FilterSection title="진행 상태">
            <SelectFilter
              value={status}
              onChange={(value) =>
                setStatus(value as MatchStatus | 'all')
              }
              options={[
                { value: 'all', label: '전체 상태' },
                { value: 'approved', label: '최종 승인' },
                { value: 'active', label: '산업공생 진행' },
                { value: 'pending', label: '응답 대기' },
              ]}
            />
          </FilterSection>

          <FilterSection title="범례">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <LegendDot className="border-blue-600 bg-blue-100">
                배출기업
              </LegendDot>
              <LegendDot className="border-orange-600 bg-orange-100">
                중간처리기업
              </LegendDot>
              <LegendDot className="border-green-600 bg-green-100">
                수요기업
              </LegendDot>

              <div className="border-t border-slate-100 pt-3">
                <LegendLine className="border-violet-600">
                  최종 승인
                </LegendLine>
                <LegendLine className="border-green-600">
                  산업공생 진행
                </LegendLine>
                <LegendLine className="border-slate-500 border-dashed">
                  응답 대기
                </LegendLine>
              </div>
            </div>
          </FilterSection>
        </aside>

        <main className="relative min-h-155 overflow-hidden bg-[radial-gradient(circle_at_center,#f8fafc_0,#ffffff_70%)]">
          <div className="absolute left-4 top-4 z-20 flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <ViewModeButton
              active={viewMode === 'graph'}
              onClick={() => setViewMode('graph')}
            >
              <Share2 className="h-4 w-4" />
              그래프형
            </ViewModeButton>

            <ViewModeButton
              active={viewMode === 'map'}
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4" />
              지도형
            </ViewModeButton>
          </div>

          {viewMode === 'graph' && (
            <>
              <div className="absolute right-4 top-4 z-10 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <GraphButton
                  label="확대"
                  onClick={() =>
                    cyRef.current?.zoom(cyRef.current.zoom() * 1.2)
                  }
                >
                  <ZoomIn className="h-4 w-4" />
                </GraphButton>
                <GraphButton
                  label="축소"
                  onClick={() =>
                    cyRef.current?.zoom(cyRef.current.zoom() / 1.2)
                  }
                >
                  <ZoomOut className="h-4 w-4" />
                </GraphButton>
                <GraphButton
                  label="전체 보기"
                  onClick={() => cyRef.current?.fit(undefined, 60)}
                >
                  <RotateCcw className="h-4 w-4" />
                </GraphButton>
              </div>

              <div ref={graphContainerRef} className="h-full min-h-180 w-full" />

              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs text-slate-500 shadow-sm backdrop-blur">
                노드를 선택하면 연결 기업을, 연결선을 선택하면 조합 정보를
                확인할 수 있습니다.
              </div>
            </>
          )}

          {viewMode === 'map' && (
            <KakaoNetworkMap
              companies={companies}
              matches={matches}
              visibleCompanyIds={filteredCompanyIds}
              selectedCompany={selectedCompany}
              selectedMatch={selectedMatch}
              onSelectCompany={(company) => {
                setSelectedCompany(company)
                setSelectedMatch(null)
              }}
              onSelectMatch={(match) => {
                setSelectedMatch(match)
                setSelectedCompany(null)
              }}
            />
          )}
        </main>

        <aside className="border-t border-slate-200 bg-white p-5 xl:border-l xl:border-t-0">
          {selectedCompany ? (
            <CompanyPanel
              company={selectedCompany}
              onClose={() => setSelectedCompany(null)}
            />
          ) : selectedMatch ? (
            <MatchPanel
              match={selectedMatch}
              onClose={() => setSelectedMatch(null)}
            />
          ) : (
            <EmptyPanel />
          )}
        </aside>
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-24 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-slate-900">{value}</div>
    </div>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
        active
          ? 'bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200'
          : 'text-slate-600 hover:bg-white hover:text-slate-900',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function LegendDot({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-full border-2 ${className}`} />
      {children}
    </div>
  )
}

function LegendLine({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className={`w-7 border-t-2 ${className}`} />
      {children}
    </div>
  )
}

function ViewModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition',
        active
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function GraphButton({
  label,
  children,
  onClick,
}: {
  label: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  )
}

function CompanyPanel({
  company,
  onClose,
}: {
  company: CompanyDetail
  onClose: () => void
}) {
  return (
    <div>
      <PanelHeader title="기업 상세정보" onClose={onClose} />

      <div className="mb-5 rounded-xl bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={[
              'flex h-12 w-12 items-center justify-center rounded-full border-4 text-sm font-bold',
              company.type === 'emitter'
                ? 'border-blue-600 bg-blue-100 text-blue-700'
                : company.type === 'processor'
                  ? 'border-orange-600 bg-orange-100 text-orange-700'
                  : 'border-green-600 bg-green-100 text-green-700',
            ].join(' ')}
          >
            {companyTypeIcon[company.type]}
          </div>

          <div>
            <h2 className="font-bold text-slate-950">{company.name}</h2>
            <p className="text-sm text-slate-500">
              {companyTypeLabel[company.type]} · {company.region}
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">
          {company.description}
        </p>
      </div>

      <DetailSection title="폐합성수지 정보">
        <DetailRow label="취급 재질" value={company.material} />
        <DetailRow
          label={
            company.type === 'emitter'
              ? '월 발생량'
              : company.type === 'processor'
                ? '가용 처리용량'
                : '월 수요량'
          }
          value={`${company.monthlyAmount}톤`}
        />
        <DetailRow label="운영 상태" value={statusLabel[company.status]} />
      </DetailSection>

      <DetailSection title="네트워크 현황">
        <DetailRow label="연결 기업 수" value={`${company.connections}개`} />
        <DetailRow
          label="승인 조합 수"
          value={`${company.approvedMatches}건`}
        />
        <DetailRow label="최근 연결일" value="2026.07.21" />
      </DetailSection>

      <button
        type="button"
        className="mt-5 h-11 w-full rounded-lg bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        기업 상세 보기
      </button>
    </div>
  )
}

function MatchPanel({
  match,
  onClose,
}: {
  match: MatchDetail
  onClose: () => void
}) {
  const source = companies.find((company) => company.id === match.source)
  const target = companies.find((company) => company.id === match.target)

  return (
    <div>
      <PanelHeader title="연결 조합 상세" onClose={onClose} />

      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="text-xs font-semibold text-emerald-700">
          {statusLabel[match.status]}
        </div>
        <div className="mt-2 font-bold text-slate-950">
          {source?.name} → {target?.name}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          {match.material} · 월 {match.amount}톤
        </div>
      </div>

      <DetailSection title="추천 근거">
        <DetailRow label="후보 조합 적합도" value={`${match.score}점`} />
        <DetailRow label="예상 ROI" value={`${match.roi}%`} />
        <DetailRow
          label="예상 탄소감축량"
          value={`${match.carbonReduction}tCO₂e`}
        />
        <DetailRow label="예상 운송거리" value="42km" />
      </DetailSection>

      <DetailSection title="기업 응답">
        <DetailRow label={source?.name ?? '공급기업'} value="수락" />
        <DetailRow label={target?.name ?? '대상기업'} value="수락" />
      </DetailSection>

      <button
        type="button"
        className="mt-5 h-11 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        조합 상세 검토
      </button>
    </div>
  )
}

function PanelHeader({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="font-bold text-slate-950">{title}</h2>
      <button
        type="button"
        aria-label="상세 패널 닫기"
        onClick={onClose}
        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {children}
      </div>
    </section>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function EmptyPanel() {
  return (
    <div className="flex min-h-125 flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Network className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="font-semibold text-slate-900">기업 또는 연결 선택</h2>
      <p className="mt-2 max-w-52 text-sm leading-6 text-slate-500">
        네트워크에서 기업 노드나 연결선을 선택하면 상세정보가
        표시됩니다.
      </p>
    </div>
  )
}