import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'db.json')
const PORT = 3001
const LOTTERY_POINT_COST = 10 // 每次抽奖消耗的积分数

// 简单确定性哈希（用于基于日期+学生ID生成当天随机主题）
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash
}

// 抽箱子奖品配置（加权随机）
const BOX_PRIZES = [
  { amount: 1, weight: 35, type: 'money' },
  { amount: 2, weight: 30, type: 'money' },
  { amount: 5, weight: 20, type: 'money' },
  { amount: 0, weight: 10, type: 'joke' },
  { amount: 10, weight: 5, type: 'money' },
]

// 恶搞奖品 emoji 列表
const JOKE_PRIZES = ['🪰', '💩', '🐍', '🐛']

// 大转盘扇区配置（加权随机，9 扇区）
const WHEEL_SEGMENTS = [
  { amount: 100, weight: 0.5, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
  { amount: 2, weight: 25, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
  { amount: 5, weight: 12.5, type: 'money' },
  { amount: 0, weight: 12.5, type: 'joke' },
  { amount: 2, weight: 25, type: 'money' },
  { amount: 10, weight: 12.5, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
]

function weightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight
  for (const item of items) {
    random -= item.weight
    if (random <= 0) return item
  }
  return items[items.length - 1]
}

// 默认抽奖配置
const DEFAULT_BOX_PRIZES = [
  { amount: 1, weight: 35, type: 'money', label: '1元', color: '#FFD700' },
  { amount: 2, weight: 30, type: 'money', label: '2元', color: '#4ADE80' },
  { amount: 5, weight: 20, type: 'money', label: '5元', color: '#38BDF8' },
  { amount: 0, weight: 10, type: 'joke', label: '恶搞', color: '#FB923C' },
  { amount: 10, weight: 5, type: 'money', label: '10元', color: '#A78BFA' },
]

const DEFAULT_WHEEL_SEGMENTS = [
  { amount: 100, weight: 0.5, type: 'money', label: '100元', color: '#FF2D55' },
  { amount: 1, weight: 37, type: 'money', label: '1元', color: '#FBBF24' },
  { amount: 2, weight: 25, type: 'money', label: '2元', color: '#FCD34D' },
  { amount: 1, weight: 37, type: 'money', label: '1元', color: '#4ADE80' },
  { amount: 5, weight: 12.5, type: 'money', label: '5元', color: '#2DD4BF' },
  { amount: 0, weight: 12.5, type: 'joke', label: '恶搞', color: '#FB923C' },
  { amount: 2, weight: 25, type: 'money', label: '2元', color: '#818CF8' },
  { amount: 10, weight: 12.5, type: 'money', label: '10元', color: '#A78BFA' },
  { amount: 1, weight: 37, type: 'money', label: '1元', color: '#38BDF8' },
]

function getEffectiveBoxPrizes() {
  const config = db.lotteryConfig
  if (config && config.boxPrizes && config.boxPrizes.length > 0) return config.boxPrizes
  return DEFAULT_BOX_PRIZES
}

function getEffectiveWheelSegments() {
  const config = db.lotteryConfig
  if (config && config.wheelSegments && config.wheelSegments.length > 0) return config.wheelSegments
  return DEFAULT_WHEEL_SEGMENTS
}

function getEffectiveLotteryCost() {
  const config = db.lotteryConfig
  if (config && config.pointCost && config.pointCost > 0) return config.pointCost
  return LOTTERY_POINT_COST
}

// ============ 工具函数 ============

function generateId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now() {
  return new Date().toISOString()
}

function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    return null
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')
}

function initDb() {
  if (fs.existsSync(DB_PATH)) {
    const db = loadDb()
    if (db && db.users && db.users.length > 0) {
      return db
    }
  }

  const parentId = generateId()
  const studentId = generateId()

  const db = {
    users: [
      {
        id: parentId,
        username: 'parent1',
        password: '1234',
        role: 'parent',
        displayName: '家长小明',
        createdAt: now(),
      },
      {
        id: studentId,
        username: 'student1',
        password: '1234',
        role: 'student',
        displayName: '学生小华',
        createdAt: now(),
      },
    ],
    tasks: [
      {
        id: generateId(),
        parentId,
        studentId,
        name: '背诵古诗一首',
        quantity: 1,
        basePoints: 10,
        taskType: 'daily',
        status: 'pending',
        createdAt: now(),
      },
      {
        id: generateId(),
        parentId,
        studentId,
        name: '练习写字',
        quantity: 2,
        basePoints: 15,
        taskType: 'temporary',
        taskDate: getLocalDateStr(),
        status: 'pending',
        createdAt: now(),
      },
      {
        id: generateId(),
        parentId,
        studentId,
        name: '阅读课外书',
        quantity: 30,
        basePoints: 20,
        taskType: 'periodic',
        weekdays: [1, 3, 5],
        status: 'pending',
        createdAt: now(),
      },
      {
        id: generateId(),
        parentId,
        studentId,
        name: '整理书桌',
        quantity: 1,
        basePoints: 5,
        taskType: 'temporary',
        taskDate: getLocalDateStr(),
        status: 'pending',
        createdAt: now(),
      },
    ],
    vouchers: [],
    points: [],
    withdraws: [],
    lotteryRecords: [],
  }

  saveDb(db)
  return db
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

// ============ 路由处理 ============

function initDailyTasks(db) {
  const today = getLocalDateStr()
  const dayOfWeek = new Date().getDay() || 7 // 1-7, 周一到周日

  // 找出所有"模板"任务（taskDate 为空的任务，即原始创建的每日/周期任务）
  const templates = db.tasks.filter(
    (t) => (t.taskType === 'daily' || t.taskType === 'periodic') && !t.taskDate,
  )

  let changed = false

  for (const tpl of templates) {
    // 周期任务：检查今天是否在 weekdays 里
    if (tpl.taskType === 'periodic') {
      const weekdays = tpl.weekdays || []
      if (!weekdays.includes(dayOfWeek)) continue
    }

    // 检查今天是否已生成过此模板的任务
    const exists = db.tasks.some(
      (t) =>
        t.taskDate === today &&
        t.taskType === tpl.taskType &&
        t.name === tpl.name &&
        t.studentId === tpl.studentId &&
        t.parentId === tpl.parentId &&
        t.basePoints === tpl.basePoints,
    )
    if (exists) continue

    // 生成今天的任务实例
    db.tasks.push({
      id: generateId(),
      parentId: tpl.parentId,
      studentId: tpl.studentId,
      name: tpl.name,
      quantity: tpl.quantity,
      basePoints: tpl.basePoints,
      taskType: tpl.taskType,
      weekdays: tpl.weekdays,
      taskDate: today,
      status: 'pending',
      createdAt: now(),
    })
    changed = true
  }

  // 清空昨天未完成的每日/周期任务实例
  const yesterday = getLocalDateStr(new Date(Date.now() - 86400000))
  const beforeLen = db.tasks.length
  db.tasks = db.tasks.filter((t) => {
    // 只清空有 taskDate 且是昨天及之前的、未完成的每日/周期任务实例
    if (t.taskDate && t.taskType && (t.taskType === 'daily' || t.taskType === 'periodic')) {
      if (t.taskDate < today && t.status === 'pending') {
        return false // 删除
      }
    }
    return true
  })
  if (db.tasks.length < beforeLen) changed = true

  if (changed) saveDb(db)
}

const db = initDb()

// 数据库迁移：确保必要的数组存在
if (!db.points) {
  db.points = []
  saveDb(db)
}
if (!db.vouchers) {
  db.vouchers = []
  saveDb(db)
}
if (!db.withdraws) {
  db.withdraws = []
  saveDb(db)
}
if (!db.lotteryRecords) {
  db.lotteryRecords = []
  saveDb(db)
}
if (!db.checkins) {
  db.checkins = []
  saveDb(db)
}
if (!db.lotteryConfig) {
  db.lotteryConfig = {}
  saveDb(db)
}
if (!db.mathBossRecords) {
  db.mathBossRecords = []
  saveDb(db)
}
if (!db.skinUnlocks) {
  db.skinUnlocks = []
  saveDb(db)
}

// 启动时执行一次每日任务初始化
initDailyTasks(db)

// 每天凌晨 00:01 执行每日任务初始化
const CHECK_INTERVAL = 60 * 1000 // 每分钟检查一次
let lastCheckDate = getLocalDateStr()
setInterval(() => {
  const today = getLocalDateStr()
  if (today !== lastCheckDate) {
    lastCheckDate = today
    initDailyTasks(db)
    console.log(`[Daily Init] ${today} 每日任务已初始化`)
  }
}, CHECK_INTERVAL)

const server = http.createServer(async (req, res) => {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname
  const method = req.method

  try {
    // ============ Users ============
    if (pathname === '/api/users' && method === 'GET') {
      jsonResponse(res, 200, db.users)
      return
    }

    if (pathname === '/api/users' && method === 'POST') {
      const body = await parseBody(req)
      const newUser = { ...body, id: generateId(), createdAt: now() }
      db.users.push(newUser)
      saveDb(db)
      jsonResponse(res, 201, newUser)
      return
    }

    if (pathname === '/api/users/role/student' && method === 'GET') {
      jsonResponse(
        res,
        200,
        db.users.filter((u) => u.role === 'student'),
      )
      return
    }

    const userByIdMatch = pathname.match(/^\/api\/users\/([^/]+)$/)
    if (userByIdMatch && method === 'GET') {
      const user = db.users.find((u) => u.id === userByIdMatch[1])
      if (!user) {
        jsonResponse(res, 404, { error: 'User not found' })
        return
      }
      jsonResponse(res, 200, user)
      return
    }

    const userByUsernameMatch = pathname.match(/^\/api\/users\/username\/([^/]+)$/)
    if (userByUsernameMatch && method === 'GET') {
      const user = db.users.find((u) => u.username === userByUsernameMatch[1])
      if (!user) {
        jsonResponse(res, 404, { error: 'User not found' })
        return
      }
      jsonResponse(res, 200, user)
      return
    }

    // ============ Tasks ============
    if (pathname === '/api/tasks' && method === 'GET') {
      jsonResponse(res, 200, db.tasks)
      return
    }

    // 手动触发每日任务初始化
    if (pathname === '/api/tasks/init-daily' && method === 'POST') {
      initDailyTasks(db)
      jsonResponse(res, 200, { success: true, message: '每日任务已初始化' })
      return
    }

    if (pathname === '/api/tasks' && method === 'POST') {
      const body = await parseBody(req)
      const taskType = body.taskType || 'temporary'
      const newTask = {
        ...body,
        id: generateId(),
        taskType,
        status: 'pending',
        createdAt: now(),
      }
      // 临时任务设置 taskDate 为今天
      if (taskType === 'temporary') {
        newTask.taskDate = getLocalDateStr()
      } else {
        // daily/periodic 任务不应带 taskDate（作为模板）
        delete newTask.taskDate
      }
      db.tasks.push(newTask)
      saveDb(db)
      jsonResponse(res, 201, newTask)
      return
    }

    const taskByIdMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/)
    if (taskByIdMatch && method === 'GET') {
      const task = db.tasks.find((t) => t.id === taskByIdMatch[1])
      if (!task) {
        jsonResponse(res, 404, { error: 'Task not found' })
        return
      }
      jsonResponse(res, 200, task)
      return
    }

    if (taskByIdMatch && method === 'PATCH') {
      const body = await parseBody(req)
      const index = db.tasks.findIndex((t) => t.id === taskByIdMatch[1])
      if (index === -1) {
        jsonResponse(res, 404, { error: 'Task not found' })
        return
      }
      db.tasks[index] = { ...db.tasks[index], ...body }
      saveDb(db)
      jsonResponse(res, 200, db.tasks[index])
      return
    }

    if (taskByIdMatch && method === 'DELETE') {
      const index = db.tasks.findIndex((t) => t.id === taskByIdMatch[1])
      if (index === -1) {
        jsonResponse(res, 404, { error: 'Task not found' })
        return
      }
      db.tasks.splice(index, 1)
      saveDb(db)
      jsonResponse(res, 204, null)
      return
    }

    const taskStudentMatch = pathname.match(/^\/api\/tasks\/student\/([^/]+)$/)
    if (taskStudentMatch && method === 'GET') {
      // 只返回实例任务（有 taskDate 的），不返回模板
      const instances = db.tasks.filter((t) => t.studentId === taskStudentMatch[1] && t.taskDate)
      jsonResponse(res, 200, instances)
      return
    }

    const taskParentMatch = pathname.match(/^\/api\/tasks\/parent\/([^/]+)$/)
    if (taskParentMatch && method === 'GET') {
      const parentAll = db.tasks.filter((t) => t.parentId === taskParentMatch[1])
      const templates = parentAll.filter(
        (t) => !t.taskDate && (t.taskType === 'daily' || t.taskType === 'periodic'),
      )
      const instances = parentAll.filter((t) => t.taskDate)
      jsonResponse(res, 200, { templates, instances })
      return
    }

    const taskSubmitMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/submit$/)
    if (taskSubmitMatch && method === 'POST') {
      const body = await parseBody(req)
      const index = db.tasks.findIndex((t) => t.id === taskSubmitMatch[1])
      if (
        index === -1 ||
        db.tasks[index].status !== 'pending' ||
        db.tasks[index].studentId !== body.studentId
      ) {
        jsonResponse(res, 400, { error: 'Invalid task submit' })
        return
      }
      db.tasks[index] = { ...db.tasks[index], status: 'submitted', submittedAt: now() }
      saveDb(db)
      jsonResponse(res, 200, db.tasks[index])
      return
    }

    const taskApproveMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/approve$/)
    if (taskApproveMatch && method === 'POST') {
      const body = await parseBody(req)
      const index = db.tasks.findIndex((t) => t.id === taskApproveMatch[1])
      if (index === -1 || db.tasks[index].status !== 'submitted') {
        jsonResponse(res, 400, { error: 'Invalid task approve' })
        return
      }
      const task = db.tasks[index]
      const finalPoints =
        body.rating === 'excellent' ? task.basePoints : Math.floor(task.basePoints * 0.8)
      db.tasks[index] = {
        ...task,
        status: 'approved',
        rating: body.rating,
        finalPoints,
        approvedAt: now(),
      }
      // 自动创建积分记录（不再直接创建代金券）
      if (finalPoints > 0) {
        if (!db.points) db.points = []
        db.points.push({
          id: generateId(),
          studentId: task.studentId,
          amount: finalPoints,
          source: 'task_reward',
          description: `完成任务：${task.name}`,
          relatedId: task.id,
          createdAt: now(),
        })
      }
      saveDb(db)
      jsonResponse(res, 200, db.tasks[index])
      return
    }

    const taskRejectMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/reject$/)
    if (taskRejectMatch && method === 'POST') {
      const index = db.tasks.findIndex((t) => t.id === taskRejectMatch[1])
      if (index === -1 || db.tasks[index].status !== 'submitted') {
        jsonResponse(res, 400, { error: 'Invalid task reject' })
        return
      }
      db.tasks[index] = {
        ...db.tasks[index],
        status: 'rejected',
        approvedAt: now(),
      }
      saveDb(db)
      jsonResponse(res, 200, db.tasks[index])
      return
    }

    // ============ Points ============
    if (pathname === '/api/points' && method === 'GET') {
      jsonResponse(res, 200, db.points)
      return
    }

    if (pathname === '/api/points' && method === 'POST') {
      const body = await parseBody(req)
      const newPoint = { ...body, id: generateId(), createdAt: now() }
      db.points.push(newPoint)
      saveDb(db)
      jsonResponse(res, 201, newPoint)
      return
    }

    const pointStudentMatch = pathname.match(/^\/api\/points\/student\/([^/]+)$/)
    if (pointStudentMatch && method === 'GET') {
      const list = db.points.filter((p) => p.studentId === pointStudentMatch[1])
      jsonResponse(res, 200, list)
      return
    }

    const pointBalanceMatch = pathname.match(/^\/api\/points\/student\/([^/]+)\/balance$/)
    if (pointBalanceMatch && method === 'GET') {
      const balance = db.points
        .filter((p) => p.studentId === pointBalanceMatch[1])
        .reduce((sum, p) => sum + p.amount, 0)
      jsonResponse(res, 200, { balance })
      return
    }

    // ============ Vouchers ============
    if (pathname === '/api/vouchers' && method === 'GET') {
      jsonResponse(res, 200, db.vouchers)
      return
    }

    if (pathname === '/api/vouchers' && method === 'POST') {
      const body = await parseBody(req)
      const newVoucher = { ...body, id: generateId(), createdAt: now() }
      db.vouchers.push(newVoucher)
      saveDb(db)
      jsonResponse(res, 201, newVoucher)
      return
    }

    const voucherStudentMatch = pathname.match(/^\/api\/vouchers\/student\/([^/]+)$/)
    if (voucherStudentMatch && method === 'GET') {
      const list = db.vouchers.filter((v) => v.studentId === voucherStudentMatch[1])
      jsonResponse(res, 200, list)
      return
    }

    const voucherBalanceMatch = pathname.match(/^\/api\/vouchers\/student\/([^/]+)\/balance$/)
    if (voucherBalanceMatch && method === 'GET') {
      const balance = db.vouchers
        .filter((v) => v.studentId === voucherBalanceMatch[1])
        .reduce((sum, v) => sum + v.amount, 0)
      jsonResponse(res, 200, { balance })
      return
    }

    const voucherDeductMatch = pathname.match(/^\/api\/vouchers\/student\/([^/]+)\/deduct$/)
    if (voucherDeductMatch && method === 'POST') {
      const body = await parseBody(req)
      const studentId = voucherDeductMatch[1]
      const amount = body.amount

      const vouchers = db.vouchers
        .filter((v) => v.studentId === studentId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      let remaining = amount
      for (const v of vouchers) {
        if (remaining <= 0) break
        const idx = db.vouchers.findIndex((x) => x.id === v.id)
        if (idx === -1) continue
        if (v.amount <= remaining) {
          remaining -= v.amount
          db.vouchers.splice(idx, 1)
        } else {
          db.vouchers[idx] = { ...v, amount: v.amount - remaining }
          remaining = 0
        }
      }
      saveDb(db)
      jsonResponse(res, 200, { success: remaining <= 0 })
      return
    }

    // ============ Withdraws ============
    if (pathname === '/api/withdraws' && method === 'GET') {
      jsonResponse(res, 200, db.withdraws)
      return
    }

    if (pathname === '/api/withdraws' && method === 'POST') {
      const body = await parseBody(req)
      const newReq = { ...body, id: generateId(), status: 'pending', createdAt: now() }
      db.withdraws.push(newReq)
      saveDb(db)
      jsonResponse(res, 201, newReq)
      return
    }

    const withdrawStudentMatch = pathname.match(/^\/api\/withdraws\/student\/([^/]+)$/)
    if (withdrawStudentMatch && method === 'GET') {
      jsonResponse(
        res,
        200,
        db.withdraws.filter((w) => w.studentId === withdrawStudentMatch[1]),
      )
      return
    }

    if (pathname === '/api/withdraws/pending' && method === 'GET') {
      jsonResponse(
        res,
        200,
        db.withdraws.filter((w) => w.status === 'pending'),
      )
      return
    }

    const withdrawApproveMatch = pathname.match(/^\/api\/withdraws\/([^/]+)\/approve$/)
    if (withdrawApproveMatch && method === 'POST') {
      const body = await parseBody(req)
      const index = db.withdraws.findIndex((w) => w.id === withdrawApproveMatch[1])
      if (index === -1 || db.withdraws[index].status !== 'pending') {
        jsonResponse(res, 400, { error: 'Invalid withdraw approve' })
        return
      }
      const withdrawReq = db.withdraws[index]
      // FIFO 扣减代金券
      const vouchers = db.vouchers
        .filter((v) => v.studentId === withdrawReq.studentId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      let remaining = withdrawReq.amount
      for (const v of vouchers) {
        if (remaining <= 0) break
        const idx = db.vouchers.findIndex((x) => x.id === v.id)
        if (idx === -1) continue
        if (v.amount <= remaining) {
          remaining -= v.amount
          db.vouchers.splice(idx, 1)
        } else {
          db.vouchers[idx] = { ...v, amount: v.amount - remaining }
          remaining = 0
        }
      }
      if (remaining > 0) {
        jsonResponse(res, 400, { error: '代金券余额不足，扣减失败' })
        return
      }
      db.withdraws[index] = {
        ...withdrawReq,
        status: 'approved',
        parentId: body.parentId,
        approvedAt: now(),
      }
      saveDb(db)
      jsonResponse(res, 200, db.withdraws[index])
      return
    }

    const withdrawRejectMatch = pathname.match(/^\/api\/withdraws\/([^/]+)\/reject$/)
    if (withdrawRejectMatch && method === 'POST') {
      const body = await parseBody(req)
      const index = db.withdraws.findIndex((w) => w.id === withdrawRejectMatch[1])
      if (index === -1 || db.withdraws[index].status !== 'pending') {
        jsonResponse(res, 400, { error: 'Invalid withdraw reject' })
        return
      }
      db.withdraws[index] = {
        ...db.withdraws[index],
        status: 'rejected',
        parentId: body.parentId,
        approvedAt: now(),
      }
      saveDb(db)
      jsonResponse(res, 200, db.withdraws[index])
      return
    }

    // ============ Checkin ============
    // 签到状态查询
    const checkinStatusMatch = pathname.match(/^\/api\/checkin\/status\/([^/]+)$/)
    if (checkinStatusMatch && method === 'GET') {
      const studentId = checkinStatusMatch[1]
      const today = getLocalDateStr()
      const checkedInToday = db.checkins.some((c) => c.studentId === studentId && c.date === today)

      // 计算连续签到天数
      let streak = 0
      const checkDate = new Date()
      while (true) {
        const dateStr = getLocalDateStr(checkDate)
        const found = db.checkins.some((c) => c.studentId === studentId && c.date === dateStr)
        if (found) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }

      // 今天是否有已提交的任务（完成 = submitted/approved/rejected 都算）
      const todayTasks = db.tasks.filter(
        (t) =>
          t.studentId === studentId &&
          t.status !== 'pending' &&
          t.submittedAt &&
          t.submittedAt.startsWith(today),
      )
      const hasCompletedTask = todayTasks.length > 0

      jsonResponse(res, 200, {
        checkedInToday,
        streak,
        hasCompletedTask,
        checkinPoints: 10,
      })
      return
    }

    // 签到
    if (pathname === '/api/checkin' && method === 'POST') {
      const body = await parseBody(req)
      const { studentId } = body
      const today = getLocalDateStr()

      // 1. 检查今天是否已签到
      const alreadyCheckedIn = db.checkins.some(
        (c) => c.studentId === studentId && c.date === today,
      )
      if (alreadyCheckedIn) {
        jsonResponse(res, 400, { error: '今天已经签到过了' })
        return
      }

      // 2. 检查今天是否有已提交的任务
      const todayTasks = db.tasks.filter(
        (t) =>
          t.studentId === studentId &&
          t.status !== 'pending' &&
          t.submittedAt &&
          t.submittedAt.startsWith(today),
      )
      if (todayTasks.length === 0) {
        jsonResponse(res, 400, { error: '需要先完成至少一个任务才能签到' })
        return
      }

      // 3. 签到成功：创建签到记录 + 积分记录
      db.checkins.push({
        id: generateId(),
        studentId,
        date: today,
        createdAt: now(),
      })

      db.points.push({
        id: generateId(),
        studentId,
        amount: 10,
        source: 'checkin',
        description: '每日签到奖励',
        createdAt: now(),
      })

      // 计算连续签到天数
      let streak = 0
      const checkDate = new Date()
      while (true) {
        const dateStr = getLocalDateStr(checkDate)
        const found = db.checkins.some((c) => c.studentId === studentId && c.date === dateStr)
        if (found) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }

      saveDb(db)
      jsonResponse(res, 200, { success: true, streak, points: 10 })
      return
    }

    // ============ Lottery Config ============
    // 获取抽奖配置（前端展示用）
    if (pathname === '/api/lottery/config' && method === 'GET') {
      const config = db.lotteryConfig || {}
      jsonResponse(res, 200, {
        boxPrizes: getEffectiveBoxPrizes(),
        wheelSegments: getEffectiveWheelSegments(),
        pointCost: getEffectiveLotteryCost(),
        _customized: !!(config.boxPrizes || config.wheelSegments || config.pointCost),
      })
      return
    }

    // 保存抽奖配置（家长端）
    if (pathname === '/api/lottery/config' && method === 'PUT') {
      const body = await parseBody(req)
      // 验证数据
      if (body.boxPrizes) {
        if (!Array.isArray(body.boxPrizes) || body.boxPrizes.length === 0) {
          jsonResponse(res, 400, { error: '抽箱子奖品不能为空' })
          return
        }
        for (const p of body.boxPrizes) {
          if (typeof p.amount !== 'number' || typeof p.weight !== 'number' || p.weight <= 0) {
            jsonResponse(res, 400, { error: '每个奖品必须有有效的 amount 和 weight' })
            return
          }
          if (!p.type || !['money', 'joke'].includes(p.type)) {
            jsonResponse(res, 400, { error: '奖品类型必须是 money 或 joke' })
            return
          }
        }
      }
      if (body.wheelSegments) {
        if (!Array.isArray(body.wheelSegments) || body.wheelSegments.length === 0) {
          jsonResponse(res, 400, { error: '大转盘奖品不能为空' })
          return
        }
        for (const p of body.wheelSegments) {
          if (typeof p.amount !== 'number' || typeof p.weight !== 'number' || p.weight <= 0) {
            jsonResponse(res, 400, { error: '每个奖品必须有有效的 amount 和 weight' })
            return
          }
          if (!p.type || !['money', 'joke'].includes(p.type)) {
            jsonResponse(res, 400, { error: '奖品类型必须是 money 或 joke' })
            return
          }
        }
      }
      if (body.pointCost !== undefined) {
        if (typeof body.pointCost !== 'number' || body.pointCost <= 0) {
          jsonResponse(res, 400, { error: '抽奖积分消耗必须大于0' })
          return
        }
      }

      if (!db.lotteryConfig) db.lotteryConfig = {}
      if (body.boxPrizes) db.lotteryConfig.boxPrizes = body.boxPrizes
      if (body.wheelSegments) db.lotteryConfig.wheelSegments = body.wheelSegments
      if (body.pointCost !== undefined) db.lotteryConfig.pointCost = body.pointCost
      db.lotteryConfig.updatedAt = now()

      saveDb(db)
      jsonResponse(res, 200, {
        boxPrizes: getEffectiveBoxPrizes(),
        wheelSegments: getEffectiveWheelSegments(),
        pointCost: getEffectiveLotteryCost(),
      })
      return
    }

    // 重置抽奖配置为默认值（家长端）
    if (pathname === '/api/lottery/config/reset' && method === 'POST') {
      db.lotteryConfig = {}
      saveDb(db)
      jsonResponse(res, 200, {
        boxPrizes: getEffectiveBoxPrizes(),
        wheelSegments: getEffectiveWheelSegments(),
        pointCost: getEffectiveLotteryCost(),
      })
      return
    }

    // ============ Lottery ============
    if (pathname === '/api/lottery/today' && method === 'GET') {
      const today = new Date().toISOString().split('T')[0]
      const record = db.lotteryRecords.find((r) => r.date === today)
      jsonResponse(res, 200, { count: record ? record.count : 0 })
      return
    }

    // 抽奖：消耗积分，发放代金券
    if (pathname === '/api/lottery/draw' && method === 'POST') {
      const body = await parseBody(req)
      const { studentId, type } = body // type: 'box' | 'wheel'

      // 1. 检查积分余额
      const pointBalance = db.points
        .filter((p) => p.studentId === studentId)
        .reduce((sum, p) => sum + p.amount, 0)

      const effectiveCost = getEffectiveLotteryCost()
      if (pointBalance < effectiveCost) {
        jsonResponse(res, 400, {
          error: `积分不足，需要 ${effectiveCost} 积分，当前余额 ${pointBalance} 积分`,
        })
        return
      }

      // 2. 根据类型决定奖品（使用动态配置）
      let prizeAmount
      let prizeType = 'money'
      let jokeEmoji
      let segmentIndex
      if (type === 'wheel') {
        const segments = getEffectiveWheelSegments()
        const prize = weightedRandom(segments)
        segmentIndex = segments.indexOf(prize)
        prizeAmount = prize.amount
        prizeType = prize.type
        if (prize.type === 'joke') {
          jokeEmoji = JOKE_PRIZES[Math.floor(Math.random() * JOKE_PRIZES.length)]
        }
      } else {
        const prizes = getEffectiveBoxPrizes()
        const prize = weightedRandom(prizes)
        prizeAmount = prize.amount
        prizeType = prize.type
        if (prize.type === 'joke') {
          jokeEmoji = JOKE_PRIZES[Math.floor(Math.random() * JOKE_PRIZES.length)]
        }
      }

      // 3. 扣减积分
      db.points.push({
        id: generateId(),
        studentId,
        amount: -effectiveCost,
        source: 'lottery_cost',
        description: type === 'wheel' ? '大转盘抽奖消耗' : '抽箱子抽奖消耗',
        createdAt: now(),
      })

      // 4. 发放代金券（仅金钱类奖品）
      if (prizeType === 'money' && prizeAmount > 0) {
        const voucher = {
          id: generateId(),
          studentId,
          amount: prizeAmount,
          source: 'lottery',
          createdAt: now(),
        }
        db.vouchers.push(voucher)
      }

      // 5. 更新抽奖记录（保留兼容）
      const today = new Date().toISOString().split('T')[0]
      const existing = db.lotteryRecords.find((r) => r.date === today)
      if (existing) {
        existing.count += 1
      } else {
        db.lotteryRecords.push({ date: today, count: 1 })
      }

      saveDb(db)

      jsonResponse(res, 200, {
        success: true,
        type: prizeType,
        amount: prizeAmount,
        jokeEmoji,
        segmentIndex,
        pointBalance: pointBalance - effectiveCost,
        pointCost: effectiveCost,
      })
      return
    }

    if (pathname === '/api/lottery/increment' && method === 'POST') {
      // 保留旧接口兼容，但不再推荐使用
      const today = new Date().toISOString().split('T')[0]
      const existing = db.lotteryRecords.find((r) => r.date === today)
      if (existing) {
        existing.count += 1
      } else {
        db.lotteryRecords.push({ date: today, count: 1 })
      }
      saveDb(db)
      jsonResponse(res, 200, { count: existing ? existing.count : 1 })
      return
    }

    // ============ Math Boss ============

    // Boss难度配置
    const BOSS_DIFFICULTIES = [
      'easy',
      'easy',
      'easy',
      'medium',
      'medium',
      'medium',
      'hard',
      'hard',
      'hard',
      'hard',
    ]

    // 根据难度随机生成1道题
    function generateOneQuestion(difficulty) {
      function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
      }

      if (difficulty === 'easy') {
        const isAdd = Math.random() < 0.5
        if (isAdd) {
          let a, b
          do {
            a = randInt(1, 89)
            b = randInt(1, 9)
          } while ((a % 10) + (b % 10) >= 10 || a + b > 100)
          return { a, b, operator: '+', answer: a + b, difficulty: 'easy' }
        } else {
          let a, b
          do {
            a = randInt(11, 99)
            b = randInt(1, 9)
          } while (a % 10 < b % 10)
          return { a, b, operator: '-', answer: a - b, difficulty: 'easy' }
        }
      } else if (difficulty === 'medium') {
        const type = randInt(0, 2)
        if (type === 0) {
          let a, b
          do {
            a = randInt(1, 89)
            b = randInt(1, 9)
          } while ((a % 10) + (b % 10) >= 10 || a + b > 100)
          return { a, b, operator: '+', answer: a + b, difficulty: 'medium' }
        } else if (type === 1) {
          let a, b
          do {
            a = randInt(2, 91)
            b = randInt(2, Math.min(98, 100 - a))
          } while ((a % 10) + (b % 10) < 10)
          return { a, b, operator: '+', answer: a + b, difficulty: 'medium' }
        } else {
          let a, b
          do {
            a = randInt(11, 99)
            b = randInt(1, 9)
          } while (a % 10 < b % 10)
          return { a, b, operator: '-', answer: a - b, difficulty: 'medium' }
        }
      } else {
        const isAdd = Math.random() < 0.5
        if (isAdd) {
          let a, b
          do {
            a = randInt(2, 91)
            b = randInt(2, Math.min(98, 100 - a))
          } while ((a % 10) + (b % 10) < 10)
          return { a, b, operator: '+', answer: a + b, difficulty: 'hard' }
        } else {
          let a, b
          do {
            a = randInt(21, 99)
            b = randInt(11, a - 1)
          } while (a % 10 >= b % 10)
          return { a, b, operator: '-', answer: a - b, difficulty: 'hard' }
        }
      }
    }

    // 阶梯奖励（按击败Boss数）
    function getMathBossReward(bossesDefeated) {
      const rewards = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 4, 5: 7, 6: 10, 7: 13, 8: 16, 9: 19, 10: 25 }
      return rewards[bossesDefeated] || 0
    }

    // 隐藏模式阶梯奖励（1.5倍）
    function getMinecraftBossReward(bossesDefeated) {
      const rewards = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 6, 5: 11, 6: 15, 7: 20, 8: 24, 9: 29, 10: 38 }
      return rewards[bossesDefeated] || 0
    }

    // 隐藏模式题目：随机隐藏 a 或 b，让玩家填数字  如 12 + ? = 29
    function generateHiddenQuestion(difficulty) {
      const q = generateOneQuestion(difficulty)
      const blank = Math.random() < 0.5 ? 'a' : 'b'
      return {
        a: q.a,
        b: q.b,
        operator: q.operator,
        mode: 'hidden',
        blank,
        answer: blank === 'a' ? q.a : q.b,
        result: q.answer,
        difficulty: q.difficulty,
      }
    }

    // 获取今日挑战状态
    const mathBossStatusMatch = pathname.match(/^\/api\/math-boss\/status\/([^/]+)$/)
    if (mathBossStatusMatch && method === 'GET') {
      const studentId = mathBossStatusMatch[1]
      const today = getLocalDateStr()
      const todayRecords = (db.mathBossRecords || []).filter(
        (r) => r.studentId === studentId && r.date === today,
      )
      const bestBosses = todayRecords.reduce((best, r) => Math.max(best, r.bossesDefeated), 0)
      const playCount = todayRecords.length

      // 检查今日是否有通关10个且血量>3的记录（每日解锁）
      const todayCleared = (db.mathBossRecords || []).some(
        (r) =>
          r.studentId === studentId &&
          r.date === today &&
          r.mode === 'normal' &&
          r.bossesDefeated === 10 &&
          (r.playerHearts || 0) >= 3,
      )

      jsonResponse(res, 200, {
        playCount,
        bestScore: bestBosses,
        bestReward: todayRecords.reduce((best, r) => Math.max(best, r.reward), 0),
        hiddenUnlocked: todayCleared,
      })
      return
    }

    // 获取隐藏模式状态（每日解锁：今天通关10个且血量>3才能解锁，当天随机分配一个主题）
    const hiddenStatusMatch = pathname.match(/^\/api\/math-boss\/hidden\/status\/([^/]+)$/)
    if (hiddenStatusMatch && method === 'GET') {
      const studentId = hiddenStatusMatch[1]
      const today = getLocalDateStr()

      // 检查今日是否有通关10个且血量>3的记录
      const todayCleared = (db.mathBossRecords || []).some(
        (r) =>
          r.studentId === studentId &&
          r.date === today &&
          r.mode === 'normal' &&
          r.bossesDefeated === 10 &&
          (r.playerHearts || 0) >= 3,
      )
      const todayRecords = (db.mathBossRecords || []).filter(
        (r) => r.studentId === studentId && r.date === today && r.mode === 'hidden',
      )
      const bestBosses = todayRecords.reduce((best, r) => Math.max(best, r.bossesDefeated), 0)

      // 基于日期确定性随机分配主题（同一天同一个学生得到同一个主题）
      const themes = ['minecraft', 'pvz', 'tank']
      const themeIndex = hashCode(today + studentId) % themes.length
      const todayTheme = themes[Math.abs(themeIndex)]

      jsonResponse(res, 200, {
        unlocked: todayCleared,
        todayPlayCount: todayRecords.length,
        todayBestScore: bestBosses,
        todayTheme,
      })
      return
    }

    // 开始挑战（扣积分）
    if (pathname === '/api/math-boss/start' && method === 'POST') {
      const body = await parseBody(req)
      const { studentId, mode } = body
      const isHidden = mode === 'hidden'

      // 检查今日挑战次数（每天最多2次，普通和隐藏分别计数）
      const today = getLocalDateStr()
      const todayCount = (db.mathBossRecords || []).filter(
        (r) =>
          r.studentId === studentId &&
          r.date === today &&
          (r.mode || 'normal') === (isHidden ? 'hidden' : 'normal'),
      ).length
      if (todayCount >= 2) {
        jsonResponse(res, 400, { error: '今天已挑战2次，明天再来吧！' })
        return
      }

      // 隐藏模式需先检查今日解锁
      if (isHidden) {
        const today = getLocalDateStr()
        const todayCleared = (db.mathBossRecords || []).some(
          (r) =>
            r.studentId === studentId &&
            r.date === today &&
            r.mode === 'normal' &&
            r.bossesDefeated === 10 &&
            (r.playerHearts || 0) >= 3,
        )
        if (!todayCleared) {
          jsonResponse(res, 400, { error: '隐藏关卡尚未解锁！需要普通模式通关10关且血量大于等于3' })
          return
        }
      }

      // 检查积分余额
      const pointBalance = db.points
        .filter((p) => p.studentId === studentId)
        .reduce((sum, p) => sum + p.amount, 0)

      if (pointBalance < 10) {
        jsonResponse(res, 400, { error: `积分不足，需要 10 积分，当前余额 ${pointBalance} 积分` })
        return
      }

      // 扣减积分
      db.points.push({
        id: generateId(),
        studentId,
        amount: -10,
        source: isHidden ? 'math_boss_hidden_cost' : 'math_boss_cost',
        description: isHidden ? '隐藏关卡挑战消耗' : '数学打Boss挑战消耗',
        createdAt: now(),
      })
      saveDb(db)

      // 生成第一题
      const q = isHidden
        ? generateHiddenQuestion('easy')
        : generateOneQuestion(BOSS_DIFFICULTIES[0])

      jsonResponse(res, 200, {
        success: true,
        question: isHidden
          ? {
              a: q.a,
              b: q.b,
              operator: q.operator,
              mode: 'hidden',
              blank: q.blank,
              answer: q.answer,
              result: q.result,
              difficulty: q.difficulty,
            }
          : { a: q.a, b: q.b, operator: q.operator, answer: q.answer, difficulty: q.difficulty },
        pointBalance: pointBalance - 10,
      })
      return
    }

    // 生成题目（无状态，前端告诉服务器当前Boss难度即可）
    if (pathname === '/api/math-boss/question' && method === 'POST') {
      const body = await parseBody(req)
      const { difficulty, mode } = body
      if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
        jsonResponse(res, 400, { error: '需要指定难度 easy/medium/hard' })
        return
      }
      const isHidden = mode === 'hidden'
      if (isHidden) {
        const q = generateHiddenQuestion(difficulty)
        jsonResponse(res, 200, {
          success: true,
          question: {
            a: q.a,
            b: q.b,
            operator: q.operator,
            mode: 'hidden',
            blank: q.blank,
            answer: q.answer,
            result: q.result,
            difficulty: q.difficulty,
          },
        })
      } else {
        const q = generateOneQuestion(difficulty)
        jsonResponse(res, 200, {
          success: true,
          question: {
            a: q.a,
            b: q.b,
            operator: q.operator,
            answer: q.answer,
            difficulty: q.difficulty,
          },
        })
      }
      return
    }

    // 结算奖励
    if (pathname === '/api/math-boss/finish' && method === 'POST') {
      const body = await parseBody(req)
      const { studentId, bossesDefeated, totalQuestions, correctCount, mode, playerHearts, theme } =
        body
      const isHidden = mode === 'hidden'

      const reward = isHidden
        ? getMinecraftBossReward(bossesDefeated)
        : getMathBossReward(bossesDefeated)

      // 保存记录
      const record = {
        id: generateId(),
        studentId,
        date: getLocalDateStr(),
        bossesDefeated,
        totalQuestions,
        correctCount,
        reward,
        playerHearts: typeof playerHearts === 'number' ? playerHearts : 0,
        mode: isHidden ? 'hidden' : 'normal',
        createdAt: now(),
      }
      db.mathBossRecords.push(record)

      // 奖励积分
      if (reward > 0) {
        db.points.push({
          id: generateId(),
          studentId,
          amount: reward,
          source: isHidden ? 'math_boss_hidden_reward' : 'math_boss_reward',
          description: isHidden
            ? `隐藏关卡奖励（击败${bossesDefeated}个Boss）`
            : `数学打Boss奖励（击败${bossesDefeated}个Boss）`,
          createdAt: now(),
        })
      }

      // 普通模式：通关10个且血量>3 时返回解锁标志
      let unlockedHidden = false
      if (
        !isHidden &&
        bossesDefeated === 10 &&
        typeof playerHearts === 'number' &&
        playerHearts >= 3
      ) {
        unlockedHidden = true
      }

      // 隐藏模式：解锁被击败Boss的皮肤
      let unlockedSkins = []
      if (isHidden && bossesDefeated > 0) {
        // 根据主题和Boss数确定哪些Boss被击败
        const mcBossNames = [
          'zombie',
          'mc_skeleton',
          'creeper',
          'enderman',
          'blaze',
          'wither',
          'ender_dragon',
        ]
        const pvzBossNames = [
          'pvz_basic',
          'pvz_cone',
          'pvz_bucket',
          'pvz_disco',
          'pvz_football',
          'pvz_gargantuar',
          'pvz_zomboss',
        ]
        const tankBossNames = [
          'tank_darkbear',
          'tank_xiaozha',
          'tank_sherman',
          'tank_xiaoban',
          'tank_xiaolv',
          'tank_zhuguli',
          'tank_dahu',
        ]
        const themeMap = { minecraft: mcBossNames, pvz: pvzBossNames, tank: tankBossNames }
        const bossNames =
          themeMap[mode === 'hidden' ? body.theme || 'minecraft' : 'minecraft'] || mcBossNames

        for (let i = 0; i < bossesDefeated && i < bossNames.length; i++) {
          const alreadyHas = (db.skinUnlocks || []).some(
            (s) => s.studentId === studentId && s.bossIcon === bossNames[i],
          )
          if (!alreadyHas) {
            const skin = {
              id: generateId(),
              studentId,
              bossIcon: bossNames[i],
              theme: body.theme || 'minecraft',
              unlockedAt: now(),
            }
            db.skinUnlocks.push(skin)
            unlockedSkins.push(skin)
          }
        }
      }

      saveDb(db)

      const newBalance = db.points
        .filter((p) => p.studentId === studentId)
        .reduce((sum, p) => sum + p.amount, 0)

      jsonResponse(res, 200, {
        success: true,
        bossesDefeated,
        totalQuestions,
        correctCount,
        reward,
        pointBalance: newBalance,
        unlockedHidden,
        unlockedSkins,
      })
      return
    }

    // 获取已解锁皮肤
    const skinMatch = pathname.match(/^\/api\/math-boss\/skins\/([^/]+)$/)
    if (skinMatch && method === 'GET') {
      const studentId = skinMatch[1]
      const skins = (db.skinUnlocks || []).filter((s) => s.studentId === studentId)
      jsonResponse(res, 200, { skins })
      return
    }

    // 404
    jsonResponse(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error(err)
    jsonResponse(res, 500, { error: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
