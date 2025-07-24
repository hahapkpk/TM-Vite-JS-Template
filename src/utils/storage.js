/**
 * 基于 GM_getValue / GM_setValue 的封装
 */
export class GMStorage {
  constructor (prefix = '') {
    this.prefix = prefix
  }
  _key (k) {
    return this.prefix + k
  }
  get (key, def = null) {
    try {
      return GM_getValue(this._key(key), def)
    } catch (e) {
      console.warn('GM_getValue failed, fallback localStorage', e)
      const v = localStorage.getItem(this._key(key))
      return v ? JSON.parse(v) : def
    }
  }
  set (key, value) {
    try {
      GM_setValue(this._key(key), value)
    } catch (e) {
      console.warn('GM_setValue failed, fallback localStorage', e)
      localStorage.setItem(this._key(key), JSON.stringify(value))
    }
  }
}
