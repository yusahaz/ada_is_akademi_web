export function getProfileSectionLabelKey(section: string) {
  if (section === 'skills') return 'dashboard.workerPortal.profile.menu.skills'
  if (section === 'experiences') return 'dashboard.workerPortal.profile.menu.experiences'
  if (section === 'certificates') return 'dashboard.workerPortal.profile.menu.certificates'
  if (section === 'references') return 'dashboard.workerPortal.profile.menu.references'
  if (section === 'cv') return 'dashboard.workerPortal.profile.menu.cv'
  if (section === 'password') return 'dashboard.workerPortal.profile.menu.password'
  if (section === 'accountControl') return 'dashboard.workerPortal.profile.menu.accountControl'
  if (section === 'settings') return 'dashboard.workerPortal.profile.menu.settings'
  if (section === 'availability') return 'dashboard.workerPortal.profile.menu.availability'
  return 'dashboard.workerPortal.profile.menu.basic'
}
