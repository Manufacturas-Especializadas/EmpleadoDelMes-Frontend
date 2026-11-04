import { useState } from 'react'
const defaultLogo = `${import.meta.env.BASE_URL}branding/mesa-logo.png`
export function BrandLogo({ src = defaultLogo }: { src?: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  return (
    <div className="shrink-0" aria-label="Manufacturas Especializadas">
      {failed === src ? (
        <span className="text-2xl font-extrabold tracking-widest text-primary">MESA</span>
      ) : (
        <img
          src={src}
          alt="MESA"
          className="h-12 w-32 object-contain object-left"
          onError={() => setFailed(src)}
        />
      )}
    </div>
  )
}
