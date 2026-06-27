import React, { useRef, useEffect } from 'react'

export default function ScrollableCard({ children, className = '' }) {
  const mainRef = useRef(null)
  const bottomRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const main = mainRef.current
    const bottom = bottomRef.current
    if (!main || !bottom) return

    const syncScroll = (source, target) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        target.scrollLeft = source.scrollLeft
        rafRef.current = null
      })
    }

    const onMainScroll = () => syncScroll(main, bottom)
    const onBottomScroll = () => syncScroll(bottom, main)

    main.addEventListener('scroll', onMainScroll, { passive: true })
    bottom.addEventListener('scroll', onBottomScroll, { passive: true })

    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (bottom.firstChild) bottom.firstChild.style.width = `${main.scrollWidth}px`
        rafRef.current = null
      })
    })
    ro.observe(main)

    if (bottom.firstChild) {
      bottom.firstChild.style.width = `${main.scrollWidth}px`
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      main.removeEventListener('scroll', onMainScroll)
      bottom.removeEventListener('scroll', onBottomScroll)
      ro.disconnect()
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div ref={mainRef} className="overflow-x-auto pb-6">
        {children}
      </div>

      <div
        ref={bottomRef}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', pointerEvents: 'auto' }}
      >
        <div style={{ width: '1px', height: '6px', background: '#e5e7eb', borderRadius: 6 }} />
      </div>
    </div>
  )
}
