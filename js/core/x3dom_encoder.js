/**
 *  Copyright (C) 2014 3D Repo Ltd 
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

/* global module */

var C = require("./constants.js");
var repoGraphScene = require('./repoGraphScene.js');
var fs = require('fs');

var xml_dom = require('xmldom');
var dom_imp = xml_dom.DOMImplementation;
var xml_serial = xml_dom.XMLSerializer;

var config = require('app-config').config;

var logger = require('./logger.js');

var sem = require('semaphore')(10);

var json_cache = {};
var pbf_levels = 10;

function genPopCache(mesh) {
    if (!('pbf_cache' in GLOBAL)) {
        GLOBAL.pbf_cache = {};
        console.log('Created cache');
    }

    if (!(mesh['id'] in GLOBAL.pbf_cache)) {
        var bbox = extractBoundingBox(mesh);
        var valid_tri = Array(mesh.faces_count);
        var vertex_map = new Array(mesh.vertices_count);
        var vertex_quant_idx = new Array(mesh.vertices_count);
        var vertex_quant = new Array(mesh.vertices_count);

        var new_vertex_id = 0;

        var vertex_values = new Array(mesh.vertices_count);
        var tri = new Array(mesh.faces_count);
        var normal_values = new Array(mesh.vertices.count);

        var vert_num = 0;
        var vert_idx = 0;
        var comp_idx = 0;

        for (vert_num = 0; vert_num < mesh.vertices_count; vert_num++) {
            vertex_map[vert_num] = -1;

            vertex_values[vert_num] = [];
            normal_values[vert_num] = [];

            for (comp_idx = 0; comp_idx < 3; comp_idx++) {
                vertex_values[vert_num][comp_idx] = mesh.vertices.buffer.readFloatLE(12 * vert_num + 4 * comp_idx);
                normal_values[vert_num][comp_idx] = mesh.normals.buffer.readFloatLE(12 * vert_num + 4 * comp_idx);
            }
        }

        for (var tri_num = 0; tri_num < mesh.faces_count; tri_num++) {
            valid_tri[tri_num] = false;

            tri[tri_num] = [];

            for (vert_idx = 0; vert_idx < 3; vert_idx++) {
                tri[tri_num][vert_idx] = mesh.faces.buffer.readInt32LE(16 * tri_num + 4 * (vert_idx + 1));
            }
        }

        GLOBAL.pbf_cache[mesh['id']] = {};

        var lvl = 1;
        var buf_offset = 0;

        while (new_vertex_id < mesh.vertices_count) {
            console.log('Mesh ' + mesh['id'] + ' - Generating Level ' + lvl);
            var idx_buf = new Buffer(2 * 3 * mesh.faces_count);
            var vert_buf = new Buffer(12 * mesh.vertices_count);

            var vert_buf_ptr = 0;
            var idx_buf_ptr = 0;

            var dim = Math.pow(2, lvl) - 1;
            var added_verts = 0;

            // For all non mapped vertices compute quantization
            for (vert_num = 0; vert_num < mesh.vertices_count; vert_num++) {
                if (vertex_map[vert_num] == -1) {
                    var vert_x = Math.floor((dim / (bbox.max[0] - bbox.min[0])) * (vertex_values[vert_num][0] - bbox.min[0]) + 0.5);
                    var vert_y = Math.floor((dim / (bbox.max[1] - bbox.min[1])) * (vertex_values[vert_num][1] - bbox.min[1]) + 0.5);
                    var vert_z = Math.floor((dim / (bbox.max[2] - bbox.min[2])) * (vertex_values[vert_num][2] - bbox.min[2]) + 0.5);
                    /*
                    console.log('--- VERTEX ---');
                    console.log(vertex_values[vert_num]);
                    console.log([vert_x, vert_y, vert_z]);
                    console.log('--------------');
*/
                    var quant_idx = vert_x + vert_y * dim + vert_z * dim * dim;

                    vertex_quant_idx[vert_num] = quant_idx;
                    vertex_quant[vert_num] = [vert_x, vert_y, vert_z];
                }
            }

            for (tri_num = 0; tri_num < mesh.faces_count; tri_num++) {
                if (!valid_tri[tri_num]) {
                    var quant_map = [-1, -1, -1];

                    var is_valid = true;

                    for (vert_idx = 0; vert_idx < 3; vert_idx++) {
                        var curr_quant = vertex_quant_idx[tri[tri_num][vert_idx]];

                        if (curr_quant in quant_map) {
                            is_valid = false;
                            break;
                        } else {
                            quant_map[vert_idx] = curr_quant;
                        }
                    }

                    if (is_valid) {
                        valid_tri[tri_num] = true;

                        for (vert_idx = 0; vert_idx < 3; vert_idx++) {
                            vert_num = tri[tri_num][vert_idx];
                            // console.log(vert_num);
                            // console.log(vertex_map[vert_num]);
                            if (vertex_map[vert_num] == -1) {
                                for (comp_idx = 0; comp_idx < 3; comp_idx++) {
                                    var comp = Math.floor(vertex_quant[vert_num][comp_idx] * (65535 / dim));
                                    // console.log('COMP ' + comp);
                                    // console.log([vertex_quant[vert_num][comp_idx], (65535 / dim)]);
                                    vert_buf.writeUInt16LE(comp, vert_buf_ptr);
                                    vert_buf_ptr += 2;
                                }

                                vert_buf.writeUInt16LE(0, vert_buf_ptr);
                                vert_buf_ptr += 2;

                                for (comp_idx = 0; comp_idx < 3; comp_idx++) {
                                    var comp = Math.floor((normal_values[vert_num][comp_idx] + 1) * 128);
                                    vert_buf.writeUInt8(comp, vert_buf_ptr);
                                    vert_buf_ptr++;
                                }

                                vert_buf.writeUInt8(0, vert_buf_ptr);
                                vert_buf_ptr++;

                                // console.log('Mapping ' + vert_num + ' to ' + new_vertex_id);
                                vertex_map[vert_num] = new_vertex_id;
                                new_vertex_id += 1;
                                added_verts += 1;
                            }
                        }

                        for (vert_idx = 0; vert_idx < 3; vert_idx++) {
                            var vert_num = tri[tri_num][vert_idx];

                            // console.log(vertex_map[vert_num]);
                            idx_buf.writeUInt16LE(vertex_map[vert_num], idx_buf_ptr);
                            idx_buf_ptr += 2;
                        }
                    }
                }
            }

            GLOBAL.pbf_cache[mesh['id']][lvl] = {};
            GLOBAL.pbf_cache[mesh['id']][lvl].idx_buf = idx_buf.slice(0, idx_buf_ptr);
            GLOBAL.pbf_cache[mesh['id']][lvl].vert_buf = vert_buf.slice(0, vert_buf_ptr);
            GLOBAL.pbf_cache[mesh['id']][lvl].vert_buf_offset = buf_offset;
            GLOBAL.pbf_cache[mesh['id']][lvl].num_vertices = added_verts;
            buf_offset += GLOBAL.pbf_cache[mesh['id']][lvl].vert_buf.length;

            lvl += 1;

        }

        GLOBAL.pbf_cache[mesh['id']].num_levels = lvl;
        console.log('#LEVELS : ' + GLOBAL.pbf_cache[mesh['id']].num_levels);
    }
}

function pack(bytes) {
    var str = "";
    console.log("BYTES: " + bytes.length);

    for (var i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

function toBytesInt32(num) {
    arr = new Uint8Array([(num & 0x000000ff), (num & 0x0000ff00) >>> 8, (num & 0x00ff0000) >>> 16, (num & 0xff000000) >>> 24]);
    return arr;
}

function getChild(parent, type, n) {
    if ((parent == null) || !('children' in parent)) {
        return null;
    }

    var type_idx = 0;

    n = typeof n !== 'undefined' ? n : 0;

    for (var child_idx = 0; child_idx < parent.children.length; child_idx++) {
        if (parent.children[child_idx]['type'] == type) {
            if (type_idx == n) {
                return parent.children[child_idx];
            }

            type_idx++;
        }
    }

    return null;
}

function getMaterial(mesh, n) {
    return getChild(mesh, 'material');
}

function getTexture(mat, n) {
    return getChild(mat, 'texture');
}

function extractBoundingBox(mesh) {
    var bbox = {};

    bbox.min = mesh['bounding_box'][0];
    bbox.max = mesh['bounding_box'][1];
    bbox.center = [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2];
    bbox.size = [(bbox.max[0] - bbox.min[0]), (bbox.max[1] - bbox.min[1]), (bbox.max[2] - bbox.min[2])];

    return bbox;
}

function X3D_Header() {
    var xml_doc = new dom_imp().createDocument('http://www.web3d.org/specification/x3d-namespace', 'X3D');

    xml_doc.firstChild.setAttribute('xmlns', 'http://www.web3d.org/specification/x3d-namespace');
    xml_doc.firstChild.setAttribute('id', 'model');
    xml_doc.firstChild.setAttribute('showStat', 'true');
    xml_doc.firstChild.setAttribute('showLog', 'false');
    xml_doc.firstChild.setAttribute('style', "width:100%; height:100%; border:0px;");
    //xml_doc.firstChild.setAttribute('width', '1337px');
    //xml_doc.firstChild.setAttribute('height', '400px');

      return xml_doc;
}

function X3D_CreateScene(xml_doc) {
    var scene = xml_doc.createElement('Scene');
    scene.setAttribute('DEF', 'scene');


    var head = xml_doc.createElement('navigationInfo');

    head.setAttribute('DEF', 'head');
    head.setAttribute('headlight', 'true');
    head.setAttribute('type', 'EXAMINE');

    head.textContent = ' ';

    //scene.appendChild(head);
    /*    
    var vpoint = xml_doc.createElement('Viewpoint');
    vpoint.setAttribute('DEF', 'vpoint');
    vpoint.setAttribute('position', '0 0 10');
    vpoint.setAttribute('orientation', '-1 0 0 0');
    vpoint.setAttribute('zNear', 0.01);
    vpoint.setAttribute('zFar', 10000);

    vpoint.textContent = ' ';

    scene.appendChild(vpoint);
  */

    //var bground = xml_doc.createElement('background');
    //bground.setAttribute('skycolor', '1 1 1');
    //scene.appendChild(bground);
    var environ = xml_doc.createElement('environment');

    environ.setAttribute('frustumCulling', 'true');
    environ.setAttribute('smallFeatureCulling', 'true');
    environ.setAttribute('occlusionCulling', 'true');
    environ.textContent = ' ';

    xml_doc.firstChild.appendChild(environ);
    xml_doc.firstChild.appendChild(scene);


    /*
    var trans = xml_doc.createElement('Transform');
    trans.setAttribute('scale', '100 100 100');
    scene.appendChild(trans);
    */

}


function X3D_AddShape(xml_doc, db_name, mesh, mat, mode) {
    var mesh_id = mesh['id'];

    logger.log('info', 'Loading mesh ' + mesh_id);

    var scene = xml_doc.getElementsByTagName('Scene')[0];

    //var mat_trans = xml_doc.createElement('MatrixTransform');
    //mat_trans.setAttribute('matrix', '1 0 0 0 0 0 1 0 0 -1 0 0 0 0 0 1');
    //scene.appendChild(mat_t);
    //var trans = xml_doc.createElement('Transform');
    //trans.setAttribute('translation', '4 0 0');
    var shape = xml_doc.createElement('Shape');
    scene.appendChild(shape);
    shape.setAttribute('DEF', mesh['id']);
    //shape.setAttribute('repo_id', mesh['id']);
    var bbox = extractBoundingBox(mesh);

    logger.log('info', 'Loading material ' + mesh['mMaterialIndex']);

    var appearance = xml_doc.createElement('Appearance');

    if (1) {
        if (!mat['two_sided']) {
            var material = xml_doc.createElement('Material');
        } else {
            var material = xml_doc.createElement('TwoSidedMaterial');
        }
        var ambient_intensity = 1;

        for (var i = 0; i < 3; i++) {
            if (mat['diffuse'][i] != 0) {
                ambient_intensity = mat['ambient'][i] / mat['diffuse'][i];
                break;
            }
        }

        //material.setAttribute('DEF', mesh['mMaterialIndex']);
        material.setAttribute('diffuseColor', mat['diffuse'].join(' '));
        //material.setAttribute('shininess', mat['shininess'] / 512);
        material.setAttribute('specularColor', mat['specular'].join(' '));

        if (mat['opacity'] != 1)
        {
            material.setAttribute('transparency', 1.0 - mat['opacity']);
        }

        if ('children' in mat)
        {
            var texture = xml_doc.createElement('ImageTexture');
            var tex = mat.children[0];
            texture.setAttribute('url', db_name + '/textures/' + tex['id'] + '.' + tex['extension']);
            appearance.appendChild(texture);
        }

        appearance.appendChild(material);

    } else {
        var shader = xml_doc.createElement('ComposedShader');
        appearance.appendChild(shader);

        var vert_shader = xml_doc.createElement('ShaderPart');

        vert_shader.textContent = fs.readFileSync('public/custom.vert');
        vert_shader.setAttribute('type', 'VERTEX');
        vert_shader.setAttribute('style', 'display:none;');

        shader.appendChild(vert_shader);

        var frag_shader = xml_doc.createElement('ShaderPart');

        frag_shader.textContent = fs.readFileSync('public/custom.frag');
        frag_shader.setAttribute('type', 'FRAGMENT');
        frag_shader.setAttribute('style', 'display:none;');

        shader.appendChild(frag_shader);
    }


    shape.appendChild(appearance);

    switch (mode) {
    case "xml":
        shape.setAttribute('bboxCenter', bbox.center.join(' '));
        shape.setAttribute('bboxSize', bbox.size.join(' '));

        var indexedfaces = xml_doc.createElement('IndexedFaceSet');

        indexedfaces.setAttribute('ccw', 'false');
        indexedfaces.setAttribute('solid', 'false');
        indexedfaces.setAttribute('creaseAngle', '3.14');

        var face_arr = '';

        var idx = 0;
        //console.log(mesh.mFaces);
        for (var face_idx = 0; face_idx < mesh.mFaces.length; face_idx++) {
            for (var vert_idx = 0; vert_idx < mesh.mFaces[face_idx].length; vert_idx++) {
                face_arr += mesh.mFaces[face_idx][vert_idx] + ' ';
            }
            face_arr += '-1 ';

        }
        indexedfaces.setAttribute('coordIndex', face_arr);
        shape.appendChild(indexedfaces);

        var coordinate = xml_doc.createElement('Coordinate');
        var coord_arr = '';

        for (var vert_idx = 0; vert_idx < mesh.mVertices.length; vert_idx++) {
            for (var comp_idx = 0; comp_idx < 3; comp_idx++) {
                coord_arr += mesh.mVertices[comp_idx] + ' ';
            }
        }

        coordinate.setAttribute('point', coord_arr);
        indexedfaces.appendChild(coordinate);

        break;

    case "src":
        shape.setAttribute('bboxCenter', bbox.center.join(' '));
        shape.setAttribute('bboxSize', bbox.size.join(' '));

        var externalGeometry = xml_doc.createElement('ExternalGeometry');

        if ('children' in mat) {
            var tex_id = mat['children'][0]['id'];
            externalGeometry.setAttribute('url', 'src_bin/' + db_name + '/' + mesh_id + '.src/' + tex_id);
        } else {
            externalGeometry.setAttribute('url', 'src_bin/' + db_name + '/' + mesh_id + '.src');
        }

        //externalGeometry.setAttribute('url', '../x3dom_example/src0.src');
        shape.appendChild(externalGeometry);
        break;

    case "bin":
        shape.setAttribute('bboxCenter', bbox.center.join(' '));
        shape.setAttribute('bboxSize', bbox.size.join(' '));

        var binaryGeometry = xml_doc.createElement('binaryGeometry');

        binaryGeometry.setAttribute('normal', db_name + '/normals/' + mesh_id + '.bin');

        if ('children' in mat) {
            binaryGeometry.setAttribute('texCoord', db_name + '/texcoords/' + mesh_id + '.bin');
        }

        binaryGeometry.setAttribute('index', db_name + '/indices/' + mesh_id + '.bin');
        binaryGeometry.setAttribute('coord', db_name + '/coords/' + mesh_id + '.bin');
        //binaryGeometry.setAttribute('vertexCount', mesh.vertices_count);
        binaryGeometry.textContent = ' ';

        shape.appendChild(binaryGeometry);
        break;


    case "pbf":
        var pop_geometry = xml_doc.createElement('PopGeometry');

        pop_geometry.setAttribute('vertexCount', mesh.vertices_count);
        pop_geometry.setAttribute('primType', "TRIANGLES");
        pop_geometry.setAttribute('attributeStride', 12);
        pop_geometry.setAttribute('normalOffset', 8);
        pop_geometry.setAttribute('bbMin', bbox.min.join(' '));
        pop_geometry.setAttribute('tightSize', bbox.size.join(' '));

        genPopCache(mesh);

        //console.log('#LEVELS : ' + GLOBAL.pbf_cache[mesh['id']].num_levels);
        for (var lvl = 1; lvl < GLOBAL.pbf_cache[mesh['id']].num_levels; lvl++) {
            var pop_geometry_level = xml_doc.createElement('PopGeometryLevel');

            pop_geometry_level.setAttribute('src', 'src_bin/' + db_name + '/' + mesh_id + '/level' + lvl + '.pbf');
            pop_geometry_level.setAttribute('numIndices', GLOBAL.pbf_cache[mesh['id']][lvl].num_vertices);
            pop_geometry_level.setAttribute('vertexDataBufferOffset', GLOBAL.pbf_cache[mesh['id']][lvl].vert_buf_offset);

            pop_geometry.appendChild(pop_geometry_level);
        }

        shape.appendChild(pop_geometry);

        break;

    }
};

exports.get_texture = function(db_interface, db_name, uuid, res) {
    console.log('Reading texture ' + uuid);
    db_interface.get_texture(db_name, uuid, function(err, doc) {
        res.write(doc.textures[uuid].data.buffer, 'binary');
        res.end();
    });
};

exports.get_mesh_bin = function(db_interface, db_name, uuid, type, res) {
    console.log('Requesting binary ' + type + ' for ' + uuid);
    db_interface.get_texture(db_name, uuid, function(err, doc) {
        var mesh = doc.meshes[uuid];

        switch (type) {
        case "normals":
            res.write(mesh.normals.buffer, 'binary');
            res.end();
            break;
        case "texcoords":
            res.write(mesh.uv_channels.buffer, 'binary');
            res.end();
            break;
        case "indices":
            var buf = new Buffer(mesh.faces_count * 2 * 3);
            var copy_idx = 0;
            var orig_idx = mesh.faces.buffer;

            for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
                for (var vert_comp = 0; vert_comp < 3; vert_comp++) {
                    var byte_position = (16 * face_idx) + (vert_comp + 1) * 4;
                    var idx_val = orig_idx.readUInt16LE(byte_position);

                    buf.writeUInt16LE(idx_val, copy_idx);
                    copy_idx += 2;
                }
            }

            res.write(buf, 'binary');
            res.end();
            break;
        case "coords":
            res.write(mesh.vertices.buffer, 'binary');
            res.end();
            break;
        }
    });
};


exports.render = function(db_interface, db_name, format, sub_format, level, uuid, tex_uuid, res) {

    console.log('Rendering ' + format + ' (' + sub_format + ') - UUID : ' + uuid);

    db_interface.get_mesh(db_name, uuid, tex_uuid, function(err, doc) {
        if (err) throw err;
        switch (format) {
            // POP Buffer
        case "bin":
            sem.take(function() {
                console.log(".");

                setTimeout(sem.leave, 500);
            });
            break;
        case "pbf":
            if (!(uuid in GLOBAL.pbf_cache)) {
                console.log('Not in cache ' + uuid);
                console.log(GLOBAL.pbf_cache);
                res.end("Shouldn't be here. Missing from cache");
            } else {
                res.write(GLOBAL.pbf_cache[uuid][level].idx_buf, 'binary');
                res.write(GLOBAL.pbf_cache[uuid][level].vert_buf, 'binary');
                res.end("");
            }

            break;
        case "xml":
            var xml_doc = X3D_Header();
            X3D_CreateScene(xml_doc);

            for (var mesh_id in doc['meshes']) {
                var mesh = doc['meshes'][mesh_id];
                var mat = getMaterial(mesh, 0);
                X3D_AddShape(xml_doc, db_name, mesh, mat, sub_format);
            }

            res.render('index', {
                xml: new xml_serial().serializeToString(xml_doc),
                x3domjs: config.external.x3domjs,
                x3domcss: config.external.x3domcss,
		repouicss : config.external.repouicss    
            });

            break;

        case "json":
        case "src":
            // Output SRC json
            var mesh = doc['meshes'][uuid];

            logger.log('info', 'Creating SRC file for ' + uuid);
            logger.log('info', 'Mesh #Verts: ' + mesh.vertices_count);
            logger.log('info', 'Mesh #Faces: ' + mesh.faces_count);

            //mesh.faces_count /= 4;
            var src_json = {};
            src_json.accessors = {};

            src_json.accessors.indexViews = {};
            src_json.accessors.attributeViews = {};

            // Vertex Attribute
            src_json.accessors.attributeViews.attributeView0 = {};
            src_json.accessors.attributeViews.attributeView0.bufferView = 'bufferView0';
            src_json.accessors.attributeViews.attributeView0.byteOffset = 0;
            src_json.accessors.attributeViews.attributeView0.byteStride = 12;
            src_json.accessors.attributeViews.attributeView0.componentType = 5126;
            src_json.accessors.attributeViews.attributeView0.type = 'VEC3';
            src_json.accessors.attributeViews.attributeView0.count = mesh.vertices_count;
            src_json.accessors.attributeViews.attributeView0.decodeOffset = [0, 0, 0];
            src_json.accessors.attributeViews.attributeView0.decodeScale = [1, 1, 1];

            // Index Attribute
            src_json.accessors.indexViews.indexView0 = {};
            src_json.accessors.indexViews.indexView0.bufferView = 'bufferView1';
            src_json.accessors.indexViews.indexView0.byteOffset = 0;
            src_json.accessors.indexViews.indexView0.componentType = 5123;
            src_json.accessors.indexViews.indexView0.count = mesh.faces_count * 3;

            // Normal Attribute
            src_json.accessors.attributeViews.attributeView1 = {};
            src_json.accessors.attributeViews.attributeView1.bufferView = 'bufferView2';
            src_json.accessors.attributeViews.attributeView1.byteOffset = 0;
            src_json.accessors.attributeViews.attributeView1.byteStride = 12;
            src_json.accessors.attributeViews.attributeView1.componentType = 5126;
            src_json.accessors.attributeViews.attributeView1.type = 'VEC3';
            src_json.accessors.attributeViews.attributeView1.count = mesh.vertices_count;
            src_json.accessors.attributeViews.attributeView1.decodeOffset = [0, 0, 0];
            src_json.accessors.attributeViews.attributeView1.decodeScale = [1, 1, 1];

            // Textures 
            var mat = getMaterial(mesh, 0);
            var texture = getTexture(mat, 0);

            if (mat != null) {
                console.log(mat);
            }

            if (texture != null) {
                console.log(texture);
            }

            // Buffer Chunking
            src_json.bufferChunks = {};
            src_json.bufferChunks.chunk0 = {};
            src_json.bufferChunks.chunk0.byteOffset = 0;
            src_json.bufferChunks.chunk0.byteLength = mesh.vertices_count * 3 * 4;

            src_json.bufferChunks.chunk1 = {};
            src_json.bufferChunks.chunk1.byteOffset = mesh.vertices_count * 3 * 4;
            src_json.bufferChunks.chunk1.byteLength = mesh.faces_count * 3 * 2;

            src_json.bufferChunks.chunk2 = {};
            src_json.bufferChunks.chunk2.byteOffset = src_json.bufferChunks.chunk1.byteOffset + mesh.faces_count * 2 * 3;
            src_json.bufferChunks.chunk2.byteLength = mesh.vertices_count * 3 * 4;

            // Buffer Views
            src_json.bufferViews = {};
            src_json.bufferViews.bufferView0 = {};
            src_json.bufferViews.bufferView0.chunks = ['chunk0'];

            src_json.bufferViews.bufferView1 = {};
            src_json.bufferViews.bufferView1.chunks = ['chunk1'];

            src_json.bufferViews.bufferView2 = {};
            src_json.bufferViews.bufferView2.chunks = ['chunk2'];

            // Mesh Header
            src_json.meshes = {};
            src_json.meshes[db_name] = {};
            src_json.meshes[db_name].attributes = {};
            src_json.meshes[db_name].indices = "indexView0";
            src_json.meshes[db_name].primitive = 4;
            src_json.meshes[db_name].attributes.position = 'attributeView0';
            src_json.meshes[db_name].attributes.normal = 'attributeView1';

            // TODO: Put into a function
            var bbox = extractBoundingBox(mesh);

            src_json.meshes[db_name].bboxCenter = bbox.center;
            src_json.meshes[db_name].bboxSize = bbox.size;

            var orig_idx = mesh['faces'].buffer;

            // Turn api 2 indices into a new buffer
            var buf = new Buffer(mesh.faces_count * 2 * 3);
            var copy_idx = 0;

            for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
                for (var vert_comp = 0; vert_comp < 3; vert_comp++) {
                    var byte_position = (16 * face_idx) + (vert_comp + 1) * 4;
                    var idx_val = orig_idx.readUInt16LE(byte_position);

                    buf.writeUInt16LE(idx_val, copy_idx);
                    copy_idx += 2;
                }
            }

            //console.log(mesh.mFaces);
            src_json.meta = {};
            src_json.meta.generator = "Generated by 3DRepo";
            src_json.textureViews = {};
            src_json.textures = {};

            if (tex_uuid != null) {
                var texture = doc.textures[tex_uuid];

                src_json.bufferChunks.chunk3 = {};
                src_json.bufferChunks.chunk3.byteOffset = src_json.bufferChunks.chunk2.byteOffset + mesh.vertices_count * 3 * 4;
                src_json.bufferChunks.chunk3.byteLength = mesh.uv_channels_byte_count;

                src_json.bufferViews.bufferView3 = {};
                src_json.bufferViews.bufferView3.chunks = ['chunk3'];

                src_json.accessors.attributeViews.attributeView2 = {};
                src_json.accessors.attributeViews.attributeView2.bufferView = 'bufferView3';
                src_json.accessors.attributeViews.attributeView2.byteOffset = 0;
                src_json.accessors.attributeViews.attributeView2.byteStride = 8;
                src_json.accessors.attributeViews.attributeView2.componentType = 5126;
                src_json.accessors.attributeViews.attributeView2.type = 'VEC2';
                src_json.accessors.attributeViews.attributeView2.count = mesh.vertices_count;
                src_json.accessors.attributeViews.attributeView2.decodeOffset = [0, 0];
                src_json.accessors.attributeViews.attributeView2.decodeScale = [1, 1];

                src_json.meshes[db_name].attributes.texcoord = 'attributeView2';

                /*
                src_json.bufferChunks.chunk3 = {};
                src_json.bufferChunks.chunk3.byteOffset = src_json.bufferChunks.chunk2.byteOffset + mesh.vertices_count * 3 * 4;
                src_json.bufferChunks.chunk3.byteLength = texture.data_byte_count;

                src_json.textureViews.tex0 = {};
                src_json.textureViews.tex0.byteLength = texture.data_byte_count; 
                src_json.textureViews.tex0.chunks = ['chunk3'];
                src_json.textureViews.tex0.format = texture.extension;

                src_json.textures.meshtex = {};
                src_json.textures.meshtex.textureView = 'tex0';
                src_json.textures.meshtex.imageByteLengths = [texture.data_byte_count];
                src_json.textures.meshtex.width = texture.width;
                src_json.textures.meshtex.height = texture.height;
                src_json.textures.meshtex.type = 5121;
                src_json.textures.meshtex.format = 6407;
                src_json.textures.meshtex.internalFormat = 6407;

                src_json.bufferChunks.chunk4 = {};
                src_json.bufferChunks.chunk4.byteOffset = src_json.bufferChunks.chunk3.byteOffset + texture.data_byte_count;
                src_json.bufferChunks.chunk4.byteLength = mesh.uv_channels_byte_count;

                */
            }

            var json_str = JSON.stringify(src_json);

            var magic_bit = new Buffer(4);
            magic_bit.writeUInt32LE(23, 0);

            var version = new Buffer(4);
            version.writeUInt32LE(42, 0);

            var head_string = new Buffer(4);
            head_string.writeUInt32LE(json_str.length, 0);

            if (format == "src") {
                res.write(magic_bit, 'binary');
                res.write(version, 'binary');
                res.write(head_string, 'binary');
                res.write(json_str);
                res.write(mesh['vertices'].buffer, 'binary');
                res.write(buf, 'binary');
                res.write(mesh['normals'].buffer, 'binary');
                if (tex_uuid != null) {
                    //res.write(texture.data.buffer, 'binary');
                    res.write(mesh['uv_channels'].buffer, 'binary');
                }
                res.end();
            } else {
                res.send(json_str);
            }

            break;

        default:
            throw "Format Not Supported";
        };
    });
}

