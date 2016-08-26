// ----------------------------------------------

// Used to set the item ID
var numberOfItems = 0
var quickAddExpanded = false

// Used to keep track of the elements currently on the list
var cardItems =[]
var totalCardTimes = 0

// Used to set the location of the cards
var locationObj = {}

// Used for sorting and redrawing the list
var todoCardArray = []


// Document Ready items
// Modal trigger and other event handlers
$(document).ready(function(){

  $('.modal-trigger').leanModal({
    dismissible: true, // Modal can be dismissed by clicking outside of the modal
    opacity: .5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
    starting_top: '4%', // Starting top style attribute
    ending_top: '10%', // Ending top style attribute
  })


  $("#item-location").focus(function() {
    let autocomplete = new google.maps.places.Autocomplete(document.getElementById('item-location'))
    autocomplete.addListener('place_changed', function() {
    locationObj = autocomplete.getPlace()
    })
  })


  // Quick add
  $("#quick-add-form").submit(function(event) {
    event.preventDefault()

    let photo

    if (locationObj.photos !== undefined) {
      photo = locationObj.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
    } else{
      photo = "./assets/images/no_photo_available_large.png"
    }

    let time = 60

    let newItem = {
      'name': $("#card-title").val(),
      'description':"",
      'time': time,
      'location': {
        address: $("#card-location").val(),
        place: locationObj
      },
      photo: photo,
      importance: "5",
      'itemId': 'item' + numberOfItems
    }

    $("#quickButtonDiv").remove()
    $("#quickLocationDiv").remove()

    quickAddExpanded = false
    totalCardTimes += time * 60

    if ($.isEmptyObject(cardItems)) {
      $("#instructions").remove()
      $("#sort-button").removeClass('disabled')
      $("#sort-button").attr('data-activates', 'sort-options')
      $('.dropdown-button').dropdown({
       inDuration: 300,
       outDuration: 225,
       constrain_width: false, // Does not change width of dropdown to that of the activator
       hover: true, // Activate on hover
       gutter: 0, // Spacing from edge
       belowOrigin: true, // Displays dropdown below the button
       alignment: 'right' // Displays dropdown with edge aligned to the left of button
     })
    }

    cardItems.push(newItem)
    todoCardArray.push(newItem.itemId)

    createCard(newItem)

    $('#quick-add-form').trigger('reset')

  })


  // Add item to list
  $("#add-item").submit(function(event) {

    event.preventDefault()

    let photo

    if (locationObj.photos !== undefined) {
      photo = locationObj.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
    } else{
      photo = "./assets/images/no_photo_available_large.png"
    }


    let time = Number($("#time-hr").val()) * 60 + Number($("#time-min").val())

    let newItem = {
      'name': $("#item").val(),
      'description': $("#item-description").val(),
      'time': time,
      'location': {
        address: $("#item-location").val(),
        place: locationObj
      },
      photo: photo,
      importance: $("#importance-scale").val(),
      'itemId': 'item' + numberOfItems
    }

    totalCardTimes += time * 60

    if ($.isEmptyObject(cardItems)) {
      $("#instructions").remove()
      $("#sort-button").removeClass('disabled')
      $("#sort-button").attr('data-activates', 'sort-options')
      $('.dropdown-button').dropdown({
       inDuration: 300,
       outDuration: 225,
       constrain_width: false, // Does not change width of dropdown to that of the activator
       hover: true, // Activate on hover
       gutter: 0, // Spacing from edge
       belowOrigin: true, // Displays dropdown below the button
       alignment: 'right' // Displays dropdown with edge aligned to the left of button
      })
    }

    cardItems.push(newItem)
    todoCardArray.push(newItem.itemId)

    createCard(newItem)

    $('#add-item').trigger('reset')
    $('#modal1').closeModal()

  })


  // Sort button event handlers
  $("#quickest-first").click(function() {

    cardItems = sortByShortestTime(cardItems)

    clearList()
    repopulateList(cardItems)

  })


  $("#longest-first").click(function() {

    cardItems = sortByLongestTime(cardItems)

    clearList()
    repopulateList(cardItems)

  })


  $("#importance").click(function() {

    cardItems = sortByImportance(cardItems)

    clearList()
    repopulateList(cardItems)

  })


  $("#name").click(function() {

    cardItems = sortByName(cardItems)

    clearList()
    repopulateList(cardItems)

  })


  $("#name-reverse").click(function() {

    cardItems = sortByNameReverse(cardItems)

    clearList()
    repopulateList(cardItems)

  })


  $("#origin").focus(function() {

    new google.maps.places.Autocomplete(document.getElementById('origin'))

  })


  $("#destination").focus(function() {

    new google.maps.places.Autocomplete(document.getElementById('destination'))

  })


  $("#get-directions").submit(function(event) {

    event.preventDefault()

    let origin = $("#origin").val()
    let destination = $("#destination").val()

    calculateRoute(cardItems, origin, destination)

    $('#get-directions').trigger('reset')
    $('#directions').closeModal();
  })


  $("#card-title").focus(function() {

    if (!quickAddExpanded){

      quickAddExpanded = true

      let newInputField = $("<div id='quickLocationDiv' class='input-field'>")
      let newButtonField = $("<div id='quickButtonDiv' class='input-field'>")
      let quickAddForm = $("#quick-add-form")

      newInputField.append("<label for='card-location'>Location</label>")
      newInputField.append("<input id='card-location' type='text' required>")
      newButtonField.append("<input type='submit' id='quick-add-submit' class='white-text btn' value='Add'>")

      quickAddForm.append(newInputField)
      quickAddForm.append(newButtonField)

      $("#card-location").focus(function() {

        var quickAutocomplete = new google.maps.places.Autocomplete(document.getElementById('card-location'))

        quickAutocomplete.addListener('place_changed', function() {

        locationObj = quickAutocomplete.getPlace()

        })
      })
    }
  })
})



//----------------------
// Basic CRUD functions
//----------------------

function createCard(todoItem) {

  let $row = $("<div id=" + todoItem.itemId + " class='row'>")
  let $col = $("<div class='col s10 m10'>")
  let $card = $("<div class='card horizontal hoverable'>")
  let $cardImage = $("<div class='card-image'>")
  let $cardStacked= $("<div class='card-stacked'>")
  let $cardContent = $("<div class='card-content teal lighten-5'>")
  let $cardName = $("<span class='card-title'>")
  let $cardActions = $("<div class='card-action'>")

  $cardName.text(todoItem.name.toUpperCase())

  $cardContent.append($cardName)
  $cardContent.append("<p>" + todoItem.description + "</p>")
  $cardContent.append("<p><a href='" + todoItem.location.place.url + "' target='_blank'>" + todoItem.location.address + "</a></p>")
  $cardContent.append("<p>Time to complete: " + formatTime(todoItem.time) + "</p>")

  $cardImage.append("<img height='200' width='200' src='"+ todoItem.photo + "'>")

  $cardActions.append("<a id='edit-item-" + todoItem.itemId + "' href='#0' name='"+ todoItem.itemId + "' >Edit</a>")
  $cardActions.append("<a id='delete-item-" + todoItem.itemId + "' href='#0' name='" + todoItem.itemId + "'>Delete</a>")

  $cardStacked.append($cardContent)
  $cardStacked.append($cardActions)
  $card.append($cardStacked)
  $card.append($cardImage)
  $col.append($card)
  $row.append($col)

  $("#todo-list").append($row)
  $("#edit-item-"+ todoItem.itemId).click(function(){editItem(todoItem.itemId)})
  $("#delete-item-" + todoItem.itemId).click(function(){deleteItem(todoItem.itemId)})

  locationObj = {}
  numberOfItems++

}


function editItem(itemId) {

  let $todoItem = $("#" + itemId)
  let index
  let searchTerm = itemId

  for(i in cardItems) {

    if (cardItems[i].itemId === searchTerm) {

      index = i;
      break;

    }
  }

  var editItemObj = cardItems[index]

  $todoItem.empty();

  let $col = $("<div class='col s8 m8'>")
  let $card = $("<div class='card hoverable'>")
  let $cardName = $("<span class='card-title'>")
  let $cardContent = $("<div class='card-content teal lighten-5'>")
  let $cardActions = $("<div class='card-action'>")
  let $editForm = $("<form id='edit-item-" + itemId + "' action='index.html' method='post'>")

  $cardName.append("<input id='edit-" + itemId + "-name' type='text' value='" + editItemObj.name + "'>")

  $editForm.append($cardName)
  $editForm.append("<div class='row'> <div class='input-field col s3 m3 l3'> <input id='edit-"+ itemId + "-time-hours' type='text' value='" + Math.floor(editItemObj.time / 60) + "'></div><div class='input-field col s3 m3 l3'><input id='edit-"+ itemId + "-time-minutes' type='text' value='" + editItemObj.time % 60 + "'></div></div>")
  $editForm.append("<textarea id='edit-" + itemId + "-description' name='edit-item-description' rows='8' cols='40'>" + editItemObj.description + "</textarea>")
  $editForm.append("<input id='edit-" + itemId + "-location' value='" + editItemObj.location.address + "' >")

  $cardActions.append("<input form='edit-item-"+ itemId +"' class='button-save btn' type='submit' value='Save'>")

  $cardContent.append($editForm)
  $card.append($cardContent)
  $card.append($cardActions)
  $col.append($card)
  $todoItem.append($col)

  let editAutocomplete = new google.maps.places.Autocomplete(document.getElementById('edit-'+ itemId +'-location'))
  let editLocationObj = cardItems[index].location.place

  editAutocomplete.addListener('place_changed', function() {
    editLocationObj = editAutocomplete.getPlace()
  })


  $("#edit-item-" + itemId).submit(function(event){

    event.preventDefault()

    let photo

    if (editLocationObj.photos !== undefined) {
      photo = editLocationObj.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})
    } else{
      photo = "/imgaes/no_photo_available_large"
    }

    cardItems[index] = {
      name: $("#edit-"+ itemId + "-name").val(),
      description:  $("#edit-"+ itemId + "-description").val(),
      location: {
        address: $("#edit-"+ itemId + "-location").val(),
        place: editLocationObj
      },
      photo: photo,
      time: Number($("#edit-" + itemId + "-time-hours").val()) * 60 + Number($("#edit-" + itemId + "-time-minutes").val()),
      itemId: itemId
    }

    $todoItem.remove()

    createCard(cardItems[index])

  })
}


function deleteItem(itemId) {

  let searchTerm = itemId
  let index

  for(i in cardItems) {
    if (cardItems[i].itemId === searchTerm) {
      index = i;
      break;
    }

  }

  totalCardTimes -= cardItems[index].time * 60

  delete cardItems[index]

  $("#"+itemId).remove()

  if($.isEmptyObject(cardItems)) {
    clearList()

    $("#todo-list").append("<div id='instructions' class='row'><div class='col'><div class='card hoverable'><div class='card-content'><p class='flow-text'>Add some more cards and try some of the sort functions provided to you!</p></div></div></div></div>")
    $("#sort-button").attr("data-activates", "")
  }
}




//----------------------
// Sort functions
//----------------------

function sortByName(array) {

  return array.sort(function(a, b) {return a.name.toLowerCase() > b.name.toLowerCase()})

}


function sortByNameReverse(array) {

  return array.sort(function(a, b) {return a.name.toLowerCase() < b.name.toLowerCase()})

}


function sortByShortestTime(array) {

  return array.sort(function(a, b) {return a.time > b.time})

}


function sortByLongestTime(array) {

  return array.sort(function(a, b) {return a.time < b.time})

}


function sortByImportance(array) {

  return array.sort(function(a, b) {return Number(a.importance) < Number(b.importance)})

}


function calculateRoute(array, origin, destination) {

  var directionsService = new google.maps.DirectionsService;
  var waypts = []
  var totalTime = 0
  var totalDistance = 0

  for (item in array) {
    waypts.push({
      location: cardItems[item].location.address,
      stopover: true
    })
  }

  directionsService.route({
    origin: origin,
    destination: destination,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {

    if (status === 'OK') {

      var route = response.routes[0];
      var newRoute = []
      var newCardArray =[]

      for (var i = 0; i < route.legs.length; i++) {
        totalTime += route.legs[i].duration.value
        totalDistance += route.legs[i].distance.value
      }

      for(place of route["waypoint_order"]) {
        newRoute.push(waypts[place].location)
      }

      for(address of newRoute) {
        for (index in cardItems) {
          if(cardItems[index].location.address === address){
            newCardArray.push(cardItems[index])
          }
        }
      }

      cardItems =  newCardArray

      clearList()

      $("#todo-list").append("<div class='row'><div class='col m10'><div class='card horizontal'><div class='card-stacked'><div class='card-content green lighten-5'><p class=' teal-text flow-text'>" + origin + "</p><p class=' flow-text'> Your commute time is: " + Math.floor(Math.floor(totalTime / 60) / 60) + " hours " + Math.floor(totalTime/60) % 60 + " minutes and " + totalTime% 60 + " seconds</p></div></div></div></div></div>")

      repopulateList(cardItems)

      $("#todo-list").append("<div class='row'><div class='col m10'><div class='card horizontal'><div class='card-stacked'><div class='card-content green lighten-5'><p class=' teal-text flow-text'>" + destination + "</p><p> Total time for tasks and commute: " + Math.floor(Math.floor((totalTime + totalCardTimes) / 60) / 60) + " hours " + Math.floor((totalTime + totalCardTimes)/60) % 60 + " minutes and " + (totalTime + totalCardTimes)% 60 + " seconds</p></div></div></div></div></div>")

    } else {
      window.alert('Directions request failed due to ' + status);
    }
  })
}



// Clear the screen of cards
function clearList() {

  $("#todo-list").empty()
  
}


// Remake all the cards that are saved in cardItems array
function repopulateList(list) {

  for(item in list) {
    createCard(list[item])
  }

}



//--------------------------
// Formating functions
//--------------------------

function formatTime(time) {

  let hours = Math.floor(time / 60)
  let minutes = time % 60

  if (minutes < 10) {
    minutes = "0" + minutes
  }

  return hours + " hours and " + minutes + " minutes"

}
