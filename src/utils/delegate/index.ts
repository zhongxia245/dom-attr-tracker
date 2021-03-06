// 被TS eslint 报错搞死，先不检查
// @ts-nocheck

import closest from './closest'

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
  return function(e) {
    e.delegateTarget = closest(e.target, selector)

    if (e.delegateTarget) {
      callback.call(element, e)
    }
  }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
  let listenerFn = listener.apply(this, arguments)

  element.addEventListener(type, listenerFn, useCapture)

  return {
    destroy: function() {
      element.removeEventListener(type, listenerFn, useCapture)
    }
  }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
export function delegate(elements, selector, type, callback, useCapture = false) {
  // Handle the regular Element usage
  if (typeof elements.addEventListener === 'function') {
    return _delegate.apply(null, arguments)
  }

  // Handle Element-less usage, it defaults to global delegation
  if (typeof type === 'function') {
    // Use `document` as the first parameter, then apply arguments
    // This is a short way to .unshift `arguments` without running into deoptimizations
    return _delegate.bind(null, document).apply(null, arguments)
  }

  // Handle Selector-based usage
  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements)
  }

  // Handle Array-like based usage
  return Array.prototype.map.call(elements, function(element) {
    return _delegate(element, selector, type, callback, useCapture)
  })
}

/**
 * 元素是否显示再可视窗口中
 * @param {Element} el 元素
 * @param {boolean} partiallyVisible 部分展示
 */
export function elementIsVisibleInViewport(el: Element, partiallyVisible = false) {
  const { top, left, bottom, right } = el.getBoundingClientRect()
  // 部分展示就返回true
  if (partiallyVisible) {
    return (
      ((top >= 0 && top <= innerHeight) || (bottom >= 0 && bottom <= innerHeight)) &&
      ((left >= 0 && left <= innerWidth) || (right >= 0 && right <= innerWidth))
    )
  } else {
    // 全部在屏幕内，才算true
    return top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth
  }
}
