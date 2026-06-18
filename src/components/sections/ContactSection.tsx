'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Terminal } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/context'
import { trackEvent } from '@/components/shared/Analytics'

export function ContactSection() {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    trackEvent('Contact Form Submit', { name: formData.name ? 'provided' : 'empty' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const services = t('services') as unknown as string[]

  return (
    <section id="contact" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('label')}
          title={t('title')}
          description={t('description')}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <div className="terminal-scan glass-strong rounded-3xl p-8">
              <div className="mb-6 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">collaboration terminal</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/15 p-3">
                    <Send className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{t('form.successTitle')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t('form.successMessage')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative">
                    <label htmlFor="contact-name" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t('form.nameLabel')}
                    </label>
                    <input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
                      placeholder={t('form.namePlaceholder')}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="contact-email" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t('form.emailLabel')}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
                      placeholder={t('form.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="contact-message" className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t('form.messageLabel')}
                    </label>
                    <textarea
                      id="contact-message"
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      className="h-36 w-full resize-none rounded-xl border border-border bg-card/60 px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
                      placeholder={t('form.messagePlaceholder')}
                      required
                    />
                  </div>
                  <Button size="lg" className="w-full" type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    {t('form.submit')}
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>

          <StaggerReveal className="space-y-4">
            {Array.isArray(services) && services.map((item) => (
              <div
                key={item}
                className="glass rounded-2xl p-5"
              >
                <p className="data-line pl-4 text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
            <a href={`mailto:${t('email')}`} className="glass flex items-center gap-3 rounded-2xl p-5 text-muted-foreground transition hover:text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              {t('email')}
            </a>
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}
