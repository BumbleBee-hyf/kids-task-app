import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../contexts/AuthContext'
import { useSoundContext } from '../contexts/SoundContext'
import { useParticleCanvas } from '../hooks/useParticleCanvas'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { play: playSound } = useSoundContext()
  const {
    containerRef: particleRef,
    emit: emitParticle,
    ready: particlesReady,
  } = useParticleCanvas()
  const cardRef = useRef<HTMLDivElement>(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'student' | 'parent'>('student')
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

  // Periodic sparkle
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
    setLoading(true)
    try {
      const result = await register(username.trim(), password, displayName.trim(), role)
      if (result.success) {
        playSound('level_up')
        if (particlesReady) {
          emitParticle('celebrationBurst', {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            countMultiplier: 2,
          })
        }
        setTimeout(() => navigate('/login-redirect'), 400)
      } else {
        setError(result.error || '注册失败')
        playSound('wrong')
        // Shake on error
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

  const handleRoleChange = (newRole: 'student' | 'parent') => {
    setRole(newRole)
    playSound('click')
  }

  return (
    <div className="login-page">
      {/* Canvas粒子覆盖层 */}
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

      <div
        ref={cardRef}
        className="login-card card"
        style={{ position: 'relative', zIndex: 2, opacity: 0 }}
      >
        <div className="login-header">
          <span className="login-emoji">🎉</span>
          <h1>注册新账号</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">选择角色</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleChange('student')}
              >
                <span className="role-emoji">🎒</span>
                <span>学生</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'parent' ? 'active' : ''}`}
                onClick={() => handleRoleChange('parent')}
              >
                <span className="role-emoji">👨‍👩‍👧</span>
                <span>家长</span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">显示昵称</label>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="让大家认识你"
            />
          </div>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用于登录"
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
              placeholder="至少 4 位"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary btn-lg login-btn" type="submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="login-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  )
}
