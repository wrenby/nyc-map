/// Basic setup

var map = L.map(
    'map', {
        minZoom: 10,
        maxZoom: 18,
        maxBounds: [[40.42604212826493, -74.61364746093751], [41.156944322795525, -73.30078125000001]],
    }
).setView([40.7924, -73.9579], 12);

var tiles = L.tileLayer('https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=DPuhSkOb2lMfsIEVGlAZ',{
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
// TODO: this is probably temporary
var marker = new L.Icon({
    iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png',
    shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png',
    iconSize:     [38, 95],
    shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
})

// Create a UI element that shows information upon clicking the "Show More" link
let info = new Map();
var infoControl = L.control({position:'topright'});

infoControl.onAdd = function (_map) {
	this._div = L.DomUtil.create('div', 'info');
	this.hide();
	return this._div;
};

// TODO: call when the popup is defocused or closed; currently no way to hide this
infoControl.hide = function () {
    this._div.style = "display: none";
}

infoControl.show = function () {
    this._div.style = "display: unset";
}

infoControl.update = function (name) {
    let props = info.get(name);
    if (props) {
        this.show();
        this._div.innerHTML = `<p><b>${props.name ? props.name : "About"}</b></p>`
        + `<p>Address: ${props.address ? props.address : "Unknown"}</p>`
        + `<p>Contact: ${props.contact ? props.contact : "Unknown"}</p>`
        + `<p>Accepts: ${props.accepts ? props.materials : "Unknown"}</p>`;
        // ! $(".leaflet-popup").focusout(infoControl.hide); // BROKEN; infoContro.hide.this is undefined
    } else {
        this.hide();
    }
};
infoControl.addTo(map);

// ! this should be phased out in favor of a more accurate and usable search feature
// var controlLayers = L.control.layers().addTo(map);

/// GeoJSON stuff

function onEachFeature(feature, layer) {
    if (feature.properties) {
        // add a popup to the marker
        let popupContent = `<p><b>${feature.properties.name}</b></p>`
            + `<p><a class="showmore" href="#details" onclick="infoControl.update('${feature.properties.name}')">Show More</a></p>`;
        layer.bindPopup(popupContent);

        // index into the info
        // TODO: index by some kind of hash to allow for edge case of duplicate names
        // when done, update the onclick event above to match
        info.set(feature.properties.name, feature.properties);
    }
}

$.getJSON("data/bins.geojson", function(data) {
    let geo = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon: marker});
        },
        onEachFeature: onEachFeature
    }).addTo(map);
    //controlLayers.addOverlay(geo, 'Layer title');
});
