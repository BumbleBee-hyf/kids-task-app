import React, { useState } from 'react'

interface Props {
  balance: number
  onSubmit: (
    amount: number,
  ) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string }
  onCancel: () => void
}

export default function WithdrawForm({ balance, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setError('请输入有效的提现金额')
      return
    }
    if (num > balance) {
      setError(`余额不足，当前余额为 ${balance} 元`)
      return
    }

    setLoading(true)
    try {
      const result = await onSubmit(num)
      if (!result.success) {
        setError(result.error || '申请失败')
      }
    } catch {
      setError('网络错误，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card withdraw-form" onSubmit={handleSubmit}>
      <h3 className="form-title">💸 发起提现</h3>

      <div className="form-group">
        <label className="form-label">
          当前余额：<strong className="withdraw-balance-value">{balance} 元</strong>
        </label>
        <input
          className="form-input"
          type="number"
          min={1}
          max={balance}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="请输入提现金额"
          autoFocus
        />
      </div>

      {error && <div className="login-error form-error-box">{error}</div>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '提交中...' : '提交申请'}
        </button>
        <button className="btn btn-outline" type="button" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  )
}
