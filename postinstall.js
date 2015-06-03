
var os = require('os');
var platform = os.platform();

var path = require('path');
var exec = require('child_process').exec;

var fs = require('fs');


var public_dir = path.normalize("public/js/external");
	
var bower_files = [
'bower_components/angular/angular.js',
'bower_components/angular/angular.min.js',
'bower_components/angular/angular.min.js.map',
'bower_components/angular-bootstrap-multiselect/angular-bootstrap-multiselect.js',
'bower_components/angular-bootstrap-select/build/angular-bootstrap-select.js',
'bower_components/bootstrap-select/bootstrap-select.js',
'bower_components/fancytree/dist/jquery.fancytree-all.js',
'bower_components/jquery/dist/jquery.min.js',
'bower_components/jquery-ui/jquery-ui.js',
'bower_components/masonry/masonry.js'
];

var bower_qr_files = [
'bower_components/jsqrcode/src/grid.js',
'bower_components/jsqrcode/src/version.js',
'bower_components/jsqrcode/src/detector.js',
'bower_components/jsqrcode/src/formatinf.js',
'bower_components/jsqrcode/src/errorlevel.js',
'bower_components/jsqrcode/src/bitmat.js',
'bower_components/jsqrcode/src/datablock.js',
'bower_components/jsqrcode/src/bmparser.js',
'bower_components/jsqrcode/src/datamask.js',
'bower_components/jsqrcode/src/rsdecoder.js',
'bower_components/jsqrcode/src/gf256poly.js',
'bower_components/jsqrcode/src/gf256.js',
'bower_components/jsqrcode/src/decoder.js',
'bower_components/jsqrcode/src/qrcode.js',
'bower_components/jsqrcode/src/findpat.js',
'bower_components/jsqrcode/src/alignpat.js',
'bower_components/jsqrcode/src/databr.js'
];


var x3dom_files = [
'submodules/x3dom/dist/ammo.js',
'submodules/x3dom/dist/x3dom.debug.js',
'submodules/x3dom/dist/x3dom-full.debug.js'
];


var public_qr_dir = path.join(public_dir, 'qrcode') 
fs.stat(public_qr_dir, function(err, stat){
	if(err !== null){
		//create qr folder in $public_dir if it doesn't exist
		exec('mkdir ' + public_qr_dir , function (error, stdout, stderr) {
			if (error !== null) {
				console.log(error);
			} 
		});
		
	}
	
	exec(path.normalize('node_modules/.bin/bower') + ' install', function (error, stdout, stderr) {
		//  console.log(stdout);

		  if (error !== null) {
		    console.log(error);
		  } else {
		    console.log('Bower install was successful.');
		  }

			//create symlinks on callback to ensure the files exist (or windows will be unhappy)
			make_symlinks(bower_files, public_dir);
			//qr files are in a separate list as they need to be put inside $public_dir/qrcode
			make_symlinks(bower_qr_files, public_qr_dir);
		});
});




exec('cd ' + path.normalize('submodules/x3dom') + ' && python manage.py --build && cd '+ path.normalize('../../'), 
		function (error, stdout, stderr) {
//			console.log(stdout);
			if (error !== null) {
				console.log(error);
			} 
			else{
				console.log('X3Dom installation successful!');
			}
			
			//create symlinks on callback to ensure the files exist (or windows will be unhappy)
			make_symlinks(x3dom_files, public_dir);
		});


function make_symlinks(flist, target_dir){
	if (platform === 'win32') {
		var index;
		for (index = 0; index < flist.length; index++){
			var fname = path.normalize(flist[index]);
			var target_path = path.join(target_dir, path.basename(fname)) ;
			
			exec('mklink /H ' + target_path + ' '+ fname , function (error, stdout, stderr) {
				if (error !== null) {
					console.log(error);
				} 
			});
		}
	}
	else if(platform === 'linux'){

		var index;
		for (index = 0; index < flist.length; index++){
			var fname = path.normalize(flist[index]);
			var target_path = path.join(target_dir, path.basename(fname)) ;
			exec('ln -s ' + fname + ' ' + path.join(target_dir, path.basename(fname)), function (error, stdout, stderr) {
				if (error !== null) {
					console.log(error);
				} 
			});
		}	
	}
	else{
		console.error('Unknown environment:'+ platform +'. Please contact 3D Repo for further assistance.');
		process.exit(1);
	}	
}
