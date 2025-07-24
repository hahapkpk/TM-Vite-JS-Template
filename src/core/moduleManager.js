// src/core/moduleManager.js
export class ModuleManager {
  constructor (storage) {
    this.storage = storage
    this.modules = []
  }

  add(mod) {
    // 规范化模块对象
    const data = {
      name: mod.name || 'unnamed',
      run: mod.run || (() => {}),
      enabled: this.storage.get(`mod_enabled_${mod.name}`, true),
      lastRun: this.storage.get(`mod_lastRun_${mod.name}`, null),
      lastError: this.storage.get(`mod_lastError_${mod.name}`, null)
    }
    this.modules.push(data)
  }

  getAll() {
    return this.modules
  }

  setEnabled(name, enabled) {
    const mod = this.modules.find(m => m.name === name)
    if (mod) {
      mod.enabled = enabled
      this.storage.set(`mod_enabled_${name}`, enabled)
    }
  }

  async run(name) {
    const mod = this.modules.find(m => m.name === name)
    if (!mod || !mod.enabled) return
    try {
      await Promise.resolve(mod.run())
      const now = new Date().toISOString()
      mod.lastRun = now
      mod.lastError = null
      this.storage.set(`mod_lastRun_${mod.name}`, now)
      this.storage.set(`mod_lastError_${mod.name}`, null)
    } catch (e) {
      console.error(`[${mod.name}] run error`, e)
      mod.lastError = e.message || String(e)
      this.storage.set(`mod_lastError_${mod.name}`, mod.lastError)
    }
  }

  async runAll() {
    for (const m of this.modules) {
      if (m.enabled) {
        await this.run(m.name)
      }
    }
  }
}
