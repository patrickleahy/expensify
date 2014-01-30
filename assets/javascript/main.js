$(document).on('ready', function () {

  // Instantiate the jQuery datepicker and fill the field with today's date as default
  $('#datepicker').val($.datepicker.formatDate('yy-mm-dd', new Date()));
  $("#datepicker").datepicker({dateFormat:'yy-mm-dd'});;

  // Automatically log the user in if the authToken cookie is present
  if ($.cookie('authToken') !== undefined) {
    $('#signInlogOut').text("Log Out");
    $('#spinny').show();
    displayNotification('Logging you in, one moment');
    var data = $.param({ submissionType: 'cookieLogin', authToken: $.cookie('authToken') });
    getTransactions(data);
  } else {
    $('#loginWrapper').show();
  }

  // Logic for submitting the login form
  $("form#formLogin").on("submit", function(event) {
    event.preventDefault();
    $("#errors").hide();
    $('#loginWrapper').hide();
    $('#spinny').show();
    displayNotification('Logging you in, one moment');
    var data = $(this).serialize();
    getTransactions(data);
  });

  // Open the "Create Transaction" modal
  $("a#createTransactionLink").on("click", function(event) {
    event.preventDefault();
    $('#dimLights').show();
    $("body").css("overflow", "hidden");
    $('#createTransactionWrapper').show();
  });

  // Logic for submitting the "Create Transaction" form
  $("form#createTransaction").on("submit", function(event) {
    event.preventDefault();
    var newTransaction = serializedArrayToObject($(this).serializeArray());

    $('#dimLights').hide();
    $("body").css("overflow", "visible");
    $('#createTransactionWrapper').hide();

    var data = $(this).serialize();
    makeAjaxRequest(data, function (response, textStatus, jqXHR) {
      var response = JSON.parse(response);
      if (response['jsonCode'] === 200) {
        newTransaction['amount'] = newTransaction['amount'] * -100;
        appendTransaction(newTransaction);
      } else {
        displayError('Error creating transaction!');
      }
    });
  });

  // Hide the "Create Transaction" modal if it is directly clicked by the user
  $('#dimLights').on("click", function(event) {
    $('#dimLights').hide();
    $('#createTransactionWrapper').hide();
    $("body").css("overflow", "visible");
  });

  // Perform cleanup when the user logs out
  $("a#signInlogOut").on("click", function(event) {
    event.preventDefault();
    if ($.cookie('authToken') !== undefined) {
      $.removeCookie('authToken');
      $('tbody').empty();
      $('#signInlogOut').text("Sign In");
      $('#tableWrapper').hide();
      $('#spinny').hide();
      $('#loginWrapper').show();
      displayNotification('Logged out successfully');
    }
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Utility Functions /////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

function getTransactions (data) {
  makeAjaxRequest(data, function (response, textStatus, jqXHR) {
    var response = JSON.parse(response);
    if (response["httpCode"] === 200) {
      $('#signInlogOut').text("Log Out");
      $('#spinny').hide();
      $('#tableWrapper').show();
      $.cookie('authToken', response['authToken']);
      $('input.authToken').val(response['authToken']);

      var transactions = response['transactionList'];
      for (var i = 0; i < transactions.length; i++) {
        appendTransaction(transactions[i]);
      }
    } else {
      $('#spinny').hide();
      $('#loginWrapper').show();
      displayError('Username or password incorrect!');
    }
  });
}

function makeAjaxRequest (data, callback) {
  request = $.ajax({
    url: "/form.php",
    type: "post",
    data: data
  });

  request.done(function (response, textStatus, jqXHR) {
    callback(response, textStatus, jqXHR);
  });

  request.fail(function (jqXHR, textStatus, errorThrown) {
    displayError("The following error occured: " + textStatus + " " + errorThrown);
  });
}

function serializedArrayToObject (serializedArray) {
  var object = {};
  for (var i = 0; i < serializedArray.length; i++) {
    object[serializedArray[i]['name']] = serializedArray[i]['value'];
  }
  return object;
}

function appendTransaction (transaction) {
  $('tbody').append($('<tr>'));
  $tr = $('tbody').find('tr:last');
  $tr.append($('<td>').text($('tr').length - 1));
  $tr.append($('<td>').text(transaction['created']));
  $tr.append($('<td>').text(transaction['merchant']));
  $tr.append($('<td>').text(transaction['amount']/100));
}

function displayNotification(text) {
  $("#notifications").show();
  $('#notifications p.alert').text(text);
  $("#notifications").fadeOut(1000);
}

function displayError (text) {
  $("#errors").show();
  $('#errors p.alert').text(text);
}