'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testEmail = testEmail;
exports.getDukasDaily = getDukasDaily;
exports.getAlphaData = getAlphaData;
exports.pivotDataTest = pivotDataTest;
exports.removeAlphadata = removeAlphadata;
exports.removePlotdataLTF = removePlotdataLTF;
exports.removePlotdatatest = removePlotdatatest;
exports.removePlotdatatestHour = removePlotdatatestHour;
exports.removePlotdatatestDaily = removePlotdatatestDaily;
exports.removeTickData = removeTickData;
exports.removeTickDataHour = removeTickDataHour;
exports.removeLTFData = removeLTFData;
exports.removeTickDataDaily = removeTickDataDaily;
exports.removeTickDataTest = removeTickDataTest;
exports.pivotData = pivotData;
exports.pivotDataHour = pivotDataHour;
exports.pivotDataDaily = pivotDataDaily;
exports.addTickData = addTickData;
exports.addTickDataHour = addTickDataHour;
exports.addTickDataDaily = addTickDataDaily;
exports.addTickDataLTF = addTickDataLTF;
exports.pivotDataLTF = pivotDataLTF;
exports.addTickDataTMTF = addTickDataTMTF;
exports.pivotDataTMTF = pivotDataTMTF;
exports.removePlotdataTMTF = removePlotdataTMTF;
exports.removeTMTFData = removeTMTFData;
exports.addTickDataYTC = addTickDataYTC;
exports.pivotDataYTC = pivotDataYTC;
exports.removePlotdatatestYTC = removePlotdatatestYTC;
exports.pivotDataYTC4H = pivotDataYTC4H;
exports.removePlotdatatestYTC4H = removePlotdatatestYTC4H;
exports.removeTickDataYTC = removeTickDataYTC;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function testEmail(data, id) {

  // var seg1 = 'http://localhost:4000/email';
  var seq1 = 'https://serene-ocean-13672.herokuapp.com/email';
  //debugger;

  return function (dispatch) {
    //           axios({
    //  method: 'get',
    //  url: 'http://localhost:4000/email',
    //  params: {
    //   data: data
    // }

    // })
    // .then(response => {
    //     console.log('email sent');
    // })
    // .catch((error) => {
    //  console.log('error in sending email.......');
    // });

    // axios.get('http://localhost:4000/email', {
    //   params: {
    //     data: data
    //   }
    // })

    _axios2.default.post(seq1, {
      data: data
    }).then(function (response) {
      console.log(response);
    }).catch(function (error) {
      console.log(error);
    });
  };
}

// {
//   params: {
//     data: data
//   }
// }


function getDukasDaily(data, id) {

  var seg1 = 'http://localhost:4000/daily';

  return function (dispatch) {
    (0, _axios2.default)({
      method: 'get',
      url: 'http://localhost:4000/daily'
    }).then(function (response) {
      console.log('data recieved....' + response.data.length);
    }).catch(function (error) {
      console.log('error....');
    });
  };
}

function getAlphaData(data, id) {

  var seg1 = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=BSE:';
  var seg2 = '&outputsize=full&apikey=';

  //B1A31LJSJBKKJR49

  var url = '' + seg1 + data + seg2 + id;

  //debugger;


  return function (dispatch) {
    (0, _axios2.default)({
      method: 'get',
      url: url
    }).then(function (response) {
      //debugger;
      //alert(JSON.stringify(response));

      dispatch({ type: 'DATA_OBTAINED', payload: response.data });
    }).catch(function (error) {
      dispatch({ type: 'DATA_NOT_OBTAINED', payload: 'Error' });
      console.log("Error Response" + error);
    });
  };
}

//getAcessToken  ADD_DATA_SCOPE
function pivotDataTest(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA_TEST',
    payload: data
  };
}

function removeAlphadata(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_ALPHA_DATA',
    payload: ''
  };
}

function removePlotdataLTF(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_LTF',
    payload: ''
  };
}

function removePlotdatatest(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA',
    payload: ''
  };
}

function removePlotdatatestHour(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_HOUR',
    payload: ''
  };
}

function removePlotdatatestDaily(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_DAILY',
    payload: ''
  };
}

function removeTickData(data) {
  return {
    type: 'REMOVE_TICK_DATA',
    payload: ''
  };
}

function removeTickDataHour(data) {
  return {
    type: 'REMOVE_TICK_DATA_HOUR',
    payload: ''
  };
}

function removeLTFData(data) {
  return {
    type: 'REMOVE_TICK_DATA_LTF',
    payload: ''
  };
}

function removeTickDataDaily(data) {
  return {
    type: 'REMOVE_TICK_DATA_DAILY',
    payload: ''
  };
}

function removeTickDataTest(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_DATA_SCOPE_TEST',
    payload: ''
  };
}

function pivotData(data) {

  //debugger;
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA',
    payload: data
  };
}

function pivotDataHour(data) {

  //debugger;
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA_HOUR',
    payload: data
  };
}

function pivotDataDaily(data) {

  //debugger;
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA_DAILY',
    payload: data
  };
}

function addTickData(data) {
  //alert(JSON.stringify(data));
  return {
    type: 'ADD_DATA_SCOPE',
    payload: data
  };
}

function addTickDataHour(data) {
  //alert(JSON.stringify(data));
  return {
    type: 'ADD_DATA_SCOPE_HOUR',
    payload: data
  };
}

function addTickDataDaily(data) {
  //alert(JSON.stringify(data));
  return {
    type: 'ADD_DATA_SCOPE_DAILY',
    payload: data
  };
}

function addTickDataLTF(data) {
  return {
    type: 'ADD_DATA_SCOPE_LTF',
    payload: data
  };
}

function pivotDataLTF(data) {
  return {
    type: 'PLOT_PIVOT_DATA_LTF',
    payload: data
  };
}

function addTickDataTMTF(data) {
  return {
    type: 'ADD_DATA_SCOPE_TMTF',
    payload: data
  };
}

function pivotDataTMTF(data) {
  return {
    type: 'PLOT_PIVOT_DATA_TMTF',
    payload: data
  };
}

function removePlotdataTMTF(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_TMTF',
    payload: ''
  };
}

function removeTMTFData(data) {
  return {
    type: 'REMOVE_TICK_DATA_TMTF',
    payload: ''
  };
}

function addTickDataYTC(data) {
  //alert(JSON.stringify(data));
  return {
    type: 'ADD_DATA_SCOPE_YTC',
    payload: data
  };
}

function pivotDataYTC(data) {

  //debugger;
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA_YTC',
    payload: data
  };
}

function removePlotdatatestYTC(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_YTC',
    payload: ''
  };
}

function pivotDataYTC4H(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'PLOT_PIVOT_DATA_YTC_4H',
    payload: data
  };
}

function removePlotdatatestYTC4H(data) {
  // alert(JSON.stringify(data));
  return {
    type: 'REMOVE_PLOT_PIVOT_DATA_YTC_4H',
    payload: ''
  };
}

function removeTickDataYTC(data) {
  return {
    type: 'REMOVE_TICK_DATA_YTC',
    payload: ''
  };
}