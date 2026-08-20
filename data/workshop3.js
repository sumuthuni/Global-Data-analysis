// Population
var population = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Count")
print (population)

//import two images for start and end
var population_2000 = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2000_30_sec')
var population_2015 = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2015_30_sec')
print (population_2000)

var population_vis = {
  'max': 1000.0,
  'palette': [
    'ffffe7',
    '86a192',
    '509791',
    '307296',
    '2c4484',
    '000066'
  ],
  'min': 0.0
};
Map.addLayer(population_2000, population_vis, 'population_count_2000');
Map.addLayer(population_2015, population_vis, 'population_count_2015');

// Nightlights

var nl = ee.ImageCollection("NOAA/DMSP-OLS/NIGHTTIME_LIGHTS")
print (nl)

// get two images for start and end
var nl_2000 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000')

print (nl_2000)

var nl_2013 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013')
print (nl_2013)

////

// Nightlights 2000
var nl_2000_AV = ee.Image('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F152000')
  .select(['avg_vis'], ['nightlight']);
print('nightlight 2000 processed', nl_2000_AV);

// Nightlights 2013
var nl_2013_AV = ee.Image('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013')
  .select(['avg_vis'], ['nightlight']);
print('nightlight 2013 processed', nl_2013_AV);

var night_light = {
  min: 0,
  max: 63,   // correct range for DMSP-OLS
  palette: [
    'ffffe7',
    '86a192',
    '509791',
    '307296',
    '2c4484',
    '000066'
  ]
};

Map.addLayer(nl_2000_AV, night_light, 'Nighttime Lights 2000');
Map.addLayer(nl_2013_AV, night_light, 'Nighttime Lights 2013');


// GRID (analysis units)

var grid = ee.FeatureCollection('users/murrnick/mb5370/worldgrid_2deg');
Map.addLayer(grid, {color:'white'}, 'grid', false, 0.4);
print(grid.first());


// ECOREGIONS
var ecoregions = ee.FeatureCollection('users/murrnick/mb5370/worldgrid_2deg');
Map.addLayer(ecoregions, {color:'green'}, 'ecoregions');


// COASTLINE

var coast = ee.FeatureCollection('projects/UQ_intertidal/dataMasks/naturalEarthCoastline_v1');
Map.addLayer(coast, {color:'yellow'}, 'coast');


// SPATIAL FILTER: ECOREGIONS TOUCHING COAST

var coast_ecoregions = ecoregions.filterBounds(coast);
Map.addLayer(coast_ecoregions, {color:'red'}, 'Coastal ecoregions');


// POPULATION CHANGE (ONLY IF YOU HAVE THESE IMAGES)

// If you have population_2000 and population_2015 defined earlier,
// this block will work. Otherwise comment it out.

if (typeof population_2000 !== 'undefined' && typeof population_2015 !== 'undefined') {
  var pop_change = population_2015
    .subtract(population_2000)
    .select(0)                      // ensure single-band
    .clip(coast_ecoregions);

  Map.addLayer(
    pop_change,
    {palette:['red','black','lime'], min:-500, max:500},
    'pop_change',
    true,
    0.9
  );
}


// NIGHT LIGHTS CHANGE
//
var nl_2000 = ee.Image('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F152000').select('avg_vis');
var nl_2013 = ee.Image('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013').select('avg_vis');

var nl_change = nl_2013
  .subtract(nl_2000)
  .select(0)                        // IMPORTANT: single-band for palette
  .clip(coast_ecoregions);

Map.addLayer(
  nl_change,
  {palette:['red','black','lime'], min:-50, max:50},
  'nl_change',
  true,
  0.9
);


// AVERAGE NIGHT-LIGHTS CHANGE PER ECOREGION
var nl_changePerEcoregion = nl_change.reduceRegions({
  collection: coast_ecoregions,
  reducer: ee.Reducer.mean(),
  scale: 1000
});

// STYLE THE POLYGONS

var styled = nl_changePerEcoregion.style({
  color: 'black',
  fillColor: 'red',
  width: 1
});

Map.addLayer(styled, {}, 'Mean NL change per ecoregion');

// INSPECT THE FIRST FEATURE
print(nl_changePerEcoregion.first());

Export.table.toAsset({
  collection: nl_changePerEcoregion,
  description: 'export_nl_toAsset',
  assetId: 'users/sumuthuni/nl_changePerEcoregion'
});


