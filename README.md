# Bike Share Map

#### November 5th, 2018

## Contributors

#### By **Paige Williams, Tanvi Garg, Phil Mass, Victoria Martinez**

## Description

_This application shows the locations and current status of all of the Nike BIKETOWN bike share stations. It gets the locations and live bike status date from Nike's public API_

_You can view the deployed page [here](https://philrmass.github.io/bike-share-map)_

## Setup and Installation

* Clone the project from https://github.com/philrmass/bike-share-map.git to a local directory
* Open index.html in a browser

## Support and Contact Details

If you have any issues or questions, please email me at philrmass@gmail.com

## Specifications:
### MVP:
#### Business logic:
1. Define 5 bike stations as a dataset for our static map
2. Add station properties from the Biketown datasets (station name, coordinates, address, id, number of bikes, number of bike racks, selected)
3. Add properties to map object (stations, center coordinates, zoom level)
4. Add user object (favorite stations, name)
5. Add all stations to map.
6. Add method to find station that user has selected based off of unique id.

#### UI Logic
1. Fixed map of Downtown Portland.
2. Add list of stations to form.
3. User selects a station and show details about that station.
4. User can select favorite stations and add them to their favorite station list.
5. Draw stations on the map.
6. Users favorite stations are selected on the map.
7. User clicks on station on the map and details about that station appear below the form.
8. Gather station id from map click and return station information.
9. User adds to favorites with add button.
10. User deletes favorites with delete button.
11. Add MapDisplay object(leafletMap, marker, markerSelected, iconStatus x 4).
12. Add function to change marker when station is selected.

### Good to have:
1. Use custom icon for stations.
2. Use complete Biketown data.
3. Update bike data every minute.
3. Improve styling.
4. Test all functionality.

### Excellent to have:
1. Add better map tile setTimeout
2. Resize icons for zoom level
3. Don't allow duplicates in favorites array
4. Pop empty slots from favorites array
5. Show updated icon for updated stations
6. Add popups to station markers to show intersection and address
7. Add map legend for marker types
8. Add screenshot to readme
9. Deploy to gh-pages

## Technologies used
1. **Custom CSS**
2. **JQuery and JavaScript**
3. **HTML5**
4. **Atom**
5. **Command Line**
6. **GitHub**
7. **Leaflet**

## Known Bugs
No known bugs.

## Legal

Copyright (c) 2018 Paige Williams, Tanvi Garg, Phil Mass, Victoria Martinez

Licensed under the MIT License
