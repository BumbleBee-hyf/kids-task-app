// Vitest globalSetup: 在所有测试前启动后端服务器，所有测试后关闭
// 如果服务器已在运行（如本地开发环境），则跳过启动
import { spawn } from 'child_process'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 3001

let serverProcess = null

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: 'localhost', port: PORT, path: '/api/users', method: 'GET', timeout: 2000 },
      (res) => {
        res.resume()
        resolve(true)
      },
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

function waitForServer(maxRetries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0
    const check = () => {
      const req = http.request(
        { hostname: 'localhost', port: PORT, path: '/api/users', method: 'GET', timeout: 2000 },
        (res) => {
          res.resume()
          resolve()
        },
      )
      req.on('error', () => {
        retries++
        if (retries >= maxRetries) {
          reject(new Error(`Server not ready after ${maxRetries} retries`))
        } else {
          setTimeout(check, interval)
        }
      })
      req.on('timeout', () => {
        req.destroy()
        retries++
        if (retries >= maxRetries) {
          reject(new Error(`Server not ready after ${maxRetries} retries`))
        } else {
          setTimeout(check, interval)
        }
      })
      req.end()
    }
    check()
  })
}

export default async function setup() {
  // 检查服务器是否已在运行
  const alreadyRunning = await isServerRunning()
  if (alreadyRunning) {
    console.log('Server already running on port 3001, skipping startup')
    // 不需要 teardown，因为我们没有启动服务器
    return async () => {
      console.log('Tests done (server was already running, not stopping it)')
    }
  }

  // 启动服务器进程
  serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  })

  serverProcess.stdout.on('data', (data) => {
    console.log(`[server] ${data.toString().trim()}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.error(`[server:err] ${data.toString().trim()}`)
  })

  // 等待服务器就绪
  await waitForServer()
  console.log(`Test server is ready on port ${PORT}`)

  // 返回 teardown 函数
  return async () => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM')
      // 给进程一些时间优雅关闭
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          serverProcess.kill('SIGKILL')
          resolve()
        }, 5000)
        serverProcess.on('exit', () => {
          clearTimeout(timeout)
          resolve()
        })
      })
      console.log('Test server stopped')
    }
  }
}
