import type { WorkerProfileData } from '../types'
import { useTranslation } from 'react-i18next'

export type CvTemplateId =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'ats'
  | 'executive'
  | 'concise'
  | 'modernAzure'
  | 'modernGraphite'
  | 'classicNavy'
  | 'classicBurgundy'
  | 'minimalSlate'
  | 'minimalIndigo'
  | 'atsBlue'
  | 'atsMono'
  | 'executiveNavy'
  | 'executiveEmerald'
  | 'conciseTeal'
  | 'conciseAmber'
  | 'studioPhoto'
  | 'sidebarContrast'
export type CvLayoutVariant = 'single' | 'double'
export type CvColorPalette = 'slate' | 'indigo' | 'emerald'

export const CV_TEMPLATE_OPTIONS: Array<{ id: CvTemplateId }> = [
  { id: 'modern' },
  { id: 'classic' },
  { id: 'minimal' },
  { id: 'ats' },
  { id: 'executive' },
  { id: 'concise' },
  { id: 'modernAzure' },
  { id: 'modernGraphite' },
  { id: 'classicNavy' },
  { id: 'classicBurgundy' },
  { id: 'minimalSlate' },
  { id: 'minimalIndigo' },
  { id: 'atsBlue' },
  { id: 'atsMono' },
  { id: 'executiveNavy' },
  { id: 'executiveEmerald' },
  { id: 'conciseTeal' },
  { id: 'conciseAmber' },
  { id: 'studioPhoto' },
  { id: 'sidebarContrast' },
]

export type CvTemplatePreference = {
  templateId: CvTemplateId
  layoutVariant: CvLayoutVariant
  palette: CvColorPalette
}

export function getCvTemplateOptionMeta(t: (key: string) => string): Array<{ id: CvTemplateId; title: string; description: string }> {
  return CV_TEMPLATE_OPTIONS.map((option) => ({
    id: option.id,
    title: t(`dashboard.workerPortal.profile.cvSection.templateOptions.${option.id}.title`),
    description: t(`dashboard.workerPortal.profile.cvSection.templateOptions.${option.id}.description`),
  }))
}

export function resolveCvTemplateId(value: string | null | undefined): CvTemplateId {
  const parsed = tryParsePreferenceJson(value)
  if (parsed?.templateId) {
    return resolveCvTemplateId(parsed.templateId)
  }

  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'modernazure') return 'modernAzure'
  if (normalized === 'moderngraphite') return 'modernGraphite'
  if (normalized === 'classicnavy') return 'classicNavy'
  if (normalized === 'classicburgundy') return 'classicBurgundy'
  if (normalized === 'minimalslate') return 'minimalSlate'
  if (normalized === 'minimalindigo') return 'minimalIndigo'
  if (normalized === 'atsblue') return 'atsBlue'
  if (normalized === 'atsmono') return 'atsMono'
  if (normalized === 'executivenavy') return 'executiveNavy'
  if (normalized === 'executiveemerald') return 'executiveEmerald'
  if (normalized === 'conciseteal') return 'conciseTeal'
  if (normalized === 'conciseamber') return 'conciseAmber'
  if (normalized === 'studiophoto') return 'studioPhoto'
  if (normalized === 'sidebarcontrast') return 'sidebarContrast'
  if (normalized === 'classic') return 'classic'
  if (normalized === 'minimal') return 'minimal'
  if (normalized === 'ats') return 'ats'
  if (normalized === 'executive') return 'executive'
  if (normalized === 'concise') return 'concise'
  return 'modern'
}

type TemplateFamily = 'modern' | 'classic' | 'minimal' | 'ats' | 'executive' | 'concise'
type TemplatePreset = {
  family: TemplateFamily
  coloredHeader?: boolean
  coloredSidebar?: boolean
  photoPreferred?: boolean
}

const TEMPLATE_PRESETS: Record<CvTemplateId, TemplatePreset> = {
  modern: { family: 'modern', coloredSidebar: true, photoPreferred: true },
  classic: { family: 'classic' },
  minimal: { family: 'minimal', photoPreferred: true },
  ats: { family: 'ats' },
  executive: { family: 'executive', coloredHeader: true },
  concise: { family: 'concise', photoPreferred: true },
  modernAzure: { family: 'modern', coloredHeader: true, photoPreferred: true },
  modernGraphite: { family: 'modern', coloredSidebar: true },
  classicNavy: { family: 'classic', coloredHeader: true },
  classicBurgundy: { family: 'classic', coloredHeader: true },
  minimalSlate: { family: 'minimal' },
  minimalIndigo: { family: 'minimal', coloredSidebar: true, photoPreferred: true },
  atsBlue: { family: 'ats', coloredHeader: true },
  atsMono: { family: 'ats' },
  executiveNavy: { family: 'executive', coloredHeader: true },
  executiveEmerald: { family: 'executive', coloredHeader: true, photoPreferred: true },
  conciseTeal: { family: 'concise', coloredSidebar: true, photoPreferred: true },
  conciseAmber: { family: 'concise', coloredHeader: true, photoPreferred: true },
  studioPhoto: { family: 'modern', coloredHeader: true, photoPreferred: true },
  sidebarContrast: { family: 'modern', coloredSidebar: true },
}

type CvTemplatePreviewProps = {
  templateId: CvTemplateId
  profile: WorkerProfileData
  layoutVariant: CvLayoutVariant
  palette: CvColorPalette
  photoDataUrl?: string | null
  fullWidth?: boolean
}

function parseLabelValue(items: Array<{ label: string; value: string }>): string[] {
  return items
    .map((item) => [item.label, item.value].filter(Boolean).join(' - '))
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== 'N/A')
}

function parseSkills(items: Array<{ tag: string }>): string[] {
  return items.map((item) => item.tag.trim()).filter((item) => item.length > 0)
}

function sectionList(title: string, lines: string[], emptyText: string) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">{title}</h3>
      {lines.length > 0 ? (
        <ul className="space-y-1.5 text-sm leading-6 text-slate-700">
          {lines.map((line, idx) => (
            <li key={`${title}-${idx}`} className="list-disc ms-5">
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  )
}

function sectionParagraph(title: string, value: string, emptyText: string) {
  const text = value.trim().length > 0 ? value.trim() : emptyText
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">{title}</h3>
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </section>
  )
}

function resolvePalette(palette: CvColorPalette): {
  topBg: string
  topText: string
  topSubtle: string
  accentText: string
  accentBorder: string
} {
  if (palette === 'indigo') {
    return {
      topBg: 'bg-indigo-900',
      topText: 'text-indigo-50',
      topSubtle: 'text-indigo-200',
      accentText: 'text-indigo-700',
      accentBorder: 'border-indigo-300',
    }
  }
  if (palette === 'emerald') {
    return {
      topBg: 'bg-emerald-900',
      topText: 'text-emerald-50',
      topSubtle: 'text-emerald-200',
      accentText: 'text-emerald-700',
      accentBorder: 'border-emerald-300',
    }
  }
  return {
    topBg: 'bg-slate-900',
    topText: 'text-slate-50',
    topSubtle: 'text-slate-200',
    accentText: 'text-slate-700',
    accentBorder: 'border-slate-300',
  }
}

export function CvTemplatePreview({
  templateId,
  profile,
  layoutVariant,
  palette,
  photoDataUrl,
  fullWidth = false,
}: CvTemplatePreviewProps) {
  const rootWidthClass = fullWidth ? 'w-full max-w-none' : 'w-full max-w-[820px]'

  const { t } = useTranslation()
  const fullName = profile.fullName?.trim() || t('dashboard.workerPortal.cvTemplates.defaults.fullName')
  const title = profile.university?.trim() && profile.university !== 'N/A' ? profile.university : t('dashboard.workerPortal.cvTemplates.defaults.profileTitle')
  const email = profile.email?.trim() || '-'
  const phone = profile.phone?.trim() || '-'
  const nationality = profile.nationality?.trim() && profile.nationality !== 'N/A' ? profile.nationality : '-'
  const preset = TEMPLATE_PRESETS[templateId]
  const family = preset.family
  const showPhoto = Boolean(preset.photoPreferred && photoDataUrl)
  const paletteTokens = resolvePalette(palette)

  const skills = parseSkills(profile.skills)
  const educations = parseLabelValue(profile.educations)
  const experiences = parseLabelValue(profile.experiences)
  const certificates = parseLabelValue(profile.certificates)
  const references = parseLabelValue(profile.references)
  const languages = parseLabelValue(profile.languages)
  const summaryLine = `${title}. ${skills.length > 0 ? t('dashboard.workerPortal.cvTemplates.summary.skillsPrefix', { skills: skills.slice(0, 8).join(', ') }) : ''}`.trim()
  const emptyText = t('dashboard.workerPortal.cvTemplates.emptyInfo')
  const topBorder = palette === 'indigo' ? 'border-indigo-300' : palette === 'emerald' ? 'border-emerald-300' : 'border-slate-300'

  if (family === 'executive') {
    return (
      <article className={`mx-auto ${rootWidthClass} bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
        <header
          className={`${preset.coloredHeader ? `${paletteTokens.topBg} ${paletteTokens.topText} rounded-xl px-5 py-4` : `border-b-2 pb-5 ${topBorder}`}`}
        >
          <h1 className="text-3xl font-semibold tracking-wide">{fullName}</h1>
          <p className={`mt-1 text-sm font-medium ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{title}</p>
          <p className={`mt-2 text-sm ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>
            {email} | {phone} | {nationality}
          </p>
        </header>
        <div className="mt-6 grid gap-6">
          {sectionParagraph(t('dashboard.workerPortal.cvTemplates.sections.executiveSummary'), summaryLine, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.coreCompetencies'), skills, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.professionalExperience'), experiences, emptyText)}
          <div className="grid gap-6 md:grid-cols-2">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certifications'), certificates, emptyText)}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
          </div>
        </div>
      </article>
    )
  }

  if (family === 'classic') {
    return (
      <article className={`mx-auto ${rootWidthClass} bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
        <header
          className={`${
            preset.coloredHeader
              ? `${paletteTokens.topBg} ${paletteTokens.topText} rounded-xl px-5 py-4`
              : `border-b pb-5 ${paletteTokens.accentBorder}`
          }`}
        >
          <h1 className="text-3xl font-semibold tracking-wide">{fullName}</h1>
          <p className={`mt-1 text-sm ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-600'}`}>{title}</p>
          <div className={`mt-4 grid gap-1 text-sm sm:grid-cols-2 ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>
            <p>{t('dashboard.workerPortal.cvTemplates.labels.email')}: {email}</p>
            <p>{t('dashboard.workerPortal.cvTemplates.labels.phone')}: {phone}</p>
            <p>{t('dashboard.workerPortal.cvTemplates.labels.nationality')}: {nationality}</p>
          </div>
        </header>
        <div className={layoutVariant === 'double' ? 'mt-6 grid gap-8 lg:grid-cols-2' : 'mt-6 grid gap-8'}>
          <div className="space-y-6">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.experience'), experiences, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
          </div>
          <div className="space-y-6">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.skills'), skills, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certificates'), certificates, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
          </div>
        </div>
      </article>
    )
  }

  if (family === 'minimal') {
    return (
      <article className={`mx-auto ${rootWidthClass} bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
        <header className={layoutVariant === 'double' ? 'flex items-start justify-between gap-6 border-b border-slate-200 pb-5' : 'border-b border-slate-200 pb-5'}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
            <p className="mt-1 text-sm text-slate-600">{title}</p>
            <p className="mt-3 text-sm text-slate-700">
              {email} • {phone} • {nationality}
            </p>
          </div>
          {showPhoto ? (
            <img
              src={photoDataUrl!}
              alt={t('dashboard.workerPortal.cvTemplates.photoAlt')}
              className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover"
            />
          ) : null}
        </header>
        <div className={layoutVariant === 'double' ? 'mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]' : 'mt-6 grid gap-6'}>
          <div className="space-y-6">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.experience'), experiences, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
          </div>
          <div className="space-y-6">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.skills'), skills, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certificates'), certificates, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
          </div>
        </div>
      </article>
    )
  }

  if (family === 'ats') {
    return (
      <article className={`mx-auto ${rootWidthClass} bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
        <header
          className={`${
            preset.coloredHeader
              ? `${paletteTokens.topBg} ${paletteTokens.topText} rounded-xl px-5 py-4`
              : `border-b-2 pb-4 ${topBorder}`
          }`}
        >
          <h1 className="text-[30px] font-bold tracking-wide">{fullName}</h1>
          <p className={`mt-1 text-[13px] font-medium ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{title}</p>
          <p className={`mt-2 text-[13px] ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{email} | {phone} | {nationality}</p>
        </header>
        <div className="mt-5 grid gap-4">
          {sectionParagraph(t('dashboard.workerPortal.cvTemplates.sections.professionalSummary'), summaryLine, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.experience'), experiences, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.skills'), skills, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certificates'), certificates, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
        </div>
      </article>
    )
  }

  if (family === 'concise') {
    return (
      <article className={`mx-auto ${rootWidthClass} bg-white p-8 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
        <header
          className={`${
            preset.coloredHeader
              ? `${paletteTokens.topBg} ${paletteTokens.topText} rounded-xl px-5 py-4`
              : `border-b pb-4 ${topBorder}`
          }`}
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="text-[28px] font-semibold leading-tight">{fullName}</h1>
              <p className={`mt-1 text-sm ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{title}</p>
              <p className={`mt-2 text-xs ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{email} | {phone} | {nationality}</p>
            </div>
            {showPhoto ? (
              <img
                src={photoDataUrl!}
                alt={t('dashboard.workerPortal.cvTemplates.photoAlt')}
                className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover"
              />
            ) : null}
          </div>
        </header>
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.skills'), skills, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certificates'), certificates, emptyText)}
          </div>
          <div className="space-y-5">
            {sectionParagraph(t('dashboard.workerPortal.cvTemplates.sections.professionalSummary'), summaryLine, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.experience'), experiences, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
            {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`mx-auto ${rootWidthClass} bg-white text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)]`}>
      <header className={`${preset.coloredHeader ? `${paletteTokens.topBg} ${paletteTokens.topText} rounded-xl mx-6 mt-6 px-6 py-5` : `border-b px-8 py-7 ${topBorder}`}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">{fullName}</h1>
            <p className={`mt-1 text-sm ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>{title}</p>
            <div className={`mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm ${preset.coloredHeader ? paletteTokens.topSubtle : 'text-slate-700'}`}>
              <span>{email}</span>
              <span>{phone}</span>
              <span>{nationality}</span>
            </div>
          </div>
          {showPhoto ? (
            <img
              src={photoDataUrl!}
              alt={t('dashboard.workerPortal.cvTemplates.photoAlt')}
              className="h-24 w-24 shrink-0 rounded-xl border border-slate-300 object-cover"
            />
          ) : null}
        </div>
      </header>
      <div className={layoutVariant === 'double' ? 'grid gap-6 px-8 py-7 lg:grid-cols-[0.82fr_1.18fr]' : 'grid gap-6 px-8 py-7'}>
        <aside className={`space-y-6 pe-4 ${preset.coloredSidebar ? 'rounded-xl bg-slate-100 p-4 border border-slate-200' : 'border-r border-slate-200'}`}>
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.skills'), skills, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.languages'), languages, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.certificates'), certificates, emptyText)}
        </aside>
        <div className="space-y-6">
          {sectionParagraph(t('dashboard.workerPortal.cvTemplates.sections.professionalSummary'), summaryLine, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.experience'), experiences, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.education'), educations, emptyText)}
          {sectionList(t('dashboard.workerPortal.cvTemplates.sections.references'), references, emptyText)}
        </div>
      </div>
    </article>
  )
}

export function resolveCvTemplateDisplayOptions(templateId: CvTemplateId): {
  layoutVariant: CvLayoutVariant
  palette: CvColorPalette
} {
  if (templateId === 'executiveEmerald') return { layoutVariant: 'double', palette: 'emerald' }
  if (templateId === 'executiveNavy' || templateId === 'classicNavy' || templateId === 'minimalIndigo') {
    return { layoutVariant: 'double', palette: 'indigo' }
  }
  if (templateId === 'conciseTeal') return { layoutVariant: 'single', palette: 'emerald' }
  if (templateId === 'conciseAmber' || templateId === 'classicBurgundy') return { layoutVariant: 'single', palette: 'slate' }
  if (templateId === 'concise' || templateId === 'atsMono') {
    return { layoutVariant: 'single', palette: 'slate' }
  }
  if (templateId === 'modernAzure' || templateId === 'atsBlue') return { layoutVariant: 'double', palette: 'indigo' }
  return { layoutVariant: 'double', palette: 'slate' }
}

export function parseCvTemplatePreference(value: string | null | undefined): CvTemplatePreference {
  const parsed = tryParsePreferenceJson(value)
  const templateId = resolveCvTemplateId(parsed?.templateId ?? value)
  const defaults = resolveCvTemplateDisplayOptions(templateId)
  const layoutVariant =
    parsed?.layoutVariant === 'single' || parsed?.layoutVariant === 'double'
      ? parsed.layoutVariant
      : defaults.layoutVariant
  const palette =
    parsed?.palette === 'slate' || parsed?.palette === 'indigo' || parsed?.palette === 'emerald'
      ? parsed.palette
      : defaults.palette
  return { templateId, layoutVariant, palette }
}

export function serializeCvTemplatePreference(preference: CvTemplatePreference): string {
  return JSON.stringify({
    version: 1,
    templateId: preference.templateId,
    layoutVariant: preference.layoutVariant,
    palette: preference.palette,
  })
}

function tryParsePreferenceJson(value: string | null | undefined): null | {
  templateId?: string
  layoutVariant?: string
  palette?: string
} {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    return {
      templateId: typeof parsed.templateId === 'string' ? parsed.templateId : undefined,
      layoutVariant: typeof parsed.layoutVariant === 'string' ? parsed.layoutVariant : undefined,
      palette: typeof parsed.palette === 'string' ? parsed.palette : undefined,
    }
  } catch {
    return null
  }
}
