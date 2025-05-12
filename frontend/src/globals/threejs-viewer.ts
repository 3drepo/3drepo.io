/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'

import StandardVertexShader from './standard_vertex.glsl';
import StandardFragmentShader from './standard_fragment.glsl';

class VertexAttribute {

	size: number;

	name: string;

	constructor(name, size) {
		this.name = name;
		this.size = size;
	}
}

type View = {
	isPerspective: boolean;
	
	camPos: THREE.Vector3;
	targetPos: THREE.Vector3;

	orthoZoom: number;
}

class LineMeasurement {

	scene: THREE.Scene
	lines: Line2[];
	positions: number[];	

	constructor (scene: THREE.Scene){	
		this.lines = [];	
		this.positions = [];
		this.scene = scene;
	}

	addPoint(newPoint: THREE.Vector3){
		this.positions.push(newPoint.x, newPoint.y, newPoint.z);

		if(this.positions.length >= 6){

			const lastTwoPos = this.positions.slice(-6, this.positions.length);

			// Create new line segment
			const lineMaterial = new LineMaterial({color: 'cyan', linewidth: 5});
			lineMaterial.depthTest = false;
			lineMaterial.depthWrite = false;
	
			const lineGeom = new LineGeometry();
			lineGeom.setPositions(lastTwoPos);
			
			const line = new Line2( lineGeom, lineMaterial );
			line.layers.disableAll();
			line.layers.enable(1); // Layers purely used for organisation. Switching off the depth test still necessary to prevent geometry intersection.

			this.scene.add(line);

			this.lines.push(line);

			// Create label
			const pos0 = new THREE.Vector3(lastTwoPos[0], lastTwoPos[1], lastTwoPos[2]);
			const pos1 = new THREE.Vector3(lastTwoPos[3], lastTwoPos[4], lastTwoPos[5]);
			const dirVec = pos1.sub(pos0);
			const labelPos = pos0.add(dirVec.multiplyScalar(0.5));

			const dist = dirVec.length();

			const distMarkerDiv = document.createElement('div');
			distMarkerDiv.textContent = `${dist}`;
			distMarkerDiv.style.backgroundColor = 'white';
			distMarkerDiv.style.color = 'black';
			distMarkerDiv.style.borderStyle = 'solid';
			distMarkerDiv.style.borderWidth = '3px';
			distMarkerDiv.style.borderColor = 'cyan';
	
			const marker = new CSS2DObject(distMarkerDiv);
			marker.position.set(labelPos.x, labelPos.y, labelPos.z);
			marker.center.set(0.5,0.5);
			this.scene.add(marker);	
		}
	}

}

export class ThreeJsViewer {

	sceneBounds: THREE.Box3;

	sceneCorners: THREE.Vector3[];

	camera: THREE.Camera;

	orthoCam: THREE.OrthographicCamera;
	perspCam: THREE.PerspectiveCamera;

	controls: OrbitControls;

	scene: THREE.Scene;

	material: THREE.ShaderMaterial;

	material_textured: THREE.ShaderMaterial;

	lastStoredView: View;

	raycaster: THREE.Raycaster;
	clientDimensions: THREE.Vector2;
	clientOffsets: THREE.Vector2;

	pointerDownListener = this.onPointerDown.bind(this);

	lineMeasurements: LineMeasurement[];

	renderer = THREE.WebGLRenderer;

	labelRenderer = CSS2DRenderer;

	constructor(container: HTMLElement) {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		const aspect = container.clientWidth / container.clientHeight;
		this.perspCam = new THREE.PerspectiveCamera(60, aspect);
		this.perspCam.layers.enable(1);
		this.orthoCam = new THREE.OrthographicCamera(); // Default values. Proper values will be calculated on first activation
		this.orthoCam.layers.enable(1);
		this.camera = this.perspCam;

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );

		this.scene.add( cube );
		this.camera.position.z = 5;
		this.camera.far = 500000;
		this.camera.near = 0;


		// Prepare measurements
		this.lineMeasurements = [];

		const testMes = new LineMeasurement(this.scene);
		testMes.addPoint(new THREE.Vector3( - 10, 0, 0 ) );
		testMes.addPoint( new THREE.Vector3( 0, 10, 0 ) );
		testMes.addPoint( new THREE.Vector3( 10, 0, 0 ) );
		testMes.addPoint(new THREE.Vector3( - 10, 0, 0 ) );
		
		// Create Renderer for labels
		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = '0px';
		container.appendChild(this.labelRenderer.domElement);
		
		// Create circle style for the marker
		// (probably not the right way to do this, but it works)
		var style = document.createElement('style');
		style.innerHTML = '.circle { height: 10px; width: 10px; background-color: cyan; border-radius: 50%;}';
		document.getElementsByTagName('head')[0].appendChild(style);
		
		// Store some information we will later need for the raycasting
		this.raycaster = new THREE.Raycaster();
		this.clientDimensions = new THREE.Vector2(container.clientWidth, container.clientHeight);
		var rect = container.getBoundingClientRect();
		this.clientOffsets = new THREE.Vector2(rect.left, rect.top);	

		this.controls = new OrbitControls( this.camera, this.labelRenderer.domElement );
		
		// Use this if you only want to render when the controls change the perspective
		//this.controls.addEventListener('change', this.animate.bind(this));

		// Use this if you want to render every frame again.
		this.renderer.setAnimationLoop(this.animate.bind(this));

		this.sceneBounds = new THREE.Box3();

		this.sceneCorners = [
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
		];

		this.loadShaders();

		// Initial render
		this.animate();
	}

	animate() {
		this.updateNearFarPlanes();
		this.renderer.render(this.scene, this.camera);
		this.labelRenderer.render(this.scene, this.camera);
	}

	fetch(uri: string) {
		const cookies = document?.cookie;
		const headers = {};
		if (cookies) {
			const tokenMatch = cookies.match(/(^| )csrf_token=([^;]+)/);
			if (tokenMatch) {
				headers['X-CSRF-TOKEN'] = tokenMatch[2];
			}
		}
		return fetch('/api/' + uri, { headers });
	}

	async loadModel(account: string, model: string): Promise<void> {
		const assetList = await this.fetch(account + '/' + model + '/revision/master/head/repoAssets.json');
		const body = await assetList.json();
		const models = body.models;

		for (var i = 0; i < models.length; i++) {
			const assets = models[i].assets;
			for (var j = 0; j < assets.length; j++) {
				this.loadRepoBundle(account, model, assets[j]);
			}
		}

		return Promise.resolve(null);
	}

	async loadRepoBundle(teamspace, container, uuid) {

		const HEADER_LENGTH_START = 16;
		const HEDAER_DATA_START = 20;

		const bundle = await this.fetch(teamspace + '/' + container + '/' + uuid + '.repobundle');
		const mapping = await this.fetch(teamspace + '/' + container + '/' + uuid + '.json.mpc');
		const metadata = await mapping.json();
		const bytes = await bundle.bytes();
		const dataView = new DataView(bytes.buffer);
		const headerLength = dataView.getInt32(HEADER_LENGTH_START, true);
		const textDecoder = new TextDecoder('utf-8');
		const headerJson = textDecoder.decode(new DataView(bytes.buffer, HEDAER_DATA_START, headerLength));
		const header = JSON.parse(headerJson);
		const bodyStart = HEDAER_DATA_START + headerLength;
		const name = header.name;

		const ATTRIBUTES = [
			new VertexAttribute('position', 3),
			new VertexAttribute('normal', 3),
			new VertexAttribute('colour', 4),
			new VertexAttribute('tangent', 3),
			new VertexAttribute('uv0', 2),
			new VertexAttribute('uv1', 2),
			new VertexAttribute('uv2', 2),
			new VertexAttribute('uv3', 2),
		];

		// Maps

		const width = metadata.mapping.length;
		const height = 1;

		const data = new Uint8Array(width * 4);
		for (var i = 0; i < metadata.mapping.length; i++) {
			const m = metadata.mapping[i];
			const material = metadata.materials[m.material];
			data[(i * 4) + 0] = material.albedoColor.r * 255;
			data[(i * 4) + 1] = material.albedoColor.g * 255;
			data[(i * 4) + 2] = material.albedoColor.b * 255;
			data[(i * 4) + 3] = material.albedoColor.a * 255;
		}

		const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
		texture.needsUpdate = true;

		var material = this.material.clone();

		if (metadata.albedoMap) {
			material = this.material_textured.clone();

			const texture = await this.fetch(teamspace + '/' + container + '/' + metadata.albedoMap + '.texture');
			const blob = await texture.blob();
			const url = URL.createObjectURL(blob);
			new THREE.TextureLoader().load(
				url,
				(arg) => {
					arg.wrapS = THREE.RepeatWrapping;
					arg.wrapT = THREE.RepeatWrapping;
					material.uniforms.color_tex = { value: arg };
				},
				undefined,
				console.error,
			);
		}

		material.uniforms = {
			'color_map': { value: texture },
			'maps_width': { value: width },
		};

		for (var i = 0; i < header.meshes.length; i++) {
			const m = header.meshes[i];

			if (m.type != 3) {
				continue;
			}

			var vertexStride = 0;
			for (var a = 0; a < m.vertexLayout.length; a++) {
				vertexStride += ATTRIBUTES[m.vertexLayout[a]].size;
			}

			const vertexDataCopy = bytes.slice(bodyStart + m.vertexBuffer.start, bodyStart + m.vertexBuffer.start + m.vertexBuffer.length);

			const floats = new Float32Array(vertexDataCopy.buffer);
			const buffer = new THREE.InterleavedBuffer(floats, vertexStride);
			const geometry = new THREE.BufferGeometry();

			var offset = 0;
			for (var a = 0; a < m.vertexLayout.length; a++) {
				const d = ATTRIBUTES[m.vertexLayout[a]];
				const attribute = new THREE.InterleavedBufferAttribute(buffer, d.size, offset);
				offset += d.size;
				geometry.setAttribute(d.name, attribute);
			}

			const indexDataCopy = bytes.slice(bodyStart + m.indexBuffer.start, bodyStart + m.indexBuffer.start +  m.indexBuffer.length);
			const indices = Array.from(new Int16Array(indexDataCopy.buffer));
			const indexBuffer = new THREE.BufferAttribute(indexDataCopy, 2);
			indexBuffer.gpuType = THREE.IntType;

			geometry.setIndex(indices);

			// eslint-disable-next-line max-len
			const min = new THREE.Vector3(m.bounds.min.x, m.bounds.min.y, m.bounds.min.z);
			const max = new THREE.Vector3(m.bounds.max.x, m.bounds.max.y, m.bounds.max.z);
			geometry.boundingBox = new THREE.Box3(min, max);
			geometry.boundingSphere = new THREE.Sphere(min, max.sub(min).length() );

			this.sceneBounds.expandByPoint(m.bounds.min);
			this.sceneBounds.expandByPoint(m.bounds.max);

			const mesh = new THREE.Mesh( geometry, material );

			this.scene.add(mesh);
		}
	}

	SendMessage(go, method, params) {
		console.log('Receieved ' + method + ' ' + params);
	}

	addSceneBoundingBox() {
		const helper = new THREE.Box3Helper(this.sceneBounds, 0xffff00);
		this.scene.add(helper);
	}

	updateNearFarPlanes() {
		this.getBoxCorners(this.sceneBounds, this.sceneCorners);
		const forward = new THREE.Vector3();
		const position = new THREE.Vector3();
		this.camera.getWorldDirection(forward);
		this.camera.getWorldPosition(position);
		const p = new THREE.Vector3();
		var near = Number.POSITIVE_INFINITY;
		var far = Number.NEGATIVE_INFINITY;
		for (var i = 0; i < this.sceneCorners.length; i++) {
			p.subVectors(this.sceneCorners[i], position);
			const d = p.dot(forward);
			near = Math.min(near, d);
			far = Math.max(far, d);
		}
		near = Math.max(near, 1);
		far = Math.min(far, 1000000);
		this.camera.near = near;
		this.camera.far = far;
		this.camera.updateProjectionMatrix();
	}

	getBoxCorners(box: THREE.Box3, corners: THREE.Vector3[]) {
		const min = box.min;
		const max = box.max;
		corners[0].set(min.x, min.y, min.z);
		corners[1].set(min.x, min.y, max.z);
		corners[2].set(min.x, max.y, min.z);
		corners[3].set(min.x, max.y, max.z);
		corners[4].set(max.x, min.y, min.z);
		corners[5].set(max.x, min.y, max.z);
		corners[6].set(max.x, max.y, min.z);
		corners[7].set(max.x, max.y, max.z);
	}

	resetCamera() {
		const v = new THREE.Vector3();
		this.sceneBounds.getCenter(v);

		this.camera.position.set(this.sceneBounds.max.x, this.sceneBounds.max.y, this.sceneBounds.max.z);
		this.camera.lookAt(v);

		const s = new THREE.Vector3();
		this.sceneBounds.getSize(s);
		//this.camera.translateZ(-s.length() / Math.tan(60 / 2) * 2);
	}


	// Easy conversion from Perspective to Ortho and back courtesy of nickyvanurk
	// https://gist.github.com/nickyvanurk/9ac33a6aff7dd7bd5cd5b8a20d4db0dc

	frustumHeightAtDistance(camera: THREE.PerspectiveCamera, distance: number) {
		const vFov = (camera.fov * Math.PI) / 180;
		return Math.tan(vFov / 2) * distance * 2;
	  }
	  
	  frustumWidthAtDistance(camera: THREE.PerspectiveCamera, distance: number) {
		return this.frustumHeightAtDistance(camera, distance) * camera.aspect;
	  }

	switchToOrthographicCamera(){
		console.log("Switching to ortho cam");

		this.orthoCam.position.copy(this.perspCam.position);
		const distance = this.perspCam.position.distanceTo(this.controls.target);
		const halfWidth = this.frustumWidthAtDistance(this.perspCam, distance) / 2;
		const halfHeight = this.frustumHeightAtDistance(this.perspCam, distance) / 2;
		this.orthoCam.top = halfHeight;
		this.orthoCam.bottom = -halfHeight;
		this.orthoCam.left = -halfWidth;
		this.orthoCam.right = halfWidth;
		this.orthoCam.zoom = 1;
		this.orthoCam.lookAt(this.controls.target);
		this.orthoCam.updateProjectionMatrix();
		this.camera = this.orthoCam;
		this.controls.object = this.orthoCam;

		this.camera = this.orthoCam;		
		this.controls.object = this.camera;
	}

	switchToPerspectiveCamera(){
		console.log("Switching to perspective cam");
		const oldY = this.perspCam.position.y;
		this.perspCam.position.copy(this.orthoCam.position);
		this.perspCam.position.y = oldY / this.orthoCam.zoom;
		this.perspCam.updateProjectionMatrix();
		this.camera = this.perspCam;
		this.controls.object = this.perspCam;
	}

	loadShaders() {
		this.material = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: StandardFragmentShader,
		});
		this.material_textured = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: StandardFragmentShader,
			defines: {
				USE_COLOR_TEX: true,
			},
		});
	}

	storeCurrentView() {

		let isPerspective;	
		let orthoZoom;	
		if(this.camera.type === 'OrthographicCamera'){
			isPerspective = false;
			orthoZoom = this.orthoCam.zoom;			
		}
		else{
			isPerspective = true;
			orthoZoom = 1;
		}		

		const camPos = this.camera.position.clone();
		const targetPos = this.controls.target.clone();

		this.lastStoredView = {
			isPerspective: isPerspective,
			camPos: camPos,
			targetPos: targetPos,
			orthoZoom: orthoZoom
		};

		console.log("Stored View");
		console.log(this.lastStoredView);
	}

	restoreLastStoredView() {
		console.log(this.lastStoredView);

		if(this.lastStoredView === undefined){
			console.log("No view stored");
			return;
		}

		const isCamPerspective = (this.camera.type === 'PerspectiveCamera');

		if(this.lastStoredView.isPerspective != isCamPerspective){
			if(this.lastStoredView.isPerspective)
				this.switchToPerspectiveCamera();
			else
				this.switchToOrthographicCamera();
				this.orthoCam.zoom = this.lastStoredView.orthoZoom;
		}

		this.controls.target.copy(this.lastStoredView.targetPos);
		
		this.camera.position.set(this.lastStoredView.camPos.x, this.lastStoredView.camPos.y, this.lastStoredView.camPos.z);
		this.camera.lookAt(this.controls.target);
	}


	takeScreenshot(){
		try{
			let mime = "image/jpeg";
			let downloadMime = "image/octet-stream";

			this.animate(); // Render right before taking the screenshot
			let imgData = this.renderer.domElement.toDataURL(mime);
			
			imgData = imgData.replace(mime, downloadMime);

			// Automatically download it.
			let link = document.createElement('a');
			if(typeof link.download === 'string'){
				document.body.appendChild(link);
				link.download = 'screenshot.jpg';
				link.href = imgData;
				link.click();
				document.body.removeChild(link);
			} else {
				location.replace(uri);
			}

		} catch (e) {
			console.log(e);
			return;
		}
	}

	enableMeasuring(){

		window.addEventListener('pointerdown', this.pointerDownListener);	

		const newMeasurement = new LineMeasurement(this.scene);
		this.lineMeasurements.push(newMeasurement);
	}

	disableMeasuring(){
		window.removeEventListener('pointerdown', this.pointerDownListener);	
	}

	onPointerDown(event){
		
		const pointer = new THREE.Vector2();
		pointer.x = ((event.clientX - this.clientOffsets.x) / this.clientDimensions.x) * 2 - 1;
		pointer.y = - ((event.clientY - this.clientOffsets.y) / this.clientDimensions.y) * 2 + 1;
		
		this.raycaster.setFromCamera(pointer, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children, false);

		// Create marker at clicked location
		if(intersects.length > 0)
		{
			const markerPos = intersects[0].point.clone();
	
			const newMarkerDiv = document.createElement('div');
			newMarkerDiv.className = 'circle';
	
			const marker = new CSS2DObject(newMarkerDiv);
			marker.position.set(markerPos.x, markerPos.y, markerPos.z);
			marker.center.set(0.5,0.5);
			this.scene.add(marker);	
			
			// Update current line measurement
			const measurement = this.lineMeasurements[this.lineMeasurements.length - 1];
			measurement.addPoint(markerPos);
		}
	}
}