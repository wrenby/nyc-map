Short term
---

Some kind of proximity search
 - "Go to borough" feature
 - Browser geolocation access? Probably a bootstrap icon for this but not sure how to integrate it into the UI
 - Proximity is probably more important than borough

Some way to reduce clutter (gross to look at, and the number of markers is causing lag)
 - Group nearby markers
 - Start with all layers invisible; toggle them on with the sidebar or layers control to view
 - Make the markers smaller when zoomed out
 - Any technique probably relies on `map.on('zoomend')`

Add a border defining the extents of our data

How to handle locations which offer more than one service
 - Are there even locations like this? Need to run a search.

Long term
---

Automate data updates
