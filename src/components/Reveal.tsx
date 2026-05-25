import { useEffect, useRef, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(22px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  )
}
