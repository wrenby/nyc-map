High Priority
---

Some kind of proximity search
 - "Go to borough" feature
 - Browser geolocation access? Probably a bootstrap icon for this but not sure how to integrate it into the UI
 - Proximity is probably more important than borough

Some way to reduce clutter (gross to look at, and the number of markers is causing lag)
 - Suggestions welcome
 - Cluster nearby markers: https://github.com/Leaflet/Leaflet.markercluster
 - COMPLETE: Start with all layers invisible; toggle them on with the sidebar or layers control to view
 - Make the markers smaller when zoomed out

Filtering layers feels unresponsive
 - Partially a design flaw in Leaflet: https://github.com/Leaflet/Leaflet/issues/4277
 - Panes are supposed to solve this problem but I can't get them working
   - Even if I could, it might make map navigation less responsive in turn
   - And I'd have to give up marker shadows https://github.com/Leaflet/Leaflet/issues/4#issuecomment-358930860
 - One layer, asynchronously recraeted from file? https://github.com/calvinmetcalf/leaflet-ajax


Low Priority
---

How to handle locations which offer more than one service?
 - Are there even locations like this? Need to run a search.

Add a border defining the extents of our data

Automate data updates
