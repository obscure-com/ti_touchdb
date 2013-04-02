var TiTouchDB = require('com.obscure.titouchdb');

/**
 * Generate the "canned" database.  There are many ways to do this, including:
 * 
 * 1. Running your app in the simulator and entering the data by hand.
 * 2. Creating a utility app to generate or enter data.
 * 3. Replicating data from a CouchDB server.
 * 
 * In this demo, we create the database documents from an array of data.  This
 * technique would not be suitable for large datasets.
 */
function generateDB() {
  var db = TiTouchDB.databaseManager.createDatabaseNamed('elements');
  var elements = [[1, "Hydrogen", "H"], [2, "Helium", "He"], [3, "Lithium", "Li"], [4, "Beryllium", "Be"], [5, "Boron", "B"], [6, "Carbon", "C"], [7, "Nitrogen", "N"], [8, "Oxygen", "O"], [9, "Fluorine", "F"], [10, "Neon", "Ne"], [11, "Sodium", "Na"], [12, "Magnesium", "Mg"], [13, "Aluminium", "Al", "http://0.tqn.com/d/chemistry/1/6/q/V/1/Aluminium.jpg"], [14, "Silicon", "Si"], [15, "Phosphorus", "P"], [16, "Sulfur", "S"], [17, "Chlorine", "Cl"], [18, "Argon", "Ar"], [19, "Potassium", "K"], [20, "Calcium", "Ca"], [21, "Scandium", "Sc"], [22, "Titanium", "Ti"], [23, "Vanadium", "V"], [24, "Chromium", "Cr"], [25, "Manganese", "Mn"], [26, "Iron", "Fe"], [27, "Cobalt", "Co", "http://0.tqn.com/d/chemistry/1/6/I/Z/1/cobalt.jpg"], [28, "Nickel", "Ni"], [29, "Copper", "Cu"], [30, "Zinc", "Zn"], [31, "Gallium", "Ga", "http://0.tqn.com/d/chemistry/1/6/H/Q/gallium.jpg"], [32, "Germanium", "Ge"], [33, "Arsenic", "As"], [34, "Selenium", "Se"], [35, "Bromine", "Br"], [36, "Krypton", "Kr"], [37, "Rubidium", "Rb"], [38, "Strontium", "Sr"], [39, "Yttrium", "Y"], [40, "Zirconium", "Zr"], [41, "Niobium", "Nb"], [42, "Molybdenum", "Mo"], [43, "Technetium", "Tc"], [44, "Ruthenium", "Ru"], [45, "Rhodium", "Rh"], [46, "Palladium", "Pd"], [47, "Silver", "Ag"], [48, "Cadmium", "Cd"], [49, "Indium", "In"], [50, "Tin", "Sn"], [51, "Antimony", "Sb"], [52, "Tellurium", "Te"], [53, "Iodine", "I"], [54, "Xenon", "Xe"], [55, "Caesium", "Cs"], [56, "Barium", "Ba"], [71, "Lutetium", "Lu"], [72, "Hafnium", "Hf"], [73, "Tantalum", "Ta"], [74, "Tungsten", "W"], [75, "Rhenium", "Re"], [76, "Osmium", "Os"], [77, "Iridium", "Ir"], [78, "Platinum", "Pt"], [79, "Gold", "Au"], [80, "Mercury", "Hg"], [81, "Thallium", "Tl"], [82, "Lead", "Pb"], [83, "Bismuth", "Bi", "http://0.tqn.com/d/chemistry/1/6/m/Q/bismuth.jpg"], [84, "Polonium", "Po"], [85, "Astatine", "At"], [86, "Radon", "Rn"], [87, "Francium", "Fr"], [88, "Radium", "Ra"], [103, "Lawrencium", "Lr"], [104, "Rutherfordium", "Rf"], [105, "Dubnium", "Db"], [106, "Seaborgium", "Sg"], [107, "Bohrium", "Bh"], [108, "Hassium", "Hs"], [109, "Meitnerium", "Mt"], [110, "Darmstadtium", "Ds"], [111, "Roentgenium", "Rg"], [112, "Copernicium", "Cn"], [113, "Ununtrium", "Uut"], [114, "Ununquadium", "Uuq"], [115, "Ununpentium", "Uup"], [116, "Ununhexium", "Uuh"], [117, "Ununseptium", "Uus"], [118, "Ununoctium", "Uuo"], [57, "Lanthanum", "La"], [58, "Cerium", "Ce"], [59, "Praseodymium", "Pr"], [60, "Neodymium", "Nd"], [61, "Promethium", "Pm"], [62, "Samarium", "Sm"], [63, "Europium", "Eu"], [64, "Gadolinium", "Gd"], [65, "Terbium", "Tb"], [66, "Dysprosium", "Dy"], [67, "Holmium", "Ho"], [68, "Erbium", "Er"], [69, "Thulium", "Tm"], [70, "Ytterbium", "Yb"], [89, "Actinium", "Ac"], [90, "Thorium", "Th"], [91, "Protactinium", "Pa"], [92, "Uranium", "U"], [93, "Neptunium", "Np"], [94, "Plutonium", "Pu"], [95, "Americium", "Am"], [96, "Curium", "Cm"], [97, "Berkelium", "Bk"], [98, "Californium", "Cf"], [99, "Einsteinium", "Es"], [100, "Fermium", "Fm"], [101, "Mendelevium", "Md"], [102, "Nobelium", "No"]];
  
  function saveAttachment(doc, url) {
    var client = Ti.Network.createHTTPClient({
      onload: function(e) {
        var rev = doc.newRevision();
        rev.addAttachment('image.jpg', 'image/jpeg', client.responseData);
        rev.save();
      }
    });
    client.open('GET', url);
    client.send();
  }
  
  for (i=0; i < elements.length; i++) {
    var e = elements[i];
    var doc = db.untitledDocument();
    doc.putProperties({
      type: 'element',
      atomic_number: e[0],
      name: e[1],
      symbol: e[2]
    });
    if (e[3]) {
      saveAttachment(doc, e[3]);
    }
  }
}


/**
 * Copy all the files from the specified source directory to the specified
 * destination directory, creating the destination if necessary.
 * 
 * @param {Object} src
 * @param {Object} dest
 */
function copydir(src, dest) {
  Ti.API.info("copying "+src+" to "+dest);
  if (!src.exists()) {
    alert('source directory does not exist: '+src);
  }
  if (!dest.exists()) {
    dest.createDirectory();
  }
  
  var srcfiles = src.getDirectoryListing() || [];
  for (i=0; i < srcfiles.length; i++) {
    var srcfile = Ti.Filesystem.getFile(src.path, srcfiles[i]);
    
    if (srcfile.getDirectoryListing()) {
      // skip directories
      // isFile() and isDirectory() aren't on iOS yet, see https://jira.appcelerator.org/browse/TIMOB-12414
      Ti.API.info("skipping directory "+srcfile.name);
      continue;
    }
    
    var destfile = Ti.Filesystem.getFile(dest.path, srcfiles[i]);
    destfile.createFile();

    /*
     * We have to read the file bytes here because the Titanium build process doesn't
     * actually copy files from Resources/assets into the generated app; it creates
     * symlinks instead.  TiTouchDB won't read from a symlink (or at least one that is
     * outside of the app filesystem). 
     */
    var instr = srcfile.open(Ti.Filesystem.MODE_READ);
    var outstr = destfile.open(Ti.Filesystem.MODE_WRITE);
    var buf = Ti.createBuffer({ length: 4096 });
    var c;
    while ((c = instr.read(buf, 0, buf.length)) > 0) {
      outstr.write(buf, 0, c);
    }
    Ti.API.info('copied '+srcfile.path);
  }
}

function copyDatabaseFiles() {
  var srcdir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'assets', 'CouchbaseLite');
  var destdir = Ti.Filesystem.getFile(Ti.Filesystem.applicationSupportDirectory, 'CouchbaseLite');
  copydir(srcdir, destdir);

  srcdir = Ti.Filesystem.getFile(srcdir.path, 'elements attachments');
  destdir = Ti.Filesystem.getFile(destdir.path, 'elements attachments');
  copydir(srcdir, destdir);
}

var win = Ti.UI.createWindow({
  backgroundColor: 'white'
});

var tableView = Ti.UI.createTableView({
});
win.add(tableView);

win.addEventListener('open', function(e) {
  var db = TiTouchDB.databaseManager.databaseNamed('elements');
  if (!db) {
    copyDatabaseFiles();
    db = TiTouchDB.databaseManager.databaseNamed('elements');
    if (!db) {
      alert("Error copying database files!");
      return;
    }
    Ti.API.info("copied database files");
  }

  var query = db.queryAllDocuments();
  query.prefetch = true;
  var rows = query.rows();
  var data = [];
  while (row = rows.nextRow()) {
    var props = row.documentProperties;
    data.push({
      title: String.format("%s (%s)", props.name, props.symbol)
    });
  }
  tableView.setData(data);
});

win.open();
