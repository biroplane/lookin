var express = require("express");
var restapi = express();
var bodyParser = require('body-parser');
var md5 = require('md5');
var sha1 = require('sha1');
var soap = require('soap');
const http = require('http');
const https = require('https');
var request = require('request');
var progress = require('request-progress');
var $ = require('jquery');
var moment = require('moment');
var unzip = require('unzip');
var batch = require('batchflow');
const {
  download
} = require('electron-dl');
//var $=require('jQuery')();

// var updater = require('./updater.js');
const {
  Menu
} = require('electron');
const {
  ipcMain
} = require('electron');


const {
  crashReporter
} = require('electron')

const electron = require('electron');
const app = electron.app;
const {
  autoUpdater
} = require('electron-updater')
const {
  dialog
} = require('electron')
app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
const BrowserWindow = electron.BrowserWindow
const port = process.env.PORT || 3000;
//myLog(" PORTA ", port);
let mainWindow
let windows = []
//var ejs = new electronEjs({key:'val'},{});
//restapi.engine('.html', require('pug').__express)

const ejs = require('ejs');
let allrows;
let columns;
var downloadcount = 0;

require('sql.js');
var fs = require("fs");
var os = require("os");
//Ditto, path module
var path = require('path');
var ftp = require('ftp');
var url = require('url');

function requestOption(file) {
  return options = {
    uri: 'https://' + secureUser + ':' + securePwd + '@lookin.fbarile.it/lookin/data/' + file,
    // hostname: 'lookin.fbarile.it',
    // path: '/lookin/data/' + file,

    port: 443,
    rejectUnauthorized: false,
    requestCert: false,
    headers: {
      'Authorization': secureAuth
    },
    strictSSL: false,
    agent: false
  }
}



//let maindb;
global.maindb;
global.report;


//var updater = require('./updater.js');
var whoAskedForUpdate = 'main';
dataPath = ''
var queryFile = ''
//myLog("file delle query",queryFile);

//var checkLine = require('./mod/checkLine.js');
//myLog("CHECK LINE", checkLine);
const DOCUMENTS = app.getPath('documents');
//myLog("CARTELLA DOCUMENTI", DOCUMENTS);

function startupCheck() {
  //downloadProfilePicture();
  if (!fs.existsSync(path.join(DOCUMENTS, 'lookin'))) {
    fs.mkdirSync(path.join(DOCUMENTS, 'lookin'))
    if (fs.existsSync(path.join(DOCUMENTS, 'lookin', 'log.txt'))) {
      fs.unlink(path.join(DOCUMENTS, 'lookin', 'log.txt'))
    }
  }

  if (fs.existsSync(path.join(path.join(DOCUMENTS, 'lookin', 'query.json')))) {
    //myLog("IL FILE QUERY ESISTE");
    queryFile = JSON.parse(fs.readFileSync(path.join(DOCUMENTS, 'lookin', 'query.json')));
  }
  if (fs.existsSync(path.join(path.join(DOCUMENTS, 'lookin', 'config.json')))) {
    //myLog("IL FILE CONFIG ESISTE");

  }
  //DOWNLOAD QUERY.JSON
  dataPath = path.join(DOCUMENTS, 'lookin')

}


function downloadProfilePicture() {
  if(fs.existsSync(path.join(DOCUMENTS, 'lookin','operatori.json'))){
    operatori = require(path.join(DOCUMENTS, 'lookin','operatori.json'));
   console.log("OPERATORI ",operatori.length);
    if(!fs.existsSync(path.join(DOCUMENTS,'lookin','operatori'))){
      fs.mkdirSync(path.join(DOCUMENTS,'lookin','operatori'))
    }
    var newop=[]
    for (op in operatori) {
      newop.push(operatori[op].IMG);
    }
    batch(newop).sequential().each(function(i, item, next) {
      console.log("PCT: ",(this.finished / this.total) * 100.0);


      try {
        var options = {
          uri: item,
          // hostname: 'lookin.fbarile.it',
          // path: '/lookin/data/' + file,

          port: 443,
          rejectUnauthorized: false,
          requestCert: false,
          headers: {
            'Authorization': secureAuth
          },
          strictSSL: false,
          agent: false
        };
        progress(request(options), {})
          .on('progress', function(state) {
            //mainWindow.setProgressBar(state.percent)
            ///mainWindow.webContents.executeJavaScript("updateProgressBar(" + parseFloat(state.percent * 100) + "," + state.time.remaining + ")");
            //myLog('progress', state);
          })
          .on('error', function(err) {
            // Do something with err

           console.error("ERRORE ", err)
          })
          .on('end', function(aaa) {
            // Do something after request finishes
            //fs.unlinkSync(path.join(dataPath, file + "_OLD"))
            //downloadcount++;
            console.log("COUNT ", downloadcount);
          })
          .pipe(fs.createWriteStream(path.join(DOCUMENTS,'lookin','operatori', operatori[i].LOGIN+'.png')));

      } catch (err) {
        //myLog(err)
      }



      next()
    }).end()
  }
}
// clientFTP = new ftp();
// ftploging = {
//   host: "192.168.43.202",
//   user: 'bfscuser',
//   password: 'Lop2341'
// };
// var ftpfolder = 'lookin2_sync';
var rootHost = "https://lookin.fbarile.it/lookin/";
var secureUser = 'lookin_usr';
var securePwd = 'bUUsYTxX7YcR43';
var secureAuth = "Basic " + new Buffer(secureUser + ":" + securePwd).toString("base64");
var soapurl = rootHost + "LookinWebservice/LookinWebService.asmx?wsdl";
global.filename = "lookin.db";
var filebuffer;
var soapargs = {}
global.loggato = false;
//var server = require('./public/js/modules/server.js');
crashReporter.start({
  productName: 'Lookin',
  companyName: 'GabeHolding',
  submitURL: path.join(__dirname, 'crash', 'error'),
  uploadToServer: true
})

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │              ### ######   #####     #     #    #    ### #     #              │
 * │               #  #     # #     #    ##   ##   # #    #  ##    #              │
 * │               #  #     # #          # # # #  #   #   #  # #   #              │
 * │               #  ######  #          #  #  # #     #  #  #  #  #              │
 * │               #  #       #          #     # #######  #  #   # #              │
 * │               #  #       #     #    #     # #     #  #  #    ##              │
 * │              ### #        #####     #     # #     # ### #     #              │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

ipcMain.on('checkForDB',(evt,arg)=>{
 console.log("CONTROLLO IL DB ",arg);
  if(fs.existsSync(path.join(dataPath,arg.db))==false){
    //downloadDBFile('analytics.db',1);
   console.log("MANCA IL DB");
    evt.sender.send('checkForDBResponse',false)

  }else{
    evt.sender.send('checkForDBResponse',true)
  }
})
ipcMain.on('onSoapSync', (evt, arg) => {
  //myLog(soapargs);
  syncToSoap(soapurl, soapargs)
})
ipcMain.on('onSoapLogin', (evt, arg) => {
  //myLog("LOGIN VIA SOAP", arg);
  //FIRST ACCESS
  soapLogin(soapurl, arg)
})


ipcMain.on('setUserId', (evt, arg) => {
  //myLog("ARG", arg);
  soapargs = arg;
  global.loggato = true;
  evt.sender.send('utenteLoggato', global.loggato)
  //startupCheck()
  //downloadDBFile()
})
ipcMain.on('onCreateView', (evt, arg) => {
 console.log("CREO LA VIEW ", arg);
  global.report = arg

  //evt.sender.send()
})
ipcMain.on('downloadDBFile', (evt, arg) => {
  //myLog("EVT ",evt," ARG ",arg);

  // downloadDBFile('http://www.gabeholding.com/lookin/data/prova.db',path.join(dataPath,'prova.db'))
  //batchDBFile();
 console.log("ARGS",arg);
  if(fs.existsSync(path.join(dataPath,'analytics.db'))){
   console.log("IL DB ANALITICS ESISTE, effettua solo l'aggiornamento");
    soapUpdate(soapurl,arg)
    downloadDBFile('lookin.db',1)
  }else{
   console.log("IL DB NON ESISTE, scarica tutto");
    batchDBFile();
  }
  //
  //

})
ipcMain.on('download', (evt, arg) => {
  console.log("UPDATE ",autoUpdater.checkForUpdates());
  //downloadFile('prova.db')
  whoAskedForUpdate = 'process';
  autoUpdater.checkForUpdates();
  //httpsDownload('prova.db')
  //mainWindow.webContents.downloadURL('https://'+secureUser+':'+securePwd+'@lookin.fbarile.it/lookin/data/prova.db')
  //downloadDBFile('https://' + secureUser + ':' + securePwd + '@lookin.fbarile.it/lookin/data/prova.db', path.join(dataPath, 'prova.db'))





  //download(mainWindow,'http://www.gabeholding.com/lookin/data/prova.db').then(dl=>myLog(dl.getSavePath())).catch(console.error)
})

ipcMain.on('checkSoftwareUpdates', (evt, arg) => {
  //myLog("IPC CHECK SOFTWARE UPDATES")
  autoUpdater.checkForUpdates();

})

ipcMain.on('changeDatabase', (evt, arg) => {
 console.log("CAMBIO IL DATABASE ", arg);
  filename = arg.dbname;
  maindb = openDB(path.join(dataPath, filename));
})
//var maindb;
startupCheck();
////myLog("MAIN DATAPATH", path.join(dataPath, filename));
maindb = openDB(path.join(dataPath, filename));

var UID = 0;
////myLog(global);
restapi.engine("ejs", ejs.__express)
restapi.use(express.static(__dirname + "/public"));
restapi.set('views', __dirname + '/views');
restapi.set('view engine', 'ejs');
restapi.use(bodyParser.urlencoded({
  extended: false
}));
restapi.use(bodyParser.json());

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │       ######  ####### #     # #     # #       #######    #    ######         │
 * │       #     # #     # #  #  # ##    # #       #     #   # #   #     #        │
 * │       #     # #     # #  #  # # #   # #       #     #  #   #  #     #        │
 * │       #     # #     # #  #  # #  #  # #       #     # #     # #     #        │
 * │       #     # #     # #  #  # #   # # #       #     # ####### #     #        │
 * │       #     # #     # #  #  # #    ## #       #     # #     # #     #        │
 * │       ######  #######  ## ##  #     # ####### ####### #     # ######         │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

function batchDBFile() {

 console.log("ESEGUO BATCH");
  var filelist2 = ['lookin.db', 'analytics.db'];

  batch(filelist2).sequential().each(function(i, item, next) {
   console.log("PCT: ",i, item,dataPath);
    downloadDBFile(item, filelist2.length);
    next()
  }).end()

}

function downloadDBFile(file, total) {
  //TRIGGER SYNC
  if(fs.existsSync(path.join(dataPath,file))){
  fs.rename(path.join(dataPath, file), path.join(dataPath, file + "_OLD"), function(err) {
   console.log("ERRORE DURANTE LA RINOMINAZIONE DEL FILE",err);
  })
  }
  if (arguments[1] <= 0) {
    total = 1;
  }
  try {
    var options = requestOption(file);
    progress(request(options), {})
      .on('progress', function(state) {
        mainWindow.setProgressBar(state.percent)
        mainWindow.webContents.executeJavaScript("updateProgressBar(" + parseFloat(state.percent * 100) + "," + state.time.remaining + ")");
        //myLog('progress', state);
      })
      .on('error', function(err) {
        // Do something with err
        if(fs.existsSync(path.join(dataPath,file))){
        fs.rename(path.join(dataPath, file + "_OLD"), path.join(dataPath, file), function(error) {
         console.log("ERRORE DURANTE LA RINOMINAZIONE DEL FILE DI RITORNO",error,err);
        })
        }
       console.error("ERRORE ", err)
      })
      .on('end', function(aaa) {
        // Do something after request finishes
        if(fs.existsSync(path.join(dataPath,file+"_OLD"))){
        fs.unlinkSync(path.join(dataPath, file + "_OLD"))
        }
        downloadcount++;
       console.log("COUNT ", downloadcount);
        if (downloadcount == total) {
          if (maindb) {
            maindb.close();
          }

          //myLog("DATAPATH ",dataPath)
          maindb = openDB(path.join(dataPath, 'lookin.db'));
          mainWindow.webContents.reload()
          mainWindow.setProgressBar(-1)
          syncToSoap(soapurl, soapargs)
        }
      })
      .pipe(fs.createWriteStream(path.join(dataPath, file)));

  } catch (err) {
    myLog(err)
  }
}



/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │       ######     #    #######    #    ######     #     #####  #######        │
 * │       #     #   # #      #      # #   #     #   # #   #     # #              │
 * │       #     #  #   #     #     #   #  #     #  #   #  #       #              │
 * │       #     # #     #    #    #     # ######  #     #  #####  #####          │
 * │       #     # #######    #    ####### #     # #######       # #              │
 * │       #     # #     #    #    #     # #     # #     # #     # #              │
 * │       ######  #     #    #    #     # ######  #     #  #####  #######        │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
restapi.get("/viewdata/:viewname/", (req, res) => {
  var viewname = req.params.viewname;
  var str = '';
  var begin,end,format;
  var qs = req.query;

  req.query._ = null;
  console.log("QUERYSTRING ",req.query);
  for (var q in qs) {
    if (q != '_') {
      str += " AND ";
      if (q == "DATA" || q == "DATA_LOG" || q == "WEEK" || q == "MONTH" || q == "YEAR") {
        switch (q) {
          case "DAY":
            format = "YYYY-MM-DD";
            break;
          case "WEEK":
            format = "YY-WW";

            break;
          case "MONTH":
            format = "YY-MM";

            break;
          case "YEAR":
            format = "YYYY";

            break;
          default:
            format = "YYYY-MM-DD";


        }
        if(qs[q].indexOf(" | ")>0){
          dd=qs[q].split(" | ");
          begin=dd[0];
          end=dd[1];
         console.log("DATA RANGE TROVATO",begin,end);
          str += q + ">='" + begin + "' AND "+q+"<='"+end+"' ";
        }else{
         console.log("DATA SEMPLICE",qs[q]);
          begin = qs[q];
          end=moment(begin).add(7,'days').format(format);
          str += q + ">='" + begin + "' ";
        }


      } else {
        str += q + "='" + qs[q] + "'";
      }
    }
  }
  var qq = JSON.parse(JSON.stringify(getObjects(queryFile, 'nome', viewname)))
  query = qq[0].query
 //console.log("PRIMA DEL REPLACE ", query.indexOf("$s"))
  if (query.indexOf("$s") > 0) {
   //console.log("TROVATO DOLLAROESSE ");
    query = query.replace("$s", str)
  }
  if (query.indexOf("$d1") > 0) {
   //console.log("TROVATA DATA ",begin);
    query = query.split("$d1").join("'" + begin + "'");
  }
  if (query.indexOf("$d2") > 0) {
   //console.log("TROVATA SECONDA DATA ",end);
    query = query.split("$d2").join("'" + end + "'");
  }
  //query = query.replace("$s", str)
  //query+=  " LIMIT "+start+","+len
 //console.log("QUERY ", query);
  var jsonrows = [];
  maindb.run("PRAGMA cache_size = 1638400")
  maindb.run("PRAGMA synchronous=OFF")
  var stmt = maindb.prepare(query)
  // var rr = stmt.getAsObject();
  while (stmt.step()) {
    ////myLog("ROW ",stmt.getAsObject());
    jsonrows.push(stmt.getAsObject())
  }

  res.json({
    data: jsonrows
  });
  stmt.free();
})

// restapi.get("/view/:viewname/:datalog", (req, res) => {
//   var datalog = req.params.datalog;
//   var viewname = req.params.viewname;
//   //var columnname = req.params.columnname;
//   var query = "SELECT * FROM " + viewname;
//   if (datalog) {
//     query += " WHERE DATA_LOG>'" + datalog + "'";
//   }
//   var jsonrows = [];
//   var jsoncols = []
//   var rr = maindb.each(query, function(row) {
//     jsonrows.push(row);
//   });
//   //rr=JSON.parse(JSON.stringify(rr));
//   // maindb.each("SELECT * FROM BFS_APP_VIEWCOLUMNS JOIN BFS_APP_COLUMNS ON ID_COLUMN=ID WHERE VIEW_NAME = '" + viewname + "'", function(cols) {
//   //   jsoncols.push(cols);
//   // });
//   res.render("home", {
//     title: "Hey",
//     viewname: viewname,
//     dates: datalog,
//     rows: jsonrows,
//     // columns: jsoncols
//   });
// })

restapi.get("/data/:view", (req, res) => {
  var view = req.params.view;
  var cols = getObjects(global.report, 'name', view);
  //myLog("COLONNE ",req);

  res.render("tableview", {
    report: global.report,
    query: req.query
  });
  //myLog(global.report);
})
restapi.get("/server/:view", (req, res) => {
  var view = req.params.view;
  var cols = getObjects(global.report, 'name', view);
  //myLog("COLONNE ",req);

  res.render("home", {
    report: global.report,
    query: req.query
  });
  //myLog(global.report);
})

restapi.get("/analisyspage/:view", (req, res) => {

 console.log("PARAMS ", req.params);
  var view = req.params.view;
  var cols = getObjects(global.report, 'name', view);
  //myLog("COLONNE ",req);
 console.log("ANALISI ", global.report);
  res.render("analisi", {
    report: global.report,
    query: req.query
  });
})
restapi.get("/analitycs/:viewname", (req, res) => {

  var viewname = req.params.viewname;
  var qq = JSON.parse(JSON.stringify(getObjects(queryFile, 'nome', viewname)))
 console.log("VN: ", viewname);
 console.log("QQ: ", qq);
  query = qq[0].query
  //query = query.replace("$s", str)
  //query+=  " LIMIT "+start+","+len
  //myLog("QUERY ", query);

  var jsonrows = [];
  var jsoncols = [];
  maindb.run("PRAGMA cache_size = 1638400")
  maindb.run("PRAGMA synchronous=OFF")
  var stmt = maindb.prepare(query)
  // var rr = stmt.getAsObject();
  while (stmt.step()) {
    ////myLog("ROW ",stmt.getAsObject());
    jsonrows.push(stmt.getAsObject())
  }

  res.json({
    data: jsonrows
  });
  stmt.free();
})
restapi.get('/lastdate',(req,res)=>{
  var oldname;
  if (global.filename != 'analytics.db') {
    console.log("APRI IL DB LOOKIN");
    oldname = global.filename;
    maindb = openDB(path.join(dataPath, 'analytics.db'));
  }
  var q="SELECT MAX(DATA_LOG) AS LASTDATE FROM BFS_REP_IMPORT";
  var st = maindb.prepare(q);
  st.step();
 console.log("LAST DATE: ",st.getAsObject());
  res.send(st.getAsObject())
})
/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │         #     # #######  #####   #####     #     #####   #####  ###          │
 * │         ##   ## #       #     # #     #   # #   #     # #     #  #           │
 * │         # # # # #       #       #        #   #  #       #        #           │
 * │         #  #  # #####    #####   #####  #     # #  #### #  ####  #           │
 * │         #     # #             #       # ####### #     # #     #  #           │
 * │         #     # #       #     # #     # #     # #     # #     #  #           │
 * │         #     # #######  #####   #####  #     #  #####   #####  ###          │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
restapi.get("/messaggi/:id/:canale", (req, res) => {
  //LEGGI MESSAGGI DAL DB
  console.log("FILENAME ", global.filename);
  var oldname;
  if (global.filename != 'lookin.db') {
    console.log("APRI IL DB LOOKIN");
    oldname = global.filename;
    maindb = openDB(path.join(dataPath, 'lookin.db'));
  }
  var id = req.params.id;
  var canale = req.params.canale;
  console.log("MESSAGGI ", global.filename);
  var q = "SELECT * FROM BFS_CHAT_MSG_NEW WHERE CODCLIENTE ='"+id+"' AND AREA = '1' AND CANALE='"+canale+"' ORDER BY TIMESTAMP DESC";
  var jsonrows = [];

  maindb.run("PRAGMA cache_size = 163840")
  maindb.run("PRAGMA synchronous=OFF")
  var stmt = maindb.prepare(q)
  // var rr = stmt.getAsObject();
  while (stmt.step()) {
    ////myLog("ROW ",stmt.getAsObject());
    jsonrows.push(stmt.getAsObject())
  }

  res.render('chat', {
    discussion: jsonrows,
    path:app.getPath('documents')
  });
  stmt.free();
  maindb.close();
  filename = oldname;
  maindb = openDB(path.join(dataPath, filename))
 console.log("FILENAME ALLA FINE", filename);
})
restapi.post("/messaggio/", (req, res) => {
  // SCRIVI MESSAGGI NEL DB
})

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                    #       #######  #####     ### #     #                    │
 * │                    #       #     # #     #     #  ##    #                    │
 * │                    #       #     # #           #  # #   #                    │
 * │                    #       #     # #  ####     #  #  #  #                    │
 * │                    #       #     # #     #     #  #   # #                    │
 * │                    #       #     # #     #     #  #    ##                    │
 * │                    ####### #######  #####     ### #     #                    │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
// restapi.get("/loguser/:username/:password", (req, res) => {
//   var data = {};
//   data.username = req.params.username;
//   data.password = md5(sha1(req.params.password))
//   maindb.each("SELECT * FROM BFS_APP_USERS WHERE USER_NAME='" + req.params.username + "' AND PSW='" + req.params.password + "' LIMIT 1", function(usr) {
//     data.user = usr;
//   });
//   //data.user=user;
//
//
//
//   res.send(data);
// })
// restapi.post("/data", function(res, req) {
//
// })
restapi.listen(port);



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 640,
    titleBarStyle: 'hidden-inset',
    resizable: false,
    x: 0,
    y: 0
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.webContents.on('did-finish-load',function () {
  //  //myLog("CARICATO! CONTROLLO LA CARTELLA");
  //   startupCheck()
  // })
  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function() {
    mainWindow = null
  })




  mainWindow.webContents.on('crashed', function(a, b, c) {
    //myLog("CRASH",a,b,c);
  })
}

app.on('ready', function() {

  createWindow();
  //
  // mainWindow.webContents.on('did-finish-load', function() {
  //   mainWindow.webContents.executeJavaScript("checkForUpdates();");
  // });

  require('./mainmenu.js');
  /* ┌─────────────────────────────────────┐
   * │              +-+-+-+-+              │
   * │              AUTOUPDATE             │
   * │              +-+-+-+-+              │
   * └─────────────────────────────────────┘
   */

})

app.on('window-all-closed', function() {
  //if (process.platform !== 'darwin') {
  app.quit()
  //}
})

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow()
  }
})

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │               #     # ######  ######     #    ####### #######                │
 * │               #     # #     # #     #   # #      #    #                      │
 * │               #     # #     # #     #  #   #     #    #                      │
 * │               #     # ######  #     # #     #    #    #####                  │
 * │               #     # #       #     # #######    #    #                      │
 * │               #     # #       #     # #     #    #    #                      │
 * │                #####  #       ######  #     #    #    #######                │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
autoUpdater.autoDownload = false

autoUpdater.on('error', (event, error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})
autoUpdater.on('update-available', (evt, error) => {
  if (evt.version > app.getVersion()) {
    mainWindow.webContents.send('updateAvailable', true)
  }

  //myLog("UPDATE AVAILABLA DAL MAIN");
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
      mainWindow.webContents.send('onSyncStart', true);
    }

  })

})
autoUpdater.on('update-not-available', (evt, error) => {
  // $('.newversion').html('--');
  if (whoAskedForUpdate == 'process') {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    })
  }
})


autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    autoUpdater.quitAndInstall()
  })
})

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                        #####  #######    #    ######                         │
 * │                       #     # #     #   # #   #     #                        │
 * │                       #       #     #  #   #  #     #                        │
 * │                        #####  #     # #     # ######                         │
 * │                             # #     # ####### #                              │
 * │                       #     # #     # #     # #                              │
 * │                        #####  ####### #     # #                              │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */


function soapLogin(url, args) {
  //myLog("SOAP ARGS");
  //myLog(args, url,secureAuth);
  var specialRequest = request.defaults({
    strictSSL: false
  });

  soap.createClient(url, {
    wsdl_headers: {
      Authorization: secureAuth
    },
    request: specialRequest
  }, function(err, client) {
    client.setSecurity(new soap.BasicAuthSecurity(secureUser, securePwd));
    client.LogIn(args, function(err, result) {
      //myLog("RISULTATI DEL LOG ONLINE", result);
      if (result.LogInResult == 1) {
        //myLog("LOG IN OK");
        soapargs = args
        global.loggato = true;
        //startupCheck()
        mainWindow.webContents.send('onSyncStart', true)
        batchDBFile();
        //downloadDBFile('lookin.db')
        //downloadDBFile('analitycs.db')

      } else {
        //myLog("LOGIN ERRATO");
        mainWindow.webContents.send('wrongLogIn', true);
      }
    })
  })
}
function soapUpdate(url, args) {
  //myLog("SOAP ARGS");
  //myLog(args, url,secureAuth);
  var specialRequest = request.defaults({
    strictSSL: false
  });

  soap.createClient(url, {
    wsdl_headers: {
      Authorization: secureAuth
    },
    request: specialRequest
  }, function(err, client) {
    client.setSecurity(new soap.BasicAuthSecurity(secureUser, securePwd));
    client.SyncRepImport(args, function(err, result) {
      //myLog("RISULTATI DEL LOG ONLINE", result);
      var fn="analytics.db";
      var ana=openDB(path.join(dataPath,fn));
      js = JSON.parse(result.SyncRepImportResult);
      //myLog("SYNC TO DB", js);
      //myLog("SYNC DB", js.length);
      if (js.length > 0 && js[0].OP != '') {
        console.log("ESEGUO OPERAZIONI SUL DB",js);

        //myLog("OPERAZIONI", js[0].OP);
        ana.run("BEGIN TRANSACTION;");
        try {
          //body...
          ob = js[0].OP;
          for (var p in ob) {
            //myLog("QUERY DEL DB", obj[p]);
            ana.run(ob[p])
          }
          ana.run("COMMIT;")
          writeDB(ana, path.join(dataPath, fn));
          ana.close();
         console.log("FINE TRANSACTION");
          //ana = openDB(path.join(dataPath, filename));
        } catch (err) {
          ana.run("ROLLBACK;")
         console.log("ERRORRE TRANSACTION", err);
        }
      } else {
        //myLog("NESSUNA OPERAZIONE DA EFFETTUARE, CARICA IL DB");
      }
      //mainWindow.webContents.reload()
    })
  })
}
function syncToSoap(url, soapargs) {
  //myLog("SOAP ARGS");
  //myLog(soapargs, url,secureAuth);
  var specialRequest = request.defaults({
    strictSSL: false
  });
  var auth = "Basic " + new Buffer(secureUser + ":" + securePwd).toString("base64");
  soap.createClient(url, {
    wsdl_headers: {
      Authorization: auth
    },
    request: specialRequest
  }, function(err, client) {
    // soap.createClient(url,  function(err, client) {
    //myLog("CLIENT ",client);
    client.setSecurity(new soap.BasicAuthSecurity(secureUser, securePwd));
    client.GetJsonConfig(soapargs, function(err, result) {
      //myLog("FileJson CONFIG", err);

      writeConfigFile('config.json', JSON.stringify(JSON.parse(result.GetJsonConfigResult), null, 2))

    })
    client.GetJsonQuery(soapargs, function(err, result) {
      //myLog("FileJson QUERY", err);
      writeConfigFile('query.json', JSON.stringify(JSON.parse(result.GetJsonQueryResult), null, 2))
    })
    client.SyncDB(soapargs, function(err, result) {

      js = JSON.parse(result.SyncDBResult);
      //myLog("SYNC TO DB", js);
      //myLog("SYNC DB", js.length);
      if (js.length > 0 && js[0].OP != '') {
        //myLog("ESEGUO OPERAZIONI SUL DB",js);

        //myLog("OPERAZIONI", js[0].OP);
        maindb.run("BEGIN TRANSACTION;");
        try {
          //body...
          ob = js[0].OP;
          for (var p in ob) {
            //myLog("QUERY DEL DB", obj[p]);
            mindb.run(obj[p])
          }
          maindb.run("COMMIT;")
          writeDB(maindb, path.join(dataPath, filename));
          maindb.close();
          maindb = openDB(path.join(dataPath, filename));
        } catch (err) {
          maindb.run("ROLLBACK;")
        }
      } else {
        //myLog("NESSUNA OPERAZIONE DA EFFETTUARE, CARICA IL DB");
      }
      mainWindow.webContents.reload()
    })

  })
}


/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │              ######  ######     ####### #     # #     #  #####               │
 * │              #     # #     #    #       #     # ##    # #     #              │
 * │              #     # #     #    #       #     # # #   # #                    │
 * │              #     # ######     #####   #     # #  #  # #                    │
 * │              #     # #     #    #       #     # #   # # #                    │
 * │              #     # #     #    #       #     # #    ## #     #              │
 * │              ######  ######     #        #####  #     #  #####               │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */
function openDB(filename) {
  try {
    if (fs.existsSync(filename)) {
      filebuffer = fs.readFileSync(filename);
    } else {
      //filebuffer = fs.createWriteStream(path.join(dataPath, 'data', filename))
      myLog("IL DB NON ESISTE")
    }
  } catch (e) {
    myLog(e);
  }

  if (filebuffer != null) {

    var db = new SQL.Database(filebuffer);
  } else {
    //myLog("SCRIVO UN NUOVO DB",filename,filebuffer);
    //var db = new SQL.Database();
  }
  return db;
}


function writeDB(db, name) {
  var binaryArray = db.export();

  var buffer = new Buffer(binaryArray);
  //myLog("QUERY RESULT OK", buffer);
  fs.writeFileSync(name, buffer);

  maindb = openDB(name);
}

function writeConfigFile(name, content) {
  //var buffer=new Buffer(content);
  fs.writeFileSync(path.join(dataPath, name), content);
  //myLog("SCRIVO IL FILE CONFIG");
  if (name == 'config.json') {
    mainWindow.webContents.send('onWriteConfig', true)
  }
  if (name == 'query.json') {
    queryFile = JSON.parse(fs.readFileSync(path.join(dataPath, 'query.json')));

  }
}

function getObjects(obj, key, val) {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(getObjects(obj[i], key, val));
    } else if (i == key && obj[key] == val) {
      objects.push(obj);
    }
  }
  return objects;
}

/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                           ####### ####### ######                             │
 * │                           #          #    #     #                            │
 * │                           #          #    #     #                            │
 * │                           #####      #    ######                             │
 * │                           #          #    #                                  │
 * │                           #          #    #                                  │
 * │                           #          #    #                                  │
 * │                                                                              │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

// function downloadFTPFile(file) {
//   clientFTP.get(path.join(ftpfolder, file), function(err, stream) {
//     if (err) {
//       //myLog("ERRORE FTP ",err);
//     }
//     // stream.once('close',function () {
//     //   //clientFTP.end()
//     // })
//     w = fs.createWriteStream(path.join(dataPath, file))
//     stream.pipe(w)
//     w.on('finish', function() {
//       //myLog("IL FILE MANCANTE È STATO SCARICATO");
//     })
//   })
// }
// clientFTP.on('ready', function() {
//
//   //myLog("PATH JOIN", path.join(ftpfolder, filename));
//   clientFTP.get(ftpfolder + '/' + filename, function(err, stream) {
//     if (err) {
//       throw err;
//     }
//     //myLog("STREAM ",stream);
//     //myLog("IL FILE PESA ",stream.size);
//     stream.once('close', function() {
//       clientFTP.end();
//
//     })
//     w = fs.createWriteStream(path.join(dataPath, filename));
//     //myLog("\n\n\n--------------------------------------");
//     //myLog("           SCRIVO FILE W");
//     //myLog("--------------------------------------\n\n\n");
//
//     stream.pipe(w)
//
//     w.on('finish', function(a) {
//       //myLog("\n\n\n--------------------------------------");
//       //myLog("           DOWNLOAD DB COMPLETO",a);
//       //myLog("--------------------------------------\n\n\n");
//
//       maindb = openDB(path.join(dataPath, filename));
//
//       //myLog("HABEMUS DATATABSE");
//
//       syncToSoap(soapurl, soapargs)
//
//
//
//       //myLog("QUERY FILE ",queryFile);
//     })
//
//     w.on('data', function(buffer) {
//       var segmentLength = buffer.length;
//       uploadSize += segmentLength;
//       //myLog("Progress:\t((uploadedSize/f.size*100).toFixed(2)+" % ")");
//     })
//     w.on('open', function(fd) {
//       //myLog("OPEN EVENT ",fs.existsSync(path.join(DOCUMENTS, 'data', filename)));
//       mainWindow.webContents.send('onSyncStart', true)
//     });
//     w.on('end', function() {
//       //myLog("END EMITTED");
//     })
//   })
// })
// clientFTP.on('error', function(error) {
//   //myLog("SI E VERIFICATO UN ERRORE ", error);
//   /* Act on the event */
// });
//
// function httpsDownload(fileName) {
//  //myLog("DOWNLOAD FROM HTTPS", fileName);
//
//   var options = {
//     hostname: 'lookin.fbarile.it',
//     path: '/Lookin/data/' + fileName,
//     port: 443,
//     rejectUnauthorized: false,
//     requestCert: false,
//     headers: {
//       'Authorization': secureAuth
//     },
//     strictSSL: false,
//     agent: false
//   }
//   var file = fs.createWriteStream(path.join(dataPath, fileName))
//   const req = https.request(options, (res) => {
//    //myLog('statusCode:', res.statusCode);
//    //myLog('headers:', res.headers);
//    //myLog("WHOLE ", res);
//     res.pipe(file)
//     res.on('data', (data) => {
//      //myLog("DATA", data);
//     })
//     res.on('end', () => {
//      //myLog("FINITO");
//     })
//
//   })
//   req.on('error', (e) => {
//    console.error(e);
//   });
//   req.end();
// }


function myLog() {
  data = '';
  for (var i = 0; i < arguments.length; i++) {
    if (typeof(arguments[i]) == 'Object') {
      o = arguments[i];
      for (var v in o) {
        data += "{" + v + " | " + o[v] + "}";
      }
    } else {
      data += arguments[i] + " | ";
    }

  }
  fs.appendFile(path.join(app.getPath('documents'), 'lookin', 'log.txt'), "[" + moment().format("YYYY-MM-DD - hh:mm:ss") + "]\t => " + data + "\r\n", function(err) {

  })
}
