// registerContentItemSelectors(
//   'button.lnk',
//   'a.lnk',
//   'a.button',
//   '.channels-nav a',
//   '.categories-sub-nav a',
//   'a.contained-button',
//   'button.content-rotator__entity'
// );

setInitialFocusedContentItemSelector(
  'a.content-item-root'
);

setNarrowSearchContentItemSelectors(
  'a.content-item-root'
);

setExcludeContentItemSelectors(
  '.carrousel__arrows *', // carrousel auto scrolls when off screen item is focused
)
