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
  page: 'publicsector',
  loader: true,
  showInfo: true,
  showShare: true,
  chartMargin: 40,
  selectedMandate: 'all',
  charts: {
    topDonorsDirect: {
      title: 'Najväčší darcovia',
      info: 'Top donors by amount of donations, only including the donations made directly by the public sector partner.'
    },
    topDonorsAll: {
      title: 'Najväčší darcovia (Direct + BO)',
      info: 'Top donors by amount of donations, including both the donations made directly by the public sector partner and its beneficial owners.'
    },
    type: {
      title: 'Typ osoby',
      info: 'Forma Osoby'
    },
    legal: {
      title: 'Právna forma',
      info: 'Pravna Forma'
    },
    boNum: {
      title: 'Koneční užívatelia výhod',
      info: 'Number of Beneficial Owners'
    },
    topBo: {
      title: 'Top Beneficial Owners by number of entities',
      info: 'Top Beneficial Owners by number of entities'
    },
    typeDon: {
      title: 'Typ príspevku',
      info: 'Type of donations made directly by the entity'
    },
    parties: {
      title: 'Strany podľa počtu príspevkov',
      info: 'Parties by number of donations made directly by the entity'
    },
    table: {
      chart: null,
      type: 'table',
      title: 'Public sector partners',
      info: 'Lorem ipsum'
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
  topDonorsDirect: {
    chart: dc.rowChart("#topdonorsdirect_chart"),
    type: 'row',
    divId: 'topdonorsdirect_chart'
  },
  /*
  topDonorsAll: {
    chart: dc.rowChart("#topdonorsall_chart"),
    type: 'row',
    divId: 'topdonorsall_chart'
  },
  */
  type: {
    chart: dc.pieChart("#type_chart"),
    type: 'pie',
    divId: 'type_chart'
  },
  legal: {
    chart: dc.pieChart("#legal_chart"),
    type: 'pie',
    divId: 'legal_chart'
  },
  boNum: {
    chart: dc.pieChart("#bonum_chart"),
    type: 'pie',
    divId: 'bonum_chart'
  },
  /*
  topBo: {
    chart: dc.rowChart("#topbo_chart"),
    type: 'row',
    divId: 'topbo_chart'
  },
  */
  typeDon: {
    chart: dc.pieChart("#typedon_chart"),
    type: 'pie',
    divId: 'typedon_chart'
  },
  parties: {
    chart: dc.rowChart("#parties_chart"),
    type: 'row',
    divId: 'parties_chart'
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
        .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width));
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
  thousands: ".",
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

//Load data and generate charts
//Generate random parameter for dynamic dataset loading (to avoid caching)

var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

json('./data/orgs_with_donations.json?' + randomPar, (err, partners) => {
  var totDirectDonations = 0;
  //Parse data
  _.each(partners, function (d) {
    d.entityName = '';
    if(d.ObchodneMeno) {
      d.entityName = d.ObchodneMeno;
    } else if(d.Priezvisko) {
      d.entityName = d.Meno + ' ' + d.Priezvisko;
    }
    d.legalForm = 'N/A';
    if(d.PravnaForma && d.PravnaForma.Meno) {
      d.legalForm = d.PravnaForma.Meno;
    }
    d.donationsTypes = [];
    d.amt_direct_donations = 0;
    d.amt_bo_donations = 0;
    d.partiesDonationsNum = [];
    _.each(d.donations, function (don) {
      d.partiesDonationsNum.push(don.party);
      if(don.donor_type == 'bo') {
        d.amt_bo_donations += don.amt_eur_converted_clean;
      } else if (don.donor_type == 'public sector partner') {
        d.amt_direct_donations += don.amt_eur_converted_clean;
        if(don.income_type == '') { d.donationsTypes.push('N/A'); }
        else {d.donationsTypes.push(don.income_type);}
      }
    });
    _.each(d.partnerIdentities, function (p) {
      p.cityPsc = '';
      if(d.Adresa && d.Adresa.Mesto && d.Adresa.Psc) {
        p.cityPsc = d.Adresa.Mesto + ' - ' + d.Adresa.Psc;
      } else if(d.Adresa && d.Adresa.Mesto) {
        p.cityPsc = d.Adresa.Mesto;
      } else if(d.Adresa && d.Adresa.Psc) {
        p.cityPsc = d.Adresa.Psc;
      }
    });
    d.boNames = [];
    _.each(d.KonecniUzivateliaVyhod, function (bo) {
      if(bo.Meno && bo.Priezvisko) {
        var boName = bo.Meno + ' ' + bo.Priezvisko;
        if(bo.TitulPred && bo.TitulPred !== '') {
          boName = bo.TitulPred + ' ' + boName;
        }
        if(bo.TitulZa && bo.TitulZa !== '') {
          boName = boName + ' ' + bo.TitulZa;
        }
        bo.fullName = boName;
        d.boNames.push(boName);
      } else {
        console.log(bo);
      }
    });
    //Beneficial owners range
    d.boRange = 'N/A';
    d.boNum = d.KonecniUzivateliaVyhod.length;
    if(d.boNum || d.boNum == 0) {
      if(d.boNum == 0) {
        d.boRange = '0';
      } else if(d.boNum < 3) {
        d.boRange = '1 - 2';
      } else if(d.boNum < 6) {
        d.boRange = '3 - 5';
      } else if(d.boNum < 11) {
        d.boRange = '6 - 10';
      } else {
        d.boRange = '> 10';
      }
    }
    totDirectDonations += d.amt_direct_donations;
  });

  //Set totals for custom counters
  $('.count-box-donationsamt .total-count-donationsamt').html(totDirectDonations.toFixed(2));

  //Set dc main vars
  var ndx = crossfilter(partners);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = "" + d.Ico + " " + d.entityName;
      return entryString.toLowerCase();
  });

  //CHART 1 - LEGAL
  var createLegalChart = function() {
    var chart = charts.legal.chart;
    var dimension = ndx.dimension(function (d) {
      return d.legalForm;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.legal.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(7)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + d.value + ' entities';
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .colorCalculator(function(d, i) {
        if(d.key == "Others") {
          return "#ddd";
        }
        if(d.key == 'N/A') {
          return "#bbb";
        }
        return vuedata.colors.range[i];
      })
      .group(group);

    chart.render();
  }

  //CHART 2 - Top donors direct
  var createTopDonorsDirectChart = function() {
    var chart = charts.topDonorsDirect.chart;
    var dimension = ndx.dimension(function (d) {
        return d.entityName;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_direct_donations;
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
    var width = recalcWidth(charts.topDonorsDirect.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(470)
      .margins({top: 0, left: 0, right: 20, bottom: 20})
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

  //CHART 3 - Top donors all
  var createTopDonorsAllChart = function() {
    var chart = charts.topDonorsAll.chart;
    var dimension = ndx.dimension(function (d) {
        return d.entityName;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
        return d.amt_direct_donations + d.amt_bo_donations;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(15).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.topDonorsAll.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(530)
      .margins({top: 0, left: 0, right: 20, bottom: 20})
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

  //CHART 4 - TYPE
  var createTypeChart = function() {
    var chart = charts.type.chart;
    var dimension = ndx.dimension(function (d) {
      return d.FormaOsoby;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.type.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(7)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + d.value + ' entities';
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .colorCalculator(function(d, i) {
        if(d.key == "Others") {
          return "#ddd";
        }
        if(d.key == 'N/A') {
          return "#aaa";
        }
        return vuedata.colors.range[i];
      })
      .group(group);

    chart.render();
  }

  //CHART 5 - Number of beneficial owners
  var createBoNumChart = function() {
    var chart = charts.boNum.chart;
    var dimension = ndx.dimension(function (d) {
      return d.boRange;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.boNum.divId);
    var order = ["N/A", "0", "1 - 2", "3 - 5", "6 - 10", "> 10"];
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .ordering(function(d) { return order.indexOf(d.key)})
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        return d.key + ': ' + d.value + ' entities';
      })
      .dimension(dimension)
      //.ordinalColors(vuedata.colors.range)
      .group(group)
      .colorCalculator(function(d, i) {
        if(d.key == "Others" || d.key == "N/A") {
          return "#ddd";
        }
        return vuedata.colors.range[i];
      });
    chart.render();
  }

  //CHART 6 - Top bo
  var createTopBoChart = function() {
    var chart = charts.topBo.chart;
    var dimension = ndx.dimension(function (d) {
        return d.boNames;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(15).filter(function(d) {
            return true;
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.topBo.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(450)
      .margins({top: 0, left: 0, right: 20, bottom: 20})
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
          return d.key + ': ' + d.value + ' entities';
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //CHART 7 - TYPE DONATION/LOAN
  var createTypeDonChart = function() {
    var chart = charts.typeDon.chart;
    var dimension = ndx.dimension(function (d) {
      return d.donationsTypes;
    }, true);
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.typeDon.divId);
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .cap(7)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey.length > 40){
          return thisKey.substring(0,40) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        var thisKey = d.key;
        return thisKey + ': ' + addcommas(d.value.toFixed(0)) + ' donations/loans';
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

  //CHART 8 - PARTIES
  var createPartiesChart = function() {
    var chart = charts.parties.chart;
    var dimension = ndx.dimension(function (d) {
        return d.partiesDonationsNum;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
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
    var width = recalcWidth(charts.parties.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(470)
      .margins({top: 0, left: 0, right: 20, bottom: 20})
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
            return d.entityName;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.Ico;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.FormaOsoby;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.legalForm;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.KonecniUzivateliaVyhod.length;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.amt_direct_donations.toFixed(2);
          }
        }
        /*
        {
          "searchable": false,
          "orderable": true,
          "targets": 7,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.amt_bo_donations.toFixed(2);
          }
        }
        */
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
      //console.log(vuedata.selectedEl);
      $('#detailsModal').modal();
      InitializeIdentityModalTable();
      InitializeDonationsModalTable();
      InitializeBoModalTable();
    });
  }

  function InitializeIdentityModalTable() {
    var dTable = $("#modalTableIdentity");
      dTable.DataTable ({
        "data" : vuedata.selectedEl.partnerIdentities,
        "destroy": true,
        "search": true,
        "pageLength": 10,
        "dom": '<<t>pi>',
        "order": [[ 4, "desc" ]],
        "columns" : [
          { "data" : function(a) { 
              if(a.ObchodneMeno && a.ObchodneMeno.length > 0) { return a.ObchodneMeno; }
              else if(a.Priezvisko && a.Priezvisko.length > 0) { return a.Meno + ' ' + a.Priezvisko; }
              return "N/A";
            }
          },
          { "type": "date-custom",
            "data" : function(a) { 
              if(a.Ico) { return a.Ico; }
              return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.cityPsc) { return a.cityPsc; }
            return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.PravnaForma) { return a.PravnaForma; }
            return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.PlatnostOd) { return a.PlatnostOd.split('T')[0]; }
            return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.PlatnostDo) { return a.PlatnostDo.split('T')[0]; }
            return "N/A";
            }
          }
        ]
      });
  }

  function InitializeDonationsModalTable() {
    var dTable = $("#modalTableDonations");
      dTable.DataTable ({
        "data" : vuedata.selectedEl.donations,
        "destroy": true,
        "search": true,
        "pageLength": 10,
        "dom": '<<t>pi>',
        "order": [[ 0, "desc" ]],
        "columns" : [
          { "data" : function(a) { 
              if(a.name_lastname && a.name_lastname.length > 0) { return a.name_lastname; }
              else if(a.company_name && a.company_name.length > 0) { return a.company_name; }
              return "N/A";
            }
          },
          { "type": "date-custom",
            "data" : function(a) { 
              if(a.party) { return a.party; }
              return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.income_type) { return a.income_type; }
            return "N/A";
            }
          },
          { "data" : function(a) { 
              if(a.amt_eur_converted_clean) { return '€ ' + a.amt_eur_converted_clean; }
              return "N/A";
            } 
          },
          { "data" : function(a) { 
            if(a.date_clean) { return a.date_clean; }
            return "N/A";
            }
          }
        ]
      });
  }

  function InitializeBoModalTable() {
    var dTable = $("#modalTableBo");
      dTable.DataTable ({
        "data" : vuedata.selectedEl.KonecniUzivateliaVyhod,
        "destroy": true,
        "search": true,
        "pageLength": 10,
        "dom": '<<t>pi>',
        "order": [[ 0, "desc" ]],
        "columns" : [
          { "data" : function(a) { 
              if(a.fullName) { return a.fullName; }
              return "N/A";
            }
          },
          { "type": "date-custom",
            "data" : function(a) { 
              if(a.DatumNarodenia) { return a.DatumNarodenia.split('T')[0]; }
              return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.JeVerejnyCinitel) { return "Yes"; }
            return "No";
            }
          },
          { "data" : function(a) { 
            if(a.PlatnostOd) { return a.PlatnostOd.split('T')[0]; }
            return "N/A";
            }
          },
          { "data" : function(a) { 
            if(a.PlatnostDo) { return a.PlatnostDo.split('T')[0]; }
            return "N/A";
            }
          }
        ]
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
  createTopDonorsDirectChart();
  //createTopDonorsAllChart();
  createTypeChart();
  createLegalChart();
  createBoNumChart();
  //createTopBoChart();
  createTypeDonChart();
  createPartiesChart();
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
  function drawCustomCounters() {
    var dim = ndx.dimension (function(d) {
      return d.Id;
    });
    var group = dim.group().reduce(
      function(p,d) {  
        p.nb +=1;
        p.donations += parseFloat(d.amt_direct_donations);
        return p;
      },
      function(p,d) {  
        p.nb -=1;
        p.donations -= parseFloat(d.amt_direct_donations);
        return p;
      },
      function(p,d) {  
        return {nb: 0, donations: 0}; 
      }
    );
    group.order(function(p){ return p.nb });
    var donations = 0;
    var counter = dc.dataCount(".count-box-donationsamt")
    .dimension(group)
    .group({value: function() {
      donations = 0;
      return group.all().filter(function(kv) {
        if (kv.value.nb >0) {
          donations += +kv.value.donations;
        }
        return kv.value.nb > 0; 
      }).length;
    }})
    .renderlet(function (chart) {
      $(".donationsamt").text('€ ' + donations.toFixed(2));
    });
    counter.render();
  }
  drawCustomCounters();

  //Window resize function
  window.onresize = function(event) {
    resizeGraphs();
  };

});
