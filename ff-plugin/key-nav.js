// Weird diagonal focus on moving up was due to latent mouse position - maybe disable all mouse hover events?

// maybe keep track of last focused item per direction to improve navigation?

// let focusedItem = null;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

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
let focusedItemBounds = null;

function setFocussedItem(item) {
  focusedItem = item;
  focusedItemBounds = focusedItem.getBoundingClientRect();
  focusedItem.focus();
}

function setInitialFocusedContentItemSelector(selector) {
  const item = document.querySelector(selector);
  
  if (item != null) {
    setFocussedItem(item);
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
    // TODO: precalculate this?
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

// === This is a work in progress function, I think it's gonna replace findNearestContentItem (?) === \\
// when moving up and down, prioritise items that are closer in the up/down direction somehow
function findNearestFocussable(direction) {
  let measureFromEdge = null;
  let nextItem = null;
  let minDistance = Infinity;

  switch (direction) {
    case UP:
      measureFromEdge = 'down';
      break;

  const measureFrom = elementEdgeCenterPos(focusedItemBounds, measureFromEdge);

  contentItems.forEach((item) => {
    if (item === focusedItem || item.checkVisibility({contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true}) === false) {
      return;
    }

    if (item.matches(excludedContentItemSelectors)) {
      return;
    }

    const itemBounds = item.getBoundingClientRect();

    switch (direction) {
      case UP:
        if (itemBounds.top >= focusedItemBounds.top) {
          return;
        }
        break;

      case DOWN:
        if (itemBounds.bottom <= focusedItemBounds.bottom) {
          return;
        }
        break;

      case LEFT:
        if (itemBounds.left >= focusedItemBounds.left) {
          return;
        }

        // Exclude items that are not horizontally aligned with the focused item
        if (!boundsAlignedHorizontally(focusedItemBounds, itemBounds)) {
          return;
        }

        break;

      case RIGHT:
        if (itemBounds.right <= focusedItemBounds.right) {
          return;
        }

        // Exclude items that are not horizontally aligned with the focused item
        if (!boundsAlignedHorizontally(focusedItemBounds, itemBounds)) {
          return;
        }

        break;
    }

    const itemPos = elementEdgeCenterPos(itemBounds, measureToEdge);
    const distance = Math.hypot(itemPos.x - measureFromEdge.x, itemPos.y - measureFromEdge.y);
      
    if (distance < minDistance) {
      minDistance = distance;
      nextItem = item;
    }
  });

  return nextItem;
}

function boundsAlignedHorizontally(bounds1, bounds2) {
  if (
    (bounds1.top <= bounds2.top && bounds1.bottom <= bounds2.top)
    ||
    (bounds1.top >= bounds2.bottom && bounds1.bottom >= bounds2.bottom)
  ) {
    return false;
  }

  return true;
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
  
  setFocussedItem(nextItem);

  // scroll page to put focused item in the center of the viewport vertically
  const focusedItemCenter = elementCenterPos(focusedItem);
  const viewportCenter = window.scrollY + (window.innerHeight / 2);
  const scrollAmount = focusedItemCenter.y - viewportCenter;

  if (scrollAmount !== 0) {
    window.scrollBy({ top: scrollAmount, left: 0, behavior: 'smooth' });
  }
});
