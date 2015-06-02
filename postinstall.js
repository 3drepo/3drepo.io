
var os = require('os');
var platform = os.platform();

var path = require('path');
var exec = require('child_process').exec;


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

var x3dom_files = [
'submodules/x3dom/dist/ammo.js',
'submodules/x3dom/dist/x3dom.debug.js',
'submodules/x3dom/dist/x3dom-full.debug.js'
];

 

exec(path.normalize('node_modules/.bin/bower') + ' install', function (error, stdout, stderr) {
  console.log(stdout);

  if (error !== null) {
    console.log(error);
  } else {
    console.log('Bower install was successful.');
  }
	make_symlinks(bower_files);
});


exec('cd ' + path.normalize('submodules/x3dom') + ' && python manage.py --build && cd '+ path.normalize('../../'), 
		function (error, stdout, stderr) {
			console.log(stdout);
			if (error !== null) {
				console.log(error);
			} 
			else{
				console.log('X3Dom installation successful!');
			}
			
			//create symlinks on callback to ensure the files exist (or windows will be unhappy)
			make_symlinks(x3dom_files);
		});


function make_symlinks(flist){
	if (platform === 'win32') {
		var index;
		for (index = 0; index < flist.length; index++){
			var fname = path.normalize(flist[index]);
			exec('mklink /H ' + path.join(public_dir, path.basename(fname)) + ' '+ fname , function (error, stdout, stderr) {
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
			exec('ln -s ' + fname + ' ' + path.join(public_dir, path.basename(fname)), function (error, stdout, stderr) {
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
