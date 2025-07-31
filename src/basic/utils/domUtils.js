export function getElementById(id) {
  return document.getElementById(id);
}

export function querySelector(element, selector) {
  return element.querySelector(selector);
}

export function querySelectorAll(element, selector) {
  return element.querySelectorAll(selector);
}

export function createElement(tagName) {
  return document.createElement(tagName);
}

export function appendChildToParent(parent, child) {
  parent.appendChild(child);
}

export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export function setTextContent(element, text) {
  if (element) {
    element.textContent = text;
  }
}

export function setInnerHTML(element, html) {
  if (element) {
    element.innerHTML = html;
  }
}

export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

export function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

export function setStyle(element, property, value) {
  if (element) {
    element.style[property] = value;
  }
}

export function getAttribute(element, attribute) {
  return element ? element.getAttribute(attribute) : null;
}

export function setAttribute(element, attribute, value) {
  if (element) {
    element.setAttribute(attribute, value);
  }
}

export function addEventListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}