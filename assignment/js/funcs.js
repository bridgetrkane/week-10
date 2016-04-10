var sublayer = [];

function nClosest(point, n) {
  // The SQL in english:
  // SELECT (all data) FROM (the table, mf_offices_merge_1)
  // ORDER BY (distance of these geoms from the provided point)
  // LIMIT (to n cases)
  var sql = 'SELECT * FROM mf_offices_merge_1 ORDER BY the_geom <-> ST_Point(' + point.lng + ',' + point.lat + ') LIMIT ' + n;

  $.ajax('https://bridgetrkane.cartodb.com/api/v2/sql/?q=' + sql).done(function(results) {
    console.log(n +' closest:', results);
    addRecords(results);
  });
}

/** Find all points within the box constructed */
function pointsWithin(rect) {
  // Grab the southwest and northeast points in this rectangle
  var sw = rect[0];
  var ne = rect[2];

  var sql = 'SELECT * FROM mf_offices_merge_1 WHERE the_geom @ ST_MakeEnvelope(' +
  sw.lng + ','+ sw.lat + ',' + ne.lng + ',' + ne.lat + ', 4326)';

  $.ajax('https://bridgetrkane.cartodb.com/api/v2/sql/?q=' + sql).done(function(results) {
    //console.log('pointsWithin:', results);
    addRecords(results);
  });
}

$( "#go" ).click(function() {
  var sql = 'SELECT * FROM mf_offices_merge_1 WHERE (total_shareholders >= ' + $('#numeric-input').val() + ')';
  console.log(sql);
  $.ajax('https://bridgetrkane.cartodb.com/api/v2/sql/?q=' + sql).done(function(results) {
    addRecords(results);
  });

  var layerTwo = 'https://bridgetrkane.cartodb.com/api/v2/viz/eb502dfa-fb3b-11e5-bd49-0ea31932ec1d/viz.json';
  cartodb.createLayer(map, layerTwo)
  .addTo(map)
  .on('done', function(layer) {
    sublayer = layer.getSubLayer(0);
    sublayer.setSQL('SELECT * FROM mf_offices_merge_1 WHERE (total_shareholders >= ' + $('#numeric-input').val() + ')');
    sublayer.on('featureClick', function(e, latlng, pos, data) {
    });
  }).on('error', function(err) {
    // console.log(err):
  });
});

$( "#clear" ).click(function() {
  sublayer.remove();
  $('#project-list').text('');
});

/*_.each(Within.features, function(element) {
  var template = '<div  class = "shape" id= "shape-'+element.id+'" data-id = "'+element.id+'"> <p> <b>Location: '+element.properties.location+' </b><br> '+element.properties.total_shareholders+'</p> </div>';
  $('#shapes').append(template);
  $('[data-id = "'+element.id+'"]').on('click',function() {
    var clickId = $(this).data('id');
    var point =_.filter(Within.features,function(ob) {
      return ob.id === clickId;
    });

    L.geoJson(point, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      }
    }).addTo(map);
  });
});*/

/**
 * function for adding one record
 *
 * The pattern of writing the function which solves for 1 case and then using that function
 *  in the definition of the function which solves for N cases is a common way to keep code
 *  readable, clean, and think-aboutable.
 */
function addOneRecord(rec) {
  var location = $('<p></p>')
    .text('Location: ' + rec.location);

  var shareholders = $('<p></p>')
    .text('Total Shareholders: ' + rec.total_shareholders);


  var recordElement = $('<li></li>')
    .addClass('list-group-item')
    .append(location)
    .append(shareholders);

  $('#project-list').append(recordElement);
}

/** Given a cartoDB resultset of records, add them to our list */
function addRecords(cartodbResults) {
  $('#project-list').empty();
  _.each(cartodbResults.rows, addOneRecord);
}
