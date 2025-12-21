const contentItemSelector = 'a.content-item-root'; // iplayer
// const contentItemSelector = 'a.yt-lockup-view-model__content-image'; // yt
const contentItems = document.querySelectorAll(contentItemSelector);
let focusedItem = null;

function findNearestContentItem(bounds, measureFrom) {
  let nextItem = null;
  let minDistance = Infinity;

  contentItems.forEach((item) => {
    if (item === focusedItem) {
      return;
    }

    const itemPos = item.getBoundingClientRect();

    if (itemPos.left >= bounds.left && itemPos.left <= bounds.right && itemPos.top >= bounds.top && itemPos.top <= bounds.bottom) {
      const measureTo = elementCenterPos(item);
      const distance = Math.hypot(measureTo.x - measureFrom.x, measureTo.y - measureFrom.y);
      
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
    x: Math.round(pos.left + (pos.width / 2)),
    y: Math.round(pos.top + (pos.height / 2))
  };
}

window.addEventListener('keydown', (event) => {
  if (focusedItem == null) {
    focusedItem = contentItems[0];
  }

  else {
    const focusedBounds = focusedItem.getBoundingClientRect();
    
    let nextItem = null;
    let bounds = null;
    let measureFrom = elementCenterPos(focusedItem);;

    switch (event.key) {
      case 'ArrowRight':
        bounds = {
          left: Math.round(focusedBounds.right),
          right: window.innerWidth,
          top: window.scrollY,
          bottom: window.scrollY + window.innerHeight
        };

        // nextItem = findNearestContentItem(
        //   {
        //     left: focusedBounds.right,
        //     right: window.innerWidth,
        //     top: window.scrollY,
        //     bottom: window.scrollY + window.innerHeight
        //   },
        //   elementCenterPos(focusedItem)
        // );
        // const minX = focusedItem.getBoundingClientRect().right;
        // const maxX = window.innerWidth;
        // let nextItem = null;
        // let minDistance = Infinity;

        // contentItems.forEach((item) => {
        //   const itemPos = item.getBoundingClientRect();
        //   if (itemPos.left >= minX && itemPos.left < maxX) {
        //     const distance = Math.hypot(itemPos.left - focusedItem.getBoundingClientRect().left, itemPos.top - focusedItem.getBoundingClientRect().top);
        //     if (distance < minDistance) {
        //       minDistance = distance;
        //       nextItem = item;
        //     }
        //   }
        // });
        // findNextContentItem(1, 0);
        break;

      case 'ArrowLeft':
        bounds = {
          left: window.scrollX,
          right: Math.round(focusedBounds.left),
          top: window.scrollY,
          bottom: window.scrollY + window.innerHeight
        };
        // findNextContentItem(-1, 0);
        break;

      case 'ArrowDown':
        // findNextContentItem(0, 1);
        break;

      case 'ArrowUp':
        // findNextContentItem(0, -1);
        break;
    }

    nextItem = findNearestContentItem(bounds, measureFrom);
    if (nextItem) {
      focusedItem = nextItem;
    }
  }
  focusedItem.focus();

  // scroll page to put focused item in the center of the viewport vertically
  const focusedPos = focusedItem.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const focusedItemCenter = focusedPos.top + focusedPos.height / 2;
  const viewportCenter = viewportHeight / 2;
  const scrollAmount = focusedItemCenter - viewportCenter;

  window.scrollBy({ top: scrollAmount, left: 0, behavior: 'smooth' });


  event.preventDefault();
});
