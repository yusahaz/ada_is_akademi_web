import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { workerPortalApi } from '../../../../../api/worker/worker-portal'
import { useActionToasts } from '../../../../../notifications/use-action-toasts'
import { useTheme } from '../../../../../theme/theme-context'
import { StatePanel } from '../../../../../shared/ui/ui-primitives'
import { WorkerPrimaryButton } from '../../../worker-ui'
import { resolveMuted, resolveTitle } from './helpers'

export function SkillsSection({
  workerId,
  initialSkills,
}: {
  workerId: number
  initialSkills: Array<{ id: number; tag: string }>
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { runWithToast } = useActionToasts()
  const [skills, setSkills] = useState(initialSkills)
  const [newSkill, setNewSkill] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [globalSkills, setGlobalSkills] = useState<string[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  useEffect(() => {
    let isActive = true
    void workerPortalApi.listGlobalSkills(1000).then((items) => {
      if (!isActive) return
      setGlobalSkills(items)
    })
    return () => {
      isActive = false
    }
  }, [])

  const filteredSuggestions = useMemo(() => {
    const query = newSkill.trim().toLocaleLowerCase('tr-TR')
    if (!query) return globalSkills.slice(0, 10)
    return globalSkills
      .filter((item) => item.toLocaleLowerCase('tr-TR').includes(query))
      .slice(0, 10)
  }, [globalSkills, newSkill])

  const handleAddSkill = async () => {
    const tag = toPascalCase(newSkill)
    if (!tag || submitting || !workerId) return
    if (skills.some((item) => item.tag.toLowerCase() === tag.toLowerCase())) return
    setSubmitting(true)
    try {
      const skillId = await runWithToast(workerPortalApi.addWorkerSkill(workerId, tag), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSkills((prev) => [...prev, { id: Number(skillId) || Date.now(), tag }])
      setNewSkill('')
      setSuggestionsOpen(false)
    } catch {
      // toast already handled
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveSkill = async (skillId: number) => {
    if (!skillId || removingId) return
    setRemovingId(skillId)
    try {
      await runWithToast(workerPortalApi.removeWorkerSkill(skillId), {
        success: { messageKey: 'dashboard.workerPortal.profile.messages.savedLocal' },
        error: { messageKey: 'dashboard.workerPortal.states.fetchError' },
      })
      setSkills((prev) => prev.filter((item) => item.id !== skillId))
    } catch {
      // toast already handled
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div>
      <p className={`text-sm font-semibold ${resolveTitle(theme)}`}>
        {t('dashboard.workerPortal.profile.skillsSection.title')}
      </p>
      <p className={`mt-1 text-xs ${resolveMuted(theme)}`}>
        {t('dashboard.workerPortal.profile.skillsSection.subtitle')}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative w-full min-w-[12rem] flex-1">
          <input
            value={newSkill}
            onChange={(event) => {
              setNewSkill(event.target.value)
              setSuggestionsOpen(true)
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => {
              // Delay close so suggestion click can be handled.
              window.setTimeout(() => setSuggestionsOpen(false), 120)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleAddSkill()
              }
            }}
            placeholder={t('dashboard.workerPortal.profile.skillsSection.inputPlaceholder')}
            className={`w-full min-w-[12rem] flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${theme === 'dark' ? 'border-white/20 bg-white/[0.03] text-white placeholder:text-white/40' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`}
          />
          {suggestionsOpen && filteredSuggestions.length > 0 ? (
            <div
              className={`mt-2 max-h-52 w-full overflow-auto rounded-xl border p-1 ${
                theme === 'dark' ? 'border-white/15 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            >
              {filteredSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    setNewSkill(toPascalCase(skill))
                  }}
                  className={`block w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${
                    theme === 'dark'
                      ? 'text-white/90 hover:bg-cyan-400/20'
                      : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {toPascalCase(skill)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <WorkerPrimaryButton
          tone={theme}
          onClick={() => void handleAddSkill()}
          disabled={submitting || !newSkill.trim()}
        >
          {t('dashboard.workerPortal.profile.skillsSection.add')}
        </WorkerPrimaryButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <StatePanel text={t('dashboard.workerPortal.profile.skillsSection.empty')} theme={theme} />
        ) : (
          skills.map((skill) => (
            <span
              key={skill.id}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${theme === 'dark' ? 'border-white/15 bg-white/[0.04] text-white/85' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <span>{skill.tag}</span>
              <button
                type="button"
                onClick={() => void handleRemoveSkill(skill.id)}
                disabled={removingId === skill.id}
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition ${theme === 'dark' ? 'text-rose-200 hover:bg-rose-400/20 disabled:opacity-50' : 'text-rose-700 hover:bg-rose-100 disabled:opacity-50'}`}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}

function toPascalCase(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase('tr-TR')
      return `${lower.charAt(0).toLocaleUpperCase('tr-TR')}${lower.slice(1)}`
    })
    .join(' ')
}
