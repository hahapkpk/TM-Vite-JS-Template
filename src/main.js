import { initPanel } from './ui/panel'
import { registerModules, runAllModules } from './modules'
import { GMStorage } from './utils/storage'

(async function () {
  console.log('[TM Template] Script start')

  // 1. 初始化数据存储
  const storage = new GMStorage('tm_template_')

  // 2. 注册所有模块
  await registerModules({ storage })

  // 3. 初始化 UI 面板（可拖拽/吸附）
  initPanel({ storage })

  // 4. 检查主开关状态，决定是否自动运行模块
  const masterEnabled = storage.get('master_enabled', true)
  if (masterEnabled) {
    console.log('[TM Template] 主开关已启用，自动运行所有模块')
    runAllModules()
  } else {
    console.log('[TM Template] 主开关已禁用，跳过自动运行')
  }
})()
