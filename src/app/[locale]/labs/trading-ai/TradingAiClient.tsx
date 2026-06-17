'use client'

import { LabProductPage } from '@/components/labs/LabProductPage'
import { TradingLab } from '@/components/labs/TradingLab'
import { LAB_REGISTRY } from '@/lib/labs/registry'

export default function TradingAiClient() {
  return (
    <LabProductPage config={LAB_REGISTRY['trading-ai']!}>
      <TradingLab />
    </LabProductPage>
  )
}
