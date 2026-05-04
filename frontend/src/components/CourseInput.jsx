import { useState, useRef, useEffect } from 'react'
import SAMPLE_COURSES from '../data/sampleCourses'

export default function CourseInput({ value, onChange, onSelect, placeholder }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setQuery(value || '') }, [value])

  const filtered = query.length >= 1
    ? SAMPLE_COURSES.filter((c) =>
        c.courseCode.toLowerCase().includes(query.toLowerCase()) ||
        c.courseName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e)
    setOpen(true)
  }

  const handleSelect = (course) => {
    setQuery(course.courseCode)
    onSelect(course)
    setOpen(false)
  }

  return (
    <div className="relative flex-1" ref={ref}>
      <input
        className="w-full bg-[#0a0a0a] border border-[#222] hover:border-[#333] focus:border-[#6c47ff] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors placeholder-[#444]"
        placeholder={placeholder || 'Mã môn (VD: IT4527E)'}
        value={query}
        onChange={handleChange}
        onFocus={() => query.length >= 1 && setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-xl">
          {filtered.map((c) => (
            <button
              key={c.courseCode}
              type="button"
              onMouseDown={() => handleSelect(c)}
              className="w-full text-left px-4 py-2.5 hover:bg-[#1f1f1f] transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="text-white text-sm font-mono">{c.courseCode}</span>
                <span className="text-[#666] text-xs ml-2 truncate">{c.courseName}</span>
              </div>
              <span className="text-[#6c47ff] text-xs font-semibold shrink-0">{c.grade}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
