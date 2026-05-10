import { createContext, useContext, useState, useEffect } from 'react'

const IssuerContext = createContext(null)

export function IssuerProvider({ children }) {
  const [issuer, setIssuer] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('issuer')
    if (saved) {
      try { setIssuer(JSON.parse(saved)) } catch {}
    }
  }, [])

  const saveIssuer = (data) => {
    setIssuer(data)
    localStorage.setItem('issuer', JSON.stringify(data))
  }

  const clearIssuer = () => {
    setIssuer(null)
    localStorage.removeItem('issuer')
  }

  return (
    <IssuerContext.Provider value={{ issuer, saveIssuer, clearIssuer }}>
      {children}
    </IssuerContext.Provider>
  )
}

export const useIssuer = () => useContext(IssuerContext)
