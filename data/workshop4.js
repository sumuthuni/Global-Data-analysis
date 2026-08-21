var Heron = /* color: #98ff00 */ee.Feature(
        ee.Geometry.Point([151.9114949155441, -23.44147130028971]),
        {
          "station": "HeronIsland",
          "system:index": "0"
        }),
    Hamilton = /* color: #00ffff */ee.Feature(
        ee.Geometry.Point([148.95647400072073, -20.346150348227162]),
        {
          "station": "HamiltoIsland",
          "system:index": "0"
        }),
    Lizard = /* color: #bf04c2 */ee.Feature(
        ee.Geometry.MultiPoint(),
        {
          "station": "LizardIsland",
          "system:index": "0"
        }),
    Daydream = /* color: #ff0000 */ee.Feature(
        ee.Geometry.Point([145.4449626441156, -14.667743494253271]),
        {
          "station": "DaydreamIsland",
          "system:index": "0"
        }),
    Orpheus = /* color: #00ff00 */ee.Feature(
        ee.Geometry.Point([146.48336815795128, -18.612443693548297]),
        {
          "station": "orpheusIsland",
          "system:index": "0"
        }),
    Magnetic = /* color: #0000ff */ee.Feature(
        ee.Geometry.Point([146.87106699752806, -19.15388347587481]),
        {
          "station": "MagneticIsland",
          "system:index": "0"
        }),
    Green = /* color: #009999 */ee.Feature(
        ee.Geometry.Point([145.9692314963341, -16.757960697589468]),
        {
          "station": "GreenIsland",
          "system:index": "0"
        });
// Global Variables
var distance = 800 // metres we are allowed to snorkel from the station
Map.setOptions('SATELLITE')
Map.setCenter( 151.914, -23.441, 17) // Heron Island//zoom

Map.setCenter(148.95757924, -20.34639327)// Hamiltan Island

Map.setCenter(145.44647541, -14.66767257)// Lizard Island

Map.setCenter(148.81555647, -20.25161732)// Daydream Island

Map.setCenter(146.49992691, -18.63411616) //Orpheus Island

Map.setCenter(146.8480, -19.1550)// Magnetic Island 

Map.setCenter(145.9730, -16.7590) // Green Island 


var field_stations = ee.FeatureCollection([Heron, Hamilton, Lizard, Daydream, Orpheus, Magnetic, Green])
print (field_stations)

Map.addLayer (field_stations, {color: 'yellow'}, 'Field Station')
Map.centerObject(Orpheus, 14)

/// Data processing
///ACA
 
 var aca = ee.Image("ACA/reef_habitat/v2_0").select('benthic')
 var coral = aca
 .eq(15)// returns 1 if true 
 Map.addLayer(coral,{palette:['red']},'Coral only')
 
 var station_buffer = ee.Feature(field_stations.first()).buffer(800)
 Map.addLayer(station_buffer)

var buffer = function(feature){
  //aplies buffer to feature when given a value (num)
  var buffered = feature.buffer(800) 
  return buffered ;
} //// Use .map to work one station at a time

var out = field_stations.map(buffer)
print (out, 'out')

Map.addLayer (out, {color: 'yellow'},'buffered')

//
var area_pixels = ee.Image(ee.Image.pixelArea()).updateMask(coral)

var area_out = area_pixels.reduceRegions({
  reducer: ee.Reducer.sum(),
  collection: out, // buffered collection
  scale: 5
});

print (area_out, 'area out')

// Clean it up
var cleaner = function (feature) {
  // cleans my out put 
  var clean = {
  station_name: feature.get('Field_Station'),
  area_m2: ee.Number(feature.get('sum')),
  area_km2: ee.Number(feature.get('sum')).divide(1000 * 1000),
  analyst: 'sumu'
};

return feature.set(clean);
}

//Apply cleaner + sort
var cleaned_result = area_out.map(cleaner).sort('area_km2', false);

// Print output
print(cleaned_result, 'cleaned result');

//Results and Export

Export.table.toDrive({
  collection: area_out, //fyi - type: featureCollection
  description: 'exportToDrive', 
  fileNamePrefix: 'research_stations',
  fileFormat: 'CSV'
})

var exportImage = aca.clip(field_stations);
Map.addLayer(exportImage, {}, 'Clipped ACA by all stations');

