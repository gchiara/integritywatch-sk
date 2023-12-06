<html lang="en">
<head>
  <?php include 'gtag.php' ?>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Integrity Watch Slovakia</title>
  <meta property="og:url" content="https://integritywatch.sk" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Integrity Watch Slovakia" />
  <meta property="og:description" content="Integrity Watch Slovakia" />
  <meta property="og:image" content="https://integritywatch.sk/images/thumbnail.jpg" />
  <link rel='shortcut icon' type='image/x-icon' href='/favicon.ico' />
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,800" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Quicksand:500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800" rel="stylesheet">
  <link rel="stylesheet" href="fonts/oswald.css">
  <link rel="stylesheet" href="static/pol_financing.css?v=6">
</head>
<body>
    <div id="app" class="polfinancing-page">   
      <?php include 'header.php' ?>
      <!-- TOP AREA -->
      <div class="container-fluid top-description-container" v-if="showInfo">
        <div class="row">
          <div class="col-md-12 top-description-content">
            <div class="top-description-text">
              <h1>INTEGRITY WATCH SLOVAKIA | Financovanie politických strán</h1>
              <div class="top-description-tags" v-if="selectedIncomeType == 'donations'">Dary</div>
              <div class="top-description-tags" v-else="selectedIncomeType == 'loans'">Pôžičky</div>
              <h2>Prehľadná databáza financovania politických strán</h2>
              <a class="read-more-btn" href="./about.php">Read more</a>
              <button class="social-share-btn twitter-btn" @click="share('twitter')"><img src="./images/twitter-nobg.png" />Share on Twitter</button>
              <button class="social-share-btn  facebook-btn" @click="share('facebook')"><img src="./images/facebook-nobg.png" />Share on Facebook</button>
              <p>Kliknutím na graf alebo zoznam môžete údaje zoraďovať, triediť a filtrovať.</p>
            </div>
            <i class="material-icons close-btn" @click="showInfo = false">close</i>
          </div>
        </div>
      </div>
      <!-- MAIN -->
      <div class="container-fluid dashboard-container-outer">
        <div class="row dashboard-container">
          <!-- CHARTS - FIRST ROW -->
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_2">
              <chart-header :title="charts.yearsRange.title" :info="charts.yearsRange.info" ></chart-header>
              <div class="chart-inner" id="yearsrange_chart"></div>
            </div>
          </div>
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_1">
              <chart-header :title="charts.party.title" :info="charts.party.info" ></chart-header>
              <div class="chart-inner" id="party_chart"></div>
            </div>
          </div>
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_2">
              <chart-header v-if="selectedIncomeType == 'donations'" :title="charts.donors.title" :info="charts.donors.info" ></chart-header>
              <chart-header v-if="selectedIncomeType == 'loans'" :title="charts.donors.titleLoans" :info="charts.donors.info" ></chart-header>
              <div class="chart-inner" id="donors_chart"></div>
            </div>
          </div>
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_3">
              <chart-header :title="charts.type.title" :info="charts.type.info" ></chart-header>
              <div class="chart-inner" id="type_chart"></div>
            </div>
          </div>
          <div class="col-md-6 chart-col">
            <div class="boxed-container chart-container polfinancing_4">
              <chart-header :title="charts.years.title" :info="charts.years.info" ></chart-header>
              <div class="chart-inner" id="years_chart"></div>
            </div>
          </div>
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_5">
              <chart-header :title="charts.hasFlags.title" :info="charts.hasFlags.info" ></chart-header>
              <div class="chart-inner" id="hasflags_chart"></div>
            </div>
          </div>
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container polfinancing_6">
              <chart-header :title="charts.flags.title" :info="charts.flags.info" ></chart-header>
              <div class="chart-inner" id="flags_chart"></div>
            </div>
          </div>
          <!-- TABLE -->
          <div class="col-12 chart-col">
            <div class="boxed-container chart-container chart-container-table">
              <chart-header :title="charts.table.title" :info="charts.table.info" ></chart-header>
              <div class="chart-inner chart-table">
                <table class="table table-hover dc-data-table" id="dc-data-table">
                  <thead>
                    <tr class="header">
                      <th class="header">Číslo</th> 
                      <th class="header">Rok</th> 
                      <th class="header">Donor</th> 
                      <th class="header">Strana</th> 
                      <th class="header">Mesto</th> 
                      <th class="header">Typ príjmu</th> 
                      <th class="header">Amount (EUR)</th>
                      <th class="header">Partner verejného sektora</th>
                      <th class="header">Celková výška príspevkov</th>
                      <th class="header">Rizikové príznaky (dataset)</th> 
                      <th class="header">Rizikové príznaky (computed)</th> 
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom bar -->
      <div class="container-fluid footer-bar">
        <div class="row">
          <div class="footer-col col-8 col-sm-4">
            <div class="footer-input">
              <input type="text" id="search-input" placeholder="Vyhľadávanie ...">
              <i class="material-icons">search</i>
            </div>
          </div>
          <div class="footer-col col-4 col-sm-8 footer-counts">
            <div class="dc-data-count count-box">
              <div class="filter-count">0</div>of <strong class="total-count">0</strong> <span v-if="selectedIncomeType == 'donations'">dary</span><span v-if="selectedIncomeType == 'loans'">pôžičky</span>
            </div>
            <div class="count-box count-box-donationsamt">
              <div class="filter-count donationsamt">0</div>of <strong class="total-count-donationsamt">0</strong>
            </div>
          </div>
        </div>
        <!-- Reset filters -->
        <button class="reset-btn"><i class="material-icons">settings_backup_restore</i><span class="reset-btn-text">Pôvodné nastavenie</span></button>
      </div>
      <!-- FOOTER -->
      <div class="footer">
        <div class="banners-container">
          <p>Naše ďalšie výstupy z projektu Integrity Watch 3.0:</p>
          <a href="http://otvorenesudy.sk/" target="_blank"><img src="./images/otvorenesudy.png" /></a>
          <a href="http://volby.transparency.sk/" target="_blank"><img src="./images/election portal.png" /></a>
        </div>
      </div>
      <!-- DETAILS MODAL -->
      <div class="modal" id="detailsModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title">
                <div class="name">€ {{ selectedEl.amt_eur_converted }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    <div class="details-line" v-if="selectedEl.date && selectedEl.date !== ''"><span class="details-line-title">Dátum:</span> {{ selectedEl.date }}</div>
                    <div class="details-line" v-if="selectedEl.party && selectedEl.party !== ''"><span class="details-line-title">Strana:</span> {{ selectedEl.party }}</div>
                    <div class="details-line" v-if="selectedEl.donor_name && selectedEl.donor_name !== '' && selectedEl.donor_type == 'person'"><span class="details-line-title">Meno a priezvisko:</span> {{ selectedEl.donor_name }}</div>
                    <div class="details-line" v-if="selectedEl.donor_name && selectedEl.donor_name !== '' && selectedEl.donor_type == 'company'"><span class="details-line-title">Názov firmy:</span> {{ selectedEl.donor_name }}</div>
                    <div class="details-line" v-if="selectedEl.city && selectedEl.city !== ''"><span class="details-line-title">Mesto:</span> {{ selectedEl.city }}</div>
                    <div class="details-line" v-if="selectedEl.income_type && selectedEl.income_type !== ''"><span class="details-line-title">Typ príjmu:</span> {{ selectedEl.income_type }}</div>
                    <div class="details-line" v-if="selectedEl.fulfillment_type && selectedEl.fulfillment_type !== ''"><span class="details-line-title">Typ plnenia:</span> {{ selectedEl.fulfillment_type }}</div>
                    <div class="details-line" v-if="selectedEl.amt_eur_converted && selectedEl.amt_eur_converted !== ''"><span class="details-line-title">Výška daru:</span> € {{ selectedEl.amt_eur_converted }}</div>
                    <div class="details-line" v-if="selectedEl.flags && selectedEl.flags.length > 0"><span class="details-line-title">Risk indicators (dataset):</span> {{ selectedEl.flags.join(', ') }}</div>
                    <div class="details-line" v-if="selectedEl.flags_computed_details && selectedEl.flags_computed_details.length > 0"><span class="details-line-title">Risk indicators (computed):</span> {{ selectedEl.flags_computed_details.join(', ') }}</div>
                    <div class="details-line" v-if="selectedEl.link && selectedEl.link !== ''"><span class="details-line-title"><a :href="selectedEl.link" target="_blank">Link</a></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Loader -->
      <loader v-if="loader" :text="''" />
    </div>

    <script type="text/javascript" src="vendor/js/d3.v5.min.js"></script>
    <script type="text/javascript" src="vendor/js/d3.layout.cloud.js"></script>
    <script type="text/javascript" src="vendor/js/crossfilter.min.js"></script>
    <script type="text/javascript" src="vendor/js/dc.js"></script>
    <script type="text/javascript" src="vendor/js/dc.cloud.js"></script>

    <script src="static/pol_financing.js?v=6"></script>

 
</body>
</html>