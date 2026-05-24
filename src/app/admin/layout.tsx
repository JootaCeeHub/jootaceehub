import { AdminProvider } from '@/lib/admin/store'
import AdminShell from '@/components/admin/AdminShell'
import PanelRouter from '@/components/admin/PanelRouter'
import { I18nProvider } from '@/lib/i18n/context'
import { DocumentLang } from '@/lib/i18n/DocumentLang'
import messagesEn from '../../../messages/en.json'

export const metadata = {
  title: 'Admin — JootaCee',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <I18nProvider locale="en" messages={messagesEn}>
      <DocumentLang locale="en" />
      <AdminProvider>
        <AdminShell>
          <PanelRouter />
        </AdminShell>
      </AdminProvider>
    </I18nProvider>
  )
}
