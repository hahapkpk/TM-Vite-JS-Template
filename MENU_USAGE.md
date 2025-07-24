# TM Template - Tampermonkey 菜单集成使用说明

## 🎯 功能概述

TM Template 现在支持通过 Tampermonkey 菜单控制管理面板的显示/隐藏，避免在页面上显示图标遮挡内容。

## 📋 功能特性

### 1. Tampermonkey 菜单集成
- ✅ 在 Tampermonkey 菜单中添加"显示管理面板"/"隐藏管理面板"选项
- ✅ 支持快捷键 `P` 快速切换面板显示状态
- ✅ 菜单文本会根据当前面板状态动态更新（需要刷新页面）

### 2. 备选方案
- ✅ 当 `GM_registerMenuCommand` 不可用时，自动创建页面右上角的圆形按钮
- ✅ 确保在任何环境下都能正常使用

### 3. 状态记忆
- ✅ 面板显示状态会被保存到 localStorage
- ✅ 页面刷新后保持上次的显示状态

## 🚀 安装和使用

### 步骤 1：安装脚本
1. 确保已安装 Tampermonkey 扩展
2. 访问：`http://127.0.0.1:5176/dist/tm-vite-js-template.user.js`
3. 点击"安装"按钮

### 步骤 2：使用菜单控制
1. 在任意网页上，点击 Tampermonkey 图标
2. 在菜单中找到"显示管理面板"或"隐藏管理面板"选项
3. 点击即可切换面板显示状态
4. 也可以使用快捷键 `P` 快速切换

### 步骤 3：备选按钮（如果需要）
- 如果菜单功能不可用，会在页面右上角显示蓝色圆形按钮
- 点击按钮同样可以控制面板显示/隐藏

## 🔧 技术实现

### 核心代码修改

1. **vite.config.js** - 添加 GM_registerMenuCommand 权限：
```javascript
grant: ['GM_getValue', 'GM_setValue', 'GM_addStyle', 'GM_registerMenuCommand']
```

2. **src/ui/panel.js** - 菜单注册逻辑：
```javascript
function registerTampermonkeyMenu(storage) {
  if (typeof GM_registerMenuCommand === 'undefined') {
    console.warn('[TM Template] GM_registerMenuCommand 不可用，将创建页面按钮作为备选方案')
    createFallbackButton(storage)
    return
  }

  const isVisible = storage.get('panel_visible', false)
  
  GM_registerMenuCommand(
    isVisible ? '隐藏管理面板' : '显示管理面板',
    () => {
      toggleMainPanel(storage)
      updateMenuCommand(storage)
    },
    'p' // 快捷键
  )
}
```

### 兼容性处理
- ✅ 自动检测 `GM_registerMenuCommand` 是否可用
- ✅ 不可用时自动降级到页面按钮方案
- ✅ 开发环境和生产环境都能正常工作

## 📝 测试验证

### 开发环境测试
1. 运行 `npm run dev`
2. 访问 `http://127.0.0.1:5176/test.html`
3. 应该看到备选按钮（因为开发环境没有 GM 函数）

### 生产环境测试
1. 运行 `npm run build`
2. 安装生成的 `.user.js` 文件到 Tampermonkey
3. 访问任意网页，检查 Tampermonkey 菜单

### 预期结果
- ✅ Tampermonkey 菜单中出现相应选项
- ✅ 点击菜单项可以切换面板显示
- ✅ 快捷键 `P` 可以快速切换
- ✅ 面板状态在页面刷新后保持
- ✅ 如果菜单不可用，显示备选按钮

## 🎉 优势

1. **无界面干扰**：不在页面上显示任何图标，避免遮挡内容
2. **原生集成**：完全集成到 Tampermonkey 的原生菜单系统
3. **快捷操作**：支持快捷键快速切换
4. **向后兼容**：在不支持的环境下自动降级到按钮方案
5. **状态持久**：面板状态会被记住，用户体验更好

## 📚 相关文件

- `src/ui/panel.js` - 主要实现逻辑
- `vite.config.js` - 权限配置
- `dist/tm-vite-js-template.user.js` - 构建后的用户脚本
- `test.html` - 测试页面

---

现在您的 Tampermonkey 脚本已经完美集成了菜单控制功能！🎊
