'use client'

import { LabProductPage } from '@/components/labs/LabProductPage'
import { AURALab } from '@/components/labs/AURALab'
import { LAB_REGISTRY } from '@/lib/labs/registry'

export default function AuraClient() {
  return (
    <LabProductPage config={LAB_REGISTRY['aura']!}>
      <AURALab />
    </LabProductPage>
  )
}
