// Use two forward slashes for writing comments.

/* You can also use slashes and stars to write multi comment lines if you like */

print ('Hello, World!')

// Line comments start with two forward slashes. Like this line.

// Variables are used to store objects, and are defined using the keyword var.
var the_answer = 42; //number

print ('the_answer')
var the_answer = 42
var city = 'San Francisco'
print ('city')
var population = 873965
print ('population')
print('The value for the population variable is:', population);

var cities = ['San Francisco', 'Los Angeles', 'New York', 'Atlanta'];
print (cities)

var a = 1
var b = 2
var result = a + b;
print (result)

print (a)
var result = a + b
print (result, 'javascript way')



var a1 = ee.Number (1)
var a2 = ee.Number (3)
var result2 = print (a1.add(a2))

var yearList = ee.List.sequence(1980, 2020, 5);
print(yearList);

//Configuring your map
Map.setOptions('SATELLITE')

var snazzy = require("users/aazuspan/snazzy:styles");
snazzy.addStyle("https://snazzymaps.com/style/48750/blank-map", "Blank");

Map.setCenter(174.0638, -39.298, 11);
// Import SRTM data
var dataset = ee.Image("CGIAR/SRTM90_V4")
print (dataset) // Look at the data properties
Map.addLayer(dataset)
// Load SRTM dataset
var dataset = ee.Image("CGIAR/SRTM90_V4");

// Print dataset info
print(dataset);

// Default layer
Map.addLayer(dataset, {}, 'SRTM Raw');

// Custom visualization (grayscale)
Map.addLayer(dataset, {
  min: 0,
  max: 2500
}, 'Custom Visualization');

// Define "image" properly (same dataset or selected band)
var image = dataset;

Map.addLayer(dataset, {min: 0, max: 2500}, 'custom visualization');

Map.addLayer(image, {min: 0, max: 2500, palette: ['blue', 'green', 'red']},'custom palette');

// Set up visualisation parameters
var elevationVis = {
  min: 0,
  max: 2500,
  palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']
};

// Add the data layer to the map
Map.addLayer(dataset, elevationVis, 'Elevation');

//feature
var wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons")
Map.addLayer(wdpa,{color:'yellow'}, 'wdpa')


// Imports
var srtm = ee.Image("CGIAR/SRTM90_V4")
var protected_areas = ee.FeatureCollection("WCMC/WDPA/current/polygons")

// Add data
Map.addLayer(srtm, {min: 0, max: 2500, palette: ['black','lime', 'yellow']}, 'srtm');
Map.addLayer(protected_areas, {color: 'darkgreen'}, 'Protected Areas')

// Set Centre
Map.setCenter(174.0638, -39.298, 9);


