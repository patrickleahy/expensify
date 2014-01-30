<?php

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////// AJAX API ///////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  $partnerName     = 'applicant';
  $partnerPassword = 'd7c3119c6cdab02d68d9';
  
  switch ($_POST['submissionType']) {
    case 'formLogin': // Get the auth token and then get all account transactions
      $partnerUserID     = urlencode(htmlspecialchars($_POST['email']));
      $partnerUserSecret = urlencode(htmlspecialchars($_POST['password']));
      $authJson = getAuthToken($partnerName, $partnerPassword, $partnerUserID, $partnerUserSecret);
      $authToken = $authJson['authToken'];
      echo getAllAccountTransactions($partnerName, $partnerPassword, $authToken);
      break;
    case 'cookieLogin': // Given the auth token, get all account transactions
      $authToken = urlencode(htmlspecialchars($_POST['authToken']));
      echo getAllAccountTransactions($partnerName, $partnerPassword, $authToken);
      break;
    case 'createTransaction': // Given the auth token, create a new transaction
      $authToken = urlencode(htmlspecialchars($_POST['authToken']));
      $created   = urlencode(htmlspecialchars($_POST['created']));
      $amount    = urlencode(htmlspecialchars($_POST['amount']));
      $currency  = urlencode(htmlspecialchars($_POST['currency']));
      $merchant  = urlencode(htmlspecialchars($_POST['merchant']));
      echo createTransaction($authToken, $created, $amount, $currency, $merchant);
      break;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////// Expensify API /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  function getAuthToken($partnerName, $partnerPassword, $partnerUserID, $partnerUserSecret) {
    $authUrl = "https://api.expensify.com?command=Authenticate"
                 . "&partnerName=" . $partnerName
                 . "&partnerPassword=" . $partnerPassword
                 . "&partnerUserID=" . $partnerUserID
                 . "&partnerUserSecret=" . $partnerUserSecret
                 . "&useExpensifyLogin=true";
    $authResponse = file_get_contents($authUrl);
    $authJson = json_decode($authResponse, true);
    return $authJson;
  }

  function getAllAccountTransactions($partnerName, $partnerPassword, $authToken) {
    $transactionsUrl = "https://api.expensify.com?"
                         . "partnerName=" . $partnerName
                         . "&command=Get" 
                         . "&authToken=" . $authToken
                         . "&returnValueList=transactionList";
    $transactionsResponse = file_get_contents($transactionsUrl);
    return $transactionsResponse;
  }

  function createTransaction($authToken, $created, $amount, $currency, $merchant) {
    $createUrl = "https://api.expensify.com?command=CreateTransaction"
                    . "&authToken=" . $authToken
                    . "&created=" . $created
                    . "&amount=" . $amount * 100
                    . "&currency=" . $currency
                    . "&merchant=" . $merchant;
    $createResponse = file_get_contents($createUrl);
    return $createResponse;
  }
?>





