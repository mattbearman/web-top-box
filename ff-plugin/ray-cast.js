// const contentItemSelector = 'a.content-item-root'; // iplayer
const contentItemSelector = 'a.yt-lockup-view-model__content-image'; // yt
const contentItems = document.querySelectorAll(contentItemSelector);
let focusedItem = null;

function findNextContentItem(xStep, yStep) {
  const focusedPos = focusedItem.getBoundingClientRect();
  const midX = Math.round(focusedPos.left + (focusedPos.width / 2));
  const midY = Math.round(focusedPos.top + (focusedPos.height / 2));

  let testingX = midX;
  let testingY = midY;
  let searching = true;

  while (true)  {
    testingX += xStep;
    testingY += yStep;

    const elements = document.elementsFromPoint(testingX, testingY);
    if (elements.length === 0) {
      console.log(`no next element found, reached ${testingX}, ${testingY}`);
      return;
    }
    
    for (i = 0; i < elements.length; i++) {
      if (elements[i] !== focusedItem && elements[i].matches(contentItemSelector)) {
        console.log(`found next element at ${testingX}, ${testingY}`);
        focusedItem = elements[i];
        return;
      }
    }

    if (testingX < 0 || testingX > window.innerWidth || testingY < 0 || testingY > window.innerHeight) {
      console.log(`no next element found, reached edge of viewport at ${testingX}, ${testingY}`);
      return;
    }
  }
}

window.addEventListener('keydown', (event) => {
  if (focusedItem == null) {
    focusedItem = contentItems[0];
  }

  else {
    switch (event.key) {
      case 'ArrowRight':
        findNextContentItem(1, 0);
        break;

      case 'ArrowLeft':
        findNextContentItem(-1, 0);
        break;

      case 'ArrowDown':
        findNextContentItem(0, 1);
        break;

      case 'ArrowUp':
        findNextContentItem(0, -1);
        break;
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
