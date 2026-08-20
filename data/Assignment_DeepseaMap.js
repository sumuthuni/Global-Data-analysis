var etopo = ee.Image('NOAA/NGDC/ETOPO1'); 
print(etopo)
 // Select the bedrock band
var elevation = etopo.select('bedrock');
// Ocean depth as positive numbers
// Example: elevation = -4000 m becomes depth = 4000 m
var depth = elevation.multiply(-1).rename('depth');
print(depth)

// Create an ocean mask
// Elevation values below 0 are ocean
var ocean = elevation.lt(0);

///// Apply the ocean mask to depth
depth = depth.updateMask(ocean); 

////PART 2: CREATE THE DEEP-OCEAN ECOSYSTEM MAPS

// 1. Hadal trenches and troughs
// Depth greater than 6000 m
var hadal = depth.gt(6000)
  .selfMask()
  .rename('Hadal');
  // 2. Abyssal plains
// Depth between 3000 m and 6000 m
var abyssal = depth.gt(3000)
  .and(depth.lte(6000))
  .selfMask()
  .rename('Abyssal');
  
  // 3. Continental and island slopes
// Depth between 250 m and 3000 m
var continentalSlope = depth.gt(250)
  .and(depth.lte(3000))
  .selfMask()
  .rename('Continental_Slope');
  
// 4. Calculate seafloor slope in degrees
var slope = ee.Terrain.slope(elevation);

// 5. Submarine canyons
// Deeper than 200 m and slope greater than 6 degrees
var submarineCanyon = depth.gt(200)
  .and(slope.gt(6))
  .selfMask()
  .rename('Submarine_Canyon');
  
  
// CREATE ONE COMBINED CATEGORICAL MAP

// Ecosystem codes:
// 1 = Continental and island slopes
// 2 = Abyssal plains
// 3 = Hadal trenches and troughs
// 4 = Submarine canyons

var ecosystems = ee.Image(0)
  .where(continentalSlope, 1)
  .where(abyssal, 2)
  .where(hadal, 3)
  .where(submarineCanyon, 4)
  .updateMask(ocean)
  .rename('ecosystem');
  
  
// PART 3: ADD A VECTOR DATASET
// Marine protected areas from WDPA


// Import protected-area polygons
var protectedAreas = ee.FeatureCollection(
  'WCMC/WDPA/current/polygons'
);

// Keep coastal and marine protected areas
// MARINE = 1 means partly marine
// MARINE = 2 means completely marine
var marineProtectedAreas = protectedAreas
  .filter(
    ee.Filter.inList('MARINE', ['1', '2'])
  );
  
  
// PART 4: VISUALISE THE MAP


// Centre the map globally
Map.setCenter(0, 0, 2);

// Bathymetry layer
var depthStyle = {
  min: 0,
  max: 10000,
  palette: [
    'd9f0ff',
    '74add1',
    '4575b4',
    '313695',
    '081d58'
  ]
};

print(depthStyle)

// Categorical ecosystem colours
var ecosystemStyle = {
  min: 1,
  max: 4,
  palette: [
    'fdae61', // continental and island slopes
    '2c7bb6', // abyssal plains
    '542788', // hadal trenches
    'd73027'  // submarine canyons
  ]
};

// Add the layers
Map.addLayer(
  depth,
  depthStyle,
  'Ocean depth',
  false
);

Map.addLayer(
  continentalSlope,
  {palette: ['fdae61']},
  'Continental and island slopes',
  false
);

Map.addLayer(
  abyssal,
  {palette: ['2c7bb6']},
  'Abyssal plains',
  false
);
Map.addLayer(
  hadal,
  {palette: ['542788']},
  'Hadal trenches and troughs',
  false
);
Map.addLayer(
  submarineCanyon,
  {palette: ['d73027']},
  'Submarine canyons',
  false
);

Map.addLayer(
  ecosystems,
  ecosystemStyle,
  'Deep-ocean ecosystems',
  true
);
// Draw protected-area boundaries
var protectedAreaOutline = ee.Image()
  .byte()
  .paint({
    featureCollection: marineProtectedAreas,
    color: 1,
    width: 1
  });
  
  print(protectedAreaOutline,'protected Area Outline')
  
Map.addLayer(
  protectedAreaOutline,
  {palette: ['00ff00']},
  'Marine protected areas',
  true
);


// ADD A TITLE


var title = ui.Label({
  value: 'Global Deep-Ocean Ecosystems',
  style: {
    position: 'top-center',
    fontSize: '22px',
    fontWeight: 'bold',
    backgroundColor: 'white',
    padding: '8px'
  }
});

Map.add(title);


// ADD A LEGEND


var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    backgroundColor: 'white'
  }
});

var legendTitle = ui.Label({
  value: 'Deep-ocean ecosystems',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 8px 0'
  }
});

legend.add(legendTitle);

// Function for one legend row
function makeLegendRow(colour, name) {

  var colourBox = ui.Label({
    style: {
      backgroundColor: colour,
      padding: '8px',
      margin: '0 8px 4px 0'
    }
  });

  var description = ui.Label({
    value: name,
    style: {
      margin: '0 0 4px 0'
    }
  });

  return ui.Panel({
    widgets: [colourBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
}

// Add ecosystem categories
legend.add(
  makeLegendRow(
    '#fdae61',
    'Continental and island slopes: 250–3000 m'
  )
);

legend.add(
  makeLegendRow(
    '#2c7bb6',
    'Abyssal plains: 3000–6000 m'
  )
);

legend.add(
  makeLegendRow(
    '#542788',
    'Hadal trenches and troughs: >6000 m'
  )
);

legend.add(
  makeLegendRow(
    '#d73027',
    'Submarine canyons: >200 m depth and >6° slope'
  )
);

legend.add(
  makeLegendRow(
    '#00ff00',
    'Marine protected areas'
  )
);

Map.add(legend);



// PRINT INFORMATION TO THE CONSOLE

print('ETOPO1 elevation:', elevation);
print('Ocean depth:', depth);
print('Seafloor slope:', slope);
print('Combined ecosystem map:', ecosystems);
print('Marine protected areas:', marineProtectedAreas);


Export.image.toDrive({
  image: ecosystems,
  description: 'Deep_Ocean_Ecosystems',
  folder: 'EarthEngine',
  fileNamePrefix: 'Deep_Ocean_Ecosystems',
  region: ee.Geometry.Rectangle([-180, -90, 180, 90]),
  scale: 1000,
  maxPixels: 1e13
});
Export.table.toDrive({
  collection: marineProtectedAreas,
  description: 'Marine_Protected_Areas',
  fileFormat: 'csv'
});




