import { describe, it, expect } from 'vitest'
import http from 'http'

const PORT = 3001

// ============ Lightweight HTTP Client ============
function request(options) {
  return new Promise((resolve, reject) => {
    const bodyStr = options.body ? JSON.stringify(options.body) : ''
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null })
          } catch {
            resolve({ status: res.statusCode, data: data })
          }
        })
      },
    )
    req.on('error', reject)
    req.end(bodyStr)
  })
}

// ============ Test Constants ============
const TEST_STUDENT = {
  username: 'harness_student',
  password: '1234',
  role: 'student',
  displayName: 'Harness学生',
}
const TEST_PARENT = {
  username: 'harness_parent',
  password: '1234',
  role: 'parent',
  displayName: 'Harness家长',
}

describe('Server API Integration Tests', () => {
  let studentId = ''
  let parentId = ''
  let taskId = ''

  describe('Users API', () => {
    it('should get all users', async () => {
      const res = await request({ method: 'GET', path: '/api/users' })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })

    it('should create a new student user', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/users',
        body: TEST_STUDENT,
      })
      expect(res.status).toBe(201)
      expect(res.data).toHaveProperty('id')
      expect(res.data).toHaveProperty('username', TEST_STUDENT.username)
      expect(res.data).toHaveProperty('role', 'student')
      studentId = res.data.id
    })

    it('should create a new parent user', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/users',
        body: TEST_PARENT,
      })
      expect(res.status).toBe(201)
      expect(res.data).toHaveProperty('id')
      expect(res.data).toHaveProperty('role', 'parent')
      parentId = res.data.id
    })

    it('should get student users', async () => {
      const res = await request({ method: 'GET', path: '/api/users/role/student' })
      expect(res.status).toBe(200)
      const students = res.data
      expect(students.every((u) => u.role === 'student')).toBe(true)
    })

    it('should get user by id', async () => {
      const res = await request({ method: 'GET', path: `/api/users/${studentId}` })
      expect(res.status).toBe(200)
      expect(res.data.id).toBe(studentId)
    })

    it('should get user by username', async () => {
      const res = await request({
        method: 'GET',
        path: `/api/users/username/${TEST_STUDENT.username}`,
      })
      expect(res.status).toBe(200)
      expect(res.data.username).toBe(TEST_STUDENT.username)
    })

    it('should return 404 for non-existent user', async () => {
      const res = await request({ method: 'GET', path: '/api/users/nonexistent_id' })
      expect(res.status).toBe(404)
    })
  })

  describe('Tasks API', () => {
    it('should create a task', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/tasks',
        body: {
          parentId,
          studentId,
          name: 'Harness测试任务',
          quantity: 1,
          basePoints: 10,
          taskType: 'temporary',
        },
      })
      expect(res.status).toBe(201)
      expect(res.data).toHaveProperty('id')
      expect(res.data).toHaveProperty('status', 'pending')
      expect(res.data).toHaveProperty('taskType', 'temporary')
      taskId = res.data.id
    })

    it('should get all tasks', async () => {
      const res = await request({ method: 'GET', path: '/api/tasks' })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })

    it('should get task by id', async () => {
      const res = await request({ method: 'GET', path: `/api/tasks/${taskId}` })
      expect(res.status).toBe(200)
      expect(res.data.id).toBe(taskId)
    })

    it('should submit a task', async () => {
      const res = await request({
        method: 'POST',
        path: `/api/tasks/${taskId}/submit`,
        body: { studentId },
      })
      expect(res.status).toBe(200)
      expect(res.data.status).toBe('submitted')
    })

    it('should approve a task', async () => {
      const res = await request({
        method: 'POST',
        path: `/api/tasks/${taskId}/approve`,
        body: { rating: 'excellent' },
      })
      expect(res.status).toBe(200)
      expect(res.data.status).toBe('approved')
      expect(res.data.finalPoints).toBe(10)
    })

    it('should return 404 for non-existent task', async () => {
      const res = await request({ method: 'GET', path: '/api/tasks/nonexistent_id' })
      expect(res.status).toBe(404)
    })
  })

  describe('Points API', () => {
    it('should get student points balance', async () => {
      const res = await request({ method: 'GET', path: `/api/points/student/${studentId}/balance` })
      expect(res.status).toBe(200)
      expect(res.data.balance).toBeGreaterThanOrEqual(10)
    })

    it('should get student point records', async () => {
      const res = await request({ method: 'GET', path: `/api/points/student/${studentId}` })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })
  })

  describe('Vouchers API', () => {
    it('should get vouchers', async () => {
      const res = await request({ method: 'GET', path: '/api/vouchers' })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })
  })

  describe('Withdraws API', () => {
    it('should get all withdraws', async () => {
      const res = await request({ method: 'GET', path: '/api/withdraws' })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })

    it('should get pending withdraws', async () => {
      const res = await request({ method: 'GET', path: '/api/withdraws/pending' })
      expect(res.status).toBe(200)
      expect(Array.isArray(res.data)).toBe(true)
    })
  })

  describe('Lottery API', () => {
    it('should get lottery config', async () => {
      const res = await request({ method: 'GET', path: '/api/lottery/config' })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('boxPrizes')
      expect(res.data).toHaveProperty('wheelSegments')
      expect(res.data).toHaveProperty('pointCost')
    })

    it('should get today lottery count', async () => {
      const res = await request({ method: 'GET', path: '/api/lottery/today' })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('count')
    })
  })

  describe('Math Boss API', () => {
    it('should get math boss status', async () => {
      const res = await request({ method: 'GET', path: `/api/math-boss/status/${studentId}` })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('playCount')
      expect(res.data).toHaveProperty('bestScore')
    })

    it('should generate a question', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/math-boss/question',
        body: { difficulty: 'easy' },
      })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('success', true)
      expect(res.data.question).toHaveProperty('a')
      expect(res.data.question).toHaveProperty('b')
      expect(res.data.question).toHaveProperty('answer')
    })
  })

  describe('Checkin API', () => {
    it('should get checkin status', async () => {
      const res = await request({ method: 'GET', path: `/api/checkin/status/${studentId}` })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('checkedInToday')
      expect(res.data).toHaveProperty('streak')
    })
  })

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request({ method: 'GET', path: '/api/unknown-route' })
      expect(res.status).toBe(404)
    })
  })
})
