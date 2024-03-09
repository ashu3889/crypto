'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require('express');
var path = require('path');
var app = express();
var PORT = process.env.PORT || 5000;
var axios = require('axios');
var _ = require('lodash');
var $ = require('jquery');
var jStat = require('jStat').jStat;
var Window = require('window');
var CryptoObject = require('crypto-object');
var crypto = require('crypto');
var sha256 = require('sha256');
//var msrcrypto = require('msrcrypto');
//0.001

var sig = '';
var meanBuy = 1;
var meanSell = 1;
var sdBuy = 1;
var sdSell = 1;

var combodata = [];
var MinDepth = 3;
var MinSpread = 0.0010;
var MinCER = 0;
var OptPos = [];
var FutPos = [];
var ShortOpt = 0;
var LongOpt = 0;
var Risk_Residual = 0;
var Max_Risk = 2;
var NumberOfQuotes = 3;
var globalURL = "https://test.deribit.com";

var HedgingFutureName = 'BTC-PERPETUAL';
var deltaTradeDirection = '';
var totalDeltaHedger = 0;
var filteredInstruments = [];
var setTimeOutVar;
var deltaQuantity = 0;

var globalDelta = 0;
var globalDeltaDiff = 0;

var instrumentSelectionInterval = 600000;

//app.use(express.static(path.join(__dirname, 'build')));

/*app.get('*', function (req, res) {
	console.log('ashutosshhshhshsh');
 res.sendFile(path.join(__dirname, 'build', 'index.html'));
});*/

app.get('/', function (req, res) {
  console.log('ashutosshhshhshsh');
  // res.send(jsonArray);

  getDeribitiveInstrumentFirsCall();
  res.send('hello world');
});

function startDetecting() {
  //start detecting instruments
  getDeribitiveInstrument();
}

function generateRepitiveOrders(data) {
  //function to fetch  instruments after some interval

  var uri = '/api/v1/private/positions';
  var params = {};
  var globalURL = "https://test.deribit.com";

  authHeader(uri, params, function (auth) {

    axios({
      method: 'get',
      url: globalURL + uri,
      async: false,
      data: params,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      headers: [{
        'x-deribit-sig': sig
      }],
      beforeSend: function beforeSend(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      }
    }).then(function (data) {
      generateOpenPositions(data.result, filteredInstruments);
    }).catch(function (e) {
      console.log(e);
      cancelOrderAll();
      startDetecting();
    });
  });
}

function generateOpenPositions(data, selectedInstrument) {

  if (data !== undefined) {
    data.map(function (value, index) {
      if (value.instrument.slice(-1) === "C" || value.instrument.slice(-1) === "P") {
        OptPos.push(value);
        if (value.direction === "buy") {
          LongOpt = LongOpt + value.size;
        } else if (value.direction === "sell") {
          ShortOpt = ShortOpt + value.size;
        }
      } else if (value.instrument.slice(-1) !== "P" && value.instrument.slice(-1) !== "C") {
        FutPos.push(value);
      }
    });
    Risk_Residual = Max_Risk - ShortOpt;
  }
  generateInstrumentQuantity(selectedInstrument);
}

function generateInstrumentQuantity(data) {
  //function to calculate instrument quanitity
  var comboArray = [];

  if (data.TUCalls !== undefined && data.TUPuts !== undefined) {
    data.TUCalls.map(function (value, index) {
      var r = value.floatAttractiveness_Index;
      var n = NumberOfQuotes;
      var Qty = 2 * Risk_Residual * (n - r) / (n * (n + 1));
      var rounded = Math.abs(parseFloat(Qty.toFixed(1)));
      // Math.round(Qty*10)/10;
      data.TUCalls[index].Qty = rounded;
    });

    data.TUPuts.map(function (value, index) {
      var r = value.floatAttractiveness_Index;
      var n = NumberOfQuotes;
      var Qty = 2 * Risk_Residual * (n - r) / (n * (n + 1));
      //var rounded = Math.round(Qty*10)/10;
      var rounded = Math.abs(parseFloat(Qty.toFixed(1)));
      data.TUPuts[index].Qty = rounded;
    });
    comboArray = accumulateCallAndPutTrades(data.TUCalls, data.TUPuts);
  }

  generateOrderBook(comboArray);
}

function generateOrderBook(comboArray) {

  //function to calculate for open positions
  getOpenPosition();

  //function to calculate for open orders 
  //here we have to get latest orderbook...
  //debugger;  
  generateCleanBookForOpenOrders(comboArray, 'openorder');

  //getOpenOrderBook(comboArray , 2);
}

function accumulateCallAndPutTrades(calldata, putdata) {

  var comboArray = [];

  if (calldata !== undefined && putdata !== undefined) {

    calldata.map(function (v, i) {
      comboArray.push(v);
    });

    putdata.map(function (v, i) {
      comboArray.push(v);
    });
  }

  return comboArray;
}

function getOpenPosition() {
  try {

    //var auth;
    var uri = '/api/v1/private/positions';
    var params = {};
    authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        generateCleanBookAndPriceForOpenPositions(data.result, 'position');
        // getDeltaHedeger(data.result);
      }).catch(function (e) {
        console.log(e);
        cancelOrderAll();
        startDetecting();
      });

      /* $.ajax({
         method : 'GET',
         url : globalURL + uri,
         async : false,
         data : params,
         contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
         headers : [ {
           'x-deribit-sig' : sig
         } ],
         beforeSend : function(req) {
           req.setRequestHeader('x-deribit-sig', sig);
           req.setRequestHeader('Access-Control-Allow-Origin', '*');
         },
         success : function(data) {
         try{
      ;
          // if(data.result !=undefined && data.result > 0){
              generateCleanBookAndPriceForOpenPositions(data.result ,'position');
              getDeltaHedeger(data.result);
           
           
         }catch(e){
               console.log(e);
               cancelOrderAll();
               startDetecting();
           //onStart();
         }
         },error:function(data){
           //getPosition();
         },
         dataType : 'json'
       });*/
    });
  } catch (e) {
    console.log(e);
    cancelOrderAll();
    startDetecting();
  }
}

//testing
function generateCleanBookAndPriceForOpenPositions(data, type) {

  var positionOrderData = [];

  if (data != undefined) {

    data.map(function (value, index) {

      var uri = 'https://test.deribit.com/api/v1/public/getorderbook?instrument=';
      var combourl = '' + uri + value.instrument;

      //var price = value.averagePrice;
      var tradeDirection = value.direction;
      var instrumentName = value.instrument;
      var sizeOfQty = value.size;
      //first check if our order is there in public orderbook

      axios.get(combourl).then(function (response) {

        var orderdata = response.data.result;

        if (orderdata !== undefined) {
          // var d = value.instrument;
          //clearning feilds
          orderdata.asksArray = [];
          orderdata.bidsArray = [];
          orderdata.asksQuantity = [];
          orderdata.bidsQuantity = [];
          orderdata.asksCM = [];
          orderdata.bidsCM = [];
          orderdata.CleanedBuyOrderBook = [];
          orderdata.CleanedSellOrderBook = [];
          orderdata.callOptPrice = [];
          orderdata.sellOptPrice = [];

          orderdata.asksArray = _.map(response.data.result.asks, 'price');
          orderdata.bidsArray = _.map(response.data.result.bids, 'price');
          orderdata.asksQuantity = _.map(response.data.result.asks, 'quantity');
          orderdata.bidsQuantity = _.map(response.data.result.bids, 'quantity');
          orderdata.asksCM = _.map(response.data.result.asks, 'cm');
          orderdata.bidsCM = _.map(response.data.result.bids, 'cm');
          orderdata.instrumentName = instrumentName;
          orderdata.tickSize = 0.0005;
          orderdata.SendTrade = [];
          orderdata.direction = tradeDirection;
          orderdata.sizeofqty = sizeOfQty;

          //adding it to position array
          positionOrderData.push(orderdata);
        }

        if (positionOrderData.length === data.length && type === "position") {
          // ;//tinuuuu
          getOpenOrderBook(positionOrderData, 4);
        }
      });
    });
  }
}

function generateCleanBookForOpenOrders(data, type) {

  var positionOrderData = [];

  if (data != undefined) {

    data.map(function (value, index) {

      var uri = 'https://test.deribit.com/api/v1/public/getorderbook?instrument=';
      var combourl = '' + uri + value.instrumentName;
      var instrumentName = value.instrumentName;
      var sizeOfQty = value.Qty;

      axios.get(combourl).then(function (response) {

        var orderdata = response.data.result;

        if (orderdata !== undefined) {
          // var d = value.instrument;
          //clearning feilds
          orderdata.asksArray = [];
          orderdata.bidsArray = [];
          orderdata.asksQuantity = [];
          orderdata.bidsQuantity = [];
          orderdata.asksCM = [];
          orderdata.bidsCM = [];
          orderdata.CleanedBuyOrderBook = [];
          orderdata.CleanedSellOrderBook = [];
          orderdata.callOptPrice = [];
          orderdata.sellOptPrice = [];

          orderdata.asksArray = _.map(response.data.result.asks, 'price');
          orderdata.bidsArray = _.map(response.data.result.bids, 'price');
          orderdata.asksQuantity = _.map(response.data.result.asks, 'quantity');
          orderdata.bidsQuantity = _.map(response.data.result.bids, 'quantity');
          orderdata.asksCM = _.map(response.data.result.asks, 'cm');
          orderdata.bidsCM = _.map(response.data.result.bids, 'cm');
          orderdata.instrumentName = instrumentName;
          orderdata.tickSize = 0.0005;
          orderdata.SendTrade = [];
          orderdata.Qty = sizeOfQty;
          positionOrderData.push(orderdata);
        }

        if (positionOrderData.length === data.length && type === "openorder") {
          // debugger;
          getOpenOrderBook(positionOrderData, 2);
        }
      });
    });
  }
}

function triggerOrders(optiondata) {
  getOpenOrderBook(optiondata, 1);
}

/*function fireAllOrders(callArr,putArr){


        callArr.map((value, index) => {

           value.SendTrade.map((v,i) => {
              if(v.direction ==="buy"){
                //place buy ordee
                 buyOrder(v.instrument ,v.price ,v.quantity);
              }
              else if(v.direction ==="sell"){
              //place sell order
                sellOrder(v.instrument ,v.price ,v.quantity);
              }
                    
            })
          });

        putArr.map((value, index) => {
          value.SendTrade.map((v,i) => {
            if(v.direction ==="buy"){
              //place buy ordee
              buyOrder(v.instrument ,v.price ,v.quantity);
            }
            else if(v.direction ==="sell"){
              //place sell order
               sellOrder(v.instrument ,v.price ,v.quantity);
            }
          });

         });
}*/

function buyOrder(instrument, bidBest, bidBestQuant) {
  try {

    var uri = '/api/v1/private/buy';
    //console.log("in buyOrder->  bidBestQuant= " + bidBestQuant + " bid= "+ bidBest);
    var params = {
      "instrument": instrument,
      "quantity": bidBestQuant,
      "price": bidBest,
      "post_only": true
    };

    authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
        // getDeltaHedeger(data.result);
        // console.log(JSON.stringify(data));
        // console.log(data);

      }).catch(function (e) {
        console.log(e);
        //cancelOrderAll();
        //startDetecting();
      });

      /*  $.ajax({
            method : 'GET',
            url : globalURL + uri,
            async : false,
            data : params,
            contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
            headers : [ {
                'x-deribit-sig' : sig
            } ],
            beforeSend : function(req) {
                req.setRequestHeader('x-deribit-sig', sig);
                req.setRequestHeader('Access-Control-Allow-Origin', '*');
            },
            success : function(data) {
              
                console.log(JSON.stringify(data));
                // getPosition();
                //console.log("buy done");
            },error:function(err){
                    console.log(err);
                    cancelOrderAll();
                    startDetecting();
            },
            dataType : 'json'
        });*/
    });
  } catch (e) {
    console.log(e);
    cancelOrderAll();
    startDetecting();
  }
}
function sellOrder(instrument, bestPriceSell, bestQuant) {
  try {

    var uri = '/api/v1/private/sell';
    var params = {
      "instrument": instrument,
      "quantity": bestQuant,
      "price": bestPriceSell,
      "post_only": true

      //console.log("in sellOrder->  qunatity= " + bestQuant + " bid= "+ bestPriceSell);
    };authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        //console.log(data);
        // getPosition();

      }).catch(function (e) {
        console.log(e);
        //cancelOrderAll();
        //startDetecting();
      });

      /* $.ajax({
           method : 'GET',
           url : globalURL + uri,
           async : false,
           data : params,
           contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
           headers : [ {
               'x-deribit-sig' : sig
           } ],
           beforeSend : function(req) {
               req.setRequestHeader('x-deribit-sig', sig);
               req.setRequestHeader('Access-Control-Allow-Origin', '*');
           },
           success : function(data) {
           
                console.log(JSON.stringify(data));
               // getPosition();
               //console.log("sell done");
           },error:function(err){
            
               console.log(err);
               //getPosition();
           },
           dataType : 'json'
       });*/
    });
  } catch (e) {
    console.log(e);
    cancelOrderAll();
    startDetecting();
  }
}
function editOrder(row, price, size) {
  try {

    var uri = '/api/v1/private/edit';

    var params = {
      "orderId": row,
      "quantity": size,
      "price": price,
      "post_only": true
      //console.log("edit order -> orderID= " + row.orderId + "quatity= " + size
      //  + "price=" + price + "direction=" + row.direction);
    };authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
        // getDeltaHedeger(data.result);
        console.log('edit order');
        // console.log(data);
        // console.log(JSON.stringify(data));
      }).catch(function (e) {
        console.log(e);
        //cancelOrderAll();
        //startDetecting();
      });

      /* $.ajax({
           method : 'GET',
           url : globalURL + uri,
           async : false,
           data : params,
           contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
           headers : [ {
               'x-deribit-sig' : sig
           } ],
           beforeSend : function(req) {
               req.setRequestHeader('x-deribit-sig', sig);
               req.setRequestHeader('Access-Control-Allow-Origin', '*');
           },
           success : function(data) {
            
            console.log('edit order');
            console.log(JSON.stringify(data));
               // getPosition();
               //console.log("edit done")
           },error:function(err){
             
               console.log(err);
               //getPosition();
           },
           dataType : 'json'
       });*/
    });
  } catch (e) {
    console.log(e);
    cancelOrderAll();
    startDetecting();
  }
}

function cancelOrder(OrderId) {
  try {
    //console.log("In cancelorder & order id=" + OrderId);
    var uri = '/api/v1/private/cancel';

    var params = {
      "orderId": OrderId
    };

    authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
        // getDeltaHedeger(data.result);
        // console.log('cancel order');
        console.log(data);
        // console.log(JSON.stringify(data));
      }).catch(function (e) {
        console.log(e);
        //cancelOrderAll();
        //startDetecting();
      });

      /* $.ajax({
           method : 'GET',
           url : globalURL + uri,
           async : false,
           data : params,
           contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
           headers : [ {
               'x-deribit-sig' : sig
           } ],
           beforeSend : function(req) {
               req.setRequestHeader('x-deribit-sig', sig);
               req.setRequestHeader('Access-Control-Allow-Origin', '*');
           },
           success : function(data) {
                // alert(JSON.stringify(data));
               //console.log("cancel done");
           },error:function(err){
           console.log(err);
               //getPosition();
           },
           dataType : 'json'
       });*/
    });
  } catch (e) {
    console.log(e);
    cancelOrderAll();
    startDetecting();
  }
}

function cancelOrderAll() {

  try {

    //console.log("cancel all triggred");
    var uri = '/api/v1/private/cancelall';
    var params = {
      "type": "all"
    };

    authHeader(uri, params, function (auth) {

      axios({
        method: 'get',
        url: globalURL + uri,
        async: false,
        data: params,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        headers: [{
          'x-deribit-sig': sig
        }],
        beforeSend: function beforeSend(req) {
          req.setRequestHeader('x-deribit-sig', sig);
          req.setRequestHeader('Access-Control-Allow-Origin', '*');
        }
      }).then(function (data) {
        // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
        // getDeltaHedeger(data.result);
        console.log('cancel all order');
        console.log(data);
        //console.log(JSON.stringify(data));
      }).catch(function (e) {
        console.log(e);
        //cancelOrderAll();
        //startDetecting();
      });

      /* $.ajax({
           method : 'GET',
           url : globalURL + uri,
           async : false,
           data : params,
           contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
           headers : [ {
               'x-deribit-sig' : sig
           } ],
           beforeSend : function(req) {
               req.setRequestHeader('x-deribit-sig', sig);
               req.setRequestHeader('Access-Control-Allow-Origin', '*');
           },
           success : function(data) {
             
               // alert(JSON.stringify(data));
               //console.log('cancel all');
           },error:function(err){
               console.log(err);
               //getPosition();
           },
           dataType : 'json'
       });*/
    });
  } catch (e) {
    console.log(e);
    startDetecting();
  }
}

function generateOptimalPrice(optiondata) {

  //debugger;

  optiondata.map(function (value, index) {

    var mid = (Number(value.asksArray[0]) + Number(value.bidsArray[0])) / 2;

    value.CleanedBuyOrderBook.map(function (v, i) {
      /* var subsValue= parseFloat(mid)-parseFloat(v.price);
       var logVar=jStat.lognormal.cdf(Math.max(0.1,v.cm),meanBuy,sdBuy);
       v.optimalValue=subsValue*(parseFloat(1)-logVar);*/

      var subsValue = parseFloat(mid.toFixed(4)) - parseFloat(v.price.toFixed(4));
      subsValue = parseFloat(subsValue.toFixed(4));
      var logVar = parseFloat(jStat.lognormal.cdf(Math.max(0.1, v.cm), meanBuy, sdBuy).toFixed(4));
      var powerVal = parseFloat(Math.pow(parseFloat(1) - parseFloat(logVar), parseFloat(1)).toFixed(4));
      var data = subsValue * powerVal;
      v.optimalValue = parseFloat(data.toFixed(4));

      v.direction = "buy";
      v.post_only = true;
      v.type = 'limit';
    });

    //sort the cleanbuyorderbook and keep the maximu spread value. _.sortBy(optiondata[0].CleanedBuyOrderBook, 'optimalValue').reverse(); 
    if (optiondata[index].CleanedBuyOrderBook.length > 0) {

      var foundIndex = _.findIndex(value.SendTrade, function (valueD) {
        return valueD.direction === "buy";
      });
      if (foundIndex !== -1) {
        value.SendTrade.splice(foundIndex, 1);
      }

      value.callOptPrice = _.sortBy(optiondata[index].CleanedBuyOrderBook, 'optimalValue').reverse()[0];

      if (_.isEmpty(value.callOptPrice) === false) {
        value.boolSendTrade = true;
        value.SendTrade.push(value.callOptPrice);
      }
    }

    value.CleanedSellOrderBook.map(function (v, i) {

      var subsValue = v.price - mid;
      subsValue = parseFloat(subsValue.toFixed(4));
      var logVar = parseFloat(jStat.lognormal.cdf(Math.max(0.1, v.cm), meanSell, sdSell).toFixed(4));
      var powerVal = parseFloat(Math.pow(parseFloat(1) - parseFloat(logVar), parseFloat(1)).toFixed(4));
      var data = subsValue * powerVal;
      v.optimalValue = parseFloat(data.toFixed(4));

      v.direction = "sell";
      v.post_only = true;
      v.type = 'limit';
    });

    if (optiondata[index].CleanedSellOrderBook.length > 0) {

      // if(value.instrumentName === "BTC-28SEP18-6000-C"){
      //  debugger;

      if (value.instrumentName === "BTC-28SEP18-6500-C") {
        // debugger;
      }

      var foundIndex = _.findIndex(value.SendTrade, function (valueD) {
        return valueD.direction === "sell";
      });
      if (foundIndex !== -1) {
        value.SendTrade.splice(foundIndex, 1);
      }

      //umaaaa
      // }

      value.sellOptPrice = _.sortBy(optiondata[index].CleanedSellOrderBook, 'optimalValue').reverse()[0];

      if (_.isEmpty(value.sellOptPrice) === false) {
        value.boolSendTrade = true;
        value.SendTrade.push(value.sellOptPrice);
      }
    }
  });

  //debugger;//
  //debugger;
  triggerOrders(optiondata);
}

function generateOptimalPriceForOpenPositionsAndDelta(optiondata, type) {

  //lovely

  optiondata.map(function (value, index) {
    //BTC-28SEP18-7000-C


    var mid = (Number(value.asksArray[0]) + Number(value.bidsArray[0])) / 2;

    value.CleanedBuyOrderBook.map(function (v, i) {
      var subsValue = parseFloat(mid.toFixed(4)) - parseFloat(v.price.toFixed(4));
      subsValue = parseFloat(subsValue.toFixed(4));
      var logVar = parseFloat(jStat.lognormal.cdf(Math.max(0.1, v.cm), meanBuy, sdBuy).toFixed(4));
      var powerVal = parseFloat(Math.pow(parseFloat(1) - parseFloat(logVar), parseFloat(1.5)).toFixed(4));
      var data = subsValue * powerVal;
      v.optimalValue = parseFloat(data.toFixed(4));

      v.direction = "buy";
      v.post_only = true;
      v.type = 'limit';
    });

    //sort the cleanbuyorderbook and keep the maximu spread value. _.sortBy(optiondata[0].CleanedBuyOrderBook, 'optimalValue').reverse(); 
    if (optiondata[index].CleanedBuyOrderBook.length > 0) {

      var foundIndex = _.findIndex(value.SendTrade, function (valueD) {
        return valueD.direction === "buy";
      });
      if (foundIndex !== -1) {
        value.SendTrade.splice(foundIndex, 1);
      }

      value.callOptPrice = _.sortBy(optiondata[index].CleanedBuyOrderBook, 'optimalValue').reverse()[0];
      if (_.isEmpty(value.callOptPrice) === false) {
        value.boolSendTrade = true;
        value.SendTrade.push(value.callOptPrice);
      }
    }

    value.CleanedSellOrderBook.map(function (v, i) {

      var subsValue = v.price - mid;
      subsValue = parseFloat(subsValue.toFixed(4));
      var logVar = parseFloat(jStat.lognormal.cdf(Math.max(0.1, v.cm), meanSell, sdSell).toFixed(4));
      var powerVal = parseFloat(Math.pow(1 - logVar, parseFloat(1.5)).toFixed(4));
      var data = subsValue * powerVal;
      v.optimalValue = parseFloat(data.toFixed(4));
      v.direction = "sell";
      v.post_only = true;
      v.type = 'limit';
    });

    if (optiondata[index].CleanedSellOrderBook.length > 0) {

      var foundIndex = _.findIndex(value.SendTrade, function (valueD) {
        return valueD.direction === "sell";
      });
      if (foundIndex !== -1) {
        value.SendTrade.splice(foundIndex, 1);
      }

      value.sellOptPrice = _.sortBy(optiondata[index].CleanedSellOrderBook, 'optimalValue').reverse()[0];
      if (_.isEmpty(value.sellOptPrice) === false) {
        value.boolSendTrade = true;
        value.SendTrade.push(value.sellOptPrice);
      }
    }
  });

  // now iterate over each array and fire orders

  if (type === "filterPositionData") {
    //  ;
    fireOppositeOrdersForOpenPosition(optiondata, 'openPosition');
  } else if (type === "deltaOrderBook") {
    // debugger;
    fireOppositeOrdersForOpenPosition(optiondata, 'delta');
    // getOpenOrderBookForOpenPositionsAndDelta(optiondata , 'delta');
  }
}

function fireOppositeOrdersForOpenPosition(openPosition, type) {

  var tradedir = deltaTradeDirection;

  if (type === "openPosition") {
    openPosition.map(function (value, index) {
      if (value.direction === "buy") {
        //removing buy from sendtrade array sizeofqty

        if (value.SendTrade.length === 2) {
          value.SendTrade.shift();
          value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
        } else if (value.SendTrade.length === 1 && value.SendTrade[0].direction === "sell") {
          value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
        }
      } else {
        //removing sell from sendtrade array

        if (value.SendTrade.length === 2) {
          value.SendTrade.pop();
          value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
        } else if (value.SendTrade.length === 1 && value.SendTrade[0].direction === "buy") {
          value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
        }
      }
    });
  } else if (type === "delta") {
    //debugger;
    openPosition.map(function (value, index) {

      //  debugger;

      if (deltaTradeDirection === "sell") {
        //removing buy from sendtrade array sizeofqty

        if (value.SendTrade.length === 2) {
          value.SendTrade.shift();
          var qty = globalDeltaDiff * value.SendTrade[0].price / 10;
          var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
          value.SendTrade[0].quantity = Math.round(roundOfQty);

          ///ashutosh look hereee
        } else if (value.SendTrade.length === 1 && value.SendTrade[0].direction === "sell") {
          var qty = globalDeltaDiff * value.SendTrade[0].price / 10;
          var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
          value.SendTrade[0].quantity = Math.round(roundOfQty);
        }
      } else if (deltaTradeDirection === "buy") {
        //removing sell from sendtrade array

        if (value.SendTrade.length === 2) {
          value.SendTrade.pop();
          var qty = globalDeltaDiff * value.SendTrade[0].price / 10;
          var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
          value.SendTrade[0].quantity = Math.round(roundOfQty);
        } else if (value.SendTrade.length === 1 && value.SendTrade[0].direction === "buy") {
          var qty = globalDeltaDiff * value.price / 10;
          var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
          value.SendTrade[0].quantity = Math.round(roundOfQty);
        }
      }
    });
  }

  /// conflicted zone here.. watchout

  if (type === "delta") {
    //  debugger;
    getOpenOrderBookForOpenPositionsAndDelta(openPosition, 'delta');
  } else if (type === "openPosition") {
    getOpenOrderBookForOpenPositionsAndDelta(openPosition, 'openPosition');
  }
}

function fireOrderForDeltaHedgerCopy(deltaHedgerData, openOrderBookData) {

  //debugger;

  var tradedir = deltaTradeDirection;
  var sendTrade = deltaHedgerData[0].SendTrade;
  var orderBookData = openOrderBookData.result;

  //check if future value exist in open poition or not

  var foundIndex = _.findIndex(orderBookData, function (valueD) {
    return valueD.instrument === "BTC-PERPETUAL";
  });

  if (foundIndex !== -1) {
    // debugger;
    //
    var foundIndexTradeDirection = orderBookData[foundIndex].direction;

    if (foundIndexTradeDirection === tradedir) {

      console.log('future position is present already now we have to edit that');
      var openOrderID = orderBookData[foundIndex].orderId;

      sendTrade.map(function (v, i) {
        if (v.direction === tradedir) {
          //setting price value for delta hedger
          //Qty = OptionsDelta * Price of Instrument (Hedging Future Input) / 10.

          var qty = globalDeltaDiff * v.price / 10;
          var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
          v.quantity = Math.round(roundOfQty);
          editOrder(openOrderID, v.price, v.quantity); //Math.round(2.5);
        }
      });
    }
  } else {
    //we have to fire the order
    //debugger;
    sendTrade.map(function (v, i) {
      if (v.direction === tradedir) {
        //setting price value for delta hedger
        //Qty = OptionsDelta * Price of Instrument (Hedging Future Input) / 10.
        var qty = globalDeltaDiff * v.price / 10;
        v.quantity = parseFloat(qty.toFixed(1));
        //;
        console.log('orders firing for delta');
        fireOrder(v, 'delta');
      }
    });
  }
}

function accumulateAllSendTrades(calldata, putdata) {

  var combinedSendTradeArr = [];

  calldata.map(function (v, i) {
    v.SendTrade.map(function (a, b) {
      combinedSendTradeArr.push(a);
    });
  });

  putdata.map(function (v, i) {
    v.SendTrade.map(function (a, b) {
      combinedSendTradeArr.push(a);
    });
  });

  return combinedSendTradeArr;
}

function comparePositionCleanOrderBookWithOpenOrderbook(positiondata, openOrderBook, type) {

  var combinedSendTradeArr = [];
  positiondata.map(function (v, i) {
    if (v.SendTrade[0] != undefined) {
      combinedSendTradeArr.push(v.SendTrade[0]);
    }
  });

  var openOrderBook = openOrderBook.result;

  if (combinedSendTradeArr.length > 0) {

    combinedSendTradeArr.map(function (value, index) {
      var direction = value.direction;
      var instrumentName = value.instrument;
      var orderPrice = value.price;
      var orderQuantity = value.quantity;
      var sameDirectionDiffPrice = false;
      var foundIndex = _.findIndex(openOrderBook, function (valueD) {
        return valueD.instrument == instrumentName && valueD.direction === direction;
      });

      var deltaIndex = _.findIndex(openOrderBook, function (valueD) {
        return valueD.instrument == "BTC-PERPETUAL";
      });

      if (type === "delta" && deltaIndex !== -1) {
        cancelOrder(openOrderBook[deltaIndex].orderId);
        fireOrder(value, 'delta');
      }

      if (deltaIndex === -1 && type === "delta") {
        fireOrder(value, 'delta');
      }

      if (foundIndex == -1) {
        console.log('fire index' + index);
        console.log('orders firing for position');

        if (type === "openPosition" && instrumentName !== "BTC-PERPETUAL") {

          //debugger;

          fireOrder(value, 'position');
        } else if (instrumentName === "BTC-PERPETUAL" && type !== "delta") {
          //debugger;
          // fireOrder(value,'delta');
        }
      } else {

        var openOrderDirection = openOrderBook[foundIndex].direction;
        var openOrderPrice = openOrderBook[foundIndex].price;
        var openOrderQuantity = openOrderBook[foundIndex].quantity;
        var openOrderID = openOrderBook[foundIndex].orderId;

        var sameDirection;
        var sameQuantity;
        var samePrice;

        if (openOrderDirection === direction) {
          sameDirection = true;
        } else {
          sameDirection = false;
        }

        if (openOrderQuantity === orderQuantity) {
          sameQuantity = true;
        } else {
          sameQuantity = false;
        }

        if (openOrderPrice === orderPrice) {
          samePrice = true;
        } else {
          samePrice = false;
        }

        if (type === "openPosition") {

          if (instrumentName === "BTC-PERPETUAL") {}

          if (sameDirection === true && samePrice === false && sameQuantity === true && instrumentName !== "BTC-PERPETUAL") {
            //fire edit orders here
            //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
            editOrder(openOrderID, orderPrice, orderQuantity);
          }

          if (sameDirection === true && samePrice === true && sameQuantity === false && instrumentName !== "BTC-PERPETUAL") {
            //fire edit orders here
            editOrder(openOrderID, orderPrice, orderQuantity);
          }

          if (sameDirection === true && samePrice === false && sameQuantity === false && instrumentName !== "BTC-PERPETUAL") {
            //fire edit orders here
            //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
            editOrder(openOrderID, orderPrice, orderQuantity);
          }

          ////////////////////////////////////////////////////////////////////////////////////////

          /* if( sameDirection === true && samePrice === false && sameQuantity === true && instrumentName === "BTC-PERPETUAL"){
                //fire edit orders here
                //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
                debugger;
                editOrder(openOrderID,orderPrice,orderQuantity);
             
            }
            if( sameDirection === true && samePrice === true && sameQuantity === false && instrumentName === "BTC-PERPETUAL"){
                //fire edit orders here
                debugger;
                editOrder(openOrderID,orderPrice,orderQuantity);
           }
             if( sameDirection === true && samePrice === false && sameQuantity === false && instrumentName === "BTC-PERPETUAL"){
                //fire edit orders here
                //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
               debugger;
                editOrder(openOrderID,orderPrice,orderQuantity);
           }*/
        }

        if (type === "delta") {
          //debugger
          //alert('do nothing now...');


        }
      } //else ends here
    });
  } //combo loop ends here

  //code to cancel order goes here

  if (type === "openPosition") {
    //debugger;
    openOrderBook.map(function (value, index) {
      var oppDirection;
      var direction = value.direction;
      var instrumentName = value.instrument;
      var orderID = value.orderId;

      if (direction === "buy") {
        oppDirection = "sell";

        var foundIndex = _.findIndex(combinedSendTradeArr, function (valueD) {
          return valueD.instrument == instrumentName && valueD.direction === direction;
        });
        //debugger;
        if (foundIndex === -1) {
          //debugger;
          cancelOrder(orderID);
          //no data found time to fire cancel order for open orders..
          //alert('time to fire closing order for'+instrumentName);
        }
      }
    });
  }
}

function compareCleanOrderBookWithOpenOrderbook(optiondata, openOrderBook, type) {

  var combinedSendTradeArr = [];

  if (type !== "delta") {
    optiondata.map(function (v, i) {
      v.SendTrade.map(function (a, b) {
        combinedSendTradeArr.push(a);
      });
    });
  } else if (type === "delta") {
    //debugger;
    combinedSendTradeArr = optiondata;
  }

  var openOrderBook = openOrderBook.result;

  combinedSendTradeArr.map(function (value, index) {

    // ;

    var direction = value.direction;
    var instrumentName = value.instrument;
    var orderPrice = value.price;
    var orderQuantity = value.quantity;

    //bababababa
    var foundIndex = _.findIndex(openOrderBook, function (valueD) {
      return valueD.instrument === instrumentName && valueD.direction === direction;
    });

    if (instrumentName === "BTC-28SEP18-6000-C" && direction === "sell") {
      var testdata = combinedSendTradeArr;
      //   debugger;
    }

    //check if repeated orders ae fired or not
    // var repeatedData = openOrderBook.filter((user) => user.instrument === instrumentName && user.direction === direction && user.price ===orderPrice);


    if (foundIndex === -1) {
      fireOrder(value, 'selection');
    } else {

      var openOrderDirection = openOrderBook[foundIndex].direction;
      var openOrderPrice = openOrderBook[foundIndex].price;
      var openOrderQuantity = openOrderBook[foundIndex].quantity;
      var openOrderID = openOrderBook[foundIndex].orderId;

      var sameDirection;
      var sameQuantity;
      var samePrice;

      if (openOrderDirection === direction) {
        sameDirection = true;
      } else {
        sameDirection = false;
      }

      if (openOrderQuantity === orderQuantity) {
        sameQuantity = true;
      } else {
        sameQuantity = false;
      }

      if (openOrderPrice === orderPrice) {
        samePrice = true;
      } else {
        samePrice = false;
      }

      if (sameDirection === true && samePrice === true && sameQuantity === true) {
        //exact same do nothing here
        //  alert('Do no trades here');
      }

      if (sameDirection === true && (samePrice === false || sameQuantity === false)) {
        //fire edit orders here
        if (samePrice === true && sameQuantity === false) {
          //edit quantity
          console.log('edit quantity is fired for ' + instrumentName);
          // editOrder(openOrderID,openOrderPrice, orderQuantity );


          //new changes
          /* cancelOrder(openOrderID);
           value.instrument = instrumentName ;
           value.price = openOrderPrice;
           value.quantity = orderQuantity;
           fireOrder(value , 'selection');*/
        } else if (samePrice === false && sameQuantity === true) {
          //edit price and  not quantity
          console.log('edit price is fired for ' + instrumentName);
          editOrder(openOrderID, orderPrice, openOrderQuantity);
          /* cancelOrder(openOrderID);
           value.instrument = instrumentName ;
           value.price = orderPrice;
           value.quantity = openOrderQuantity;
           fireOrder(value , 'selection');*/
        } else if (samePrice === false && sameQuantity === false) {
          //edit both
          console.log('edit quantity and price is fired for ' + instrumentName);
          editOrder(openOrderID, openOrderPrice, openOrderQuantity);
          /* cancelOrder(openOrderID);
           value.instrument = instrumentName ;
           value.price = openOrderPrice;
           value.quantity = openOrderQuantity;
           fireOrder(value , 'selection');*/
        }
      }
    }
  });

  // fire next order 

  setTimeOutVar = global.setTimeout(function () {
    generateRepitiveOrders(filteredInstruments);
  }, 4000);

  //  setTimeOutVar();

}

function fireOrder(v, type) {

  //commenting buying logic once and for all
  if (v.direction === "buy" && type !== "selection") {
    //place buy ordee

    console.log('buy order is fired for' + v.instrument);
    buyOrder(v.instrument, v.price, v.quantity);
  }
  if (v.direction === "sell") {
    //place sell order
    console.log('sell  order is fired for' + v.instrument);
    sellOrder(v.instrument, v.price, v.quantity);
  }
}

function compareOurDeltaPositionWithOpenDeltaOrderbook(optiondata, openOrders, type) {

  //check if instrument is there in optionbook instrumentName and price quantity

  if (openOrders.result != undefined && openOrders.result.length > 0) {

    openOrders.result.map(function (value, index) {
      //var instrumentName = "BTC-26OCT18-9000-C";
      //var orderPrice = 0.0335;
      // var orderQuantity = 4.2;
      var direction = value.direction;
      var instrumentName = value.instrument;
      var orderPrice = value.price;
      var orderQuantity = value.quantity;

      index = _.findIndex(optiondata, function (valueD) {
        return valueD.instrumentName === instrumentName;
      });

      if (index === -1) {} else {

        //do opeartion here and see the quantity
        if (direction === "buy") {
          //get the bid bid array and see if the value is present in there or not
          var bidindex = _.findIndex(optiondata[index].bidsArray, function (bid) {
            return bid === orderPrice;
          });
          if (bidindex !== -1) {

            if (optiondata[index].bidsQuantity[bidindex] === orderQuantity) {
              optiondata[index].bidsArray.splice(bidindex, 1);
              optiondata[index].bidsQuantity.splice(bidindex, 1);
              optiondata[index].bidsCM.splice(bidindex, 1);
              optiondata[index].spy = true;
            }
          } else {
            //do nothing here
          }
        } else if (direction === "sell") {

          //get the ask array and see if the value is present in there or not
          var askindex = _.findIndex(optiondata[index].asksArray, function (ask) {
            return ask === orderPrice;
          });
          if (askindex !== -1) {

            // var askquantityIndex = _.findIndex(optiondata[index].asksQuantity, function(askQty) { return askQty == orderQuantity});
            if (optiondata[index].asksQuantity[askindex] === orderQuantity) {
              optiondata[index].asksArray.splice(askindex, 1);
              optiondata[index].asksQuantity.splice(askindex, 1);
              optiondata[index].asksCM.splice(askindex, 1);
              optiondata[index].spy = true;
            }
          } else {
            //do nothing here
          }
        }
      }
    });
  }

  //debugger; //open order book comparison here

  generateCleanOrderBook(optiondata, 'deltaOrderBook');
}

function compareOurOrderVsOpenOrderBook(optiondata, openOrders, type) {

  //check if instrument is there in optionbook instrumentName and price quantity

  if (type == "position") {
    ;
  }

  if (openOrders.result != undefined && openOrders.result.length > 0) {

    openOrders.result.map(function (value, index) {

      var direction = value.direction;
      var instrumentName = value.instrument;
      var orderPrice = value.price;
      var orderQuantity = value.quantity;

      index = _.findIndex(optiondata, function (valueD) {
        return valueD.instrumentName === instrumentName;
      });

      if (index == -1) {} else {

        //do opeartion here and see the quantity
        if (direction === "buy") {
          //get the bid bid array and see if the value is present in there or not
          var bidindex = _.findIndex(optiondata[index].bidsArray, function (bid) {
            return bid === orderPrice;
          });
          if (bidindex !== -1) {

            if (instrumentName === "BTC-28SEP18-8500-C") {
              // ; 
              //lovely

            }

            if (optiondata[index].bidsQuantity[bidindex] === orderQuantity) {
              optiondata[index].bidsArray.splice(bidindex, 1);
              optiondata[index].bidsQuantity.splice(bidindex, 1);
              optiondata[index].bidsCM.splice(bidindex, 1);
              optiondata[index].spy = true;
            }
          } else {
            //do nothing here
          }
        } else if (direction === "sell") {

          //get the ask array and see if the value is present in there or not
          var askindex = _.findIndex(optiondata[index].asksArray, function (ask) {
            return ask === orderPrice;
          });
          if (askindex !== -1) {

            // var askquantityIndex = _.findIndex(optiondata[index].asksQuantity, function(askQty) { return askQty == orderQuantity});
            if (optiondata[index].asksQuantity[askindex] === orderQuantity) {
              optiondata[index].asksArray.splice(askindex, 1);
              optiondata[index].asksQuantity.splice(askindex, 1);
              optiondata[index].asksCM.splice(askindex, 1);

              optiondata[index].spy = true;
            }
          } else {
            //do nothing here
          }
        }
      }
    });
  }

  if (type === "position") {
    //  ;
    // lovely
    generateCleanOrderBook(optiondata, 'filterPositionData');
  } else if (type === "open") {
    generateCleanOrderBook(optiondata);
  }
}

function getOpenOrderBook(optiondata, param) {

  var auth;
  var uri = '/api/v1/private/getopenorders';
  var params = {};

  authHeader(uri, params, function (auth) {

    axios({
      method: 'get',
      url: globalURL + uri,
      async: false,
      data: params,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      headers: [{
        'x-deribit-sig': sig
      }],
      beforeSend: function beforeSend(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      }
    }).then(function (data) {
      // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
      // getDeltaHedeger(data.result);
      if (param === 1) {
        //cureently commenting it
        compareCleanOrderBookWithOpenOrderbook(optiondata, data, 'selection');
      } else if (param === 2) {
        //debugger;
        compareOurOrderVsOpenOrderBook(optiondata, data, 'open');
      } else if (param === 3) {
        //for delta hedger
        //  debugger;
        compareOurDeltaPositionWithOpenDeltaOrderbook(optiondata, data, 'delta');
        //  compareCleanOrderBookWithOpenOrderbook(optiondata,data,'delta');
      } else if (param === 4) {
        //for open position we will compare with our data
        compareOurOrderVsOpenOrderBook(optiondata, data, 'position');
      }
    }).catch(function (e) {
      console.log(e);
      cancelOrderAll();
      startDetecting();
    });

    /* $.ajax({
       method : 'GET',
       url : globalURL + uri,
       async : false,
       data : params,
       contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
       headers : [ {
         'x-deribit-sig' : sig
       } ],
      beforeSend : function(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      },
      success : function(data) {
        try{
           //send the data to next function to evaluate the result
          if(param ===1 ){
              //cureently commenting it
              compareCleanOrderBookWithOpenOrderbook(optiondata,data ,'selection');
          }
          else if(param === 2 ){
            //debugger;
              compareOurOrderVsOpenOrderBook(optiondata, data , 'open');
          }
          else if(param ===3 ){
              //for delta hedger
            //  debugger;
              compareOurDeltaPositionWithOpenDeltaOrderbook(optiondata, data , 'delta');
            //  compareCleanOrderBookWithOpenOrderbook(optiondata,data,'delta');
          }
          else if(param === 4 ){
               //for open position we will compare with our data
              compareOurOrderVsOpenOrderBook(optiondata, data ,'position');
          }
           //ashutooosssssss
          }catch(e){
          //cancelOrderAll();
          console.log(e);
          cancelOrderAll();
          startDetecting();
                 
         }
      },error:function(data){
    //getPosition();
       },
      dataType : 'json'
    });*/
  });
}

///telstra
/*if(value.instrument == "BTC-26OCT18-8000-C"){
                 ;
           }*/

function getOpenOrderBookForOpenPositionsAndDelta(openposition, type) {
  var auth;
  var uri = '/api/v1/private/getopenorders';
  var params = {};

  authHeader(uri, params, function (auth) {

    axios({
      method: 'get',
      url: globalURL + uri,
      async: false,
      data: params,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      headers: [{
        'x-deribit-sig': sig
      }],
      beforeSend: function beforeSend(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      }
    }).then(function (data) {
      // generateCleanBookAndPriceForOpenPositions(data.result ,'position');
      // getDeltaHedeger(data.result);
      if (type === "openPosition") {
        comparePositionCleanOrderBookWithOpenOrderbook(openposition, data, type);
      } else if (type === "delta") {
        comparePositionCleanOrderBookWithOpenOrderbook(openposition, data, type);
      }
    }).catch(function (e) {
      console.log(e);
      cancelOrderAll();
      startDetecting();
    });
  });
}

function generateCleanOrderBook(optiondata, optionType) {

  optiondata.map(function (value, index) {

    // var spread = value.Spread;console.log


    var asksArray = value.asksArray;
    var asksQuantity = value.asksQuantity;
    var bidsArray = value.bidsArray;
    var bidsQuantity = value.bidsQuantity;
    var instrumentName = value.instrumentName;
    var spreadValue = 0;
    if (value.asksArray.length > 0 && value.bidsArray.length > 0) {
      spreadValue = Number((value.asksArray[0] - value.bidsArray[0]).toFixed(4));
    }

    if (instrumentName === "BTC-28SEP18-7000-C") {
      //  ;

    }

    var tickSize = value.tickSize;
    var asksCM = value.asksCM;
    var bidsCM = value.bidsCM;

    var globalindex = index;
    optiondata[globalindex].CleanedSellOrderBook = [];
    optiondata[globalindex].CleanedBuyOrderBook = [];

    if (spreadValue > 2 * tickSize) {

      //adding two ticks to the bids side and substracting two ticks to asks side

      //removing tick from asks side and calculatig cm

      if (asksArray.length > 1 && asksQuantity.length > 1) {

        for (var i = 0; i < asksArray.length; i++) {
          var cm = 0;

          asksArray[i] = asksArray[i] - tickSize;
          var pricedata = parseFloat(asksArray[i].toFixed(4));
          var quantdata = parseFloat(asksQuantity[i].toFixed(4));

          //logic to write cm for each clean sell order book
          if (i === 0) {
            cm = 0;
          } else {
            //dding cumulative cm
            cm = optiondata[globalindex].CleanedSellOrderBook[i - 1].cm + asksQuantity[i - 1];
          }

          var cmdata = parseFloat(cm.toFixed(4));
          // debugger;

          var data = { 'quantity': value.Qty, 'cm': cmdata, 'price': pricedata, 'instrument': instrumentName };
          optiondata[globalindex].CleanedSellOrderBook.push(data);
        }
      }

      if (asksArray.length === 1 && asksQuantity.length === 1) {

        //debugger;
        var data = { 'quantity': value.Qty, 'cm': asksCM[0], 'price': asksArray[0], 'instrument': instrumentName };

        optiondata[globalindex].CleanedSellOrderBook.push(data);
      }

      //adding ticks to bids side and calculatig cm  //parseInt(asksArray[i].toPrecision(4)) 

      if (bidsArray.length > 1 && bidsQuantity.length > 1) {

        for (var i = 0; i < bidsArray.length; i++) {
          var cm = 0;
          bidsArray[i] = tickSize + bidsArray[i];

          var pricedata = parseFloat(bidsArray[i].toFixed(4));
          var quantdata = parseFloat(bidsQuantity[i].toFixed(4));

          //logic to write cm for each clean sell order book
          if (i === 0) {
            cm = 0;
          } else {
            //adding cumulative cm
            cm = optiondata[globalindex].CleanedBuyOrderBook[i - 1].cm + bidsQuantity[i - 1];
          }

          var cmdata = parseFloat(cm.toFixed(4));
          var data = _defineProperty({ 'quantity': value.Qty, 'cm': cmdata, 'price': pricedata, 'instrument': instrumentName }, 'cm', cm);
          optiondata[globalindex].CleanedBuyOrderBook.push(data);
        }
      }

      if (bidsArray.length === 1 && bidsQuantity.length === 1) {
        // debugger;

        var data = { 'quantity': value.Qty, 'cm': bidsCM[0], 'price': bidsArray[0], 'instrument': instrumentName };

        optiondata[globalindex].CleanedBuyOrderBook.push(data);
      }

      //got the index of same values now
    } else if (spreadValue <= 2 * tickSize) {

      if (asksArray.length === 1 && asksQuantity.length === 1) {
        //debugger;

        var data = { 'quantity': value.Qty, 'cm': asksCM[0], 'price': asksArray[0], 'instrument': instrumentName };

        optiondata[globalindex].CleanedSellOrderBook.push(data);
      }

      if (bidsArray.length === 1 && bidsQuantity.length === 1) {

        var data = { 'quantity': value.Qty, 'cm': bidsCM[0], 'price': bidsArray[0], 'instrument': instrumentName };

        optiondata[globalindex].CleanedBuyOrderBook.push(data);
      }

      if (asksArray.length > 1 && asksQuantity.length > 1) {
        for (var i = 1; i < value.asksArray.length; i++) {
          if (i > 0) {
            var data = parseFloat(asksArray[i].toFixed(4)) - tickSize;
            asksArray[i] = parseFloat(data.toFixed(4));
          }
        }
      }

      //adding ticks to bids side
      if (bidsArray.length > 1 && bidsQuantity.length > 1) {
        for (var i = 1; i < value.bidsArray.length; i++) {
          if (i > 0) {
            var data = tickSize + parseFloat(bidsArray[i].toFixed(4));
            bidsArray[i] = parseFloat(data.toFixed(4));
          }
        }
      }

      //check if ask first and second value is same


      if (asksArray.length > 1 && asksQuantity.length > 1) {
        if (asksArray[1] === asksArray[0]) {
          asksQuantity[0] = parseFloat(asksQuantity[0].toFixed(4)) + parseFloat(asksQuantity[1].toFixed(4));
          //we hv to remove asksArray,askquantity
          asksArray.splice(1, 1);
          asksQuantity.splice(1, 1);
        }
      }

      if (bidsArray.length > 1 && bidsQuantity.length > 1) {
        if (bidsArray[1] === bidsArray[0]) {
          bidsQuantity[0] = parseFloat(bidsQuantity[0].toFixed(4)) + parseFloat(bidsQuantity[1].toFixed(4));
          bidsArray.splice(1, 1);
          bidsQuantity.splice(1, 1);
        }
      }

      //removing tick from asks side and calculatig cm

      if (asksArray.length > 1 && asksQuantity.length > 1) {
        for (var i = 0; i < asksArray.length; i++) {

          var pricedata = parseFloat(asksArray[i].toFixed(4));
          var quantdata = parseFloat(asksQuantity[i].toFixed(4));

          var cm = 0;
          //logic to write cm for each clean sell order book
          if (i == 0) {
            cm = 0;
          } else {
            //dding cumulative cm
            cm = optiondata[globalindex].CleanedSellOrderBook[i - 1].cm + asksQuantity[i - 1];
          }
          // debugger;

          var cmdata = parseFloat(cm.toFixed(4));
          var data = { 'quantity': value.Qty, 'cm': cmdata, 'price': pricedata, 'instrument': instrumentName };
          optiondata[globalindex].CleanedSellOrderBook.push(data);
        }
      }

      //adding ticks to bids side and calculatig cm

      if (bidsArray.length > 1 && bidsQuantity.length > 1) {

        for (var i = 0; i < bidsArray.length; i++) {
          var cm = 0;
          //logic to write cm for each clean sell order book
          if (i === 0) {
            cm = 0;
          } else {
            //adding cumulative cm
            cm = optiondata[globalindex].CleanedBuyOrderBook[i - 1].cm + bidsQuantity[i - 1];
          }

          var pricedata = parseFloat(bidsArray[i].toFixed(4));
          var quantdata = parseFloat(bidsQuantity[i].toFixed(4));
          var cmdata = parseFloat(cm.toFixed(4));

          var data = _defineProperty({ 'quantity': value.Qty, 'cm': cmdata, 'price': pricedata, 'instrument': instrumentName }, 'cm', cm);
          optiondata[globalindex].CleanedBuyOrderBook.push(data);
        }
      }
    } else {
      console.log('33');
    }
  });

  if (optionType === "filterPositionData") {
    generateOptimalPriceForOpenPositionsAndDelta(optiondata, optionType);
  } else if (optionType === "deltaOrderBook") {
    //   debugger;
    generateOptimalPriceForOpenPositionsAndDelta(optiondata, optionType);
  } else {
    generateOptimalPrice(optiondata);
  }
}

function generateOrders(data) {

  var selectedInstrument = data;

  var auth;
  var uri = '/api/v1/private/positions';
  var params = {};
  var globalURL = "https://test.deribit.com";

  authHeader(uri, params, function (auth) {

    axios({
      method: 'get',
      url: globalURL + uri,
      async: false,
      data: params,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      headers: [{
        'x-deribit-sig': sig
      }],
      beforeSend: function beforeSend(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      }
    }).then(function (data) {
      generateOpenPositions(data.result, selectedInstrument);
    }).catch(function (e) {
      console.log(e);
      cancelOrderAll();
      startDetecting();
    });

    /* $.ajax({
       method : 'GET',
       url : globalURL + uri,
       async : false,
       data : params,
       contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
       headers : [ {
         'x-deribit-sig' : sig
       } ],
      beforeSend : function(req) {
        req.setRequestHeader('x-deribit-sig', sig);
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
      },
      success : function(data) {
        try{
          // alert(JSON.stringify(data));
          generateOpenPositions(data.result , selectedInstrument);
           }catch(e){
          //start repetitive 
            console.log(e);
            cancelOrderAll();
            startDetecting();
         
         }
      },error:function(data){
    //getPosition();
       },
      dataType : 'json'
    });*/
  });
}

function objectToString(obj, encode) {
  var result = [];
  Object.keys(obj).sort().forEach(function (key) {
    var value = obj[key];
    if (Array.isArray(value) && !encode) {
      value = value.join('');
    } else if (encode) {
      value = encodeURIComponent(value);
    }

    if (encode) {
      key = encodeURIComponent(key);
    }

    result.push(key + "=" + value);
  });

  return result.join('&');
};

function msTstampUtc() {
  var d = new Date(),
      ms = d.getTime() + d.getTimezoneOffset() * 60000;
  return ms;
};

function serialize(tstamp, accKey, accSec, uri, params) {
  var key,
      keys = [],
      i,
      l,
      s = '';
  for (key in params) {
    if (params.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  keys.sort();
  for (i = 0, l = keys.length; i < l; i = i + 1) {
    key = keys[i];
    s = s + '&' + key + '=' + params[key];
  }
  return '_=' + tstamp + '&_ackey=' + accKey + '&_acsec=' + accSec + '&_action=' + uri + s;
};

function str2buffer(str) {
  var bytes = new Uint8Array(str.length);
  for (var iii = 0; iii < str.length; iii++) {
    bytes[iii] = str.charCodeAt(iii);
  }

  return bytes;
};

function authHeader(uri, params, callback) {

  var inAcc = '2DTZtNJcADiH';
  var inSec = '4WRUIHIJNOKA5ABYF3RE4NURTJTMDRLH';
  var inTstamp = msTstampUtc();
  // var inSerialized = inTstamp(inAcc, inSec, uri, params);
  //  var inSerialized = inTstamp, inAcc, inSec, uri, params);

  //console.log('windowwww isssssss' + CryptoObject);
  //console.log('windowwww 2 isssssss' + Window.msCrypto);

  // var $crypto = Window.crypto || Window.msCrypto;

  var $crypto = new msrCrypto();

  //console.log('windowwww 2 isssssss' + $crypto);


  var inTstamp = msTstampUtc();
  var inSerialized = serialize(inTstamp, inAcc, inSec, uri, params);
  var promise,
      auth = false;

  sig = '';

  if (inAcc && inSec) {
    auth = true;
    if ($crypto.subtle) {

      console.log('bonuuuuuuuuuuuuu');
      promise = $crypto.subtle.digest({
        name: "SHA-256"
      }, str2buffer(inSerialized));

      console.log('$crypto isssssss' + inSerialized);
      if (typeof promise.then === 'function') {

        console.log('tonyyyyyyyyyyyyy');
        promise.then(function (inHash) {
          sig = inAcc + '.' + inTstamp + '.' + btoa(String.fromCharCode.apply(null, new Uint8Array(inHash)));
          // console.log(sig);
          return callback(auth);
        });
      } else {
        // non-standard IE 11
        return function (inHash) {
          sig = inAcc + '.' + inTstamp + '.' + btoa(String.fromCharCode.apply(null, new Uint8Array(inHash)));
          // console.log(sig);
          return callback(auth);
        }(promise.result);
      }
    } else {
      sig = '';
      console.log('sonuuuuuuuuuuuuuuuuuu');
      //alert('Your browser is out-of-date. Please download one of these up-to-date, free and excellent browsers supporting Web Cryptography API');
      return callback(auth);
    }
  } else {
    sig = '';
    auth = false;
    return callback(auth);
  }
};

function getDeribitiveInstrumentFirsCall(api_key, secret, request_token) {

  //alert('called');

  axios.get('https://www.deribit.com/api/v1/public/getinstruments').then(function (response) {
    var data = response.data.result;
    // addVolumeToInstrument(data);
    //here we will add function to call deribitive instrument after some time

    if (data != undefined) {
      addVolumeToInstrument(data);
    }

    setInterval(function () {
      //getInstrumentRepetitive();
      getDeribitiveInstrument();
    }, instrumentSelectionInterval);

    //dispatch({type :'GOT_INSTRUMENTS' , payload: combodata})
  }).catch(function (error) {

    console.log(error);
    cancelOrderAll();
    startDetecting();
  });
};

function getDeribitiveInstrument() {
  //cancell all order
  //cancelOrderAll();

  filteredInstruments = [];
  global.clearTimeout(setTimeOutVar);
  axios.get('https://www.deribit.com/api/v1/public/getinstruments').then(function (response) {
    var data = response.data.result;
    if (data != undefined) {
      addVolumeToInstrument(data);
    } else {
      //console.log(error);
      //  cancelOrderAll();
      //  startDetecting();
    }
  }).catch(function (error) {
    console.log(error);
    cancelOrderAll();
    startDetecting();
  });
}

function addVolumeToInstrument(data) {

  data.map(function (value, index) {

    var uri = 'https://www.deribit.com/api/v1/public/getsummary?instrument=';
    var combourl = '' + uri + value.instrumentName;
    axios.get(combourl).then(function (response) {

      value.volume = response.data.result.volume;

      if (index === data.length - 1) {
        addLastTradedToData(data);
      }
    }).catch(function (error) {
      console.log(error);
      cancelOrderAll();
      startDetecting();
    });
  });
}

function addLastTradedToData(data) {

  if (data != undefined) {

    data.map(function (value, index) {

      var d = new Date();
      var timeStampnow = Math.floor(Date.now() / 1000);
      var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      var timeStampbefore = Math.floor(yesterday / 1000);
      var timedata = timeStampnow - timeStampbefore;
      var uri = 'https://www.deribit.com/api/v1/public/getlasttrades?instrument=';
      var sinceurl = '&since=';
      var combineurl = '' + uri + value.instrumentName + sinceurl + timedata;

      axios.get(combineurl).then(function (response) {

        var quant = 0;
        response.data.result.map(function (value, index) {
          quant = parseInt(value.quantity) + quant;
        });
        value.quantity = quant;

        if (index === data.length - 1) {
          getCallAndPutDataSeparately(data);
        }
      }).catch(function (error) {
        console.log(error);
        cancelOrderAll();
        startDetecting();
      });
    });
  }
};

function getCallAndPutDataSeparately(data) {
  var TUCallsArray = [];
  var TUPutsArray = [];
  var newTUCallsArray = [];
  var newTUPutsArray = [];
  var callComplete = 0;
  var putComplete = 0;

  data.map(function (value, index) {
    if (value.instrumentName.slice(-1) === "C") {
      TUCallsArray.push(value);
    } else if (value.instrumentName.slice(-1) === "P") {
      TUPutsArray.push(value);
    }
  });

  console.log('inside endinggg column 2');
  TUCallsArray = _.sortBy(TUCallsArray, 'volume').reverse();
  TUPutsArray = _.sortBy(TUPutsArray, 'volume').reverse();

  TUCallsArray.map(function (value, index) {
    TUCallsArray[index].rank = index;
  });

  TUPutsArray.map(function (value, index) {
    TUPutsArray[index].rank = index;
  });

  TUCallsArray = _.sortBy(TUCallsArray, 'quantity').reverse();
  TUPutsArray = _.sortBy(TUPutsArray, 'quantity').reverse();

  TUCallsArray.map(function (value, index) {
    TUCallsArray[index].churnrank = index;
  });

  TUPutsArray.map(function (value, index) {
    TUPutsArray[index].churnrank = index;
  });

  //LiquidityRank

  TUCallsArray.map(function (value, index) {
    TUCallsArray[index].LiquidityRank = (value.churnrank + value.rank) / 2;;
  });

  TUPutsArray.map(function (value, index) {
    TUPutsArray[index].LiquidityRank = (value.churnrank + value.rank) / 2;;
  });

  //keeping top 15 of calls and puts
  TUCallsArray = _.sortBy(TUCallsArray, 'LiquidityRank').slice(0, 15);
  TUPutsArray = _.sortBy(TUPutsArray, 'LiquidityRank').slice(0, 15);

  //combining this two array and 


  TUCallsArray.map(function (value, index) {

    var uri = 'https://test.deribit.com/api/v1/public/getorderbook?instrument=';
    var combourl = '' + uri + value.instrumentName;

    //axios starts here
    axios.get(combourl).catch(function (error) {
      console.log(error);
      cancelOrderAll();
      startDetecting();
    }).then(function (response) {
      //finding min and max bid
      var minask = 0;
      var maxbid = 0;
      var spread = 0;
      var depth = 0;
      var CER = 0;
      var TD = 0;

      if (response != undefined) {

        if (response.data.result !== undefined) {

          var askArray = response.data.result.asks;
          var bidsArray = response.data.result.bids;
          var thetaVar = response.data.result.theta;

          if (askArray != undefined) {
            //ashutosh
            minask = _.minBy(_.map(askArray, 'price'));
            depth = askArray.length;
            CER = (minask + 0.08) / minask;
          }

          if (bidsArray != undefined) {
            maxbid = _.maxBy(_.map(bidsArray, 'price'));
          }

          if (minask !== 0 && maxbid !== 0) {
            spread = (minask - maxbid) / (minask + maxbid) / 2;
          }

          if (thetaVar !== undefined && minask !== 0) {
            TD = -thetaVar / minask;
          }
        }
      }

      //Spread < Min Spread (Input


      if (depth >= MinDepth && spread >= MinSpread && CER >= MinCER) {
        //depth condition

        value.Depth = depth;
        value.Spread = spread;
        value.CER = CER;
        value.Orderbook = response.data.result;
        value.TD = TD;
        if (response.data.result.asks !== undefined) {
          if (response.data.result.asks.length > 0) {
            value.asksArray = _.map(response.data.result.asks, 'price');
            value.asksQuantity = _.map(response.data.result.asks, 'quantity');
            value.asksCM = _.map(response.data.result.asks, 'cm');
          } else {
            value.asksArray = [];
            value.asksQuantity = [];
            value.asksCM = [];
          }
        }

        if (response.data.result.bids !== undefined) {
          if (response.data.result.bids.length > 0) {
            value.bidsArray = _.map(response.data.result.bids, 'price');
            value.bidsQuantity = _.map(response.data.result.bids, 'quantity');
            value.bidsCM = _.map(response.data.result.bids, 'cm');
          } else {
            value.bidsArray = [];
            value.bidsQuantity = [];
            value.bidsCM = [];
          }
        }

        value.boolSendTrade = false;
        value.SendTrade = [];

        newTUCallsArray.push(value);
      } else {

        //delete this document as depth criteria is not met
      }

      if (index == TUCallsArray.length - 1) {
        newTUCallsArray = _.sortBy(newTUCallsArray, 'Spread').reverse();
        newTUCallsArray.map(function (value, index) {
          newTUCallsArray[index].IntSpreadRank = index;
        });

        newTUCallsArray = _.sortBy(newTUCallsArray, 'CER').reverse();
        newTUCallsArray.map(function (value, index) {
          newTUCallsArray[index].IntCERRank = index;
        });

        newTUCallsArray = _.sortBy(newTUCallsArray, 'TD').reverse();
        newTUCallsArray.map(function (value, index) {
          newTUCallsArray[index].IntThetaRank = index;
          newTUCallsArray[index].floatAttractiveness_Index = (value.LiquidityRank + value.IntSpreadRank + value.IntCERRank + index) / 4;
        });

        newTUCallsArray = _.sortBy(newTUCallsArray, 'rank').slice(0, NumberOfQuotes);

        if (putComplete === 1) {

          filteredInstruments = { 'TUPuts': newTUPutsArray, 'TUCalls': newTUCallsArray };
          generateRepitiveOrders(filteredInstruments);
        } else {
          callComplete = callComplete + 1;
        }
      }
    });
    //axios ends here////
  });
  //big axios closed here


  TUPutsArray.map(function (value, index) {
    var uri = 'https://test.deribit.com/api/v1/public/getorderbook?instrument=';
    var combourl = '' + uri + value.instrumentName;

    axios.get(combourl).catch(function (error) {
      console.log(error);
      cancelOrderAll();
      startDetecting();
    }).then(function (response) {
      //finding min and max bid theta
      /*var minask =  _.minBy(_.map(response.data.result.asks, 'price'));
      var maxbid =  _.maxBy(_.map(response.data.result.bids, 'price'));
      var spread =  (minask - maxbid)/(minask + maxbid)/2;
      var depth  =  response.data.result.asks.length;
      var CER    =     (minask + 0.08)/minask;
      var TD  = -(response.data.result.theta)/minask;*/

      var minask = 0;
      var maxbid = 0;
      var spread = 0;
      var depth = 0;
      var CER = 0;
      var TD = 0;

      if (response != undefined) {

        if (response.data.result !== undefined) {

          var askArray = response.data.result.asks;
          var bidsArray = response.data.result.bids;
          var thetaVar = response.data.result.theta;

          if (askArray != undefined) {
            //ashutosh
            minask = _.minBy(_.map(askArray, 'price'));
            depth = askArray.length;
            CER = (minask + 0.08) / minask;
          }

          if (bidsArray != undefined) {
            maxbid = _.maxBy(_.map(bidsArray, 'price'));
          }

          if (minask !== 0 && maxbid !== 0) {
            spread = (minask - maxbid) / (minask + maxbid) / 2;
          }

          if (thetaVar !== undefined && minask !== 0) {
            TD = -thetaVar / minask;
          }
        }
      }

      if (depth >= MinDepth && spread >= MinSpread && CER >= MinCER) {

        //depth condition
        value.Depth = depth;
        value.Spread = spread;
        value.CER = CER;
        value.Orderbook = response.data.result;
        value.TD = TD;

        if (response.data.result.asks != undefined) {
          if (response.data.result.asks.length > 0) {
            value.asksArray = _.map(response.data.result.asks, 'price');
            value.asksQuantity = _.map(response.data.result.asks, 'quantity');
            value.asksCM = _.map(response.data.result.asks, 'cm');
          } else {
            value.asksArray = [];
            value.asksQuantity = [];
            value.asksCM = [];
          }
        }

        if (response.data.result.bids != undefined) {
          if (response.data.result.bids.length > 0) {
            value.bidsArray = _.map(response.data.result.bids, 'price');
            value.bidsQuantity = _.map(response.data.result.bids, 'quantity');
            value.bidsCM = _.map(response.data.result.bids, 'cm');
          } else {
            value.bidsArray = [];
            value.bidsQuantity = [];
            value.bidsCM = [];
          }
        }
        value.boolSendTrade = false;
        value.SendTrade = [];

        newTUPutsArray.push(value);
      } else {

        //alert
        //delete this document as depth criteria is not met
      }

      if (index === TUPutsArray.length - 1) {

        newTUPutsArray = _.sortBy(newTUPutsArray, 'Spread').reverse();
        newTUPutsArray.map(function (value, index) {
          newTUPutsArray[index].IntSpreadRank = index;
        });
        newTUPutsArray = _.sortBy(newTUPutsArray, 'CER').reverse();
        newTUPutsArray.map(function (value, index) {
          newTUPutsArray[index].IntCERRank = index;
        });
        newTUPutsArray = _.sortBy(newTUPutsArray, 'TD').reverse();
        newTUPutsArray.map(function (value, index) {
          newTUPutsArray[index].IntThetaRank = index;
          newTUPutsArray[index].floatAttractiveness_Index = (value.LiquidityRank + value.IntSpreadRank + value.IntCERRank + index) / 4;
        });
        newTUPutsArray = _.sortBy(newTUPutsArray, 'rank').slice(0, NumberOfQuotes);

        if (callComplete === 1) {

          filteredInstruments = { 'TUPuts': newTUPutsArray, 'TUCalls': newTUCallsArray };
          generateRepitiveOrders(filteredInstruments);
        } else {
          putComplete = putComplete + 1;
        }
      }
    });
  });
}

function getDeltaHedeger(openPosition) {

  var deltaOrderBook = [];
  totalDeltaHedger = 0;

  openPosition.map(function (value, index) {
    totalDeltaHedger = totalDeltaHedger + value.delta;
  });

  if (globalDelta === 0) {
    //first time
    globalDelta = totalDeltaHedger;
    globalDeltaDiff = parseFloat(totalDeltaHedger.toFixed(4));
    //  debugger;
  } else {
    globalDeltaDiff = parseFloat((totalDeltaHedger - globalDelta).toFixed(4));
    //debugger;
  }

  console.log('total delta hedger is !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' + totalDeltaHedger);

  if (globalDeltaDiff > 0) {
    //we hv to take short position in future
    //delta is positive , trade direction will be short
    deltaTradeDirection = "sell";
  } else if (totalDeltaHedger < 0) {
    //we have to take long position in future
    //delta is negative , trade direction will be long
    deltaTradeDirection = "buy";
  }

  var uri = 'https://test.deribit.com/api/v1/public/getorderbook?instrument=';
  var combourl = '' + uri + HedgingFutureName;

  //axios starts here

  if (globalDeltaDiff !== 0 && globalDeltaDiff !== -0) {
    //debugger;

    //not do anything when diff is 0
    axios.get(combourl).then(function (response) {

      //now we have to pass this 
      var orderdata = response.data.result;
      if (orderdata !== undefined) {

        orderdata.asksArray = _.map(response.data.result.asks, 'price');
        orderdata.bidsArray = _.map(response.data.result.bids, 'price');
        orderdata.asksQuantity = _.map(response.data.result.asks, 'quantity');
        orderdata.bidsQuantity = _.map(response.data.result.bids, 'quantity');
        orderdata.asksCM = _.map(response.data.result.asks, 'cm');
        orderdata.bidsCM = _.map(response.data.result.bids, 'cm');
        orderdata.instrumentName = orderdata.instrument;
        orderdata.tickSize = 0.0005;
        orderdata.SendTrade = [];
        deltaOrderBook.push(orderdata);
      }

      //sakshi
      // generateCleanOrderBook(deltaOrderBook , 'deltaOrderBook');
      // debugger;
      getOpenOrderBook(deltaOrderBook, 3);
    }).catch(function (error) {

      console.log(error);
      cancelOrderAll();
      startDetecting();
    });
  }
};

app.listen(PORT);