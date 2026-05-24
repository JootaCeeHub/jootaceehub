'use client'

import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import ThemeSelector from './design/ThemeSelector'
import PalettePicker from './design/PalettePicker'
import TypographyPicker from './design/TypographyPicker'
import ShapeSpacingPicker from './design/ShapeSpacingPicker'
import ShadowPicker from './design/ShadowPicker'
import GradientPicker from './design/GradientPicker'
import ButtonStylePicker from './design/ButtonStylePicker'
import DesignPreview from './design/DesignPreview'

export default function DesignPanel() {
  const t = useTranslations('admin')

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('design.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('design.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ThemeSelector />
        <PalettePicker />
        <TypographyPicker />
        <ShapeSpacingPicker />
        <ShadowPicker />
        <GradientPicker />
        <ButtonStylePicker />
      </div>

      <DesignPreview />
    </div>
  )
}
