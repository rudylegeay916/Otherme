import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
  from?: 'bottom' | 'left' | 'right'
  scale?: boolean
}

function hiddenTransform(from: 'bottom' | 'left' | 'right', scale: boolean) {
  const t = from === 'bottom' ? 'translateY(24px)' : from === 'left' ? 'translateX(-24px)' : 'translateX(24px)'
  return scale ? `${t} scale(0.97)` : t
}

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
  from = 'bottom',
  scale = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={ref}
      className={className}
      style={prefersReducedMotion ? undefined : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : hiddenTransform(from, scale),
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.70s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
