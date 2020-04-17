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
map.zoomControl.setPosition('bottomright');

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
})

let sidebar = L.control.sidebar('sidebar').addTo(map);

// Create a UI element that shows information upon clicking the "Show More" link
// TODO: right now I don't think we have enough data to justify a second-tier popup
// let info = new Map();
// let infoControl = L.control({position:'topright'});

// infoControl.onAdd = function (_map) {
// 	this._div = L.DomUtil.create('div', 'info');
// 	this.hide();
// 	return this._div;
// };

// // TODO: call when the popup is defocused or closed; currently no way to hide this
// infoControl.hide = function () {
//     this._div.style = "display: none";
// }

// infoControl.show = function () {
//     this._div.style = "display: unset";
// }

// infoControl.update = function (name) {
//     let props = info.get(name);
//     if (props) {
//         this.show();
//         this._div.innerHTML = `<p><b>${props.name ? props.name : "About"}</b></p>`
//         + `<p>Address: ${props.address ? props.address : "Unknown"}</p>`
//         // + `<p>Contact: ${props.contact ? props.contact : "Unknown"}</p>`
//         + `<p>Borough: ${props.Borough ? props.Borough : "Unknown"}</p>`;
//         $(".leaflet-popup").focusout(infoControl.hide).bind(this); // BROKEN; infoContro.hide.this is undefined
//     } else {
//         this.hide();
//     }
// };
// infoControl.addTo(map);

// ! this should be phased out in favor of a more accurate and usable search feature
let controlLayers = L.control.layers().addTo(map);

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
            //+ `<p><a class="showmore" href="#details" onclick="infoControl.update('${feature.properties.name}')">Show More</a></p>`;
        layer.bindPopup(popupContent);
    }
}

let files = new Map();
let layers = new Map();
files.set("Public Recycling Bins", "data/bins.geojson");
files.set("Textile Drop-Off", "data/textile.geojson");
files.set("Food Drop-Off", "data/food.geojson");
files.set("Leaf Drop-Off", "data/leaf.geojson");
files.set("Electronics Drop-Off", "data/electronics.geojson");

for (const [label, file] of files.entries()) {
    $.getJSON(file, function(json) {
        let layer = L.geoJSON(json, {
            pointToLayer: function(feature, latlng) {
                // TODO: would be nice if we had bounding boxes in addition to lat/lng... probably possible to get with OSM API, but not a priority
                if (feature.geometry.type == "Point") {
                    return L.marker(latlng, {icon: marker});
                } else {
                    console.error(`ERROR: unsupported feature geometry ${feature.geometry.type} on item ${feature.properties}`);
                }
            },
            onEachFeature: onEachFeature.bindArgs(label)
        }).addTo(map);

        // wait for all layers to be loaded for a dependable ordering in the layer control
        if (layers.set(label, layer).size == files.size) {
            for (const [label, layer] of layers.entries()) {
                controlLayers.addOverlay(layer, label);
            }
        }
    });
}
