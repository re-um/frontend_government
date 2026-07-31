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
  ChevronDown,
  Factory,
  Filter,
  Map as MapIcon,
  MapPinned,
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
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { KakaoNetworkMap } from '../components/KakaoNetworkMap'
import { IndustrialOverview } from '../components/IndustrialOverview'
import { RegionalNetworkDetail } from '../components/RegionalNetworkDetail'
import { RegionalNetworkMap } from '../components/RegionalNetworkMap'
import {
  filterRegionalNetworkData,
  regionalNetworkData,
} from '../data/regionalNetworkData'
import type {
  RegionalNetworkFilters,
} from '../types/regionalNetwork'

const DigitalTwinNetwork3D = lazy(() =>
  import('../components/DigitalTwinNetwork3D').then((module) => ({
    default: module.DigitalTwinNetwork3D,
  })),
)

export const Route = createFileRoute('/network')({
  component: NetworkMapPage,
})

type CompanyType = 'emitter' | 'processor' | 'consumer'
type MatchStatus = 'approved' | 'active' | 'pending'
type ViewMode = 'graph' | 'overview' | 'twin3d' | 'map' | 'regional'

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
  {
    id: 'emitter-g',
    name: '강원필름',
    type: 'emitter',
    region: '강원 원주시',
    material: '폐PE',
    monthlyAmount: 46,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '농산물 포장필름 생산 과정에서 폐PE가 발생하는 공급기업',
    latitude: 37.3422,
    longitude: 127.9202,
  },
  {
    id: 'processor-e',
    name: '강원순환자원',
    type: 'processor',
    region: '강원 춘천시',
    material: 'PE·PP',
    monthlyAmount: 82,
    connections: 3,
    approvedMatches: 2,
    status: 'approved',
    description: '강원권 폐합성수지 세척·파쇄·펠릿화 공정을 운영하는 중간처리기업',
    latitude: 37.8813,
    longitude: 127.7298,
  },
  {
    id: 'consumer-g',
    name: '동해산업자재',
    type: 'consumer',
    region: '강원 강릉시',
    material: '재생 PE',
    monthlyAmount: 32,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '재생 PE를 물류용 포장재와 산업용 시트 생산에 활용하는 수요기업',
    latitude: 37.7519,
    longitude: 128.8761,
  },
  {
    id: 'consumer-h',
    name: '원주에코몰드',
    type: 'consumer',
    region: '강원 원주시',
    material: '재생 PP',
    monthlyAmount: 36,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '재생 PP를 생활용 사출제품 생산에 활용하는 수요기업',
    latitude: 37.3705,
    longitude: 127.9422,
  },
  {
    id: 'emitter-h',
    name: '빛고을패키지',
    type: 'emitter',
    region: '광주 광산구',
    material: '폐PP',
    monthlyAmount: 54,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '식품·생활용품 포장용기 생산 과정에서 폐PP가 발생하는 공급기업',
    latitude: 35.1395,
    longitude: 126.7937,
  },
  {
    id: 'processor-f',
    name: '호남리사이클링',
    type: 'processor',
    region: '전남 나주시',
    material: 'PP·PET',
    monthlyAmount: 105,
    connections: 3,
    approvedMatches: 1,
    status: 'active',
    description: '호남권 폐PP·폐PET 선별과 재생원료 생산을 수행하는 중간처리기업',
    latitude: 35.0158,
    longitude: 126.7108,
  },
  {
    id: 'consumer-i',
    name: '목포해양소재',
    type: 'consumer',
    region: '전남 목포시',
    material: '재생 PP',
    monthlyAmount: 39,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '재생 PP를 해양 부표와 수산업용 자재에 활용하는 수요기업',
    latitude: 34.8118,
    longitude: 126.3922,
  },
  {
    id: 'consumer-j',
    name: '광양그린텍',
    type: 'consumer',
    region: '전남 광양시',
    material: '재생 PET',
    monthlyAmount: 34,
    connections: 1,
    approvedMatches: 0,
    status: 'pending',
    description: '재생 PET 원료를 산업용 부직포 생산에 활용하는 수요기업',
    latitude: 34.9407,
    longitude: 127.6959,
  },
  {
    id: 'emitter-i',
    name: '경남포장산업',
    type: 'emitter',
    region: '경남 김해시',
    material: '폐PE',
    monthlyAmount: 62,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '자동차 부품 포장재 생산 과정에서 폐PE가 발생하는 공급기업',
    latitude: 35.2285,
    longitude: 128.8894,
  },
  {
    id: 'processor-g',
    name: '경남자원순환',
    type: 'processor',
    region: '경남 창원시',
    material: 'PE·PP',
    monthlyAmount: 118,
    connections: 3,
    approvedMatches: 2,
    status: 'approved',
    description: '경남권 폐합성수지 압축·세척·압출 공정을 운영하는 중간처리기업',
    latitude: 35.2279,
    longitude: 128.6811,
  },
  {
    id: 'consumer-k',
    name: '진주바이오플라',
    type: 'consumer',
    region: '경남 진주시',
    material: '재생 PE',
    monthlyAmount: 44,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '재생 PE를 농업용 자재와 복합소재 생산에 활용하는 수요기업',
    latitude: 35.1799,
    longitude: 128.1076,
  },
  {
    id: 'consumer-l',
    name: '거제모빌리티',
    type: 'consumer',
    region: '경남 거제시',
    material: '재생 PP',
    monthlyAmount: 42,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '재생 PP를 선박·자동차 내장 부품 생산에 활용하는 수요기업',
    latitude: 34.8806,
    longitude: 128.6211,
  },
  {
    id: 'emitter-j',
    name: '태백산업필름',
    type: 'emitter',
    region: '강원 태백시',
    material: '폐PE',
    monthlyAmount: 38,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '산업용 보호필름 생산 과정에서 폐PE가 발생하는 공급기업',
    latitude: 37.1641,
    longitude: 128.9856,
  },
  {
    id: 'emitter-k',
    name: '횡성패키징',
    type: 'emitter',
    region: '강원 횡성군',
    material: '폐PP',
    monthlyAmount: 35,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '식품 포장용기 생산 과정에서 폐PP가 발생하는 공급기업',
    latitude: 37.4917,
    longitude: 127.985,
  },
  {
    id: 'consumer-m',
    name: '춘천그린소재',
    type: 'consumer',
    region: '강원 춘천시',
    material: '재생 PP',
    monthlyAmount: 29,
    connections: 1,
    approvedMatches: 0,
    status: 'pending',
    description: '재생 PP를 생활용품과 물류자재 생산에 활용하는 수요기업',
    latitude: 37.8813,
    longitude: 127.7298,
  },
  {
    id: 'emitter-l',
    name: '전주생활포장',
    type: 'emitter',
    region: '전북 전주시',
    material: '폐PP',
    monthlyAmount: 43,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '생활용품 포장재 생산 과정에서 폐PP가 발생하는 공급기업',
    latitude: 35.8242,
    longitude: 127.148,
  },
  {
    id: 'emitter-m',
    name: '여수화학용기',
    type: 'emitter',
    region: '전남 여수시',
    material: '폐PET',
    monthlyAmount: 37,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '산업용 화학제품 용기 생산 과정에서 폐PET가 발생하는 공급기업',
    latitude: 34.7604,
    longitude: 127.6622,
  },
  {
    id: 'consumer-n',
    name: '순천에코텍',
    type: 'consumer',
    region: '전남 순천시',
    material: '재생 PET',
    monthlyAmount: 28,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '재생 PET를 건축용 흡음재 생산에 활용하는 수요기업',
    latitude: 34.9506,
    longitude: 127.4872,
  },
  {
    id: 'emitter-n',
    name: '양산정밀포장',
    type: 'emitter',
    region: '경남 양산시',
    material: '폐PE',
    monthlyAmount: 48,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '정밀부품 포장재 생산 과정에서 폐PE가 발생하는 공급기업',
    latitude: 35.335,
    longitude: 129.037,
  },
  {
    id: 'emitter-o',
    name: '통영수산패키지',
    type: 'emitter',
    region: '경남 통영시',
    material: '폐PP',
    monthlyAmount: 41,
    connections: 1,
    approvedMatches: 1,
    status: 'approved',
    description: '수산물 운송용 포장용기 생산 과정에서 폐PP가 발생하는 공급기업',
    latitude: 34.8544,
    longitude: 128.4332,
  },
  {
    id: 'consumer-o',
    name: '창원순환부품',
    type: 'consumer',
    region: '경남 창원시',
    material: '재생 PP',
    monthlyAmount: 33,
    connections: 1,
    approvedMatches: 0,
    status: 'active',
    description: '재생 PP를 산업기계 내장 부품 생산에 활용하는 수요기업',
    latitude: 35.2279,
    longitude: 128.6811,
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
  { id: 'match-16', source: 'emitter-g', target: 'processor-e', material: '폐PE', amount: 41, score: 90, roi: 15.4, carbonReduction: 29.8, status: 'approved' },
  { id: 'match-17', source: 'processor-e', target: 'consumer-g', material: '재생 PE', amount: 30, score: 88, roi: 14.7, carbonReduction: 23.6, status: 'approved' },
  { id: 'match-18', source: 'processor-e', target: 'consumer-h', material: '재생 PP', amount: 33, score: 83, roi: 12.5, carbonReduction: 21.9, status: 'active' },
  { id: 'match-19', source: 'emitter-h', target: 'processor-f', material: '폐PP', amount: 49, score: 86, roi: 13.8, carbonReduction: 32.4, status: 'active' },
  { id: 'match-20', source: 'processor-f', target: 'consumer-i', material: '재생 PP', amount: 36, score: 89, roi: 15.1, carbonReduction: 26.7, status: 'approved' },
  { id: 'match-21', source: 'processor-f', target: 'consumer-j', material: '재생 PET', amount: 31, score: 77, roi: 9.8, carbonReduction: 18.5, status: 'pending' },
  { id: 'match-22', source: 'emitter-i', target: 'processor-g', material: '폐PE', amount: 56, score: 93, roi: 17.3, carbonReduction: 38.9, status: 'approved' },
  { id: 'match-23', source: 'processor-g', target: 'consumer-k', material: '재생 PE', amount: 42, score: 91, roi: 16.4, carbonReduction: 30.8, status: 'approved' },
  { id: 'match-24', source: 'processor-g', target: 'consumer-l', material: '재생 PP', amount: 39, score: 85, roi: 13.6, carbonReduction: 25.2, status: 'active' },
  { id: 'match-25', source: 'emitter-j', target: 'processor-e', material: '폐PE', amount: 35, score: 89, roi: 14.8, carbonReduction: 27.5, status: 'approved' },
  { id: 'match-26', source: 'emitter-k', target: 'processor-e', material: '폐PP', amount: 31, score: 82, roi: 11.9, carbonReduction: 20.4, status: 'active' },
  { id: 'match-27', source: 'processor-e', target: 'consumer-m', material: '재생 PP', amount: 26, score: 78, roi: 9.7, carbonReduction: 18.7, status: 'pending' },
  { id: 'match-28', source: 'emitter-l', target: 'processor-f', material: '폐PP', amount: 39, score: 91, roi: 15.6, carbonReduction: 30.2, status: 'approved' },
  { id: 'match-29', source: 'emitter-m', target: 'processor-f', material: '폐PET', amount: 34, score: 88, roi: 14.3, carbonReduction: 24.8, status: 'approved' },
  { id: 'match-30', source: 'processor-f', target: 'consumer-n', material: '재생 PET', amount: 25, score: 81, roi: 10.8, carbonReduction: 19.6, status: 'active' },
  { id: 'match-31', source: 'emitter-n', target: 'processor-g', material: '폐PE', amount: 44, score: 92, roi: 16.8, carbonReduction: 34.1, status: 'approved' },
  { id: 'match-32', source: 'emitter-o', target: 'processor-g', material: '폐PP', amount: 37, score: 90, roi: 15.2, carbonReduction: 28.3, status: 'approved' },
  { id: 'match-33', source: 'processor-g', target: 'consumer-o', material: '재생 PP', amount: 30, score: 84, roi: 12.1, carbonReduction: 21.7, status: 'active' },
]

function getCompanyNetwork(companyId: string) {
  const connectedIds = new Set<string>([companyId])
  const queue = [companyId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    matches.forEach((match) => {
      const neighbor =
        match.source === currentId
          ? match.target
          : match.target === currentId
            ? match.source
            : null
      if (neighbor && !connectedIds.has(neighbor)) {
        connectedIds.add(neighbor)
        queue.push(neighbor)
      }
    })
  }

  return {
    companies: companies.filter((company) => connectedIds.has(company.id)),
    matches: matches.filter(
      (match) =>
        connectedIds.has(match.source) && connectedIds.has(match.target),
    ),
  }
}

function NetworkMapPage() {
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<Core | null>(null)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [companyType, setCompanyType] = useState<CompanyType | 'all'>('all')
  const [status, setStatus] = useState<MatchStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [overviewFocusCompanyId, setOverviewFocusCompanyId] =
    useState<string | undefined>()
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyDetail | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [regionalFilters, setRegionalFilters] =
    useState<RegionalNetworkFilters>({
      regionCode: 'all',
      industry: 'all',
      companyType: 'all',
      status: 'all',
    })
  const [selectedRegionCode, setSelectedRegionCode] = useState<
    string | undefined
  >()
  // 사용자가 3D 버튼을 누르기 전에 무거운 Three.js 청크를 유휴 시간에
  // 미리 받아 두어 첫 진입 대기 시간을 줄인다.
  useEffect(() => {
    const preload = () => void import('../components/DigitalTwinNetwork3D')
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1500 })
      return () => window.cancelIdleCallback(idleId)
    }
    const timerId = window.setTimeout(preload, 400)
    return () => window.clearTimeout(timerId)
  }, [])

  const selectedNetwork = useMemo(
    () =>
      viewMode === 'twin3d' && selectedCompany
        ? getCompanyNetwork(selectedCompany.id)
        : null,
    [selectedCompany, viewMode],
  )

  const filteredRegionalData = useMemo(
    () => filterRegionalNetworkData(regionalNetworkData, regionalFilters),
    [regionalFilters],
  )

  const regionalTotals = useMemo(
    () =>
      filteredRegionalData.reduce(
        (total, region) => ({
          totalCompanies: total.totalCompanies + region.totalCompanies,
          participatingCompanies:
            total.participatingCompanies + region.participatingCompanies,
          consortiumCount: total.consortiumCount + region.consortiumCount,
          unconnectedCompanies:
            total.unconnectedCompanies + region.unconnectedCompanies,
        }),
        {
          totalCompanies: 0,
          participatingCompanies: 0,
          consortiumCount: 0,
          unconnectedCompanies: 0,
        },
      ),
    [filteredRegionalData],
  )

  const selectedRegion = useMemo(
    () =>
      filteredRegionalData.find(
        (region) => region.regionCode === selectedRegionCode,
      ) ?? null,
    [filteredRegionalData, selectedRegionCode],
  )

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
          <SummaryCard label="연결 기업" value="37개" />
          <SummaryCard label="승인 조합" value="16건" />
          <SummaryCard label="예상 감축" value="883.9t" />
        </div>
      </header>

      <section
        className={`grid min-h-180 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
          viewMode === 'regional'
            ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
            : viewMode === 'twin3d'
              ? 'xl:h-[calc(100vh-140px)] xl:min-h-180 xl:max-h-215 xl:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)]'
              : 'xl:grid-cols-[240px_minmax(0,1fr)_320px]'
        }`}
      >
        {viewMode !== 'regional' && (
        <aside
          className={`border-b border-slate-200 bg-slate-50/80 p-4 xl:border-b-0 xl:border-r ${
            viewMode === 'twin3d' ? 'xl:min-h-0 xl:overflow-y-auto' : ''
          }`}
        >
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
        )}

        <main
          className={`relative min-h-155 overflow-hidden bg-[radial-gradient(circle_at_center,#f8fafc_0,#ffffff_70%)] ${
            viewMode === 'twin3d' ? 'xl:h-full xl:min-h-0' : ''
          }`}
        >
          <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <ViewModeButton
              active={viewMode === 'graph'}
              onClick={() => setViewMode('graph')}
            >
              <Share2 className="h-4 w-4" />
              연결망 그래프
            </ViewModeButton>

            <ViewModeButton
              active={viewMode === 'map'}
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4" />
              기업 위치 지도
            </ViewModeButton>

            <ViewModeButton
              active={viewMode === 'regional'}
              onClick={() => {
                setViewMode('regional')
                setSelectedCompany(null)
                setSelectedMatch(null)
              }}
            >
              <MapPinned className="h-4 w-4" />
              지역별 네트워크 현황
            </ViewModeButton>

            <ViewModeButton
              active={viewMode === 'twin3d'}
              onClick={() => setViewMode('twin3d')}
            >
              <Network className="h-4 w-4" />
              3D 네트워크
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

          {viewMode === 'overview' && (
            <IndustrialOverview
              companies={companies}
              matches={matches}
              visibleCompanyIds={filteredCompanyIds}
              selectedCompanyId={selectedCompany?.id}
              selectedMatchId={selectedMatch?.id}
              focusCompanyId={overviewFocusCompanyId}
              onSelectCompany={(companyId) => {
                const company = companies.find(
                  (item) => item.id === companyId,
                )
                if (!company) return
                setSelectedCompany(company)
                setSelectedMatch(null)
              }}
              onSelectMatch={(matchId) => {
                const match = matches.find((item) => item.id === matchId)
                if (!match) return
                setSelectedMatch(match)
                setSelectedCompany(null)
              }}
              onBackToMap={() => setViewMode('map')}
            />
          )}

          {viewMode === 'twin3d' && (
            <Suspense
              fallback={
                <div className="flex min-h-180 items-center justify-center bg-slate-950 text-sm font-medium text-cyan-200">
                  3D 네트워크를 불러오는 중입니다...
                </div>
              }
            >
              <DigitalTwinNetwork3D
                companies={companies}
                matches={matches}
                visibleCompanyIds={filteredCompanyIds}
                selectedCompanyId={selectedCompany?.id}
                selectedMatchId={selectedMatch?.id}
                onSelectCompany={(companyId) => {
                  const company = companies.find((item) => item.id === companyId)
                  if (!company) return
                  setSelectedCompany(company)
                  setSelectedMatch(null)
                }}
                onSelectMatch={(matchId) => {
                  const match = matches.find((item) => item.id === matchId)
                  if (!match) return
                  setSelectedMatch(match)
                  setSelectedCompany(null)
                }}
                onClearSelection={() => {
                  setSelectedCompany(null)
                  setSelectedMatch(null)
                }}
              />
            </Suspense>
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
                setOverviewFocusCompanyId(company.id)
                setViewMode('overview')
              }}
              onSelectMatch={(match) => {
                setSelectedMatch(match)
                setSelectedCompany(null)
              }}
            />
          )}

          {viewMode === 'regional' && (
            <div className="min-h-180 bg-slate-50 px-4 pb-5 pt-24 sm:pt-18">
              <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                <RegionalSummaryCard
                  label="전체 등록 기업"
                  value={`${regionalTotals.totalCompanies}개`}
                  tone="slate"
                />
                <RegionalSummaryCard
                  label="산업공생 참여기업"
                  value={`${regionalTotals.participatingCompanies}개`}
                  tone="emerald"
                />
                <RegionalSummaryCard
                  label="운영 컨소시엄"
                  value={`${regionalTotals.consortiumCount}개`}
                  tone="violet"
                />
                <RegionalSummaryCard
                  label="연계 필요 기업"
                  value={`${regionalTotals.unconnectedCompanies}개`}
                  tone="orange"
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-4">
                <RegionalFilterSelect
                  label="지역"
                  value={regionalFilters.regionCode}
                  onChange={(value) => {
                    setRegionalFilters((current) => ({
                      ...current,
                      regionCode: value,
                    }))
                    setSelectedRegionCode(
                      value === 'all' ? undefined : value,
                    )
                  }}
                  options={[
                    { value: 'all', label: '전체 지역' },
                    ...regionalNetworkData.map((region) => ({
                      value: region.regionCode,
                      label: region.regionName,
                    })),
                  ]}
                />
                <RegionalFilterSelect
                  label="산업"
                  value={regionalFilters.industry}
                  onChange={(value) =>
                    setRegionalFilters((current) => ({
                      ...current,
                      industry: value as RegionalNetworkFilters['industry'],
                    }))
                  }
                  options={[
                    { value: 'all', label: '전체 산업' },
                    { value: '플라스틱', label: '플라스틱' },
                    { value: '금속', label: '금속' },
                    { value: '화학', label: '화학' },
                    { value: '섬유', label: '섬유' },
                    { value: '기타', label: '기타' },
                  ]}
                />
                <RegionalFilterSelect
                  label="기업 유형"
                  value={regionalFilters.companyType}
                  onChange={(value) =>
                    setRegionalFilters((current) => ({
                      ...current,
                      companyType:
                        value as RegionalNetworkFilters['companyType'],
                    }))
                  }
                  options={[
                    { value: 'all', label: '전체 기업 유형' },
                    { value: 'supplier', label: '배출기업' },
                    { value: 'processor', label: '중간처리기업' },
                    { value: 'consumer', label: '수요기업' },
                  ]}
                />
                <RegionalFilterSelect
                  label="상태"
                  value={regionalFilters.status}
                  onChange={(value) =>
                    setRegionalFilters((current) => ({
                      ...current,
                      status: value as RegionalNetworkFilters['status'],
                    }))
                  }
                  options={[
                    { value: 'all', label: '전체 상태' },
                    { value: 'participating', label: '참여기업' },
                    { value: 'unconnected', label: '연계 필요 기업' },
                    { value: 'consortium', label: '컨소시엄 참여기업' },
                  ]}
                />
              </div>

              <RegionalNetworkMap
                regions={filteredRegionalData}
                selectedRegionCode={selectedRegionCode}
                onSelectRegion={setSelectedRegionCode}
                onBackToRegions={() => setSelectedRegionCode(undefined)}
              />
            </div>
          )}
        </main>

        <aside
          className={`border-t border-slate-200 bg-white p-5 xl:border-l xl:border-t-0 ${
            viewMode === 'twin3d' ? 'xl:min-h-0 xl:overflow-y-auto' : ''
          }`}
        >
          {viewMode === 'regional' ? (
            selectedRegion ? (
              <RegionalNetworkDetail
                region={selectedRegion}
              />
            ) : (
              <RegionalEmptyPanel />
            )
          ) : selectedNetwork && selectedCompany ? (
            <NetworkPanel
              anchorCompany={selectedCompany}
              networkCompanies={selectedNetwork.companies}
              networkMatches={selectedNetwork.matches}
              onSelectCompany={(company) => {
                setSelectedCompany(company)
                setSelectedMatch(null)
              }}
              onClose={() => setSelectedCompany(null)}
            />
          ) : selectedCompany ? (
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
            <EmptyPanel compact={viewMode === 'map'} />
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

function RegionalSummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'slate' | 'emerald' | 'violet' | 'orange'
}) {
  const toneClass = {
    slate: 'border-slate-200 bg-white text-slate-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    violet: 'border-violet-200 bg-violet-50 text-violet-800',
    orange: 'border-orange-200 bg-orange-50 text-orange-800',
  }[tone]

  return (
    <div className={`rounded-xl border p-3 shadow-sm ${toneClass}`}>
      <div className="text-[11px] font-medium opacity-70">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  )
}

function RegionalFilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] font-semibold text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RegionalEmptyPanel() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <MapPinned className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">
        지역을 선택해 주세요
      </h2>
      <p className="mt-3 max-w-none break-keep text-base leading-7 text-slate-500 xl:whitespace-nowrap">
        지도 위 지역 집계 마커를 누르면 참여기업, 컨소시엄 및 산업별 현황을 확인할 수 있습니다.
      </p>
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

function SimulationPanel({
  proposal,
  onReset,
  onClose,
}: {
  proposal: { sourceId: string; targetId: string }
  onReset: () => void
  onClose: () => void
}) {
  const [saved, setSaved] = useState(false)
  const source = companies.find((company) => company.id === proposal.sourceId)!
  const target = companies.find((company) => company.id === proposal.targetId)!
  const targetNetwork = getCompanyNetwork(target.id)
  const beforeFlow = targetNetwork.matches.reduce(
    (sum, match) => sum + match.amount,
    0,
  )
  const beforeCarbon = targetNetwork.matches.reduce(
    (sum, match) => sum + match.carbonReduction,
    0,
  )
  const beforeScore = Math.round(
    targetNetwork.matches.reduce((sum, match) => sum + match.score, 0) /
      Math.max(targetNetwork.matches.length, 1),
  )
  const materialTokens = (material: string) =>
    ['PP', 'PE', 'PET', 'PS', 'ABS'].filter((token) =>
      material.toUpperCase().includes(token),
    )
  const sourceMaterials = materialTokens(source.material)
  const targetMaterials = new Set(
    targetNetwork.companies.flatMap((company) =>
      materialTokens(company.material),
    ),
  )
  const materialScore =
    sourceMaterials.length > 0 &&
    sourceMaterials.some((material) => targetMaterials.has(material))
      ? 100
      : 28
  const roleScore =
    source.type === target.type
      ? 32
      : source.type === 'processor' || target.type === 'processor'
        ? 96
        : 82
  const amountScore = Math.round(
    (Math.min(source.monthlyAmount, target.monthlyAmount) /
      Math.max(source.monthlyAmount, target.monthlyAmount, 1)) *
      100,
  )
  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(target.latitude - source.latitude)
  const longitudeDelta = toRadians(target.longitude - source.longitude)
  const distanceA =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(source.latitude)) *
      Math.cos(toRadians(target.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2
  const distanceKm =
    6371 * 2 * Math.atan2(Math.sqrt(distanceA), Math.sqrt(1 - distanceA))
  const distanceScore = Math.max(8, Math.round(100 - distanceKm / 4.5))
  const networkCapacity = targetNetwork.companies.reduce(
    (sum, company) => sum + company.monthlyAmount,
    0,
  )
  const utilization = beforeFlow / Math.max(networkCapacity, 1)
  const capacityScore = Math.max(
    12,
    Math.min(100, Math.round((1.08 - utilization) * 115)),
  )
  const combinationScore = Math.round(
    materialScore * 0.3 +
      amountScore * 0.25 +
      distanceScore * 0.2 +
      roleScore * 0.15 +
      capacityScore * 0.1,
  )
  const networkSupply = targetNetwork.companies
    .filter((company) => company.type !== 'consumer')
    .reduce((sum, company) => sum + company.monthlyAmount, 0)
  const networkDemand = targetNetwork.companies
    .filter((company) => company.type === 'consumer')
    .reduce((sum, company) => sum + company.monthlyAmount, 0)
  const balanceScore = (supply: number, demand: number) =>
    Math.round(
      (Math.min(supply, demand) / Math.max(supply, demand, 1)) * 100,
    )
  const beforeBalance = balanceScore(networkSupply, networkDemand)
  const afterSupply =
    networkSupply + (source.type === 'consumer' ? 0 : source.monthlyAmount)
  const afterDemand =
    networkDemand + (source.type === 'consumer' ? source.monthlyAmount : 0)
  const afterBalance = balanceScore(afterSupply, afterDemand)
  const balanceChange = afterBalance - beforeBalance
  const balanceAdjustment =
    balanceChange < 0 ? balanceChange * 0.5 : balanceChange * 0.25
  const projectedScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (beforeScore * targetNetwork.matches.length + combinationScore) /
          Math.max(targetNetwork.matches.length + 1, 1) +
          balanceAdjustment,
      ),
    ),
  )
  const adjustedCombinationScore = Math.max(
    0,
    Math.min(100, Math.round(combinationScore + balanceAdjustment)),
  )
  const changeRate =
    adjustedCombinationScore >= 80
      ? 0.08 + ((adjustedCombinationScore - 80) / 20) * 0.1
      : adjustedCombinationScore >= 60
        ? -0.02 + ((adjustedCombinationScore - 60) / 20) * 0.08
        : -0.06 - ((60 - adjustedCombinationScore) / 60) * 0.12
  const afterFlow = Math.max(0, Math.round(beforeFlow * (1 + changeRate)))
  const transportPenalty = Math.max(0, distanceKm - 80) * 0.018
  const afterCarbon = Math.max(
    0,
    beforeCarbon * (1 + changeRate * 1.18) - transportPenalty,
  )
  const verdict =
    adjustedCombinationScore >= 80
      ? { label: '개선 예상', className: 'bg-emerald-100 text-emerald-700' }
      : adjustedCombinationScore >= 60
        ? { label: '변화 제한적', className: 'bg-amber-100 text-amber-700' }
        : { label: '악화 가능성', className: 'bg-rose-100 text-rose-700' }

  const comparisons = [
    {
      label: '참여 기업',
      before: `${targetNetwork.companies.length}개`,
      after: `${targetNetwork.companies.length + 1}개`,
      direction: 0,
    },
    {
      label: '유효 자원순환량',
      before: `${beforeFlow}t`,
      after: `${afterFlow}t`,
      direction: Math.sign(afterFlow - beforeFlow),
    },
    {
      label: '예상 탄소감축',
      before: `${beforeCarbon.toFixed(1)}t`,
      after: `${afterCarbon.toFixed(1)}t`,
      direction: Math.sign(afterCarbon - beforeCarbon),
    },
    {
      label: '평균 매칭 적합도',
      before: `${beforeScore}점`,
      after: `${projectedScore}점`,
      direction: Math.sign(projectedScore - beforeScore),
    },
    {
      label: '공급·수요 균형',
      before: `${beforeBalance}%`,
      after: `${afterBalance}%`,
      direction: Math.sign(afterBalance - beforeBalance),
    },
  ]

  return (
    <div>
      <PanelHeader title="조합 시뮬레이션" onClose={onClose} />

      <div className="mb-4 rounded-xl border border-lime-200 bg-lime-50 p-4">
        <div className="text-xs font-semibold text-lime-700">가상 이동안</div>
        <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-950">
          <span className="min-w-0 flex-1 truncate">{source.name}</span>
          <span className="text-lime-600">→</span>
          <span className="min-w-0 flex-1 truncate text-right">
            {target.name} 네트워크
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-slate-500">
          실제 연결은 변경되지 않은 가상 후보안입니다.
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-lime-200 pt-3">
          <span className="text-[11px] text-slate-500">
            종합 적합도 {adjustedCombinationScore}점 · 거리{' '}
            {Math.round(distanceKm)}km
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${verdict.className}`}
          >
            {verdict.label}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_64px_64px] bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-500">
          <span>분석 항목</span>
          <span className="text-right">변경 전</span>
          <span className="text-right">변경 후</span>
        </div>
        <div className="divide-y divide-slate-100">
          {comparisons.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[1fr_64px_64px] items-center px-3 py-3 text-xs"
            >
              <span className="text-slate-500">{item.label}</span>
              <span className="text-right font-semibold text-slate-600">
                {item.before}
              </span>
              <span
                className={[
                  'text-right font-bold',
                  item.direction === 0
                    ? 'text-slate-700'
                    : item.direction > 0
                      ? 'text-emerald-600'
                      : 'text-rose-600',
                ].join(' ')}
              >
                {item.direction !== 0
                  ? item.direction > 0
                    ? '▲ '
                    : '▼ '
                  : ''}
                {item.after}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setSaved(false)
            onReset()
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          원래대로
        </button>
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="h-10 rounded-lg bg-lime-400 text-xs font-bold text-slate-950 transition hover:bg-lime-300"
        >
          후보안 저장
        </button>
      </div>

      {saved && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          가상 후보안이 검토 목록에 저장되었습니다.
        </div>
      )}
    </div>
  )
}

function NetworkPanel({
  anchorCompany,
  networkCompanies,
  networkMatches,
  onSelectCompany,
  onClose,
}: {
  anchorCompany: CompanyDetail
  networkCompanies: CompanyDetail[]
  networkMatches: MatchDetail[]
  onSelectCompany: (company: CompanyDetail) => void
  onClose: () => void
}) {
  const [expandedConnectionId, setExpandedConnectionId] = useState<
    string | null
  >(null)
  const [showPendingActions, setShowPendingActions] = useState(false)
  const allCompanyCarbon = new Map<string, number>()
  matches.forEach((match) => {
    allCompanyCarbon.set(
      match.source,
      (allCompanyCarbon.get(match.source) ?? 0) + match.carbonReduction,
    )
    allCompanyCarbon.set(
      match.target,
      (allCompanyCarbon.get(match.target) ?? 0) + match.carbonReduction,
    )
  })
  const companyMetrics = networkCompanies.map((company) => {
    return {
      company,
      carbon: allCompanyCarbon.get(company.id) ?? 0,
    }
  })
  const maxAmount = Math.max(...companies.map((company) => company.monthlyAmount), 1)
  const maxCarbon = Math.max(...allCompanyCarbon.values(), 1)
  const materialCounts = new Map<string, number>()
  companies.forEach((company) => {
    materialCounts.set(
      company.material,
      (materialCounts.get(company.material) ?? 0) + 1,
    )
  })
  const weightedCompanies = companyMetrics
    .map((item) => {
      const relatedMatches = networkMatches.filter(
        (match) =>
          match.source === item.company.id || match.target === item.company.id,
      )
      const amountScore = item.company.monthlyAmount / maxAmount
      const carbonScore = item.carbon / maxCarbon
      const statusScore = { approved: 1, active: 0.75, pending: 0.4 }[
        item.company.status
      ]
      const scarcityScore =
        1 / (materialCounts.get(item.company.material) ?? 1)
      const reasons = [
        amountScore < 0.45 ? '월 물량 낮음' : null,
        carbonScore < 0.45 ? '탄소기여 낮음' : null,
        statusScore < 0.6 ? '응답 대기' : null,
        scarcityScore < 0.34 ? '동일 재질 기업 많음' : null,
      ].filter((reason): reason is string => Boolean(reason))
      const importance = Math.round(
        (amountScore * 0.4 +
          carbonScore * 0.35 +
          statusScore * 0.15 +
          scarcityScore * 0.1) *
          100,
      )
      const relatedCompanyIds = relatedMatches.map((match) =>
        match.source === item.company.id ? match.target : match.source,
      )
      const hasProcessorLink =
        item.company.type === 'processor' ||
        relatedCompanyIds.some(
          (companyId) =>
            companies.find((company) => company.id === companyId)?.type ===
            'processor',
        )
      const connectionGrounds = [
        relatedMatches.length > 0 ? '재질 적합' : null,
        relatedMatches.some((match) => match.status === 'approved')
          ? '승인 관계'
          : null,
        relatedMatches.some((match) => match.status === 'active')
          ? '운영 진행'
          : null,
        hasProcessorLink ? '중간처리 연계' : null,
      ].filter((ground): ground is string => Boolean(ground))
      return {
        ...item,
        importance,
        level:
          importance >= 70
            ? '핵심 기여'
            : importance >= 50
              ? '일반 기여'
              : '제한적 기여',
        reason:
          importance < 50
            ? reasons.length > 0
              ? reasons.slice(0, 2).join(' · ')
              : '종합 기여도 부족'
            : null,
        connectionGrounds:
          connectionGrounds.length > 0
            ? connectionGrounds.join(' · ')
            : '연결 관계 확인 필요',
      }
    })
    .sort((a, b) => b.importance - a.importance)
  const totalAmount = networkMatches.reduce(
    (sum, match) => sum + match.amount,
    0,
  )
  const totalCarbon = networkMatches.reduce(
    (sum, match) => sum + match.carbonReduction,
    0,
  )
  const anchorWeight = weightedCompanies.find(
    (item) => item.company.id === anchorCompany.id,
  )
  const networkCompanyById = new Map(
    networkCompanies.map((company) => [company.id, company]),
  )
  const connectionStatusCounts = {
    approved: networkMatches.filter((match) => match.status === 'approved')
      .length,
    active: networkMatches.filter((match) => match.status === 'active').length,
    pending: networkMatches.filter((match) => match.status === 'pending').length,
  }

  return (
    <div>
      <PanelHeader title="네트워크 분석" onClose={onClose} />

      <div className="mb-5 rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-5">
        <p className="text-base font-semibold text-cyan-700">선택 기준 기업</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">
          {anchorCompany.name}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <NetworkMetric label="기업" value={`${networkCompanies.length}개`} />
          <NetworkMetric label="이동량" value={`${totalAmount}t`} />
          <NetworkMetric
            label="탄소감축"
            value={`${totalCarbon.toFixed(1)}t`}
          />
        </div>
      </div>

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">연결 상태</h3>
            <p className="mt-1 text-sm text-slate-500">
              3D 연결선과 동일한 상태 기준입니다.
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-slate-500">
            총 {networkMatches.length}건
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <ConnectionStatusCard
            status="approved"
            count={connectionStatusCounts.approved}
          />
          <ConnectionStatusCard
            status="active"
            count={connectionStatusCounts.active}
          />
          <ConnectionStatusCard
            status="pending"
            count={connectionStatusCounts.pending}
          />
        </div>

        {connectionStatusCounts.pending > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
            <button
              type="button"
              aria-expanded={showPendingActions}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setShowPendingActions((current) => !current)
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400"
            >
              <div>
                <p className="text-sm font-bold text-amber-900">조치 필요</p>
                <p className="mt-0.5 break-keep text-sm leading-5 text-amber-700">
                  응답 대기 연결 {connectionStatusCounts.pending}건의 기업 응답을
                  확인해 주세요.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-900">
                  {connectionStatusCounts.pending}건
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-amber-700 transition-transform ${
                    showPendingActions ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {showPendingActions && (
              <div className="divide-y divide-amber-200 border-t border-amber-200 bg-white">
                {networkMatches
                  .filter((match) => match.status === 'pending')
                  .map((match) => {
                    const sourceCompany = networkCompanyById.get(match.source)
                    const targetCompany = networkCompanyById.get(match.target)

                    return (
                      <div
                        key={match.id}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="break-keep text-sm font-bold leading-5 text-slate-900">
                            {sourceCompany?.name ?? match.source}
                            <span className="mx-1.5 text-slate-400">→</span>
                            {targetCompany?.name ?? match.target}
                          </p>
                          <p className="mt-1 break-keep text-xs leading-5 text-slate-500">
                            {match.material} · {match.amount}t/월
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          응답 확인 필요
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-800">
            연결 상세
          </div>
          <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
            {networkMatches.map((match) => {
              const sourceCompany = networkCompanyById.get(match.source)
              const targetCompany = networkCompanyById.get(match.target)
              const expanded = expandedConnectionId === match.id

              return (
                <div
                  key={match.id}
                  className="bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      setExpandedConnectionId((current) =>
                        current === match.id ? null : match.id,
                      )
                    }}
                    className={`relative z-10 block w-full cursor-pointer px-4 py-3.5 text-left transition hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400 ${
                      expanded ? 'bg-cyan-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-keep text-[15px] font-bold leading-6 text-slate-900">
                          {sourceCompany?.name ?? match.source}
                          <span className="mx-1.5 text-slate-400">→</span>
                          {targetCompany?.name ?? match.target}
                        </p>
                        <p className="mt-1 break-keep text-sm leading-5 text-slate-500">
                          {match.material} · {match.amount}t/월 · 탄소감축{' '}
                          {match.carbonReduction.toFixed(1)}t
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <ConnectionStatusBadge status={match.status} />
                        <span className="flex items-center gap-1 text-xs font-semibold text-cyan-700">
                          {expanded ? '상세 닫기' : '상세 보기'}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expanded ? 'rotate-180' : ''
                            }`}
                          />
                        </span>
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-cyan-100 bg-cyan-50/60 px-4 py-4">
                      <ConnectionMiniDetail
                        label="출발 기업"
                        value={sourceCompany?.name ?? match.source}
                      />
                      <ConnectionMiniDetail
                        label="도착 기업"
                        value={targetCompany?.name ?? match.target}
                      />
                      <ConnectionMiniDetail
                        label="이동 재질"
                        value={match.material}
                      />
                      <ConnectionMiniDetail
                        label="월 이동량"
                        value={`${match.amount}t`}
                      />
                      <ConnectionMiniDetail
                        label="매칭 적합도"
                        value={`${match.score}점`}
                      />
                      <ConnectionMiniDetail
                        label="예상 ROI"
                        value={`${match.roi}%`}
                      />
                      <ConnectionMiniDetail
                        label="탄소감축"
                        value={`${match.carbonReduction.toFixed(1)}t`}
                      />
                      <ConnectionMiniDetail
                        label="진행 상태"
                        value={statusLabel[match.status]}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mb-3">
        <h3 className="text-base font-semibold uppercase tracking-wide text-slate-600">
          기업별 성과 기여도
        </h3>
        <p className="mt-2 text-[15px] leading-6 text-slate-500">
          월 물량 40% · 탄소감축 35% · 운영상태 15% · 재질 희소성 10%
        </p>
      </div>

      {anchorWeight && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold text-amber-800">
              {anchorCompany.name} 성과 기여도
            </span>
            <span className="text-xl font-bold text-slate-950">
              {anchorWeight.importance}점
            </span>
          </div>
          <p className="mt-2 text-[15px] font-medium leading-6 text-amber-700">
            평가 결과: {anchorWeight.level}
            {anchorWeight.reason
              ? ` · 제한 사유: ${anchorWeight.reason}`
              : ''}
          </p>
          <p className="mt-1 text-[15px] leading-6 text-slate-700">
            연결 근거: {anchorWeight.connectionGrounds}
          </p>
        </div>
      )}

      <div className="max-h-105 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full table-fixed text-left text-[15px]">
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              <th className="w-[55%] px-3 py-2.5 font-semibold">기업</th>
              <th className="w-[12%] px-1 py-2.5 font-semibold">유형</th>
              <th className="w-[15%] px-1 py-2.5 text-right font-semibold">
                물량
              </th>
              <th className="w-[18%] px-3 py-2.5 text-right font-semibold">
                기여도
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {weightedCompanies.map(
              ({
                company,
                importance,
                level,
                reason,
                connectionGrounds,
              }) => (
              <tr
                key={company.id}
                role="button"
                tabIndex={0}
                aria-label={`${company.name} 성과 기여도 상세 보기`}
                onClick={() => onSelectCompany(company)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectCompany(company)
                  }
                }}
                className={
                  company.id === anchorCompany.id
                    ? 'cursor-pointer bg-lime-50 outline-none ring-inset focus:ring-2 focus:ring-lime-400'
                    : 'cursor-pointer bg-white outline-none transition hover:bg-cyan-50 focus:ring-2 focus:ring-cyan-400'
                }
              >
                <td className="px-3 py-3">
                  <div className="truncate font-semibold text-slate-900">
                    {company.name}
                  </div>
                  <div
                    className={[
                      'mt-1 text-[13px] font-medium leading-5',
                      level === '핵심 기여'
                        ? 'text-emerald-600'
                        : level === '일반 기여'
                          ? 'text-slate-500'
                          : 'text-amber-600',
                    ].join(' ')}
                  >
                    {level}
                    {reason ? ` · 제한 사유: ${reason}` : ''}
                  </div>
                  <div className="mt-1 text-[13px] font-normal leading-5 text-cyan-700">
                    연결 근거: {connectionGrounds}
                  </div>
                </td>
                <td className="px-1 py-3 text-slate-500">
                  {companyTypeLabel[company.type].replace('기업', '')}
                </td>
                <td className="px-1 py-3 text-right text-slate-600">
                  {company.monthlyAmount}t
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-bold text-cyan-700">{importance}</span>
                </td>
              </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[15px] leading-6 text-slate-500">
        성과 기여도가 높은 기업일수록 3D 화면에서 크게 표시됩니다. 연결
        여부는 기여도가 아닌 재질·승인·처리 연계 근거로 판단합니다.
      </p>
    </div>
  )
}

function NetworkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 px-2 py-3 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

const connectionStatusStyle: Record<
  MatchStatus,
  { line: string; card: string; badge: string }
> = {
  approved: {
    line: 'bg-violet-500',
    card: 'border-violet-200 bg-violet-50 text-violet-800',
    badge: 'bg-violet-100 text-violet-800',
  },
  active: {
    line: 'bg-cyan-400',
    card: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  pending: {
    line:
      'bg-[repeating-linear-gradient(90deg,#94a3b8_0_6px,transparent_6px_10px)]',
    card: 'border-slate-200 bg-slate-50 text-slate-700',
    badge: 'bg-slate-200 text-slate-700',
  },
}

function ConnectionStatusCard({
  status,
  count,
}: {
  status: MatchStatus
  count: number
}) {
  const style = connectionStatusStyle[status]

  return (
    <div className={`rounded-xl border px-3 py-3 ${style.card}`}>
      <div className={`mb-2 h-1 w-9 rounded-full ${style.line}`} />
      <div className="break-keep text-xs font-semibold">{statusLabel[status]}</div>
      <div className="mt-1 text-xl font-bold">{count}건</div>
    </div>
  )
}

function ConnectionStatusBadge({ status }: { status: MatchStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${connectionStatusStyle[status].badge}`}
    >
      {statusLabel[status]}
    </span>
  )
}

function ConnectionMiniDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-keep text-sm font-bold text-slate-900">
        {value}
      </div>
    </div>
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

function EmptyPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-h-125 flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Network className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">기업 또는 연결 선택</h2>
      <p
        className={`mt-3 break-keep text-base leading-7 text-slate-500 ${
          compact ? 'max-w-64' : 'max-w-none xl:whitespace-nowrap'
        }`}
      >
        네트워크에서 기업 노드나 연결선을 선택하면 상세정보가 표시됩니다.
      </p>
    </div>
  )
}
