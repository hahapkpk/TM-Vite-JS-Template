// src/modules/testHello.js
export default function testHello ({ storage }) {
  const name = 'testHello'
  return {
    name,
    run () {
      // 统计运行次数
      const count = storage.get('hello_count', 0) + 1
      storage.set('hello_count', count)

      alert(`Hello from Tampermonkey!\n这是第 ${count} 次运行。\n当前页面：${location.href}`)

      // 在页面右下角放一个提示按钮
      const btn = document.createElement('button')
      btn.textContent = 'Hello按钮'
      Object.assign(btn.style, {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 99999,
        padding: '6px 12px',
        border: 'none',
        borderRadius: '6px',
        background: '#4f8ef7',
        color: '#fff',
        cursor: 'pointer'
      })
      btn.onclick = () => alert('按钮被点击了！')
      document.body.appendChild(btn)

      console.log(`[${name}] 已运行，count=${count}`)
    }
  }
}
