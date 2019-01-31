var config = {
  apiKey: "AIzaSyBlDIHhIWlKMXoR7Hwm0klOScus8da7FXc",
  authDomain: "train-schedule-2c9ba.firebaseapp.com",
  databaseURL: "https://train-schedule-2c9ba.firebaseio.com",
  projectId: "train-schedule-2c9ba",
  storageBucket: "train-schedule-2c9ba.appspot.com",
  messagingSenderId: "747766541073"
};
firebase.initializeApp(config);

var dataBase = firebase.database();

var name = "";
var destination = "";
var frequency = "";
var nextArrival = "";

// Removes table on delete button
$("body").on("click", ".delete", function() {
  console.log($(this).attr("data-key"));
  const elem = $(this).attr("data-key");
  dataBase
    .ref()
    .child(elem)
    .remove();
  $("#child-" + elem).remove();
});

var currentTime = moment().format("HH:mm a");
hourFormat = "HH:mm a";
console.log(currentTime);


// added Bart API for fun
var queryURL =
  "http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&key=QJM9-PAQW-9Y4T-DWE9&json=y";
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
    firstTrain: firstTrain,
    nextArrival: nextArrival
  });
});

// function diff_minutes(){
//   var timeDiff = Math.abs(moment(currentTime, "HH:mm").diff(moment(),"HH:mm"))%frequency;
//   console.log(timeDiff);
// }

// Appends database values to table
dataBase.ref().on(
  "child_added",
  function(snapshot) {
    $("#tableBody").append(
      "<tr id='child-" +
        snapshot.key +
        "'><td>" +
        snapshot.val().name +
        "</td><td>" +
        snapshot.val().destination +
        "</td><td>" +
        snapshot.val().frequency +
        "</td><td>" +
        snapshot.val().nextArrival +
        "</td><td>" +
        "0" +
        "</td><td><button class ='delete' data-key='" +
        snapshot.key +
        "'>Delete</button></td></tr>"
    );

    // // Time Diff calc
    const diff_mins = (_firstTrain, frequency) => {
      var minDiff =
        (Math.abs(moment(_firstTrain, "HH:mm").diff(moment(), "minutes")) %
          frequency) -
        frequency;
      return Math.abs(minDiff);
    };

    console.log(diff_mins);

    let diff = diff_mins(snapshot.val().firstTrain, snapshot.val().frequency);
    console.log(diff);
    let arrival = moment()
      .add(diff, "minutes")
      .format("hh:mm A");
    console.log(arrival);
  },


  
  function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  }

  
);
