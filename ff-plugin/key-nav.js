// Weird diagonal focus on moving up was due to latent mouse position - maybe disable all mouse hover events?

// maybe keep track of last focused item per direction to improve navigation?

// let focusedItem = null;

let debugSearchArea = null;

// debugSearchArea = document.createElement('div');
// debugSearchArea.style.position = 'absolute';
// debugSearchArea.style.border = '1px solid red';
// debugSearchArea.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
// debugSearchArea.style.zIndex = '9999';
// document.body.appendChild(debugSearchArea);

// Default content item selectors
let contentItemSelectors = 'a, button, input, textarea, select, [role="button"], [role="link"], [tabindex="0"]';
let contentItems = document.querySelectorAll(contentItemSelectors);

let narrowSearchContentItemSelectors, excludedContentItemSelectors;

let focusedItem = contentItems.length > 0 ? contentItems[0] : null;

function setInitialFocusedContentItemSelector(selector) {
  const item = document.querySelector(selector);

  debugger
  
  if (item != null) {
    focusedItem = item;
    focusedItem.focus();
  }
}

function setContentItemSelectors() {
  if (arguments.length === 0) {
    return;
  }

  contentItemSelectors = `${contentItemSelectors}, ${Array.from(arguments).join(', ')}`;
  contentItems = document.querySelectorAll(contentItemSelectors);
}

function setNarrowSearchContentItemSelectors() {
  if (arguments.length === 0) {
    return;
  }

  narrowSearchContentItemSelectors = Array.from(arguments).join(', ');
}

function setExcludeContentItemSelectors() {
  if (arguments.length === 0) {
    return;
  }

  excludedContentItemSelectors = Array.from(arguments).join(', ');
}

function findNearestContentItem(bounds, measureFrom, measureToEdge) {
  if (debugSearchArea != null) {
    debugSearchArea.style.left = `${bounds.left}px`;
    debugSearchArea.style.top = `${bounds.top}px`;
    debugSearchArea.style.width = `${bounds.right - bounds.left}px`;
    debugSearchArea.style.height = `${bounds.bottom - bounds.top}px`;
  }

  let nextItem = null;
  let minDistance = Infinity;

  contentItems.forEach((item) => {
    if (item === focusedItem || item.checkVisibility({contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true}) === false) {
      return;
    }

    if (item.matches(excludedContentItemSelectors)) {
      return;
    }

    const itemPos = elementEdgeCenterPos(item.getBoundingClientRect(), measureToEdge);

    if (itemPos.x >= bounds.left && itemPos.x <= bounds.right && itemPos.y >= bounds.top && itemPos.y <= bounds.bottom) {
      const distance = Math.hypot(itemPos.x - measureFrom.x, itemPos.y - measureFrom.y);
      
      if (distance < minDistance) {
        minDistance = distance;
        nextItem = item;
      }
    }
  });

  return nextItem;
}

function elementCenterPos(element) {
  const pos = element.getBoundingClientRect();

  return {
    x: Math.round(pos.left + (pos.width / 2) + window.scrollX),
    y: Math.round(pos.top + (pos.height / 2) + window.scrollY)
  };
}

function elementEdgeCenterPos(elementBounds, direction) {
  switch (direction) {
    case 'left':
      return {
        x: Math.round(elementBounds.left + window.scrollX),
        y: Math.round(elementBounds.top + (elementBounds.height / 2) + window.scrollY)
      };
    case 'right':
      return {
        x: Math.round(elementBounds.right + window.scrollX),
        y: Math.round(elementBounds.top + (elementBounds.height / 2) + window.scrollY)
      };
    case 'up':
      return {
        x: Math.round(elementBounds.left + (elementBounds.width / 2) + window.scrollX),
        y: Math.round(elementBounds.top + window.scrollY)
      };
    case 'down':
      return {
        x: Math.round(elementBounds.left + (elementBounds.width / 2) + window.scrollX),
        y: Math.round(elementBounds.bottom + window.scrollY)
      };
  }
}

window.addEventListener('keydown', (event) => {
  contentItems = document.querySelectorAll(contentItemSelectors);

  let nextItem = null;
  
  if (focusedItem == null) {
    nextItem = contentItems[0];
  }

  else {
    const focusedBounds = focusedItem.getBoundingClientRect();
    
    let bounds = {
      left: window.scrollX,
      right: window.scrollX + window.innerWidth,
      top: window.scrollY,
      bottom: window.scrollY + window.innerHeight
    };
    let measureFromEdge = null;
    let measureToEdge = null;

    switch (event.key) {
      case 'ArrowRight':
        measureFromEdge = 'right';
        measureToEdge = 'left';
        bounds.left = Math.round(focusedBounds.right + window.scrollX);

        if (focusedItem.matches(narrowSearchContentItemSelectors)) {
          bounds.top = Math.round(focusedBounds.top + window.scrollY);
          bounds.bottom = Math.round(focusedBounds.bottom + window.scrollY);
        }
        break;

      case 'ArrowLeft':
        measureFromEdge = 'left';
        measureToEdge = 'right';
        bounds.right = Math.round(focusedBounds.left + window.scrollX);

        if (focusedItem.matches(narrowSearchContentItemSelectors)) {
          bounds.top = Math.round(focusedBounds.top + window.scrollY);
          bounds.bottom = Math.round(focusedBounds.bottom + window.scrollY);
        }
        break;

      case 'ArrowDown':
        measureFromEdge = 'down';
        measureToEdge = 'up';
        bounds.top = Math.round(focusedBounds.bottom + window.scrollY);
        break;

      case 'ArrowUp':
        measureFromEdge = 'up';
        measureToEdge = 'down';
        bounds.bottom = Math.round(focusedBounds.top + window.scrollY);
        break;

      default:
        return;
    }

    const measureFrom = elementEdgeCenterPos(focusedBounds, measureFromEdge);
    nextItem = findNearestContentItem(bounds, measureFrom, measureToEdge);
    console.log(focusedItem, nextItem, bounds, measureFrom, measureFromEdge, measureToEdge);

    event.preventDefault();
  }

  if (nextItem == null) {
    return;
  }
  
  focusedItem = nextItem;
  focusedItem.focus();

  // scroll page to put focused item in the center of the viewport vertically
  const focusedItemCenter = elementCenterPos(focusedItem);
  const viewportCenter = window.scrollY + (window.innerHeight / 2);
  const scrollAmount = focusedItemCenter.y - viewportCenter;

  if (scrollAmount !== 0) {
    window.scrollBy({ top: scrollAmount, left: 0, behavior: 'smooth' });
  }
});
