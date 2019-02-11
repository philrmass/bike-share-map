//Business Logic stations
function Station (){
  this.name = "",
  this.address = "",
  this.id = 0,
  this.intersection = [0,0],
  this.bikeCount = 0,
  this.rackCount = 0,
  this.selected = false,
  this.favorite = false,
  this.updated = false
}

Station.prototype.setStationData = function(dataObject) {
  this.name = dataObject.name;
  this.address = dataObject.address;
  this.id = dataObject.station_id;
  this.intersection = [dataObject.lat, dataObject.lon];
};

Station.prototype.setBikeData = function(dataBikeObject) {
  this.bikeCount = dataBikeObject.num_bikes_available;
  this.rackCount = dataBikeObject.num_docks_available;
};

// Business logic Map
function Map (){
  this.stations = [],
  this.center = [0, 0],
  this.zoomLevel = 0
}

Map.prototype.setCenter = function(latLong) {
  this.center = latLong;
};

Map.prototype.getCenter = function() {
  return this.center;
};

Map.prototype.setZoom = function(level) {
  this.zoomLevel = level;
};

Map.prototype.getZoom = function() {
  return this.zoomLevel;
};

Map.prototype.addStation = function(station) {
  this.stations.push(station);
};

Map.prototype.addStations = function(dataObject) {
  if(dataObject && dataObject.data && dataObject.data.stations) {
    for(var i = 0; i < dataObject.data.stations.length; i++) {
      var station = new Station();
      station.setStationData(dataObject.data.stations[i]);
      this.addStation(station);
    }
  }
};

Map.prototype.getStations = function() {
  return this.stations;
};

Map.prototype.addBikes = function(dataObject, isFirstTime) {
  if(dataObject && dataObject.data && dataObject.data.stations && this.stations) {
    if(!isFirstTime) {
      console.log("Bike changes:");
    }
    for(var i = 0; i < dataObject.data.stations.length; i++) {
      var station = null;
      var stationId = dataObject.data.stations[i].station_id
      if(this.stations[i] && (stationId === this.stations[i].id)) {
        station = this.stations[i];
      } else{
        station = this.findStation(stationId);
      }

      if(station) {
        var oldBikeCount = station.bikeCount;
        station.setBikeData(dataObject.data.stations[i]);
        if(!isFirstTime) {
          if(station.bikeCount !== oldBikeCount) {
            station.updated = true;
            var bikeDiff = station.bikeCount - oldBikeCount;
            var addedText = (bikeDiff > 0 ? bikeDiff + " bikes added" : -bikeDiff + " bikes removed");
            console.log(station.name + " old-bike-count=" + oldBikeCount + ", new-bike-count=" + station.bikeCount + ", " + addedText);
          } else {
            station.updated = false;
          }
        }
      }
    }
  }
};

Map.prototype.findStation = function(id){
  for (var i = 0; i < this.stations.length; i++){
    if (this.stations[i]) {
      if (this.stations[i].id === id){
        return this.stations[i];
      }
    }
  }
  return false;
};

function User(){
  this.name = name;
  this.favoriteStations = [];
}

User.prototype.deleteStation = function(id) {
  for(var i = 0; i < this.favoriteStations.length; i++) {
    if (this.favoriteStations[i]){
      if (this.favoriteStations[i].id === id) {
        var station = map.findStation(id);
        station.favorite = false;
        delete this.favoriteStations[i];
        this.favoriteStations.splice(i, 1);
        return true;
      }
    }
  }
  return false;
};

function requestObject(url) {
  return fetch(url).then((response) => {
    return response.json();
  });
}

// User interface logic
function captureConsoleLog(captureDiv) {
  let oldConsoleLog = console.log;

  console.log = function(message) {
    captureDiv.innerHTML += "<div>" + message + "</div>";
    captureDiv.scrollTop = captureDiv.scrollHeight;
    oldConsoleLog.apply(console, arguments);
  };
}

function MapDisplay(){
  this.leafletMap = null;
  this.markers = [];
  this.selectedIcon = null;
  this.favoriteIcon = null;
  this.updatedIcon = null;
  this.icon = null;
}

MapDisplay.prototype.initialize = function(divId, center, zoom) {
  this.leafletMap = L.map(divId).setView(center, zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
  }).addTo(this.leafletMap);

  this.selectedIcon = this.makeIcon('./img/red.png', 35, 44, 20, 45);
  this.favoriteIcon = this.makeIcon('./img/blue.png', 30, 40, 15, 40);
  this.updatedIcon = this.makeIcon('./img/yellow.png',  25, 25, 12.5, 12.5);
  this.icon = this.makeIcon('./img/green.png', 25, 25, 12.5, 12.5);
  var map = this.leafletMap
  var info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (icon) {
    // this._div.style += "display: grid;"
    this._div.innerHTML  = '<img src = "./img/greenicon.png">'+ '<p>Station</p>' + '<img src = "./img/yellowicon.png">' + '<p>Updated Station</p>' + '<img src = "./img/redicon.png">' + '<p>Selected Station</p>' + '<img src = "./img/blueicon.png">' + '<p>Favorite Station</p>'
  };
  info.addTo(map);

}

MapDisplay.prototype.makeIcon = function(url, width, height, anchorX, anchorY) {
  var icon = L.icon({
    iconUrl: url,

    iconSize: [width, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [anchorX, -10]
  });
  return icon;
}

MapDisplay.prototype.addStationMarkers = function(stations) {
  for(var i = 0; i < stations.length; i++) {
    var markerIcon = this.icon;
    if(stations[i].selected) {
      markerIcon = this.selectedIcon;
    } else if(stations[i].favorite) {
      markerIcon = this.favoriteIcon;
    } else if(stations[i].updated) {
      markerIcon = this.updatedIcon;
    }

    var marker = L.marker(stations[i].intersection, {icon: markerIcon});
    marker.station_id = stations[i].id
    marker.addTo(this.leafletMap).on("click", stationClick);

    this.markers.push(marker);
  }
}

MapDisplay.prototype.findMarker = function(id){
  for (var i = 0; i < this.markers.length; i++){
    if (this.markers[i]) {
      if (this.markers[i].station_id === id){
        return this.markers[i];
      }
    }
  }
  return false;
}

MapDisplay.prototype.setMarkerIcons = function(stations) {
  for (var i = 0; i < stations.length; i++) {
    if(stations[i].selected) {
      var matchedMarker = this.findMarker(stations[i].id);
      matchedMarker.setIcon(this.selectedIcon);
    } else if (stations[i].favorite) {
      var matchedMarker = this.findMarker(stations[i].id);
      matchedMarker.setIcon(this.favoriteIcon);
    } else if (stations[i].updated) {
      var matchedMarker = this.findMarker(stations[i].id);
      matchedMarker.setIcon(this.updatedIcon);
    } else {
      var matchedMarker = this.findMarker(stations[i].id);
      matchedMarker.setIcon(this.icon);
    }
  }
}

var map = new Map();
var user = new User();
var mapDisplay = new MapDisplay();

function listAllStations(allStations) {
  var htmlForStationList = "";
  allStations.forEach(function(station){
    htmlForStationList += "<li id =" + station.id + ">" + station.name + "</li>";
  });
  $("ul#all-stations").html(htmlForStationList);
}

function showStationDetails(stationId){
  for(var i = 0; i < map.stations.length; i++){
    map.stations[i].selected = false;
  }
  var station = map.findStation(stationId);
  station.selected = true;
  mapDisplay.setMarkerIcons(map.stations);
  if(station) {
    $("#station-id").html(station.id)
    $(".station-name").html(station.name)
    $(".station-address").html(station.address)
    $(".station-bike-count").html(station.bikeCount)
    $(".station-rack-count").html(station.rackCount)
    $(".station-details").show();
    $("#logo-div").hide();
  }
}

function addToFavorites(detailsId){
  var currentStation = map.findStation(detailsId.text());
  currentStation.favorite = true;

  var isAlreadyPresent = false;
  for(var i = 0; i < user.favoriteStations.length; i++) {
    if(currentStation === user.favoriteStations[i]) {
      isAlreadyPresent = true;
    }
  }
  if(!isAlreadyPresent) {
    user.favoriteStations.unshift(currentStation);
    $("#favorite-stations-box").show();
    if(user.name) {
      $(".users-name").html(user.name + "'s " + " ");
    }
    updateFavoriteStations();
    mapDisplay.setMarkerIcons(map.stations);
  }
}

function updateFavoriteStations() {
  $("#favorite-stations-list").empty();
  for(var i = 0; i < user.favoriteStations.length; i++){
    if(user.favoriteStations[i]) {
      $("#favorite-stations-list").append("<li>" + user.favoriteStations[i].name + "<input type= 'button' class='deleteButton' id='" + user.favoriteStations[i].id +"' value='X'>" +" </li>");
    }
  }
}

function makeIcon(url, width, height, anchorX, anchorY) {
  var icon = L.icon({
    iconUrl: url,

    iconSize: [width, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [anchorX, -10]
  });
  return icon;
}

function stationClick(event) {
  var id = event && event.target && event.target.station_id;
  if(id) {
    showStationDetails(id);
  }
}

$(function() {
  var developerInfo = document.getElementById("developer-info");
  $("#developer-button").click(function() {
    if(developerInfo.style.display === "block") {
      developerInfo.style.display = "none";
    } else {
      developerInfo.style.display = "block";
    }
  })
  captureConsoleLog(developerInfo);

  var portlandDowntown = [45.523360, -122.681237];
  map.setCenter(portlandDowntown);
  map.setZoom(15);

  var stationUrl = "https://biketownpdx.socialbicycles.com/opendata/station_information.json";
  var bikeUrl = "https://biketownpdx.socialbicycles.com/opendata/station_status.json";

  mapDisplay.initialize("mapid", map.getCenter(), map.getZoom());
  requestObject(stationUrl).then(function(dataObject) {
    map.addStations(dataObject);
    mapDisplay.addStationMarkers(map.stations);
    listAllStations(map.stations);

    requestObject(bikeUrl).then(function(dataObject) {
      map.addBikes(dataObject, true);
    });
  });

  setInterval(function() {
    requestObject(bikeUrl).then(function(dataObject) {
      map.addBikes(dataObject, false);
      mapDisplay.setMarkerIcons(map.stations);
    });
  }, 60000);

$("form#input-name").submit(function(event){
    event.preventDefault();
    var nameInput = $("#name").val();
    user.name = nameInput;
  });

  var detailsId = $("#station-id");
  $("#favorite-button").click(function(){
    addToFavorites(detailsId);
  });

  $("ul#all-stations").on("click", "li", function(){
    showStationDetails(this.id);
  });

  $("#favorite-stations-list").on("click", ".deleteButton", function (){
    user.deleteStation(this.id);
    updateFavoriteStations();
    mapDisplay.setMarkerIcons(map.stations);
  });
});
