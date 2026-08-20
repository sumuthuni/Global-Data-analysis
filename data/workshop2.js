

// Import SRTM data
var dataset = ee.Image("CGIAR/SRTM90_V4")
print (dataset) // Look at the data properties

//Map.addLayer(datasets)
Map.addLayer(dataset, {min: 0, max: 2500}, 'custom visualization');

//Map.addLayer(image, {min: 0, max: 2500, palette: ['blue', 'green', 'red']},'custom palette');

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

// Set Map Options
Map.setOptions('SATELLITE')
print ('No of protected areas:', protected_areas.size())
print ('protected_areas')
print ('First PA', protected_areas.first())
print('First 5 PAs',protected_areas.limit(5))

// // Map.centerObject protected_areas.first()
var iucn_pre1980 = protected_areas.filter(ee.Filter.lte('STATUS_YR', 1980));
//Map.addLayer(iucn_pa, {color: 'yellow'}, 'National Parks')

var iucn_pa = protected_areas.filter(ee.Filter.eq('IUCN_CAT', 'II'));
Map.addLayer(iucn_pa, {color: 'yellow'}, 'National Parks')


// filter date
var iucn_pre1980 = protected_areas.filter(ee.Filter.lte('STATUS_YR', 1980));
Map.addLayer(iucn_pa, {color: 'white'}, 'PAs in 1980')


// Import countries
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
print (countries)
Map.addLayer(countries)

// New Zealand only
var nz = countries.filter(ee.Filter.equals('country_na', 'New Zealand'))
print (nz);
Map.addLayer(nz);

// Spatial filter PAs only in NZ
var nz_pas = protected_areas.filter(ee.Filter.bounds(nz))
print ('Number of PAs in NZ:', nz_pas.size())
Map.addLayer(nz_pas, {color:'yellow'}, 'NZ PAs only')

// Spatial filter PAs only in NZ
var nz_pas = protected_areas.filter(ee.Filter.bounds(nz));
print ('Number of PAs in NZ:', nz_pas.size());


//computation in Earth_Engine
// Link them all into one statement
var nz_national_parks = protected_areas
    .filter(ee.Filter.eq('IUCN_CAT', 'II')) // filter only NPs
    .filter(ee.Filter.bounds(nz)); // filter to NZ
    print ('Number of National Parks in NZ:', nz_national_parks.size());
    
    // COMPUTATION IN EARTH ENGINE


// Fix SRTM
var srtm_fixed = dataset.add(100);

// Correct elevation threshold (700 m)
var elevGt700 = dataset.gt(700).selfMask();
Map.addLayer(
  elevGt700,
  {palette: ['white']},
  'Elevation > 700m'
);

// Print dataset (now works because no errors above)
print(dataset, 'SRTM dataset');

// Elevation > 1500 m
var elevGt1500 = dataset.gt(1500).selfMask();
Map.addLayer(
  elevGt1500,
  {palette: ['yellow']},
  'Elevation > 1500m'
);

// Styled version of >1500 m
Map.addLayer(
  elevGt1500,
  {palette: ['fuchsia']},
  'Elevation > 1500m (styled)',
  true,
  0.7
);

// Complex image functions

// apply complex algorithm
// Use terrain, an algorithm that returns several topographic variables from an elevation image
// Terrain products from SRTM
// Compute terrain layers correctly

var slope = ee.Terrain.slope(dataset);
var aspect = ee.Terrain.aspect(dataset);
var hillshade = ee.Terrain.hillshade(dataset);

// Print terrain layers
print('Slope', slope);
print('Aspect', aspect);
print('Hillshade', hillshade);

// Add hillshade layer
Map.addLayer(
  hillshade,
  {min: 0, max: 255, palette: ['black', 'white']},
  'Hillshade'
);

// Add slope layer
Map.addLayer(
  slope,
  {min: 0, max: 45, palette: ['white', 'darkred', 'black']},
  'Slope'
);


// Find Taranaki NP
var taranaki = protected_areas.filter(ee.Filter.eq('NAME', 'Egmont National Park'));
Map.addLayer(taranaki, {color: 'orange'}, 'Mt Taranaki')


// Apply a spatial reducer to estimate mean slope
var slopeOutput = slope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput', slopeOutput)

// Try clipping to see if it's any different.
var taranakiSlope = slope.clip(taranaki)
Map.addLayer (taranakiSlope, {palette: ['white', 'darkred', 'black'], min:0, max:45}, 'taranaki slope')

var slopeOutput2 = taranakiSlope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput2', slopeOutput2) // same answer

// Use reduce regions with a different reducer (Max)
var elevOutput_Max = dataset.reduceRegion({
  reducer: ee.Reducer.max(), // we compute the max of all pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Max', elevOutput_Max)

// Use reduce regions with a different reducer (min)
var elevOutput_Min = dataset.reduceRegion({
  reducer: ee.Reducer.min(), // we compute the min of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Min', elevOutput_Min)

// Use reduce regions with a different reducer
var elevOutput_MinMax = dataset.reduceRegion({
  reducer: ee.Reducer.minMax(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_MinMax', elevOutput_MinMax)

// Get area of >1500m
var areaGt1500m = elevGt1500 // binary 1 == yes
  .multiply (ee.Image.pixelArea()) // get the area of each pixel
  .reduceRegion({
  reducer: ee.Reducer.sum(), // sum all pixel areas together
  geometry: taranaki,
  scale:90 
})
print ('The area of Taranaki above 1500m (m2)', areaGt1500m) // in square metres
print ('The area of Taranaki above 1500m (km2)', ee.Number(areaGt1500m.get('elevation')).divide(1000 * 1000)) // in square metres

///////////
var dataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
print (dataset) // 12 images where each one is a month


// Get two months
var jan_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/01")
var july_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/07")


// Select their average temperature bands
var jan_climate_avg = jan_climate.select('tavg') // get average band
var july_climate_avg = july_climate.select('tavg')


// Set vis parameters
var meanTemperatureVis = {
  min: -40,
  max: 30,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
};

Map.addLayer(jan_climate_avg, meanTemperatureVis, 'janClimate')
Map.addLayer(july_climate_avg, meanTemperatureVis, 'julyClimate')


//reduce to get the yearly average
var annualMeanTemperature = dataset
  .select('tavg')
  .mean() // this is the reducer
  .multiply(0.1); // scale pixels to real values

Map.setCenter(71.7, 52.4, 3);
Map.addLayer(annualMeanTemperature, meanTemperatureVis, 'Mean Annual Temperature');

//Landset Image
// Load Landsat 8 TOA for 2017
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2017-01-01', '2017-12-31');

// Reduce ImageCollection → Image FIRST
var LandsatMedian = dataset.median();

// Select RGB bands for true colour
var trueColour = LandsatMedian.select(['B4', 'B3', 'B2']);

// Visualization parameters
var trueColourVis = {
  min: 0.0,
  max: 0.4
};

// Add to map
Map.addLayer(trueColour, trueColourVis, 'True Colour Median');


