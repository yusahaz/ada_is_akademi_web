import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, CameraOff, CheckCircle2, QrCode, ScanLine, ShieldAlert, XCircle } from 'lucide-react'
import jsQR from 'jsqr'

import { workerPortalApi, type WorkerQrStatus } from '../../../../api/worker/worker-portal'
import { useTheme } from '../../../../theme/theme-context'
import { DashboardSurface } from '../../../../shared/ui/ui-primitives'
import { WorkerGhostButton, WorkerPrimaryButton, WorkerSectionHeader } from '../../worker-ui'

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike
  }
}

export type QrCheckPageProps = {
  embedded?: boolean
}

export function QrCheckPage({ embedded = false }: QrCheckPageProps = {}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [status, setStatus] = useState<WorkerQrStatus>('idle')
  const [qrPayload, setQrPayload] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanRafRef = useRef<number | null>(null)
  const detectorRef = useRef<BarcodeDetectorLike | null>(null)

  const stopCamera = useCallback(() => {
    if (scanRafRef.current != null) {
      cancelAnimationFrame(scanRafRef.current)
      scanRafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const validatePayload = useCallback(async (payload: string) => {
    setStatus('validating')
    const result = await workerPortalApi.validateQrToken(payload)
    setStatus(result)
  }, [])

  const handleValidate = async () => {
    const payload = qrPayload.trim()
    if (!payload) return
    await validatePayload(payload)
  }

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Kamera erişimi bu cihazda desteklenmiyor.')
      return
    }
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsScanning(true)
    } catch {
      setCameraError('Kamera başlatılamadı. Tarayıcı izinlerini kontrol edin.')
      stopCamera()
    }
  }, [stopCamera])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.BarcodeDetector) {
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
    } else {
      detectorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isScanning || !videoRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scanLoop = async () => {
      const video = videoRef.current
      const detector = detectorRef.current
      if (!video || video.readyState < 2) {
        scanRafRef.current = requestAnimationFrame(() => void scanLoop())
        return
      }

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        let raw = ''
        if (detector) {
          const results = await detector.detect(canvas)
          raw = results[0]?.rawValue?.trim() ?? ''
        } else {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const qr = jsQR(imageData.data, imageData.width, imageData.height)
          raw = qr?.data?.trim() ?? ''
        }
        if (raw) {
          setQrPayload(raw)
          stopCamera()
          await validatePayload(raw)
          return
        }
      } catch {
        // keep scanning on transient detector issues
      }

      scanRafRef.current = requestAnimationFrame(() => void scanLoop())
    }

    scanRafRef.current = requestAnimationFrame(() => void scanLoop())
    return () => {
      if (scanRafRef.current != null) {
        cancelAnimationFrame(scanRafRef.current)
        scanRafRef.current = null
      }
    }
  }, [isScanning, stopCamera, validatePayload])

  useEffect(() => () => stopCamera(), [stopCamera])

  const statusToneClass =
    status === 'success'
      ? theme === 'dark'
        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status === 'failed'
        ? theme === 'dark'
          ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
          : 'border-rose-200 bg-rose-50 text-rose-800'
        : theme === 'dark'
          ? 'border-white/15 bg-white/[0.03] text-white/85'
          : 'border-slate-200 bg-slate-50 text-slate-700'

  const statusIcon =
    status === 'success' ? (
      <CheckCircle2 className="h-4 w-4" aria-hidden />
    ) : status === 'failed' ? (
      <XCircle className="h-4 w-4" aria-hidden />
    ) : (
      <ScanLine className="h-4 w-4" aria-hidden />
    )

  return (
    <div className="space-y-4">
      {embedded ? null : (
        <WorkerSectionHeader
          tone={theme}
          title={t('dashboard.workerPortal.pages.qrCheck.title')}
          subtitle={t('dashboard.workerPortal.pages.qrCheck.subtitle')}
        />
      )}
      <DashboardSurface theme={theme}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                theme === 'dark'
                  ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
                  : 'border-sky-200 bg-sky-50 text-sky-700'
              }`}
              aria-hidden
            >
              <QrCode className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className={`text-base font-semibold leading-tight sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('dashboard.workerPortal.pages.qrCheck.title')}
              </p>
              <p className={`text-xs leading-relaxed sm:text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                Karekodu kamerayla okutabilir ya da kodu elle girip kolayca doğrulayabilirsiniz.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div
              className={`overflow-hidden rounded-2xl border ${theme === 'dark' ? 'border-white/15 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/70'}`}
            >
              <div className="relative aspect-[16/9] w-full">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
                {!isScanning ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className={`rounded-xl border px-3 py-2 text-xs sm:text-sm ${theme === 'dark' ? 'border-white/15 bg-black/35 text-white/85' : 'border-slate-200 bg-white/95 text-slate-700'}`}>
                      Kamera hazır değil.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!isScanning ? (
                <WorkerPrimaryButton
                  tone={theme}
                  className="h-10 w-full justify-center sm:w-auto sm:min-w-[11rem]"
                  onClick={() => void startCamera()}
                >
                  <Camera className="mr-2 h-4 w-4" aria-hidden />
                  Kamerayı Aç
                </WorkerPrimaryButton>
              ) : (
                <WorkerGhostButton
                  tone={theme}
                  className="h-10 w-full justify-center sm:w-auto sm:min-w-[11rem]"
                  onClick={stopCamera}
                >
                  <CameraOff className="mr-2 h-4 w-4" aria-hidden />
                  Kamerayı Kapat
                </WorkerGhostButton>
              )}
            </div>

            {cameraError ? (
              <p className={`text-xs ${theme === 'dark' ? 'text-rose-200' : 'text-rose-700'}`}>{cameraError}</p>
            ) : null}

            <label className="space-y-1 text-sm">
              <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>QR Token / Kod</span>
              <input
                value={qrPayload}
                onChange={(event) => setQrPayload(event.target.value)}
                aria-label={t('dashboard.workerPortal.qr.actions.validate')}
                placeholder="Orn: POSTING-12345"
                className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400/45 ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/[0.04] text-white placeholder:text-white/40'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <WorkerPrimaryButton
                tone={theme}
                className="h-10 w-full justify-center sm:w-auto sm:min-w-[10rem]"
                onClick={() => void handleValidate()}
                disabled={!qrPayload.trim() || status === 'validating'}
              >
                {t('dashboard.workerPortal.qr.actions.validate')}
              </WorkerPrimaryButton>
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm ${statusToneClass}`}>
            {statusIcon}
            <span>{t(`dashboard.workerPortal.qr.status.${status}`)}</span>
          </div>

          <div
            className={`flex items-start gap-1.5 rounded-2xl border px-3 py-2 text-xs sm:text-sm ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.03] text-white/70' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="leading-relaxed">
              <span className="font-medium">Güvenlik notu:</span>{' '}
              {t('dashboard.workerPortal.qr.securityNote')}
            </p>
          </div>
        </div>
      </DashboardSurface>
    </div>
  )
}
