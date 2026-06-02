import React, { useRef, useEffect } from 'react'

export default function ScrollableCard({ children, className = '' }) {
  const mainRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const main = mainRef.current
    const bottom = bottomRef.current
    if (!main || !bottom) return

    const onMainScroll = () => { bottom.scrollLeft = main.scrollLeft }
    const onBottomScroll = () => { main.scrollLeft = bottom.scrollLeft }

    main.addEventListener('scroll', onMainScroll)
    bottom.addEventListener('scroll', onBottomScroll)

    const ro = new ResizeObserver(() => {
      if (bottom.firstChild) bottom.firstChild.style.width = `${main.scrollWidth}px`
    })
    ro.observe(main)

    try { if (bottom.firstChild) bottom.firstChild.style.width = `${main.scrollWidth}px` } catch (e) {}

    return () => {
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

      {/* bottom tiny scrollbar positioned inside the card so page scroll remains intact */}
      <div
        ref={bottomRef}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', pointerEvents: 'auto' }}
      >
        <div style={{ width: '1px', height: '6px', background: '#e5e7eb', borderRadius: 6 }} />
      </div>
    </div>
  )
}
