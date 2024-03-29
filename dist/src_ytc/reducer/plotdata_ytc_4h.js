'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];


  switch (action.type) {
    case 'REMOVE_PLOT_PIVOT_DATA_YTC_4H':
      // state = null;
      return [];
    case 'PLOT_PIVOT_DATA_YTC_4H':

      var now = new Date();

      var permissibleRiskRatio = 0.07;

      var factor = parseFloat(action.payload.y);

      // if(parseFloat(action.payload.y) >= 500){
      //  var retestDiff = 20;
      // }
      // else{
      //    var retestDiff = 10;

      // }

      if (action.payload.y) {
        var retestDiff = 0.04 * parseFloat(action.payload.y);
      }

      if (parseFloat(action.payload.y) >= 500) {
        var lowDiffFactor = 10;
      } else {
        var lowDiffFactor = 3;
      }

      if (parseFloat(action.payload.y) >= 500) {
        var upDiffFactor = 10;
      } else {
        var upDiffFactor = 5;
      }

      if (parseFloat(action.payload.y) >= 1000) {
        var downMaxDiff = 100;
      } else {
        var downMaxDiff = 50;
      }

      // console.log('bonaaaaa');

      var minimumDays = 9;

      var ratioPermitted = 1.1;

      var dayRetestDiff = 0.002 * factor;
      var sidewaysClearDiff = 0.00175 * factor;
      var crudeBigDay = 90;
      var sidewaysMinimumHeight = 0;
      var sidewaysClearDiffRatio = 0.4;
      //let minimumSidewaysHeight = 15;
      var minimumSidewaysHeight = 0.0025 * factor;
      var minimumSidewaysLength = 0.00225 * factor;
      var smallDifMinHeight = 0.005 * factor;
      var sidewaysCheckMinHeight = 0.005 * factor;
      var statelen = state.length;
      var minDiffForExtremeValidation = 0.001 * factor;
      var minUpSellPriceDiff = 0.0015 * factor;
      var minDownBuyPriceDiff = 0.0015 * factor;

      var diffBetweenLowBalckPointBuy = 0.005 * factor;

      if (statelen == 1) {

        if (parseFloat(action.payload.y) > state[0].y) {
          action.payload.lowest = state[0].y;
          action.payload.highest = parseFloat(action.payload.y);
          action.payload.sidecount = 0;
          action.payload.pivotArray = [];
        } else if (parseFloat(action.payload.y) < state[0].y) {
          action.payload.highest = state[0].y;
          action.payload.lowest = parseFloat(action.payload.y);
          action.payload.sidecount = 0;

          action.payload.pivotArray = [];
        }

        if (action.payload.dir == "up") {

          action.payload.upPivotPointsArr = [parseFloat(action.payload.y)];
        }

        if (action.payload.dir == "low") {

          action.payload.lowPivotPointsArr = [parseFloat(action.payload.y)];
        }
      }

      if (statelen == 2) {

        if (state[statelen - 1].upPivotPointsArr != undefined) {
          action.payload.upPivotPointsArr = state[statelen - 1].upPivotPointsArr;
        }

        if (state[statelen - 1].lowPivotPointsArr != undefined) {
          action.payload.lowPivotPointsArr = state[statelen - 1].lowPivotPointsArr;
        }

        if (action.payload.dir == "up") {

          if (action.payload.upPivotPointsArr == undefined) {
            action.payload.upPivotPointsArr = [parseFloat(action.payload.y)];
          } else {
            action.payload.upPivotPointsArr = action.payload.upPivotPointsArr.concat(parseFloat(action.payload.y));
          }
        }

        if (action.payload.dir == "low") {
          if (action.payload.lowPivotPointsArr == undefined) {
            action.payload.lowPivotPointsArr = [parseFloat(action.payload.y)];
          } else {
            action.payload.lowPivotPointsArr = action.payload.lowPivotPointsArr.concat(parseFloat(action.payload.y));
          }
        }

        if (state[0].y > state[1].y) {

          //lower than 1

          if (parseFloat(action.payload.y) < state[1].y) {
            action.payload.highest = state[0].y;
            action.payload.lowest = parseFloat(action.payload.y);
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
          }

          //same as 1
          if (parseFloat(action.payload.y) == state[1].y) {

            action.payload.highest = state[0].y;
            action.payload.lowest = state[1].y;
            action.payload.sidecount = 0;

            action.payload.pivotArray = [];
          }

          // upper than 1
          if (parseFloat(action.payload.y) > state[1].y && parseFloat(action.payload.y) >= state[0].y) {

            //condition to check inside here goes


            var diff = Math.abs(state[0].y - parseFloat(action.payload.y));
            var sidewaysHeight = Math.abs(state[0].y - state[1].y);
            var diffHeightRatio = diff / sidewaysHeight;
            var insideSideways = 0;

            if (sidewaysHeight <= minimumSidewaysHeight && sidewaysHeight > minimumSidewaysLength) {

              if (diff < minimumSidewaysHeight) {
                insideSideways = 1;
              } else {
                insideSideways = 0;
              }
            } else {
              if (diffHeightRatio >= sidewaysClearDiffRatio) {
                insideSideways = 0;
              } else {
                insideSideways = 1;
              }
            }
            //console.log(insideSideways);

            if (insideSideways == 1) {
              //inside sideways
              action.payload.highest = state[0].y;
              action.payload.lowest = state[1].y;
              action.payload.sidecount = 1;

              if (action.payload.pivotArray == undefined) {
                ;
                action.payload.pivotArray = [parseFloat(action.payload.y)];
              } else {
                ;
                action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
              }
            } else {
              //outside sideways
              action.payload.lowest = state[1].y;
              action.payload.highest = parseFloat(action.payload.y);
              action.payload.sidecount = 0;
              action.payload.pivotArray = [];
            }
          }

          //between 0 and 1 

          if (parseFloat(action.payload.y) > state[1].y && parseFloat(action.payload.y) < state[0].y) {

            action.payload.lowest = state[1].y;
            action.payload.highest = state[0].y;
            action.payload.sidecount = 1;

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }
          }
        } else if (state[0].y < state[1].y) {

          //lower than 1

          if (parseFloat(action.payload.y) < state[0].y) {

            //condition to check inside here goes

            var diff = Math.abs(state[0].y - parseFloat(action.payload.y));
            var sidewaysHeight = Math.abs(state[0].y - state[1].y);
            var diffHeightRatio = diff / sidewaysHeight;
            var insideSideways = 0;

            if (sidewaysHeight <= minimumSidewaysHeight && sidewaysHeight > minimumSidewaysLength) {

              if (diff < minimumSidewaysHeight) {
                insideSideways = 1;
              } else {
                insideSideways = 0;
              }
            } else {
              if (diffHeightRatio >= sidewaysClearDiffRatio) {
                insideSideways = 0;
              } else {
                insideSideways = 1;
              }
            }
            //console.log(insideSideways);

            if (insideSideways == 1) {
              //outside sideways
              action.payload.highest = state[1].y;
              action.payload.lowest = state[0].y;
              action.payload.sidecount = 1;

              if (action.payload.pivotArray == undefined) {

                action.payload.pivotArray = [parseFloat(action.payload.y)];
              } else {
                ;
                action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
              }
            } else {
              //inside sideways
              action.payload.highest = state[1].y;
              action.payload.lowest = parseFloat(action.payload.y);
              action.payload.sidecount = 0;
              action.payload.pivotArray = [];
            }
          }

          //same as 1
          if (parseFloat(action.payload.y) == state[0].y) {

            action.payload.highest = state[1].y;
            action.payload.lowest = state[0].y;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
          }

          // upper than 1
          if (parseFloat(action.payload.y) > state[0].y && parseFloat(action.payload.y) > state[1].y) {
            action.payload.highest = parseFloat(action.payload.y);
            action.payload.lowest = state[0].y;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
          }

          //between 0 and 1 

          if (parseFloat(action.payload.y) > state[0].y && parseFloat(action.payload.y) < state[1].y) {

            // 

            action.payload.lowest = parseFloat(state[0].y);
            action.payload.highest = state[1].y;
            action.payload.sidecount = 1;

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }
          }
        } else if (state[0].y == state[1].y) {
          action.payload.lowest = parseFloat(state[0].y);
          action.payload.highest = state[0].y;
          action.payload.sidecount = 0;
          action.payload.pivotArray = [];
        }

        /* if(parseFloat(action.payload.y) > state[1].y && parseFloat(action.payload.y) < state[0].y ){
              action.payload.lowest = state[1].y;
             action.payload.highest = state[0].y;
             action.payload.sidecount = 1;
         }
         else if(parseFloat(action.payload.y) == state[1].y && parseFloat(action.payload.y) < state[0].y){
              action.payload.highest = state[0].y;
              action.payload.lowest = state[1].y;
              action.payload.sidecount = 0;
         }
          else if(parseFloat(action.payload.y) < state[1].y && state[1].y< state[0].y){
              action.payload.highest = state[0].y;
              action.payload.lowest =  parseFloat(action.payload.y);
              action.payload.sidecount = 0;
         }
         else if(parseFloat(action.payload.y) > state[1].y && parseFloat(action.payload.y) > state[0].y && state[0].y > state[1].y){
              action.payload.highest = parseFloat(action.payload.y);
              action.payload.lowest = state[1].y;
              action.payload.sidecount = 0;
         }
           if(parseFloat(action.payload.y) > state[1].y && state[1].y > state[0].y ){
             action.payload.lowest = state[0].y;
             action.payload.highest = parseFloat(action.payload.y);
             action.payload.sidecount = 0;
         }
         else if(parseFloat(action.payload.y) == state[1].y && state[1].y > state[0].y){
              action.payload.highest = state[1].y;
              action.payload.lowest = state[0].y;
              action.payload.sidecount = 0;
         }
          else if(parseFloat(action.payload.y) < state[1].y && state[1].y > state[0].y){
               var diff = state[1].y - parseFloat(action.payload.y);
              var sidewaysHeight =  Math.abs(state[0].y - state[1].y) ;
              var diffHeightRatio = diff/sidewaysHeight;
              var insideSideways = 0;
               if(sidewaysHeight <= 20){
                      if(diff< 20){insideSideways = 1;}
                      else{ insideSideways = 0;}
              }
              else{
                      if(diffHeightRatio >= sidewaysClearDiffRatio ){ insideSideways = 0;}
                      else{insideSideways = 1;}
              }
              console.log(insideSideways);
               if(insideSideways == 1){
                //outside sideways
                 action.payload.highest = state[1].y;
                 action.payload.lowest =  state[0].y;
                 action.payload.sidecount = 1;
              }
              else{
                //inside sideways
                 action.payload.highest = state[1].y;
                 action.payload.lowest = parseFloat(action.payload.y);
                 action.payload.sidecount = 0;
              }
         }*/
      }

      if (state.length > 2) {

        if (state[statelen - 1].pivotArray != undefined) {
          action.payload.pivotArray = state[statelen - 1].pivotArray;
        }

        if (state[statelen - 1].upPivotPointsArr != undefined) {
          action.payload.upPivotPointsArr = state[statelen - 1].upPivotPointsArr;
        }

        if (state[statelen - 1].lowPivotPointsArr != undefined) {
          action.payload.lowPivotPointsArr = state[statelen - 1].lowPivotPointsArr;
        }

        if (action.payload.dir == "up") {

          if (action.payload.upPivotPointsArr == undefined) {
            action.payload.upPivotPointsArr = [parseFloat(action.payload.y)];
          } else {
            action.payload.upPivotPointsArr = action.payload.upPivotPointsArr.concat(parseFloat(action.payload.y));
          }
        }

        if (action.payload.dir == "low") {
          if (action.payload.lowPivotPointsArr == undefined) {
            action.payload.lowPivotPointsArr = [parseFloat(action.payload.y)];
          } else {
            action.payload.lowPivotPointsArr = action.payload.lowPivotPointsArr.concat(parseFloat(action.payload.y));
          }
        }

        if (state[statelen - 1].upcount != undefined) {
          action.payload.upcount = state[statelen - 1].upcount;
        }

        if (state[statelen - 1].downcount != undefined) {
          action.payload.downcount = state[statelen - 1].downcount;
        }

        if (state[statelen - 1].sidewaysFormationDate != undefined) {
          action.payload.sidewaysFormationDate = state[statelen - 1].sidewaysFormationDate;
        }

        if (state[statelen - 1].sidecount == 4) {
          var high = state[statelen - 1].highest;
          var low = state[statelen - 1].lowest;
          var pivotsInRange = state[statelen - 1].pivotArray.filter(function (a) {
            return a < high && a > low;
          });
          if (pivotsInRange.length < 3) {
            console.log('YTC 4H..sideways formation nullifies as pivots not proper...' + action.payload.date + '..ts..' + +action.payload.sidewaysFormationDate);
            action.payload.downcount = 0;
            action.payload.upcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            if (action.payload.dir == "up") {
              action.payload.highest = parseFloat(action.payload.y);
              action.payload.lowest = parseFloat(state[statelen - 1].y);
            } else {
              action.payload.lowest = parseFloat(action.payload.y);
              action.payload.highest = parseFloat(state[statelen - 1].y);
            }
            action.payload.upblackextreme = 0;
            action.payload.lowblackextreme = 0;
            action.payload.UPblackpoint = 0;
            action.payload.Lowblackpoint = 0;
            action.payload.trend = '';
            action.payload.upretesthappen = false;
            action.payload.downretesthappen = false;
            action.payload.downretesthappen = false;
            action.payload.tradeStatus = "start again";
            action.payload.ShortTradeInitiated = false;
            action.payload.LongTradeInitiated = false;
            var _newstate = state.concat(action.payload);
            if (+state[statelen - 1].date === 1518678000000) {}
            // debugger;

            // debugger;
            return _newstate;
          } else {
            console.log('sideways formed at ' + state[statelen - 1].date + '... ts is...' + +state[statelen - 1].date);
            console.log('sideways high is ' + high);
            console.log('sideways low at ' + low);
            console.log('sideways formed from date' + state[statelen - 6].date + ' to ' + state[statelen - 5].date);
            action.payload.sidewaysFormationDate = state[statelen - 5].date;

            if (+state[statelen - 1].date === 1520899200000) {
              // debugger;
            }
          }

          //
        }

        if (state[statelen - 1].highest != undefined) {
          action.payload.highest = state[statelen - 1].highest;
        }

        if (state[statelen - 1].lowest != undefined) {
          action.payload.lowest = state[statelen - 1].lowest;
        }

        if (state[statelen - 1].trend != undefined) {
          action.payload.trend = state[statelen - 1].trend;
        }

        if (state[statelen - 1].UPblackpoint != undefined) {
          action.payload.UPblackpoint = state[statelen - 1].UPblackpoint;
        }

        if (state[statelen - 1].Lowblackpoint != undefined) {
          action.payload.Lowblackpoint = state[statelen - 1].Lowblackpoint;
        }

        if (state[statelen - 1].tradeDirection != undefined) {
          action.payload.tradeDirection = state[statelen - 1].tradeDirection;
        }

        if (state[statelen - 1].upblackindex != undefined) {
          action.payload.upblackindex = state[statelen - 1].upblackindex;
        }

        if (state[statelen - 1].lowblackindex != undefined) {
          action.payload.lowblackindex = state[statelen - 1].lowblackindex;
        }

        if (state[statelen - 1].lowblackextreme != undefined) {
          action.payload.lowblackextreme = state[statelen - 1].lowblackextreme;
        }

        if (state[statelen - 1].upblackextreme != undefined) {
          action.payload.upblackextreme = state[statelen - 1].upblackextreme;
        }

        if (state[statelen - 1].upblackextremeindex != undefined) {
          action.payload.upblackextremeindex = state[statelen - 1].upblackextremeindex;
        }

        if (state[statelen - 1].lowblackextremeindex != undefined) {
          action.payload.lowblackextremeindex = state[statelen - 1].lowblackextremeindex;
        }

        if (state[statelen - 1].LongTradeInitiated != undefined) {
          action.payload.LongTradeInitiated = state[statelen - 1].LongTradeInitiated;
        }

        if (state[statelen - 1].ShortTradeInitiated != undefined) {
          action.payload.ShortTradeInitiated = state[statelen - 1].ShortTradeInitiated;
        }

        if (state[statelen - 1].upretesthappen != undefined) {
          action.payload.upretesthappen = state[statelen - 1].upretesthappen;
        }

        if (state[statelen - 1].downretesthappen != undefined) {
          action.payload.downretesthappen = state[statelen - 1].downretesthappen;
        }

        if (state[statelen - 1].bigDayTrade != undefined) {
          action.payload.bigDayTrade = state[statelen - 1].bigDayTrade;
        }

        if (state[statelen - 1].bigDayTradePrice != undefined) {
          action.payload.bigDayTradePrice = state[statelen - 1].bigDayTradePrice;
        }

        /*  if(Math.abs(parseFloat(action.payload.y) - state[statelen-1].y) > crudeBigDay){
             //time to clear everything and loop for short and look respectivity
             
               if(parseFloat(action.payload.y) > state[statelen-1].y && action.payload.crudeTradeManagement != "trailing"){
                  action.payload.bigDayTrade = 'short'; 
                  action.payload.bigDayTradePrice = parseFloat(action.payload.y); 
                  action.payload.highest = parseFloat(action.payload.y);                    
                  action.payload.lowest = state[statelen-1].y;
                  action.payload.upcount = 0; 
                  action.payload.sidecount = 0;
                  action.payload.downcount =0;  
                  action.payload.upblackextreme = 0;
                  action.payload.lowblackextreme = 0;
                  action.payload.UPblackpoint = 0;
                  action.payload.Lowblackpoint = 0; 
                  action.payload.trend = '';
                  let newstate = state.concat(action.payload);
                  return newstate ;
                }
               else if(parseFloat(action.payload.y) < state[statelen-1].y){
                  
                  action.payload.bigDayTrade = 'long'; 
                  action.payload.bigDayTradePrice = parseFloat(action.payload.y);
                  action.payload.lowest = parseFloat(action.payload.y);                    
                  action.payload.highest = state[statelen-1].y;
                  action.payload.upcount = 0; 
                  action.payload.sidecount = 0;
                  action.payload.downcount =0;  
                  action.payload.upblackextreme = 0;
                  action.payload.lowblackextreme = 0;
                  action.payload.UPblackpoint = 0;
                  action.payload.Lowblackpoint = 0; 
                  action.payload.trend = '';
                  let newstate = state.concat(action.payload);
                  return newstate ;
                }
           }*/

        if (action.payload.tradeStatus == "start again") {
          action.payload.ShortTradeInitiated = false;
          action.payload.LongTradeInitiated = false;
        }

        if (state[statelen - 1].trend == 'sideways') {
          //write logic of blackline setup here

          //


          if (action.payload.dir == "up" && parseFloat(state[statelen - 1].highest) < parseFloat(parseFloat(action.payload.y)) && state[statelen - 1].retesthappen != 0) {
            //console.log('111');
            //set this point as blackline to test 


            if (state[statelen - 1].upblackextreme != undefined && state[statelen - 1].upblackextreme != 0) {
              var diff = Math.abs(state[statelen - 1].upblackextreme - parseFloat(action.payload.y));

              //

              if (diff <= retestDiff && state[statelen - 1].ShortTradeInitiated != true && parseFloat(state[statelen - 1].UPblackpoint) < parseFloat(parseFloat(action.payload.y)) && parseFloat(state[statelen - 1].highest) < parseFloat(action.payload.currentPrice)) {
                console.log('miniiiiiiiiiii');

                var priceDiff = Math.abs(state[statelen - 1].highest - action.payload.currentPrice);

                if (priceDiff > minUpSellPriceDiff) {

                  ;

                  action.payload.upretesthappen = true;
                  action.payload.highest = state[statelen - 1].highest;
                  action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                  action.payload.ShortTradeInitiated = true;
                  action.payload.UPblackpoint = action.payload.upblackextreme;
                  action.payload.UPblackpointindex = action.payload.upblackextremeindex;
                  action.payload.TradeStarted = 'upsell';
                  action.payload.TimeToEnter = true;
                  action.payload.TradeTime = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString();;

                  console.log('BPB short at ' + action.payload.date + ' PRICE IS ' + action.payload.currentPrice + ' for ' + action.payload.name);
                  // console.log('time is' + action.payload.time);
                  var _newstate2 = state.concat(action.payload);
                  return _newstate2;
                }
              } else if (state[statelen - 1].upretesthappen == true && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].UPblackpoint)) {
                //  


                if (action.payload.currentPrice > state[statelen - 1].UPblackpoint && Math.abs(action.payload.currentPrice - state[statelen - 1].UPblackpoint) >= upDiffFactor) {

                  action.payload.downcount = 0;
                  action.payload.upcount = 0;
                  action.payload.sidecount = 0;
                  action.payload.pivotArray = [];
                  action.payload.highest = parseFloat(action.payload.y);
                  action.payload.lowest = parseFloat(state[statelen - 1].y);
                  action.payload.upblackextreme = 0;
                  action.payload.lowblackextreme = 0;
                  action.payload.UPblackpoint = 0;
                  action.payload.Lowblackpoint = 0;
                  action.payload.trend = '';
                  action.payload.upretesthappen = false;
                  action.payload.downretesthappen = false;
                  action.payload.tradeStatus = "start again";

                  action.payload.ShortTradeInitiated = false;
                  action.payload.LongTradeInitiated = false;

                  var _newstate3 = state.concat(action.payload);
                  return _newstate3;
                }
              } else if (diff > retestDiff && state[statelen - 1].upretesthappen !== true && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].UPblackpoint)) {
                //  
                console.log('time to empty the sideways on' + action.payload.date);

                action.payload.downcount = 0;
                action.payload.upcount = 0;
                action.payload.sidecount = 0;
                action.payload.pivotArray = [];
                action.payload.highest = parseFloat(action.payload.y);
                action.payload.lowest = parseFloat(state[statelen - 1].y);
                action.payload.upblackextreme = 0;
                action.payload.lowblackextreme = 0;
                action.payload.UPblackpoint = 0;
                action.payload.Lowblackpoint = 0;
                action.payload.trend = '';
                action.payload.upretesthappen = false;
                action.payload.downretesthappen = false;
                action.payload.downretesthappen = false;
                action.payload.tradeStatus = "start again";
                action.payload.ShortTradeInitiated = false;
                action.payload.LongTradeInitiated = false;
                var _newstate4 = state.concat(action.payload);
                return _newstate4;
              }
            } else {
              //console.log('y' + action.payload.x);  
              //  

              if (action.payload.prevY > state[statelen - 1].highest) {

                // ;
                console.log('up black extreme is' + action.payload.date);
                action.payload.upblackextreme = parseFloat(action.payload.y);
                action.payload.UPblackpoint = parseFloat(action.payload.y);
                action.payload.UPblackpointindex = action.payload.x;
                action.payload.highest = state[statelen - 1].highest;
                action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                action.payload.upcount = state[statelen - 1].upcount;
              }
            }
          } else if (action.payload.dir == "low" && state[statelen - 1].lowest > parseFloat(action.payload.y)) {
            //set this point as blackline to test 


            if (state[statelen - 1].Lowblackpoint != undefined && state[statelen - 1].Lowblackpoint != 0 && parseFloat(state[statelen - 1].lowest) > parseFloat(action.payload.currentPrice)) {

              var diff = Math.abs(state[statelen - 1].Lowblackpoint - parseFloat(action.payload.y));

              //console.log('11' + parseFloat(action.payload.y));
              // var diffBetweenLowBalckPointBuy =  Math.abs(parseFloat(action.payload.y)-);

              if (parseFloat(state[statelen - 1].Lowblackpoint) > parseFloat(parseFloat(action.payload.y)) && (state[statelen - 1].downretesthappen == undefined || state[statelen - 1].downretesthappen == false)) {

                // ;
                // console.log('tin tina tin tin');
                if (diff >= downMaxDiff) {
                  //;

                  console.log('cha cha cha' + parseFloat(action.payload.y));
                  action.payload.Lowblackpoint = parseFloat(action.payload.y);
                  action.payload.highest = state[statelen - 1].highest;
                  action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                  var _newstate5 = state.concat(action.payload);
                  return _newstate5;
                }
              }

              /*   if( diff <= retestDiff && state[statelen-1].LongTradeInitiated != true){
                    var priceDiff = Math.abs(state[statelen-1].lowest - action.payload.currentPrice);
                  if(priceDiff > minDownBuyPriceDiff){
                      
                     console.log('11');
                     action.payload.retesthappen = true;
                     action.payload.highest = state[statelen-1].highest;                    
                     action.payload.lowest = state[statelen-1].lowest;
                     action.payload.LongTradeInitiated = true;
                     action.payload.Lowblackpoint = action.payload.lowblackextreme;
                     action.payload.lowblackindex = action.payload.lowblackextremeindex;
                     action.payload.TradeStarted = 'downbuy';
                     action.payload.TimeToEnter = true;
                     action.payload.TradeTime=  now.getHours().toString()   + now.getMinutes().toString() + now.getSeconds().toString();;
                   
                     let newstate = state.concat(action.payload);
                     return newstate ;
                 }
                   }*/

              // console.log('low black point 2 is' + action.payload.x);

              //  

              /* action.payload.highest = state[statelen-1].highest;                    
               action.payload.lowest = state[statelen-1].lowest; 
               //low black extreme lovely
                  if(action.payload.lowblackextreme > parseFloat(action.payload.y)){
                     action.payload.lowblackextreme = parseFloat(action.payload.y);
                     action.payload.Lowblackpoint = action.payload.lowblackextreme;
                }*/

              /*if(Math.abs(parseFloat(action.payload.y)-action.payload.lowest) >10){
                 action.payload.lowblackextreme = parseFloat(action.payload.y);
                 action.payload.Lowblackpoint = action.payload.lowblackextreme;
                 action.payload.lowblackindex = action.payload.lowblackextremeindex;
              }*/
            } else {
              // console.log('low black point 3 is' + action.payload.x);
              // 
              if (parseFloat(action.payload.prevY) < parseFloat(state[statelen - 1].lowest) && (state[statelen - 1].Lowblackpoint == undefined || state[statelen - 1].Lowblackpoint == 0)) {

                console.log('samosa');

                if (action.payload.pivotArray !== undefined) {
                  if (parseFloat(action.payload.y) < _lodash2.default.minBy(action.payload.pivotArray)) {
                    // ;

                    action.payload.lowblackextreme = parseFloat(action.payload.y);
                    action.payload.Lowblackpoint = parseFloat(action.payload.y);
                    action.payload.lowblackindex = action.payload.x;
                    action.payload.highest = state[statelen - 1].highest;
                    action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                    var _newstate6 = state.concat(action.payload);
                    return _newstate6;
                  }
                }
                // ;
              }
            }
          }
        }

        //now condition of retest here

        if (state[statelen - 1].UPblackpoint != undefined || state[statelen - 1].Lowblackpoint != undefined) {

          //now see if black line point is touched or not asap
          if (state[statelen - 1].UPblackpoint != undefined && state[statelen - 1].UPblackpoint != 0 && state[statelen - 1].trend == 'sideways' && action.payload.dir == "up") {
            //newww codeeee hereeee

            var diff = Math.abs(state[statelen - 1].UPblackpoint - parseFloat(action.payload.y));

            // 

            if (parseFloat(state[statelen - 1].UPblackpoint) <= parseFloat(parseFloat(action.payload.y)) && diff <= dayRetestDiff && state[statelen - 1].trend == 'sideways' && state[statelen - 1].ShortTradeInitiated != true && state[statelen - 1].highest < action.payload.currentPrice) {
              //normal bpb short
              // 


              var priceDiff = Math.abs(state[statelen - 1].highest - action.payload.currentPrice);

              if (priceDiff > minUpSellPriceDiff) {

                // console.log('binii' + action.payload.x);
                console.log('up sell initiated at ' + action.payload.date + ' price is' + action.payload.currentPrice + ' for ' + action.payload.name);

                action.payload.retesthappen = true;
                action.payload.highest = state[statelen - 1].highest;
                action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                action.payload.ShortTradeInitiated = true;
                action.payload.TradeStarted = 'upsell';
                action.payload.TimeToEnter = true;
                action.payload.TradeTime = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString();;

                var _newstate7 = state.concat(action.payload);
                return _newstate7; //ktk20003918  true professional carrier
              }
            }
          } else if (state[statelen - 1].Lowblackpoint != undefined && state[statelen - 1].Lowblackpoint != 0 && action.payload.dir == "low") {

            var diff = Math.abs(state[statelen - 1].Lowblackpoint - parseFloat(action.payload.y));

            //;
            if (state[statelen - 1].LongTradeInitiated != true && state[statelen - 1].Lowblackpoint >= parseFloat(action.payload.y) && parseFloat(state[statelen - 1].lowest) > parseFloat(action.payload.currentPrice) && (state[statelen - 1].downretesthappen == undefined || state[statelen - 1].downretesthappen == false)) {

              var priceDiff = Math.abs(state[statelen - 1].lowest - action.payload.currentPrice);

              var newPriceDiff = Math.abs(action.payload.currentPrice - action.payload.y);

              var priceDiffRatio = priceDiff / action.payload.currentPrice;

              var date1 = new Date(action.payload.date);
              var date2 = new Date(action.payload.pivotDate);
              var diffTime = Math.abs(date2.getTime() - date1.getTime());
              var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              //solomon.murugan@wipro.com
              // if(priceDiffRatio <= permissibleRiskRatio){
              //  ;
              // console.log('priceDiffRatio. ' + parseFloat(newPriceDiff/action.payload.y));


              if (diffDays <= minimumDays) {

                //;

                console.log('low black point is..... ' + state[statelen - 1].Lowblackpoint);
                console.log('down buy initiated at ' + action.payload.date + ' price is' + action.payload.currentPrice + ' for ' + action.payload.name);
                action.payload.downretesthappen = true;
                action.payload.highest = state[statelen - 1].highest;
                action.payload.lowest = parseFloat(state[statelen - 1].lowest);
                action.payload.LongTradeInitiated = true;
                action.payload.TradeStarted = 'downbuy';
                action.payload.TimeToEnter = true;
                //action.payload.TradeTime=  now.getHours().toString()   + now.getMinutes().toString() + now.getSeconds().toString();;
                var _newstate8 = state.concat(action.payload);
                return _newstate8;
              }

              // ; 

              // }
            }
          }
        }

        if (parseFloat(state[statelen - 1].highest) >= parseFloat(parseFloat(action.payload.y)) && parseFloat(state[statelen - 1].lowest) <= parseFloat(parseFloat(action.payload.y))) {
          //sideways movemnet started
          action.payload.sidecount = state[state.length - 1].sidecount + 1;
          action.payload.highest = state[statelen - 1].highest;
          action.payload.lowest = parseFloat(state[statelen - 1].lowest);

          if (action.payload.pivotArray == undefined) {
            ;
            action.payload.pivotArray = [parseFloat(action.payload.y)];
          } else {
            ;
            action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
          }
        } else if (action.payload.dir == "up" && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].highest) && state[statelen - 1].trend != 'sideways' && (state[statelen - 1].upcount == undefined || state[statelen - 1].upcount == 0)) {
          //first time price breaks outside
          //check the length of this breakout ..if it exceed normal length then time to empty sideways

          //let breakoutlength =  Maths.abs(parseFloat(action.payload.y) - state[statelen-1].y);
          // 


          var prevswinglength = state[statelen - 1].highest - state[statelen - 1].lowest;
          var diff = parseFloat(action.payload.y) - state[statelen - 1].highest;
          var sidewaysHeight = state[statelen - 1].highest - state[statelen - 1].lowest;
          var diffHeightRatio = diff / sidewaysHeight;

          var check = 0;

          /* if(sidewaysHeight <= 20){
             console.log('1234');
                   if(diff< 20){check = 1;}
                   else{ check = 0;}
           }
           else{
             console.log('34567');
                   if(diffHeightRatio >= sidewaysClearDiffRatio ){ check = 0;}
                   else{check = 1;}
           }*/

          if (sidewaysHeight <= minimumSidewaysHeight && sidewaysHeight > minimumSidewaysLength) {

            if (diff < minimumSidewaysHeight) {
              check = 1;
            } else {
              check = 0;
            }
          } else {
            if (diffHeightRatio >= sidewaysClearDiffRatio) {
              check = 0;
            } else {
              check = 1;
            }
          }

          if (check == 0 && action.payload.crudeTradeManagement != "trailing") {

            //  console.log(action.payload.x);
            action.payload.highest = parseFloat(action.payload.y);
            action.payload.lowest = parseFloat(state[statelen - 1].y);
            action.payload.trend = 'uptrend111111';
            action.payload.upcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            action.payload.downcount = 0;
            action.payload.upblackextreme = 0;
            action.payload.lowblackextreme = 0;
            action.payload.UPblackpoint = 0;
            action.payload.Lowblackpoint = 0;
          } else {

            action.payload.sidecount = state[state.length - 1].sidecount + 1;
            action.payload.highest = state[statelen - 1].highest;
            action.payload.lowest = parseFloat(state[statelen - 1].lowest);
            action.payload.upcount = 1;

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }

            /*if(diff> minDiffForExtremeValidation){
              console.log('sonuuuuuuu')
               action.payload.upblackextreme = parseFloat(action.payload.y);
               action.payload.upblackextremeindex = action.payload.x;
            }*/

            ;
          }
        } else if (action.payload.dir == "up" && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].highest) && state[state.length - 1].sidecount < 4 && state[statelen - 1].upcount == 1) {
          //time to empty the swing and create a new swing 
          //let breakoutlength =  Maths.abs(parseFloat(action.payload.y) - state[statelen-1].y);
          //let prevswinglength = state[statelen-1].highest - state[statelen-1].lowest;
          console.log('bonuuuuuuuuuuuuuuuuuuu');
          // 

          var tradeDir = parseFloat(action.payload.y) - state[statelen - 1].upblackextreme;
          var sidewaysHeight = state[statelen - 1].highest - state[statelen - 1].lowest;
          var diff = parseFloat(action.payload.y) - state[statelen - 1].highest;
          var diffHeightRatio = diff / sidewaysHeight;
          var check = 0;

          /*if(sidewaysHeight <= sidewaysCheckMinHeight){
                  if(diff< smallDifMinHeight){check = 1;}
                  else{ check = 0;}
          }
          else{
                  if(diffHeightRatio >= sidewaysClearDiffRatio ){ check = 0;}
                  else{check = 1;}
          }*/

          if (sidewaysHeight <= minimumSidewaysHeight && sidewaysHeight > minimumSidewaysLength) {
            if (diff < minimumSidewaysHeight) {
              check = 1;
            } else {
              check = 0;
            }
          } else {
            if (diffHeightRatio >= sidewaysClearDiffRatio) {
              check = 0;
            } else {
              check = 1;
            }
          }

          if (check == 1 && Math.abs(tradeDir) <= 0.00125 * factor) {
            //  console.log('1');
            action.payload.sidecount = state[state.length - 1].sidecount + 1;
            action.payload.highest = state[statelen - 1].highest;
            action.payload.lowest = parseFloat(state[statelen - 1].lowest);
            action.payload.upcount = 0;

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }
          } else {

            console.log('sideways formation nullifies at' + action.payload.date);
            action.payload.downcount = 0;
            action.payload.upcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            action.payload.highest = parseFloat(action.payload.y);
            action.payload.lowest = parseFloat(state[statelen - 1].y);
            action.payload.upblackextreme = 0;
            action.payload.lowblackextreme = 0;
            action.payload.UPblackpoint = 0;
            action.payload.Lowblackpoint = 0;
            action.payload.trend = '';
            action.payload.sidewaysFormationDate = "";
          }
        } else if (action.payload.dir == "low" && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].highest) && state[statelen - 1].trend != 'sideways') {
          //time to empty the swing and create a new swing 

          action.payload.highest = state[statelen - 1].y;
          action.payload.lowest = parseFloat(state[statelen - 2].y);
          action.payload.trend = 'uptrend222222';
          action.payload.upcount = 0;

          //action.payload.sidecount = 1;

          action.payload.sidecount = state[state.length - 1].sidecount + 1;

          if (action.payload.pivotArray == undefined) {
            ;
            action.payload.pivotArray = [parseFloat(action.payload.y)];
          } else {
            ;
            action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
          }

          action.payload.downcount = 0;
          // console.log('trend is downtrend ashu' + action.payload.x);

          action.payload.upblackextreme = 0;
          action.payload.lowblackextreme = 0;
          action.payload.UPblackpoint = 0;
          action.payload.Lowblackpoint = 0;

          //console.log('high is ' + action.payload.highest);
          //console.log('low is ' + action.payload.lowest);
        } else if (action.payload.dir == "up" && parseFloat(parseFloat(action.payload.y)) < parseFloat(state[statelen - 1].lowest) && state[statelen - 1].trend != 'sideways') {
          //time to empty the swing and create a new swing
          action.payload.highest = state[statelen - 2].y;
          action.payload.lowest = parseFloat(state[statelen - 1].y);
          action.payload.trend = 'downtrend';
          action.payload.upcount = 0;
          action.payload.sidecount = 1;

          if (action.payload.pivotArray == undefined) {
            ;
            action.payload.pivotArray = [parseFloat(action.payload.y)];
          } else {
            ;
            action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
          }

          action.payload.downcount = 0;
          // console.log('trend is downtrend');


          action.payload.upblackextreme = 0;
          action.payload.lowblackextreme = 0;
          action.payload.UPblackpoint = 0;
          action.payload.Lowblackpoint = 0;
        } else if (action.payload.dir == "low" && parseFloat(parseFloat(action.payload.y)) < parseFloat(state[statelen - 1].lowest) && (state[statelen - 1].downcount == undefined || state[statelen - 1].downcount == 0) && state[state.length - 1].sidecount < 4) {

          var diff = state[statelen - 1].lowest - parseFloat(action.payload.y);
          var sidewaysHeight = state[statelen - 1].highest - state[statelen - 1].lowest;
          var diffHeightRatio = diff / sidewaysHeight;
          var check = 0;

          /* if(sidewaysHeight <= sidewaysCheckMinHeight){
                    if(diff< smallDifMinHeight){check = 1;}
                   else{ check = 0;}
           }
           else{
                   if(diffHeightRatio >= sidewaysClearDiffRatio ){ check = 0;}
                   else{check = 1;}
           }*/

          if (sidewaysHeight <= minimumSidewaysHeight && sidewaysHeight > minimumSidewaysLength) {

            if (diff < minimumSidewaysHeight) {
              check = 1;
            } else {
              check = 0;
            }
          } else {
            if (diffHeightRatio >= sidewaysClearDiffRatio) {
              check = 0;
            } else {
              check = 1;
            }
          }

          //

          if (check == 0 && (action.payload.downcount == 0 || action.payload.downcount == undefined)) {

            action.payload.downcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            action.payload.upcount = 0;
            action.payload.highest = state[statelen - 1].y;
            action.payload.lowest = parseFloat(parseFloat(action.payload.y));
            action.payload.upblackextreme = 0;
            action.payload.lowblackextreme = 0;
            action.payload.UPblackpoint = 0;
            action.payload.Lowblackpoint = 0;
            action.payload.trend = '';
          } else {

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }

            action.payload.sidecount = state[state.length - 1].sidecount + 1;
            action.payload.highest = state[statelen - 1].highest;
            action.payload.lowest = parseFloat(state[statelen - 1].lowest);

            /* if(Math.abs(parseFloat(action.payload.y)-action.payload.lowest) >= 4){
                  action.payload.downcount =1; 
                  action.payload.lowblackextreme = parseFloat(action.payload.y);
                  action.payload.lowblackextremeindex = action.payload.x;
             }*/
          }
        } else if (action.payload.dir == "low" && parseFloat(parseFloat(action.payload.y)) < parseFloat(state[statelen - 1].Lowblackpoint) && state[statelen - 1].downretesthappen == true) {
          //now time to clear sideways context and make a new trend all together ShortTradeInitiated LongTradeInitiated

          //console.log(' low diff is');
          // console.log(state[statelen-1].Lowblackpoint - parseFloat(action.payload.y) );

          if (state[statelen - 1].Lowblackpoint - parseFloat(action.payload.y) > retestDiff) {
            //  

            console.log('clear sideways all together at' + action.payload.x);
            action.payload.upretesthappen = false;
            action.payload.downretesthappen = false;

            action.payload.ShortTradeInitiated = false;
            action.payload.LongTradeInitiated = false;
            action.payload.downcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            action.payload.upcount = 0;
            action.payload.highest = state[statelen - 1].y;
            action.payload.lowest = parseFloat(parseFloat(action.payload.y));

            action.payload.upblackextreme = 0;
            action.payload.lowblackextreme = 0;
            action.payload.UPblackpoint = 0;
            action.payload.Lowblackpoint = 0;
            action.payload.trend = '';
          }
        } else if (action.payload.dir == "up" && parseFloat(parseFloat(action.payload.y)) > parseFloat(state[statelen - 1].UPblackpoint) && state[statelen - 1].retesthappen == true) {
          //now time to clear sideways context and make a new trend all together

          // console.log(' up diff is');
          //console.log(state[statelen-1].UPblackpoint - parseFloat(action.payload.y) );
          // console.log('x');

          if (action.payload.LongTradeInitiated !== undefined || action.payload.ShortTradeInitiated !== undefined) {

            if (action.payload.LongTradeInitiated == false) {

              if (parseFloat(action.payload.y) - state[statelen - 1].UPblackpoint > retestDiff) {
                //  

                // console.log('clear sideways all together at' + action.payload.x); 

                action.payload.ShortTradeInitiated = false;
                action.payload.LongTradeInitiated = false;

                action.payload.downcount = 0;
                action.payload.sidecount = 0;
                action.payload.pivotArray = [];
                action.payload.upcount = 0;
                action.payload.highest = parseFloat(action.payload.y);
                action.payload.lowest = parseFloat(state[statelen - 1].y);

                action.payload.upblackextreme = 0;
                action.payload.lowblackextreme = 0;
                action.payload.UPblackpoint = 0;
                action.payload.Lowblackpoint = 0;
                action.payload.trend = '';
              }
            }
          }
        } else if (action.payload.dir == "low" && parseFloat(parseFloat(action.payload.y)) < parseFloat(state[statelen - 1].lowest) && state[state.length - 1].sidecount < 4 && state[statelen - 1].downcount == 1) {
          //time to empty the swing and create a new swing 

          var diff = state[statelen - 1].lowest - parseFloat(action.payload.y);
          //var tradeDir = state[statelen-1].upblackextreme;
          //ashutosh singh
          // 

          if (diff <= retestDiff) {
            //mark it as inside sideways

            if (action.payload.pivotArray == undefined) {
              ;
              action.payload.pivotArray = [parseFloat(action.payload.y)];
            } else {
              ;
              action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
            }

            action.payload.sidecount = state[state.length - 1].sidecount + 1;
            action.payload.highest = state[statelen - 1].highest;
            action.payload.lowest = parseFloat(state[statelen - 1].lowest);
            action.payload.upcount = 0;
          } else {

            //
            action.payload.downcount = 0;
            action.payload.sidecount = 0;
            action.payload.pivotArray = [];
            action.payload.upcount = 0;
            action.payload.highest = state[statelen - 1].y;
            action.payload.lowest = parseFloat(parseFloat(action.payload.y));
            action.payload.trend = '';
          }
        } else {
          if (action.payload.dir == "low") {

            if (parseFloat(parseFloat(action.payload.y)) >= parseFloat(state[statelen - 1].highest) && action.payload.upcount == 1 && state[statelen - 1].trend != 'sideways') {
              //uptredn started
              // console.log('uptrend started');
              action.payload.sidecount = 0;
              action.payload.pivotArray = [];
              action.payload.trend = 'uptrend';
              action.payload.highest = parseFloat(action.payload.y);
              action.payload.lowest = parseFloat(state[state.length - 1].y);
              action.payload.upcount = 0;
              action.payload.downcount = 0;

              action.payload.upblackextreme = 0;
              action.payload.lowblackextreme = 0;
              action.payload.UPblackpoint = 0;
              action.payload.Lowblackpoint = 0;
            } else if (state[statelen - 1].highest >= parseFloat(action.payload.y) && state[statelen - 1].lowest <= parseFloat(action.payload.y)) {
              //back in sideways

              if (action.payload.pivotArray == undefined) {
                ;
                action.payload.pivotArray = [parseFloat(action.payload.y)];
              } else {
                ;
                action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
              }

              action.payload.sidecount = state[statelen - 1].sidecount + 1;
              action.payload.highest = state[statelen - 1].highest;
              action.payload.lowest = parseFloat(state[statelen - 1].lowest);
            }
          } else if (action.payload.dir == "up") {

            if (parseFloat(parseFloat(action.payload.y)) <= parseFloat(state[statelen - 1].lowest) && action.payload.downcount == 1 && state[statelen - 1].trend != 'sideways') {
              //uptredn started
              //  console.log('downtrend started');
              action.payload.sidecount = 0;
              action.payload.pivotArray = [];
              action.payload.trend = 'downtrend';
              action.payload.highest = state[state.length - 2].y;
              action.payload.lowest = parseFloat(state[state.length - 1].y);
              action.payload.downcount = 0;
              action.payload.upcount = 0;

              action.payload.upblackextreme = 0;
              action.payload.lowblackextreme = 0;
              action.payload.UPblackpoint = 0;
              action.payload.Lowblackpoint = 0;
            } else if (state[statelen - 1].highest >= parseFloat(action.payload.y) && state[statelen - 1].lowest <= parseFloat(action.payload.y)) {
              //back in sideways

              if (action.payload.pivotArray == undefined) {
                ;
                action.payload.pivotArray = [parseFloat(action.payload.y)];
              } else {

                ;
                action.payload.pivotArray = action.payload.pivotArray.concat(parseFloat(action.payload.y));
              }

              action.payload.sidecount = state[state.length - 1].sidecount + 1;
              action.payload.highest = state[statelen - 1].highest;
              action.payload.lowest = parseFloat(state[statelen - 1].lowest);

              // action.payload.pivotArray = ;  
            }
          }
        }
      }

      if (action.payload.sidecount >= 4) {
        //hurray sideways formed yayyyy


        if (action.payload.highest - action.payload.lowest > sidewaysMinimumHeight) {
          action.payload.trend = 'sideways';
          if (state[statelen - 1].UPblackpoint != undefined) {
            // 

            action.payload.UPblackpoint = state[statelen - 1].UPblackpoint;
          }

          if (state[statelen - 1].Lowblackpoint != undefined) {
            action.payload.Lowblackpoint = state[statelen - 1].Lowblackpoint;
          }
        } else {
          //time to empty sideways

          action.payload.ShortTradeInitiated = false;
          action.payload.LongTradeInitiated = false;
          action.payload.downcount = 0;
          action.payload.sidecount = 0;
          action.payload.pivotArray = [];
          action.payload.upcount = 0;
          action.payload.highest = state[statelen - 1].y;
          action.payload.lowest = parseFloat(parseFloat(action.payload.y));

          action.payload.upblackextreme = 0;
          action.payload.lowblackextreme = 0;
          action.payload.UPblackpoint = 0;
          action.payload.Lowblackpoint = 0;
        }
      }

      var newstate = state.concat(action.payload);
      return newstate;
  }
  return state;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }