import { useState } from 'react'

export default function Header() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <>
      {showBanner && (
        <div className="bg-amber-200 py-2 px-4 text-center font-bold relative">
          <div className="flex justify-center items-center">
            ⚠️ Currently in Development ⚠️
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-900 hover:text-amber-950"
            aria-label="Dismiss banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
