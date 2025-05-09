'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ------------ timings (ms) ------------ */
const REVEAL_MS    = 1_500
const SHRINK_MS    =   600
const BG_FADE_MS   =   900   // fade finishes sooner (starts at same time as shrink)
const HOLD_MS      = 2_500
const LOGO_FADE_MS =   400

/* logo scales from 210-px → 40-px */
const SMALL_SCALE = 40 / 210          // ≈0.19
/* Tailwind “top-4” = 1 rem (16 px)  */
const FINAL_TOP   = '16px'

/* original N-logo path -------------------------------------- */
const N_PATH = `
M937.76,70.23l-.23,2.14c-.92,15.64-.38,31.45-.34,47.12.13,26.73.1,53.45-.08,80.18-.72,86.17-3.83,172.31-9.34,258.32-3.64,49.87-7.2,104.4-24.41,151.83-6.06,16.71-14.79,32.31-28.27,44.16-17,14.94-38.96,20.87-61.31,19.2-46.16-3.44-88.65-35.49-117.57-69.64-14.41-17.01-27.21-35.74-40.29-53.86v-.14s-4.48-6.04-4.48-6.04c-20.07-27.65-40.38-55.13-60.95-82.41l-113.06-152.18-79.35-106.97-62.37-84.5c-18.71-25.11-36.99-50.64-60.31-71.77C248.58,21.38,215.13,1.62,178.15.13c-3.16-.13-6.31-.22-9.47,0-32.15,2.95-60.4,17.08-81.07,42.18-14.87,18.06-24.79,41.2-28.72,64.22-4.66,27.31-4.18,56.48-4.85,84.13-1.04,45.29-1.76,90.58-2.18,135.88-3.02,201.14.44,402.32,10.37,603.23l.23-2.14c.92-15.64.38-31.45.34-47.12-.13-26.73-.1-53.45.08-80.17.72-86.17,3.83-172.31,9.34-258.32,3.64-49.87,7.2-104.4,24.41-151.83,6.06-16.71,14.79-32.31,28.27-44.16,17-14.94,38.96-20.87,61.31-19.2,46.16,3.44,88.65,35.49,117.57,69.64,15.45,18.24,29.05,38.47,43.14,57.8,20.6,28.41,41.46,56.62,62.59,84.65l247.84,334.24,6.94,9.4c18.71,25.11,36.99,50.64,60.31,71.77,26.82,24.3,60.27,44.06,97.25,45.55,3.16.13,6.31.22,9.47,0,32.15-2.95,60.4-17.08,81.07-42.18,14.87-18.06,24.79-41.2,28.72-64.22,4.66-27.31,4.18-56.48,4.85-84.13,1.04-45.29,1.76-90.58,2.18-135.88,3.02-201.14-.44-402.32-10.37-603.23Z
`;


export default function Loader () {
    const [phase, setPhase] = 
    useState<'reveal'|'shrink'|'hold'|'logoFade'|'done'>('reveal')

    /* phase timers -------------------------------------------------- */
    useEffect(() => {
        let t: NodeJS.Timeout
        switch (phase) {
          case 'reveal'   : t = setTimeout(() => setPhase('shrink')  , REVEAL_MS   ); break
          case 'shrink'   : t = setTimeout(() => setPhase('hold')    , SHRINK_MS   ); break
          case 'hold'     : t = setTimeout(() => setPhase('logoFade'), HOLD_MS     ); break
          case 'logoFade' : t = setTimeout(() => setPhase('done')    , LOGO_FADE_MS); break
        }
        return () => clearTimeout(t)
      }, [phase])
  
    if (phase === 'done') return null

    /* --------------------------------- new: bg layer variants ----------------- */  
    const bgVariants = {
    reveal: { opacity: 1 },
    shrink: { opacity: 1 }, // This is where the background fades out
    hold: { opacity: 0 },
    logoFade: { opacity: 0 }
    } as const

    const bgTrans = {
    reveal: { duration: 0 },
    shrink: { duration: BG_FADE_MS/1000, ease: 'linear' }, // Control fade timing here
    hold: {  },
    logoFade: {}
    } as const
      
      /* ------------- update: overlay only controls final fade ------------------- */
      const overlayVariants = {
        reveal: { opacity: 1 },
        shrink: { opacity: 1 },
        hold: { opacity: 0 },
        logoFade: { opacity: 0 }
      } as const
  
      const overlayTrans = {
        reveal:   { duration: 0 },
        shrink:   { duration: 0 }, // Don't fade the overlay during shrink
        hold:     { duration: 0 },
        logoFade: { duration: LOGO_FADE_MS/1000, ease: 'easeInOut' }
      } as const
  
    /* logo container (scale + position) ------------------------------ */
    const logoVariants = {
        reveal: { scale: 1, top: '50%', x: '-50%', y: '-50%' },
        shrink: { scale: SMALL_SCALE, top: FINAL_TOP, x: '-50%', y: '0%', originY: 0 },
        hold: { scale: SMALL_SCALE, top: FINAL_TOP, x: '-50%', y: '0%', originY: 0 },
        logoFade: { scale: SMALL_SCALE, top: FINAL_TOP, x: '-50%', y: '0%', originY: 0 }
      } as const
  
    const logoTrans = {
      reveal:  { duration:0 },
      shrink:  { duration:SHRINK_MS/1000, ease:'easeInOut' },
      bgFade:  { duration:0 },
      hold:    { duration:0 },
      logoFade:{ duration:0 }
    } as const
  
    return (
        <AnimatePresence>
          {/* Separate background element outside the logo container */}
          <motion.div
            key="bg"
            className="fixed inset-0 bg-white z-100 pointer-events-none"
            variants={bgVariants}
            animate={phase}
            transition={bgTrans[phase]}
          />
          
          {/* Logo container (without the background) */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[105] pointer-events-none"
            variants={overlayVariants}
            animate={phase}
            transition={overlayTrans[phase]}
          >
            {/* Logo wrapper */}
            <motion.div
              className="fixed left-1/2 origin-top"
              variants={logoVariants}
              animate={phase}
              transition={logoTrans[phase]}
            >
              <motion.svg width={210} height={210} viewBox="0 0 1000 1000">
                {/* SVG content */}
                <defs>
                  <mask id="n-mask">
                    <motion.circle
                      cx={500} cy={500} r={0} fill="white"
                      animate={{ r:800 }}
                      transition={{ duration:REVEAL_MS/1000, ease:'easeInOut' }}
                    />
                  </mask>
                </defs>
                <path d={N_PATH} fill="black" mask="url(#n-mask)" />
              </motion.svg>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )
  }