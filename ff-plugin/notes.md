# Webtop Box
_Or a better name_

## Dev

Think key-nav is the current best version, spatial nav was possibly a spike? Try both and see

## Spatial Navigation

Vertial and horizonal navigation are treated differently due to how (almost) all webages are nvaigated vertically. Need to ensure there's no way for an element to be unreachable

Due to how webpages tend to be vertically stacked rows, when moving up and down it must prioritize minimal vertical movement, ie: don't skip over an entire row in order to reach something that is more "directly" above or below.

When moving left and right, minimal vertical movement is also desired, as UIs will likely have rows of items.

 - a weighted distance could be calculated where vertical distance suffers a multiplier/exponential
 - Or maybe find closest vertically and use horizontal distance as a tie breaker (for vertical movement)

For vertical movement:
 - Find item with shortest vertical distance in the correct direction vertical
 - Use horizontal distance as a tie breaker

For horizontal movement:
 - Find nearest item that overlaps horizontally

So mostly the same, just changes the search space

