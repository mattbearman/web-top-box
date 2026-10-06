const CONTENT_ITEM_SELECTOR = 'a, button, input, textarea, select, [role="button"], [role="link"], [tabindex="0"]';

const DIR_UP = 'ArrowUp';
const DIR_DOWN = 'ArrowDown';
const DIR_LEFT = 'ArrowLeft';
const DIR_RIGHT = 'ArrowRight';
const DIR_VERTICAL = [DIR_UP, DIR_DOWN];
const DIR_HORIZONTAL = [DIR_LEFT, DIR_RIGHT];
const DIRECTIONS = DIR_VERTICAL.concat(DIR_HORIZONTAL);

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let focusedItem = null;

window.addEventListener('keydown', (event) => {
  // Make sure an arrow key was pressed before continuing
  if (!DIRECTIONS.includes(event.key)) {
    return;
  }

  event.preventDefault();

  contentItems = document.querySelectorAll(contentItemSelectors);

  // if nothing is currently focussed, focus the first content itme no matter what direction was pressed
  if (focusedItem == null) {
    setFocussedItem(contentItems[0]);

    return;
  }

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

    case DIR_DOWN:
      nextItem = findNearestVerticalContentItem(DIR_DOWN);
      // measureFromEdge = 'down';
      // measureToEdge = 'up';
      // bounds.top = Math.round(focusedBounds.bottom + window.scrollY);
      break;

    case DIR_UP:
      nextItem = findNearestVerticalContentItem(DIR_UP);
      // measureFromEdge = 'up';
      // measureToEdge = 'down';
      // bounds.bottom = Math.round(focusedBounds.top + window.scrollY);
      break;

    default:
      return;
  }

  // const measureFrom = elementEdgeCenterPos(focusedBounds, measureFromEdge);
  // let nextItem = findNearestContentItem(bounds, measureFrom, measureToEdge);
  console.log(focusedItem, nextItem, bounds, measureFrom, measureFromEdge, measureToEdge);


  // if (nextItem == null) {
  //   return;
  // }
  
  setFocussedItem(nextItem);

  // // scroll page to put focused item in the center of the viewport vertically
  // const focusedItemCenter = elementCenterPos(focusedItem);
  // const viewportCenter = window.scrollY + (window.innerHeight / 2);
  // const scrollAmount = focusedItemCenter.y - viewportCenter;

  // if (scrollAmount !== 0) {
  //   window.scrollBy({ top: scrollAmount, left: 0, behavior: 'smooth' });
  // }
});

// Finds the item in the specified vertical direction that is closest vertically, using horizontal as a tie breaker
function findNearestVerticalContentItem(direction) {
  if (!DIR_VERTICAL.includes(direction)) {
    throw new Error(`Invalid direction ${direction} passed to findNearestVerticalContentItem`);
  }

  // Find the point at the center of the focussed item's top edge when searching up, or bottom edge when searching down
  const measureFrom = elementEdgeCenterPos(focusedItem, direction);

  let nextItem = null;
  let minDistance = Infinity;

  contentItems.forEach((item) => {
    if (item === focusedItem) return;

    if (item.checkVisibility({contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true}) === false) return;

    // if (item.matches(excludedContentItemSelectors)) return;

    // measure to the nearest edge in the direction we're moving
    // eg: if moving up, measure to the bottom edge, if moving down, measure to the top edge
    const measureTo = elementEdgeCenterPos(item, direction === DIR_UP ? DIR_DOWN : DIR_UP);

    

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

function elementEdgeCenterPos(element, direction) {
  const elementBounds = element.getBoundingClientRect();

  switch (direction) {
    case DIR_LEFT:
      return new Point(
        Math.round(elementBounds.left + window.scrollX),
        Math.round(elementBounds.top + (elementBounds.height / 2) + window.scrollY)
      );
    case DIR_RIGHT:
      return new Point(
        Math.round(elementBounds.right + window.scrollX),
        Math.round(elementBounds.top + (elementBounds.height / 2) + window.scrollY)
      );
    case DIR_UP:
      return new Point(
        Math.round(elementBounds.left + (elementBounds.width / 2) + window.scrollX),
        Math.round(elementBounds.top + window.scrollY)
      );
    case DIR_DOWN:
      return new Point(
        Math.round(elementBounds.left + (elementBounds.width / 2) + window.scrollX),
        Math.round(elementBounds.bottom + window.scrollY)
      );
  }
}

function getSearchSpace(direction) {
  switch (direction) {
    case DIR_UP:
      // search space is from top of focused item to top of view port, full width
      break;

    case DIR_DOWN:
      // search space is from bottom of focused item to bottom of view port, full width
      break;

    case DIR_LEFT:
      // search space is from left of focused item to left of view port, full width
  }
}

function setFocussedItem(item) {
  if (item == null) return;

  focusedItem = item;
  focusedItemBounds = focusedItem.getBoundingClientRect();
  focusedItem.focus();
}

function scrollToFocussedItem() {
  // scroll page to put focused item in the center of the viewport vertically
  const focusedItemCenter = elementCenterPos(focusedItem);
  const viewportCenter = window.scrollY + (window.innerHeight / 2);
  const scrollAmount = focusedItemCenter.y - viewportCenter;

  if (scrollAmount !== 0) {
    window.scrollBy({ top: scrollAmount, left: 0, behavior: 'smooth' });
  }
}