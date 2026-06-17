'use client'

import { LabProductPage } from '@/components/labs/LabProductPage'
import { ERPLab } from '@/components/labs/ERPLab'
import { LAB_REGISTRY } from '@/lib/labs/registry'

export default function ErpClient() {
  return (
    <LabProductPage config={LAB_REGISTRY['erp']!}>
      <ERPLab />
    </LabProductPage>
  )
}
