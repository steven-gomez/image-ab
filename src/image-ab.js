
var choices = [];
var outFile = 'test.csv';

var canvas_a = document.getElementById('canvas1');
var canvas_b = document.getElementById('canvas2');

// Does canvas A hold image "et"?
var a_is_et = false;

canvas_a.onclick = clickedA;
canvas_a.oncontextmenu = imageRightClicked;
canvas_b.onclick = clickedB;
canvas_b.oncontextmenu = imageRightClicked;

var rectW = 20, rectH = 20;
var currentImageIndex = -1;

var maxWidth = 800;
var maxHeight = 800;

// Logic for mouse button events
var mie = false; // TODO: check browser for internet explorer?
var left, right;
left = mie ? 1 : 0;
right = 2;

var img_a = new Image();
img_a.onload = function() {
  var w = this.width, h = this.height;
  var scale = 0;
  
  // If landscape aspect, get scale factor based on max dimension size
  if (w > h) {
    scale = maxWidth / w;
  } else {
    scale = maxHeight / h;
  }
  canvas_a.width = scale * w;
  canvas_a.height = scale * h;
  canvas_a.getContext('2d').drawImage(img_a, 0, 0, scale * w, scale * h);

};

var img_b = new Image();
img_b.onload = function() {
  var w = this.width, h = this.height;
  var scale = 0;
  
  // If landscape aspect, get scale factor based on max dimension size
  if (w > h) {
    scale = maxWidth / w;
  } else {
    scale = maxHeight / h;
  }
  canvas_b.width = scale * w;
  canvas_b.height = scale * h;
  canvas_b.getContext('2d').drawImage(img_b, 0, 0, scale * w, scale * h);

};

var floor = Math.floor;

/**
 * Grab the mouse coordinates of the event relative to the canvas.
 */
function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - floor(rect.left),
    y: e.clientY - floor(rect.top)
  };
}

/**
 * Draw an individual marker. Box with cross in it.
 */
function drawMarker(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.x-floor(rectW/2), p.y-floor(rectH/2));
  ctx.lineTo(p.x+floor(rectW/2), p.y+floor(rectH/2));
  ctx.closePath();
  ctx.strokeStyle = 'red';
  ctx.stroke();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.moveTo(p.x-floor(rectW/2), p.y+floor(rectH/2));
  ctx.lineTo(p.x+floor(rectW/2), p.y-floor(rectH/2));
  ctx.closePath();
  ctx.strokeStyle = 'red';
  ctx.stroke();
  
  ctx.strokeStyle = 'black';
  ctx.strokeRect(p.x-floor(rectW/2), p.y-floor(rectH/2), rectW, rectH);
}
  
/**
 * Draw markers on the canvas corresponding to click points on the current image.
 */
function drawMarkers(canvas) {
  var points = imageSet.images[currentImageIndex].points;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  
  for (var i = 0; i < points.length; i++) {
    drawMarker(ctx, points[i]);
  } 
  drawPointList();
}   

/**
 * Add to DOM a list corresponding to click points on the current image.
 */
function drawPointList(points) {
  var points = imageSet.images[currentImageIndex].points;
  var dataString = '';
  var dataStringArray = [];
   
  $('#pointlistDiv ul').html('');
  
  points.forEach(function(p) {
    
    // dataString for each point is "<imageName>, x, y"
    dataString = imageSet.images[currentImageIndex].name + ', '+p.x+', '+p.y;
    dataStringArray.push(dataString);
    
    var newPointLi = '<li>' + dataString + '</li>';
    $('#pointlistDiv ul').append(newPointLi);
  });
  
  //writePointData(dataStringArray);
}  

function writeData(fileName, data) {
  var csvContent = "data:text/csv;charset=utf-8," + data.join('\n');
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  link.click(); // 'click' the link to trigger download
}
    
/**
 * When the image is clicked; keep track of that point in a data structure
 * associated with the current image, then redraw.
 */
function clickedA(e) {
  if (currentImageIndex < imageSet.images.length) {
    var choice = a_is_et ? 'et' : 'mt';
    var correct = a_is_et ? 'correct' : 'incorrect';
    choices.push({'name': imageSet.images[currentImageIndex].name, 
      'side': 'A', 'choice': choice, 'correct': correct});
  }
  console.log(choices);
  loadNextImage();
  return false;
}

function clickedB(e) {
  if (currentImageIndex < imageSet.images.length) {
    var choice = a_is_et ? 'mt' : 'et';
    var correct = a_is_et ? 'incorrect' : 'correct';
    choices.push({'name': imageSet.images[currentImageIndex].name,
      'side': 'B', 'choice': choice, 'correct': correct});
  }
  console.log(choices);
  loadNextImage();
  return false;
}

/**
 * Image is right-clicked; pop point and redraw.
 */
function imageRightClicked(e) {
  /*
  var points = imageSet.images[currentImageIndex].points;
  points.pop();
  drawMarkers(canvas, points);
  */
  return false;
}

/**
 * Load image to canvas based on index in imageset.
 */
function loadImageIndex(i) {
  if (imageSet.images.length === 0 || i < 0 || i >= imageSet.images.length) {
    console.log('Error: loadImageIndex requires valid image index '
      + 'as argument: given \''+i+'\', array length is '+imageSet.images.length);
      
    // If off-by-one error at the end of the non-empty images array (e.g., trying to increment
    // the last valid index)...
    if (i === imageSet.images.length && imageSet.images.length > 0) {
      //currentImageIndex--;
      downloadChoicesCsv(outFile);
      $('#imageDiv').hide();
      $('#headerText').text('Thank you!');
    }  
    return false;
  }
  var newImg = imageSet.images[i];
  
  // Augment the imageSet data with a new array for clicks on this image
  imageSet.images[i].points = [];
  
  // Load image into the canvas by setting the img source and redrawing on context
  console.log('Loading '+newImg.name);
  
  
  if (Math.round(Math.random())) {
    img_a.src = newImg.et_path;
    img_b.src = newImg.mt_path;
    a_is_et = true;
  } else {
    img_a.src = newImg.mt_path;
    img_b.src = newImg.et_path;
    a_is_et = false;
  }
  
  var msg = "A: MT -- B: ET";
  if (a_is_et) {
    msg = "A: ET -- B: MT";
  }
  console.log(msg);
  
  /*
  $('#imageCounterTitle').text((i+1)+'/'+imageSet.images.length);
  $('#imageTask').text(imageSet.images[i].task);
  */
}

/**
 * Load next image to canvas based on the current one.
 */
function loadNextImage() {
  loadImageIndex(++currentImageIndex);
  //drawMarkers(canvas);
}

/**
 * Download all choice data as csv.
 */
function downloadChoicesCsv(fileName) {
  var allChoiceData = [];
  choices.forEach(function(c) {
    var dataString = c.name+','+c.side+','+c.choice+','+c.correct;
    allChoiceData.push(dataString);
    console.log("Pushing selection: "+dataString);
  });
  writeData(fileName, allChoiceData);
}
  
/* Set up event handlers ---------------------------- */

$('#nextImgAnchor').click(function() {
  loadNextImage();
});

$('#downloadAnchor').click(function() {
  downloadChoicesCsv(outFile);
});

/* Load initial image if there is one --------------- */

$('#headerText').text('Click the image overlaid with the EYE TRACKING heatmap');

if (imageSet.images.length > 0) {
  // Start with first image in array
  currentImageIndex = 0;
  loadImageIndex(currentImageIndex);
}
