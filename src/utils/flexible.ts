let docEl = document.documentElement
let resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
const recalc = () => {
  let clientWidth = docEl.clientWidth
  if (!clientWidth) return
  docEl.style.fontSize = 16 * (clientWidth / 1920) + 'px'
}
recalc()
if (document.addEventListener) {
  window.addEventListener(resizeEvt, recalc, false)
  document.addEventListener('DOMContentLoaded', recalc, false)
}
