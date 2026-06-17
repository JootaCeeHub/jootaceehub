'use client'

import { LabProductPage } from '@/components/labs/LabProductPage'
import { CRMLab } from '@/components/labs/CRMLab'
import { LAB_REGISTRY } from '@/lib/labs/registry'

export default function CrmClient() {
  return (
    <LabProductPage config={LAB_REGISTRY['crm']!}>
      <CRMLab />
    </LabProductPage>
  )
}
