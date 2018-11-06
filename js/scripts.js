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

Station.prototype.setStationData = function(stationData) {
  var dataObject = JSON.parse(stationData);
  this.name = dataObject.name;
  this.address = dataObject.address;
  this.id = dataObject.station_id;
  this.intersection = [dataObject.lat, dataObject.lon];
}

Station.prototype.setBikeData = function(bikeData) {
  var dataBikeObject = JSON.parse(bikeData);
  this.bikeCount = dataBikeObject.num_bikes_available;
  this.rackCount = dataBikeObject.num_docks_available;
}

// Business logic Map
function Map (){
  this.stations = [],
  this.center = [0, 0],
  this.zoomLevel = 0
}

Map.prototype.setCenter = function(latLong) {
  this.center = latLong;
}

Map.prototype.getCenter = function() {
  return this.center;
}

Map.prototype.setZoom = function(level) {
  this.zoomLevel = level;
}

Map.prototype.getZoom = function() {
  return this.zoomLevel;
}

Map.prototype.zoomIn = function() {
  this.zoomLevel++;
  if(this.zoomLevel > 19) {
    this.zoomLevel = 19;
  }
}

Map.prototype.zoomOut = function() {
  this.zoomLevel--;
  if(this.zoomLevel < 0) {
    this.zoomLevel = 0;
  }
}

Map.prototype.addStation = function(station) {
  this.stations.push(station);
}

Map.prototype.getStations = function() {
  return this.stations;
}

Map.prototype.findStation = function(id){
  for (var i = 0; i < this.stations.length; i++){
    if (this.stations[i]) {
      if (this.stations[i].id === id){
        return this.stations[i];
      }
    }
  }
  return false;
}

function User(){
  this.name = name;
  this.favoriteStations = [];
}

// Test data
// STATION_STATUS_GBFS: "'http://biketownpdx.socialbicycles.com/opendata/station_status.json'",
// STATION_INFORMATION_GBFS: "'http://biketownpdx.socialbicycles.com/opendata/station_information.json'",
var station0Data = '{"station_id":"hub_1576","name":"SW 3rd at Morrison","region_id":"region_241","lon":-122.67558217048645,"lat":45.51803881572945,"address":"718-732 Southwest 3rd Avenue, Portland","rental_methods":["KEY","APPLEPAY","ANDROIDPAY","TRANSITCARD","ACCOUNTNUMBER","PHONE","CREDITCARD"]}';
var station0BikeData = '{"station_id":"hub_1576","num_bikes_available":5,"num_bikes_disabled":0,"num_docks_available":11,"is_installed":1,"is_renting":1,"is_returning":1,"last_reported":1541445514}';

var station1Data = '{"station_id":"hub_1561","name":"NW Johnson at Jamison Square","region_id":"region_241","lon":-122.68201947212219,"lat":45.52863659670261,"address":"718 Northwest 11th Avenue, Portland","rental_methods":["KEY","APPLEPAY","ANDROIDPAY","TRANSITCARD","ACCOUNTNUMBER","PHONE","CREDITCARD"]}';
var station1BikeData = '{"station_id":"hub_1561","num_bikes_available":4,"num_bikes_disabled":0,"num_docks_available":13,"is_installed":1,"is_renting":1,"is_returning":1,"last_reported":1541445514}';

var station2Data = '{"station_id":"hub_1588","name":"NW Couch at 11th","region_id":"region_241","lon":-122.68181294202805,"lat":45.523741513819246,"address":"1037 Northwest Couch Street, Portland","rental_methods":["KEY","APPLEPAY","ANDROIDPAY","TRANSITCARD","ACCOUNTNUMBER","PHONE"]}';
var station2BikeData = '{"station_id":"hub_1588","num_bikes_available":8,"num_bikes_disabled":0,"num_docks_available":10,"is_installed":1,"is_renting":1,"is_returning":1,"last_reported":1541445514}';

var station3Data = '{"station_id":"hub_1535","name":"SW Park at Portland Art Museum","region_id":"region_241","lon":-122.68331229686736,"lat":45.515923530681164,"address":"1315 Southwest Park Avenue, Portland","rental_methods":["KEY","APPLEPAY","ANDROIDPAY","TRANSITCARD","ACCOUNTNUMBER","PHONE"]}';
var station3BikeData = '{"station_id":"hub_1535","num_bikes_available":5,"num_bikes_disabled":0,"num_docks_available":11,"is_installed":1,"is_renting":1,"is_returning":1,"last_reported":1541445514}';

var station4Data = '{"station_id":"hub_1563","name":"NW 23rd at Overton","region_id":"region_241","lon":-122.69863039255142,"lat":45.53211645029155,"address":"1310 Northwest 23rd Avenue, Portland","rental_methods":["KEY","APPLEPAY","ANDROIDPAY","TRANSITCARD","ACCOUNTNUMBER","PHONE"]}';
var station4BikeData = '{"station_id":"hub_1563","num_bikes_available":5,"num_bikes_disabled":0,"num_docks_available":9,"is_installed":1,"is_renting":1,"is_returning":1,"last_reported":1541445514}';


// User interface logic
function MapDisplay(){
  this.leafletMap = null;
}

MapDisplay.prototype.initialize = function(divId, center, zoom) {
  this.leafletMap = L.map(divId).setView(center, zoom);

  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    attribution: '&copy; <a id="home-link" target="_top" href="../">Map tiles</a> by <a target="_top" href="http://stamen.com">Stamen Design</a>, under <a target="_top" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
    maxZoom: 18,
  }).addTo(this.leafletMap);
}

var map = new Map();
var user = new User();
var mapDisplay = new MapDisplay();

function listStations(allStations) {
  var htmlForStationList = "";
  allStations.forEach(function(station){
    htmlForStationList += "<li id =" + station.id + ">" + station.name + "</li>";
  });
  $("ul#indvStation").html(htmlForStationList);
  attachStationListeners();
}

function attachStationListeners(){
  $("ul#indvStation").on("click", "li", function(){
    showStationDetails(this.id);
  });
}

function showStationDetails(stationId){
  var station = map.findStation(stationId);

  if(station) {
    $("#station-id").html(station.id)
    $(".station-name").html(station.name)
    $(".station-address").html(station.address)
    $(".station-bike-count").html(station.bikeCount)
    $(".station-rack-count").html(station.rackCount)
    $(".station-details").show();
  }
}

// var displayedStationId = map.station.id

function addToFavorites(detailsId){
  console.log("detailsId=", detailsId.text());
  var currentStation = map.findStation(detailsId.text());
  user.favoriteStations.push(currentStation);
  $(".favorite-stations-list").show();
  $(".users-name").html(user.name + "'s " + " ");
  var nameOfFavoriteStations = user.favoriteStations.name
  appendFavoriteStations(nameOfFavoriteStations)

}

function appendFavoriteStations(){
   $("#favorite-stations-list-name").empty();
 for(i = 0; i < user.favoriteStations.length; i++){
  $("#favorite-stations-list-name").append("<li>" + user.favoriteStations[i].name + "</li>");
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

function drawStationMarkers(mapDisplay, stations, selectedIcon, favoriteIcon, updatedIcon, normalIcon) {
  for(var i = 0; i < stations.length; i++) {
    var markerIcon = normalIcon;
    if(stations[i].selected) {
      markerIcon = selectedIcon;
    } else if(stations[i].favorite) {
      markerIcon = favoriteIcon;
    } else if(stations[i].updated) {
      markerIcon = updatedIcon;
    }

    var marker = L.marker(stations[i].intersection, {icon: markerIcon});
    marker.station_id = stations[i].id
    marker.addTo(mapDisplay).on("click", stationClick);
  }
}

$(function() {
  var portlandDowntown = [45.523360, -122.681237];
  map.setCenter(portlandDowntown);
  map.setZoom(15);

  mapDisplay.initialize("mapid", map.getCenter(), map.getZoom());

  var stationsData = [station0Data, station1Data, station2Data, station3Data, station4Data];
  var bikesData = [station0BikeData, station1BikeData, station2BikeData, station3BikeData, station4BikeData];
  for (var i = 0; i < stationsData.length; i++) {
    var station = new Station();
    station.setStationData(stationsData[i]);
    station.setBikeData(bikesData[i]);
    map.addStation(station);
  }

  listStations(map.stations)

  $("form#input-name").submit(function(event){
    event.preventDefault();
    var nameInput = $("#name").val();
    user.name = nameInput;
  });

  var detailsId = $("#station-id");
  $("#favorite-button").click(function(){
    console.log("working");
    addToFavorites(detailsId);
    // add to favorite station ul
  });
  var selectedIcon = makeIcon('./img/red.png', 64, 80, 32, 80);
  var favoriteIcon = makeIcon('./img/blue.png', 64, 80, 32, 80);
  var updatedIcon = makeIcon('./img/yellow.png', 50, 50, 25, 25);
  var icon = makeIcon('./img/green.png', 50, 50, 25, 25);
  drawStationMarkers(mapDisplay.leafletMap, map.stations, selectedIcon, favoriteIcon, updatedIcon, icon);
});
