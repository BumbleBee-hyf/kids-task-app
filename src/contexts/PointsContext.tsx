import { createContext, useContext, useState, useCallback } from 'react'
import type { PointRecord } from '../types'
import { pointStorage } from '../services/storageService'

interface PointsContextType {
  balance: number
  records: PointRecord[]
  refreshBalance: (studentId: string) => Promise<number>
  refreshRecords: (studentId: string) => Promise<PointRecord[]>
}

const PointsContext = createContext<PointsContextType | null>(null)

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(0)
  const [records, setRecords] = useState<PointRecord[]>([])

  const refreshBalance = useCallback(async (studentId: string) => {
    const bal = await pointStorage.getBalance(studentId)
    setBalance(bal)
    return bal
  }, [])

  const refreshRecords = useCallback(async (studentId: string) => {
    const list = await pointStorage.getByStudent(studentId)
    setRecords(list)
    return list
  }, [])

  return (
    <PointsContext.Provider value={{ balance, records, refreshBalance, refreshRecords }}>
      {children}
    </PointsContext.Provider>
  )
}

export function usePoints(): PointsContextType {
  const ctx = useContext(PointsContext)
  if (!ctx) throw new Error('usePoints must be used within PointsProvider')
  return ctx
}
