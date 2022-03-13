/*
AUTHOR: Christiana Ade 
DATE UPDATED: 3/19/2021
TITLE: Burn Severity of Medocino Complex Fire */
////////////////////////////////////////////////////////////////////

////////////////////////Visualize pre and post fire images */////////////////////
// Load in pre-fire image 
var preImg = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_045033_20170925')

// Load in post fire image
var postImg = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_045033_20180928')


//// B) False Color Infared Display ////
var vizCIR = {bands: ['B5', 'B4', 'B3'], min: 0, max: 6000, gamma: 2};
Map.centerObject(preImg,9)


////////////////////////Compute  NDBR /////////////////////

var nbrPre = preImg.select('B5').subtract(preImg.select('B7'))
               .divide(preImg.select('B5').add(preImg.select('B7')));

var nbrPost = postImg.normalizedDifference(['B5', 'B7']);

var burnParams = {min:-0.5, max:1, palette: ['green','brown','red']};


////////////////////////* COMPLETED Step 3: Compute Delta NDR and load in the fire perimeter*/////////////////////
/// Subtract the post ndr from the pre ndr
var dnbr = nbrPre.subtract(nbrPost)


// Load in the Fire Perimeter //
var firePerim = ee.FeatureCollection("users/cade/ca_MendocinoComplex");

// Visualize the fire perimeter
print(firePerim);


// Clip the dnbr to the fire perimeter // 
var fire = dnbr.clip(firePerim)


/////////////////Reclassify and export a thumbnail*////////


/* Step 4.1 Reclassify the image and display */
/* Severity values 
< 0.10       Vegetation regrowth + unburned
0.1 - 0.27   Low Severity
0.44 - 0.66  Moderate severity 
> 0.66       High severity */

//create severity color palette
var sevCol= ['#007f30', '#6e7f00', '#db8607', '#db0707']; // dark green, yellowgreen, orange,red

// reclassify the fire raster to a severity map
var severityMap = fire.add(fire.gt(0.66));
// display fire severity map
Map.addLayer(severityMap,
             {min: 0, max: 1, palette: sevCol},
             'fire severity map');
             
             
//Create a bar graph of the pixel counts for the different severity areas */
// Create histogram parameters
var histOpt = {
  title: 'Histogram of zones',
  hAxis: {title: 'Low Severity'},
  vAxis: {title: 'pixel count'},
  series: {
    0: {color: 'green'},
  }
};

//create histogram
var fireZones = ui.Chart.image.histogram(severityMap, firePerim)
    .setSeriesNames(['Fire pixel counts'])
    .setOptions(histOpt);
//*UC*
// print histogram
print(fireZones);


// Create a Thumbnail so you can share the link */
// Specify region by GeoJSON, define palette, set size of the larger aspect dimension.
var thumbnail2 = severityMap.getThumbURL({
  'min': 0,
  'max': 3,
  'palette': sevCol,
  'dimensions': 900
});

//*UC*
 print('GeoJSON region, palette, and max dimension:', thumbnail2);


