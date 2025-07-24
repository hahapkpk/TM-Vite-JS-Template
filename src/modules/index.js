// 模块注册中心
const moduleList = []
let storage = null

/**
 * 动态注册所有模块
 * @param {Object} ctx - 上下文对象，包含storage等
 */
export async function registerModules (ctx) {
  storage = ctx.storage
  moduleList.length = 0

  // 动态加载所有模块文件（除了index.js）
  const modules = import.meta.glob('./*.js', { eager: true })

  for (const [path, moduleExport] of Object.entries(modules)) {
    // 跳过index.js自身
    if (path.includes('index.js')) continue

    try {
      const moduleInstance = moduleExport.default(ctx)
      if (moduleInstance && moduleInstance.name) {
        // 获取模块的启用状态，默认为启用
        const isEnabled = storage.get(`module_${moduleInstance.name}_enabled`, true)
        moduleInstance.enabled = isEnabled
        moduleInstance.filePath = path
        moduleList.push(moduleInstance)
      }
    } catch (error) {
      console.error(`[模块加载失败] ${path}:`, error)
    }
  }

  console.log(`[模块系统] 已加载 ${moduleList.length} 个模块`)
}

/**
 * 运行所有启用的模块
 */
export function runAllModules () {
  const enabledModules = moduleList.filter(m => m.enabled)
  console.log(`[模块系统] 运行 ${enabledModules.length} 个启用的模块`)
  enabledModules.forEach(m => {
    try {
      m.run && m.run()
    } catch (error) {
      console.error(`[模块运行失败] ${m.name}:`, error)
    }
  })
}

/**
 * 获取所有模块列表
 */
export function getAllModules () {
  return moduleList
}

/**
 * 切换模块启用状态
 * @param {string} moduleName - 模块名称
 * @param {boolean} enabled - 是否启用
 */
export function toggleModule (moduleName, enabled) {
  const module = moduleList.find(m => m.name === moduleName)
  if (module) {
    module.enabled = enabled
    storage.set(`module_${moduleName}_enabled`, enabled)
    console.log(`[模块系统] ${moduleName} ${enabled ? '已启用' : '已禁用'}`)
  }
}

/**
 * 运行单个模块
 * @param {string} moduleName - 模块名称
 */
export function runModule (moduleName) {
  const module = moduleList.find(m => m.name === moduleName && m.enabled)
  if (module) {
    try {
      module.run && module.run()
      console.log(`[模块系统] 已运行模块: ${moduleName}`)
    } catch (error) {
      console.error(`[模块运行失败] ${moduleName}:`, error)
    }
  }
}
