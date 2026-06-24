import { useState, useEffect, useCallback } from 'react'
import { lotteryConfigStorage } from '../../services/storageService'
import type { LotteryPrizeItem, LotteryConfig } from '../../types'

const PRIZE_COLORS = [
  '#FFD700',
  '#4ADE80',
  '#38BDF8',
  '#FB923C',
  '#A78BFA',
  '#FF2D55',
  '#2DD4BF',
  '#818CF8',
  '#FBBF24',
  '#FCD34D',
]

function PrizeEditor({
  prizes,
  onChange,
  title,
}: {
  prizes: LotteryPrizeItem[]
  onChange: (prizes: LotteryPrizeItem[]) => void
  title: string
}) {
  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0)

  const update = (index: number, field: keyof LotteryPrizeItem, value: string | number) => {
    const next = [...prizes]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  const remove = (index: number) => {
    if (prizes.length <= 1) return
    onChange(prizes.filter((_, i) => i !== index))
  }

  const add = () => {
    const colorIndex = prizes.length % PRIZE_COLORS.length
    onChange([
      ...prizes,
      { amount: 1, weight: 10, type: 'money', label: '新奖品', color: PRIZE_COLORS[colorIndex] },
    ])
  }

  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          总权重: {totalWeight.toFixed(1)}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
              <th style={thStyle}>标签</th>
              <th style={thStyle}>金额</th>
              <th style={thStyle}>权重</th>
              <th style={thStyle}>类型</th>
              <th style={thStyle}>概率</th>
              <th style={{ ...thStyle, width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => update(i, 'label', e.target.value)}
                    style={inputStyle}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={p.amount}
                    min={0}
                    onChange={(e) => update(i, 'amount', Number(e.target.value))}
                    style={{ ...inputStyle, width: 70 }}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={p.weight}
                    min={0.1}
                    step={0.5}
                    onChange={(e) => update(i, 'weight', Number(e.target.value))}
                    style={{ ...inputStyle, width: 70 }}
                  />
                </td>
                <td style={tdStyle}>
                  <select
                    value={p.type}
                    onChange={(e) => update(i, 'type', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="money">金钱</option>
                    <option value="joke">恶搞</option>
                  </select>
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {((p.weight / totalWeight) * 100).toFixed(1)}%
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => remove(i)}
                    disabled={prizes.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: prizes.length <= 1 ? 'not-allowed' : 'pointer',
                      fontSize: '1.1rem',
                      opacity: prizes.length <= 1 ? 0.3 : 1,
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={add} style={{ marginTop: 'var(--spacing-sm)', ...linkBtnStyle }}>
        + 添加奖品
      </button>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 6px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
}
const tdStyle: React.CSSProperties = { padding: '6px' }
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid var(--border-light)',
  borderRadius: 6,
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  background: '#FFF8F0',
  color: '#2D2A26',
}
const linkBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  padding: 0,
}

export default function LotteryConfigPage() {
  const [config, setConfig] = useState<LotteryConfig | null>(null)
  const [pointCost, setPointCost] = useState(10)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadConfig = useCallback(async () => {
    try {
      const data = await lotteryConfigStorage.getConfig()
      setConfig(data)
      setPointCost(data.pointCost)
    } catch {
      setMessage({ type: 'error', text: '加载配置失败' })
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    setMessage(null)
    try {
      const result = await lotteryConfigStorage.saveConfig({
        boxPrizes: config.boxPrizes,
        wheelSegments: config.wheelSegments,
        pointCost,
      })
      setConfig(result)
      setPointCost(result.pointCost)
      setMessage({ type: 'success', text: '配置保存成功！' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '保存失败' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('确定要重置为默认配置吗？')) return
    setSaving(true)
    setMessage(null)
    try {
      const result = await lotteryConfigStorage.resetConfig()
      setConfig(result)
      setPointCost(result.pointCost)
      setMessage({ type: 'success', text: '已重置为默认配置' })
    } catch {
      setMessage({ type: 'error', text: '重置失败' })
    } finally {
      setSaving(false)
    }
  }

  if (!config) return <div style={{ padding: 20 }}>加载中...</div>

  return (
    <div className="page-container">
      <div className="page-header-bar">
        <div className="page-header-title">
          <span className="page-header-icon">🎰</span>
          抽奖配置
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={handleReset} disabled={saving}>
            恢复默认
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            marginBottom: 'var(--spacing-md)',
            background:
              message.type === 'success'
                ? 'var(--color-success-bg, #dcfce7)'
                : 'var(--color-danger-bg, #fef2f2)',
            color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            fontSize: '0.9rem',
          }}
        >
          {message.text}
        </div>
      )}

      {/* 抽奖积分消耗 */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>积分消耗</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>每次抽奖消耗</span>
          <input
            type="number"
            value={pointCost}
            min={1}
            onChange={(e) => setPointCost(Number(e.target.value))}
            style={{ ...inputStyle, width: 80 }}
          />
          <span>积分</span>
        </div>
      </div>

      {/* 抽箱子配置 */}
      <PrizeEditor
        title="📦 抽箱子奖品"
        prizes={config.boxPrizes}
        onChange={(boxPrizes) => setConfig((prev) => (prev ? { ...prev, boxPrizes } : prev))}
      />

      {/* 大转盘配置 */}
      <PrizeEditor
        title="🎡 大转盘奖品"
        prizes={config.wheelSegments}
        onChange={(wheelSegments) =>
          setConfig((prev) => (prev ? { ...prev, wheelSegments } : prev))
        }
      />

      {/* 操作按钮 */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          marginTop: 'var(--spacing-md)',
        }}
      >
        <button className="btn btn-outline" onClick={handleReset} disabled={saving}>
          恢复默认
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  )
}
