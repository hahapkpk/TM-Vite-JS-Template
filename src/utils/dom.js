export function createEl (tag, props = {}, children = []) {
  const el = document.createElement(tag)
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v)
    } else if (k.startsWith('on') && typeof v === 'function') {
      el[k] = v
    } else if (k in el) {
      el[k] = v
    } else {
      el.setAttribute(k, v)
    }
  })
  ;(Array.isArray(children) ? children : [children]).forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child))
    else if (child instanceof Node) el.appendChild(child)
  })
  return el
}
