import './panel.css'
import { getAllModules, toggleModule, runModule, runAllModules } from '../modules'

/**
 * 初始化UI系统：通过Tampermonkey菜单控制面板
 * 支持：菜单控制显示/隐藏、脚本总开关、模块列表管理、拖拽移动
 */
export function initPanel ({ storage }) {
  // 注册Tampermonkey菜单项
  registerTampermonkeyMenu(storage)

  // 创建主面板（默认隐藏）
  createMainPanel(storage)
}

/**
 * 注册Tampermonkey菜单项
 */
function registerTampermonkeyMenu (storage) {
  // 检查是否在Tampermonkey环境中
  if (typeof GM_registerMenuCommand === 'undefined') {
    console.warn('[TM Template] GM_registerMenuCommand 不可用，将创建页面按钮作为备选方案')
    createFallbackButton(storage)
    return
  }

  // 获取当前面板状态
  const isVisible = storage.get('panel_visible', false)

  // 注册菜单命令
  GM_registerMenuCommand(
    isVisible ? '隐藏管理面板' : '显示管理面板',
    () => {
      toggleMainPanel(storage)
      // 重新注册菜单以更新文本
      updateMenuCommand(storage)
    },
    'p' // 快捷键
  )
}

/**
 * 更新菜单命令文本
 */
function updateMenuCommand (storage) {
  // 由于GM_registerMenuCommand不支持动态更新文本，
  // 我们只能在控制台输出状态信息
  const isVisible = storage.get('panel_visible', false)
  console.log(`[TM Template] 面板${isVisible ? '已显示' : '已隐藏'}，请刷新页面更新菜单文本`)
}

/**
 * 创建备选按钮（当GM_registerMenuCommand不可用时）
 */
function createFallbackButton (storage) {
  const menuId = 'tm-template-menu'
  if (document.getElementById(menuId)) return

  const menuButton = document.createElement('div')
  menuButton.id = menuId
  menuButton.innerHTML = `
    <div class="tm-menu__button" title="TM Template 管理面板">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
  `

  document.body.appendChild(menuButton)

  // 菜单按钮点击事件
  const button = menuButton.querySelector('.tm-menu__button')
  button.addEventListener('click', () => {
    toggleMainPanel(storage)
  })
}

/**
 * 创建主面板
 */
function createMainPanel (storage) {
  const panelId = 'tm-template-panel'
  if (document.getElementById(panelId)) return

  const panel = document.createElement('div')
  panel.id = panelId
  panel.innerHTML = `
    <div class="tm-panel__header">
      <span class="tm-panel__title">TM Template</span>
      <div class="tm-panel__actions">
        <button id="tm-close-panel" title="关闭面板">×</button>
        <button id="tm-toggle">—</button>
      </div>
    </div>
    <div class="tm-panel__body">
      <div class="tm-panel__content">
        <div class="tm-panel__left">
          <div class="tm-control-section">
            <h4>脚本控制</h4>
            <div class="tm-switch-container">
              <label class="tm-switch">
                <input type="checkbox" id="tm-master-switch" checked>
                <span class="tm-slider"></span>
              </label>
              <span class="tm-switch-label">脚本框架</span>
            </div>
            <button id="tm-run-all" class="tm-btn tm-btn-primary">运行所有模块</button>
          </div>
        </div>
        <div class="tm-panel__right">
          <div class="tm-modules-section">
            <h4>模块列表</h4>
            <div id="tm-modules-list"></div>
          </div>
        </div>
      </div>
      <div class="tm-panel__footer">拖拽移动 | 双击标题栏吸附边缘</div>
    </div>
  `

  document.body.appendChild(panel)

  // 默认隐藏面板
  const isVisible = storage.get('panel_visible', false)
  panel.style.display = isVisible ? 'block' : 'none'

  // 初始化面板状态
  initPanelEvents(panel, storage)

  // 更新模块列表
  updateModulesList(panel)

  // 拖拽逻辑
  dragElement(panel)
}

/**
 * 切换主面板显示/隐藏
 */
function toggleMainPanel (storage) {
  const panel = document.getElementById('tm-template-panel')
  if (!panel) return

  const isVisible = panel.style.display !== 'none'
  const newVisible = !isVisible

  panel.style.display = newVisible ? 'block' : 'none'
  storage.set('panel_visible', newVisible)

  console.log(`[TM Template] 面板${newVisible ? '已显示' : '已隐藏'}`)
}

/**
 * 初始化面板事件
 */
function initPanelEvents (panel, storage) {
  // 关闭面板按钮
  const closeBtn = panel.querySelector('#tm-close-panel')
  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none'
    storage.set('panel_visible', false)
    console.log('[TM Template] 面板已关闭')
  })

  // 面板折叠/展开
  const bodyEl = panel.querySelector('.tm-panel__body')
  const toggleBtn = panel.querySelector('#tm-toggle')
  toggleBtn.addEventListener('click', () => {
    if (bodyEl.style.display === 'none') {
      bodyEl.style.display = ''
      toggleBtn.textContent = '—'
    } else {
      bodyEl.style.display = 'none'
      toggleBtn.textContent = '+'
    }
  })

  // 主开关
  const masterSwitch = panel.querySelector('#tm-master-switch')
  const masterEnabled = storage.get('master_enabled', true)
  masterSwitch.checked = masterEnabled

  masterSwitch.addEventListener('change', (e) => {
    const enabled = e.target.checked
    storage.set('master_enabled', enabled)

    // 更新所有模块的可用状态
    const moduleItems = panel.querySelectorAll('.tm-module-item')
    moduleItems.forEach(item => {
      const moduleSwitch = item.querySelector('.tm-module-switch')
      const runBtn = item.querySelector('.tm-module-run')
      moduleSwitch.disabled = !enabled
      runBtn.disabled = !enabled
      item.classList.toggle('disabled', !enabled)
    })

    // 更新运行所有模块按钮状态
    const runAllBtn = panel.querySelector('#tm-run-all')
    runAllBtn.disabled = !enabled

    console.log(`[脚本框架] ${enabled ? '已启用' : '已禁用'}`)
  })

  // 运行所有模块按钮
  const runAllBtn = panel.querySelector('#tm-run-all')
  runAllBtn.disabled = !masterEnabled
  runAllBtn.addEventListener('click', () => {
    if (masterSwitch.checked) {
      runAllModules()
    }
  })
}

/**
 * 更新模块列表显示
 */
function updateModulesList (panel) {
  const modulesList = panel.querySelector('#tm-modules-list')
  const modules = getAllModules()
  const masterSwitch = panel.querySelector('#tm-master-switch')
  const masterEnabled = masterSwitch.checked

  if (modules.length === 0) {
    modulesList.innerHTML = '<div class="tm-no-modules">暂无模块</div>'
    return
  }

  modulesList.innerHTML = modules.map(module => {
    const fileName = module.filePath ? module.filePath.split('/').pop().replace('.js', '') : module.name
    return `
      <div class="tm-module-item ${!masterEnabled ? 'disabled' : ''}" data-module="${module.name}">
        <div class="tm-module-info">
          <div class="tm-module-name">${module.name}</div>
          <div class="tm-module-file">${fileName}.js</div>
        </div>
        <div class="tm-module-controls">
          <label class="tm-switch tm-switch-small">
            <input type="checkbox" class="tm-module-switch" ${module.enabled ? 'checked' : ''} ${!masterEnabled ? 'disabled' : ''}>
            <span class="tm-slider"></span>
          </label>
          <button class="tm-btn tm-btn-small tm-module-run" ${!masterEnabled ? 'disabled' : ''}>运行</button>
        </div>
      </div>
    `
  }).join('')

  // 绑定模块开关事件
  modules.forEach(module => {
    const moduleItem = modulesList.querySelector(`[data-module="${module.name}"]`)
    const moduleSwitch = moduleItem.querySelector('.tm-module-switch')
    const runBtn = moduleItem.querySelector('.tm-module-run')

    // 模块开关事件
    moduleSwitch.addEventListener('change', (e) => {
      const enabled = e.target.checked
      toggleModule(module.name, enabled)

      // 更新按钮状态
      runBtn.disabled = !enabled || !masterEnabled
    })

    // 运行单个模块事件
    runBtn.addEventListener('click', () => {
      if (masterEnabled && module.enabled) {
        runModule(module.name)
      }
    })

    // 初始化按钮状态
    runBtn.disabled = !module.enabled || !masterEnabled
  })
}

function dragElement (el) {
  const header = el.querySelector('.tm-panel__header')
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0

  header.onmousedown = dragMouseDown
  header.ondblclick = () => {
    // 双击标题栏吸附到右上角
    el.style.top = '20px'
    el.style.right = '20px'
    el.style.left = 'auto'
  }

  function dragMouseDown (e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  function elementDrag (e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    el.style.top = (el.offsetTop - pos2) + 'px'
    el.style.left = (el.offsetLeft - pos1) + 'px'
  }

  function closeDragElement () {
    document.onmouseup = null
    document.onmousemove = null
  }
}
