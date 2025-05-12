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

export class ThreeJsViewer {

	sceneBounds: THREE.Box3;

	sceneCorners: THREE.Vector3[];

	camera: THREE.Camera;

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


}