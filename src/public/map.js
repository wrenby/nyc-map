'use strict';

Function.prototype.bindArgs = function (...boundArgs) {
    const targetFunction = this;
    return function (...args) { return targetFunction.call(this, ...boundArgs, ...args); };
};

/// Basic setup

let map = L.map(
    'map', {
        minZoom: 10,
        maxZoom: 18,
        maxBounds: [[40.49709237269567, -74.58274841308595], [40.99389273551914, -73.26438903808595]],
    }
).setView([40.72397393626433, -73.95137786865236], 12);
map.zoomControl.setPosition('topright');

let tiles = L.tileLayer('https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=DPuhSkOb2lMfsIEVGlAZ',{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 10,
    maxZoom: 18,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>, Data by <a href="https://opendata.cityofnewyork.us">NYC OpenData</a>',
    crossOrigin: true
  }).addTo(map);

// ? several marker types
// ? decrease size of marker as we zoom out -- saw a stackoverflow post similar to this about geojson
// https://gis.stackexchange.com/questions/41928/adding-removing-geojson-layers-using-leaflet

// leaf icon
let marker = new L.Icon({
    iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png',
    shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png',
    iconSize:     [38, 95],
    shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
});

let sidebar = L.control.sidebar('sidebar').addTo(map);

/// GeoJSON stuff

function onEachFeature(label, feature, layer) {
    if (feature.properties) {
        let props = feature.properties;
        // add a popup to the marker
        let popupContent = `<p><b>${feature.properties.name}</b>`
            + `<br />${label}</p>`
            + `<p>Address: ${props.address ? props.address : "Unknown"}`
            // + `<p>Contact: ${props.contact ? props.contact : "Unknown"}</p>`
            + `<br />Borough: ${props.Borough ? props.Borough : "Unknown"}</p>`;

            // TODO: use some kind of unique identifier instead of name -- this leads to conflicts for recycling bins with several
            // see https://gis.stackexchange.com/a/61202
            //+ `<p><a class="showmore" href="#details" onclick="infoControl.update('${feature.properties.name}')">Show More</a></p>`;
        layer.bindPopup(popupContent);
    }
}

let datasets = new Map();
let layers = new Map();
datasets.set("bins", "Public Recycling Bins");
datasets.set("textile", "Textile Drop-Off");
datasets.set("food", "Food Drop-Off");
datasets.set("leaf", "Leaf Drop-Off");
datasets.set("electronics", "Electronics Drop-Off");

for (const [ugly, pretty] of datasets.entries()) {
    $.getJSON(`data/${ugly}.geojson`, function(json) {
        let layer = L.geoJSON(json, {
            pointToLayer: function(feature, latlng) {
                // TODO: would be nice if we had bounding boxes in addition to lat/lng... probably possible to get with OSM API, but not a priority
                if (feature.geometry.type == "Point") {
                    return L.marker(latlng, {icon: marker});
                } else {
                    console.error(`ERROR: unsupported feature geometry ${feature.geometry.type} on item ${feature.properties}`);
                }
            },
            onEachFeature: onEachFeature.bindArgs(pretty)
        });
        layers.set(ugly, layer);
    });
}

// Popup explaining why none of the data is visible onload
L.Control.Guide = L.Control.extend({
    onAdd: function (map) {
        this._map = map;
        this._div = L.DomUtil.create('div', 'guide');
        this._div.innerHTML = "<p><b>To begin,</b><br /><br />click one of the icons in the sidebar (left)</p>";
        return this._div;
    },
    addTo: function (map) {
        this._div = this.onAdd(map);
        map.getContainer().appendChild(this._div);
        return this;
    },
    hide: function () {
        this._div.style.display = "none";
        return this;
    },
    show: function () {
        this._div.style.display = "block";
        return this;
    }
});

L.control.guide = function (options) {
    return new L.Control.Guide(options);
}

let guide = L.control.guide().addTo(map);

// Layer visibility controlled through the sidebar now
let activeLayer = null;
function selectLayer(ugly) {
    if (activeLayer != ugly) {
        if (activeLayer) {
            map.removeLayer(layers.get(activeLayer));
        }
        map.addLayer(layers.get(ugly));
        activeLayer = ugly;
        guide.hide();
    }
}
for (const ugly of datasets.keys()) {
    $(`#${ugly}`).click(() => {
        selectLayer(ugly);
    });
}
