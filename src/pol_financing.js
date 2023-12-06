import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
require( 'datatables.net' )( window, $ )
require( 'datatables.net-dt' )( window, $ )

import underscore from 'underscore';
window.underscore = underscore;
window._ = underscore;

import '../public/vendor/js/popper.min.js'
import '../public/vendor/js/bootstrap.min.js'
import { csv } from 'd3-request'
import { json } from 'd3-request'

import '../public/vendor/css/bootstrap.min.css'
import '../public/vendor/css/dc.css'
import '/scss/main.scss';

import Vue from 'vue';
import Loader from './components/Loader.vue';
import ChartHeader from './components/ChartHeader.vue';


// Data object - is also used by Vue

var vuedata = {
  page: 'polfinancing',
  loader: true,
  showInfo: true,
  showShare: true,
  chartMargin: 40,
  selectedMandate: 'all',
  incomeCategories: {
    'donations': ['finančný dar', 'bezodplatné plnenie', 'nepeňažný dar', 'členský príspevok', 'členský p. - hlas ľudu', 'členský p. - hlas ľudu (hotovosť)'],
    'loans': ['pôžička', 'úver']
  },
  incomeTypeThresholds: {
    'donations': 10000,
    'loans': 100000
  },
  selectedIncomeType: 'donations',
  yearRanges: ['2020-2023', '2016-2020', '2012-2016', '2010-2012', '2006-2010', '2002-2006'],
  selectedYearRange: '',
  charts: {
    yearsRange: {
      title: 'Rozpätie rokov (volebné cykly)',
      info: 'Donations by year ranges'
    },
    party: {
      title: 'Politické strany',
      info: 'Parties by donations amount'
    },
    donors: {
      title: 'Najväčší donori',
      titleLoans: 'Najväčší veritelia',
      info: 'Top donors'
    },
    type: {
      title: 'Typ plnenia',
      info: 'Income type'
    },
    years: {
      title: 'Roky',
      info: 'Donations by year'
    },
    hasFlags: {
      title: 'S príznakom',
      info: 'Share of entries flagged with risk indicators'
    },
    flags: {
      title: 'Rizikové príznaky',
      info: 'Risk indicator types'
    },
    table: {
      chart: null,
      type: 'table',
      title: 'Finančné plnenia',
      info: ''
    }
  },
  selectedEl: {"Name": ""},
  colors: {
    default: "#009fe2",
    flag: "#bf1b36",
    range: ["#62aad9", "#3b95d0", "#1a6da3", "#085c9c", "#e3b419", "#e39219", "#de7010"],
    colorSchemeCloud: ["#62aad9", "#3b95d0", "#b7bebf", "#1a6da3", "#e3b419", "#e39219", "#de7010"],
    numPies: {
      "0": "#ddd",
      "1": "#ff516a",
      "2": "#f43461",
      "3": "#e51f5c",
      "4": "#d31a60",
      ">5": "#bb1d60"
    }
  }
}

//Set vue components and Vue app

Vue.component('chart-header', ChartHeader);
Vue.component('loader', Loader);

new Vue({
  el: '#app',
  data: vuedata,
  methods: {
    //Share
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Integrity Watch Slovakia ' + thisPage;
        var shareURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
        window.open(shareURL, '_blank');
        return;
      }
      if(platform == 'facebook'){
        //var toShareUrl = window.location.href.split('?')[0];
        var toShareUrl = 'https://integritywatch.sk';
        var shareURL = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(toShareUrl);
        window.open(shareURL, '_blank', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250,top=300,left=300');
        return;
      }
    }
  }
});

//Initialize info popovers
$(function () {
  $('[data-toggle="popover"]').popover()
})


//Charts

var charts = {
  yearsRange: {
    chart: dc.rowChart("#yearsrange_chart"),
    type: 'row',
    divId: 'yearsrange_chart'
  },
  party: {
    chart: dc.rowChart("#party_chart"),
    type: 'row',
    divId: 'party_chart'
  },
  donors: {
    chart: dc.rowChart("#donors_chart"),
    type: 'row',
    divId: 'donors_chart'
  },
  type: {
    chart: dc.pieChart("#type_chart"),
    type: 'pie',
    divId: 'type_chart'
  },
  years: {
    chart: dc.barChart("#years_chart"),
    type: 'bar',
    divId: 'years_chart'
  },
  hasFlags: {
    chart: dc.pieChart("#hasflags_chart"),
    type: 'pie',
    divId: 'hasflags_chart'
  },
  flags: {
    chart: dc.rowChart("#flags_chart"),
    type: 'row',
    divId: 'flags_chart'
  },
  table: {
    chart: null,
    type: 'table',
    divId: 'dc-data-table'
  }
}

//Functions for responsivness
var recalcWidth = function(divId) {
  return document.getElementById(divId).offsetWidth - vuedata.chartMargin;
};
var recalcWidthWordcloud = function() {
  //Replace element if with wordcloud column id
  var width = document.getElementById("wordcloud_chart_col").offsetWidth - vuedata.chartMargin*2;
  return [width, 410];
};
var recalcCharsLength = function(width) {
  return parseInt(width / 8);
};
var calcPieSize = function(divId) {
  var newWidth = recalcWidth(divId);
  var sizes = {
    'width': newWidth,
    'height': 0,
    'radius': 0,
    'innerRadius': 0,
    'cy': 0,
    'legendY': 0
  }
  if(newWidth < 300) { 
    sizes.height = newWidth + 170;
    sizes.radius = (newWidth)/2;
    sizes.innerRadius = (newWidth)/4;
    sizes.cy = (newWidth)/2;
    sizes.legendY = (newWidth) + 30;
  } else {
    sizes.height = newWidth*0.75 + 170;
    sizes.radius = (newWidth*0.75)/2;
    sizes.innerRadius = (newWidth*0.75)/4;
    sizes.cy = (newWidth*0.75)/2;
    sizes.legendY = (newWidth*0.75) + 30;
  }
  return sizes;
};
var resizeGraphs = function() {
  for (var c in charts) {
    var sizes = calcPieSize(charts[c].divId);
    var newWidth = recalcWidth(charts[c].divId);
    var charsLength = recalcCharsLength(newWidth);
    if(charts[c].type == 'row'){
      charts[c].chart.width(newWidth);
      charts[c].chart.label(function (d) {
        var thisKey = d.key;
        if(thisKey.indexOf('###') > -1){
          thisKey = thisKey.split('###')[0];
        }
        if(thisKey.length > charsLength){
          return thisKey.substring(0,charsLength) + '...';
        }
        return thisKey;
      })
      charts[c].chart.redraw();
    } else if(charts[c].type == 'bar') {
      charts[c].chart.width(newWidth);
      charts[c].chart.rescale();
      charts[c].chart.redraw();
    } else if(charts[c].type == 'pie') {
      charts[c].chart
        .width(sizes.width)
        .height(sizes.height)
        .cy(sizes.cy)
        .innerRadius(sizes.innerRadius)
        .radius(sizes.radius)
        .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(true).legendWidth(sizes.width));
        //.legend(dc.legend().x(0).y(sizes.legendY).gap(10));
      charts[c].chart.redraw();
    } else if(charts[c].type == 'cloud') {
      charts[c].chart.size(recalcWidthWordcloud());
      charts[c].chart.redraw();
    }
  }
};

var locale = d3.formatLocale({
  decimal: ",",
  thousands: " ",
  grouping: [3]
});

//Add commas to thousands
/*
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return x;
}
*/
//Apply comma as decimal separator and dot as thousands separator
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return x;
}
//Custom date order for dataTables
var dmy = d3.timeParse("%d/%m/%Y");
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "date-eu-pre": function (date) {
    if(date.indexOf("Cancelled") > -1){
      date = date.split(" ")[0];
    }
      return dmy(date);
  },
  "date-eu-asc": function (a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "date-eu-desc": function ( a, b ) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "amt-pre": function (amt) {
    amt = amt.toString();
    amt = parseFloat(amt.replace('.','').replace(',','.'));
    if(isNaN(amt)) { return -1; }
    return amt;
  },
  "amt-asc": function (a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "amt-desc": function ( a, b ) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Custom ordering for flag images
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "flags-pre": function (a) {
    var flagsCount = a.split('.png').length - 1;
    return parseFloat(flagsCount);
  },
  "flags-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "flags-desc": function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Custom ordering for start and end dates
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "meeting-time-pre": function (a) {
    var monthToNum = {
      "ianuarie": "01",
      "februarie": "02",
      "martie": "03",
      "aprilie": "04",
      "mai": "05",
      "iunie": "06",
      "iulie": "07",
      "august": "08",
      "septembrie": "09",
      "octombrie": "10",
      "noiembrie": "11",
      "decembrie": "12"
    }
    //Turn datetime string into int
    var datetimeSplit = a.split('@');
    var timeStr = datetimeSplit[1].trim().replace(':','');
    if(timeStr.length == 3) { timeStr = "0"+timeStr; }
    var dateSplit = datetimeSplit[0].split(' ');
    var y = dateSplit[2];
    var m = monthToNum[dateSplit[1]];
    var d = dateSplit[0];
    if(d.length == 1) { d = "0"+d; }
    var datetimeString = y+m+d+timeStr;
    return parseInt(datetimeString);
  },
  "meeting-time-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "meeting-time-desc": function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Get URL parameters
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/*
var urlYear = getParameterByName('y');
if(urlYear && vuedata.yearRanges.indexOf(urlYear) > -1) {
  vuedata.selectedYearRange = urlYear;
} else {
  vuedata.selectedYearRange = '2020-2023';
}
*/

var urlCat = getParameterByName('c');
if(urlCat && vuedata.incomeCategories[urlCat]) {
  vuedata.selectedIncomeType = urlCat;
} else {
  vuedata.selectedIncomeType = 'donations';
}
console.log(vuedata.incomeCategories);
console.log(vuedata.selectedIncomeType);

//Load data and generate charts
//Generate random parameter for dynamic dataset loading (to avoid caching)

var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

//Prepare possible years list
var yearsList = [];
for (let i = 2000; i < 2030; i++) {
  yearsList.push(i);
}
//Donors donations total per year
var donorsTotals = {};
//Totals for footer counters
var totalDonationsAmt = 0;

json('./data/political_financing.json?' + randomPar, (err, donations) => {
  //Parse data
  //var iniYear = parseInt(vuedata.selectedYearRange.split('-')[0]);
  //var endYear = parseInt(vuedata.selectedYearRange.split('-')[1]);
  /*
  var donations = _.filter(donations, function(i){ 
    return parseInt(i.year) >= iniYear 
    && parseInt(i.year) <= endYear 
    && vuedata.incomeCategories[vuedata.selectedIncomeType].indexOf(i.income_type.toLowerCase()) > -1;
  });
  */
  var donations = _.filter(donations, function(i){ 
    if(vuedata.selectedIncomeType == 'loans') {
      return i.name_lastname.toLowerCase().indexOf('banka') == -1 && i.company_name.toLowerCase().indexOf('banka') == -1 && vuedata.incomeCategories[vuedata.selectedIncomeType].indexOf(i.income_type.toLowerCase()) > -1;
    } else {
      return vuedata.incomeCategories[vuedata.selectedIncomeType].indexOf(i.income_type.toLowerCase()) > -1;
    }
  });

  _.each(donations, function (d, index) {
    d.entry_id = 'i' + index;
    d.amt_cleaned = parseFloat(d.amt_eur_converted.replace(' ', '').replace(' ', '').replace(',','.')).toFixed(2);
    d.amt_cleaned_charts = parseFloat(d.amt_eur_converted_clean);
    if(isNaN(d.amt_cleaned)) {
      d.amt_cleaned = 'N/A';
      d.amt_cleaned_charts = 0;
    }
    totalDonationsAmt += d.amt_cleaned_charts;
    d.donor_type = '';
    d.donor_name = '';
    if(d.name_lastname.length > 1 && d.company_name == '') {
      d.donor_type = 'person';
      d.donor_name = d.name_lastname;
    } else if (d.company_name.length > 1 && d.name_lastname == '') {
      d.donor_type = 'company';
      d.donor_name = d.company_name;
    }
    //Group some types for types chart
    d.income_type_chart = d.income_type;
    if(d.income_type_chart.toLowerCase() == 'členský p. - hlas ľudu' || d.income_type_chart.toLowerCase() == 'členský p. - hlas ľudu (hotovosť)') {
      d.income_type_chart = 'Členský príspevok';
    }
    
    //Get year if it's missing
    _.each(yearsList, function (y) {
      if(d.year == '' && d.date.includes(y)) {
        d.year = y;
      }
    });
    var yearInt = parseInt(d.year);
    d.yearRanges = [];
    if(yearInt >= 2002 && yearInt <= 2006) { d.yearRanges.push('2002-2006'); }
    if(yearInt >= 2006 && yearInt <= 2010) { d.yearRanges.push('2006-2010'); }
    if(yearInt >= 2010 && yearInt <= 2012) { d.yearRanges.push('2010-2012'); }
    if(yearInt >= 2012 && yearInt <= 2016) { d.yearRanges.push('2012-2016'); }
    if(yearInt >= 2016 && yearInt <= 2020) { d.yearRanges.push('2016-2020'); }
    if(yearInt >= 2020 && yearInt <= 2023) { d.yearRanges.push('2020-2023'); }
    //Clean income type
    d.income_type_cleaned = d.income_type_chart.charAt(0).toUpperCase() + d.income_type_chart.slice(1).toLowerCase();
    if(d.income_type_cleaned == '') { d.income_type_cleaned = 'N/A'; }
    //Add to donors total donations per year
    /*
    if(d.year != 'N/A') {
      if(!donorsTotals[d.donor_name]) { donorsTotals[d.donor_name] = {}; }
      if(!donorsTotals[d.donor_name][d.year]) { donorsTotals[d.donor_name][d.year] = 0; }
      donorsTotals[d.donor_name][d.year] += d.amt_cleaned_charts;
    }
    */
    //Add to donors total donations per years range
    /*
    if(d.year != 'N/A') {
      if(!donorsTotals[d.donor_name]) { donorsTotals[d.donor_name] = 0; }
      donorsTotals[d.donor_name] += d.amt_cleaned_charts;
    }
    */
    if(d.year != 'N/A') {
      if(!donorsTotals[d.donor_id]) { donorsTotals[d.donor_id] = 0; }
      donorsTotals[d.donor_id] += d.amt_cleaned_charts;
    }
  });
  //console.log(donorsTotals);
  //Flag data
  _.each(donations, function (d) {
    d.flags_computed = [];
    d.flags_computed_details = [];
    //Flag donations > 10k and cumulative yearly donations >10k
    if(vuedata.selectedIncomeType == 'loans') {
      if(d.amt_cleaned_charts >= vuedata.incomeTypeThresholds[vuedata.selectedIncomeType]) {
        d.flags_computed.push('High single amount loan');
        d.flags_computed_details.push('High single amount loan');
      } else if(d.year != 'N/A' && d.donor_id !== '') { 
        if(donorsTotals[d.donor_id] >= vuedata.incomeTypeThresholds[vuedata.selectedIncomeType]) {
          d.flags_computed.push('High cumulative loans');
          d.flags_computed_details.push('High cumulative loans (' + donorsTotals[d.donor_id]+ ')');
        }
      } 
    } else {
      if(d.amt_cleaned_charts >= vuedata.incomeTypeThresholds[vuedata.selectedIncomeType]) {
        d.flags_computed.push('High single amount donation');
        d.flags_computed_details.push('High single amount donation');
      } else if(d.year != 'N/A' && d.donor_id !== '') { 
        if(donorsTotals[d.donor_id] >= vuedata.incomeTypeThresholds[vuedata.selectedIncomeType]) {
          d.flags_computed.push('High cumulative donations');
          d.flags_computed_details.push('High cumulative donations (' + donorsTotals[d.donor_id]+ ')');
        }
      }
    }
    //Add donor total donations to entry
    //d.donorsTotal = donorsTotals[d.donor_name];
    d.donorsTotal = donorsTotals[d.donor_id];
  });

  //Set totals for footer counters
  $('.count-box-donationsamt .total-count-donationsamt').text('€ ' + addcommas(totalDonationsAmt.toFixed(2)));

  //Set dc main vars
  var ndx = crossfilter(donations);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = "" + d.party + " " + d.name_lastname + " " + d.company_name + " " + d.city + " " + d.donor_id;
      return entryString.toLowerCase();
  });

  //CHART 0 - Year ranges
  var createYearsRangeChart = function() {
    var chart = charts.yearsRange.chart;
    var dimension = ndx.dimension(function (d) {
        return d.yearRanges;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_cleaned_charts;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(20).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.yearsRange.divId);
    var charsLength = recalcCharsLength(width);
    var order = ['2020-2023', '2016-2020', '2012-2016', '2010-2012', '2006-2010', '2002-2006'];
    chart
      .width(width)
      .height(450)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .ordering(function(d){return order.indexOf(d.key);})
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + addcommas(d.value.toFixed(2)) + ' €';
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //CHART 1 - Parties
  var createPartyChart = function() {
    var chart = charts.party.chart;
    var dimension = ndx.dimension(function (d) {
        return d.party;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_cleaned_charts;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(30).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.party.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(470)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value.toFixed(2) + ' €';
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //CHART 2 - Donors
  var createDonorsChart = function() {
    var chart = charts.donors.chart;
    var dimension = ndx.dimension(function (d) {
        return d.donor_name;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_cleaned_charts;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(10).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.donors.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(470)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + addcommas(d.value.toFixed(2)) + ' €';
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

   //CHART 3 - TYPE
   var createTypeChart = function() {
    var chart = charts.type.chart;
    var dimension = ndx.dimension(function (d) {
      return d.income_type_cleaned;
    });
    var group = dimension.group().reduceSum(function (d) { return d.amt_cleaned_charts; });
    var sizes = calcPieSize(charts.type.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(7)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(true).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + addcommas(d.value.toFixed(2)) + ' €';
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .colorCalculator(function(d, i) {
        if(d.key == "Others" || d.key == 'N/A') {
          return "#ddd";
        }
        return vuedata.colors.range[i];
      })
      .group(group);

    chart.render();
  }

   //CHART 4 - Years
   var createYearsChart = function() {
    var chart = charts.years.chart;
    var dimension = ndx.dimension(function (d) {
        if(isNaN(d.year)) { return ''; }
        return d.year;
    });
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_cleaned_charts;
    });
    var width = recalcWidth(charts.years.divId);
    chart
      .width(width)
      .height(380)
      .group(group)
      .dimension(dimension)
      .on("preRender",(function(chart,filter){
      }))
      .margins({top: 0, right: 10, bottom: 20, left: 60})
      .x(d3.scaleBand())
      .xUnits(dc.units.ordinal)
      .gap(10)
      .elasticY(true)
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + addcommas(d.value.toFixed(2)) + ' €';
      })
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      });
    chart.render();
  }

  //CHART 5 - HAS FLAGS
  var createHasFlagsChart = function() {
    var chart = charts.hasFlags.chart;
    var dimension = ndx.dimension(function (d) {
      if(d.flags_computed.length > 0) {
        return 'Yes';
      }
      return 'No';
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.hasFlags.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(7)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(true).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + addcommas(d.value.toFixed(2)) + ' €';
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .colorCalculator(function(d, i) {
        if(d.key == "No") {
          return vuedata.colors.default;
        }
        return vuedata.colors.flag;
      })
      .group(group);

    chart.render();
  }

  //CHART 5 - Flags
  var createFlagsChart = function() {
    var chart = charts.flags.chart;
    var dimension = ndx.dimension(function (d) {
        //return d.flags;
        return d.flags_computed;
        /*
        if(d.flags.length == 0) { return 'No red flags'; }
        else {
          if(d.flags.indexOf('high_single_amt') > -1) {
            return 'Donation > € 10k';
          } else if(d.flags.indexOf('high_cumulative_amt') > -1) {
            return 'Donations by same donor in a year > € 10k';
          }
        }
        */
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(30).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.flags.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(380)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .gap(55)
      .colorCalculator(function(d, i) {
        if(d.key == 'No red flags') {
          return vuedata.colors.default;
        } else {
          return vuedata.colors.flag;
        }
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value + ' donations';
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //TABLE
  var createTable = function() {
    var count=0;
    charts.table.chart = $("#dc-data-table").dataTable({
      "columnDefs": [
        {
          "searchable": false,
          "orderable": false,
          "targets": 0,   
          data: function ( row, type, val, meta ) {
            return count;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 1,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.year;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.donor_name;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.party;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.city;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.income_type;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "type": "amt",
          "data": function(d) {
            if(isNaN(d.amt_cleaned)) { return 'N/A'; }
            return addcommas(d.amt_cleaned);
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 7,
          "defaultContent":"N/A",
          "data": function(d) {
            if(d.is_public_partner) {
              return 'Yes (Partner)';
            } else if (d.is_public_partner_bo) {
              return 'Yes (Beneficial owner)';
            }
            return '/';
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 8,
          "defaultContent":"N/A",
          "type": "amt",
          "data": function(d) {
            if(isNaN(d.donorsTotal)) { return 'N/A'; }
            return addcommas(d.donorsTotal.toFixed(2));
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 9,
          "defaultContent":"N/A",
          "className": "dt-body-center",
          "type": "flags",
          "data": function(d) {
            var flagsOutput = "";
            for (let i = 0; i < d.flags.length; i++) {
              flagsOutput += "<img src='./images/greyflag.png' class='redflag-img'>";
            }
            return flagsOutput;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 10,
          "defaultContent":"N/A",
          "className": "dt-body-center",
          "type": "flags",
          "data": function(d) {
            var flagsOutput = "";
            for (let i = 0; i < d.flags_computed.length; i++) {
              flagsOutput += "<img src='./images/greyflag.png' class='redflag-img'>";
            }
            return flagsOutput;
          }
        }
      ],
      "iDisplayLength" : 25,
      "bPaginate": true,
      "bLengthChange": true,
      "bFilter": false,
      "order": [[ 5, "desc" ]],
      "bSort": true,
      "bInfo": true,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": searchDimension.top(Infinity),
      "bDestroy": true,
    });
    var datatable = charts.table.chart;
    datatable.on( 'draw.dt', function () {
      var PageInfo = $('#dc-data-table').DataTable().page.info();
        datatable.DataTable().column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
      });
      datatable.DataTable().draw();

    $('#dc-data-table tbody').on('click', 'tr', function () {
      var data = datatable.DataTable().row( this ).data();
      vuedata.selectedEl = data;
      console.log(vuedata.selectedEl);
      $('#detailsModal').modal();
    });
  }
  //REFRESH TABLE
  function RefreshTable() {
    dc.events.trigger(function () {
      var alldata = searchDimension.top(Infinity);
      charts.table.chart.fnClearTable();
      charts.table.chart.fnAddData(alldata);
      charts.table.chart.fnDraw();
    });
  }

  //SEARCH INPUT FUNCTIONALITY
  var typingTimer;
  var doneTypingInterval = 1000;
  var $input = $("#search-input");
  $input.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  });
  $input.on('keydown', function () {
    clearTimeout(typingTimer);
  });
  function doneTyping () {
    var s = $input.val().toLowerCase();
    searchDimension.filter(function(d) { 
      return d.indexOf(s) !== -1;
    });
    throttle();
    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
          dc.redrawAll();
      }, 250);
    }
  }

  //Set word for wordcloud
  var setword = function(wd) {
    //console.log(charts.subject.chart);
    $("#search-input").val(wd);
    var s = wd.toLowerCase();
    searchDimension.filter(function(d) { 
      return d.indexOf(s) !== -1;
    });
    throttle();
    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
          dc.redrawAll();
      }, 250);
    }
  }

  //Reset charts
  var resetGraphs = function() {
    for (var c in charts) {
      if(charts[c].type !== 'table' && charts[c].chart.hasFilter()){
        charts[c].chart.filterAll();
      }
    }
    searchDimension.filter(null);
    $('#search-input').val('');
    dc.redrawAll();
  }
  $('.reset-btn').click(function(){
    resetGraphs();
  })
  
  //Render charts
  createYearsRangeChart();
  createPartyChart();
  createDonorsChart();
  createTypeChart();
  createYearsChart();
  createHasFlagsChart();
  createFlagsChart();
  createTable();

  $('.dataTables_wrapper').append($('.dataTables_length'));

  //Hide loader
  vuedata.loader = false;

  //COUNTERS
  //Main counter
  var all = ndx.groupAll();
  var counter = dc.dataCount('.dc-data-count')
    .dimension(ndx)
    .group(all)
    .formatNumber(locale.format(",d"));
  counter.render();
  counter.on("renderlet.resetall", function(c) {
    RefreshTable();
  });

  //Custom counters
  function drawDonationsCounter() {
    var dim = ndx.dimension (function(d) {
      if (!d.entry_id) {
        return "";
      } else {
        return d.entry_id;
      }
    });
    var group = dim.group().reduce(
      function(p,d) {  
        p.nb +=1;
        if (!d.amt_cleaned_charts) {
          return p;
        }
        p.donationsTot = +d.amt_cleaned_charts;
        return p;
      },
      function(p,d) {  
        p.nb -=1;
        if (!d.amt_cleaned_charts) {
          return p;
        }
        p.donationsTot = -d.amt_cleaned_charts;
        return p;
      },
      function(p,d) {  
        return {nb: 0, donationsTot:0}; 
      }
    );
    group.order(function(p){ return p.nb });
    var donationsTot = 0;
    var counter = dc.dataCount(".count-box-donationsamt")
    .dimension(group)
    .group({value: function() {
      return group.all().filter(function(kv) {
        if (kv.value.nb >0) {
          donationsTot += +kv.value.donationsTot;
        }
        return kv.value.nb > 0; 
      }).length;
    }})
    .renderlet(function (chart) {
      $(".donationsamt").text('€ ' + addcommas(donationsTot.toFixed(2)));
      donationsTot=0;
    });
    counter.render();
  }
  drawDonationsCounter();

  //Window resize function
  window.onresize = function(event) {
    resizeGraphs();
  };

});
