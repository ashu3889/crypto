'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _redux = require('redux');

var _tickdata = require('./tickdata.js');

var _tickdata2 = _interopRequireDefault(_tickdata);

var _plotdata = require('./plotdata.js');

var _plotdata2 = _interopRequireDefault(_plotdata);

var _ltf_tick = require('./ltf_tick.js');

var _ltf_tick2 = _interopRequireDefault(_ltf_tick);

var _daily_tick = require('./daily_tick.js');

var _daily_tick2 = _interopRequireDefault(_daily_tick);

var _hourly_tick = require('./hourly_tick.js');

var _hourly_tick2 = _interopRequireDefault(_hourly_tick);

var _ltf_plot = require('./ltf_plot.js');

var _ltf_plot2 = _interopRequireDefault(_ltf_plot);

var _daily_plot = require('./daily_plot.js');

var _daily_plot2 = _interopRequireDefault(_daily_plot);

var _hourly_plot = require('./hourly_plot.js');

var _hourly_plot2 = _interopRequireDefault(_hourly_plot);

var _tmtf_tick = require('./tmtf_tick.js');

var _tmtf_tick2 = _interopRequireDefault(_tmtf_tick);

var _tmtf_plot = require('./tmtf_plot.js');

var _tmtf_plot2 = _interopRequireDefault(_tmtf_plot);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _tickdata_ytc = require('./tickdata_ytc.js');

var _tickdata_ytc2 = _interopRequireDefault(_tickdata_ytc);

var _plotdata_ytc = require('./plotdata_ytc.js');

var _plotdata_ytc2 = _interopRequireDefault(_plotdata_ytc);

var _plotdata_ytc_4h = require('./plotdata_ytc_4h.js');

var _plotdata_ytc_4h2 = _interopRequireDefault(_plotdata_ytc_4h);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createStoreWithMiddleware = (0, _redux.applyMiddleware)(_reduxThunk2.default)(_redux.createStore);

var rootreducer = (0, _redux.combineReducers)({
	tickData: _tickdata2.default,
	plData: _plotdata2.default,
	dailyTick: _daily_tick2.default,
	dailyPlot: _daily_plot2.default,
	hourlyTick: _hourly_tick2.default,
	hourlyPlot: _hourly_plot2.default,
	ltfTick: _ltf_tick2.default,
	ltfPlot: _ltf_plot2.default,
	tmtfTick: _tmtf_tick2.default,
	tmtfPlot: _tmtf_plot2.default,
	tickDataYTC: _tickdata_ytc2.default,
	plDataYTC: _plotdata_ytc2.default,
	plDataYTC4H: _plotdata_ytc_4h2.default
});

// const rootReducer =combineReducers({
// 	physics : physics,
// 	chemis,
// 	bilogy
// })

var persistedstate = {
	tickData: [],
	plData: [],
	dailyTick: [],
	dailyPlot: [],
	hourlyTick: [],
	hourlyPlot: [],
	ltfTick: [],
	ltfPlot: [],
	tmtfTick: [],
	tmtfPlot: [],
	tickDataYTC: [],
	plDataYTC: [],
	plDataYTC4H: []
};

var store = createStoreWithMiddleware(rootreducer, persistedstate, /* preloadedState, */
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

//console.log(store.getstate());

exports.default = store;

// var a = {"t":[1580376300],"c":[52.650001525879],"o":[52.619998931885],"h":[52.700000762939],"l":[52.619998931885],"v":["n\/a"],"s":"ok"};

// var e = [];

// Object.values(a)[0].map((val, index) => {

// var f = {};
// f['Local time']  = new Date(Object.values(a)[0][index]);
// f["Open"] = Object.values(a)[2][index];
// f["High"] = Object.values(a)[3][index];
// f["Low"] = Object.values(a)[4][index];
// f["Close"] = Object.values(a)[1][index];
// e.push(f);

// })

// console.log(e);