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
  <link rel="stylesheet" href="static/public_sector_partners.css?v=4">
</head>
<body>
    <div id="app" class="polfinancing-page">   
      <?php include 'header.php' ?>
      <!-- TOP AREA -->
      <div class="container-fluid top-description-container" v-if="showInfo">
        <div class="row">
          <div class="col-md-12 top-description-content">
            <div class="top-description-text">
              <h1>INTEGRITY WATCH SLOVAKIA | Partneri verejného sektora</h1>
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
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_1">
              <chart-header :title="charts.type.title" :info="charts.type.info" ></chart-header>
              <div class="chart-inner" id="type_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_2">
              <chart-header :title="charts.legal.title" :info="charts.legal.info" ></chart-header>
              <div class="chart-inner" id="legal_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_3">
              <chart-header :title="charts.topDonorsDirect.title" :info="charts.topDonorsDirect.info" ></chart-header>
              <div class="chart-inner" id="topdonorsdirect_chart"></div>
            </div>
          </div>
          <!--
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_3">
              <chart-header :title="charts.topDonorsAll.title" :info="charts.topDonorsAll.info" ></chart-header>
              <div class="chart-inner" id="topdonorsall_chart"></div>
            </div>
          </div>
          -->
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_5">
              <chart-header :title="charts.boNum.title" :info="charts.boNum.info" ></chart-header>
              <div class="chart-inner" id="bonum_chart"></div>
            </div>
          </div>
          <!--
          <div class="col-md-3 chart-col">
            <div class="boxed-container chart-container publicsector_6">
              <chart-header :title="charts.topBo.title" :info="charts.topBo.info" ></chart-header>
              <div class="chart-inner" id="topbo_chart"></div>
            </div>
          </div>
          -->
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_7">
              <chart-header :title="charts.typeDon.title" :info="charts.typeDon.info" ></chart-header>
              <div class="chart-inner" id="typedon_chart"></div>
            </div>
          </div>
          <div class="col-md-4 chart-col">
            <div class="boxed-container chart-container publicsector_8">
              <chart-header :title="charts.parties.title" :info="charts.parties.info" ></chart-header>
              <div class="chart-inner" id="parties_chart"></div>
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
                      <th class="header">N°</th> 
                      <th class="header">Name</th> 
                      <th class="header">Ico</th> 
                      <th class="header">Forma Osoby</th>
                      <th class="header">Pravna Forma</th> 
                      <th class="header">Beneficial Owners</th> 
                      <th class="header">Donations EUR</th> 
                      <!-- <th class="header">Donations (bo) EUR</th> -->
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
              <div class="filter-count">0</div>of <strong class="total-count">0</strong> entities
            </div>
            <div class="count-box count-box-donationsamt">
              <div class="filter-count donationsamt">0</div>of € <strong class="total-count-donationsamt">0</strong> entity donations
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
                <div class="name">{{ selectedEl.entityName }}</div>
              </div>
              <button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div class="container">
                <div class="row">
                  <div class="col-md-12">
                    <div class="details-line" v-if="selectedEl.Ico && selectedEl.Ico !== ''"><span class="details-line-title">Ico:</span> {{ selectedEl.Ico }}</div>
                    <div class="details-line" v-if="selectedEl.ObchodneMeno"><span class="details-line-title">Obchodne Meno:</span> {{ selectedEl.ObchodneMeno }}</div>
                    <div class="details-line" v-else><span class="details-line-title">Meno a Priezvisko:</span> {{ selectedEl.entityName }}</div>
                    <div class="details-line" v-if="selectedEl.FormaOsoby && selectedEl.FormaOsoby !== ''"><span class="details-line-title">Forma Osoby:</span> {{ selectedEl.FormaOsoby }}</div>
                    <div class="details-line" v-if="selectedEl.PravnaForma"><span class="details-line-title">Pravna Forma:</span> {{ selectedEl.legalForm }}</div>
                    <div class="details-line"><span class="details-line-title">Direct donations:</span> € {{ selectedEl.amt_direct_donations }}</div>
                    <div class="details-line"><span class="details-line-title">Donations by beneficial owners:</span> € {{ selectedEl.amt_bo_donations }}</div>
                    <div class="modal-divider"></div>
                  </div>
                  <!-- Identities table -->
                  <div class="col-md-12">
                    <div class="details-table-title">Partneri Verejneho Sektora</div>
                    <div class="details-table-desc">Lorem ipsum</div>
                    <table id="modalTableIdentity" class="modal-table">
                      <thead>
                        <tr><th>Entity name</th><th>Ico</th><th>City/Psc</th><th>Pravna Forma</th><th>Platnost Od</th><th>Platnost Do</th></tr>
                      </thead>
                    </table>
                  </div>
                  <!-- Donations table -->
                  <div class="col-md-12">
                    <div class="details-table-title">Political finance</div>
                    <div class="details-table-desc">Political donations by the entity</div>
                    <table id="modalTableDonations" class="modal-table">
                      <thead>
                        <tr><th>Donor</th><th>Party</th><th>Income type</th><th>Amount</th><th>Date</th></tr>
                      </thead>
                    </table>
                  </div>
                  <!-- BOs table -->
                  <div class="col-md-12">
                    <div class="details-table-title">Konecni Uzivatelia Vyhod (beneficial owners)</div>
                    <div class="details-table-desc">Lorem ipsum</div>
                    <table id="modalTableBo" class="modal-table">
                      <thead>
                        <tr><th>Name</th><th>Birth date</th><th>Je Verejny Cinitel</th><th>Platnost Od</th><th>Platnost Do</th></tr>
                      </thead>
                    </table>
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

    <script src="static/public_sector_partners.js?v=4"></script>

 
</body>
</html>