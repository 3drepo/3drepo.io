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

import { MetadataManager, Node, Metadata, IMetadataBuffer as IMetadataBuffer, Overrides } from './metadataManager';

class TreeInfo {
	levels: number;

	totalNodes: number;

	leafNodes: number;

	constructor() {
		this.levels = 0;
		this.totalNodes = 0;
		this.leafNodes = 0;
	}
}

interface TestMetadataBufferManager {
	numWrites: number;
	numUpdates: number;
	numResources: number;
}

class TestMetadataBuffer implements IMetadataBuffer {
	setHidden(index: number, value: boolean) {
		this.owner.numUpdates++;
		this.buffer[index * 4] = 0x1;
		this.updated = true;
	}

	owner: TestMetadataBufferManager;

	texture: WebGLTexture;

	buffer: Uint8Array;

	updated: boolean;

	constructor(owner: TestMetadataBufferManager) {
		this.owner = owner;
		this.owner.numResources++;
		this.updated = false;
	}
}

class TestMetadataBufferManager implements TestMetadataBufferManager {

	numResources: number;

	numWrites: number;

	numUpdates: number;

	ctx: WebGL2RenderingContext;

	buffers: TestMetadataBuffer[];

	constructor(ctx: WebGL2RenderingContext) {
		this.numResources = 0;
		this.numWrites = 0;
		this.numUpdates = 0;
		this.ctx = ctx;
		this.buffers = [];
	}

	private createTexture(buffer: Uint8Array): WebGLTexture {
		const gl = this.ctx;
		const texture = this.ctx.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, buffer.byteLength / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer, 0);
		return texture;
	}

	private updateTexture(texture: WebGLTexture, buffer: Uint8Array) {
		const gl = this.ctx;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, buffer.byteLength / 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer, 0);
		this.numWrites++;
	}

	createBuffer(numElements: number): TestMetadataBuffer {
		const a = new TestMetadataBuffer(this);
		a.buffer = new Uint8Array(numElements * 4);
		a.texture = this.createTexture(a.buffer);
		this.buffers.push(a);
		return a;
	}

	update() {
		for (var i = 0; i < this.buffers.length; i++) {
			const b = this.buffers[i];
			if (b.updated) {
				this.updateTexture(b.texture, b.buffer);
				b.updated = false;
			}
		}
	}
}

class BranchCreationContext {
	leafNodes: Node[];

	constructor() {
		this.leafNodes = [];
	}
}

class MetadataManagerTestDriver {

	bufferManager: TestMetadataBufferManager;

	constructor(ctx: WebGL2RenderingContext) {
		this.bufferManager = new TestMetadataBufferManager(ctx);
	}

	createBranch(): Node {
		const ctx = new BranchCreationContext();
		const root = new Node(crypto.randomUUID());
		this.createChildren(root, 0, ctx);
		this.createMetadataObjects(ctx);
		return root;
	}

	private createChildren(parent: Node, level: number, ctx: BranchCreationContext) {
		for (var i = 0; i < 10; i++) {
			const node = new Node(crypto.randomUUID());
			node.parent = parent;
			if (!parent.children) {
				parent.children = new Map<string, Node>();
			}
			parent.children.set(node.id, node);

			if (level < 5) {
				this.createChildren(node, level + 1, ctx);
			} else {
				ctx.leafNodes.push(node);
			}
		}
	}

	private createMetadataObjects(ctx: BranchCreationContext) {

		const numElements = 3431;

		for (var i = 0; i < ctx.leafNodes.length;) {
			const buffer = this.bufferManager.createBuffer(numElements);
			for (var j = 0; j < numElements && i < ctx.leafNodes.length;) {
				const m = new Metadata();
				m.buffer = buffer;
				m.index = j;
				ctx.leafNodes[i].metadata = m;
				j++;
				i++;
			}
		}
	}

	countNodes(manager: MetadataManager): TreeInfo {
		const info = new TreeInfo();
		this.traverseTreeCount(manager.tree, info, 0);
		return info;
	}

	private traverseTreeCount(node: Node, info: TreeInfo, level: number) {
		info.levels = Math.max(info.levels, level);
		info.totalNodes++;

		if (node.children) {
			for (const [, child] of node.children) {
				this.traverseTreeCount(child, info, level + 1);
			}
		} else {
			info.leafNodes++;
		}
	}

	update() {
		this.bufferManager.update();
	}
}

class MetadataManagerTests {

	overrides: Map<string, Overrides>;

	manager: MetadataManager;

	ctx: WebGL2RenderingContext;

	runTest1() {
		// Basic initial test for observing memory and initialisation time
		// of a large tree.

		const manager = new MetadataManager();
		const driver = new MetadataManagerTestDriver(this.ctx);

		const b = driver.createBranch();

		var start = performance.now();

		manager.mergeBranch(b);

		// eslint-disable-next-line no-console
		console.log(performance.now() - start);
		start = performance.now();

		driver.update();

		// eslint-disable-next-line no-console
		console.log(performance.now() - start);


		const report = driver.countNodes(manager);

		// eslint-disable-next-line no-console
		console.log(report);
		// eslint-disable-next-line no-console
		console.log(driver.bufferManager);

		this.manager = manager;
	}

	runTest2() {

		// Basic intial test for observing memory of large numbers of nodes
		// (approximating the persistent store).

		const overrides = new Map<string, Overrides>();

		// Create 1,000,000 overrides in a map object

		for (var i = 0; i < 1000000; i++) {
			const uuid = crypto.randomUUID();
			const override = new Overrides();
			override.colour = '#ff6347';
			overrides.set(uuid, override);
		}

		this.overrides = overrides; // Make sure this is not GC'd before we snapshot
	}

	runTest3() {
		// Select (i.e. apply the highlight flag to different numbers of elements)

		const manager = new MetadataManager();
		const driver = new MetadataManagerTestDriver(this.ctx);
		const b = driver.createBranch();

		manager.mergeBranch(b);



	}
}

function runTest3() {
	// Merge a small tree into a very large tree with 1000's of nodes

}

function runTest4() {
	// Assuming we have a merged tree, traverse all nodes from the start

}

function runTest5() {
	// Apply the hidden state to the top of the tree, then visible state to a node 75% of the way down.
	// A quarter of nodes should be visible by the end.

}

function runTest1() {


}
function createTestObject(): MetadataManagerTests {
	return new MetadataManagerTests();
}

export { createTestObject };