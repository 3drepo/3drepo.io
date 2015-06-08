/**
 *  Copyright (C) 2015 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var os = require('os');
var platform = os.platform();
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');


/*
 * This is the set of scripts in public folder that need to be used for debug mode.
 */
var public_files = {
	js: {
		x3domjs: '/public/js/external/x3dom-full.debug.js',
		angularjs: '/public/js/external/angular.js',
		ammojs: '/public/js/external/ammo.js',
		jqueryjs : '/public/js/external/jquery.js',
		jqueryuijs : '/public/js/external/jquery-ui.js',
		angularutilsjs: '/public/js/external/angular-ui-utils.min.js',
		angularrouterjs: '/public/js/external/angular-ui-router.js',
		angularbsmulti: '/public/js/external/angular-bootstrap-multiselect.js',
		bootstrapjs: '/public/js/external/bootstrap.min.js',
		bootstrapdialog: '/public/js/external/bootstrap-dialog.min.js',
		bootstrapselectjs: '/public/js/external/bootstrap-select.js',
		uibootstrap: '/public/js/external/ui-bootstrap-tpls-0.12.0.min.js',
		showdownjs: '/public/js/external/showdown.min.js',
		jqueryfancytree: '/public/js/external/jquery.fancytree-all.js',
		x3dcontroller: '/public/js/x3dcontroller.js',
		typeaheadjs: '/public/js/external/typeahead.bundle.js',

		// QR Code stuff
		qrgrid: '/public/js/external/qrcode/grid.js',
		qrversion: '/public/js/external/qrcode/version.js',
		qrdetector: '/public/js/external/qrcode/detector.js',
		qrformatinf: '/public/js/external/qrcode/formatinf.js',
		qrerrorlevel: '/public/js/external/qrcode/errorlevel.js',
		qrbitmat: '/public/js/external/qrcode/bitmat.js',
		qrdatablock: '/public/js/external/qrcode/datablock.js',
		qrbmparser: '/public/js/external/qrcode/bmparser.js',
		qrdatamask: '/public/js/external/qrcode/datamask.js',
		qrrsdecoder: '/public/js/external/qrcode/rsdecoder.js',
		qrgf256poly: '/public/js/external/qrcode/gf256poly.js',
		qrgf256: '/public/js/external/qrcode/gf256.js',
		qrdecoder: '/public/js/external/qrcode/decoder.js',
		qrqrcode: '/public/js/external/qrcode/qrcode.js',
		qrfindpat: '/public/js/external/qrcode/findpat.js',
		qralignpat: '/public/js/external/qrcode/alignpat.js',
		qrdatabr: '/public/js/external/qrcode/databr.js'
	},

	css : {
		x3domcss : '/public/css/external/x3dom.css',
		fontawesomecss: '/public/css/external/font-awesome.min.css',
		fancytreecss: '/public/css/external/ui.fancytree.min.css',
		bootstrapselectcss: '/public/css/external/bootstrap-select.css',
		bootstrapcss: '/public/css/external/bootstrap.min.css',
		jqueryuicss: '/public/css/external/jquery-ui.css',
		repouicss : '/public/css/ui.css'
	}
}

/*
 * This is a set of scripts that needs to be minified(if appropriate), symlinked to the public folder
 */
var internal_files = {
	bower_qr_files: [
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
	],

	bower_files: [
	'bower_components/angular/angular.js',
	'bower_components/angular/angular.min.js.map',
	'bower_components/angular-bootstrap-multiselect/angular-bootstrap-multiselect.js',
	'bower_components/angular-bootstrap-select/build/angular-bootstrap-select.js',
	'bower_components/bootstrap-select/bootstrap-select.js',
	'bower_components/bootstrap-select/bootstrap-select.css',
	'bower_components/fancytree/dist/jquery.fancytree-all.js',
	'bower_components/jquery/dist/jquery.js',
	'bower_components/jquery-ui/jquery-ui.js',
	'bower_components/masonry/masonry.js'
	],

	x3dom_files: [
	'submodules/x3dom/dist/ammo.js',
	'submodules/x3dom/dist/x3dom.debug.js',
	'submodules/x3dom/dist/x3dom-full.debug.js'
	]
}

var public_dir_js	= path.normalize("public/js/external");
var public_dir_css	= path.normalize("public/css/external");

install_bower();
install_x3dom();
write_common_files_list();

/*
 * install bower components and publicize the relevant files.
 */
function install_bower(){
	var public_qr_dir = path.join(public_dir_js, 'qrcode')
	fs.stat(public_qr_dir, function(err, stat){
		if(err !== null){
			//create qr folder in $public_dir_js if it doesn't exist
			exec('mkdir ' + public_qr_dir , standard_callback);

		}

		exec(path.normalize('node_modules/.bin/bower') + ' install', function (error, stdout, stderr) {
			  if (error !== null) {
			    console.log(error);
			  } else {
			    console.log('Bower install was successful.');
			  }

				//create symlinks on callback to ensure the files exist (or windows will be unhappy)
				publicize_files(internal_files.bower_files, public_dir_js, public_dir_css);
				//qr files are in a separate list as they need to be put inside $public_dir_js/qrcode
				publicize_files(internal_files.bower_qr_files, public_qr_dir, public_dir_css);
				//FIXME: if we ever need to minify an x3dom file this might cause a problem. Ideally we should split it like js.
				minify_css();
			});
	});
}

/*
 * install x3dom and publicize the relevant files.
 */
function install_x3dom(){

	exec('cd ' + path.normalize('submodules/x3dom') + ' && python manage.py --build && cd '+ path.normalize('../../'),
			function (error, stdout, stderr) {
				if (error !== null) {
					console.log(error);
				}
				else{
					console.log('X3Dom installation successful!');
				}

				//create symlinks on callback to ensure the files exist (or windows will be unhappy)
				publicize_files(internal_files.x3dom_files, public_dir_js, public_dir_css);
			});

}

/*
 * Create a symbolic link of file to target_dir.
 *
 * For windows: mklink /H dest src
 * For linux:   ln -s src dest
 */
function make_symlink(file, target_dir){
	var fname = path.normalize(file);
	var target_path = path.join(target_dir, path.basename(fname)) ;

	if (platform === 'win32') {
		//TODO: check file exists before calling this.
		exec('mklink /H ' + target_path + ' '+ fname);
	}
	else if(platform === 'linux' || platform === 'darwin'){
		var numberofdirs = target_dir.match(/\//g).length + 1;
		var inversedir = Array.apply(null, new Array(numberofdirs)).map(function() { return "..";} ).join('/') + "/";

		exec('ln -sf ' + (inversedir + fname) + ' ' + target_dir, standard_callback);
	}
	else{
		console.error('Unknown environment:'+ platform +'. Please contact 3D Repo for further assistance.');
		process.exit(1);
	}
}

/*
 * minify(file, target_dir)
 * minifies file and place the output in target_dir. The function returns the path to the output file.
 *
 * If the file is not a .js or .cs, return null.
 * If the file is already minified, return null.
 * If there is already a .min version of the file, copy over the min file. (this is for
 * the sake of things like bower_components where some files already have a min version.)
 *
 */
function minify(file, target_dir){
	//if the file is not js or css, ignore.
	var ext = path.extname(file);
	var output_path = path.join(target_dir, path.basename(file, ext) +  '.min'+ext);

	if(!ext.match(/(js|css)/)){
		return null;
	}

	//if the file is already a min file, return null.
	if(file.match(/.min.(js|css)/)){
		return null;
	}

	//check if the min.file already exist in the same directory. if so, just symlink it over.
	var min_file_name = path.join(path.dirname(file), path.basename(file, ext) +  '.min'+ext);
	fs.stat(min_file_name, function(err, stat){
		if (err !== null){
			//doesn't exist, minify it.
			exec(path.normalize('node_modules/.bin/minify') + ' -o '+ output_path + ' ' + file, function(err,stdout,stderr){
				if(err !== null){
					console.log(err);
				}
				else{
					console.log('Minification complete: ' + output_path);
				}
			});

		}
		else{
			//min file exists, symlink it if it's not in the same directory.
			if(path.dirname(min_file_name) !== path.normalize(target_dir)){
				make_symlink(min_file_name, target_dir);
			}

		}
	});

	return output_path;

}

function minify_css(){
	for (var mem in public_files.css) {
        if (public_files.css.hasOwnProperty(mem)) {
        	var file = public_files.css[mem];
        	minify(file.substring(1), path.dirname(file).substring(1));
        }
    }
}

/*
 * publicize_files(flist, target_dir)
 * Publicize a list of given files(flist), and their minified version where appropriate, in target_dir.
 */
function publicize_files(flist, target_dir_js, target_dir_css){
	var index;
	for (index = 0; index < flist.length; index++){
		var target_dir = path.extname(flist[index]) === '.css' ? target_dir_css : target_dir_js;
		make_symlink(flist[index], target_dir);
		minify(flist[index], target_dir);
	}

}

/*
 * standard callback commonly used in this script - hiding stdout, dumping out the error if any.
 */
var standard_callback = function(error, stdout, stderr){
	if (error !== null) {
		console.log(error);
	}
}

/*
 * Create common_public_files.js
 */
function write_common_files_list(){
	var wstream = fs.createWriteStream('common_public_files.js')
	//FIXME: is this a good idea? create the things to write in a string buffer and write it all at once.
	//FIXME: minify CSS

	var files_to_str = obj_to_string(public_files, 'debug_scripts', false);
	var min_files_to_str = obj_to_string(public_files, 'prod_scripts', true);

	wstream.once('open', function(fd){
		wstream.write('/*\n * ========== !!!! DO NOT ALTER THIS FILE !!!! =======\n');
		wstream.write(' * This file is automatically generated by postinstall.js\n');
		wstream.write(' * To add/del/modify files listed in this file, \n');
		wstream.write(' * please modify the public files object inside postinstall.js and run node postinstall.js\n*/\n');
		wstream.write('module.exports = {\n');
		wstream.write(files_to_str);
		wstream.write(',\n');
		wstream.write(min_files_to_str);
		wstream.write('\n}');
		wstream.end();
	});

}


function obj_to_string(obj, name, convert_to_min){
	var output_str = '\t' + name + ':{\n';
	var isFirst = true;
	var isFirst_lv2 = true;
	for (var mem in obj) {
        if (obj.hasOwnProperty(mem)) {
        	if(!isFirst){
        		output_str += ',\n';
        	}
        	isFirst = false;
        	output_str += '\t\t' + mem + ' :{\n';
        	lv1_obj = obj[mem];
        	isFirst_lv2 = true;
        	for (var memlv2 in obj[mem]) {
                if (lv1_obj.hasOwnProperty(memlv2)) {
                	if(!isFirst_lv2){
                		output_str += ',\n';
                	}
                	isFirst_lv2 = false;

                	var file = lv1_obj[memlv2];

                	//make sure the file is not already .min.[js|css].
                	var write_min = !path.basename(file).match(/.min.(js|css)/) && convert_to_min;
                	if(write_min){
                		//if convert_to_min is flagged change .[js|css] to .min.[js|css]
                		var ext = path.extname(file);
                		file = path.join(path.dirname(file), path.basename(file, ext) +  '.min'+ext);
                	}

                	//replace all \ to / as \ is an escape character...
                	file = file.replace(/\\/g, '/');
                	output_str += '\t\t\t' + memlv2 + ': "' + file + '"';

                }
            }
        	output_str += '\n\t\t}';

        }
    }


	return output_str + '\n\t}';
}
