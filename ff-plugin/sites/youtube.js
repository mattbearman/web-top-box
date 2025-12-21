// Need to be able to escape the search box, currenlty there's no way to move the focus off with the arrow keys

window.addEventListener('load', () => {
  alert('loaded');
});

setInitialFocusedContentItemSelector(
  'a.yt-lockup-view-model__content-image'
);

setNarrowSearchContentItemSelectors(
  'div#start *' // want to be able to go from logo/hamburger to search box
);

setExcludeContentItemSelectors(
  '.yt-lockup-view-model__metadata *', // metadata below video thumbnails
  // 'ytd-ad-slot-renderer *' // ads
);