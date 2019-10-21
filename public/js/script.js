/* eslint-disable */

// Add a a polyfill for the 'details' HTML5 element for older browsers
if (typeof Promise !== 'function' && document.querySelector('details') !== null) {
  document.write('<script src="/js/details-element-polyfill.js"></script>')
}

// Find all of the links with the 'button' role and add a click event to them
var elements = document.querySelectorAll('a[role="button"]')
for (var i = 0, len = elements.length; i < len; i++) {
  elements[i].addEventListener('keydown', function(e) {
    if (e.keyCode == 32) {
      e.target.click()
    }
  })
}
