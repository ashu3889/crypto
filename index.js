var axios = require('axios');
var _ = require("lodash") ;
var $ = require('jquery') ;
var jStat = require('jStat').jStat;

var config = {
  url: 'https://test.deribit.com',
  key: '8spusFYWhSZD',
  secret: 'BCMZ5R7DJYCTTE6TLVOGI52RRGQ5EC7M',
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



/*var MinDepth = 0;
var MinSpread = 0;
var MinCER = 0;*/




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

function resumeStartDetectingAfterError(){

  //first clear any interval which we have now clearInterval
  console.log('error happen, so now resuming detection again.... clearing setinterval also ..and starting fresh one');
  global.clearInterval(instrumentTimer);

  getDeribitiveInstrumentFirsCall();


  //then resume the getDeribitiveInstrumentFirsCall function
}

async function generateRepitiveOrders(data){  

  //console.log('ashuttooosososososososososo');
  //console.log(JSON.stringify(data));

try
  {
       var data = await restClient.positions();
       if(data.result !== undefined){
               generateOpenPositions(data.result , filteredInstruments);
       }
       else{
          cancelOrderAll();
          resumeStartDetectingAfterError();
       }
  }
  catch (e)
  {
     console.log('error in getting repetitive orders');
     //logger.error(e);
     await cancelOrderAll();
     resumeStartDetectingAfterError();
  }

      
}


function generateOpenPositions(data, selectedInstrument){

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

function generateInstrumentQuantity(data){
//function to calculate instrument quanitity
var comboArray = [];

if(data.TUCalls !== undefined && data.TUPuts !== undefined ){
      data.TUCalls.map((value, index) =>{
       let r = value.floatAttractiveness_Index;
       let n = NumberOfQuotes;
     
       let Qty = 2*Risk_Residual*(n-r)/(n*(n+1));
       var rounded = Math.abs(parseFloat(Qty.toFixed(1)));
       
       data.TUCalls[index].Qty = rounded;
     });


    data.TUPuts.map((value, index) =>{
       let r = value.floatAttractiveness_Index;
       let n = NumberOfQuotes;
       let Qty = 2*Risk_Residual*(n-r)/(n*(n+1));
       var rounded = Math.abs(parseFloat(Qty.toFixed(1)));
       data.TUPuts[index].Qty = rounded;
     });
     comboArray = accumulateCallAndPutTrades(data.TUCalls,data.TUPuts);

}
     generateOrderBook(comboArray);
}

function  generateOrderBook(comboArray){


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

      


  try
  {
       var data = await restClient.positions();
      
       if(data.result !== undefined){
           generateCleanBookAndPriceForOpenPositions(data.result ,'position');
           getDeltaHedeger(data.result);
       }
       else{
            cancelOrderAll();
            resumeStartDetectingAfterError();
       }
  }
  catch (e)
  {
        console.log('error in getting oprn position');
        //logger.error(e);
        await cancelOrderAll();
        resumeStartDetectingAfterError();
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


   try {
            console.log('buy is calling for' + instrument);
            var data = await restClient.buy(instrument, bidBestQuant, bidBest, true, "");
            console.log("buyOrder", instrument, bidBest, bidBestQuant);
    } catch (e) {
    //logger.error(e);
    console.log('error');
    await PromiseTimeout(6000);
    await cancelOrderAll(); 
    }

   
}

async function sellOrder(instrument, bestPriceSell, bestQuant) {


   try {
       console.log('sell is firing for' + instrument);
       var data = await restClient.sell(instrument, bestQuant, bestPriceSell, true, "");
       console.log("sellOrder", instrument, bestPriceSell, bestQuant);
    } catch (e) {
    //logger.error(e);
       console.log('error');
       await PromiseTimeout(6000);
       await cancelOrderAll(); 
    }


   
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

    try {
        var data = await restClient.request("/api/v1/private/edit", options);
        console.log("editOrder", row, price, size);
    } catch (e) {
    //logger.error(e);
       console.log('error');
       await PromiseTimeout(6000);
       await cancelOrderAll(); 
    }

   
}


async function cancelOrder(OrderId) {

    try {
       var data = await restClient.cancel(OrderId);
       console.log("Cancelled Order", OrderId);
    } catch (e) {
    //logger.error(e);
    console.log('error');
    await PromiseTimeout(6000);
    await cancelOrderAll(); 
    }
}




async function cancelOrderAll() {
    try {
        await restClient.cancelall("all");
        console.log("Cancelled All Orders");
    } catch (e) {
    //logger.error(e);
    console.log('error');
    await PromiseTimeout(6000);
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

            if(type === "delta" && deltaIndex !== -1){
                
                 let diffqty = value.quantity - openOrderBook[deltaIndex].quantity;
                 if(diffqty !== 0){
                     editOrder(openOrderBook[deltaIndex].orderId,value.price,diffqty);
                  }
               
            }

            if(deltaIndex === -1 && type ==="delta"){
                // debugger;
                // console.log(value);
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



function compareCleanOrderBookWithOpenOrderbook(optiondata,openOrderBook ,type){



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
 
             setTimeOutVar = global.setTimeout(function(){  generateRepitiveOrders(filteredInstruments); },2000); 

           //  setTimeOutVar();



}




async function fireOrder(v ,type){


   try {
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

    } catch (e) {
    //logger.error(e);
    console.log('error');
    await PromiseTimeout(6000);
    await cancelOrderAll(); 
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
                  resumeStartDetectingAfterError();
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

         

        

  try
  {
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
               resumeStartDetectingAfterError();

          }  

     
  }
  catch (e)
  {    
        console.log(e);
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
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
                asksArray[0]= asksArray[0]-tickSize;
                let pricedata = parseFloat(asksArray[0].toFixed(4));

               var data  = {'quantity' : value.Qty ,'cm' : asksCM[0], 'price': pricedata, 'instrument' : instrumentName };
             
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
               bidsArray[0]= tickSize+bidsArray[0];
               var pricedata = parseFloat(bidsArray[0].toFixed(4));
              
               var data  = {'quantity' : value.Qty ,'cm' : bidsCM[0], 'price': pricedata, 'instrument' : instrumentName };
              
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

 



 async function getDeribitiveInstrumentFirsCall(api_key, secret, request_token){  


  try
  {
       var data = await restClient.getinstruments();
       console.log('got the data');
       //console.log(data.data.result);
      
       if(data.result !== undefined){
         //  addVolumeToInstrument(data.result);
           addLastTradedToData(data.result);
       }
       else{
            cancelOrderAll();
            resumeStartDetectingAfterError();
       }

       var instrumentTimer =   setInterval(function(){ 
              startDetecting();
       }, instrumentSelectionInterval);

     
  }
  catch (e)
  {    
        console.log(e);
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }



};

//RestClient.prototype.getinstruments = function(callback) {
 // return this.request("/api/v1/public/getinstruments", {}, callback);
//};


async function getDeribitiveInstrument(){
      //cancell all order
        //cancelOrderAll();

    filteredInstruments = [];
    global.clearTimeout(setTimeOutVar);

    try
  {
       var data = await restClient.getinstruments();
       console.log('got the data deribitive instruments');
       //console.log(data.data.result);
      
       if(data.result !== undefined){
           //addVolumeToInstrument(data.result);
           addLastTradedToData(data.result);
       }
       else{
            cancelOrderAll();
            resumeStartDetectingAfterError();
       }

     /* setInterval(function(){ 
              startDetecting();
       }, instrumentSelectionInterval);*/
  }
  catch (e)
  {
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }


}

async function addVolumeToInstrument(data){
  try
  {
     var finaldata =  await process(data);
     console.log('final data legnth is'+ finaldata.length );
     if(finaldata.length > 0){
         addLastTradedToData(finaldata);
     }
  }
  catch (e)
  {
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}



async function getSummary(instrument) {
    

try
  {
         var data = await restClient.getsummary(instrument,"");
          return data;
  }
  catch (e)
  {
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}


function delay(){
  return new Promise(resolve => setTimeout(resolve, 50));
}

async function getSummaryData(item){

     


     try
  {
     var data = await getSummary(item.instrumentName , '');
     if(data.result !== undefined){
       if(typeof data.result.volume === 'number'){
           item.volume = data.result.volume ;
       }
       else{
            item.volume = 0;
       }
     }
     else{
        item.volume = 0;
     }
     return item;
  }
  catch (e)
  {
        console.log('error in getting summary data');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}

async function getLastTrades(instrument, count , since) {
   

    try
  {
        var data = await restClient.getlasttrades(instrument,count ,since , '');
        return data; 
  }
  catch (e)
  {
        console.log('error in getting last trades of instrument');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}

async function getLastTradeData(item){

           


           try
  {
         var d = new Date();
           var timeStampnow= Math.floor(Date.now() / 1000);
           var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
           var timeStampbefore = Math.floor(yesterday / 1000);
           var timedata = (timeStampnow - timeStampbefore);
           var data = await getLastTrades(item.instrumentName, undefined, timedata);
           
           var quant = 0 ;
           data.result.map((value, index) => {
                        quant = parseInt(value.quantity) + quant;
           });
           //debugger;
           item.quantity  = quant;

           return item;
  }
  catch (e)
  {
        console.log('error in getting last trade data');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}


async function newgetLastTradeData(){

  try
  {
           var d = new Date();
           var timeStampnow= Math.floor(Date.now() / 1000);
           var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
           var timeStampbefore = Math.floor(yesterday / 1000);
           var timedata = (timeStampnow - timeStampbefore);
           var data = await getLastTrades('options', timedata);
           
           return data;
  }
  catch (e)
  {
        console.log('error in getting summary data');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  } 
         
}

async function processOptionData(array){

   var newdata = await newgetLastTradeData();

     var collatedData = [];
    for(const item of array){

      //new data

     var  tradedData = _.without(_.map(newdata.result, function(o) {
    if (o.instrument == item.instrumentName) return o;
}), undefined);

     var quant = 0 ;
           tradedData.map((value, index) => {
                        quant = parseInt(value.quantity) + quant;
           });
          item.volume  = quant;
          item.quantity  = tradedData.length;

    }

   

    return array;
   
}

async function process(array){


  try
  {
    var collatedData = [];
    for(const item of array){
      var data = await getSummaryData(item);
      collatedData.push(data);
      console.log('volume data is getting added');
    }

    if(collatedData.length === array.length){

      console.log('volume calculation is done now');
       return collatedData;
    }
  }
  catch (e)
  {
        console.log('error in getting summary data');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  } 
    
}





async function addLastTradedToData(data){

 try
  {
     var finalTradeddata =  await processOptionData(data);
     if(finalTradeddata.length > 0){
           console.log('now entering call and put data separately wala call mai');
           getCallAndPutDataSeparately(finalTradeddata);
      }
     
  }
  catch (e)
  {
        console.log('error in getting instrument on first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
};

async function getOrdebookCallData(item){


  try
  {
    var data = await restClient.request("/api/v1/public/getorderbook", {instrument: item.instrumentName, depth: 30});

    //console.log('11......' + JSON.stringify(data));
   
     var minask =0;
     var maxbid = 0;
     var spread = 0;
     var depth = 0;
     var CER = 0;
     var TD  = 0;

     var askArray = data.result.asks;
     var bidsArray = data.result.bids;
     var thetaVar =  data.result.theta;


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

if (depth >= MinDepth && spread >= MinSpread && CER >= MinCER) {
    //depth condition

     //console.log('22......');

    item.Depth = depth;
    item.Spread = spread;
    item.CER = CER;
    item.Orderbook = data.result;
    item.TD = TD;
    if (askArray !== undefined) {
        if (askArray.length > 0) {
            item.asksArray = _.map(askArray, 'price');
            item.asksQuantity = _.map(askArray, 'quantity');
            item.asksCM = _.map(askArray, 'cm');
        } else {
            item.asksArray = [];
            item.asksQuantity = [];
            item.asksCM = [];
        }

    }

    if (bidsArray !== undefined) {
        if (bidsArray.length > 0) {
            item.bidsArray = _.map(bidsArray, 'price');
            item.bidsQuantity = _.map(bidsArray, 'quantity');
            item.bidsCM = _.map(bidsArray, 'cm');
        } else {
            item.bidsArray = [];
            item.bidsQuantity = [];
            item.bidsCM = [];
        }

    }

    item.boolSendTrade = false;
    item.SendTrade = [];

    //newTUCallsArray.push(value);
    return item;

} else {

    //delete this document as depth criteria is not met
    return null;
}

  }
  catch (e)
  {
        console.log('error in getting orderbook of  first call');
        await cancelOrderAll();
        resumeStartDetectingAfterError();
  }
}

async function processCallData(array){

  try {
    var collatedData = [];
    for (const item of array) {
        var data = await getOrdebookCallData(item);
        collatedData.push(data);
    }

    if (collatedData.length === array.length) {

       // console.log('collated data is ' + JSON.stringify(collatedData));
        collatedData = collatedData.filter(n => n);


        collatedData = _.sortBy(collatedData, 'Spread').reverse();
        collatedData.map((value, index) => {
            collatedData[index].IntSpreadRank = index;
        });

        collatedData = _.sortBy(collatedData, 'CER').reverse();
        collatedData.map((value, index) => {
            collatedData[index].IntCERRank = index;
        });

        collatedData = _.sortBy(collatedData, 'TD').reverse();
        collatedData.map((value, index) => {
            collatedData[index].IntThetaRank = index;
            collatedData[index].floatAttractiveness_Index = (value.LiquidityRank + value.IntSpreadRank + value.IntCERRank + index) / 4;

        });

        collatedData = _.sortBy(collatedData, 'rank').slice(0, NumberOfQuotes);
       // console.log('after collated data is ' + JSON.stringify(collatedData));


        return collatedData;
    }
    console.log('done');
} catch (e) {
    console.log('error in getting processed call data');
    await cancelOrderAll();
    resumeStartDetectingAfterError();
}
    
}




async function getCallAndPutDataSeparately(data){

try {
    console.log('call and put data is now processing');

    var TUCallsArray = [];
    var TUPutsArray = [];
    var newTUCallsArray = [];
    var newTUPutsArray = [];
    let callComplete = 0;
    let putComplete = 0;

    data.map((value, index) => {
        if (value.instrumentName.slice(-1) === "C") {
            TUCallsArray.push(value);
        } else if (value.instrumentName.slice(-1) === "P") {
            TUPutsArray.push(value);
        }
    });

    console.log('inside endinggg column 2');
    TUCallsArray = _.sortBy(TUCallsArray, 'volume').reverse();
    TUPutsArray = _.sortBy(TUPutsArray, 'volume').reverse();


    TUCallsArray.map((value, index) => {
        TUCallsArray[index].rank = index;
    });

    TUPutsArray.map((value, index) => {
        TUPutsArray[index].rank = index;
    });

    TUCallsArray = _.sortBy(TUCallsArray, 'quantity').reverse();
    TUPutsArray = _.sortBy(TUPutsArray, 'quantity').reverse();


    TUCallsArray.map((value, index) => {
        TUCallsArray[index].churnrank = index;
    });

    TUPutsArray.map((value, index) => {
        TUPutsArray[index].churnrank = index;
    });

    //LiquidityRank

    TUCallsArray.map((value, index) => {
        TUCallsArray[index].LiquidityRank = (value.churnrank + value.rank) / 2;;
    });

    TUPutsArray.map((value, index) => {
        TUPutsArray[index].LiquidityRank = (value.churnrank + value.rank) / 2;;
    });


    //keeping top 15 of calls and puts
    TUCallsArray = _.sortBy(TUCallsArray, 'LiquidityRank').slice(0, 15);
    TUPutsArray = _.sortBy(TUPutsArray, 'LiquidityRank').slice(0, 15);

    //console.log('TUCallsArray is ' + JSON.stringify(TUCallsArray));
    //console.log('TUPutsArray is ' + JSON.stringify(TUPutsArray));

    var finalCalldata = await processCallData(TUCallsArray);
    var finalPutdata = await processCallData(TUPutsArray);


    filteredInstruments = {
        'TUPuts': finalPutdata,
        'TUCalls': finalCalldata
    };


    //console.log(JSON.stringify(filteredInstruments));


    generateRepitiveOrders(filteredInstruments);
} catch (e) {
    console.log('error in getting filtered instrument list');
    await cancelOrderAll();
    resumeStartDetectingAfterError();
}
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
        //globalDeltaDiff = parseFloat((totalDeltaHedger-existDiff).toFixed(4));
        globalDeltaDiff = parseFloat(totalDeltaHedger.toFixed(4));
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
                    resumeStartDetectingAfterError();
        })


        }
      

};

