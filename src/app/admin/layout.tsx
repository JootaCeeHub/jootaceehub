import { GoogleAuthProvider } from '@/components/providers/GoogleAuthProvider'
import { AuthProvider } from '@/lib/auth/context'
import { AdminProvider } from '@/lib/admin/store'
import AdminAuthGate from '@/components/admin/AdminAuthGate'
import AdminShell from '@/components/admin/AdminShell'
import PanelRouter from '@/components/admin/PanelRouter'
import { I18nProvider } from '@/lib/i18n/context'
import { DocumentLang } from '@/lib/i18n/DocumentLang'
import messagesEn from '../../../messages/en.json'

export const metadata = {
  title: 'Admin — JootaCee',
  description: 'JootaCee CMS · private admin dashboard',
  robots: { index: false, follow: false },
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function AdminLayout({
  children: _children,
}: {
  children: React.ReactNode
}) {
  return (
    <GoogleAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <I18nProvider locale="en" messages={messagesEn}>
          <DocumentLang locale="en" />
          <AdminProvider>
            <AdminAuthGate>
              <AdminShell>
                <PanelRouter />
              </AdminShell>
            </AdminAuthGate>
          </AdminProvider>
        </I18nProvider>
      </AuthProvider>
    </GoogleAuthProvider>
  )
}
