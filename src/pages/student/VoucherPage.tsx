import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useVouchers } from '../../contexts/VoucherContext'
import { usePoints } from '../../contexts/PointsContext'
import { useSoundContext } from '../../contexts/SoundContext'
import { countUp } from '../../engine/BattleTimelines'
import WithdrawForm from '../../components/WithdrawForm'
import '../../styles/Voucher.module.css'

export default function VoucherPage() {
  const { user } = useAuth()
  const { getBalance, getVouchersByStudent, getWithdrawsByStudent, requestWithdraw } = useVouchers()
  const {
    balance: pointBalance,
    records: pointRecords,
    refreshBalance,
    refreshRecords,
  } = usePoints()
  const { play: playSound } = useSoundContext()
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [balance, setBalance] = useState(0)
  const [vouchers, setVouchers] = useState<unknown[]>([])
  const [withdraws, setWithdraws] = useState<unknown[]>([])
  const [activeTab, setActiveTab] = useState<'voucher' | 'points'>('voucher')
  const pointsBalanceRef = useRef<HTMLDivElement>(null)
  const voucherBalanceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      if (user) {
        const bal = await getBalance(user.id)
        setBalance(bal)
        setVouchers(await getVouchersByStudent(user.id))
        setWithdraws(await getWithdrawsByStudent(user.id))
        await refreshBalance(user.id)
        await refreshRecords(user.id)
      }
    }
    load()
  }, [
    user,
    getBalance,
    getVouchersByStudent,
    getWithdrawsByStudent,
    refreshBalance,
    refreshRecords,
  ])

  // Count-up animation on data load
  useEffect(() => {
    const timer = setTimeout(() => {
      countUp(pointsBalanceRef.current, pointBalance, 0.8)
      countUp(voucherBalanceRef.current, balance, 0.8)
    }, 300)
    return () => clearTimeout(timer)
  }, [pointBalance, balance])

  // Tab切换时刷新数据
  useEffect(() => {
    if (!user) return
    const load = async () => {
      if (activeTab === 'voucher') {
        const bal = await getBalance(user.id)
        setBalance(bal)
        setVouchers(await getVouchersByStudent(user.id))
        setWithdraws(await getWithdrawsByStudent(user.id))
      } else {
        await refreshBalance(user.id)
        await refreshRecords(user.id)
      }
    }
    load()
  }, [activeTab])

  const handleWithdraw = async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: '未登录' }
    const result = await requestWithdraw(user.id, amount)
    if (result.success) {
      setShowWithdrawForm(false)
      setBalance(await getBalance(user.id))
      setWithdraws(await getWithdrawsByStudent(user.id))
      setVouchers(await getVouchersByStudent(user.id))
      playSound('points_gain')
    }
    return result
  }

  const statusLabel: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
  }

  const sourceLabel: Record<string, string> = {
    task_bonus: '任务奖励',
    lottery: '抽奖获得',
    admin_grant: '管理员发放',
  }

  const pointSourceLabel: Record<string, string> = {
    task_reward: '任务奖励',
    lottery_cost: '抽奖消耗',
    admin_grant: '管理员发放',
  }

  const handleTabChange = (tab: 'voucher' | 'points') => {
    setActiveTab(tab)
    playSound('click')
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          我的钱包
        </h1>
        {!showWithdrawForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowWithdrawForm(true)}
            disabled={balance <= 0}
          >
            提现
          </button>
        )}
      </div>

      {/* 积分与代金券余额 — count-up动画 */}
      <div className="grid-2" style={{ marginBottom: 'var(--spacing-md)' }}>
        <div className="card balance-card" style={{ textAlign: 'center' }}>
          <div className="balance-emoji">⭐</div>
          <div ref={pointsBalanceRef} className="balance-amount">
            0
          </div>
          <div className="balance-label">积分余额</div>
        </div>
        <div className="card balance-card" style={{ textAlign: 'center' }}>
          <div className="balance-emoji">💰</div>
          <div ref={voucherBalanceRef} className="balance-amount">
            0
          </div>
          <div className="balance-label">代金券余额（元）</div>
        </div>
      </div>

      {showWithdrawForm && (
        <WithdrawForm
          balance={balance}
          onSubmit={handleWithdraw}
          onCancel={() => setShowWithdrawForm(false)}
        />
      )}

      {/* Tab 切换 */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-md)',
          marginTop: 'var(--spacing-lg)',
        }}
      >
        <button
          className={`btn ${activeTab === 'voucher' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => handleTabChange('voucher')}
        >
          代金券明细
        </button>
        <button
          className={`btn ${activeTab === 'points' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => handleTabChange('points')}
        >
          积分明细
        </button>
      </div>

      {/* 代金券明细 — 交错淡入 */}
      {activeTab === 'voucher' &&
        (vouchers.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
            <span className="emoji">📭</span>
            <p>还没有获得代金券，去抽奖试试手气吧！</p>
          </div>
        ) : (
          <div className="card voucher-list">
            <table className="task-table">
              <thead>
                <tr>
                  <th>来源</th>
                  <th>面额</th>
                  <th>获得时间</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v: any, i: number) => (
                  <tr
                    key={v.id}
                    style={{
                      animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    <td>{sourceLabel[v.source] || v.source}</td>
                    <td>
                      <strong className="points">{v.amount} 元</strong>
                    </td>
                    <td>{new Date(v.createdAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* 积分明细 — 交错淡入 */}
      {activeTab === 'points' &&
        (pointRecords.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
            <span className="emoji">📭</span>
            <p>还没有积分记录，完成任务获取积分吧！</p>
          </div>
        ) : (
          <div className="card voucher-list">
            <table className="task-table">
              <thead>
                <tr>
                  <th>来源</th>
                  <th>数量</th>
                  <th>描述</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {pointRecords.map((p: any, i: number) => (
                  <tr
                    key={p.id}
                    style={{
                      animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    <td>{pointSourceLabel[p.source] || p.source}</td>
                    <td>
                      <strong
                        className="points"
                        style={{
                          color: p.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        }}
                      >
                        {p.amount > 0 ? `+${p.amount}` : p.amount}
                      </strong>
                    </td>
                    <td>{p.description}</td>
                    <td>{new Date(p.createdAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* 提现记录 */}
      {withdraws.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <h2 className="section-title">提现记录</h2>
          <div className="card">
            <table className="task-table">
              <thead>
                <tr>
                  <th>金额</th>
                  <th>状态</th>
                  <th>申请时间</th>
                </tr>
              </thead>
              <tbody>
                {withdraws.map((w: any) => (
                  <tr key={w.id}>
                    <td>
                      <strong className="points">{w.amount} 元</strong>
                    </td>
                    <td>
                      <span className={`status-badge status-${w.status}`}>
                        {statusLabel[w.status]}
                      </span>
                    </td>
                    <td>{new Date(w.createdAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
