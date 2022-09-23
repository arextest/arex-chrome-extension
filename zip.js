var adm_zip = require("adm-zip");

//creating archives
var zip = new adm_zip();
zip.addLocalFolder("./dist");
zip.writeZip("./arex-chrome-extension.zip");
