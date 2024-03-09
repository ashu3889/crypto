import React, {
    Component
} from 'react';
import {
    connect
} from "react-redux";
import {
    addTickDataYTC,
    pivotDataYTC,
    removePlotdatatestYTC,
    removeTickDataYTC,
    testEmail,
} from '../../action/action.js';
import {
    withRouter
} from "react-router-dom";
import KitePlot from '../plot.js';
import LineApp from '../lineplot.js';

// import {finalData} from '../stocks/allstocks';
// import {finalData} from '../tickerTape/tickerData.js';6
 
import _ from "lodash";
import axios from 'axios';

let ttfData = [];

let globalScripName = null;
let globalActualScripName = null;
let globalDailyDirection = null;

// var finalData = [
//     {"symbol":"KANE","full_name":"NSE:KANE","description":"Kansai Nerolac Paints Ltd","type":"Stock","ticker":"18253","exchange":"NSE"},
//     {"symbol":"WHIR","full_name":"NSE:WHIR","description":"Whirlpool of India Ltd","type":"Stock","ticker":"18466","exchange":"NSE"},
//     {"symbol":"HONE","full_name":"NSE:HONE","description":"Honeywell Automation India Ltd.","type":"Stock","ticker":"18189","exchange":"NSE"},
//     {"symbol":"GMDC","full_name":"NSE:GMDC","description":"Gujarat Mineral Development Corporation Ltd","type":"Stock","ticker":"18164","exchange":"NSE"},
//     {"symbol":"BLDT","full_name":"NSE:BLDT","description":"Blue Dart Express Ltd.","type":"Stock","ticker":"18048","exchange":"NSE"},
//     {"symbol":"AMAR","full_name":"NSE:AMAR","description":"Amara Raja Batteries Ltd","type":"Stock","ticker":"17997","exchange":"NSE"},
//     {"symbol":"AXBK","full_name":"NSE:AXBK","description":"AXIS Bank Ltd","type":"Stock","ticker":"18017","exchange":"NSE"},
//     {"symbol":"BION","full_name":"NSE:BION","description":"Biocon Ltd.","type":"Stock","ticker":"18045","exchange":"NSE"},
//     {"symbol":"RATB","full_name":"NSE:RATB","description":"RBL Bank Ltd","type":"Stock","ticker":"987147","exchange":"NSE"},
//     {"symbol":"GSFC","full_name":"NSE:GSFC","description":"Gujarat State Fertilizers and Chemicals Ltd","type":"Stock","ticker":"18168","exchange":"NSE"},
//     {"symbol":"GLAX","full_name":"NSE:GLAX","description":"GlaxoSmithkline Pharmaceuticals Ltd","type":"Stock","ticker":"18147","exchange":"NSE"},
//     {"symbol":"GLEN","full_name":"NSE:GLEN","description":"Glenmark Pharmaceuticals Ltd","type":"Stock","ticker":"18149","exchange":"NSE"},
//     {"symbol":"KTKM","full_name":"NSE:KTKM","description":"Kotak Mahindra Bank Ltd.","type":"Stock","ticker":"18260","exchange":"NSE"},
//     {"symbol":"GMMP","full_name":"NSE:GMMP","description":"GMM Pfaudler Ltd","type":"Stock","ticker":"1073767","exchange":"NSE"}
// ];



// var finalData = [
//     {"symbol":"TEML","full_name":"NSE:TEML","description":"Tech Mahindra Ltd","type":"Stock","ticker":"18429","exchange":"NSE"}
//     // {"symbol":"TVSM","full_name":"NSE:TVSM","description":"TVS Motor Company Ltd.","type":"Stock","ticker":"18442","exchange":"NSE"},
//     // {"symbol":"TACO","full_name":"NSE:TACO","description":"Tata Coffee Ltd","type":"Stock","ticker":"18418","exchange":"NSE"}
// ]



// var finalData = [{"symbol":"TARA","full_name":"NSE:TARA","description":"Tarapur Transformers Ltd","type":"Stock","ticker":"946910","exchange":"NSE"},{"symbol":"TARM","full_name":"NSE:TARM","description":"Tarmat Ltd","type":"Stock","ticker":"947432","exchange":"NSE"},{"symbol":"TTCH","full_name":"NSE:TTCH","description":"Tata Chemicals Ltd","type":"Stock","ticker":"18417","exchange":"NSE"},{"symbol":"TACO","full_name":"NSE:TACO","description":"Tata Coffee Ltd","type":"Stock","ticker":"18418","exchange":"NSE"},{"symbol":"TATA","full_name":"NSE:TATA","description":"Tata Communications Limited","type":"Stock","ticker":"18419","exchange":"NSE"},{"symbol":"TTEX","full_name":"NSE:TTEX","description":"Tata Elxsi Ltd","type":"Stock","ticker":"18421","exchange":"NSE"},{"symbol":"TINV","full_name":"NSE:TINV","description":"Tata Investment Corporation Ltd.","type":"Stock","ticker":"18423","exchange":"NSE"},{"symbol":"TMET","full_name":"NSE:TMET","description":"Tata Metaliks Ltd","type":"Stock","ticker":"18424","exchange":"NSE"}];

// var finalData = [{"symbol":"BHEL","full_name":"NSE:BHEL","description":"Bharat Heavy Electricals Ltd.","type":"Stock","ticker":"18042","exchange":"NSE"},
// {"symbol":"SALI","full_name":"NSE:SALI","description":"Salora International Ltd","type":"Stock","ticker":"946904","exchange":"NSE"},
// {"symbol":"TCIE","full_name":"NSE:TCIE","description":"TCI Express Ltd","type":"Stock","ticker":"994425","exchange":"NSE"},
// {"symbol":"JHSS","full_name":"NSE:JHSS","description":"JHS Svendgaard Laboratories Ltd","type":"Stock","ticker":"976204","exchange":"NSE"},
// {"symbol":"PICC","full_name":"BSE:PICC","description":"Piccadily Sugar and Allied Industries Ltd","type":"Stock","ticker":"988248","exchange":"BSE"},
// {"symbol":"BBJL","full_name":"NSE:BBJL","description":"Bharat Bijlee Ltd","type":"Stock","ticker":"947279","exchange":"NSE"},
// {"symbol":"TACO","full_name":"NSE:TACO","description":"Tata Coffee Ltd","type":"Stock","ticker":"18418","exchange":"NSE"},
// {"symbol":"INSI","full_name":"BSE:INSI","description":"Insilco Ltd","type":"Stock","ticker":"987825","exchange":"BSE"}
// ];

// var finalData = [
//     {"symbol":"AEGS","full_name":"NSE:AEGS","description":"Aegis Logistics Ltd","type":"Stock","ticker":"947157","exchange":"NSE"},
//     {"symbol":"RATB","full_name":"NSE:RATB","description":"RBL Bank Ltd","type":"Stock","ticker":"987147","exchange":"NSE"},
//     {"symbol":"HONE","full_name":"NSE:HONE","description":"Honeywell Automation India Ltd.","type":"Stock","ticker":"18189","exchange":"NSE"},
//     {"symbol":"KTKM","full_name":"NSE:KTKM","description":"Kotak Mahindra Bank Ltd.","type":"Stock","ticker":"18260","exchange":"NSE"},
//     {"symbol":"HROM","full_name":"NSE:HROM","description":"Hero MotoCorp Ltd","type":"Stock","ticker":"18179","exchange":"NSE"}
// ]

// Goodricke Group Ltd -> Test for good quality candle
// Virinchi Ltd -> good quality candle..

var finalData = [
    {"symbol":"TOPO","full_name":"NSE:TOPO","description":"Torrent Power Ltd","type":"Stock","ticker":"18436","exchange":"NSE"}
    // {"symbol":"JIND","full_name":"NSE:JIND","description":"Jindal Saw Ltd.","type":"Stock","ticker":"39874","exchange":"NSE"}
    // {"symbol":"HPCL","full_name":"NSE:HPCL","description":"Hindustan Petroleum Corporation Ltd","type":"Stock","ticker":"18184","exchange":"NSE"}
    // {"symbol":"RATB","full_name":"NSE:RATB","description":"RBL Bank Ltd","type":"Stock","ticker":"987147","exchange":"NSE"}
]



String.prototype.beginsWith = function (string) {
    return(this.indexOf(string) === 0);
};


var lifeDetectionStart = false;
var lifeCount = 0;
var lifeArray=[];
var lifeArrayTrend =[];
var lifeDetectionStopLoss = 0;
var lifeDetectionBPB= false;
var lifeSaved = false;
var lifeEnable = false;
var lifeStopLossArray =[];
var lifeTradeType =0;
var lifeBetterEntry = false;
var betterEntryPercentage = 7;
var permissibleBetterTradeLimit = 10;
var lifeBetterEntryCriticalLevel = 0;
var lifeSidewaysFormationDate = 0;
var maxLossPermitted =12;




var tradeStartDate ;
var tradeDateStartedDate = false;
var tradeStartedStopLoss ;
var tradeStopLoss = 0;
var tradeDiff = false;

var tradeStartDate ;
var tradeEndDate;
var entryPrice;
var exitPrice;
var profitType;

var mainArray = [];

var totalBuyCallArray = [];
var triggeredBuyCallArray = [];

var totalSellCallArray = [];
var triggeredSellCallArray = [];



 var myInterval;
 var getDataInterval;


var crudearr = [];
var nicklearr = [];

var kiteCrude = [];

var kiteNickle = [];

var kiteCrude11 =  [];


var traderJiCrude =  [];


var dataSet;
var val = 1;


//var factor = 0.90;

var factor = 0.10;



var currentScripName;
var detectCount = 0;

var detectStatus= undefined;


let count = 0;
let countnifty = 1;
let countnickle = 1;
let access_token_const = 0;
let startTime = 0;
let startingTime = 0;




//////////////////////////
var traderJiFinaldata;
var crudelongtrade = false;
var crudeshorttrade = false;
var crudeStop = 0;
var crudeTarget = 0;
var crudeTradeStatus = 'not started';
var crudeTradePrice = 0;
var crudeNetProfit = 0;
var crudeTrendLen = 0;
var crudePivot = 0;
var crudeBigTradePrice = 0;
var crudeBigTradeDirection = '';
//var crudeStopVal = 8 ;
//var crudeStopVal = 10 ;
var crudeStopVal = 15 ;
var crudeMinTarget = 22;
var crudeMaxEntryThreshold = 12;
var crudeBigDayTarget = 35;
var crudeBigDayStop = 22;
var crudeVigilValue = 13;
var crudeTradeManagement = false;
var trailingStatus = false;
var trailBigTarget = 90;
var trailTolerableDiff = 10;
var bigPermissiblePriceDiff = 10;
var sidewaysTop = 0;
var sidewaysBottom = 0;
var sidewaysBlackLine = 0;
var crudeTrailManagementValue = 30;
var crudeTrailStopPermitted= 17;
var trailMimimumTarget = 40;
var safeTrailMimimumTarget = 0;
//var minimumSwingLength = 40;
var minimumSwingLength = 70;
var crudeTradePriceLM =0;
var crudeStopLM =0;
var crudeTargetLM = 0;
var minimumStopLM = 10;
var crudeLMManagement = false;
var minTargetLM = 35;
var lmMinimumSidewaysHeight = 15;
var permissibleStopLM = 10;
var lmMaximumSwingLength = 60;
var minimumTragetLM = 30;
var trailPermissibleStopLM = 5;
var maxPermissibleTarget = 30;
var currentprevdata = 0;
var prevdata = 0;
var tailHeightVigilValue = 0.3;
// var minStopLoss = 5;
var minStopLoss = 10;
//var vigilStopLossVal = 7;
var vigilStopLossVal = 5;
var currentSwingHigh= 0;
var currentSwingTradeDirection = '';
var awesomeBuyTrade = false;
 var primaryid;

//////////////////////////


//////////////////////////
var nicklelongtrade = false;
var nickleshorttrade = false;
var nickleStop = 0;
var nickleTarget = 0;
var nickleTradeStatus = 'not started';
var nickleTradePrice = 0;
var nickleNetProfit = 0;
var nickleTrendLen = 0;
var nicklePivot = 0;
var nickleBigTradePrice = 0;
var nickleBigTradeDirection = '';
var nickleStopVal = 2 ;
var nickleMinTarget = 4;
var nickleMaxEntryThreshold = 1;
var nickleBigDayTarget = 35;
var nickleBigDayStop = 20;
var nickleVigilValue = 3;
//////////////////////////



//let webSocketClicked = false;

let webSocketClicked = true;



export class YearlyBPB extends Component {


    constructor(props) {
        super(props);
        this.state = {
            token: '',
            timecount: 0,
            tickdata: '',
            pivotpoint: 0,
            minPivot: 0,
            maxPivot: 0,
            sidewaysCount: 0,
            minblackpivot: 0,
            maxblackpivot: 0,
            tradeTime: 0,
            pivotpointNifty: 0,
            crudeshorttrade: false,
            crudelongtrade: false,
            niftylongtrade: false,
            niftyshorttrade: false,
            nicklelongtrade: false,
            nickleshorttrade: false,
            pivotpointnickle: 0,
            inputValue: '', 
            scripName : null,
            actualScripName: null,
            startDateTest: new Date(),
            finalData: finalData,
            lowBlackPoint : 0,
            lowBlackPointDate: null,
            allDownBuyStocks : [],
            capital :100000,
            maxRiskPercent: 1,
            check52WeekLow: false,
            watchModeON : false,
            watchModeLevel : null,
            UPblackpoint: 0,
            UPblackpointDate: null,

        }

        this.updateInputValue = this.updateInputValue.bind(this);
        // this.processData = this.processData.bind(this);

        this.getFinalDataAlphaVantage = this.getFinalDataAlphaVantage.bind(this);
        this.populatingCrudeTickdata = this.populatingCrudeTickdata.bind(this);


        // this.startAwesomeFunction = this.startAwesomeFunction.bind(this);



        
        
    }

     updateInputValue(evt) {
               this.setState({
                 inputValue: evt.target.value
                });


    }



    addMonths(input, months){
        const date = new Date(input)
        date.setDate(1)
        date.setMonth(date.getMonth() + months)
        //console.log('Holi 1233332...' + input);
        //console.log('Holi 12...' + input.getDate());
        date.setDate(Math.min(input.getDate(), this.getDaysInMonth(date.getFullYear(), date.getMonth()+1)))
        return date
    }

    convertData(a){
        var e = [];

        if(typeof a == "object"){
            if(Object.values(a).length > 0){

                if(typeof Object.values(a)[0]  == "object" ){
                    Object.values(a)[0].map(function(val, index){
                        var f = {};
                        f['Local time']  = new Date(Object.values(a)[0][index]*1000);
                        f["Open"] = Object.values(a)[2][index];
                        f["High"] = Object.values(a)[3][index];
                        f["Low"] = Object.values(a)[4][index];
                        f["Close"] = Object.values(a)[1][index];
                        e.push(f);
                    })
                    return e;
                }
                else if(typeof Object.values(a)[0]  == "string" ){
                    this.revertAllStateToNormal();
                    this.trashEveryThingAndStartFresh();
                    setTimeout(function(){
                        this.findAll();
                    }, 5000);
                }
            }
        }

        return e;

    }

    getDaysInMonth(year, month) {
        //console.log('Holi 16667777...' + new Date(year, month, 0));
        //console.log('Holi 16...' + new Date(year, month, 0).getDate());
        return new Date(year, month, 0).getDate()
    }

    processDukasCopyData(data){
        var accounting = [];

        // parseFloat(candleHigh.toFixed(4))
        var counter = Object.values(data).length-1;
            data.map(function(v ,i ){
                accounting.push({ 
                    "open" : parseFloat(v["Open"].toFixed(4)),
                    "high" : parseFloat(v["High"].toFixed(4)),
                    "low"  : parseFloat(v["Low"].toFixed(4)) ,
                    "close" : parseFloat(v["Close"].toFixed(4)),
                    "date" : v["Local time"],
                });
                counter = counter - 1;
             });
        return accounting;
    }

    getAlphaData(){
 
        // Real
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = startOfDay / 1000 + 2400*60;
        const startDay = this.state.startDateTest;

        // //// // // // // // // // // // // // // debugger;
        var startDay1 = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
        const ukStartTime = new Date(startDay1.getTime() + (1000*330*60));
        var ukStartTimeStamp = Math.floor(ukStartTime/1000);
        const dailyEvalStart = this.addMonths(new Date(ukStartTime), -48);
        const dailyEvalStartTimeStamp = Math.floor(dailyEvalStart/1000);
        let url = `https://tvc4.forexpros.com/83e0006e9a9f872777ed72ea3dca5c62/1584322573/56/56/23/history?symbol=${this.state.scripName}&resolution=D&from=${dailyEvalStartTimeStamp}&to=${timestamp}`;
 
       
        // babylon
         // Real
       axios({
               method: 'get',
               url: url,
               timeout: 1000 * 60, // Wait for 5 seconds
        })
        .then(response => {
            ttfData = this.convertData(response.data);
            ttfData = this.processDukasCopyData(ttfData);

            // ttfData.pop();
            // ttfData.pop();
            this.populatingCrudeTickdata(ttfData);
        })
        .catch((error) => {
           console.log('error. in fetching 5 min data...' + error);
            // MIN GONG
           setTimeout(function(){
                this.getAlphaData();
           }, 10000)
        });
    }

    getTickType(v){
        let crudetickType = null;

        if(v){
            if (v.open < v.close) {
                crudetickType = "green";
            } else if (v.open > v.close) {
                crudetickType = "red";
            } else if (v.open = v.close) {
                crudetickType = "doji";
            }
            return crudetickType;            
        }
        return null;

    }


    determineCandleQuality(candle){
        var {open,high,low,close} = candle;
        var tickType = this.getTickType(candle);
        var upperTail = null;
        var lowerTail = null;
        var candleBody = Math.abs(open-close);

        // console.log('hellooo... time is...' + candle.date + '....ts is...'+ +candle.date);


        // if( +candle.date == 1591174800000){
        //     // // // // // // // // // // // // // // // // // //debugger;;;;;;
        // }


        if(tickType == 'red'){
           upperTail = Math.abs(high-open);
           lowerTail =  Math.abs(low-close);
           
           // If candle is red, if lowerTail is greater than body and uppertail, means its quality is less
            if(lowerTail > candleBody && lowerTail > upperTail){
               return false;
            }
            else{
                return true;
            }

        }
        else if(tickType == 'green'){
            upperTail = Math.abs(high-close);
            lowerTail =  Math.abs(low-open);

            // If candle is green, if upperTail is greater than body and lowerTail, means its quality is less
            if(upperTail > candleBody && upperTail > lowerTail){
                return false;
            }
            else{
                return true;
            }

        }
        else if(tickType == 'doji'){
            return false;
        }

        return true;
    }




             

             

    // }

    getFinalDataAlphaVantage(data){


           

            var accounting = [];

           // 

            var mytraderJiFinaldata = Object.values(data).reverse().splice(parseInt(Object.values(data).length*factor), Object.values(data).length-1);
             
           // 
         
            var counter = Object.values(mytraderJiFinaldata).length-1;

            mytraderJiFinaldata.map((v ,i ) => {

                    accounting.push({ 
                         "open" : v["1. open"],
                         "high" : v["2. high"],
                         "low"  : v["3. low"] ,
                         "close" : v["4. close"],
                         "date" : Object.keys(data)[counter],
                    });

                    counter = counter - 1;


             });
            return accounting;
        }

        getBreakOutType(breachedCandles){
            var candleLen =  breachedCandles.length;
            if(candleLen >= 2){
                var firstLow = breachedCandles[candleLen-1].low;
                var secondClose =  breachedCandles[candleLen-2].close;
                // console.log('firstLow is...' + firstLow + '...second Close is..' + secondClose);
                if(firstLow == 708.3){
                    // // debugger;
                }
                
                if(firstLow > secondClose ){
                    return "BO accepted";
                }
                else{
                    return "Go ahead";
                }
            }
            return "No required candles";
        }

        getFinalBreakOutType(point,candles){
            var allCandles = candles.reverse();
            var breachedCandles = [];
            allCandles.every(function(element, index) {
                if (element.low  > point) {
                    return false;
                }
                else {
                breachedCandles.push(element);
                return true;
                }
            });

            let boType = this.getBreakOutType(breachedCandles);

            return boType;
        }

        getFinalBreakOutTypeUP(point,candles){
            var allCandles = candles.reverse();
            var breachedCandles = [];
            allCandles.every(function(element, index) {
                if (element.high  < point) {
                    return false;
                }
                else {
                breachedCandles.push(element);
                return true;
                }
            });

            let boType = this.getBreakOutTypeUP(breachedCandles);

            return boType;
        }

        getBreakOutTypeUP(breachedCandles){
            var candleLen =  breachedCandles.length;
            if(candleLen >= 2){
                var firstHigh = breachedCandles[candleLen-1].high;
                var secondClose =  breachedCandles[candleLen-2].close;
                // console.log('firstLow is...' + firstLow + '...second Close is..' + secondClose);               
                if(secondClose > firstHigh ){
                    return "BO accepted";
                }
                else{
                    return "Go ahead";
                }
            }
            return "No required candles";
        }

        getTrendDate(cordinate){
            var found = this.props.trendData.filter(a => a.y === cordinate);
            if(found && found.length > 0){
                return found[0].date;
            }
            return null;
        }

        getCurrentTrend(){
            var trendLength = this.props.trendData.length > 1 ? this.props.trendData.length-1 : this.props.trendData.length;
            var tickLength = this.props.tickCombo.length > 1 ? this.props.tickCombo.length-1 : this.props.tickCombo.length;
            var sidewaysHigh = this.props.trendData[trendLength].highest;
            var sidewaysLow = this.props.trendData[trendLength].lowest;
            var highDate = this.getTrendDate(sidewaysHigh);
            var lowDate = this.getTrendDate(sidewaysLow);

            // debugger;

            if(highDate && lowDate){
                if(+highDate > +lowDate){
                    return "uptrend"
                }
                else if(+highDate < +lowDate){
                    return "downtrend"
                }
                return null;
            }
            return null;

        }

        isOverlapping(current, previous){
            //
            if(parseFloat(previous.high)>= parseFloat(current.high)  &&  parseFloat(previous.low)<= parseFloat(current.low)){
             // console.log('DELL EMC OVERLAPPING AT....' + current.date);
             return true;
            }
            return false;
     
         }

        checkIfLowPointInStillValid(json){
            const {lowBlackPoint, lowBlackPointDate} = json;
            var data  = this.props.trendData;
            var lowPointSwing = this.props.trendData.filter(y => +y.pivotDate == +lowBlackPointDate);

            if(lowPointSwing && lowPointSwing.length > 0) {
                var lowPointSwingData = lowPointSwing[0];
                var index = lowPointSwingData.x;
                var sidewaysHigh = lowPointSwingData.highest;
                var sidewaysLow = lowPointSwingData.lowest;
                var lowSwing = lowPointSwing[0].y;
                var nextSwing = this.props.trendData[index+1];
                var highSwing = nextSwing.y;

                if (highSwing){
                    var middle = Math.floor((sidewaysHigh+sidewaysLow)/2);
                    if(highSwing > middle){
                        return false;
                    }
                    return true;
                }
            }
            return true;
        }

        populatingCrudeTickdata(response) {
             
             var d = this;
             var oldDate = 0;
             var newDateStart = 0;
             var startFresh = 0;
             

            response.map((v, i, response) => {
                var crudetickType;
                var startDetecting = false;
                var shift = 0;
                var stop = 0;
                var target = 0;

                var self = this;

                if (v.open < parseFloat(v.close)) {
                    crudetickType = "green";
                } else if (v.open > parseFloat(v.close)) {
                    crudetickType = "red";
                } else if (v.open = parseFloat(v.close)) {
                    crudetickType = "doji";
                }

                // console.log('Low black point...is...' + this.state.lowBlackPoint + '..on date...' + v.date + '..ts..' + +v.date);
                if(this.state.lowBlackPoint !== 0){
                    // var candleQuality = this.determineCandleQuality(v);
                    var candleQuality = true;

                    var diff = Math.abs(v.low - this.state.lowBlackPoint);
                    var diffPercent = (diff/v.low)*100;
                    var monthDiff = null;
                    if(this.state.lowBlackPointDate){
                        monthDiff = this.monthDiff(this.state.lowBlackPointDate, v.date);
                    }

                    var retestArray =  self.props.trendData.filter(e => e.pivotDate > self.state.lowBlackPointDate && e.y <= self.state.lowBlackPoint);
                    var retestCount  = 0;
                    if(retestArray.length > 0){
                        retestCount = retestArray.length;
                    }
                    // monthDiff <=4 && 
                    var lowValueData = this.getFiftyTwoWeekLow(v.date);
                    var fiftyTwoWeekLow = null;
                    var fiftyTwoWeekLowDate = null;
                    if(lowValueData){
                        fiftyTwoWeekLow = lowValueData.low;
                        fiftyTwoWeekLowDate = lowValueData.lowDate;
                    }

                    // if(+v.date === 1629763200000){
                    //     debugger;
                    // }
                    
                    if( this.state.watchModeON === false && retestCount <2 && monthDiff < 9 && crudetickType == "green" && (v.low <=  this.state.lowBlackPoint) && candleQuality){
                    // if(crudetickType == "green" && (v.low <  this.state.lowBlackPoint || diffPercent < 1) && candleQuality){
                        var currentTrend = this.getCurrentTrend();
                        var clonedTickCombo = [...self.props.tickCombo, v];
                        let breakoutType = this.getFinalBreakOutType(self.state.lowBlackPoint,clonedTickCombo);
                        // debugger;
                        const {diff : riskPerShare, diffPercent} = this.getRiskPerShare(v);
                        var quantity = this.getQuantity(riskPerShare);
                        var jsonData = {
                            stock: globalActualScripName,
                            date : v.date ,
                            breakoutType : breakoutType,
                            lowBlackPoint: self.state.lowBlackPoint,
                            lowBlackPointDate: self.state.lowBlackPointDate,
                            scripCount: self.state.scripName,
                            currentTrend : currentTrend,
                            riskPerShare: riskPerShare,
                            quantity: quantity,
                            monthDiff: monthDiff,
                            initialRiskPercent : diffPercent
                        };

                        var isOverLapping = this.isOverlapping(v, response[i-1]);
                        var checkIfLowPointInStillValid = this.checkIfLowPointInStillValid(jsonData)

                        // if risk percent > 5, then find that candle whose close is less than this and

                        if(diffPercent >  5){
                            this.setState({
                                watchModeON : true,
                                watchModeLevel : v.close,
                            });
                            console.log('Watch mode ON triggered at date...' + v.date + '..ts,,,' + +v.date);
                        }
                        else{
                            this.setState({
                                lowBlackPoint : null,
                                lowBlackPointDate: null,
                                check52WeekLow: false,
                                watchModeON : false,
                                watchModeLevel : null,
                            });
                            if(breakoutType !== "BO accepted" && checkIfLowPointInStillValid){
                                console.log('Hello...Time to fire buy signal at...' + v.date + '..currentTrend...' + currentTrend + '..retest count...' + retestCount +'...isOverLapping...' + isOverLapping);
                                console.log('riskPerShare ...' + riskPerShare + '..risk percent...' + diffPercent);
                                totalBuyCallArray.push(jsonData);
                                if(this.validateIfEmailToBeTriggered(v.date)){
                                    var emailData = `YTC..Daily trade generated..${this.state.actualScripName}.....${v.date}.... Direction of trade is.....UP....riskPerShare... ${riskPerShare}...quantity...${quantity}`;
                                    this.props.testEmail(emailData);
                                }
                            }
                        }
                    }
                    else if ( this.state.watchModeON === true && crudetickType == "green" && v.close < this.state.watchModeLevel) {
                        console.log('Watch mode ON completed at date...' + v.date + '..ts,,,' + +v.date);

                        console.log('Hello...Time to fire buy signal at...' + v.date + '...isOverLapping...' + isOverLapping);
                        
                        // console.log('riskPerShare ...' + riskPerShare + '..risk percent...' + diffPercent);

                        var jsonData = {
                            stock: globalActualScripName,
                            date : v.date ,
                            breakoutType : null,
                            lowBlackPoint: self.state.lowBlackPoint,
                            lowBlackPointDate: self.state.lowBlackPointDate,
                            scripCount: self.state.scripName,
                            currentTrend : null,
                            riskPerShare: null,
                            quantity: null,
                            monthDiff: null,
                            initialRiskPercent : null
                        };
                        totalBuyCallArray.push(jsonData);
                        if(this.validateIfEmailToBeTriggered(v.date)){ 

                            if (!isOverLapping && currentTrend === "downtrend") {
                                var emailData = `YTC..Daily trade generated..${this.state.actualScripName}.....${v.date}.... Direction of trade is.....UP`;
                                this.props.testEmail(emailData);
                            }
                            else if (currentTrend === "uptrend") {
                                var emailData = `YTC..Daily trade generated..${this.state.actualScripName}.....${v.date}.... Direction of trade is.....UP`;
                                this.props.testEmail(emailData);
                            }

                        }

                        this.setState({
                            lowBlackPoint : null,
                            lowBlackPointDate: null,
                            watchModeON: false,
                            watchModeLevel : null,
                        });
                    }

                }

                if(this.state.UPblackpoint !== 0 && this.state.UPblackpoint){
                    // var candleQuality = this.determineCandleQuality(v);
                    var candleQuality = true;
                    var clonedTickCombo = [...self.props.tickCombo, v];
                    let breakoutType = this.getFinalBreakOutTypeUP(self.state.UPblackpoint,clonedTickCombo);
                
                    var diff = Math.abs(v.high - this.state.UPblackpoint);
                    //var diffPercent = (diff/v.high)*100;

                    var monthDiff = null;
                    if(this.state.UPblackpoint){
                        monthDiff = this.monthDiff(this.state.UPblackpointDate, v.date);
                    }
                
                    
                    if( crudetickType == "red" && v.high >=  this.state.UPblackpoint && monthDiff < 6 ){
                        var jsonData = {
                            stock: globalActualScripName,
                            date : v.date ,
                            breakoutType : null,
                            UPblackpoint: self.state.UPblackpoint,
                            UPblackpointDate: self.state.UPblackpointDate,
                            scripCount: self.state.scripName,
                            currentTrend : null,
                            riskPerShare: null,
                            quantity: null,
                            monthDiff: null,
                            initialRiskPercent : null,
                        };
                
                        // if risk percent > 5, then find that candle whose close is less than this and
                
                
                        this.setState({
                            UPblackpoint : null,
                            UPblackpointDate: null,
                        });


                        if(breakoutType !== "BO accepted"){
                            console.log('Hello...Time to fire SELL signal at...' + v.date + '..currentTrend...' + currentTrend + '..retest count...' + retestCount +'...fiftyTwoWeekLow...' + fiftyTwoWeekLow + '...52 week low date..' + fiftyTwoWeekLowDate + '...check52WeekLow...' + this.state.check52WeekLow);
                            // debugger;
                            console.log('riskPerShare ...' + null + '..risk percent...' + null);
                            totalSellCallArray.push(jsonData);
                            if(this.validateIfEmailToBeTriggered(v.date)){
                                var emailData = `YTC....SELL.Daily trade generated..${this.state.actualScripName}.....${v.date}.... Direction of trade is.....UP....riskPerShare... ${null}...null...${null}`;
                                // this.props.testEmail(emailData);
                            }
                        }
                

                    }
                }




                var crudetickLength = Math.abs(parseFloat(v.high) - parseFloat(v.low));

                   


               
                if( tradeDateStartedDate.indexOf(v.date) !== -1 && (crudeTradeStatus !== "buy started") ){



                                var lovelyDiff  = Math.abs(parseFloat(v.open) - parseFloat(tradeStartedStopLoss));
                                var lovelyDiffRatio = (lovelyDiff/parseFloat(tradeStartedStopLoss))*100;

                                console.log('lovely diff ratio... ' +  lovelyDiffRatio);

                                if(lovelyDiffRatio <= 17){
                                    lifeDetectionStart= false;
                                    crudelongtrade = true;
                                    crudeLMManagement = "long";
                                    crudeTradeStatus = "buy started";
                                    crudeshorttrade = false;
                                    crudeTradePriceLM = parseFloat(v.open);
                                    crudeTargetLM = parseFloat(parseFloat(v.open*1.07).toFixed(2));
                                    crudeStopLM =  parseFloat(parseFloat(tradeStartedStopLoss*0.97).toFixed(2));
                                }
                                else{
                                        console.log('This buy trade is failed..  not taking long here....');
                                        tradeDiff = false;
                                        tradeDateStartedDate = [];
                                        tradeStartedStopLoss = 0;
                                        crudeLMManagement = false;
                                        crudeTradePriceLM = 0;
                                        crudeStopLM = 0;
                                        crudeTargetLM = 0;


                                            //99
                                        lifeDetectionStart=false;
                                        lifeBetterEntryCriticalLevel= 0;
                                        lifeArray=[];
                                        lifeBetterEntry=false;
                                        lifeTradeType=0;
                                        lifeCount=0;
                                        lifeArrayTrend=[];
                                        lifeDetectionStopLoss=0;
                                        lifeDetectionBPB=false;
                                        lifeSaved= false;
                                        lifeEnable= false;
                                        lifeCount = 0;
                            //99
                                }
                                    

                                
                                //
                }





                if(crudeStopLM > parseFloat(parseFloat(v.low)) && crudeStopLM < parseFloat(parseFloat(v.high)) && crudeLMManagement !== false){
                            
                            /* if(crudeLMManagement == "short"){
                                if(crudeStopLM >= crudeTradePriceLM){
                                    console.log('loss happened of point' + Math.abs(crudeStopLM-crudeTradePriceLM));
                                    crudeNetProfit = crudeNetProfit-Math.abs(crudeStopLM-crudeTradePriceLM);

                                }
                                else if(crudeStopLM < crudeTradePriceLM){
                                    console.log('profit happened of point' + Math.abs(crudeStopLM-crudeTradePriceLM));
                                    crudeNetProfit = crudeNetProfit+Math.abs(crudeStopLM-crudeTradePriceLM);
                                }

                            }
                            else*/
                            if(crudeLMManagement == "long"){
                                
                                if(crudeStopLM <= crudeTradePriceLM){

                                    // 
                                    /* tradeStartDate = tradeDateStartedDate;
                                    tradeEndDate = v.date;
                                    entryPrice = crudeTradePriceLM ;
                                    exitPrice = crudeTargetLM ;
                                    profitType = "loss";*/
                                    


                                    var priceDiff = Math.abs(crudeStopLM - crudeTradePriceLM);
                                    var priceDiffRatio = (priceDiff/crudeTradePriceLM)*100;

                                

                                    mainArray.push({
                                    stock: globalActualScripName,
                                    tradeType:lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeStopLM,
                                    profitType: 'loss',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    });

                                    crudeTradeStatus = "start again";

                                        tradeDiff = false;
                                        tradeDateStartedDate = [];
                                        tradeStartedStopLoss = 0;
                                        crudeLMManagement = false;
                                        crudeTradePriceLM = 0;
                                        crudeStopLM = 0;
                                        crudeTargetLM = 0;


                                        crudelongtrade = false;
                                        crudeshorttrade = false;
                                        crudeTarget = 0;
                                        crudeStop = 0;
                                        crudeTradePrice = 0;
                                        crudePivot = 0;
                                        crudeNetProfit = crudeNetProfit-losspoint;
                                        crudeTradeStatus = "start again";
                                        crudeTradePriceLM = 0;
                                        crudeStopLM = 0;
                                        crudeTargetLM = 0;
                                        crudeLMManagement = false;

                                        //99
                                        lifeDetectionStart=false;
                                    lifeBetterEntryCriticalLevel= 0;
                                        lifeArray=[];
                                    lifeBetterEntry=false;
                                        lifeTradeType=0;
                                        lifeCount=0;
                                        lifeArrayTrend=[];
                                        lifeDetectionStopLoss=0;
                                        lifeDetectionBPB=false;
                                        lifeSaved= false;
                                        lifeEnable= false;
                                        lifeCount = 0;
                                //99



                                    console.log('loss happened of point 1 ' + Math.abs(crudeStopLM-crudeTradePriceLM));
                                    crudeNetProfit = crudeNetProfit-Math.abs(crudeStopLM-crudeTradePriceLM);
                                }
                                else if(crudeStopLM > crudeTradePriceLM){

                                
                                    /*tradeStartDate = tradeDateStartedDate;
                                    tradeEndDate = v.date;
                                    entryPrice = crudeTradePriceLM ;
                                    exitPrice = crudeTargetLM ;
                                    profitType = "win";*/
                                    //

                                    var priceDiff = Math.abs(crudeTargetLM - crudeTradePriceLM);
                                    var priceDiffRatio = (priceDiff/crudeTradePriceLM)*100;

                                

                                    mainArray.push({
                                    stock: globalActualScripName,
                                    tradeType: lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeTargetLM,
                                    profitType: 'win',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    });


                                    crudeTradeStatus = "start again";


                                    
                                    console.log('profit happened of point 1 ' + Math.abs(crudeStopLM-crudeTradePriceLM));
                                    crudeNetProfit = crudeNetProfit+Math.abs(crudeStopLM-crudeTradePriceLM);



                                tradeDiff = false;
                                tradeDateStartedDate = [];
                                tradeStartedStopLoss = 0;
                                crudeLMManagement = false;
                                crudeTradePriceLM = 0;
                                crudeStopLM = 0;
                                crudeTargetLM = 0;

                                    //99
                                                            lifeDetectionStart=false;
                                lifeBetterEntryCriticalLevel= 0;
                                lifeArray=[];
                                lifeBetterEntry=false;
                                lifeTradeType=0;
                                lifeCount=0;
                                lifeArrayTrend=[];
                                lifeDetectionStopLoss=0;
                                lifeDetectionBPB=false;
                                lifeSaved= false;
                                lifeEnable= false;
                                lifeCount = 0;
                                //99

                                }

                            }

                            crudeLMManagement = false;
                            crudeTradePriceLM = 0;
                            crudeStopLM = 0;
                            crudeTargetLM = 0;
                    }

                    //crudeTargetLM

                if(parseFloat(crudeTargetLM)> parseFloat(parseFloat(v.low)) && parseFloat(crudeTargetLM) <= parseFloat(parseFloat(v.high)) && crudeLMManagement !== false){
                            
                            /*if(crudeLMManagement == "short"){
                                    
                                    console.log('profit happened of point 2' + Math.abs(crudeTradePriceLM-crudeTargetLM));
                                    crudeNetProfit = crudeNetProfit-Math.abs(crudeTargetLM-crudeTradePriceLM);
                            }
                            else */
                            if(crudeLMManagement == "long"){

                                    /*tradeStartDate = tradeDateStartedDate;
                                    tradeEndDate =   v.date;
                                    entryPrice =     crudeTradePriceLM ;
                                    exitPrice =      crudeTargetLM ;
                                    profitType =     "win";*/

                                    var priceDiff = Math.abs(crudeTargetLM - crudeTradePriceLM);
                                    var priceDiffRatio = (priceDiff/crudeTradePriceLM)*100;

                                

                                    mainArray.push({
                                    stock: globalActualScripName,
                                    tradeType: lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeTargetLM,
                                    profitType: 'win',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    });

                                    crudeTradeStatus = "start again";

                                    
                                
                                    console.log('profit happened of point 2 ' + Math.abs(crudeTargetLM-crudeTradePriceLM));
                                    crudeNetProfit = crudeNetProfit+Math.abs(crudeTargetLM-crudeTradePriceLM);



                                tradeDiff = false;
                                tradeDateStartedDate = [];
                                tradeStartedStopLoss = 0;
                                crudeLMManagement = false;
                                crudeTradePriceLM = 0;
                                crudeStopLM = 0;
                                crudeTargetLM = 0;


                                    //99
                                lifeDetectionStart=false;
                                lifeBetterEntryCriticalLevel= 0;
                                lifeArray=[];
                                lifeBetterEntry=false;
                                lifeTradeType=0;
                                lifeCount=0;
                                lifeArrayTrend=[];
                                lifeDetectionStopLoss=0;
                                lifeDetectionBPB=false;
                                lifeSaved= false;
                                lifeEnable= false;
                                lifeCount = 0;
                                //99


                            }

                            crudeLMManagement = false;
                            crudeTradePriceLM = 0;
                            crudeStopLM = 0;
                            crudeTargetLM = 0;
                }



                if (crudeLMManagement !== false) {

                    
                    if(parseFloat(parseFloat(v.low) )<= crudeTargetLM && crudeTargetLM < parseFloat(parseFloat(v.high))){
                            crudeTradeStatus = "profit";
                            var prof = Math.abs(crudeTradePriceLM - crudeTargetLM);

                                

                                    var priceDiff = Math.abs(crudeTargetLM - crudeTradePriceLM);
                                    var priceDiffRatio = (priceDiff/crudeTradePriceLM)*100;

                                

                                    mainArray.push({
                                    stock: globalActualScripName,
                                    tradeType: lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeTargetLM,
                                    profitType: 'win',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    })



                            console.log('loss managemnt  PROFIT :) happened of' + prof);
                            crudelongtrade = false;
                            crudeshorttrade = false;
                            crudeTarget = 0;
                            crudeStop = 0;
                            crudeTradePrice = 0;
                            crudePivot = 0;
                            crudeNetProfit = crudeNetProfit+60;
                            crudeTradeStatus = "start again";
                            crudeTradeManagement = false;
                            crudeTargetLM = 0;
                            crudeTradePriceLM = 0;
                            crudeStopLM = 0;
                            crudeLMManagement = false;



                                    //99
                                                            lifeDetectionStart=false;
                            lifeBetterEntryCriticalLevel= 0;
                                lifeArray=[];
                            lifeBetterEntry=false;
                                lifeTradeType=0;
                                lifeCount=0;
                                lifeArrayTrend=[];
                                lifeDetectionStopLoss=0;
                                lifeDetectionBPB=false;
                                lifeSaved= false;
                                lifeEnable= false;
                                lifeCount = 0;
                                //99
                        }
                        else if (parseFloat(parseFloat(v.low)) < crudeStopLM && crudeStopLM < parseFloat(parseFloat(v.high))){
                                
                                
                                    var priceDiff = Math.abs(crudeStopLM - crudeTradePriceLM);
                                    var priceDiffRatio = (priceDiff/crudeTradePriceLM)*100;

                                /*   this.props.saveMainArray({
                                    stock: globalActualScripName,
                                    tradeType: lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeStopLM,
                                    profitType: 'loss',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    });*/

                                    mainArray.push({
                                    stock: globalActualScripName,
                                    tradeType: lifeTradeType,
                                    tradeStartDate : null,
                                    tradeEndDate:  v.date,
                                    entryPrice:crudeTradePriceLM,
                                    exitPrice:crudeStopLM,
                                    profitType: 'loss',
                                    percentage : parseFloat(priceDiffRatio.toFixed(2)),
                                    })

                                crudeTradeStatus = "loss";
                                var losspoint = crudeTradePriceLM - crudeStopLM;
                                console.log('loss management LOSS :( hapeended' + i);
                                crudelongtrade = false;
                                crudeshorttrade = false;
                                crudeTarget = 0;
                                crudeStop = 0;
                                crudeTradePrice = 0;
                                crudePivot = 0;
                                crudeNetProfit = crudeNetProfit-losspoint;
                                crudeTradeStatus = "start again";
                                crudeTradePriceLM = 0;
                                crudeStopLM = 0;
                                crudeTargetLM = 0;
                                crudeLMManagement = false;


                                    //99
                                lifeDetectionStart=false;
lifeBetterEntryCriticalLevel= 0;
                                lifeArray=[];
                            lifeBetterEntry=false;
                                lifeTradeType=0;
                                lifeCount=0;
                                lifeArrayTrend=[];
                                lifeDetectionStopLoss=0;
                                lifeDetectionBPB=false;
                                lifeSaved= false;
                                lifeEnable= false;
                                lifeCount = 0;
                                //99

                    }
                    
                }



   

            if(v.open !== 0 && parseFloat(v.close) !== 0 && parseFloat(v.high) !== 0 && parseFloat(v.low) !== 0){
                 
                    var crudetickarray = {
                    "stop": stop,
                    "target": target,
                    "shift": shift,
                    "open": parseFloat(v.open),
                    "low": parseFloat(v.low),
                    "high": parseFloat(v.high),
                    "close": parseFloat(v.close),
                    "tickType": crudetickType,
                    'tickLength': crudetickLength,
                    'date': v.date,
                    "detecting": startDetecting,
                    "tradeStatus" : crudeTradeStatus,
                    'netProfit' : crudeNetProfit,
                    'name' : globalActualScripName,
                    'hasTradeStarted' : tradeDateStartedDate
                };


                //v.date.split(' ')[1];
                this.props.addTickDataYTC(crudetickarray);

            }
                

                

                if( i==0 ){
                       

                         var value = 0;
                         if(v.open < parseFloat(v.close)){
                             //up direction
                             value= parseFloat(v.low);
                              
                          }
                          else if(v.open > parseFloat(v.close)){
                               //down direction
                              value= parseFloat(v.high);
                          }
                          else{
                              value= parseFloat(v.high);
                          }

                        let datainput = {
                            x: 0,
                            y: value
                        };
                        this.props.pivotDataYTC(datainput);

                        
                }

                // new code to vanish the data after every load

                if(i == response.length-1){

                    console.log('evaluation eneded');
                    // debugger;
                    this.revertAllStateToNormal();
                    this.trashEveryThingAndStartFresh();
                    setTimeout(function(){
                        this.findAll();
                    }, 5000);
                }


            })

    }

    getFiftyTwoWeekLow(date){
        var dateIndex = ttfData.map(v => +v.date).indexOf(+date);
        var fiftyTwoWeekIndex = dateIndex ? dateIndex-260 : null;
        if(fiftyTwoWeekIndex && fiftyTwoWeekIndex > 0){
            var slicedData = ttfData.slice(fiftyTwoWeekIndex, dateIndex);
            var low = slicedData.map(v => v.low).sort((a,b) => a-b)[0];
            var lowDate = slicedData.filter(a => a.low === low)[0].date;
            if(low == 101.55){
                // debugger;
            }
            return {
                low : low,
                lowDate :  lowDate,
            };
        }
        return null;

    }

    getCandleWithinTimeframe(start, end){
        var arr = [];
        ttfData.map((val, index) => {
             if(val.date > start && val.date <= end){
                arr.push(val); 
             }
        });
        
        arr.map(elem => {
            elem.tickType = this.getTickType(elem)
        })
        return arr;
    }

    getRiskPerShare(candle){
        var requisiteCandle  = this.getCandleWithinTimeframe(this.props.trendData[this.props.trendData.length-1].pivotDate,candle.date);
        const low = requisiteCandle.map(e => e.low);
        const minimum = _.min(low);
        let diff = Math.abs(minimum - candle.close);
        diff = parseFloat(diff.toFixed(2));
        let diffPercent = (diff/candle.close)*100;
        return {diff, diffPercent};
    }

    getQuantity(riskPerShare){
        var capital = this.state.capital;
        var totalRisk = (this.state.maxRiskPercent/100)*capital;
        var quantity = totalRisk/riskPerShare;
        quantity = parseFloat(quantity.toFixed(0));
        return quantity;
    }


    startGeneratingServerSession() {

        //
        Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
            value: function() {
                function pad2(n) { // always returns a string
                    return (n < 10 ? '0' : '') + n;
                }

                return this.getFullYear() + '-' +
                    pad2(this.getMonth() + 1) + '-' +
                    pad2(this.getDate()) + ' ' +
                    pad2(this.getHours()) + ':' +
                    pad2(this.getMinutes()) + ':' +
                    pad2(this.getSeconds());
            }
        });


        startTime = new Date().YYYYMMDDHHMMSS();

        Object.defineProperty(Date.prototype, 'starting', {
            value: function() {
                function pad2(n) { // always returns a string
                    return (n < 10 ? '0' : '') + n;
                }

                return this.getFullYear() + '-' +
                    pad2(this.getMonth() + 1) + '-' +
                    pad2(this.getDate()) + ' ' +
                    '10' + ':' +
                    '30' + ':' +
                    '00';
            }
        });


        startingTime = new Date().starting();



        var ashutosh = this;
        var api_key = "3iciz5hhzaiitjkj",
            secret = "4c0wc0rqnze0hx2c3x9y72tg8wpqbgap",
            request_token = this.state.token;
        let access_token = '';

        var options = {
            "api_key": api_key,
            "debug": false
        };

        // let kc = new KiteConnect(options);
        let kc = null;

        if (!access_token) {
            kc.generateSession(request_token, secret)
                .then(function(response) {
                     access_token_const = response.access_token;
                     init(ashutosh);
                })
                .catch(function(err) {
                     //console.log('error here');
                     //console.log(err);
                     // new code just to check
                     init(ashutosh);
                })
        } else {
           // console.log('else');
            kc.setAccessToken(access_token);

        }

        function initDeribitLogic(access_token_const) {

            // 

            axios.get('http://localhost:4000/ashu', {
                params: {
                    foo: access_token_const
                }
            });

        }


//v.date.substring(11,13)

        
 function init(ref) {

    var a = ref;

    dataSet.map((v, i) => {
     



   // if(i>300){

           v.open = parseInt(v.open*val);
           v.low= parseInt(parseFloat(v.low)*val);
           v.close= parseInt(parseFloat(v.close)*val);
           v.high = parseInt(parseFloat(v.high)*val);
           v.tradedate = parseInt(v.Local);
           traderJiCrude.push(v);
  //  }

        })


    function checkArg(...arg){
           // console.log(arg.indexOf(2));

    };


checkArg(0);


            // var kitedate = '30.10.2018';
             //var kitedate = '2018-09-06';

           //  var kitedate= '20/09/2010';
             var kiteArray = [];

             var zerokiteArray = [];



           /* traderJiCrude.map((v, i) => {
                       if(v.Local.toString().beginsWith(kitedate)) {
                            kiteArray.push(v);
                        }
            });*/

            //
            // kiteArray.splice(781);

           // kiteArray.splice(0,120);

            

          /*  kiteCrude.map((v, i) => {
                        if(v.date.toString().beginsWith(kitedate)) {
                              v.date = v.date.replace('T', ' ').replace('Z','0');
                              zerokiteArray.push(v);
                       }
            });*/


//React.children.map(this.props.children , (child) => {
//.  return React.cloneElement(child, {'onClick' : () => console.log('click me')});
//})

           /*traderJiCrude.map((v, i) => {

                currentprevdata = v.Local.split(' ')[0];

                if(prevdata == 0){
                     prevdata = currentprevdata;
                }
                else if(prevdata !== currentprevdata ){
                    //fire closing if array event

                      
                     prevdata = currentprevdata;
                     ref.props.removePlotdatatestYTC();
                     kiteArray = [];
                }
                else if(prevdata == currentprevdata){
                     //do nothing here
                      kiteArray.push(v);
                }  

                if(kiteArray.length == 287){
                     populatingCrudeTickdata(kiteArray);
                }

            });*/



            
           

            //CODE FOR HANDLING NEW DATA
            var finalArr = [];
            var start = 0;
            var end = 0;
            var detectStart = 0;
            var temparr = [];
            var oldDate = 0;
            var newDate = 0;
            var newDateStart = 0;
 

            //kiteArray.splice(0, 150);
            var newarr = kiteArray;


           /* newarr.map((v, i) => {

                    if( i !== 0 && v.Local.split(' ')[0] !== oldDate ){
                          //start counting again
                    //if( i !== 0 && v.Local !== oldDate ){
                          //;
                          newDateStart = 1;

                    }
                  
                        if(i ==0 ){
                              start = 1;
                              temparr.push(v.Local);
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                             oldDate = v.Local.split(' ')[0];
                             // oldDate = v.Local;
                         }


                        if( i != 0 && (i%5) != 0 ){
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                        }

                        if( i != 0 && (i%5) == 0 && start == 1){
                              finalArr.push(temparr);
                              temparr = [];
                              start = 0;
                        }

                        if( (i != 0 && (i%5) == 0 && start == 0) || newDateStart == 1){
                              

                                                           temparr = []; 
                              temparr.push(v.Local);
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                              start = 1;
                              newDateStart = 0;
                              oldDate = v.Local.split(' ')[0];
                              //oldDate = v.Local;
                        }
            });*/

              


          /*  newarr.map((v, i) => {
                  
                        if(i ==0 ){
                              start = 1;
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                         }


                        if( i != 0 && (i%5) != 0 ){
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                        }

                        if( i != 0 && (i%5) == 0 && start == 1){
                              finalArr.push(temparr);
                              temparr = [];
                              start = 0;
                        }

                        if( i != 0 && (i%5) == 0 && start == 0){
                              temparr.push(v.open);
                              temparr.push(parseFloat(v.low));
                              temparr.push(parseFloat(v.high));
                              temparr.push(parseFloat(v.close));
                              start = 1;
                        }
            });*/


             
            // console.log('final array is' + finalArr);

             ;
           
             // traderJiFinaldat  

             traderJiFinaldata = getFinalDataAlphaVantage(traderJiCrude);
             

             traderJiFinaldata = traderJiCrude.reverse().splice(parseInt(traderJiCrude.length*factor), traderJiCrude.length-1);
            // ;
             
             //populatingCrudeTickdata(traderJiFinaldata);

             // var data = 




       
              //populatingCrudeTickdata(zerokiteArray);

             


             //uncomment it for testing older data
             //kiteArray =  kiteArray.slice(0,kiteArray.length-1);
              
             

            // populatingCrudeTickdata(kiteArray);
             

             //populatingNickleTickdata(kiteArray);
             

        }


        function getFinalDataAlphaVantage(data){

            var accounting = [];

         

            data.map((v ,i ) => {
                     
                    
                 
                   //var date = v.splice(0,1)[0];
                   //var date = v.splice(0,1)[0];

                  // ;
                   var goAhead = true;
                   var crudehigh = parseFloat(v.high);
                   var crudelow = parseFloat(v.low);
                   var crudeopen = v.open;
                   var crudeclose = parseFloat(v.close);
                   var date = v.time;
                   
                   if(crudehigh==crudelow && crudelow==crudeopen && crudehigh==crudeclose){
                        goAhead= false;
                   }

                   if(goAhead == true){
                         accounting.push({ 
                         "open" : crudeopen,
                         "high" : crudehigh,
                         "low"  : crudelow ,
                         "close" : crudeclose,
                         "date" : date,
                    });

                   }

                   


             });
            return accounting;
        }



        function getFinalData(data){

            var accounting = [];

            data.map((v ,i ) => {
                     
                    
                 
                   //var date = v.splice(0,1)[0];
                   var date = v.splice(0,1)[0];

                  // ;
                   var crudehigh = _.maxBy(v);
                   var crudelow = _.minBy(v);
                   var crudeopen = v[0];
                   var crudeclose = v[v.length-1];
                   

                    accounting.push({ 
                         "open" : crudeopen,
                         "high" : crudehigh,
                         "low"  : crudelow ,
                         "close" : crudeclose,
                         "date" : date,
                    });


             });
            return accounting;
        }

        function getHistoricalData(instrument_token, interval, from_date, to_date, continuous) {



            kc.getHistoricalData(instrument_token, interval, from_date, to_date, continuous)
                .then(function(response) {
                    //

                    if (instrument_token === 53835015) {

                      //  
                      //  populatingCrudeTickdata(response);
                    }

                    /* if(instrument_token === 53843463){
                     //coppper
                     //  populatingCrudeTickdata(response);
                     }*/

                     if(instrument_token === 53986823){
                       //nickle

                      // 
                     //  populatingNickleTickdata(response);
                     }


                    //justdial
                    //if(instrument_token === 356865){
                    //

                    //populatingJustDialTickdata(response);

                    //}

                    //console.log(response);
                }).catch(function(err) {
                    //console.log(err);
                });
        }

       


       




         


       

         var nickletickcount = 0,
            nickleticklow = 0,
            nickletickhigh = 0,
            nickletickopen = 0,
            nickletickarray = [],
            nickletickType = 0,
            nickletickLength = 0,
            nickletickclose = 0;

         }


    componentDidMount() {

        //console.log('11');
        let base_url = window.location.host;
        localStorage.setItem('token', this.getUrlParameter('request_token'));
        this.setState({
            token: this.getUrlParameter('request_token')
        });
    }

    validateIfEmailToBeTriggered(time){

        console.log('Check if email should be triggered for trade at time...' + time);

        var today = time;
        // Check If not last week of month
        var lastWeekDates = [25,26,27,28,29,30,31];
        var isTodayLiesInLastWeek = lastWeekDates.indexOf(today.getDate()) === -1 ? false: true;

        // Check if its not Thursday
        var isThursday = today.getDay() == 4 ? true : false;
        // Check if its not one day before a holiday



        // var FIVE_MIN=5*60*1000;
        // 6*24*60
        var FIVE_MIN=150*60*60*1000;
        // var FIVE_MIN=1000000*150*60*60*1000;
        var currentTime = new Date();
        var diff = new Date() - time;

        ////////// // // // // // // // // // // // // // // // // // debugger;;
        // !isTodayLiesInLastWeek && !isThursday && 
        if(diff< FIVE_MIN){
            console.log(`YTC....Email triggered for ${globalActualScripName} on date... ${time}`);
            return true;
        }
        else{
            console.log(`YTC...No Email triggered for ${globalActualScripName} on date... ${time}`);
        }
        return false;
    }

    onTick(ticks) {
      //  console.log("Ticks", ticks);
    }

    onConnect(d) {
        d.subscribe([53718791]);
        d.setMode(d.modeFull, [53718791]);
    }

    getUrlParameter(name){
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        let results = regex.exec(window.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };



    componentWillReceiveProps(nextProps) {
        let len = nextProps.tickCombo.length - 1;
        if ((this.props.tickCombo) != undefined) {


            if ((nextProps.tickCombo).length >= 1) {

                if(nextProps.trendData.length >= 1){//big trend data vaidation starts here


                         if(lifeDetectionStart == true && lifeSaved !== true){
           
                        //console.log('ashu basu' + JSON.stringify(nextProps.trendData));

                        if(this.props.trendData[this.props.trendData.length-1].sidewaysFormationDate !==  nextProps.trendData[nextProps.trendData.length-1].sidewaysFormationDate){
                            //time to stop looking for better entry

                            console.log('not looking for better entries now... buying condition nullified.........');
                               //99
                            lifeDetectionStart=false;
                            lifeBetterEntryCriticalLevel= 0;
                            lifeArray=[];
                            lifeBetterEntry=false;
                            lifeTradeType=0;
                            lifeCount=0;
                            lifeArrayTrend=[];
                            lifeDetectionStopLoss=0;
                            lifeDetectionBPB=false;
                            lifeSaved= false;
                            lifeEnable= false;
                            lifeCount = 0;

                            this.setState({
                                check52WeekLow : false,
                            })
                            return;
                             //99

                        }


                        ///// aaaaaa


                        crudeTradeStatus = "life saving started";
                        lifeCount = lifeCount+1;
                        lifeArray.push(nextProps.tickCombo[len].tickType);
                        lifeArrayTrend.push(nextProps.trendData[nextProps.trendData.length-1].y);


                        if(lifeArray[0] == "green"){
                                    lifeEnable = false;
                                    

                                    var absDiff = Math.abs(parseFloat(nextProps.tickCombo[len].open) - parseFloat(nextProps.trendData[nextProps.trendData.length-1].y));
                                    var absDiffRatio = (absDiff/parseFloat(nextProps.trendData[nextProps.trendData.length-1].y))*100;
                                    
                                   // 
                                    
                                    if( absDiffRatio > permissibleBetterTradeLimit ){
                                        //console.log('life array 1  is ' + JSON.stringify(lifeArray));
                                       // console.log('look for better enrty in these trades');
                                        lifeBetterEntry = true;
                                        tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                        tradeStartedStopLoss = parseFloat(parseFloat(tradeStartedStopLoss).toFixed(2));
                                       
                                    }
                                    else if(lifeBetterEntry != true) {

                                        var stopLossPivotDiff = Math.abs(parseFloat(nextProps.tickCombo[len].close) - nextProps.trendData[nextProps.trendData.length-1].y);
                                        var stopLossPivotDiffRatio = (stopLossPivotDiff/parseFloat(nextProps.trendData[nextProps.trendData.length-1].y))*100;

                                       // // debugger;
                                        console.log('down buy initiated at 1 ' + globalActualScripName + ' on day ' +  nextProps.tickCombo[len].date + 'difference ratio is. ' + stopLossPivotDiffRatio);
                                        

                                        // new condo

                                        if(stopLossPivotDiffRatio < 9){
                                             
                                              
                                               lifeTradeType=7;
                                               lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);

                                              triggeredBuyCallArray.push({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 7});

                                            // if(this.validateIfEmailToBeTriggered(nextProps.tickCombo[len].date)){
                                            //     var emailData = `${this.state.actualScripName}.....${nextProps.tickCombo[len].date}.... Direction of trade is.....`;  
                                            //     this.props.testEmail(emailData);
                                            // }

                                      //  this.props.saveTriggeredBuyArray({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 7});

                                               var someDate = new Date(nextProps.tickCombo[len].date);
                                               if(someDate.getDay() == 5){
                                                   var numberOfDaysToAdd = 3;
                                               }
                                               else if(someDate.getDay() == 6){
                                                   var numberOfDaysToAdd = 2;
                                               }
                                               else{
                                                   //var numberOfDaysToAdd = 1;
                                                   var numberOfDaysToAdd = 2;
                                               }
                                             
                                               for(var i=1 ;i< 7;i++){
                                                  var someDate = new Date(nextProps.tickCombo[len].date);
                                                  someDate.setDate(someDate.getDate() + i);
                                                  // tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                               }

                                               tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                               tradeDiff = true;
                                               lifeEnable= false;
                                               lifeSaved= true;

                                        }
                                        else{
                                            lifeBetterEntry = true;
                                            tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                            tradeStartedStopLoss = parseFloat(parseFloat(tradeStartedStopLoss).toFixed(2));
                                            lifeBetterEntryCriticalLevel = parseFloat(nextProps.tickCombo[len].open);
                                        }



                                    /*lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);
                                    lifeTradeType=1;
                                    lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);

                                    var someDate = new Date(nextProps.tickCombo[len].date);

                                       if(someDate.getDay() == 5){
                                           var numberOfDaysToAdd = 3;
                                       }
                                       else if(someDate.getDay() == 6){
                                           var numberOfDaysToAdd = 2;
                                       }
                                       else{
                                           //var numberOfDaysToAdd = 1;
                                           var numberOfDaysToAdd = 2;
                                       }
                                     
                                       for(var i=1 ;i< 7;i++){
                                          var someDate = new Date(nextProps.tickCombo[len].date);
                                          someDate.setDate(someDate.getDate() + i);
                                          tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                       }

                                       tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                       tradeDiff = true;
                                       lifeEnable= false;
                                       lifeSaved= true;*/

                                }
                        }
                        else{
                            lifeEnable = true;
                        }


                        if(lifeArray.length ==2){
                            if(lifeArray[0]=="red" && lifeArray[1] == "green"){
                                   lifeEnable = false;


                                 


                                    var absDiff = Math.abs(parseFloat(nextProps.tickCombo[len].open) - parseFloat(nextProps.trendData[nextProps.trendData.length-1].y));
                                    var absDiffRatio = (absDiff/parseFloat(nextProps.trendData[nextProps.trendData.length-1].y))*100;

                                    
                                    if( absDiffRatio > permissibleBetterTradeLimit ){
                                        //console.log('life array 2 is ' + JSON.stringify(lifeArray));
                                        //console.log('look for better enrty in these trades');
                                        lifeBetterEntry = true;
                                        tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                        tradeStartedStopLoss = parseFloat(parseFloat(tradeStartedStopLoss).toFixed(2));
                                        lifeBetterEntryCriticalLevel = parseFloat(nextProps.tickCombo[len].open);
                                       
                                    }
                                    else{

                                        //old ways here

                                      //  ;

                                      console.log('down buy initiated at 2 ' + globalActualScripName + ' on day ' +  nextProps.tickCombo[len].date);
                                   

                                       lifeTradeType=2;
                                       lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);
                                       var someDate = new Date(nextProps.tickCombo[len].date);

                                       triggeredBuyCallArray.push({stock: globalActualScripName,date : nextProps.tickCombo[len].date, type : 2});
                                    //    if(this.validateIfEmailToBeTriggered(nextProps.tickCombo[len].date)){
                                    //         var emailData = `${this.state.actualScripName}.....${nextProps.tickCombo[len].date}.... Direction of trade is.....`;  
                                    //         this.props.testEmail(emailData);
                                    //     }

                                    //this.props.saveTriggeredBuyArray({stock: globalActualScripName,date : nextProps.tickCombo[len].date, type : 2});

                                       if(someDate.getDay() == 5){
                                           var numberOfDaysToAdd = 3;
                                       }
                                       else if(someDate.getDay() == 6){
                                           var numberOfDaysToAdd = 2;
                                       }
                                       else{
                                           //var numberOfDaysToAdd = 1;
                                           var numberOfDaysToAdd = 2;
                                       }
                                     
                                       for(var i=1 ;i< 7;i++){
                                          var someDate = new Date(nextProps.tickCombo[len].date);
                                          someDate.setDate(someDate.getDate() + i);
                                          tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                       }

                                       tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                       tradeDiff = true;
                                       lifeEnable= false;
                                       lifeSaved= true;

                                 }

                                   

                         }
                         else{
                             lifeEnable = true;
                         }

                        }


                        if(lifeCount <5 && lifeEnable == true && lifeBetterEntry == false){

                            if(nextProps.trendData[nextProps.trendData.length-1].y !== lifeDetectionStopLoss){
                               // console.log('bpb fails happened on date ' + nextProps.tickCombo[len].date);
                                //console.log('now look for new opportunity');
                                lifeDetectionBPB= true;
                                lifeBetterEntryCriticalLevel = nextProps.trendData[nextProps.trendData.length-1].y;

                            }
                        }

                        if(lifeCount > 3 && lifeBetterEntry == true &&  nextProps.trendData.length > 4){
                           // console.log('searching for better entry .............');

                            var absDiff = Math.abs(parseFloat(nextProps.tickCombo[len].close) - parseFloat(nextProps.trendData[nextProps.trendData.length-1].y));
                            var absDiffRatio = (absDiff/parseFloat(nextProps.trendData[nextProps.trendData.length-1].y))*100;

                            var stopLossPivotDiff = Math.abs(parseFloat(nextProps.tickCombo[len].close) - tradeStartedStopLoss);
                            var stopLossPivotDiffRatio = (stopLossPivotDiff/parseFloat(tradeStartedStopLoss))*100;
                            
                            


                           // console.log('props sidewaysFormationDate' + this.props.trendData[this.props.trendData.length-1].sidewaysFormationDate);
                           // console.log('nextprops sidewaysFormationDate' + nextProps.trendData[nextProps.trendData.length-1].sidewaysFormationDate);
                            //console.log();
                            



                           
                           /* if(parseFloat(nextProps.trendData[nextProps.trendData.length-1].y) > lifeBetterEntryCriticalLevel){
                                 console.log('not looking for better entries now... buying condition nullified.........');
                                   //99
                                 lifeDetectionStart=false;
                                 lifeBetterEntryCriticalLevel= 0;
                                 lifeArray=[];
                                 lifeBetterEntry=false;
                                 lifeTradeType=0;
                                 lifeCount=0;
                                 lifeArrayTrend=[];
                                 lifeDetectionStopLoss=0;
                                 lifeDetectionBPB=false;
                                 lifeSaved= false;
                                 lifeEnable= false;
                                 lifeCount = 0;
                                 //99
                                 
                            }*/
                            

                            var lifeCriticalGoAhead = false;

                            if(lifeBetterEntryCriticalLevel > parseFloat(nextProps.trendData[nextProps.trendData.length-1].y)){
                                lifeCriticalGoAhead= true;
                            }

                            if(absDiffRatio < betterEntryPercentage && lifeCriticalGoAhead == true && stopLossPivotDiffRatio < maxLossPermitted){
                                   
                                  // console.log('better entry obtained yeah at  ' + nextProps.tickCombo[len].date);
                                  // console.log('down buy initiated at 5 ' + globalActualScripName + ' on day ' +  nextProps.tickCombo[len].date);
                                   
                                   lifeBetterEntry = false;

                                   lifeTradeType= 5;
                                   lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);

                                  triggeredBuyCallArray.push({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 5});
                                  //this.props.saveTriggeredBuyArray({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 5});
                                //   if(this.validateIfEmailToBeTriggered(nextProps.tickCombo[len].date)){
                                //     var emailData = `${this.state.actualScripName}.....${nextProps.tickCombo[len].date}.... Direction of trade is.....`;  
                                //     this.props.testEmail(emailData);
                                //    }

                                   var someDate = new Date(nextProps.tickCombo[len].date);
                                   if(someDate.getDay() == 5){
                                       var numberOfDaysToAdd = 3;
                                   }
                                   else if(someDate.getDay() == 6){
                                       var numberOfDaysToAdd = 2;
                                   }
                                   else{
                                       //var numberOfDaysToAdd = 1;
                                       var numberOfDaysToAdd = 2;
                                   }
                                 
                                   for(var i=1 ;i< 7;i++){
                                      var someDate = new Date(nextProps.tickCombo[len].date);
                                      someDate.setDate(someDate.getDate() + i);
                                      tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                   }

                                   tradeDiff = true;
                                   lifeEnable= false;
                                   lifeSaved= true;
                            }
                      

                        }


                        if(lifeCount > 5 && lifeEnable == true && lifeDetectionBPB == true && lifeBetterEntry == false){

                            var bpbfailCritical = true;

                            if(lifeBetterEntryCriticalLevel !== undefined){
                                var absDiff = Math.abs(parseFloat(nextProps.tickCombo[len].open) - parseFloat(lifeBetterEntryCriticalLevel));
                                var absDiffRatio = (absDiff/parseFloat(lifeBetterEntryCriticalLevel))*100;

                                if(lifeBetterEntryCriticalLevel <= parseFloat(nextProps.tickCombo[len].open)){
                                        bpbfailCritical = false;
                                } 
                                else{

                                    if(absDiffRatio <  5 ){
                                        bpbfailCritical = false;
                                    }
                                }

                            }


                            if(nextProps.trendData[nextProps.trendData.length-1].dir == "low"){

                                    if(nextProps.trendData[nextProps.trendData.length-1].y > lifeDetectionStopLoss && bpbfailCritical == true ){

                                            console.log('buying opportunity at ' + nextProps.tickCombo[len].date);
                                            lifeSaved = true;
                                            lifeDetectionBPB= false;
                                            lifeDetectionStart=false;
                                            lifeBetterEntryCriticalLevel= 0;
                                            lifeCount=0;

                                            console.log('down buy initiated at 3 ' + globalActualScripName + ' on day ' + nextProps.tickCombo[len].date);
                                   
                                            lifeTradeType=3;
                                            lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);

                                            triggeredBuyCallArray.push({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 3});
                                            if(this.validateIfEmailToBeTriggered(nextProps.tickCombo[len].date)){
                                                var emailData = `YTC..with some caution...${this.state.actualScripName}.....${nextProps.tickCombo[len].date}.... Direction of trade is.....UP`;  
                                                this.props.testEmail(emailData);
                                            }

                                           // this.props.saveTriggeredBuyArray({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 3});
                                            var someDate = new Date(nextProps.tickCombo[len].date);

                                           if(someDate.getDay() == 5){
                                               var numberOfDaysToAdd = 3;
                                           }
                                           else if(someDate.getDay() == 6){
                                               var numberOfDaysToAdd = 2;
                                           }
                                           else{
                                               //var numberOfDaysToAdd = 1;
                                               var numberOfDaysToAdd = 2;
                                           }
                                         
                                           for(var i=1 ;i< 7;i++){
                                              var someDate = new Date(nextProps.tickCombo[len].date);
                                              someDate.setDate(someDate.getDate() + i);
                                              tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                           }
                                           //tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                           tradeDiff = true;
                                           lifeEnable= false;
                                           lifeSaved= true;
                                     }
                                    else{

                                           // console.log('down buy is failed... look for new opportunity');
                                            var lovelyDiff  = Math.abs(parseFloat(nextProps.tickCombo[len].close) - parseFloat(nextProps.trendData[nextProps.trendData.length-1].y));
                                            var lovelyDiffRatio = (lovelyDiff/parseFloat(nextProps.trendData[nextProps.trendData.length-1].y))*100;
                                            
                                            

                                            if(lovelyDiffRatio < maxLossPermitted && bpbfailCritical == true ){
                                                        console.log('down buy initiated at 4 ' + globalActualScripName + ' on day ' + nextProps.tickCombo[len].date);
                                                 

                                                        lifeTradeType=6;
                                                        lifeStopLossArray.push(nextProps.trendData[nextProps.trendData.length-1].y);
                                                        var someDate = new Date(nextProps.tickCombo[len].date);
                                                         triggeredBuyCallArray.push({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 6});
                                                         if(this.validateIfEmailToBeTriggered(nextProps.tickCombo[len].date)){
                                                            var emailData = `YTC with extra caution....${this.state.actualScripName}.....${nextProps.tickCombo[len].date}.... Direction of trade is.....`;  
                                                            this.props.testEmail(emailData);
                                                        }
                                                        // this.props.saveTriggeredBuyArray({stock: globalActualScripName,date : nextProps.tickCombo[len].date , type : 6});



                                                        if(someDate.getDay() == 5){
                                                               var numberOfDaysToAdd = 3;
                                                        }
                                                        else if(someDate.getDay() == 6){
                                                           var numberOfDaysToAdd = 2;
                                                        }
                                                        else{
                                                           //var numberOfDaysToAdd = 1;
                                                           var numberOfDaysToAdd = 2;
                                                        }
                                                     
                                                        for(var i=1 ;i< 7;i++){
                                                          var someDate = new Date(nextProps.tickCombo[len].date);
                                                          someDate.setDate(someDate.getDate() + i);
                                                          tradeDateStartedDate.push(someDate.toISOString().split('T')[0]); 
                                                        }
                                                        tradeStartedStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;
                                                        tradeDiff = true;
                                                        lifeEnable= false;
                                                        lifeSaved= true;

                                            }

                                         
                                    }
                                }
                        }



                    }

                }//big trenddata validation ends here
                    
                   

                if(lifeCount ==5){
                    // console.log(JSON.stringify(lifeArray));
                    // console.log(JSON.stringify(lifeArrayTrend));
                }



                  
                //new if started
                if (nextProps.tickCombo[len].pivot != undefined) {

                    //crude oil
                    if (this.state.pivotpoint != nextProps.tickCombo[len].pivot) {

                        //
                        /// console.log('Pivot point is....' + nextProps.tickCombo[len].pivot);

                        if(nextProps.tickCombo[len].pivot == "175.5"){
                            // // debugger;
                        }

                        count = count + 1;

                        var d = crudeTradePrice;

                        this.setState({
                            pivotpoint: nextProps.tickCombo[len].pivot,
                            watchModeON : false,
                            watchModeLevel : null,
                        });

                        var trailDiff = Math.abs(nextProps.tickCombo[len].pivot- crudeTarget);
                        
                        var pivotValue = nextProps.tickCombo[len].pivot;

                        let datainput = {
                            x: count,
                            y: nextProps.tickCombo[len].pivot,
                            dir: nextProps.tickCombo[len].dir,
                            date: nextProps.tickCombo[len].date,
                            currentPrice: nextProps.tickCombo[len].currentPrice,
                            tradeStatus : nextProps.tickCombo[len].tradeStatus,
                            crudeTradePrice : crudeTradePrice,
                            crudeTradeManagement : crudeTradeManagement,
                            crudeLMManagement : crudeLMManagement,
                            netProfit : crudeNetProfit,
                            date:nextProps.tickCombo[len].date,
                            prevY:nextProps.tickCombo[len-3].y,
                            name : globalActualScripName,
                            pivotDate : nextProps.tickCombo[len].pivotDate,
                        };

                        this.props.pivotDataYTC(datainput);
                        
                    }
                }

                //
     



                //new if ended
            }
        }
        if ((this.props.trendData) != undefined && this.props.trendData.length > 1 && (nextProps.trendData) != undefined && nextProps.trendData.length >1) {

            


            var trenlen = this.props.trendData.length - 1;
            if (crudeTrendLen === trenlen) {
                var detect = false;
            } else {
                var detect = true;
                crudeTrendLen = trenlen;
            }


            // Lowblackpoint TradeStarted
            if( nextProps.trendData[nextProps.trendData.length-1].Lowblackpoint !== undefined){
                const {Lowblackpoint , date} = nextProps.trendData[nextProps.trendData.length-1];

                if(nextProps.trendData[nextProps.trendData.length-1].Lowblackpoint !== this.props.trendData[this.props.trendData.length-1].Lowblackpoint){
                    console.log('Low black pint is... ' +  Lowblackpoint +   '...date is...' + date) ;
                    // debugger;
                    this.setState({
                        lowBlackPoint : Lowblackpoint,
                        lowBlackPointDate :  nextProps.trendData[nextProps.trendData.length-1].pivotDate,
                    })
                }
            }

            // UPblackpoint: null,
            // UPblackpointDate: null,

            if( nextProps.trendData[nextProps.trendData.length-1].UPblackpoint !== undefined){
                const {UPblackpoint , date} = nextProps.trendData[nextProps.trendData.length-1];

                if(nextProps.trendData[nextProps.trendData.length-1].UPblackpoint !== this.props.trendData[this.props.trendData.length-1].UPblackpoint){
                    console.log('UP black pint is... ' +  UPblackpoint +   '...date is...' + date) ;
                    // debugger;
                    this.setState({
                        UPblackpoint : UPblackpoint,
                        UPblackpointDate :  nextProps.trendData[nextProps.trendData.length-1].pivotDate,
                    })
                }
            }



            if( nextProps.trendData[nextProps.trendData.length-1].TradeStarted !== undefined){

                        if( nextProps.trendData[nextProps.trendData.length-1].TradeStarted == "downbuy" && nextProps.trendData[nextProps.trendData.length-1].crudeLMManagement == false){
                          
                            if(lifeStopLossArray.indexOf(nextProps.trendData[nextProps.trendData.length-1].y) == -1){
                                // console.log('haguuuu. ' + nextProps.trendData[nextProps.trendData.length-1].date );

                                // this.props.saveTotalBuyArray({stock: globalActualScripName,date : nextProps.trendData[nextProps.trendData.length-1].date});

                                // totalBuyCallArray.push({stock: globalActualScripName,date : nextProps.trendData[nextProps.trendData.length-1].date});
                                lifeDetectionStart = true;
                                lifeDetectionStopLoss = nextProps.trendData[nextProps.trendData.length-1].y;

                                // // debugger;
                            
                                // if(this.validateIfEmailToBeTriggered(nextProps.trendData[nextProps.trendData.length-1].date)){
                                //     var emailData = `${this.state.actualScripName}.....${nextProps.trendData[nextProps.trendData.length-1].date}.... Direction of trade is.....`;
                                //     this.props.testEmail(emailData);
                                // }

                                var obj = {
                                    stock: this.state.actualScripName,
                                    date : nextProps.trendData[nextProps.trendData.length-1].date,
                                };

                                // allDownBuyStocks
                                // this.state.allDownBuyStocks.filter(a => a.stock == globalActualScripName).map(e => +e.date).indexOf(+nextProps.trendData[nextProps.trendData.length-1].date) === -1
                                const {allDownBuyStocks} = this.state;

                                if(allDownBuyStocks.filter(a => a.stock == this.state.actualScripName).map(e => +e.date).indexOf(+nextProps.trendData[nextProps.trendData.length-1].date) === -1){

                                    if(allDownBuyStocks.length === 0){
                                        this.setState({
                                            allDownBuyStocks : [obj]
                                        })
                                    }
                                    else{
                                        this.setState({
                                            allDownBuyStocks : [...allDownBuyStocks,obj]
                                        });
                                        // debugger;

                                        // if(this.validateIfEmailToBeTriggered(obj.date)){
                                        //     // var emailData = `YTC..Daily trade generated...with some risk consideration.....${this.state.actualScripName}.....${obj.date}.... Direction of trade is.....UP`;
                                        //     //this.props.testEmail(emailData);
                                        // }
                                    }
                                    // console.log('Object is....' + JSON.stringify(allDownBuyStocks));
                                }
                            
                            }

                          

                           
                         }

            }


            

                    /// trailing stop managemnet here
                    var tradeDirection = nextProps.trendData[trenlen].dir;
                    var pivotValue = nextProps.trendData[trenlen].y;
                    var swingLength = Math.abs(nextProps.trendData[trenlen].y-nextProps.trendData[trenlen-1].y);
                    //var lengthu = nextProps.tickCombo.length - 1;
                   // var yValue = nextProps.tickCombo[lengthu].pivot;

                    var nextPropslen =  nextProps.trendData.length - 1;
                    var nextPropsTradeDirection = nextProps.trendData[nextPropslen].dir;
                    var nextPropsPivotValue = nextProps.trendData[nextPropslen].y;
                    var nextPropSwingLength = Math.abs(nextProps.trendData[nextPropslen].y-nextProps.trendData[nextPropslen-1].y);
                    var nextPropsCurrentPrice = nextProps.trendData[nextPropslen].currentPrice;


                    currentSwingHigh = nextProps.trendData[nextPropslen].y;
                    currentSwingTradeDirection = nextProps.trendData[nextPropslen].dir;

                 
                   


/// trailing stop ends managemnet here

       
        }
    }

    monthDiff(d1, d2){
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();

        // console.log('months ... ' + months);
        // return months <= 0 ? 0 : months;
        return Math.abs(months);
    }

    startTrade(data, exchange, type, price, stop, target) {


        //  parseFloat(v.price.toFixed(4))

        var squareoff = Math.abs(price - target);
        var stoploss = Math.abs(stop - price);

        squareoff = parseFloat(squareoff.toFixed(2));
        stoploss = parseFloat(stoploss.toFixed(2));


       // 
        //code to set and get the data
        var api_key = "3iciz5hhzaiitjkj",
            secret = "4c0wc0rqnze0hx2c3x9y72tg8wpqbgap",
            request_token = this.state.token;
        let access_token = '';

        var options = {
            "api_key": api_key,
            "debug": false,
            "access_token": access_token_const,
        };

        // let kc = new KiteConnect(options);
        let kc = null;

        /*kc.placeOrder("regular", {
          "exchange": exchange,
          "tradingsymbol": data,
          "transaction_type": type,
          "quantity": 1000,
          "product": "MIS",
          "order_type": "MARKET"
        }).then(function(resp) { 
         console.log('success order placed');
           console.log(resp);
         }).catch(function(err) {
           console.log('error is palcing order');
           console.log(err);
        }); */


        kc.placeOrder(kc.VARIETY_BO, {
            "exchange": exchange,
            "tradingsymbol": data,
            "transaction_type": type,
            "order_type": "LIMIT",
            "quantity": 10000,
            "price": price,
            "squareoff": squareoff,
            "stoploss": stoploss,
            "validity": "DAY"
        }, ).then(function(resp) {
           // console.log('success order placed');
           // console.log(resp);
        }).catch(function(err) {
           // console.log('error in order placed');
           // console.log(JSON.stringify(err));
        });



    }

    stopTrade(data, exchange, type, price) {

        //code to set and get the data
        var api_key = "3iciz5hhzaiitjkj",
            secret = "4c0wc0rqnze0hx2c3x9y72tg8wpqbgap",
            request_token = this.state.token;
        let access_token = '';

        var options = {
            "api_key": api_key,
            "debug": false,
            "access_token": access_token_const,
        };

        // let kc = new KiteConnect(options);
        let kc = null;

        kc.placeOrder("regular", {
            "exchange": exchange,
            "tradingsymbol": data,
            "transaction_type": type,
            "quantity": 1000,
            "product": "MIS",
            "order_type": "LIMIT",
            "price": price
        }).then(function(resp) {
          //  console.log('success order placed');
            //console.log(resp);
        }).catch(function(err) {
          //  console.log('error is palcing order');
           // console.log(err);
        });
    }


    targetTrade(data, exchange, type, price) {

        //code to set and get the data
        var api_key = "3iciz5hhzaiitjkj",
            secret = "4c0wc0rqnze0hx2c3x9y72tg8wpqbgap",
            request_token = this.state.token;
        let access_token = '';

        var options = {
            "api_key": api_key,
            "debug": false,
            "access_token": access_token_const,
        };

        // let kc = new KiteConnect(options);
        let kc = null;

        kc.placeOrder("regular", {
            "exchange": exchange,
            "tradingsymbol": data,
            "transaction_type": type,
            "quantity": 1000,
            "product": "MIS",
            "order_type": "LIMIT",
            "price": price,
        }).then(function(resp) {
          //  console.log('success order placed');
          //  console.log(resp);
        }).catch(function(err) {
           // console.log('error is palcing order');
          //  console.log(err);
        });
    }


    newWebsocketMETHOD() {


        webSocketClicked = true;


        var self = this;
        //
        // console.log(this.state.tickdata);
        var root = "wss://ws.kite.trade/";
        //var self = this.state;
        var read_timeout = 5, // seconds
            reconnect_max_delay = 0,
            reconnect_max_tries = 0,

            // message flags (outgoing)
            mSubscribe = "subscribe",
            mUnSubscribe = "unsubscribe",
            mSetMode = "mode",

            // incoming
            mAlert = 10,
            mMessage = 11,
            mLogout = 12,
            mReload = 13,
            mClearCache = 14,

            // public constants
            modeFull = "full", // Full quote including market depth. 164 bytes.
            modeQuote = "quote", // Quote excluding market depth. 52 bytes.
            modeLTP = "ltp";

        // public constants
        /**
         * @memberOf KiteTicker
         * @desc Set mode full
         */
        this.modeFull = modeFull;

        /**
         * @memberOf KiteTicker
         * @desc Set mode quote
         */
        this.modeQuote = modeQuote;

        /**
         * @memberOf KiteTicker
         * @desc Set mode LTP
         */
        this.modeLTP = modeLTP;

        var ws = null,
            triggers = {
                "connect": [],
                "ticks": [],
                "disconnect": [],
                "error": [],
                "close": [],
                "reconnect": [],
                "noreconnect": [],
                "message": [],
                "order_update": []
            },
            read_timer = null,
            last_read = 0,
            reconnect_timer = null,
            auto_reconnect = false,
            current_reconnection_count = 0,
            last_reconnect_interval = 0;
        var current_ws_url = null,
            token_modes = {},
            defaultReconnectMaxDelay = 60,
            defaultReconnectMaxRetries = 50,
            maximumReconnectMaxRetries = 300,
            minimumReconnectMaxDelay = 5;

        // segment constants
        var NseCM = 1,
            NseFO = 2,
            NseCD = 3,
            BseCM = 4,
            BseFO = 5,
            BseCD = 6,
            McxFO = 7,
            McxSX = 8,
            Indices = 9;

        var tickcount = 0,
            ticklow = 0,
            tickhigh = 0,
            tickopen = 0,
            tickarray = [],
            tickType = 0,
            tickLength = 0,
            tickclose = 0;


        var niftytickcount = 0,
            niftyticklow = 0,
            niftytickhigh = 0,
            niftytickopen = 0,
            niftytickarray = [],
            niftytickType = 0,
            niftytickLength = 0,
            niftytickclose = 0;


        var crudetickcount = 0,
            crudeticklow = 0,
            crudetickhigh = 0,
            crudetickopen = 0,
            crudetickarray = [],
            crudetickType = 0,
            crudetickLength = 0,
            crudetickclose = 0;

        var coppertickcount = 0,
            copperticklow = 0,
            coppertickhigh = 0,
            coppertickopen = 0,
            coppertickarray = [],
            coppertickType = 0,
            coppertickLength = 0,
            coppertickclose = 0;

        var nickletickcount = 0,
            nickleticklow = 0,
            nickletickhigh = 0,
            nickletickopen = 0,
            nickletickarray = [],
            nickletickType = 0,
            nickletickLength = 0,
            nickletickclose = 0;


        var silvertickcount = 0,
            silverticklow = 0,
            silvertickhigh = 0,
            silvertickopen = 0,
            silvertickarray = [],
            silvertickType = 0,
            silvertickLength = 0,
            silvertickclose = 0;

        var first = 0;




        this.connect = function() {

           // console.log(access_token_const);


            // 

            var self = this;

            setInterval(function() {
                getCrudeOHLC(self);
                getNickleOHLC(self);
            }, 3000);



            //  
            let WSS_ROOT_URL = 'wss://ws.kite.trade?api_key=3iciz5hhzaiitjkj&access_token=';
            // let accessdata = this.props.access.access_token.access_token;
            var ws = new WebSocket(`${WSS_ROOT_URL}${access_token_const}`);
            //console.log(accessdata);

            ws.onclose = function() {

            }

            ws.onopen = function(event) {
                var message = {
                    "a": "subscribe",
                    "v": [53835015, 53986823]
                };
                ws.send(JSON.stringify(message));
            };

            ws.binaryType = "arraybuffer";

            ws.onmessage = function(e) {
                // Binary tick data.
                if (e.data instanceof ArrayBuffer) {
                    if (e.data.byteLength > 2) {

                        var d = parseBinary(e.data);
                        // 

                        for (var i = 0; i < d.length; i++) {

                            //
                            if (d[i].instrument_token == "53835015") {

                                get5minDataCrudeTimestamp(d[i].last_price, self);
                            }
                            if (d[i].instrument_token == "12111106") {
                                //nifty function
                                //get5minDataNifty(d[i].last_price, self);

                            }
                            if (d[i].instrument_token == "53986823") {
                                //nifty function
                                get5minDataNickleTimestamp(d[i].last_price, self);

                            }


                        }

                        // get5minData(d[0].last_price, self);
                        // if(d) trigger("ticks", [d]);
                    }
                } else {
                    parseTextMessage(e.data)
                }

                // Set last read time to check for connection timeout
                last_read = new Date();
            };


        }

        //
        this.connect();

        function get5minDataCrudeTimestamp(d, scope) {

            crudearr.push(d);

           // console.log('crudearr is' + crudearr);

        }

        function get5minDataNickleTimestamp(d, scope) {

            nicklearr.push(d);

         //   console.log('nicklearr is' + nicklearr);

        }

        function getNickleOHLC(d) {



            nickletickopen = nicklearr[0];
            nickletickhigh = _.maxBy(nicklearr);
            nickleticklow = _.minBy(nicklearr);
            nickletickclose = nicklearr[nicklearr.length - 1];

            if (nickletickopen < nickletickclose) {
                nickletickType = "green";
            } else if (nickletickopen > nickletickclose) {
                nickletickType = "red";
            } else if (nickletickopen = nickletickclose) {
                nickletickType = "doji";
            }

            nickletickLength = Math.abs(nickletickhigh - nickleticklow);

            nickletickarray = {
                "open": nickletickopen,
                "low": nickleticklow,
                "high": nickletickhigh,
                "close": nickletickclose,
                "tickType": nickletickType,
                'tickLength': nickletickLength
            };
            //
            d.props.addTickDataYTCNickle(nickletickarray);


            first = 0;
            nicklearr = [];


        };



        function getCrudeOHLC(d) {


            // d.startTrade('CRUDEOIL18SEPFUT', 'MCX','SELL' );

            crudetickopen = crudearr[0];
            crudetickhigh = _.maxBy(crudearr);
            crudeticklow = _.minBy(crudearr);
            crudetickclose = crudearr[crudearr.length - 1];

            if (crudetickopen < crudetickclose) {
                crudetickType = "green";
            } else if (crudetickopen > crudetickclose) {
                crudetickType = "red";
            } else if (crudetickopen = crudetickclose) {
                crudetickType = "doji";
            }

            crudetickLength = Math.abs(crudetickhigh - crudeticklow);

            crudetickarray = {
                "open": crudetickopen,
                "low": crudeticklow,
                "high": crudetickhigh,
                "close": crudetickclose,
                "tickType": crudetickType,
                'tickLength': crudetickLength
            };
            //
            d.props.addTickDataYTC(crudetickarray);


            first = 0;
            crudearr = [];


        };




        function get5minDataNickle(d, scope) {

           // console.log('data' + d);

            if (nickletickcount == 0) {
                nickletickopen = d;
                nickletickhigh = d;
                nickleticklow = d;
                nickletickcount = nickletickcount + 1;
                //console.log('next should be 1');
                //console.log(tickcount);   94
            } else if (nickletickcount == 94) {
                //console.log('called');
                nickletickclose = d;
                //console.log('ohlc formed');

                if (nickletickopen < nickletickclose) {
                    nickletickType = "green";
                } else if (nickletickopen > nickletickclose) {
                    nickletickType = "red";
                } else if (nickletickopen = nickletickclose) {
                    nickletickType = "doji";
                }

                nickletickLength = Math.abs(nickletickhigh - nickleticklow);

                nickletickarray = {
                    "open": nickletickopen,
                    "low": nickleticklow,
                    "high": nickletickhigh,
                    "close": nickletickclose,
                    "tickType": nickletickType,
                    'tickLength': nickletickLength
                };

                scope.props.addTickDataYTCNickle(nickletickarray);
                nickletickcount = 0;
            } else {
                if (nickletickhigh < d) {
                    nickletickhigh = d;
                }
                if (nickleticklow > d) {
                    nickleticklow = d;
                }

                nickletickcount = nickletickcount + 1;

            }


        }

        function get5minDataNifty(d, scope) {




            if (niftytickcount == 0) {
                niftytickopen = d;
                niftytickhigh = d;
                niftyticklow = d;
                niftytickcount = niftytickcount + 1;
                //console.log('next should be 1');
                //console.log(tickcount);
            } else if (niftytickcount == 2) {
                niftytickclose = d;
                //console.log('ohlc formed');

                if (niftytickopen < niftytickclose) {
                    niftytickType = "green";
                } else if (tickopen > tickclose) {
                    niftytickType = "red";
                } else if (tickopen = tickclose) {
                    niftytickType = "doji";
                }

                niftytickLength = Math.abs(niftytickhigh - niftyticklow);

                niftytickarray = {
                    "open": niftytickopen,
                    "low": niftyticklow,
                    "high": niftytickhigh,
                    "close": niftytickclose,
                    "tickType": niftytickType,
                    'tickLength': niftytickLength
                };

                scope.props.addTickDataYTCNifty(niftytickarray);
                niftytickcount = 0;
            } else {
                if (niftytickhigh < d) {
                    niftytickhigh = d;
                }
                if (niftyticklow > d) {
                    niftyticklow = d;
                }

                niftytickcount = niftytickcount + 1;

            }


        }




        function get5minData(d, scope) {

            if (tickcount == 0) {
                tickopen = d;
                tickhigh = d;
                ticklow = d;
                tickcount = tickcount + 1;
                //console.log('next should be 1');
                //console.log(tickcount);
            } else if (tickcount == 94) {
                tickclose = d;
                //console.log('ohlc formed');

                if (tickopen < tickclose) {
                    tickType = "green";
                } else if (tickopen > tickclose) {
                    tickType = "red";
                } else if (tickopen = tickclose) {
                    tickType = "doji";
                }

                tickLength = Math.abs(tickhigh - ticklow);

                tickarray = {
                    "open": tickopen,
                    "low": ticklow,
                    "high": tickhigh,
                    "close": tickclose,
                    "tickType": tickType,
                    'tickLength': tickLength
                };

                scope.props.addTickDataYTC(tickarray);
                tickcount = 0;
            } else {
                if (tickhigh < d) {
                    tickhigh = d;
                }
                if (ticklow > d) {
                    ticklow = d;
                }

                tickcount = tickcount + 1;

            }

        }


        // trigger event callbacks
        function trigger(e, args) {
            if (!triggers[e]) return
            for (var n = 0; n < triggers[e].length; n++) {
                triggers[e][n].apply(triggers[e][n], args ? args : []);
            }
        }

        function parseTextMessage(data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                return
            }

            if (data.type === "order") {
                trigger("order_update", [data.data]);
            }
        }

        // parse received binary message. each message is a combination of multiple tick packets
        // [2-bytes num packets][size1][tick1][size2][tick2] ...
        function parseBinary(binpacks) {

            var packets = splitPackets(binpacks),
                ticks = [];

            for (var n = 0; n < packets.length; n++) {
                var bin = packets[n],
                    instrument_token = buf2long(bin.slice(0, 4)),
                    segment = instrument_token & 0xff;

                var tradable = true;
                if (segment === Indices) tradable = false;

                var divisor = 100.0;
                if (segment === NseCD) divisor = 10000000.0;

                // Parse LTP
                if (bin.byteLength === 8) {
                    ticks.push({
                        tradable: tradable,
                        mode: modeLTP,
                        instrument_token: instrument_token,
                        last_price: buf2long(bin.slice(4, 8)) / divisor
                    });
                    // Parse indices quote and full mode
                } else if (bin.byteLength === 28 || bin.byteLength === 32) {
                    var mode = modeQuote;
                    if (bin.byteLength === 32) mode = modeFull;

                    var tick = {
                        tradable: tradable,
                        mode: mode,
                        instrument_token: instrument_token,
                        last_price: buf2long(bin.slice(4, 8)) / divisor,
                        ohlc: {
                            high: buf2long(bin.slice(8, 12)) / divisor,
                            low: buf2long(bin.slice(12, 16)) / divisor,
                            open: buf2long(bin.slice(16, 20)) / divisor,
                            close: buf2long(bin.slice(20, 24)) / divisor,
                        },
                        change: buf2long(bin.slice(24, 28))
                    };

                    // Compute the change price using close price and last price
                    if (tick.ohlc.close != 0) {
                        tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
                    }

                    // Full mode with timestamp in seconds
                    if (bin.byteLength === 32) {
                        tick.timestamp = null;
                        var timestamp = buf2long(bin.slice(28, 32));
                        if (timestamp) tick.timestamp = new Date(timestamp);
                    }

                    ticks.push(tick);
                } else if (bin.byteLength === 44 || bin.byteLength === 184) {
                    var mode = modeQuote;
                    if (bin.byteLength === 184) mode = modeFull;

                    var ticktype = '';

                    if ((buf2long(bin.slice(28, 32)) / divisor) > (buf2long(bin.slice(40, 44)) / divisor)) {
                        ticktype = "green";
                    } else if ((buf2long(bin.slice(40, 44)) / divisor) > (buf2long(bin.slice(28, 32)) / divisor)) {
                        ticktype = "red";
                    } else if ((buf2long(bin.slice(28, 32)) / divisor) == (buf2long(bin.slice(40, 44)) / divisor)) {
                        ticktype = "doji";
                    }


                    // console.log(ticktype);


                    var tick = {
                        tradable: tradable,
                        mode: mode,
                        instrument_token: instrument_token,
                        last_price: buf2long(bin.slice(4, 8)) / divisor,
                        last_quantity: buf2long(bin.slice(8, 12)),
                        average_price: buf2long(bin.slice(12, 16)) / divisor,
                        volume: buf2long(bin.slice(16, 20)),
                        buy_quantity: buf2long(bin.slice(20, 24)),
                        sell_quantity: buf2long(bin.slice(24, 28)),
                        ohlc: {
                            open: buf2long(bin.slice(28, 32)) / divisor,
                            high: buf2long(bin.slice(32, 36)) / divisor,
                            low: buf2long(bin.slice(36, 40)) / divisor,
                            close: buf2long(bin.slice(40, 44)) / divisor,
                            ticktype: ticktype,
                        }
                    };

                    // Compute the change price using close price and last price
                    if (tick.ohlc.close != 0) {
                        tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
                    }

                    // Parse full mode
                    if (bin.byteLength === 184) {
                        // Parse last trade time
                        tick.last_trade_time = null;
                        var last_trade_time = buf2long(bin.slice(44, 48));
                        if (last_trade_time) tick.last_trade_time = new Date(last_trade_time * 1000);

                        // Parse timestamp
                        tick.timestamp = null;
                        var timestamp = buf2long(bin.slice(60, 64));
                        if (timestamp) tick.timestamp = new Date(timestamp * 1000);

                        // Parse OI
                        tick.oi = buf2long(bin.slice(48, 52));
                        tick.oi_day_high = buf2long(bin.slice(52, 56));
                        tick.oi_day_low = buf2long(bin.slice(56, 60));
                        tick.depth = {
                            buy: [],
                            sell: []
                        };

                        var s = 0,
                            depth = bin.slice(64, 184);
                        for (var i = 0; i < 10; i++) {
                            s = i * 12;
                            tick.depth[i < 5 ? "buy" : "sell"].push({
                                quantity: buf2long(depth.slice(s, s + 4)),
                                price: buf2long(depth.slice(s + 4, s + 8)) / divisor,
                                orders: buf2long(depth.slice(s + 8, s + 10))
                            });
                        }
                    }

                    ticks.push(tick);
                }
            }

            return ticks;
        }

        // split one long binary message into individual tick packets
        function splitPackets(bin) {
            // number of packets
            var num = buf2long(bin.slice(0, 2)),
                j = 2,
                packets = [];

            for (var i = 0; i < num; i++) {
                // first two bytes is the packet length
                var size = buf2long(bin.slice(j, j + 2)),
                    packet = bin.slice(j + 2, j + 2 + size);

                packets.push(packet);

                j += 2 + size;
            }

            return packets;
        }


        // Big endian byte array to long.
        function buf2long(buf) {
            var b = new Uint8Array(buf),
                val = 0,
                len = b.length;

            for (var i = 0, j = len - 1; i < len; i++, j--) {
                val += b[j] << (i * 8);
            }

            return val;
        }




    }




    startCountingTick() {
      //  console.log('called');
    }

    startWebsocketClient() {

        //  console.log('called');
        //console.log(this.props.access);KiteTicker("your_api_key", "your_access_token")
        let SIGNIN_ROOT_URL = 'token ypmxayteat7agml9:';
        let accessdata = this.props.access;

        var headers = {
            'X-Kite-Version': '3',
            'Authorization': `${SIGNIN_ROOT_URL}${accessdata}`,
        };



        var data = {
            'api_key': '3iciz5hhzaiitjkj',
            'access_token': this.props.access,
        };



        // var ticker = new KiteTicker(data, headers);
        var ticker = null;

        ticker.connect();
        ticker.on("tick", this.onTick(ticker));
        ticker.on("connect", this.onConnect(ticker));
    }

    startfetchingYearlydata(){
       //  this.processData();
        this.beforeFindAll();
    }


    beforeFindAll(){
        var {startIndex,endIndex, finalData } = this.state;

        // Comment it
        var newData = finalData.slice(startIndex,endIndex);
        // var newData = finalData;
        // newData = _.shuffle(newData);


        this.setState({
            finalData : newData
        }, function(){
            this.findAll();
        });
        
    }

    findAll(){


        // first fetch the current from state.
        var current = this.state.finalData[0];

        if(this.state.finalData.length == 0){
            this.revertAllStateToNormal();
            this.trashEveryThingAndStartFresh();
            // this.startFun();
        }

        if(current){
            this.initiateAll(current);
        }
       

        // Remove the current one from state.
        var newArr = [...this.state.finalData];
        newArr.shift();
        this.setState({
            finalData : newArr,
        })

    }

    revertAllStateToNormal(){
        this.setState({
            token: '',
            timecount: 0,
            tickdata: '',
            pivotpoint: 0,
            minPivot: 0,
            maxPivot: 0,
            sidewaysCount: 0,
            minblackpivot: 0,
            maxblackpivot: 0,
            tradeTime: 0,
            pivotpointNifty: 0,
            crudeshorttrade: false,
            crudelongtrade: false,
            niftylongtrade: false,
            niftyshorttrade: false,
            nicklelongtrade: false,
            nickleshorttrade: false,
            pivotpointnickle: 0,
            inputValue: '', 
            scripName : null,
            actualScripName: null,
            startDateTest: new Date(),
            allDownBuyStocks : [],
            actualScripName: undefined,
            lowBlackPoint: null,
            lowBlackPointDate: null,
            check52WeekLow: false,
            watchModeON : false,
            watchModeLevel : null,
            UPblackpoint: null,
            UPblackpointDate: null,
        });
    }

    trashEveryThingAndStartFresh(){
        //this.props.removeAlphadata();
        this.props.removeTickDataYTC();
        this.props.removePlotdatatestYTC();
                
        //changes
        crudelongtrade = false;
        crudeshorttrade = false;
        crudeTarget = 0;
        crudeStop = 0;
        crudeTradePrice = 0;
        crudePivot = 0;
        // crudeTradeStatus = "start again";
        crudeTradeStatus = 'not started';
        crudeTradePriceLM = 0;
        crudeStopLM = 0;
        crudeTargetLM = 0;
        crudeLMManagement = false;

        lifeDetectionStart=false;
        lifeBetterEntryCriticalLevel= 0;
        lifeArray=[];
        lifeBetterEntry=false;
        lifeTradeType=0;
        lifeCount=0;
        lifeArrayTrend=[];
        lifeDetectionStopLoss=0;
        lifeDetectionBPB=false;
        lifeSaved= false;
        lifeEnable= false;
        lifeCount = 0;
        lifeStopLossArray =[];
        //changes
        count = 0;

        // detectStatus = false;
    }

    handleStartChange(event){
        this.setState({startIndex: parseInt(event.target.value)});
    };
    
    handleEndChange(event){
        this.setState({endIndex: parseInt(event.target.value)});
    };

    initiateAll(stock){
        
        let {description ,ticker , symbol} = stock;

        var stockName = parseInt(ticker);

        globalScripName = stockName;
        globalActualScripName = description;

        let scripSymbol = symbol;

        // // debugger;

       //  this.trashEveryThingAndStartFresh();
        // globalDailyDirection = direction;

        this.setState({
            scripName: stockName,
            actualScripName : description,
        } , function(){

            console.log('New stocks analysis started for.....' + description);
            tradeDiff = false;
            tradeDateStartedDate = [];
            tradeStartedStopLoss = 0;
            crudeLMManagement = false;
            crudeTradePriceLM = 0;
            crudeStopLM = 0;
            crudeTargetLM = 0;

            //99
            lifeDetectionStart=false;
            lifeBetterEntryCriticalLevel= 0;
            lifeArray=[];
            lifeBetterEntry=false;
            lifeTradeType=0;
            lifeCount=0;
            lifeArrayTrend=[];
            lifeDetectionStopLoss=0;
            lifeDetectionBPB=false;
            lifeSaved= false;
            lifeEnable= false;
            lifeCount = 0;
            lifeStopLossArray =[];

            this.redFlagChecker(scripSymbol);
             // this.getAlphaData(currentScripName,primaryid );
            // console.log('main array is' + JSON.stringify(mainArray));
            console.log('buy call cumulative is ' + JSON.stringify(totalBuyCallArray));

            console.log('-------------------------------');

            console.log('sell call cumulative is ' + JSON.stringify(totalSellCallArray));

            console.log('-------------------------------');

            console.log('triggered call  array is' + JSON.stringify(triggeredBuyCallArray));
        });
    }


    redFlagChecker(symbol){
        // var index = this.allStocksData1.map(e => e.description).indexOf(globalActualScripName);
        // var symbol = this.allStocksData1[index].symbol;
        // Now Most Important fix here.. fetch data for 1 month now
        let url = `https://api.tickertape.in/stocks/investmentChecklists/${symbol}?type=basic`;
        
         axios({
                 method: 'get',
                 url: url,
                 timeout: 1000 * 60 *4, // Wait for 5 seconds
          })
          .then(response => {
              if(response.data.data.length > 0){
                 if(response.data.data[4].title === "No Red Flags"){
                     console.log('Stock is green in tickertape.......');
                     // this.getAlphaData();
                     this.tickerVolumeCalculator(symbol);
                 }
                 else{
                     console.log('Stock in ASM/Red flag list.....');
                     this.revertAllStateToNormal();
                     this.trashEveryThingAndStartFresh();
                     setTimeout(function(){
                        this.findAll();
                    }, 5000);
                 }
              }
              else{
                  console.log('No tickertape data received.......');
                  this.revertAllStateToNormal();
                  this.trashEveryThingAndStartFresh();
                  setTimeout(function(){
                    this.findAll();
                }, 5000);
              }
  
          })
          .catch((error) => {
             console.log('Error. in fetching tickertape data..' + error);
             this.revertAllStateToNormal();
             this.trashEveryThingAndStartFresh();
             setTimeout(function(){
                this.findAll();
            }, 5000);
          });
    }

    tickerVolumeCalculator(symbol){
        // var index = this.allStocksData1.map(e => e.description).indexOf(globalActualScripName);
        // var symbol = this.allStocksData1[index].symbol;
      

        // Now Most Important fix here.. fetch data for 1 month now
        // let url = `https://api.tickertape.in/stocks/investmentChecklists/${globalActualScripName}?type=basic`;
        let url  =  `https://api.tickertape.in/stocks/info/${symbol}`;
        
         axios({
                 method: 'get',
                 url: url,
                 timeout: 1000 * 60 *4, // Wait for 5 seconds
          })
          .then(response => {
              if(Object.keys(response.data.data).length > 0){
                var mrktRank = response.data.data.ratios.mrktCapRank;
                var volume = response.data.data.ratios['3mAvgVol'];
                

                if(mrktRank > 1600){
                    console.log('No volume as per tickertape.. avoid it...marketcap/volume is...' + mrktRank + '/');
                    this.revertAllStateToNormal();
                    this.trashEveryThingAndStartFresh();
                    setTimeout(function(){
                       this.findAll();
                   }, 5000);
                }
                else{
                    console.log('Green signal..marketcap/volume is...' + mrktRank + '/' );
                    // this.fetch15MinFiltering();
                    // this.fetchHourlyFiltering();
                    this.getAlphaData();
                }
         
              }
              else{
                  console.log('No tickertape data received for market cap and volume......');
                  this.revertAllStateToNormal();
                  this.trashEveryThingAndStartFresh();
                  setTimeout(function(){
                     this.findAll();
                 }, 5000);
              }
  
          })
          .catch((error) => {
             console.log('Error. in fetching tickertape data..' + error);
             this.revertAllStateToNormal();
             this.trashEveryThingAndStartFresh();
                setTimeout(function(){
                    this.findAll();
                }, 5000);
          });
    }

    handleCapitalChange(event){
        var value = event.target.value;
        if(event.target.value === ""){
            value = 0;
        }
        this.setState({
            capital: parseInt(value)
        });
    };

    handleRiskPercentChange(event){
        var value = event.target.value;
        if(event.target.value === ""){
            value = '';
        }
        this.setState({
            maxRiskPercent: value
        });
    };


    startfetchingdata(){

              //console.log('ranuuuuuuu');
             
              var self = this;
             let  WSS_ROOT_URL = 'ws://localhost:4000/echo';
             // let accessdata = this.props.access.access_token.access_token;
              var ws = new WebSocket(`${WSS_ROOT_URL}`);
              //console.log(accessdata);

                ws.onclose = function(){

                }

               ws.onopen = function (event) {
               // console.log('on open');

                  // self.startfetchingdata();
                   var message = {"a": "subscribe", "v": [779521]};

                   ws.send(JSON.stringify(message));
              };

              ws.onmessage = function(e) {

                  //console.log('message received');
                  
                  //console.log(JSON.parse(e.data));
                  dataSet = JSON.parse(e.data);

                 
              }

            
            }


    render() {
        return  null;
        }
    }


    function mapStateToProps(state) {
        return {
            access: state.access,
            tickCombo: state.tickDataYTC,
            trendData: state.plDataYTC,
            // tickComboNifty: state.tickDataNifty,
            // trendDataNifty: state.plDataNifty,
            // trendDataNickle: state.plDataNickle,
            // tickCombonickle: state.tickDataNickle,
            // tickDataJD: state.tickDataJD,
            // alphaData: state.alphaData,
        }
    };

    export default withRouter(connect(mapStateToProps, {
        // pivotJDData,
        // addJDTickData,
        // getAcessToken,
        addTickDataYTC,
        pivotDataYTC,
        // addTickDataYTCNifty,
        // pivotDataYTCNifty,
        // addTickDataYTCNickle,
        // pivotDataYTCNickle,
        removePlotdatatestYTC,
        removeTickDataYTC,
        testEmail,
    })(YearlyBPB));