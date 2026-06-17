'use client'

import { LabProductPage } from '@/components/labs/LabProductPage'
import { STLLab } from '@/components/labs/STLLab'
import { LAB_REGISTRY } from '@/lib/labs/registry'

export default function StlGeneratorClient() {
  return (
    <LabProductPage config={LAB_REGISTRY['stl-generator']!}>
      <STLLab />
    </LabProductPage>
  )
}
