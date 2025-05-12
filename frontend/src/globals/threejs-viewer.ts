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
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

import StandardVertexShader from './standard_vertex.glsl';
import StandardFragmentShader from './standard_fragment.glsl';
import PickFragmentShader from './pick_fragment.glsl';
import DepthFragmentShader from './depth_fragment.glsl';
import PostProcessingFragmentShader from './postprocessing_fragment.glsl';
import PostProcessingVertexShader from './postprocessing_vertex.glsl';

class VertexAttribute {

	size: number;

	name: string;

	constructor(name, size) {
		this.name = name;
		this.size = size;
	}
}

class PickOperator {
	constructor(domElement: HTMLElement) {
		domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
		domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
	}

	getPosition(ev: PointerEvent) {
		const r = ev.currentTarget.getBoundingClientRect();
		return {
			x: ev.clientX - r.left,
			y: r.bottom - ev.clientY, // The coordinate system of GL is 0,0 bottom-left, whereas the DOM is top-left.
		  };
	}

	onPointerDown(ev: PointerEvent) {
		this.position = this.getPosition(ev);
		this.clicked = true;
	}

	onPointerMove(ev: PointerEvent) {
		//this.position = this.getPosition(ev);
	}
}

class PickManager {
	counter: number;

	uniqueIds: string[];

	sharedIds: string[];

	constructor() {
		this.counter = 1;
		this.uniqueIds = [];
		this.sharedIds = [];
		this.colorMaps = {};
	}
}

class Pin {
	position: THREE.Vector3;

	elem: HTMLElement;

	constructor(elem: HTMLElement, position: THREE.Vector3) {
		this.position = position;
		this.elem = elem;
	}
}

class PinManager {

	container: HTMLElement;

	pins: Pin[];

	constructor(markup: HTMLElement) {
		this.container = markup;
		this.pins = [];
	}

	addElement() {
		const elem = document.createElement('div');
		elem.style.width = '10px';
		elem.style.height = '10px';
		elem.style.position = 'absolute';
		elem.style.background = 'blue';
		this.container.appendChild(elem);
		return elem;
	}

	dropPin(position: THREE.Vector3) {
		this.pins.push(new Pin(this.addElement(), position));

	}
}

type View = {
	isPerspective: boolean;

	camPos: THREE.Vector3;
	targetPos: THREE.Vector3;

	orthoZoom: number;
	orthoSize: number;
};

class LineMeasurement {

	scene: THREE.Scene;

	lines: Line2[];

	positions: number[];

	constructor(scene: THREE.Scene) {
		this.lines = [];
		this.positions = [];
		this.scene = scene;
	}

	addPoint(newPoint: THREE.Vector3) {
		this.positions.push(newPoint.x, newPoint.y, newPoint.z);

		if (this.positions.length >= 6) {

			const lastTwoPos = this.positions.slice(-6, this.positions.length);

			// Create new line segment
			const lineMaterial = new LineMaterial({ color: 'cyan', linewidth: 5 });
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
			marker.center.set(0.5, 0.5);
			this.scene.add(marker);
		}
	}
}

class TriangleMeasurement {

	scene: THREE.Scene;

	mesh: THREE.Mesh;

	positions: THREE.Vector3[];

	isComplete = false;

	constructor(scene: THREE.Scene) {
		this.positions = [];
		this.scene = scene;
	}

	addPoint(newPoint: THREE.Vector3) {
		this.positions.push(newPoint);

		if (this.positions.length === 3) {

			// Create the triangle
			const triMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			triMaterial.depthTest = false;
			triMaterial.depthWrite = false;
			triMaterial.side = THREE.DoubleSide;

			const triGeom = new THREE.BufferGeometry();
			triGeom.setFromPoints(this.positions);

			const tri = new THREE.Mesh(triGeom, triMaterial);
			tri.layers.disableAll();
			tri.layers.enable(1); // Layers purely used for organisation. Switching off the depth test still necessary to prevent geometry intersection.

			this.scene.add(tri);

			this.mesh = tri;

			// Create label
			const pos0 = this.positions[0];
			const pos1 = this.positions[1];
			const pos2 = this.positions[2];

			const labelPos = pos0.add(pos1.add(pos2)).divideScalar(3.0);

			const areaMarkerDiv = document.createElement('div');
			areaMarkerDiv.textContent = 'Area goes here';
			areaMarkerDiv.style.backgroundColor = 'white';
			areaMarkerDiv.style.color = 'black';
			areaMarkerDiv.style.borderStyle = 'solid';
			areaMarkerDiv.style.borderWidth = '3px';
			areaMarkerDiv.style.borderColor = 'black';

			const marker = new CSS2DObject(areaMarkerDiv);
			marker.position.set(labelPos.x, labelPos.y, labelPos.z);
			marker.center.set(0.5, 0.5);
			this.scene.add(marker);

			this.isComplete = true;
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

	material_pick: THREE.ShaderMaterial;

	renderer = THREE.WebGLRenderer;

	pickScene: THREE.Scene;

	pickBuffer : THREE.WebGLRenderTarget;

	depthBuffer: THREE.WebGLRenderTarget;

	depthScene: THREE.Scene;

	material_depth: THREE.ShaderMaterial;

	material_postprocessing: THREE.ShaderMaterial;

	depthCpuBuffer: Float32Array;

	width: number;

	height: number;

	pickCpuBuffer: Uint32Array;

	pickOperator: PickOperator;

	pickManager: PickManager;

	markupContainer: HTMLElement;

	pinManager: PinManager;

	cursor: HTMLElement;

	postprocessing_quad: FullScreenQuad;

	materialInstances: THREE.ShaderMaterial[];

	transformManager: any;

	lastStoredView: View;

	raycaster: THREE.Raycaster;

	clientDimensions: THREE.Vector2;

	clientOffsets: THREE.Vector2;

	pointerDownLineListener = this.onPointerDownLine.bind(this);

	pointerDownAreaListener = this.onPointerDownArea.bind(this);

	lineMeasuringEnabled: boolean;

	lineMeasurements: LineMeasurement[];

	areaMeasuringEnabled: boolean;

	areaMeasurements: TriangleMeasurement[];

	renderer = THREE.WebGLRenderer;

	labelRenderer = CSS2DRenderer;

	constructor(container: HTMLElement) {

		this.markupContainer = document.createElement('div');
		container.appendChild(this.markupContainer);
		this.markupContainer.style.width = '100%';
		this.markupContainer.style.height = '100%';
		this.markupContainer.style.position = 'absolute';
		this.markupContainer.style.pointerEvents = 'none';

		this.pinManager = new PinManager(this.markupContainer);

		this.cursor = this.pinManager.addElement();

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();

		this.pickScene = new THREE.Scene();
		this.depthScene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight);

		const aspect = container.clientWidth / container.clientHeight;
		this.perspCam = new THREE.PerspectiveCamera(60, aspect);
		this.perspCam.layers.enable(1);
		this.orthoCam = new THREE.OrthographicCamera(); // Default values. Proper values will be calculated on first activation
		this.orthoCam.layers.enable(1);
		this.camera = this.perspCam;

		this.width = container.clientWidth;
		this.height = container.clientHeight;

		this.pickCpuBuffer = new Uint32Array(1);
		this.depthCpuBuffer = new Float32Array(4);

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );

		this.scene.add( cube );
		this.camera.position.z = 5;


		new OrbitControls( this.camera, this.renderer.domElement );
		this.pickOperator = new PickOperator(this.renderer.domElement);

		// Prepare measurements
		this.lineMeasuringEnabled = false;
		this.lineMeasurements = [];

		this.areaMeasuringEnabled = false;
		this.areaMeasurements = [];

		// Create Renderer for labels
		this.labelRenderer = new CSS2DRenderer();
		this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
		this.labelRenderer.domElement.style.position = 'absolute';
		this.labelRenderer.domElement.style.top = '0px';
		container.appendChild(this.labelRenderer.domElement);

		// Create circle style for the marker
		// (probably not the right way to do this, but it works)
		var style = document.createElement('style');
		style.innerHTML = '.circle { height: 10px; width: 10px; border-radius: 50%;}';
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

		this.pickManager = new PickManager();

		this.pickBuffer = new THREE.WebGLRenderTarget(container.clientWidth, container.clientHeight);

		this.depthBuffer = new THREE.WebGLRenderTarget(container.clientWidth, container.clientHeight, {
			type: THREE.FloatType,
			format: THREE.RGBAFormat,
		});

		this.postprocessing_quad = new FullScreenQuad(this.material_postprocessing);
		this.material_postprocessing.uniforms = {
			depthNormals: { value: this.depthBuffer.texture },
			pick: { value: this.pickBuffer.texture },
		};

		this.materialInstances = [];

		this.transformManager = {};

		// Initial render
		this.animate();
	}

	animate() {
		this.updateNearFarPlanes();

		this.renderer.setClearAlpha(0);

		this.renderer.setRenderTarget(this.pickBuffer);
		this.renderer.render(this.pickScene, this.camera);

		this.renderer.setRenderTarget(this.depthBuffer);
		this.renderer.render(this.depthScene, this.camera);

		this.readUtilityBuffers(this.pickOperator.position);

		if (this.pickOperator.clicked) {
			this.pickOperator.clicked = false;
			const lid = this.pickCpuBuffer[0];
			if (lid > 0) {
				const uuid = this.pickManager.uniqueIds[lid];
				this.highlightMesh(uuid);

				// Uncomment to drop pins directly in the viewer
				//this.pinManager.dropPin(this.screenToWorld(this.pickOperator.position, this.depthCpuBuffer[3]));
			}
		}

		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);

		for (var i = 0; i < this.pinManager.pins.length; i++) {
			const pin = this.pinManager.pins[i];
			const p = this.worldToCanvas(pin.position);
			pin.elem.style.left = p.x + 'px';
			pin.elem.style.top = p.y + 'px';
		}

		// Uncomment to demonstrate post processing
		//this.postprocessing_quad.render(this.renderer);

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

		var transparent = false;

		const colorMapData = new Uint8Array(width * 4);
		for (var i = 0; i < metadata.mapping.length; i++) {
			const m = metadata.mapping[i];
			const material = metadata.materials[m.material];
			colorMapData[(i * 4) + 0] = material.albedoColor.r * 255;
			colorMapData[(i * 4) + 1] = material.albedoColor.g * 255;
			colorMapData[(i * 4) + 2] = material.albedoColor.b * 255;
			colorMapData[(i * 4) + 3] = material.albedoColor.a * 255;

			if (material.albedoColor.a < 1) {
				transparent = true;
			}
		}

		const colorMapTexture = new THREE.DataTexture(colorMapData, width, height, THREE.RGBAFormat);
		colorMapTexture.needsUpdate = true;

		const transformObject = {
			meshes: [],
		};

		const pickMapData = new Uint32Array(width);
		for (var i = 0; i < metadata.mapping.length; i++) {
			const m = metadata.mapping[i];
			const lid = this.pickManager.counter;
			pickMapData[i] = lid;
			this.pickManager.uniqueIds[lid] = m.name;
			this.pickManager.sharedIds[lid] = m.sharedID;
			this.pickManager.colorMaps[m.name] = {
				map: colorMapTexture,
				index: i,
			};
			this.pickManager.counter++;

			this.transformManager[m.name] = transformObject;
		}

		const pickMapTexture = new THREE.DataTexture(new Uint8Array(pickMapData.buffer), width, height, THREE.RGBAFormat);
		pickMapTexture.needsUpdate = true;

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
			'color_map': { value: colorMapTexture },
			'maps_width': { value: width },
			'plane': { value: new THREE.Vector4(1, 0, 0, 0) },
		};

		if (transparent) {
			material.transparent = true;
			material.depthWrite = false;
		}

		var pickMaterial = this.material_pick.clone();
		pickMaterial.uniforms = {
			'pick_map': { value: pickMapTexture },
			'maps_width': { value: width },
		};

		var depthMaterial = this.material_depth.clone();
		depthMaterial.uniforms = {
			'pick_map': { value: pickMapTexture },
			'maps_width': { value: width },
		};

		this.materialInstances.push(material);

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

			const m1 = new THREE.Mesh( geometry, material );
			const m2 = new THREE.Mesh( geometry, pickMaterial );
			const m3 = new THREE.Mesh( geometry, depthMaterial );

			this.scene.add(m1);
			this.pickScene.add(m2);
			this.depthScene.add(m3);

			transformObject.meshes.push(m1);
			transformObject.meshes.push(m2);
			transformObject.meshes.push(m3);
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

	switchToOrthographicCamera() {
		console.log('Switching to ortho cam');

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

	switchToPerspectiveCamera() {
		console.log('Switching to perspective cam');
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
			side: THREE.DoubleSide,
		});
		this.material_textured = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: StandardFragmentShader,
			side: THREE.DoubleSide,
			defines: {
				USE_COLOR_TEX: true,
			},
		});
		this.material_pick = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: PickFragmentShader,
			blending: THREE.NoBlending,
			side: THREE.DoubleSide,
		});
		this.material_depth = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: DepthFragmentShader,
			blending: THREE.NoBlending,
			side: THREE.DoubleSide,
		});
		this.material_postprocessing = new THREE.ShaderMaterial({
			vertexShader: PostProcessingVertexShader,
			fragmentShader: PostProcessingFragmentShader,
			blending: THREE.NoBlending,
		});
	}

	readUtilityBuffers(position) {
		if (position) {
			this.renderer.readRenderTargetPixels(this.pickBuffer, position.x, position.y, 1, 1, new Uint8Array(this.pickCpuBuffer.buffer));
			this.renderer.readRenderTargetPixels(this.depthBuffer, position.x, position.y, 1, 1, this.depthCpuBuffer);
		}
	}

	highlightMesh(uniqueId: string) {
		const mapping = this.pickManager.colorMaps[uniqueId];
		mapping.map.image.data[(mapping.index * 4) + 0] = 255;
		mapping.map.image.data[(mapping.index * 4) + 1] = 0;
		mapping.map.image.data[(mapping.index * 4) + 2] = 0;
		mapping.map.needsUpdate = true;
	}

	screenToWorld(position: THREE.Vector2Like, z: number): THREE.Vector3 {
		// In order to go apply the inverse of the projection matrix, we need
		// the four projected components the forward transformation would
		// produce.
		// x & y we get from screen space; for z and w, we apply the
		// forward transformations to the known z-view component.

		const A = this.camera.projectionMatrix.elements[10];
		const B = this.camera.projectionMatrix.elements[14];
		const zp = A * z + B;
		const wp = -z;
		const xp = (((position.x / this.width) * 2) - 1) * wp;
		const yp = (((position.y / this.height) * 2) - 1) * wp;

		const projected = new THREE.Vector4(xp, yp, zp, wp);
		projected.applyMatrix4(this.camera.projectionMatrixInverse);
		this.camera.localToWorld(projected);

		// Todo; test if we get better precision with the ray-cast approach

		return new THREE.Vector3(projected.x, projected.y, projected.z);
	}

	worldToCanvas(position: THREE.Vector3): THREE.Vector2 {
		const projected = new THREE.Vector4(position.x, position.y, position.z, 1);
		this.camera.worldToLocal(projected);
		projected.applyMatrix4(this.camera.projectionMatrix);
		projected.x /= projected.w;
		projected.y /= projected.w;
		projected.x = ((projected.x + 1) / 2) * this.width;
		projected.y = ((projected.y + 1) / 2) * this.height;
		return new THREE.Vector2(projected.x, this.height - projected.y);
	}

	updateClipPlane(x: number) {
		for (var i = 0; i < this.materialInstances.length; i++) {
			this.materialInstances[i].uniforms.plane.value = new THREE.Vector4(1, 0, 0, x);
			this.materialInstances[i].uniformsNeedUpdate = true;
		}
	}

	createTexturedPlane(image: HTMLImageElement) {
		new THREE.TextureLoader().load(
			image.src,
			(arg) => {
				arg.wrapS = THREE.RepeatWrapping;
				arg.wrapT = THREE.RepeatWrapping;

				const geometry = new THREE.PlaneGeometry( 40000, 40000 );
				const material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide, map: arg, transparent: true } );
				const plane = new THREE.Mesh( geometry, material );
				this.scene.add( plane );
			},
			undefined,
			console.error,
		);
	}

	moveMeshes(teamspace: string, modelId: string, meshes: string[], matrix: number[]) {

		const m = new THREE.Matrix4();
		//m.setPosition(new THREE.Vector3(0, 1000, 0));
		m.fromArray(matrix);
		m.transpose();

		for (var i = 0; i < meshes.length; i++) {
			const helper = this.transformManager[meshes[i]];
			for (var j = 0; j < helper.meshes.length; j++) {
				const g = helper.meshes[j];
				g.matrixAutoUpdate = false;
				g.matrix.fromArray(m.elements);
			}
		}
	}

	storeCurrentView() {

		let isPerspective;
		let orthoZoom;
		if (this.camera.type === 'OrthographicCamera') {
			isPerspective = false;
			orthoZoom = this.orthoCam.zoom;
		} else {
			isPerspective = true;
			orthoZoom = 1;
		}

		const camPos = this.camera.position.clone();
		const targetPos = this.controls.target.clone();

		this.lastStoredView = {
			isPerspective: isPerspective,
			camPos: camPos,
			targetPos: targetPos,
			orthoZoom: orthoZoom,
		};

		console.log('Stored View');
		console.log(this.lastStoredView);
	}

	restoreLastStoredView() {
		console.log(this.lastStoredView);

		if (this.lastStoredView === undefined) {
			console.log('No view stored');
			return;
		}

		const isCamPerspective = (this.camera.type === 'PerspectiveCamera');

		if (this.lastStoredView.isPerspective != isCamPerspective) {
			if (this.lastStoredView.isPerspective)
				this.switchToPerspectiveCamera();
			else
				this.switchToOrthographicCamera();
			this.orthoCam.zoom = this.lastStoredView.orthoZoom;
		}

		this.controls.target.copy(this.lastStoredView.targetPos);

		this.camera.position.set(this.lastStoredView.camPos.x, this.lastStoredView.camPos.y, this.lastStoredView.camPos.z);
		this.camera.lookAt(this.controls.target);
	}

	// Demo method for loading a view created with the old viewer
	restoreDemoViewCar() {
		var position = new THREE.Vector3(-25194.008606305666,
                6232.031199113353,
                -742.4361472298187);

		var lookAt = new THREE.Vector3(-48621.729309430666,
                -45855.65239463665,
                85679.82947777018);

		const up = new THREE.Vector3(-0.13156041502952576,
                0.8643866777420044,
                0.4853117763996124);
		
		const offset = new THREE.Vector3(
			-52593.076965680666,
			-8317.375050886647,
			74187.11072777018
		);

		position = position.sub(offset);
		lookAt = lookAt.sub(offset);

		this.controls.target.copy(lookAt);

		this.camera.position.set(position.x, position.y, position.z);
		this.camera.up.set(up.x, up.y, up.z);
		this.camera.lookAt(lookAt);		
	}

	// Demo method for loading a view created with the old viewer (orthographic)
	restoreDemoViewCarOrtho() {

		this.switchToOrthographicCamera();

		var position = new THREE.Vector3(
			-28463.235168805666,
			12996.480417863353,
			-13611.826772229819);

		var lookAt = new THREE.Vector3(
			-22785.887512555666,
			-36414.84770713665,
			77256.65760277018);

		const up = new THREE.Vector3(
			0.029743509367108345,
			0.8789079189300537,
			0.47606319189071655);

		
		const offset = new THREE.Vector3(
			-52593.076965680666,
			-8317.375050886647,
			74187.11072777018
		);

		const orthoSize = 3200.95751953125;

		position = position.sub(offset);
		lookAt = lookAt.sub(offset);

		
		this.camera.position.set(position.x, position.y, position.z);
		this.camera.up.set(up.x, up.y, up.z);
		this.controls.target.copy(lookAt);
		this.camera.lookAt(lookAt);		

		const aspect = this.orthoCam.right / this.orthoCam.top;

		this.orthoCam.top = orthoSize;
		this.orthoCam.bottom = -orthoSize;
		this.orthoCam.left = -(aspect * orthoSize);
		this.orthoCam.right = aspect * orthoSize
	}

	takeScreenshot() {
		try {
			let mime = 'image/jpeg';
			let downloadMime = 'image/octet-stream';

			this.animate(); // Render right before taking the screenshot
			let imgData = this.renderer.domElement.toDataURL(mime);

			imgData = imgData.replace(mime, downloadMime);

			// Automatically download it.
			let link = document.createElement('a');
			if (typeof link.download === 'string') {
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

	enableLineMeasuring() {
		// Disable area measurement if active
		if (this.areaMeasuringEnabled) {
			window.removeEventListener('pointerdown', this.pointerDownAreaListener);
			this.areaMeasuringEnabled = false;
		}

		// Enable Line Measurement
		window.addEventListener('pointerdown', this.pointerDownLineListener);

		const newMeasurement = new LineMeasurement(this.scene);
		this.lineMeasurements.push(newMeasurement);

		this.lineMeasuringEnabled = true;
	}

	disableLineMeasuring() {
		window.removeEventListener('pointerdown', this.pointerDownLineListener);
		this.lineMeasuringEnabled = false;
	}

	onPointerDownLine(event) {

		const pointer = new THREE.Vector2();
		pointer.x = ((event.clientX - this.clientOffsets.x) / this.clientDimensions.x) * 2 - 1;
		pointer.y = - ((event.clientY - this.clientOffsets.y) / this.clientDimensions.y) * 2 + 1;

		this.raycaster.setFromCamera(pointer, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children, false);

		// Create marker at clicked location
		if (intersects.length > 0) {
			const markerPos = intersects[0].point.clone();

			const newMarkerDiv = document.createElement('div');
			newMarkerDiv.className = 'circle';
			newMarkerDiv.style.backgroundColor = 'cyan';

			const marker = new CSS2DObject(newMarkerDiv);
			marker.position.set(markerPos.x, markerPos.y, markerPos.z);
			marker.center.set(0.5, 0.5);
			this.scene.add(marker);

			// Update current line measurement
			const measurement = this.lineMeasurements[this.lineMeasurements.length - 1];
			measurement.addPoint(markerPos);
		}
	}

	enableAreaMeasuring() {
		// Disable line measurement if active
		if (this.lineMeasuringEnabled) {
			window.removeEventListener('pointerdown', this.pointerDownLineListener);
			this.lineMeasuringEnabled = false;
		}

		// Enable Area Measurement
		window.addEventListener('pointerdown', this.pointerDownAreaListener);

		const newMeasurement = new TriangleMeasurement(this.scene);
		this.areaMeasurements.push(newMeasurement);

		this.areaMeasuringEnabled = true;
	}

	disableAreaMeasuring() {
		window.removeEventListener('pointerdown', this.pointerDownAreaListener);
		this.areaMeasuringEnabled = false;
	}

	onPointerDownArea(event) {

		const pointer = new THREE.Vector2();
		pointer.x = ((event.clientX - this.clientOffsets.x) / this.clientDimensions.x) * 2 - 1;
		pointer.y = - ((event.clientY - this.clientOffsets.y) / this.clientDimensions.y) * 2 + 1;

		this.raycaster.setFromCamera(pointer, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children, false);

		// Create marker at clicked location
		if (intersects.length > 0) {
			const markerPos = intersects[0].point.clone();

			const newMarkerDiv = document.createElement('div');
			newMarkerDiv.className = 'circle';
			newMarkerDiv.style.backgroundColor = '#00ff00';

			const marker = new CSS2DObject(newMarkerDiv);
			marker.position.set(markerPos.x, markerPos.y, markerPos.z);
			marker.center.set(0.5, 0.5);
			this.scene.add(marker);

			// Update current area measurement
			const measurement = this.areaMeasurements[this.areaMeasurements.length - 1];
			measurement.addPoint(markerPos);

			// Check if the triangle is complete
			if (measurement.isComplete) {
				// Create new one if that's the case
				const newMeasurement = new TriangleMeasurement(this.scene);
				this.areaMeasurements.push(newMeasurement);
			}
		}
	}
}