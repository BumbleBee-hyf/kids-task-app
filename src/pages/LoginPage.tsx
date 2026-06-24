import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../contexts/AuthContext'
import { useSoundContext } from '../contexts/SoundContext'
import { useParticleCanvas } from '../hooks/useParticleCanvas'
import '../styles/Login.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { play: playSound } = useSoundContext()
  const { containerRef: particleRef, emit: emitParticle, ready: particlesReady } = useParticleCanvas()
  const cardRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Card entrance animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      )
    }
  }, [])

  // Periodic sparkle on star emoji
  useEffect(() => {
    const interval = setInterval(() => {
      if (particlesReady) {
        emitParticle('sparkleTrail', {
          x: window.innerWidth / 2,
          y: 80,
          countMultiplier: 0.5,
        })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [particlesReady, emitParticle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    playSound('click')
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    try {
      const result = await login(username.trim(), password)
      if (result.success) {
        // Celebration burst before redirect
        playSound('level_up')
        if (particlesReady) {
          emitParticle('celebrationBurst', {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            countMultiplier: 2,
          })
        }
        // Delay navigation slightly for the effect
        setTimeout(() => navigate('/login-redirect'), 400)
      } else {
        setError(result.error || '登录失败')
        playSound('wrong')
        // Shake the card on error
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            keyframes: [
              { x: -8, duration: 0.05 },
              { x: 8, duration: 0.05 },
              { x: -6, duration: 0.05 },
              { x: 6, duration: 0.05 },
              { x: -3, duration: 0.05 },
              { x: 3, duration: 0.05 },
              { x: 0, duration: 0.05 },
            ],
            ease: 'none',
          })
        }
      }
    } catch {
      setError('网络错误，请检查后端服务是否启动')
      playSound('wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Canvas粒子覆盖层 — 漂浮装饰 */}
      <div
        ref={particleRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div ref={cardRef} className="login-card card" style={{ position: 'relative', zIndex: 2, opacity: 0 }}>
        <div className="login-header">
          <span className="login-emoji">🌟</span>
          <h1>任务积分乐园</h1>
          <p>儿童每日任务管理系统</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button ref={btnRef} className="btn btn-primary btn-lg login-btn" type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className="login-footer">
          还没有账号？<Link to="/register">立即注册</Link>
        </div>
        <div className="login-hint">
          <p>💡 测试账号：parent1 / 1234（家长）</p>
          <p>💡 测试账号：student1 / 1234（学生）</p>
        </div>
      </div>
    </div>
  )
}
