import { useRef, useCallback, useEffect } from 'react'

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

interface Props {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export default function Floating3DCard({ children, className = '', intensity = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const rafId = useRef(0)
  const cur = useRef({ x: 0, y: 0 })
  const tgt = useRef({ x: 0, y: 0 })
  const active = !prefersReduced && !isTouch

  const tick = useCallback(() => {
    const el = ref.current
    if (!el) return
    cur.current.x += (tgt.current.x - cur.current.x) * 0.10
    cur.current.y += (tgt.current.y - cur.current.y) * 0.10
    el.style.transform = `perspective(900px) rotateX(${cur.current.x}deg) rotateY(${cur.current.y}deg)`
    if (Math.abs(tgt.current.x - cur.current.x) > 0.004 || Math.abs(tgt.current.y - cur.current.y) > 0.004) {
      rafId.current = requestAnimationFrame(tick)
    }
  }, [])

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
    tgt.current.x = -ny * intensity
    tgt.current.y = nx * intensity
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(tick)
  }, [intensity, tick])

  const onLeave = useCallback(() => {
    tgt.current = { x: 0, y: 0 }
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(tick)
  }, [tick])

  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId.current)
    }
  }, [active, onMove, onLeave])

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: active ? 'transform' : undefined }}
    >
      {children}
    </div>
  )
}
