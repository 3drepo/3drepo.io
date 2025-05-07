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

import StandardVertexShader from './standard_vertex.glsl';
import StandardFragmentShader from './standard_fragment.glsl';
import PickFragmentShader from './pick_fragment.glsl';

class VertexAttribute {

	size: number;

	name: string;

	constructor(name, size) {
		this.name = name;
		this.size = size;
	}
}

class PickHandler {
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
		this.position = this.getPosition(ev);
		//console.log(this.position);
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

export class ThreeJsViewer {

	sceneBounds: THREE.Box3;

	sceneCorners: THREE.Vector3[];

	camera: THREE.Camera;

	scene: THREE.Scene;

	material: THREE.ShaderMaterial;

	material_textured: THREE.ShaderMaterial;

	material_pick: THREE.ShaderMaterial;

	renderer = THREE.WebGLRenderer;

	utilsScene: THREE.Scene;

	pickBuffer : THREE.WebGLRenderTarget;

	width: number;

	height: number;

	pickCpuBuffer: Uint32Array;

	pickHandler: PickHandler;

	pickManager: PickManager;

	constructor(container: HTMLElement) {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		this.utilsScene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight);

		this.width = container.clientWidth;
		this.height = container.clientHeight;

		this.pickCpuBuffer = new Uint32Array(1);

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		const cube = new THREE.Mesh( geometry, material );

		this.scene.add( cube );
		this.camera.position.z = 5;
		this.camera.far = 500000;
		this.camera.near = 0;

		new OrbitControls( this.camera, this.renderer.domElement );
		this.pickHandler = new PickHandler(this.renderer.domElement);

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
	}

	animate() {
		this.updateNearFarPlanes();

		this.renderer.setClearAlpha(0);

		this.renderer.setRenderTarget(this.pickBuffer);
		this.renderer.render(this.utilsScene, this.camera);

		this.readUtilityBuffers(this.pickHandler.position);

		if (this.pickHandler.clicked) {
			this.pickHandler.clicked = false;
			const lid = this.pickCpuBuffer[0];
			if (lid > 0) {
				const uuid = this.pickManager.uniqueIds[lid];
				this.highlightMesh(uuid);
			}
		}

		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);
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

		const colorMapData = new Uint8Array(width * 4);
		for (var i = 0; i < metadata.mapping.length; i++) {
			const m = metadata.mapping[i];
			const material = metadata.materials[m.material];
			colorMapData[(i * 4) + 0] = material.albedoColor.r * 255;
			colorMapData[(i * 4) + 1] = material.albedoColor.g * 255;
			colorMapData[(i * 4) + 2] = material.albedoColor.b * 255;
			colorMapData[(i * 4) + 3] = material.albedoColor.a * 255;
		}

		const colorMapTexture = new THREE.DataTexture(colorMapData, width, height, THREE.RGBAFormat);
		colorMapTexture.needsUpdate = true;

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
		};

		var pickMaterial = this.material_pick.clone();
		pickMaterial.uniforms = {
			'pick_map': { value: pickMapTexture },
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

			this.scene.add(new THREE.Mesh( geometry, material ));
			this.utilsScene.add(new THREE.Mesh( geometry, pickMaterial ));
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
		});
		this.material_textured = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: StandardFragmentShader,
			defines: {
				USE_COLOR_TEX: true,
			},
		});
		this.material_pick = new THREE.ShaderMaterial({
			vertexShader: StandardVertexShader,
			fragmentShader: PickFragmentShader,
			blending: THREE.NoBlending,
		});
	}

	readUtilityBuffers(position) {
		if (position) {
			this.renderer.readRenderTargetPixels(this.pickBuffer, position.x, position.y, 1, 1, new Uint8Array(this.pickCpuBuffer.buffer));
		}
	}

	highlightMesh(uniqueId: string) {
		const mapping = this.pickManager.colorMaps[uniqueId];
		mapping.map.image.data[(mapping.index * 4) + 0] = 255;
		mapping.map.image.data[(mapping.index * 4) + 1] = 0;
		mapping.map.image.data[(mapping.index * 4) + 2] = 0;
		mapping.map.needsUpdate = true;
	}
}