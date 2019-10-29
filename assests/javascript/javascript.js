$(document).ready(function() {

  firebase.initializeApp(keys);

  var dataBase = firebase.database();

  var name = "";
  var destination = "";
  var frequency = "";

  var currentTime = moment().format("hh:mm A");
  $("#timeDisplay").text("The current time is: " + currentTime);

  // Removes table/train on delete button
  $("body").on("click", ".delete", function() {
    const elem = $(this).attr("data-key");
    dataBase
      .ref()
      .child(elem)
      .remove();
    $("#child-" + elem).remove();
  });

  // added Bart API for fun
  var queryURL =
    "http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&key="+keys.myUrlKey+"&json=y";
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    for (var i = 0; i < 5; i++) {
      bartName = response.root.station[i].name;
      bartDestination0 = response.root.station[i].etd[0].destination;
      bartDestination1 = response.root.station[i].etd[1].destination;
      bartDestination2 = response.root.station[i].etd[2].destination;
      bartDestination3 = response.root.station[i].etd[3].destination;
      bartMinAway0 = response.root.station[i].etd[0].estimate[0].minutes;
      bartMinAway1 = response.root.station[i].etd[1].estimate[0].minutes;
      bartMinAway2 = response.root.station[i].etd[2].estimate[0].minutes;
      bartMinAway3 = response.root.station[i].etd[3].estimate[0].minutes;

      $("#tableBody").append(
        "<tr><td>" +
          bartName +
          "</td><td>" +
          bartDestination0 +
          "<br>" +
          bartDestination1 +
          "<br>" +
          bartDestination2 +
          "<br>" +
          bartDestination3 +
          "</td><td>" +
          "" +
          "</td><td>" +
          "" +
          "</td><td>" +
          bartMinAway0 +
          "<br>" +
          bartMinAway1 +
          "<br>" +
          bartMinAway2 +
          "<br>" +
          bartMinAway3 +
          "<br>" +
          "</td></tr>"
      );
    }
  });

  // converts user input into variables, pushes to database, and clears input fields
  $("#submitBtn").on("click", function(event) {
    event.preventDefault();

    name = $("#formGroupExampleInput")
      .val()
      .trim();

    destination = $("#formGroupExampleInput2")
      .val()
      .trim();

    firstTrain = $("#formGroupExampleInput3")
      .val()
      .trim();

    frequency = $("#formGroupExampleInput4")
      .val()
      .trim();


    dataBase.ref().push({
      name: name,
      destination: destination,
      frequency: frequency,
      firstTrain: firstTrain
    });

    $("#formGroupExampleInput").val("");
    $("#formGroupExampleInput2").val("");
    $("#formGroupExampleInput3").val("");
    $("#formGroupExampleInput4").val("");
  });

  // gets snapshot of database
  dataBase.ref().on(
    "child_added",
    function(snapshot) {
      var name1 = snapshot.val().name;
      var destination1 = snapshot.val().destination;
      var frequency1 = snapshot.val().frequency;

      // Math for calculating next arrival
      // Could not figure out how to prevent next arrival time to not be less than the first train/prevent it from looping to next day
      const diff_mins = (currentTime, frequency1) => {
        var minDiff =
          (Math.abs(moment(currentTime, "HH:mm").diff(moment(), "minutes")) %
            frequency1) -
          frequency1;
        return Math.abs(minDiff);
      };

      let diff = diff_mins(snapshot.val().firstTrain, snapshot.val().frequency);

      let arrival = moment()
        .add(diff, "minutes")
        .format("hh:mm A");

      // Adds minutes away and arrival time to FireBase
      snapshot.ref.update({ diff: diff, arrival: arrival });

      // Appends variables to the table/page
      $("#tableBody").append(
        "<tr id='child-" +
          snapshot.key +
          "'><td>" +
          name1 +
          "</td><td>" +
          destination1 +
          "</td><td>" +
          frequency1 +
          "</td><td>" +
          arrival +
          "</td><td>" +
          diff +
          "</td><td><button class ='delete' data-key='" +
          snapshot.key +
          "'>Delete</button></td></tr>"
      );
    },

    function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    }
  );
});
