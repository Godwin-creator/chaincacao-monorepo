import { useEffect, useId, useRef } from 'react'
import { Camera } from 'lucide-react'

const UUID_RE = /\/verify\/([a-zA-Z0-9_-]+)/i

export default function QRScanner({ onScan, onError, onPermissionDenied }) {
  const uid = useId().replace(/:/g, '')
  const scannerRef = useRef(null)

  useEffect(() => {
    let scanner = null

    import('html5-qrcode').then(({ Html5QrcodeScanner, Html5QrcodeScanType }) => {
      scanner = new Html5QrcodeScanner(
        `qr-reader-${uid}`,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          videoConstraints: { facingMode: 'environment' },
        },
        false,
      )

      scanner.render(
        (decodedText) => {
          const match = decodedText.match(UUID_RE)
          if (match) {
            onScan(match[1])
          } else if (/^LOT-/i.test(decodedText.trim())) {
            onScan(decodedText.trim())
          } else {
            onError?.('QR non reconnu · Ce code ne correspond pas à un lot ChainCacao.')
          }
        },
        (err) => {
          if (err && typeof err === 'string' && err.toLowerCase().includes('permission')) {
            onPermissionDenied?.()
          }
        },
      )

      scannerRef.current = scanner
    })

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-chain-cyan font-body">
        <Camera size={16} />
        <span>Caméra en cours d'initialisation…</span>
      </div>
      <div
        id={`qr-reader-${uid}`}
        className="w-full max-w-xs rounded-xl overflow-hidden border-2 border-dashed border-chain-cyan/40"
      />
    </div>
  )
}
