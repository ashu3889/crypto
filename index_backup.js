var axios = require('axios');
var _ = require("lodash") ;
var $ = require('jquery') ;
var jStat = require('jStat').jStat;

var config = {
  url: 'https://test.deribit.com',
  key: '2DTZtNJcADiH',
  secret: '4WRUIHIJNOKA5ABYF3RE4NURTJTMDRLH',
  testnet: true,
};


var RestClient = require("deribit-api").RestClient;
var restClient = new RestClient(config.key, config.secret, config.url);
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
var OptPos= [];
var FutPos = [];
var ShortOpt = 0;
var LongOpt = 0;
var Risk_Residual = 0;
var Max_Risk = 2;
var NumberOfQuotes = 3;
var globalURL = "https://test.deribit.com";

var HedgingFutureName = 'BTC-PERPETUAL';
var deltaTradeDirection ='';
var totalDeltaHedger = 0;
var filteredInstruments = [];
var setTimeOutVar;
var deltaQuantity = 0;

var globalDelta = 0;
var globalDeltaDiff = 0;
var btcPositionQty = 0;
var btcPositionQty = 0;

var instrumentSelectionInterval = 600000;



getDeribitiveInstrumentFirsCall();


function startDetecting() {
  //start detecting instruments
    getDeribitiveInstrument();
}

async function generateRepitiveOrders(data){  

       var data = await restClient.positions();

       if(data.result !== undefined){
               generateOpenPositions(data.result , filteredInstruments);
       }
       else{
                //console.log(e);
                cancelOrderAll();
                startDetecting();

       }

      
}


async function generateOpenPositions(data, selectedInstrument){

ShortOpt = 0;

if(data !== undefined){
    data.map((value, index) =>{
          if(value.instrument.slice(-1) ==="C" || value.instrument.slice(-1) === "P"){
             OptPos.push(value);
             if(value.direction ==="buy"){
               LongOpt = LongOpt + value.size;
             }
             else if(value.direction ==="sell"){
               ShortOpt = ShortOpt + value.size;
             }
          }
          else if(value.instrument.slice(-1) !== "P" && value.instrument.slice(-1) !== "C"){
               FutPos.push(value);
           }
    });
    Risk_Residual = Max_Risk-ShortOpt;
   // debugger;
}
    generateInstrumentQuantity(selectedInstrument);
}

async function generateInstrumentQuantity(data){
//function to calculate instrument quanitity
var comboArray = [];

if(data.TUCalls !== undefined && data.TUPuts !== undefined ){
      data.TUCalls.map((value, index) =>{
       let r = value.floatAttractiveness_Index;
       let n = NumberOfQuotes;
       //debugger;
       let Qty = 2*Risk_Residual*(n-r)/(n*(n+1));
       var rounded = Math.abs(parseFloat(Qty.toFixed(1)));
       console.log('rounded value is calls ' , rounded);
      // console.log('rounded value for ' , rounded);
       // Math.round(Qty*10)/10;
       data.TUCalls[index].Qty = rounded;
     });


    data.TUPuts.map((value, index) =>{
       let r = value.floatAttractiveness_Index;
       let n = NumberOfQuotes;
       let Qty = 2*Risk_Residual*(n-r)/(n*(n+1));
      // debugger;
       //var rounded = Math.round(Qty*10)/10;

       var rounded = Math.abs(parseFloat(Qty.toFixed(1)));

       console.log('rounded value is puts ' , rounded);
       data.TUPuts[index].Qty = rounded;
     });
     comboArray = accumulateCallAndPutTrades(data.TUCalls,data.TUPuts);

}
     generateOrderBook(comboArray);
}

async function  generateOrderBook(comboArray){


//function to calculate for open positions
    getOpenPosition();
 
   //function to calculate for open orders 
   //here we have to get latest orderbook...
   //debugger;  
    generateCleanBookForOpenOrders(comboArray , 'openorder');
    
    //getOpenOrderBook(comboArray , 2);
}

function accumulateCallAndPutTrades(calldata,putdata){

     let comboArray = [];


     if(calldata!== undefined && putdata !== undefined ){


     calldata.map((v,i) => {
       comboArray.push(v);
     })

      putdata.map((v,i) => {
        comboArray.push(v);
    })


     }

    
   return comboArray;
}

async function getOpenPosition() {

       var data = await restClient.positions();
      // debugger;

       if(data.result !== undefined){
           generateCleanBookAndPriceForOpenPositions(data.result ,'position');
           getDeltaHedeger(data.result);
       }
       else{
            cancelOrderAll();
            startDetecting();
       }

}


//testing
function generateCleanBookAndPriceForOpenPositions(data , type){

 

  let positionOrderData = [];

if(data != undefined){

     data.map((value, index) =>{
   
      let uri ='https://test.deribit.com/api/v1/public/getorderbook?instrument=';
      let combourl = `${uri}${value.instrument}`;
    
      
      //let price = value.averagePrice;
      let tradeDirection = value.direction;
      let instrumentName = value.instrument;
      let sizeOfQty = value.size;
      //first check if our order is there in public orderbook
      
       axios.get(combourl).then(function(response){
            
        
                  let orderdata = response.data.result;
                   
                  if(orderdata !== undefined){
                       // let d = value.instrument;
                       //clearning feilds
                        orderdata.asksArray =  [];
                        orderdata.bidsArray = [];
                        orderdata.asksQuantity = [];
                        orderdata.bidsQuantity = [];
                        orderdata.asksCM = [];
                        orderdata.bidsCM = [];
                        orderdata.CleanedBuyOrderBook = [];
                        orderdata.CleanedSellOrderBook = [];
                        orderdata.callOptPrice = [];
                        orderdata.sellOptPrice = [];


                        orderdata.asksArray =  _.map(response.data.result.asks, 'price');
                        orderdata.bidsArray =  _.map(response.data.result.bids, 'price');
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
                 

                  if(positionOrderData.length === data.length && type ==="position"){ 
                   // ;//tinuuuu
                    getOpenOrderBook(positionOrderData , 4);
                  }
       });

       
  });


}

  


}


function generateCleanBookForOpenOrders(data , type){

 

  let positionOrderData = [];

if(data != undefined){

     data.map((value, index) =>{
       
      let uri ='https://test.deribit.com/api/v1/public/getorderbook?instrument=';
      let combourl = `${uri}${value.instrumentName}`;
      let instrumentName = value.instrumentName;
      let sizeOfQty = value.Qty;

      
       axios.get(combourl).then(function(response){
            
        
                  let orderdata = response.data.result;
                   
                   
                  if(orderdata !== undefined){
                       // let d = value.instrument;
                       //clearning feilds
                        orderdata.asksArray =  [];
                        orderdata.bidsArray = [];
                        orderdata.asksQuantity = [];
                        orderdata.bidsQuantity = [];
                        orderdata.asksCM = [];
                        orderdata.bidsCM = [];
                        orderdata.CleanedBuyOrderBook = [];
                        orderdata.CleanedSellOrderBook = [];
                        orderdata.callOptPrice = [];
                        orderdata.sellOptPrice = [];


                        orderdata.asksArray =  _.map(response.data.result.asks, 'price');
                        orderdata.bidsArray =  _.map(response.data.result.bids, 'price');
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

                  if(positionOrderData.length === data.length && type ==="openorder"){ 
                   // debugger;
                    getOpenOrderBook(positionOrderData , 2);
                  }
       });

       
  });


}

}




function triggerOrders(optiondata){
  getOpenOrderBook(optiondata , 1);

}

async function buyOrder(instrument, bidBest, bidBestQuant) {

    console.log('buy is calling for' + instrument);
    var data = await restClient.buy(instrument, bidBestQuant, bidBest, true, "");
    console.log("buyOrder", instrument, bidBest, bidBestQuant);
}

async function sellOrder(instrument, bestPriceSell, bestQuant) {
    console.log('sell is firing for' + instrument);
    var data = await restClient.sell(instrument, bestQuant, bestPriceSell, true, "");
    console.log("sellOrder", instrument, bestPriceSell, bestQuant);
}


async function editOrder(row, price, size) {
  //debugger;

  //console.log("editOrder", row, price, size);

    var options = {
        "orderId": row,
        "quantity": size,
        "price": price,
        "post_only": true
    };

    var data = await restClient.request("/api/v1/private/edit", options);
    console.log("editOrder", row, price, size);
}


async function cancelOrder(OrderId) {
    var data = await restClient.cancel(OrderId);
    console.log("Cancelled Order", OrderId);
}




async function cancelOrderAll() {
    try {
        await restClient.cancelall("all");
        console.log("Cancelled All Orders");
    } catch (e) {
    //logger.error(e);
    console.log('error');
    await PromiseTimeout(5000);
    await cancelOrderAll(); 
    }
}



function PromiseTimeout(delayms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, delayms);
    });
}


function generateOptimalPrice(optiondata){

  //debugger;

optiondata.map((value,index) => {



 let mid = (Number(value.asksArray[0])+Number(value.bidsArray[0]))/2;

 value.CleanedBuyOrderBook.map((v,i) => {
       /* var subsValue= parseFloat(mid)-parseFloat(v.price);
        var logVar=jStat.lognormal.cdf(Math.max(0.1,v.cm),meanBuy,sdBuy);
        v.optimalValue=subsValue*(parseFloat(1)-logVar);*/


        var subsValue= parseFloat(mid.toFixed(4))-parseFloat(v.price.toFixed(4));
        subsValue =    parseFloat(subsValue.toFixed(4));
        var logVar=    parseFloat(jStat.lognormal.cdf(Math.max(0.1,v.cm),meanBuy,sdBuy).toFixed(4));
        var powerVal=  parseFloat(Math.pow(parseFloat(1)-parseFloat(logVar),parseFloat(1)).toFixed(4));
        var data = subsValue*powerVal;
        v.optimalValue= parseFloat(data.toFixed(4));



        v.direction = "buy" ;
        v.post_only = true;
        v.type = 'limit';
 });

 //sort the cleanbuyorderbook and keep the maximu spread value. _.sortBy(optiondata[0].CleanedBuyOrderBook, 'optimalValue').reverse(); 
   if(optiondata[index].CleanedBuyOrderBook.length >0){
        
        if(value.instrumentName === "BTC-28SEP18-6500-C"){
         //debugger;
          }

         var foundIndex =  _.findIndex(value.SendTrade, function(valueD) { return valueD.direction === "buy"});
         if(foundIndex !== -1){
             value.SendTrade.splice(foundIndex, 1);
         }

         
//lavalooooo
      value.callOptPrice =_.sortBy(optiondata[index].CleanedBuyOrderBook, 'optimalValue')[0]; 

      if(_.isEmpty(value.callOptPrice) === false){
        value.boolSendTrade = true;
        value.SendTrade.push(value.callOptPrice);
      }

   }

   
 value.CleanedSellOrderBook.map((v,i) => {

        var subsValue  =  v.price- mid;
        subsValue    =   parseFloat(subsValue.toFixed(4)) ;      
        var logVar     =  parseFloat(jStat.lognormal.cdf(Math.max(0.1,v.cm),meanSell,sdSell).toFixed(4));
        var powerVal   =  parseFloat(Math.pow(parseFloat(1)-parseFloat(logVar),parseFloat(1)).toFixed(4));
        var data       =  subsValue*powerVal;
        v.optimalValue= parseFloat(data.toFixed(4));

        v.direction = "sell" ;
        v.post_only = true;
        v.type = 'limit';
 });


 if(optiondata[index].CleanedSellOrderBook.length > 0){

   // if(value.instrumentName === "BTC-28SEP18-6000-C"){
     //  debugger;


  

     

         var foundIndex =  _.findIndex(value.SendTrade, function(valueD) { return valueD.direction === "sell"});
         if(foundIndex !== -1){
             value.SendTrade.splice(foundIndex, 1);
         }
         
         //umaaaa
   // }

     value.sellOptPrice =_.sortBy(optiondata[index].CleanedSellOrderBook, 'optimalValue').reverse()[0]; 

     if(_.isEmpty(value.sellOptPrice) === false){
       value.boolSendTrade = true;
       value.SendTrade.push(value.sellOptPrice);
     }

 }
});

//debugger;//
     //debugger;
     //console.log('selection value');
     // console.log(optiondata);
    triggerOrders(optiondata);

}


function generateOptimalPriceForOpenPositionsAndDelta(optiondata , type){


 //lovely

 //debugger;

optiondata.map((value,index) => {
  //BTC-28SEP18-7000-C

  

 let mid = (Number(value.asksArray[0])+Number(value.bidsArray[0]))/2;

 value.CleanedBuyOrderBook.map((v,i) => {
        var subsValue= parseFloat(mid.toFixed(4))-parseFloat(v.price.toFixed(4));
        subsValue =    parseFloat(subsValue.toFixed(4));
        var logVar=    parseFloat(jStat.lognormal.cdf(Math.max(0.1,v.cm),meanBuy,sdBuy).toFixed(4));
        var powerVal=  parseFloat(Math.pow(parseFloat(1)-parseFloat(logVar),parseFloat(1.5)).toFixed(4));
        var data = subsValue*powerVal;
        v.optimalValue= parseFloat(data.toFixed(4));

        v.direction = "buy" ;
        v.post_only = true;
        v.type = 'limit';
 });

 //sort the cleanbuyorderbook and keep the maximu spread value. _.sortBy(optiondata[0].CleanedBuyOrderBook, 'optimalValue').reverse(); 
   if(optiondata[index].CleanedBuyOrderBook.length >0){

     

     var foundIndex =  _.findIndex(value.SendTrade, function(valueD) { return valueD.direction === "buy"});
         if(foundIndex !== -1){
             value.SendTrade.splice(foundIndex, 1);
         }

//lavalaooo
      value.callOptPrice =_.sortBy(optiondata[index].CleanedBuyOrderBook, 'optimalValue')[0]; 
  //changes
    
//debugger;

      
      //value.callOptPrice =_.sortBy(optiondata[index].CleanedBuyOrderBook, 'optimalValue').reverse();
      //testing...........
      if(_.isEmpty(value.callOptPrice) === false){
        value.boolSendTrade = true;
        value.SendTrade.push(value.callOptPrice);
      }

   }

  


 value.CleanedSellOrderBook.map((v,i) => {



        var subsValue  =  v.price- mid;
        subsValue      =   parseFloat(subsValue.toFixed(4)) ;      
        var logVar     =  parseFloat(jStat.lognormal.cdf(Math.max(0.1,v.cm),meanSell,sdSell).toFixed(4));
        var powerVal   =  parseFloat(Math.pow(1-logVar,parseFloat(1.5)).toFixed(4));
        var data       =  subsValue*powerVal;
        v.optimalValue = parseFloat(data.toFixed(4));
        v.direction = "sell" ;
        v.post_only = true;
        v.type = 'limit';
 });



 if(optiondata[index].CleanedSellOrderBook.length > 0){

   

    var foundIndex =  _.findIndex(value.SendTrade, function(valueD) { return valueD.direction === "sell"});
         if(foundIndex !== -1){
             value.SendTrade.splice(foundIndex, 1);
          }


     value.sellOptPrice =_.sortBy(optiondata[index].CleanedSellOrderBook, 'optimalValue').reverse()[0]; 
     if(_.isEmpty(value.sellOptPrice) === false){
       value.boolSendTrade = true;
       value.SendTrade.push(value.sellOptPrice);
     }

 }

});

// now iterate over each array and fire orders

 if(type === "filterPositionData"){
      //  ;
     // debugger;
    fireOppositeOrdersForOpenPosition(optiondata ,'openPosition');
 }
 else if(type === "deltaOrderBook"){
     // debugger;
    fireOppositeOrdersForOpenPosition(optiondata , 'delta');
    // getOpenOrderBookForOpenPositionsAndDelta(optiondata , 'delta');
 }
     
 
}

function fireOppositeOrdersForOpenPosition(openPosition ,type){

   let tradedir = deltaTradeDirection;
   
 

 if(type === "openPosition"){
   openPosition.map((value, index) =>{
      if(value.direction ==="buy"){
           //removing buy from sendtrade array sizeofqty
          
           if(value.SendTrade.length ===2){
              value.SendTrade.shift();
              value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
           }
           else if(value.SendTrade.length ===1 && value.SendTrade[0].direction ==="sell"){
                value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
            }
      }
      else{
       //removing sell from sendtrade array
      
        if(value.SendTrade.length ===2){
           value.SendTrade.pop();
           value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
               
         }
         else if(value.SendTrade.length ===1 && value.SendTrade[0].direction ==="buy"){
             value.SendTrade[0].quantity = Math.abs(value.sizeofqty);
         }
         
      }
   });
 }
 else if(type === "delta"){
//debugger;
     openPosition.map((value, index) =>{

            
              //  debugger;

     if(deltaTradeDirection ==="sell"){
           //removing buy from sendtrade array sizeofqty
        
          if(value.SendTrade.length ===2){
                    value.SendTrade.shift();
                    var qty = (globalDeltaDiff*value.SendTrade[0].price)/10;
                    var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
                    value.SendTrade[0].quantity = Math.round(roundOfQty);

                    ///ashutosh look hereee
           }
           else if(value.SendTrade.length ===1 && value.SendTrade[0].direction ==="sell"){
                    var qty = (globalDeltaDiff*value.SendTrade[0].price)/10;
                    var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
                    value.SendTrade[0].quantity = Math.round(roundOfQty);
            }
      }
      else if(deltaTradeDirection ==="buy"){
       //removing sell from sendtrade array
      
          if(value.SendTrade.length ===2){
                    value.SendTrade.pop();
                    var qty = (globalDeltaDiff*value.SendTrade[0].price)/10;
                    var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
                    value.SendTrade[0].quantity = Math.round(roundOfQty);
               
          }
          else if(value.SendTrade.length ===1 && value.SendTrade[0].direction ==="buy"){
                   var qty = (globalDeltaDiff*value.price)/10;
                   var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
                   value.SendTrade[0].quantity = Math.round(roundOfQty);
            }
         
       }
               
      

     });


 }




   
   /// conflicted zone here.. watchout
    
  if(type === "delta"){
   //  debugger;
     getOpenOrderBookForOpenPositionsAndDelta(openPosition ,'delta');
  }
  else if(type === "openPosition"){
     getOpenOrderBookForOpenPositionsAndDelta(openPosition ,'openPosition');
  }

   

}

 function fireOrderForDeltaHedgerCopy(deltaHedgerData , openOrderBookData){

  //debugger;

  let tradedir = deltaTradeDirection;
  let sendTrade = deltaHedgerData[0].SendTrade;
  let orderBookData = openOrderBookData.result;

  //check if future value exist in open poition or not
    
  var foundIndex =  _.findIndex(orderBookData, function(valueD) { return valueD.instrument === "BTC-PERPETUAL"});
  
  

  if(foundIndex !== -1){
   // debugger;
//
         var foundIndexTradeDirection = orderBookData[foundIndex].direction;

         if(foundIndexTradeDirection === tradedir){

               console.log('future position is present already now we have to edit that');
               let openOrderID = orderBookData[foundIndex].orderId;
         


              sendTrade.map((v,i) => {
                  if(v.direction === tradedir){
                 //setting price value for delta hedger
                 //Qty = OptionsDelta * Price of Instrument (Hedging Future Input) / 10.
               
                 var qty = (globalDeltaDiff*v.price)/10;
                 var roundOfQty = Math.abs(parseFloat(qty.toFixed(1)));
                 v.quantity =Math.round(roundOfQty) ;
                 //debugger;

                  console.log('edit orders hereee');
                 editOrder(openOrderID,v.price,v.quantity); //Math.round(2.5);
               }
              })

         }
    
         

  }
  else{
  //we have to fire the order
  //debugger;
        sendTrade.map((v,i) => {
              if(v.direction === tradedir){
                 //setting price value for delta hedger
                 //Qty = OptionsDelta * Price of Instrument (Hedging Future Input) / 10.
                 var qty = (globalDeltaDiff*v.price)/10;
                 v.quantity = parseFloat(qty.toFixed(1));
                 //;
                 console.log('orders firing for delta');
                  fireOrder(v ,'delta');
               }
        })

  }



}




function accumulateAllSendTrades(calldata,putdata){
  
  var combinedSendTradeArr = []; 

   calldata.map((v,i) => {
    v.SendTrade.map((a,b) =>{
      combinedSendTradeArr.push(a);
    })  
   });

   putdata.map((v,i) => {
      v.SendTrade.map((a,b) =>{
        combinedSendTradeArr.push(a);
      })
   });


return combinedSendTradeArr;
}


function comparePositionCleanOrderBookWithOpenOrderbook(positiondata,openOrderBook ,type){

   var combinedSendTradeArr = []; 
   positiondata.map((v,i) => {
      if(v.SendTrade[0] != undefined){
          combinedSendTradeArr.push(v.SendTrade[0]);
      }
       
   });

  var openOrderBook = openOrderBook.result;

  if(combinedSendTradeArr.length > 0){

      combinedSendTradeArr.map((value, index) => {
          let direction = value.direction;
          let instrumentName = value.instrument;
          let orderPrice = value.price;
          let orderQuantity = value.quantity;
          let sameDirectionDiffPrice = false;
          var foundIndex = _.findIndex(openOrderBook, function(valueD) { return (valueD.instrument == instrumentName && valueD.direction === direction) });


          var deltaIndex = _.findIndex(openOrderBook, function(valueD) { return (valueD.instrument == "BTC-PERPETUAL" )});

            if(type === "delta" && deltaIndex !== -1 && value.quantity !== 0){
                //debugger;
                  console.log(value);
                  fireDeltaOrder(value,openOrderBook[deltaIndex].orderId);
               
            }

            if(deltaIndex === -1 && type ==="delta"){
                // debugger;
                 console.log(value);
                 fireOrder(value,'delta');
            }


            if(foundIndex == -1 ){
               console.log('fire index' + index);
               console.log('orders firing for position');


              if(type === "openPosition" && instrumentName !== "BTC-PERPETUAL"){
                    fireOrder(value,'position');
              }
              
            }
           else{



            var openOrderDirection = openOrderBook[foundIndex].direction;
            var openOrderPrice = openOrderBook[foundIndex].price;
            var openOrderQuantity = openOrderBook[foundIndex].quantity;
            var openOrderID= openOrderBook[foundIndex].orderId;

            var sameDirection;
            var sameQuantity;
            var samePrice;

            if(openOrderDirection ===  direction){
                 sameDirection = true;
            }
            else{
                 sameDirection = false;
            }

            if(openOrderQuantity === orderQuantity){
               sameQuantity = true;
            }
            else{
              sameQuantity = false;
            }

            if(openOrderPrice === orderPrice){
               samePrice = true;
            }
            else{
              samePrice = false;
            }

            
        if(type === "openPosition"){

            if(instrumentName === "BTC-PERPETUAL"){

            }

            if( sameDirection === true && samePrice === false && sameQuantity === true && instrumentName !== "BTC-PERPETUAL"){
                 //fire edit orders here
                 //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
                   //   debugger;
                 console.log('edit orders hereee');
                editOrder(openOrderID,orderPrice,orderQuantity);
              

            }

            if( sameDirection === true && samePrice === true && sameQuantity === false && instrumentName !== "BTC-PERPETUAL"){
                 //fire edit orders here
                  console.log('edit orders hereee');
                 // debugger;
                editOrder(openOrderID,orderPrice,orderQuantity);
            }

             if( sameDirection === true && samePrice === false && sameQuantity === false && instrumentName !== "BTC-PERPETUAL"){
                 //fire edit orders here
                 //edit open ordrbook record by passing its orderid, orderPrice, and orderQuantity
                  console.log('edit orders hereee');
                //  debugger;
                  editOrder(openOrderID,orderPrice,orderQuantity);
            }

           

        }

        if(type === "delta"){
            //debugger
           //alert('do nothing now...');
          


        }
      }//else ends here

  }); 


  } //combo loop ends here

//code to cancel order goes here

if(type === "openPosition"){
//debugger;
   openOrderBook.map((value, index) => {
          let oppDirection;
          let direction = value.direction;
          let instrumentName = value.instrument;
          let orderID = value.orderId;

          if(direction ==="buy"){
             oppDirection = "sell";

             var foundIndex = _.findIndex(combinedSendTradeArr, function(valueD) { return (valueD.instrument == instrumentName && valueD.direction === direction) });
             //debugger;
             if(foundIndex === -1){
                 //debugger;


                 //cancelOrder(orderID);


                  //no data found time to fire cancel order for open orders..
                  //alert('time to fire closing order for'+instrumentName);
              }
          }


        });

 }
}



async function compareCleanOrderBookWithOpenOrderbook(optiondata,openOrderBook ,type){



var combinedSendTradeArr = []; 

 if(type !== "delta"){
   optiondata.map((v,i) => {
    v.SendTrade.map((a,b) =>{
      combinedSendTradeArr.push(a);
    })  
   });
}
else if(type === "delta"){
//debugger;
combinedSendTradeArr = optiondata;

}




   var openOrderBook = openOrderBook.result;

   combinedSendTradeArr.map((value, index) => {

   // ;
       
          let direction = value.direction;
          let instrumentName = value.instrument;
          let orderPrice = value.price;
          let orderQuantity = value.quantity;
          var foundIndex = _.findIndex(openOrderBook, function(valueD) { return (valueD.instrument === instrumentName && valueD.direction === direction)});
 
           if(instrumentName === "BTC-28SEP18-6000-C" && direction ==="sell"){
              var testdata = combinedSendTradeArr;
                //   debugger;
           }
             if(foundIndex === -1){
                console.log(value);
                fireOrder(value , 'selection');
                console.log('order firing for new selection');
             }
             else{

               var openOrderDirection = openOrderBook[foundIndex].direction;
               var openOrderPrice = openOrderBook[foundIndex].price;
               var openOrderQuantity = openOrderBook[foundIndex].quantity;
               var openOrderID= openOrderBook[foundIndex].orderId;


               var sameDirection;
               var sameQuantity;
               var samePrice;

               if(openOrderDirection ===  direction){
                 sameDirection = true;
                }
               else{
                 sameDirection = false;
                }

               if(openOrderQuantity === orderQuantity){
                   sameQuantity = true;
                }
               else{
                   sameQuantity = false;
                }

               if(openOrderPrice === orderPrice){
                    samePrice = true;
                }
                else{
                    samePrice = false;
                 }


               if( sameDirection=== true && samePrice ===true && sameQuantity ===true){
                  //exact same do nothing here
                 //  alert('Do no trades here');
                }

                if( sameDirection === true && (samePrice === false || sameQuantity === false)){
                 //fire edit orders here
                  if(samePrice === true && sameQuantity === false){
                     
                      console.log('edit quantity is fired for ' + instrumentName );
                    
                  }
                  else if(samePrice === false && sameQuantity === true){
                     
                      console.log('edit price is fired for ' + instrumentName );
                       editOrder(openOrderID,orderPrice,openOrderQuantity);
                     
                  }
                  else if(samePrice===false && sameQuantity ===false){
                    
                      console.log('edit quantity and price is fired for ' + instrumentName );
                    
                       editOrder(openOrderID,openOrderPrice,openOrderQuantity);
                     
                  }

                }


             }


   });

 // fire next order 
 
             setTimeOutVar = global.setTimeout(function(){  generateRepitiveOrders(filteredInstruments); },4000); 

           //  setTimeOutVar();



}



async function fireDeltaOrder(value, orderId){

                 await cancelOrder(orderId);
                 
                 fireOrder(value,'delta');

}

async function fireOrder(v ,type){
             
             //commenting buying logic once and for all
            if(v.direction === "buy" && type !== "selection"){
                //place buy ordee
               // console.log('buy for instrument');
                console.log('buy order is fired for' + v.instrument );
                await buyOrder(v.instrument ,v.price ,v.quantity);
              } 
             if(v.direction ==="sell"){
              //place sell order
                console.log('sell  order is fired for' + v.instrument );
                await sellOrder(v.instrument ,v.price ,v.quantity);
              }
            
         
}


function compareOurDeltaPositionWithOpenDeltaOrderbook(optiondata ,openOrders ,type){

 
//check if instrument is there in optionbook instrumentName and price quantity

if(openOrders.result != undefined && openOrders.result.length>0 ){

    openOrders.result.map((value, index) => {
          //let instrumentName = "BTC-26OCT18-9000-C";
          //let orderPrice = 0.0335;
         // let orderQuantity = 4.2;
          let direction = value.direction;
          let instrumentName = value.instrument;
          let orderPrice = value.price;
          let orderQuantity = value.quantity;
         
          index = _.findIndex(optiondata, function(valueD) { return valueD.instrumentName === instrumentName})
         
          if(index === -1){
            
          }
          else{
            
            
            //do opeartion here and see the quantity
               if(direction==="buy"){
                 //get the bid bid array and see if the value is present in there or not
                  var bidindex = _.findIndex(optiondata[index].bidsArray, function(bid) { return bid === orderPrice});
                  if(bidindex !== -1){

                   
                     
                       if(optiondata[index].bidsQuantity[bidindex] === orderQuantity){
                           optiondata[index].bidsArray.splice(bidindex, 1);
                           optiondata[index].bidsQuantity.splice(bidindex, 1);
                           optiondata[index].bidsCM.splice(bidindex, 1);
                           optiondata[index].spy = true;
                          
                       }
                   
                   
                  }
                  else{
                     //do nothing here
                  }
                  
               }
               else if(direction === "sell"){ 

                //get the ask array and see if the value is present in there or not
                  var askindex = _.findIndex(optiondata[index].asksArray, function(ask) { return ask === orderPrice});
                  if(askindex !== -1){
                  
                   // var askquantityIndex = _.findIndex(optiondata[index].asksQuantity, function(askQty) { return askQty == orderQuantity});
                       if(optiondata[index].asksQuantity[askindex] === orderQuantity){
                           optiondata[index].asksArray.splice(askindex, 1);
                           optiondata[index].asksQuantity.splice(askindex, 1);
                           optiondata[index].asksCM.splice(askindex, 1);
                           optiondata[index].spy = true;
                       }

                  }
                  else{
                     //do nothing here
                  }

               }

          }

     })
   }

//debugger; //open order book comparison here

generateCleanOrderBook(optiondata , 'deltaOrderBook');




}


function compareOurOrderVsOpenOrderBook(optiondata ,openOrders ,type){

  
//check if instrument is there in optionbook instrumentName and price quantity

if(type == "open"){
// debugger;
}

if(openOrders.result != undefined && openOrders.result.length>0 ){

     openOrders.result.map((value, index) => {

          let direction = value.direction;
          let instrumentName = value.instrument;
          let orderPrice = value.price;
          let orderQuantity = value.quantity;
         
          index = _.findIndex(optiondata, function(valueD) { return valueD.instrumentName === instrumentName})
         
          if(index == -1){
            
          }
          else{
            
            
            //do opeartion here and see the quantity
               if(direction=== "buy"){
                 //get the bid bid array and see if the value is present in there or not
                  var bidindex = _.findIndex(optiondata[index].bidsArray, function(bid) { return bid === orderPrice});
                  if(bidindex !== -1){

                   if(instrumentName === "BTC-28SEP18-8500-C"){
                   // ; 
                   //lovely
                      
                   }
                     
                       if(optiondata[index].bidsQuantity[bidindex] === orderQuantity){
                           optiondata[index].bidsArray.splice(bidindex, 1);
                           optiondata[index].bidsQuantity.splice(bidindex, 1);
                           optiondata[index].bidsCM.splice(bidindex, 1);
                           optiondata[index].spy = true;
                          
                       }
                   
                   
                  }
                  else{
                     //do nothing here
                  }
                  
               }
               else if(direction === "sell"){ 

                //get the ask array and see if the value is present in there or not
                  var askindex = _.findIndex(optiondata[index].asksArray, function(ask) { return ask === orderPrice});
                  if(askindex !== -1){
                  
                   // var askquantityIndex = _.findIndex(optiondata[index].asksQuantity, function(askQty) { return askQty == orderQuantity});
                       if(optiondata[index].asksQuantity[askindex] === orderQuantity){
                           optiondata[index].asksArray.splice(askindex, 1);
                           optiondata[index].asksQuantity.splice(askindex, 1);
                           optiondata[index].asksCM.splice(askindex, 1);

                           optiondata[index].spy = true;
                       }

                  }
                  else{
                     //do nothing here
                  }

               }

          }

          

     })
}

 

if(type ==="position"){
     //  ;
   //  debugger;
   generateCleanOrderBook(optiondata , 'filterPositionData')
}
else if(type === "open"){
 // debugger;
    generateCleanOrderBook(optiondata);

}




}

async function getOpenOrderBook(optiondata ,param){

  
        var data = await restClient.getopenorders();

       // debugger;

        if(data.result != undefined){

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


        }
        else{
                  cancelOrderAll();
                  startDetecting();
        }


}

///telstra
/*if(value.instrument == "BTC-26OCT18-8000-C"){
                 ;
           }*/

async function getOpenOrderBookForOpenPositionsAndDelta(openposition ,type){
         var auth;
         var uri = '/api/v1/private/getopenorders';
         var params = {};
         

         var data = await restClient.getopenorders();

          if(data.result != undefined){
                   if(type === "openPosition"){
                       comparePositionCleanOrderBookWithOpenOrderbook(openposition,data, type);
                    }
                    else if(type === "delta"){
                    //  debugger;
                      comparePositionCleanOrderBookWithOpenOrderbook(openposition,data, type);
                    }
          }
          else{
               cancelOrderAll();
               startDetecting();

          }
}

function generateCleanOrderBook(optiondata ,optionType){


 //debugger;

 if(optionType === "filterPositionData"){
      //  generateOptimalPriceForOpenPositionsAndDelta(optiondata , optionType);
      // debugger;
    }

optiondata.map((value, index) => {
     
     // var spread = value.Spread;console.log

      
      let asksArray = value.asksArray;
      let asksQuantity = value.asksQuantity;
      let bidsArray =  value.bidsArray;
      let bidsQuantity = value.bidsQuantity;
      let instrumentName = value.instrumentName;
      let spreadValue = 0;
      if(value.asksArray.length >0 &&  value.bidsArray.length >0){
              spreadValue =  Number((value.asksArray[0]-value.bidsArray[0]).toFixed(4)); 
      }

      if(value.asksArray.length >0 &&  value.bidsArray.length == 0){
              spreadValue =  Number(value.asksArray[0].toFixed(4)); 
      }

      if(value.asksArray.length === 0 &&  value.bidsArray.length > 0){
              spreadValue =  Number(value.bidsArray[0].toFixed(4)); 
      }


      
      let tickSize = value.tickSize;
      let asksCM =  value.asksCM;
      let bidsCM = value.bidsCM;

      let globalindex = index;
      optiondata[globalindex].CleanedSellOrderBook = [];
      optiondata[globalindex].CleanedBuyOrderBook = [];


       if(spreadValue > 2*tickSize) {
     
        
        //adding two ticks to the bids side and substracting two ticks to asks side
      
        //removing tick from asks side and calculatig cm
          
          if(asksArray.length >1 && asksQuantity.length >1){

             for(var i=0;i<asksArray.length;i++){
               var cm = 0;
              
                asksArray[i]= asksArray[i]-tickSize;
                let pricedata = parseFloat(asksArray[i].toFixed(4));
                let quantdata = parseFloat(asksQuantity[i].toFixed(4));
                
              //logic to write cm for each clean sell order book
               if(i === 0){
                 cm = 0;
               }
               else{
                //dding cumulative cm
                cm = optiondata[globalindex].CleanedSellOrderBook[i-1].cm + asksQuantity[i-1];
               }

               let cmdata = parseFloat(cm.toFixed(4));
             // debugger;

               var data  = {'quantity' : value.Qty ,'cm' : cmdata, 'price': pricedata, 'instrument' : instrumentName };
               optiondata[globalindex].CleanedSellOrderBook.push(data);
             
            }

          }
         
          if(asksArray.length === 1 && asksQuantity.length  === 1){
              
                //debugger;
               var data  = {'quantity' : value.Qty ,'cm' : asksCM[0], 'price': asksArray[0], 'instrument' : instrumentName };
             
               optiondata[globalindex].CleanedSellOrderBook.push(data);
          }
          

 
        //adding ticks to bids side and calculatig cm  //parseInt(asksArray[i].toPrecision(4)) 

       if(bidsArray.length >1 && bidsQuantity.length >1){
           
           for(var i=0;i<bidsArray.length;i++){
              var cm = 0;
              bidsArray[i]= tickSize+bidsArray[i];

              let pricedata = parseFloat(bidsArray[i].toFixed(4));
              let quantdata = parseFloat(bidsQuantity[i].toFixed(4));

             
              
             
              //logic to write cm for each clean sell order book
              if(i === 0){
                 cm = 0;
              }
              else{
                //adding cumulative cm
                cm = optiondata[globalindex].CleanedBuyOrderBook[i-1].cm + bidsQuantity[i-1];
              }

              let cmdata = parseFloat(cm.toFixed(4));
              var data  ={'quantity' : value.Qty , 'cm' : cmdata, 'price': pricedata, 'instrument' : instrumentName , 'cm' : cm};
              optiondata[globalindex].CleanedBuyOrderBook.push(data);
          }
         
        }

         if(bidsArray.length === 1 && bidsQuantity.length  === 1){
           // debugger;
              
               var data  = {'quantity' : value.Qty ,'cm' : bidsCM[0], 'price': bidsArray[0], 'instrument' : instrumentName };
              
               optiondata[globalindex].CleanedBuyOrderBook.push(data);
          }
          
          
  
        
         
           //got the index of same values now
        }
      else if(spreadValue <= 2*tickSize){
        
         
          if(asksArray.length === 1 && asksQuantity.length  === 1){
              //debugger;
              
               var data  = {'quantity' : value.Qty ,'cm' : asksCM[0], 'price': asksArray[0], 'instrument' : instrumentName };
              
               optiondata[globalindex].CleanedSellOrderBook.push(data);
          }


         if(bidsArray.length === 1 && bidsQuantity.length  === 1){
              
               var data  = {'quantity' : value.Qty ,'cm' : bidsCM[0], 'price': bidsArray[0], 'instrument' : instrumentName };
             
               optiondata[globalindex].CleanedBuyOrderBook.push(data);
          }



         if(asksArray.length >1 && asksQuantity.length >1){
          for(var i=1;i<value.asksArray.length;i++){
             if(i>0){   
                var  data =  parseFloat(asksArray[i].toFixed(4))-tickSize;
                asksArray[i] = parseFloat(data.toFixed(4)) ;
             }
          }
        }

      
        //adding ticks to bids side
        if(bidsArray.length >1 && bidsQuantity.length >1){
          for(var i=1;i<value.bidsArray.length;i++){
              if(i>0){
                 var data  = tickSize + parseFloat(bidsArray[i].toFixed(4));
                 bidsArray[i]= parseFloat(data.toFixed(4)) ;
              }
          }
        }


           //check if ask first and second value is same
            


         if(asksArray.length >1 && asksQuantity.length >1){
            if(asksArray[1] === asksArray[0]){
               asksQuantity[0] = parseFloat(asksQuantity[0].toFixed(4)) + parseFloat(asksQuantity[1].toFixed(4));
               //we hv to remove asksArray,askquantity
                //asksArray.splice(1,1);
               // asksQuantity.splice(1,1);
               
                var l = 2;

                //items.slice(0, i-1).concat(items.slice(i, items.length));
                if(asksQuantity.length ==2 ){
                     asksQuantity.slice(0, l-1);
                     asksArray.slice(0, l-1)
                }
                if(asksQuantity.length > 2 ){
                    asksQuantity.slice(0, l-1).concat(asksQuantity.slice(l, asksQuantity.length));
                    asksArray.slice(0, l-1).concat(asksArray.slice(l, asksArray.length));
                }
                


            }
          }



          if(bidsArray.length >1 && bidsQuantity.length >1){
            if(bidsArray[1] === bidsArray[0]){
               bidsQuantity[0] = parseFloat(bidsQuantity[0].toFixed(4)) + parseFloat(bidsQuantity[1].toFixed(4));

                var l = 2;

                //items.slice(0, i-1).concat(items.slice(i, items.length));
                if(bidsQuantity.length ==2 ){
                     bidsQuantity.slice(0, l-1);
                     bidsArray.slice(0, l-1)
                }
                if(bidsQuantity.length > 2 ){
                    bidsQuantity.slice(0, l-1).concat(bidsQuantity.slice(l, bidsQuantity.length));
                    bidsArray.slice(0, l-1).concat(bidsArray.slice(l, bidsArray.length));
                }
               
            }
          }


              //removing tick from asks side and calculatig cm

        if(asksArray.length >1 && asksQuantity.length >1){
          for(var i=0;i<asksArray.length;i++){

                let pricedata = parseFloat(asksArray[i].toFixed(4));
                let quantdata = parseFloat(asksQuantity[i].toFixed(4));

               var cm = 0;
              //logic to write cm for each clean sell order book
               if(i == 0){
                 cm = 0;
               }
               else{
                //dding cumulative cm
                cm = optiondata[globalindex].CleanedSellOrderBook[i-1].cm + asksQuantity[i-1];
               }
                // debugger;

              let cmdata = parseFloat(cm.toFixed(4));
               var data  = {'quantity' : value.Qty ,'cm' : cmdata, 'price': pricedata, 'instrument' : instrumentName };
               optiondata[globalindex].CleanedSellOrderBook.push(data);
          }
        }
        
       

        //adding ticks to bids side and calculatig cm

         if(bidsArray.length >1 && bidsQuantity.length >1){

          for(var i=0;i<bidsArray.length;i++){
              var cm = 0;
              //logic to write cm for each clean sell order book
              if(i === 0){
                 cm = 0;
              }
              else{
                //adding cumulative cm
                cm = optiondata[globalindex].CleanedBuyOrderBook[i-1].cm + bidsQuantity[i-1];
              }

              let pricedata = parseFloat(bidsArray[i].toFixed(4));
              let quantdata = parseFloat(bidsQuantity[i].toFixed(4));
              let cmdata = parseFloat(cm.toFixed(4));

              var data  ={'quantity' : value.Qty , 'cm' : cmdata, 'price': pricedata, 'instrument' : instrumentName , 'cm' : cm};
              optiondata[globalindex].CleanedBuyOrderBook.push(data);
          }
     }

          
       }
       else{
                console.log('33');
       }



});



    if(optionType === "filterPositionData"){
      //  debugger;
        generateOptimalPriceForOpenPositionsAndDelta(optiondata , optionType);
    }
    else if(optionType === "deltaOrderBook"){
      //   debugger;
        generateOptimalPriceForOpenPositionsAndDelta(optiondata , optionType);
    }
    else{

        generateOptimalPrice(optiondata);
    }

}





function objectToString(obj, encode) {
  var result = [];
  Object.keys(obj).sort().forEach((key) => {
    var value = obj[key];
    if (Array.isArray(value) && !encode) {
      value = value.join('');
    } else if(encode) {
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
  var d = new Date(), ms = d.getTime() + (d.getTimezoneOffset() * 60000);
  return ms;
};

function serialize(tstamp, accKey, accSec, uri, params) {
  var key, keys = [], i, l, s = '';
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
  return '_=' + tstamp + '&_ackey=' + accKey + '&_acsec=' + accSec
      + '&_action=' + uri + s;
};

function str2buffer(str) {
  var bytes = new Uint8Array(str.length);
  for (var iii = 0; iii < str.length; iii++) {
    bytes[iii] = str.charCodeAt(iii);
  }

  return bytes;
};

 



 function getDeribitiveInstrumentFirsCall(api_key, secret, request_token){  

//alert('called');

  //return function(dispatch) {
       axios.get('https://www.deribit.com/api/v1/public/getinstruments')
       .then(function(response){
           let data =  response.data.result;
          // addVolumeToInstrument(data);
           //here we will add function to call deribitive instrument after some time

           if(data != undefined){
                addVolumeToInstrument(data);
            }

           setInterval(function(){ 
                     //getInstrumentRepetitive();
                     getDeribitiveInstrument();
           }, instrumentSelectionInterval);

           //dispatch({type :'GOT_INSTRUMENTS' , payload: combodata})

       })
       .catch(function (error) {
                       
                    //console.log(error);
                    console.log('error in getting instruments first call');
                    cancelOrderAll();
                    startDetecting();
        })

//}


};

function getDeribitiveInstrument(){
      //cancell all order
        //cancelOrderAll();

    filteredInstruments = [];
    global.clearTimeout(setTimeOutVar);
    axios.get('https://www.deribit.com/api/v1/public/getinstruments')
       .then(function(response){
            let data =  response.data.result;
            if(data != undefined){
                addVolumeToInstrument(data);
            }
            else{
              //console.log(error);
              // cancelOrderAll();
            //  startDetecting();
            }
            

       })
       .catch(function (error) {
            console.log('error in getting instruments');
           // console.log(error);
            cancelOrderAll();
            startDetecting();
        })

}

 function addVolumeToInstrument(data){

 
      data.map((value , index) => {
      
         let uri ='https://www.deribit.com/api/v1/public/getsummary?instrument=';
         let combourl = `${uri}${value.instrumentName}`;
          axios.get(combourl)
           .then(function(response){

              value.volume  = response.data.result.volume;

              if(index === data.length-1){
                  addLastTradedToData(data);
              }

           })
           .catch(function (error) {
                    //console.log(error);
                    console.log('error in getting summary');
                    cancelOrderAll();
                    startDetecting();
           })
      });
  
      
 
}


function addLastTradedToData(data){


if(data != undefined ){

   data.map((value , index) => {

     var d = new Date();
     var timeStampnow= Math.floor(Date.now() / 1000);
     var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
     var timeStampbefore = Math.floor(yesterday / 1000);
     var timedata = (timeStampnow - timeStampbefore);
     var uri ='https://www.deribit.com/api/v1/public/getlasttrades?instrument=';
     var sinceurl ='&since='
     var combineurl = `${uri}${value.instrumentName}${sinceurl}${timedata}`;

             axios.get(combineurl)
                .then(function(response){
                  
                      var quant = 0 ;
                      response.data.result.map((value, index) => {
                        quant = parseInt(value.quantity) + quant;
                      });
                      value.quantity  = quant;

                      if(index === data.length-1){
                            getCallAndPutDataSeparately(data);
                       }

                })
                .catch(function (error) {
                         console.log('error in getting last traded data');
                         cancelOrderAll();
                         startDetecting();
            });


   });
}

};


function getCallAndPutDataSeparately(data){
                              var TUCallsArray = [];
                              var TUPutsArray = [];
                              var newTUCallsArray = [];
                              var newTUPutsArray = [];
                              let callComplete = 0;
                              let putComplete = 0 ;

                              data.map((value , index) =>{
                                  if(value.instrumentName.slice(-1) === "C"){
                                     TUCallsArray.push(value);
                                  }
                                  else if(value.instrumentName.slice(-1) === "P"){
                                      TUPutsArray.push(value);
                                   }
                               });

                               console.log('inside endinggg column 2');
                               TUCallsArray = _.sortBy(TUCallsArray, 'volume').reverse();
                               TUPutsArray = _.sortBy(TUPutsArray, 'volume').reverse();

            
                               TUCallsArray.map((value ,index) =>{
                                  TUCallsArray[index].rank = index;
                               });

                               TUPutsArray.map((value ,index) =>{
                                 TUPutsArray[index].rank = index;
                              });

                               TUCallsArray = _.sortBy(TUCallsArray, 'quantity').reverse();
                               TUPutsArray = _.sortBy(TUPutsArray, 'quantity').reverse();

            
                               TUCallsArray.map((value ,index) =>{
                                  TUCallsArray[index].churnrank = index;
                               });

                               TUPutsArray.map((value ,index) =>{
                                   TUPutsArray[index].churnrank = index;
                               });
                
                              //LiquidityRank

                               TUCallsArray.map((value ,index) =>{
                                  TUCallsArray[index].LiquidityRank = (value.churnrank+value.rank)/2;;
                               });

                               TUPutsArray.map((value ,index) =>{
                                  TUPutsArray[index].LiquidityRank = (value.churnrank+value.rank)/2;;
                               });
           

                               //keeping top 15 of calls and puts
                               TUCallsArray = _.sortBy(TUCallsArray, 'LiquidityRank').slice(0, 15);
                               TUPutsArray = _.sortBy(TUPutsArray, 'LiquidityRank').slice(0, 15);
       
                      //combining this two array and 


                               TUCallsArray.map((value ,index) =>{

                                   let uri ='https://test.deribit.com/api/v1/public/getorderbook?instrument=';
                                   let combourl = `${uri}${value.instrumentName}`;
                      

                      //axios starts here
                                    axios.get(combourl)
                                    .catch(function (error) {
                                               //console.log(error);
                                               console.log('error in getting orderbook of instrument of tucalls');
                                               cancelOrderAll();
                                               startDetecting();
                                     })
                                    .then(function(response){
                                        //finding min and max bid
                                        var minask =0;
                                        var maxbid = 0;
                                        var spread = 0;
                                        var depth = 0;
                                        var CER = 0;
                                        var TD  = 0;

                                        if(response != undefined){

                                          if(response.data.result !== undefined){

                                            var askArray = response.data.result.asks;
                                            var bidsArray = response.data.result.bids;
                                            var thetaVar =  response.data.result.theta;


                                              if(askArray!=undefined ){
                                          //ashutosh
                                            minask =  _.minBy(_.map(askArray, 'price'));
                                            depth  =  askArray.length;
                                            CER  = (minask + 0.08)/minask;
                                          }

                                         if(bidsArray !=undefined){
                                           maxbid =  _.maxBy(_.map(bidsArray, 'price'));
                                         }


                                         if(minask !== 0 && maxbid !== 0){
                                          spread =  (minask - maxbid)/(minask + maxbid)/2;

                                          }

                                          if(thetaVar !== undefined && minask !== 0){
                                              TD  =  -thetaVar/minask;
                                          }

                                          }
                                          

                                          
                                       }
                                        

                                        

                                        
                                      
                                         

                                         //Spread < Min Spread (Input
                             
                           

                                       if(depth >= MinDepth && spread >=MinSpread && CER >= MinCER){
                                            //depth condition

                                          value.Depth = depth;
                                          value.Spread = spread;
                                          value.CER = CER;
                                          value.Orderbook = response.data.result;
                                          value.TD = TD;
                                          if(response.data.result.asks !== undefined){
                                              if(response.data.result.asks.length >0){
                                                 value.asksArray = _.map(response.data.result.asks, 'price');
                                                 value.asksQuantity = _.map(response.data.result.asks, 'quantity');
                                                 value.asksCM = _.map(response.data.result.asks, 'cm');
                                              }
                                              else{
                                                value.asksArray = [];
                                                value.asksQuantity = [];
                                                value.asksCM = [];
                                              }

                                          }

                                          if(response.data.result.bids !== undefined){
                                              if(response.data.result.bids.length >0){
                                                 value.bidsArray = _.map(response.data.result.bids, 'price');
                                                 value.bidsQuantity = _.map(response.data.result.bids, 'quantity');
                                                 value.bidsCM = _.map(response.data.result.bids, 'cm');
                                              }
                                              else{
                                                value.bidsArray =[];
                                                value.bidsQuantity = [];
                                                value.bidsCM =[];
                                              }

                                          }
                                          
                                          value.boolSendTrade = false;
                                          value.SendTrade = [];
                               
                                          newTUCallsArray.push(value);

                                        }
                                           else
                                             {
                            
                                                 //delete this document as depth criteria is not met
                                             }

                                           if(index == TUCallsArray.length-1){
                                             newTUCallsArray = _.sortBy(newTUCallsArray, 'Spread').reverse();
                                             newTUCallsArray.map((value ,index) =>{
                                                newTUCallsArray[index].IntSpreadRank = index;
                                              });

                                              newTUCallsArray = _.sortBy(newTUCallsArray, 'CER').reverse();
                                              newTUCallsArray.map((value ,index) =>{
                                                  newTUCallsArray[index].IntCERRank = index;
                                              });

                                              newTUCallsArray = _.sortBy(newTUCallsArray, 'TD').reverse();
                                              newTUCallsArray.map((value ,index) =>{
                                                  newTUCallsArray[index].IntThetaRank = index;
                                                  newTUCallsArray[index].floatAttractiveness_Index = (value.LiquidityRank + value.IntSpreadRank + value.IntCERRank + index)/4;
         
                                               });

                                              newTUCallsArray = _.sortBy(newTUCallsArray, 'rank').slice(0, NumberOfQuotes);
                                       

                                              if(putComplete ===1){
         
                                                filteredInstruments = {'TUPuts': newTUPutsArray,'TUCalls' :newTUCallsArray};
                                                generateRepitiveOrders(filteredInstruments);
                                  
                                               }
                                              else{
                                                   callComplete = callComplete+1;
                                              }
                                          }
                                    }); 
                                    //axios ends here////

                              });
                            //big axios closed here



                   TUPutsArray.map((value ,index) =>{
                        let uri ='https://test.deribit.com/api/v1/public/getorderbook?instrument=';
                        let combourl = `${uri}${value.instrumentName}`;
                       
                         axios.get(combourl)
                         .catch(function (error) {
                                  // console.log(error);
                                   console.log('error in getting orderbook of instrument of tuputs');
                                   cancelOrderAll();
                                   startDetecting();

                                  //setTimeOutVar = global.setTimeout(function(){  generateRepitiveOrders(filteredInstruments); },4000); 
                           })
                         .then(function(response){
                          //finding min and max bid theta
                           /*var minask =  _.minBy(_.map(response.data.result.asks, 'price'));
                           var maxbid =  _.maxBy(_.map(response.data.result.bids, 'price'));
                           var spread =  (minask - maxbid)/(minask + maxbid)/2;
                           var depth  =  response.data.result.asks.length;
                           var CER    =     (minask + 0.08)/minask;
                           var TD  = -(response.data.result.theta)/minask;*/

                                      var minask =0;
                                      var maxbid = 0;
                                      var spread = 0;
                                      var depth = 0;
                                      var CER = 0;
                                      var TD  = 0;

                                        if(response != undefined){

                                          if(response.data.result !== undefined){

                                                  var askArray = response.data.result.asks;
                                          var bidsArray = response.data.result.bids;
                                          var thetaVar =  response.data.result.theta;

                                          if(askArray!=undefined ){
                                          //ashutosh
                                            minask =  _.minBy(_.map(askArray, 'price'));
                                            depth  =  askArray.length;
                                            CER  = (minask + 0.08)/minask;
                                          }

                                         if(bidsArray !=undefined){
                                           maxbid =  _.maxBy(_.map(bidsArray, 'price'));
                                         }


                                         if(minask !== 0 && maxbid !== 0){
                                          spread =  (minask - maxbid)/(minask + maxbid)/2;

                                          }

                                          if(thetaVar !== undefined && minask !== 0){
                                              TD  =  -thetaVar/minask;
                                          }

                                          }
                                          
                                       }


                          if(depth >= MinDepth && spread >=MinSpread && CER >= MinCER){

                            //depth condition
                                value.Depth = depth;
                                value.Spread = spread;
                                value.CER = CER;
                                value.Orderbook = response.data.result;
                                value.TD = TD;
                                

                                          if(response.data.result.asks != undefined){
                                              if(response.data.result.asks.length >0){
                                                 value.asksArray = _.map(response.data.result.asks, 'price');
                                                 value.asksQuantity = _.map(response.data.result.asks, 'quantity');
                                                 value.asksCM = _.map(response.data.result.asks, 'cm');
                                              }
                                              else{
                                                value.asksArray = [];
                                                value.asksQuantity = [];
                                                value.asksCM = [];
                                              }

                                          }

                                          if(response.data.result.bids != undefined){
                                              if(response.data.result.bids.length >0){
                                                 value.bidsArray = _.map(response.data.result.bids, 'price');
                                                 value.bidsQuantity = _.map(response.data.result.bids, 'quantity');
                                                 value.bidsCM = _.map(response.data.result.bids, 'cm');
                                              }
                                              else{
                                                value.bidsArray =[];
                                                value.bidsQuantity = [];
                                                value.bidsCM =[];
                                              }

                                          }
                                value.boolSendTrade = false;
                                value.SendTrade = [];

                                newTUPutsArray.push(value);

                          }
                          else{
                            
                              //alert
                            //delete this document as depth criteria is not met
                          }

                          if(index === TUPutsArray.length-1){

                                
                              newTUPutsArray = _.sortBy(newTUPutsArray, 'Spread').reverse();
                                   newTUPutsArray.map((value ,index) =>{
                                       newTUPutsArray[index].IntSpreadRank = index;
                                });
                                newTUPutsArray = _.sortBy(newTUPutsArray, 'CER').reverse();
                                newTUPutsArray.map((value ,index) =>{
                                     newTUPutsArray[index].IntCERRank = index;
                                 });
                                newTUPutsArray = _.sortBy(newTUPutsArray, 'TD').reverse();
                                newTUPutsArray.map((value ,index) =>{
                                     newTUPutsArray[index].IntThetaRank = index;
                                     newTUPutsArray[index].floatAttractiveness_Index = (value.LiquidityRank + value.IntSpreadRank + value.IntCERRank + index)/4;

                                 });
                                newTUPutsArray = _.sortBy(newTUPutsArray, 'rank').slice(0, NumberOfQuotes);

                             if(callComplete ===1){

                                  filteredInstruments = {'TUPuts': newTUPutsArray,'TUCalls' :newTUCallsArray};
                                  generateRepitiveOrders(filteredInstruments);
                               }
                            else{
                                 putComplete = putComplete+1;
                            }
                           }
                         });  
                               });

}


function getDeltaHedeger(openPosition){

      var deltaOrderBook = [];
      totalDeltaHedger = 0;
      var  existDiff = 0;

      openPosition.map((value, index) => {
            totalDeltaHedger = totalDeltaHedger + value.delta;
      });

      var btcIndex =  _.findIndex(openPosition, function(valueD) { return valueD.instrument === "BTC-PERPETUAL"});

      if(btcIndex !== -1){
         btcPositionQty = openPosition[btcIndex].size;
         existDiff =  (btcPositionQty*10)/openPosition[btcIndex].averagePrice;
      }

      if(globalDelta === 0 && existDiff === 0){
       //first time
        globalDelta = totalDeltaHedger;  
        globalDeltaDiff = parseFloat(totalDeltaHedger.toFixed(4));
      }
      else{
        globalDeltaDiff = parseFloat((totalDeltaHedger-existDiff).toFixed(4));
      }

      
     
      console.log('total delta hedger is !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' + totalDeltaHedger);

      if(globalDeltaDiff >0){
       //we hv to take short position in future
       //delta is positive , trade direction will be short
          deltaTradeDirection = "sell";

       }
       else if(globalDeltaDiff  < 0){
       //we have to take long position in future
       //delta is negative , trade direction will be long
          deltaTradeDirection = "buy";
       }

       let uri ='https://test.deribit.com/api/v1/public/getorderbook?instrument=';
       let combourl = `${uri}${HedgingFutureName}`;
                      

        //axios starts here

        if(globalDeltaDiff !== 0 && globalDeltaDiff !== -0){
          //debugger;

          //not do anything when diff is 0
           axios.get(combourl).then(function(response){
          
            //now we have to pass this 
             let orderdata = response.data.result;
             if(orderdata !== undefined){
                      
                        orderdata.asksArray =  _.map(response.data.result.asks, 'price');
                        orderdata.bidsArray =  _.map(response.data.result.bids, 'price');
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
             getOpenOrderBook(deltaOrderBook , 3);

       }).catch(function (error) {
                       
                    //console.log(error);
                    console.log('error in getting delta hedger');
                    cancelOrderAll();
                    startDetecting();
        })


        }
      

};

