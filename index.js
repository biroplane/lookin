var express = require("express");
var restapi = express();
var bodyParser = require('body-parser');
var md5 = require('md5');
var soap = require('soap');
var http = require('http');
var $ = require('jquery');
var moment = require('moment');
//var $=require('jQuery')();


const {
  ipcMain
} = require('electron');


const {
  crashReporter
} = require('electron')


//var ipcRenderer = require('electron').ipcRenderer;
//var router= express.Router();
//restapi.use(express.static(__dirname));
//restapi.use(express.errorHandler())
const electron = require('electron');
//var ejse = require('ejs-electron');
const app = electron.app;

app.commandLine.appendSwitch('--enable-experimental-web-platform-features')
const BrowserWindow = electron.BrowserWindow
const port = process.env.PORT || 3000;
//console.log(" PORTA ", port);
let mainWindow
let windows = []
//var ejs = new electronEjs({key:'val'},{});
//restapi.engine('.html', require('pug').__express)

const ejs = require('ejs');
let allrows;
let columns;


require('sql.js');
var fs = require("fs");
var os = require("os");
//Ditto, path module
var path = require('path');
var ftp = require('ftp');

//let maindb;
global.maindb;
global.report;

dataPath = ''
var queryFile = ''
//console.log("file delle query",queryFile);

//var checkLine = require('./mod/checkLine.js');
//console.log("CHECK LINE", checkLine);
const DOCUMENTS = app.getPath('documents');
console.log("CARTELLA DOCUMENTI", DOCUMENTS);

function startupCheck() {

  if (fs.existsSync(path.join(DOCUMENTS, 'lookin'))) {
    //console.log("la cartella esiste, puoi scriverci su");
    if (fs.existsSync(path.join(DOCUMENTS, 'lookin', 'data'))) {
      //console.log("LA CARTELLA DATA ESISTE");
      queryFile=JSON.parse(fs.readFileSync(path.join(DOCUMENTS,'lookin','data','query.json')));
    } else {
      fs.mkdirSync(path.join(DOCUMENTS, 'lookin', 'data'))
    }

  } else {

    fs.mkdirSync(path.join(DOCUMENTS, 'lookin'))
    fs.mkdirSync(path.join(DOCUMENTS, 'lookin', 'data'))
    //console.log("la cartella non esiste, CREALA e SYNC");
  }
  dataPath = path.join(DOCUMENTS, 'lookin')
  //
  //console.log("DATAPATH ",dataPath);
  //downloadDBFile()
}



clientFTP = new ftp();
ftploging = {
  host: "192.168.43.202",
  user: 'bfscuser',
  password: 'Lop2341'
};
var ftpfolder = 'test_sync';
var filename = "lookin.db";
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

ipcMain.on('onSoapSync', (evt, arg) => {
  //console.log(soapargs);
  syncToSoap(soapurl, soapargs)
})
ipcMain.on('onSoapLogin', (evt, arg) => {
 //console.log("LOGIN VIA SOAP", arg);
  soapLogin(soapurl, arg)
})


ipcMain.on('setUserId', (evt, arg) => {
 //console.log("ARG", arg);
  soapargs = arg;
  global.loggato = true;
  evt.sender.send('utenteLoggato', global.loggato)
  //startupCheck()
  //downloadDBFile()
})
ipcMain.on('onCreateView', (evt, arg) => {
 //console.log("CREO LA VIEW ",arg);
  global.report = arg
  //evt.sender.send()
})
ipcMain.on('downloadDBFile', (evt, arg) => {
  //console.log("EVT ",evt," ARG ",arg);

  downloadDBFile()
})

//var maindb;
startupCheck();
console.log("MAIN DATAPATH", path.join(dataPath,'data',filename));
maindb = openDB(path.join(dataPath,'data',filename));

var UID = 0;
////console.log(global);
restapi.engine("ejs", ejs.__express)
restapi.use(express.static(__dirname + "/public"));
restapi.set('views', __dirname + '/views');
restapi.set('view engine', 'ejs');
restapi.use(bodyParser.urlencoded({
  extended: false
}));
restapi.use(bodyParser.json());

/* ┌─────────────────────────────────────┐
 * │          +-+-+-+-+-+-+-+-+          │
 * │           D|O|W|N|L|O|A|D           │
 * │          +-+-+-+-+-+-+-+-+          │
 * └─────────────────────────────────────┘
 */

function downloadDBFile() {
  //TRIGGER SYNC
  try {

    clientFTP.connect(ftploging)
    myLog(clientFTP)
  } catch (err) {
    myLog(err)
  }
}

/* ┌─────────────────────────────────────┐
 * │          +-+-+-+-+-+-+-+-+          │
 * │          |D|A|T|A|B|A|S|E|          │
 * │          +-+-+-+-+-+-+-+-+          │
 * │             +-+-+-+-+-+             │
 * │             |C|A|L|L|S|             │
 * │             +-+-+-+-+-+             │
 * └─────────────────────────────────────┘
 */
restapi.get("/view/:viewname/", (req, res) => {
  //var datalog = req.params.datalog;
  var viewname = req.params.viewname;
  var str = '';

  req.query._ = null;
  //console.log("RES QUERY ", req.query.columns[2].search);
  if (Object.keys(req.query).length !== 0) {
    //console.log("QUERY STRING ",req.query);

    var qs = req.query;

    excludequery = ['draw', 'columns', 'column', 'data']
    c = 0
    for (var q in qs) {
      if (qs[q] != '' && q != '_' && q != 'draw' && q != 'columns' && q != 'search' && q != 'length' && q != 'start') {
        if (c == 0) {
          str += " AND ";
        }
        //console.log("DATA QUERY", qs[q], " Q ", q);
        if (q == 'DATA_LOG' || q == 'WEEK' || q == 'MONTH' || q == 'YEAR') {
          str += q + '>"' + qs[q] + '" AND ';
        } else {
          str += q + '="' + qs[q] + '" AND ';
        }
        c++;

      }
    }

    str = (str.substr(str.length - 4) == 'AND ') ? str.substring(0, str.length - 4) + ' ' : str;
    //console.log("QUERY FILTER ",str);
  } else {
    if (str == '') {
      //if(viewname.match("DAY") || viewname.match("WEEK") || viewname.match("MONTH") || viewname.match("YEAR")){
      str += ' AND ';
      //}
    }
    var begin;

    //console.log("AUTOFILTER");
    if (viewname.match("DAY")) {

      begin = moment().subtract(1, 'months').format("YYYY-MM-DD");
      str += 'DATA_LOG>"' + begin + '"';
    }else
    if (viewname.match("WEEK")) {

      begin = moment().subtract(1, 'years').format("YY-WW");
      str += 'WEEK>"' + begin + '"';
    }else
    if (viewname.match("MONTH")) {

      begin = moment().subtract(1, 'years').format("YY-MM");
      str += 'MONTH>"' + begin + '"';
    }else
    if (viewname.match("YEAR")) {

      begin = moment().subtract(5, 'years').format("YYYY");
      str += 'YEAR>"' + begin + '"';
    }else
    if (viewname.match("ATTIVITA")) {
      begin = moment().subtract(15, 'days').format("YYYY-MM-DD");
      str += 'DATA_LOG>"' + begin + '"';
    }else{
       begin = moment().subtract(1, 'months').format("YYYY-MM-DD");
       str += 'DATA>"' + begin + '"';
    }
  }
  //console.log("BEFORE  ", str);
  //var columnname = req.params.columnname;
  var start = req.query.start || 0;
  var len = req.query.length || 25;
  //var query = "SELECT * FROM " + viewname + str+" LIMIT "+start+","+len;
  var qq = JSON.parse(JSON.stringify(getObjects(queryFile, 'nome', viewname)))
  query = qq[0].query
  query = query.replace("$s", str)
  //query+=  " LIMIT "+start+","+len
 //console.log("QUERY ", query);

  var jsonrows = [];
  var jsoncols = [];
  maindb.run("PRAGMA cache_size = 163840")
  maindb.run("PRAGMA synchronous=OFF")
  var stmt = maindb.prepare(query)
  // var rr = stmt.getAsObject();
  while (stmt.step()) {
    ////console.log("ROW ",stmt.getAsObject());
    jsonrows.push(stmt.getAsObject())
  }

  res.json({
    data: jsonrows
  });
  stmt.free();
})
restapi.get("/view/:viewname/:datalog", (req, res) => {
  var datalog = req.params.datalog;
  var viewname = req.params.viewname;
  //var columnname = req.params.columnname;
  var query = "SELECT * FROM " + viewname;
  if (datalog) {
    query += " WHERE DATA_LOG>'" + datalog + "'";
  }
  var jsonrows = [];
  var jsoncols = []
  var rr = maindb.each(query, function(row) {
    jsonrows.push(row);
  });
  //rr=JSON.parse(JSON.stringify(rr));
  // maindb.each("SELECT * FROM BFS_APP_VIEWCOLUMNS JOIN BFS_APP_COLUMNS ON ID_COLUMN=ID WHERE VIEW_NAME = '" + viewname + "'", function(cols) {
  //   jsoncols.push(cols);
  // });
  res.render("home", {
    title: "Hey",
    viewname: viewname,
    dates: datalog,
    rows: jsonrows,
    // columns: jsoncols
  });
})

restapi.get("/data/:view", (req, res) => {
  var view = req.params.view;
  var cols = getObjects(global.report, 'name', view);
  //console.log("COLONNE ",req);

  res.render("tableview", {
    report: global.report,
    query: req.query
  });
  //console.log(global.report);
})
restapi.get("/server/:view", (req, res) => {
  var view = req.params.view;
  var cols = getObjects(global.report, 'name', view);
  //console.log("COLONNE ",req);

  res.render("home", {
    report: global.report,
    query: req.query
  });
  //console.log(global.report);
})
restapi.get("/server/data/:viewname", (req, res) => {
  var viewname = req.params.viewname;
  var start = req.query.start || 0;
  var len = req.query.length || 25;
  var qq = JSON.parse(JSON.stringify(getObjects(queryFile, 'nome', viewname), null, 2))
  //console.log("QQ ",qq[0].query);
  var query = "SELECT * FROM " + viewname + " LIMIT " + start + "," + len;

  //console.log("QUERY ", query);
  var jsonrows = [];
  var jsoncols = [];
  //qq+=" LIMIT "+start+","+len
  query = qq[0].query + " LIMIT " + start + "," + len
  query = query.replace("$s", ' AND DATA_OP>"2017-03-01" ');
  //console.log("QQ ",query);
  var stmt = maindb.prepare(query.toString())
  // var rr = stmt.getAsObject();
  while (stmt.step()) {
    ////console.log("ROW ",stmt.getAsObject());
    jsonrows.push(stmt.getAsObject())
  }
  //  var rr = maindb.each(query, function(row) {
  //    jsonrows.push(row);
  //  });
  //rr=JSON.parse(JSON.stringify(rr));
  //  maindb.each("SELECT * FROM BFS_APP_VIEWCOLUMNS JOIN BFS_APP_COLUMNS ON ID_COLUMN=ID WHERE VIEW_NAME = '" + viewname + "'", function(cols) {
  //    jsoncols.push(cols);
  //  });

  res.json({
    data: jsonrows
  });
  stmt.free();
})


/* ┌─────────────────────────────────────┐
 * │             +-+-+-+-+-+             │
 * │             |L|O|G|I|N|             │
 * │             +-+-+-+-+-+             │
 * └─────────────────────────────────────┘
 */
restapi.get("/loguser/:username/:password", (req, res) => {
  var data = {};
  data.username = md5(req.params.username);
  data.password = md5(req.params.password);
  maindb.each("SELECT * FROM BFS_APP_USERS WHERE USER_NAME='" + req.params.username + "' AND PSW='" + req.params.password + "' LIMIT 1", function(usr) {
    data.user = usr;
  });
  //data.user=user;
  res.send(data);
})
// restapi.post("/data", function(res, req) {
//
// })
restapi.listen(port);



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 560,
    titleBarStyle: 'hidden-inset',
    resizable: false,
    x: 0,
    y: 0
  })

  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.webContents.on('did-finish-load',function () {
  //  //console.log("CARICATO! CONTROLLO LA CARTELLA");
  //   startupCheck()
  // })
  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function() {
    mainWindow = null
  })
  mainWindow.webContents.on('crashed', function(a, b, c) {
    //console.log("CRASH",a,b,c);
  })
}

app.on('ready', function() {
  createWindow();
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

/* ┌─────────────────────────────────────┐
 * │              +-+-+-+-+              │
 * │              |S|O|A|P|              │
 * │              +-+-+-+-+              │
 * └─────────────────────────────────────┘
 */
var soapurl = "http://192.168.43.214/LookinWebserviceTest/LookinWebService.asmx?wsdl&op=GetSyncString_AnaSupervisori";

function soapLogin(soapurl, args) {
  soap.createClient(soapurl, function(err, client) {
    client.LogIn(args, function(err, result) {
     //console.log("RISULTATI DEL LOG ONLINE", result);
      if (result.LogInResult == 1) {
       //console.log("LOG IN OK");
        soapargs = args
        global.loggato = true;
        //startupCheck()
        downloadDBFile()
      } else {
       //console.log("LOGIN ERRATO");
        mainWindow.webContents.send('wrongLogIn', true);
      }
    })
  })
}

function syncToSoap(soapurl, soapargs) {
 //console.log("SYNC TO SOAP");
  soap.createClient(soapurl, function(err, client) {

    client.GetJsonConfig(soapargs, function(err, result) {
     //console.log("FileJson CONFIG", soapargs);
      writeConfigFile('config.json', JSON.stringify(JSON.parse(result.GetJsonConfigResult), null, 2))

    })
    client.GetJsonQuery(soapargs, function(err, result) {
     //console.log("FileJson QUERY", soapargs);
      writeConfigFile('query.json', JSON.stringify(JSON.parse(result.GetJsonQueryResult), null, 2))
    })
    client.SyncDB(soapargs, function(err, result) {

      js = JSON.parse(result.SyncDBResult);
     //console.log("SYNC TO DB", js);
     //console.log("SYNC DB", js.length);
      if (js.length > 0 && js[0].OP !='') {
       //console.log("ESEGUO OPERAZIONI SUL DB",js);

        //console.log("OPERAZIONI", js[0].OP);
        maindb.run("BEGIN TRANSACTION;");
        try {
          //body...
          ob = js[0].OP;
          for (var p in ob) {
           //console.log("QUERY DEL DB", obj[p]);
            mindb.run(obj[p])
          }
          maindb.run("COMMIT;")
          writeDB(maindb, path.join(DOCUMENTS,"lookin","data",filename));
          maindb.close();
          maindb = openDB(path.join(DOCUMENTS,"lookin","data",filename));
        } catch (err) {
          maindb.run("ROLLBACK;")
        }
      } else {
        //console.log("NESSUNA OPERAZIONE DA EFFETTUARE, CARICA IL DB");
      }
      mainWindow.webContents.reload()
    })

  })

}

/* ┌─────────────────────────────────────┐
 * │          +-+-+-+-+-+-+-+-+          │
 * │          |D|A|T|A|B|A|S|E|          │
 * │          +-+-+-+-+-+-+-+-+          │
 * └─────────────────────────────────────┘
 */
function openDB(filename) {
  try {
    if (fs.existsSync(filename)) {
      filebuffer = fs.readFileSync(filename);
    } else {
      //filebuffer = fs.createWriteStream(path.join(dataPath, 'data', filename))
    }
  } catch (e) {
   //console.log(e);
  }

  if (filebuffer != null) {

    var db = new SQL.Database(filebuffer);
  } else {
   //console.log("SCRIVO UN NUOVO DB",filename,filebuffer);
    //var db = new SQL.Database();
  }
  return db;
}


function writeDB(db, name) {
  var binaryArray = db.export();

  var buffer = new Buffer(binaryArray);
  //console.log("QUERY RESULT OK", buffer);
  fs.writeFileSync(name, buffer);

  openDB(name);
}

function writeConfigFile(name, content) {
  //var buffer=new Buffer(content);
  fs.writeFileSync(path.join(dataPath, 'data', name), content);
 //console.log("SCRIVO IL FILE CONFIG");
  if(name=='config.json'){
  mainWindow.webContents.send('onWriteConfig', true)
  }
  if(name=='query.json'){
    queryFile=JSON.parse(fs.readFileSync(path.join(dataPath,'data','query.json')));
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

/* ┌─────────────────────────────────────┐
 * │              +-+-+-+-+              │
 * │             |F | T | P|             │
 * │              +-+-+-+-+              │
 * └─────────────────────────────────────┘
 */

clientFTP.on('ready', function() {

  clientFTP.size(path.join(ftpfolder, filename), function(err, bytes) {
    //console.log("TOTAL BYTES", (bytes / 1024) / 1024);
  })
  clientFTP.get(path.join(ftpfolder, filename), function(err, stream) {
    if (err) {
      throw err;
    }
    //console.log("STREAM ",stream);
    stream.once('close', function() {
      clientFTP.end();
    })
    w = fs.createWriteStream(path.join(dataPath, "data", filename));
   //console.log("\n\n\n--------------------------------------");
   //console.log("           SCRIVO FILE W");
   //console.log("--------------------------------------\n\n\n");

    stream.pipe(w)

    w.on('finish', function(a) {
     //console.log("\n\n\n--------------------------------------");
     //console.log("           DOWNLOAD DB COMPLETO",a);
     //console.log("--------------------------------------\n\n\n");

        maindb = openDB(path.join(dataPath,"data",filename));

       //console.log("HABEMUS DATATABSE");

        syncToSoap(soapurl, soapargs)



       //console.log("QUERY FILE ",queryFile);
    })
    w.on('data', function(buffer) {
      var segmentLength = buffer.length;
      uploadSize += segmentLength;
     //console.log("Progress:\t((uploadedSize/f.size*100).toFixed(2)+" % ")");
    })
    w.on('open', function(fd) {
      //console.log("OPEN EVENT ",fs.existsSync(path.join(DOCUMENTS, 'data', filename)));
      //mainWindow.webContents.send('onSyncStart',true)
    });
    w.on('end',function () {
     //console.log("END EMITTED");
    })
  })
})
clientFTP.on('error', function(error) {
 //console.log("SI E VERIFICATO UN ERRORE ", error);
  /* Act on the event */
});

function myLog(data) {
  fs.appendFile(path.join(__dirname, 'log.txt'), data + "\n\n\n\n", function(err) {

  })
}
