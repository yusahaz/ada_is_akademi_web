/**
 * ISO 3166-1 alpha-2 ülke kodları (Unicode CLDR ile uyumlu tam liste; `Intl.supportedValuesOf('region')`
 * ortamda yoksa veya hata verirse kullanılır).
 * Kaynak: https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes (all.csv)
 */
const ISO_3166_1_ALPHA2_CODES =
  'AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(
    /\s+/,
  )

const TWO_LETTER = /^[A-Z]{2}$/

function localeBase(locale: string): string {
  const trimmed = locale.trim()
  if (!trimmed) return 'tr'
  const [base] = trimmed.split(/[-_]/)
  return base && /^[a-zA-Z]{2,3}$/.test(base) ? base : 'tr'
}

function listRegionCodesFromIntl(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
  if (typeof intl.supportedValuesOf !== 'function') return []
  try {
    const raw = intl.supportedValuesOf('region')
    return raw.filter((c): c is string => typeof c === 'string' && TWO_LETTER.test(c))
  } catch {
    return []
  }
}

function regionCodesForDisplay(): readonly string[] {
  const fromIntl = listRegionCodesFromIntl()
  return fromIntl.length > 0 ? fromIntl : ISO_3166_1_ALPHA2_CODES
}

/**
 * Uyruk alanı için seçenek metinleri: `Intl.DisplayNames` ile yerelleştirilmiş ülke adları,
 * alfabetik sıralı. Mevcut kayıt listede yoksa (eski serbest metin) korunmak üzere listeye eklenir.
 */
export function getNationalitySelectOptions(locale: string, currentValue?: string | null): string[] {
  const base = localeBase(locale)
  const codes = regionCodesForDisplay()
  const display = new Intl.DisplayNames([base], { type: 'region' })
  const labels = new Set<string>()
  for (const code of codes) {
    const name = display.of(code)
    if (name && name !== 'Unknown Region') labels.add(name)
  }
  const current = typeof currentValue === 'string' ? currentValue.trim() : ''
  if (current) labels.add(current)
  return Array.from(labels).sort((a, b) => a.localeCompare(b, base, { sensitivity: 'base' }))
}
