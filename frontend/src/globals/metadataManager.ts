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

import { Stack } from '@datastructures-js/stack';

/**
 * Represents an absolute state that is held by an element/the metadata buffers.
 * This is the result of applying all defaults and overrides.
 */
class State {
	highlight: IRGB | boolean;

	hidden: boolean;

	constructor() {
		this.highlight = false;
		this.hidden = false;
	}
}

type StateUpdate = {
	highlight?: IRGB;

	hidden?: boolean;
};

class Overrides {
	colour: undefined | {};

	visible: undefined | boolean;

	selected: undefined | boolean;
}

/**
 * Represents a high level wrapper around an object that manages a metadata GPU
 * resource. The object is responsible for optimising updates based on its own
 * state - it may recieve multiple set calls with values it already holds, for
 * example, which it should mask itself. The object can rely on being write-only
 * however, at least publically.
 */
interface IMetadataBuffer {
	setHighlight(index: number, highlighted: boolean): void;
	setHidden(index: number, hidden: boolean): void;
	setColour(index: number, colour: IRGB): void;
	setTransparency(index: number, alpha: number): void;
	setSpecular(index: number, specular: IRGB): void;
	setShininess(index: number, shininess: number): void;
	setGUID(index: number, guid: number): void;

	// Tells the system that this index exists in the specified group. And index
	// may sit in multiple groups at once.
	addFlagsGroup(index: number, group: number): void;
}

interface IMetadataMapOwner {
	numWrites: number;
}

interface IRGB {
	r: number;
	g: number;
	b: number;
}

enum MaterialFlags {
	None = 0,
	Opaque = 1,
	Transparent = 2,
}

/**
 * Helper class that keeps track of how many elements within the mesh
 * are within the transparent or opaque queues (and so whether the mesh
 * should be in one, the other, or both).
 */
class FlagsHelper {
	numOpaque: number;

	numTransparent: number;

	meshIdx: number;

	constructor(meshIdx: number) {
		this.meshIdx = meshIdx;
		this.numOpaque = 0;
		this.numTransparent = 0;
	}
}

/**
 * Manages the flags for a supermesh/bundle. There is one flag for each Unity
 * Component (MeshRenderer), which can be either Opaque or Transparent. This
 * object manages the memory directly in the WebAssembly - that is, the same
 * memory that the Unity instance will use when issue the draw calls.
 */
class FlagsManager {
	constructor(supermeshId: string, memory: WebAssembly.Memory) {
		this.flagsByMesh = [];
		this.updated = new Set<FlagsHelper>();
		this.flagsByElement = new Map<number, FlagsHelper[]>();
		this.supermeshId = supermeshId;
		this.memory = memory;
		this.length = 0;
		this.offset = 0;
	}

	flagsByMesh: FlagsHelper[];

	flagsByElement: Map<number, FlagsHelper[]>;

	updated: Set<FlagsHelper>;

	supermeshId: string;

	private memory: WebAssembly.Memory;

	private offset: number;

	// Length of the flags array in bytes in the WebAssembly memory. When
	// this is zero it means the array has not yet been set up.
	private length: number;

	/**
	 * Registers that the element with luid elementIdx exists as part of the
	 * mesh with the index meshIdx. From now on, if the flags for that element
	 * change, they will change for all the meshes it belongs to as well.
	 */
	addFlagsGroup(elementIdx: number, meshIdx: number) {
		if (!this.flagsByMesh[meshIdx]) {
			this.flagsByMesh[meshIdx] = new FlagsHelper(meshIdx);
		}

		const componentFlags = this.flagsByMesh[meshIdx];

		var elementFlags = this.flagsByElement.get(elementIdx);
		if (!elementFlags) {
			elementFlags = [];
			this.flagsByElement.set(elementIdx, elementFlags);
		}
		elementFlags.push(componentFlags);

		// All flags are set to a default value to begin with. This is not an
		// alternative to initialising the flags explicitly, but rather to make
		// the update logic simpler.
		componentFlags.numTransparent++;
		this.updated.add(componentFlags);
	}

	// Opaque and Transparent flags are mutually exclusive, setting one will
	// automatically clear the other.
	setOpaque(index: number) {
		this.updateFlagCounts(index, 1, -1);
	}

	setTransparent(index: number) {
		this.updateFlagCounts(index, -1, 1);
	}

	private updateFlagCounts(index: number, opaque: number, transparent: number) {
		const flagsSet = this.flagsByElement.get(index);
		for (const flags of flagsSet) {
			flags.numOpaque += opaque;
			flags.numTransparent += transparent;

			// This snippet determines if the counts have either transitioned
			// from or to zero within this call, in order to flag them for
			// updates to Unity if so.

			if (opaque < 0 && flags.numOpaque == 0) {
				this.updated.add(flags);
			} else if (opaque > 0 && flags.numOpaque == opaque) {
				this.updated.add(flags);
			}

			if (transparent < 0 && flags.numTransparent == 0) {
				this.updated.add(flags);
			} else if (transparent > 0 && flags.numTransparent == transparent) {
				this.updated.add(flags);
			}
		}
	}

	// In the future we may want to find a way to share an array with Unity
	// instead of going through these calls.
	update() {
		if (this.updated.size && this.length) {
			const view = new Uint16Array(this.memory.buffer, this.offset, this.length);
			for (const flags of this.updated) {
				var f = MaterialFlags.None;
				if (flags.numTransparent > 0) {
					f = f | MaterialFlags.Transparent;
				}
				if (flags.numOpaque > 0) {
					f = f | MaterialFlags.Opaque;
				}
				view[flags.meshIdx] = f;
			}
			this.updated.clear();
		}
	}

	setArray(offset: number, length: number) {
		this.offset = offset;
		this.length = length;
		for (const helper of this.flagsByMesh) {
			this.updated.add(helper);
		}
	}
}

class MetadataBuffer implements IMetadataBuffer {
	setHidden(index: number, value: boolean) {
		const offset = this.getTexelOffset(index, 2);
		if (value && !(this.data[offset + 3] & 0x02)) {
			this.data[offset + 3] |= 0x02;
			this.updated = true;

		} else if (!value && (this.data[offset + 3] & 0x02)) {
			this.data[offset + 3] |= 0xFD;
			this.updated = true;
		}
	}

	setHighlight(index: number, value: boolean): void {
		const offset = this.getTexelOffset(index, 2);
		if (value && !(this.data[offset + 3] & 0x01)) {
			this.data[offset + 3] |= 0x01;
			this.updated = true;
		} else if (!value && (this.data[offset + 3] & 0x01)) {
			this.data[offset + 3] &= 0xFE;
			this.updated = true;
		}
	}

	setColour(index: number, color: IRGB) {
		const offset = this.getTexelOffset(index, 0);
		this.data[offset + 0] = color.r * 255;
		this.data[offset + 1] = color.g * 255;
		this.data[offset + 2] = color.b * 255;
		this.updated = true;
	}

	// Must always be called even if opaque, in order to set the flags properly
	setTransparency(index: number, alpha: number) {
		const offset = this.getTexelOffset(index, 0);
		const value = alpha * 255;
		const previous = this.data[offset + 3];
		this.data[offset + 3] = value;

		if (value >= 255 && previous < 255) {
			this.flags.setOpaque(index);
			this.updated = true;
		} else if (value < 255 && previous >= 255) {
			this.flags.setTransparent(index);
			this.updated = true;
		}
	}

	setSpecular(index: number, specular: IRGB | undefined) {
		if (specular) {
			const offset = this.getTexelOffset(index, 1);
			this.data[offset + 0] = specular.r * 255;
			this.data[offset + 1] = specular.g * 255;
			this.data[offset + 2] = specular.b * 255;
			this.updated = true;
		}
	}

	setShininess(index: number, shininess: number) {
		const offset = this.getTexelOffset(index, 1);
		this.data[offset + 3] = shininess * 255;
		this.updated = true;
	}

	setGUID(index: number, guid: number) {
		if (index > Math.pow(2, 24)) {
			console.error('Number of meshes exceeds selection support!');
		}
		const view = new Uint32Array(this.data.buffer, this.getTexelOffset(index, 3));
		view[0] = guid;
		this.updated = true;
	}

	addFlagsGroup(index: number, group: number) {
		this.flags.addFlagsGroup(index, group);
	}

	getTexelOffset(index: number, property: number) {
		return ((index * MetadataBuffer.TEXELS_PER_ELEMENT) + property) * 4;
	}

	owner: IMetadataMapOwner;

	// The underlying WebGL object that holds the data. This is an implementation
	// detail that this type should abstract through the set APIs. Will be set
	// at a later time.
	texture: WebGLTexture;

	ctx: WebGL2RenderingContext;

	data: Uint8Array;

	updated: boolean;

	width: number;

	height: number;

	flags: FlagsManager; // Maps from an index to a set of flags

	static TEXELS_PER_ELEMENT = 4;

	constructor(owner: IMetadataMapOwner, numElements: number, flags: FlagsManager) {
		this.owner = owner;
		this.updated = false;
		const s = Math.sqrt(numElements * MetadataBuffer.TEXELS_PER_ELEMENT);
		this.width = Math.round(s);
		this.height = Math.ceil(s);
		this.data = new Uint8Array(this.width * this.height * 4);
		this.flags = flags;
	}

	updateTexture() {
		const gl = this.ctx;
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.data, 0);
		this.owner.numWrites++;
		this.updated = false;
	}
}

type Assembly = {
	memory: WebAssembly.Memory;
};

type Module = {
	ctx: WebGL2RenderingContext;
	asm: Assembly;
};

type UnityViewer = {
	SendMessage(gameObject: string, method: string, params: number | string);
	Module: Module;
};

class MetadataBufferObjectsManager implements IMetadataMapOwner {

	numResources: number;

	numWrites: number;

	numUpdates: number;

	private ctx: WebGL2RenderingContext;

	private viewer: UnityViewer;

	/**
	 * Holds all active MetadataBuffers (which may or may not yet have their)
	 * textures set. Indexed by supermesh/bundle Id.
	 */
	private buffers: Map<string, MetadataBuffer>;

	constructor(viewer: UnityViewer) {
		this.numResources = 0;
		this.numWrites = 0;
		this.numUpdates = 0;
		this.viewer = viewer;
		this.ctx = viewer.Module.ctx;
		this.buffers = new Map<string, MetadataBuffer>();
	}

	/**
	 * Creates a container to hold a Metadata Buffer Object. The object itself
	 * must be set by Unity via a call to registerSupermeshMap.
	 */
	createBuffer(supermeshId: string, numElements: number): MetadataBuffer {
		const flags = new FlagsManager(supermeshId, this.viewer.Module.asm.memory);
		const buffer = new MetadataBuffer(this, numElements, flags);
		this.buffers.set(supermeshId, buffer);
		return buffer;
	}

	registerTexture(supermeshId: string, texture: WebGLTexture) {
		const buffer = this.buffers.get(supermeshId);
		buffer.texture = texture;
		buffer.ctx = this.ctx; // Context will have been set by this time
		buffer.updated = true;
		this.update();
	}

	// The flags buffer is a pointer into the wasm memory - we cannot store the
	// view itself because the Memory can be resized at any time. The length
	// should be given in bytes.
	registerFlags(supermeshId: string, offset: number, length: number) {
		const buffer = this.buffers.get(supermeshId);
		buffer?.flags.setArray(offset, length);
	}

	update() {
		for (const [, buffer] of this.buffers) {
			if (buffer.updated) {
				buffer.updateTexture();
			}
			buffer.flags.update();
		}
	}
}

class Metadata {
	colour: IRGB;

	hidden: boolean;

	buffer: IMetadataBuffer;

	index: number; // Offset into the metadata buffer object

	constructor(buffer: IMetadataBuffer, index: number) {
		this.buffer = buffer;
		this.index = index;
	}

	updateState(state: State) {
		// Todo: investigate if storing some higher level flags is more efficient
		this.buffer.setHidden(this.index, state.hidden);
		if (state.highlight) {
			this.buffer.setColour(this.index, state.highlight as IRGB);
			this.buffer.setHighlight(this.index, true);
		} else {
			this.buffer.setColour(this.index, this.colour);
			this.buffer.setHighlight(this.index, false);
		}
	}

	/**
	 * The following members are used to set up the metadata record for the
	 * first time - they will be considered the defaults, unless overridden.
	 * Overrides must be made by providing a State object to the updateState
	 * method above.
	 */

	setColour(colour: IRGB) {
		this.colour = colour;
		this.buffer.setColour(this.index, colour);
	}

	setTransparency(alpha: number) {
		this.buffer.setTransparency(this.index, alpha);
	}

	setSpecular(specular: IRGB) {
		this.buffer.setSpecular(this.index, specular);
	}

	setShininess(shininess: number) {
		this.buffer.setShininess(this.index, shininess);
	}

	addFlagsGroup(group: number) {
		this.buffer.addFlagsGroup(this.index, group);
	}

	setGUID(guid: number) {
		this.buffer.setGUID(this.index, guid);
	}
}

class Node {

	// We avoid creating member functions in Node, as it will often be duck-typed
	// from different sources.

	/**
     * The GUID of this node
     */
	id: string;

	// Children are indexed by GUID to facilitate fast updates when paging
	// branches in or out.

	children: Map<string, Node> | undefined;

	sharedId: string | undefined;

	name: string | undefined;

	// Only the root node may have a null parent

	parent: Node | null;

	// Root nodes should have the container, teamspace and revision set.
	// These properties should be set together or not at all.

	container: string | undefined;

	teamspace: string | undefined;

	revision: string | undefined;

	// The following are possible states that may be set on this object.
	// A state being set indicates it is overridden for that branch.
	// If a state is not set, it should be assumed to be the default/inherited value.

	hidden: boolean | undefined; // Explicitly hides the branch if the parent is visible

	visible: boolean | undefined; // Explicitly shows the branch if the parent is hidden

	highlight: IRGB | undefined;


	// The metadata object provides a write-only interface to the GPU resources
	// that hold the metadata for this node. Only mesh nodes will have this set.

	metadata: Metadata | undefined;

	constructor(id: string) {
		this.id = id;
		this.parent = null;
	}
}

/**
 * Used to keep track of how states are inherited/permuted during a
 * traversal. When descending to a new layer of the tree, call Push
 * with the node, and when ascending call Pop. The manager will
 * keep track of the current state ready to apply to metadata objects.
 */
class StateManager {

	state: State;

	stack: Stack<State>;

	constructor() {
		this.state = new State();
		this.stack = new Stack<State>();
	}

	/**
     * Add this nodes overrides, if any, to the stack, updating the current state.
     */
	push(node: Node) {
		// TODO: Does this node have any state overrides? If so, they are combined into
		// the new state and the previous state pushed onto the stack. If not,
		// we just push null and the current state remains unchanged.

		this.stack.push({ ... this.state });

		if (node.hidden) {
			this.state.hidden = true;
		}
		if (node.visible) {
			this.state.hidden = false;
		}
		if (node.highlight) {
			this.state.highlight = node.highlight;
		}
	}

	/**
     * Complementary call of push; all push and pop calls must be made in pairs.
     */
	pop() {
		this.state = this.stack.pop();
	}

	/**
     * Gets the state of the current node from the parent. This call is recursive
     * up to the root. Used to initialise the state when starting a traversal
     * mid-way through the tree.
     */
	pull(node: Node) {

	}

	reset() {
		this.state = new State();
		this.stack.clear();
	}
}

/**
 * Manages the pool of globally unique references that are used for screen space
 * selection.
 */
class GuidManager {
	private nodes: Map<number, Node>;

	private counter: number;

	constructor() {
		this.nodes = new Map<number, Node>();
		this.counter = 1;
	}

	addNode(node: Node): number {
		const guid = this.counter++;
		this.nodes.set(guid, node);
		return guid;
	}

	getNode(guid: number): Node {
		return this.nodes.get(guid);
	}
}

type ModelInfo = {
	container: string,
	revision: string,
	teamspace: string,
};

/**
 * Implements the persistent store for metadata overrides on branches that
 * have not yet been loaded into the sparse tree.
 */
class StateStorage {

	constructor() {
		this.uuidToState = new Map<string, StateUpdate>();
	}

	private uuidToState: Map<string, StateUpdate>;

	add(uuid: string, state: StateUpdate) {
		const s = this.uuidToState.get(uuid);
		if (s) {
			Object.assign(s, state);
		} else {
			this.uuidToState.set(uuid, state);
		}
	}

	/**
	 * Removes the saved state from the store - if any - and applies it to the
	 * provided node.
	 */
	pop(node: Node) {
		const state = this.uuidToState.get(node.id);
		if (state) {
			Object.assign(node, state);
			this.uuidToState.delete(node.id);
		}
	}
}

class MetadataManager {
	constructor() {
		this.tree = new Node('root');
		this.stateManager = new StateManager();
		this.uuidToNode = new Map<string, Node>();
		this.guidManager = new GuidManager();
		this.suidToNode = new Map<string, Node>();
		this.store = new StateStorage();
		this.updated = false;
	}

	private viewer: UnityViewer;

	private guidManager: GuidManager;

	private animationFrameCallback: ()=> void;

	initialise(viewer: UnityViewer) {
		this.viewer = viewer;
		this.mapsManager = new MetadataBufferObjectsManager(viewer);
		this.animationFrameCallback = this.onAnimationFrame.bind(this);
		requestAnimationFrame(this.animationFrameCallback);
	}

	private tree: Node;

	/**
     * The stateManger is a shared object that maintains the state during a
     * traversal. This object itself holds the context during a traversal.
     * It is important that the traversal begins only at one of the public
     * methods, to ensure the stateManager is set up properly.
     */

	private stateManager: StateManager;

	/**
	 * A lookup table that jumps from a uuid to a Node in the tree, used
	 * when the user wants to apply overrides to an arbitrary branch.
	 */

	private uuidToNode: Map<string, Node>;

	/**
	 * Ideally we wouldn't deal with shared ids anymore, but some older APIs
	 * still use them.
	 */
	private suidToNode: Map<string, Node>;

	private mapsManager: MetadataBufferObjectsManager;

	private store: StateStorage;

	/**
	 * When true, indicates that an update should be run on the main tree.
	 */
	private updated: boolean;

	/**
     * The merge operation adds the provided branch to the sparse tree.
     * The branch should already have the metdata buffer objects set up.
     * As the branch is merged, its nodes will adopt the state of the
     * new parents, and the metadata objects will be updated. (The branch
     * should not have any overrides of its own set at this stage.)
     */
	mergeBranch(branch: Node) {
		/**
         * Branches are always provided up the root. This is because we need
         * the branch to define up to the root because there is no guarantee
         * this data will be in the sparse tree otherwise.
         */

		/**
         * For the purposes of mergeing, all Container trees are children of
         * the Federation root node, which is created procedurally. If only
         * one container is loaded, this root node is hidden from the viewer,
         * but still exists, with one child.
         */

		const node = new Node('root');
		node.children = new Map<string, Node>;
		node.children.set(branch.id, branch);

		this.stateManager.reset();

		this.mergeNode(this.tree, node);
	}

	/**
     * If a node for a given guid exists under the parent, then the nodes
     * should be merged, otherwise, the branch is appended wholesale.
     * In both cases though the branch must be traversed in full to update
     * the metadata objects, as nodes only store states which have been
     * explicitly applied *to them*.
     */

	private mergeNode(dst: Node, src: Node) {

		// By virtue of being here, an equivalent node for src already exists,
		// therefore we don't need to update the lookup table.

		// Collect the state overrides, if any, from the node to update the
		// current State object. src is not allowed to have any overrides
		// at this stage.

		this.stateManager.push(dst);

		// This will not be a leaf node, because for the moment we don't support
		// multiple MBOs on one node, so there is nothing to do with these states
		// but pass them on.

		// ...

		// Merge the children.

		for (const [id, a] of src.children) {
			const existing = this.findChild(dst, id);
			if (existing) {
				this.mergeNode(existing, a);
			} else {
				this.addChild(dst, a);
			}
		}

		this.stateManager.pop();
	}

	private findChild(node: Node, id: string) {
		if (node.children) {
			return node.children.get(id);
		}
		return null;
	}

	private addChild(parent: Node, branch: Node) {
		if (!parent.children) {
			parent.children = new Map<string, Node>();
		}
		parent.children.set(branch.id, branch);
		this.initialiseNewBranch(branch);
	}

	/**
     * Called when an entire branch has been added to the tree. This will use
     * combine the current state with the persistent store to initialise the
     * metadata of the nodes.
     */
	private initialiseNewBranch(branch: Node) {

		// All new nodes should be added to the lookup table

		this.uuidToNode.set(branch.id, branch);
		this.suidToNode.set(branch.sharedId, branch);

		// Only newly paged nodes can have overrides in the persistent store; if
		// a node exists in the sparse tree, its overrides will be stored with it
		// there.

		// Check the store for overrides for this node and apply them, before
		// computing the global state for this level

		this.store.pop(branch);

		this.stateManager.push(branch);

		// Apply states to metdata objects (if any)

		if (branch.metadata) {
			branch.metadata.updateState(this.stateManager.state);
		}

		// And continue to traverse each child...

		if (branch.children) {
			for (const [, child] of branch.children) {
				this.initialiseNewBranch(child);
			}
		}

		this.stateManager.pop();
	}

	/**
	 * Traverse the tree starting at node and recompute the metadata for all
	 * descendents.
	 */
	private updateBranch(branch: Node) {

		// This implementation is very similar to the new branch initialisation,
		// but can skip a couple of steps we know will have already run.

		this.stateManager.push(branch);

		// Apply states to metdata objects (if any)

		if (branch.metadata) {
			branch.metadata.updateState(this.stateManager.state);
		}

		// And continue to traverse each child...

		if (branch.children) {
			for (const [, child] of branch.children) {
				this.updateBranch(child);
			}
		}

		this.stateManager.pop();
	}

	/**
	 * Traverse the tree to integrate any changes made into the metadata.
	 */
	update() {
		this.stateManager.reset();

		if (this.updated) {

			const start = performance.now();

			this.updateBranch(this.tree);
			this.updated = false;

			const time = performance.now() - start;
			console.log('Metadata tree update took ' + time + 'ms');
		}
		this.mapsManager.update();
	}

	/**
     * Removes a node from the tree by id - this should only be called for leaf
     * nodes. Branch nodes that have no children will be deleted automatically.
     * Any nodes that have state overrides at time of deletion have those
     * overrides put into the persistent store.
     */
	private removeNode(id: string) {

	}

	unhighlightAll() {

		const start = performance.now();

		// As an experiment, implement this function by using tree traversal.
		// It may be that it is so fast that it is not worth storing a lookup
		const unhighlightRecursive = (node: Node): void => {
			delete node.highlight;
			if (node.children) {
				for (const c of node.children.values()) {
					unhighlightRecursive(c);
				}
			}
		};
		unhighlightRecursive(this.tree);
		this.updated = true;

		const time = performance.now() - start;

		console.log('MetadataManager: unhighlightAll took ' + time + 'ms');
	}

	/**
	 * Highlights the node by uuid, given the specified colour. If the node
	 * is already highlighted the colour will be overridden. If toggle is true
	 * and the node already has a highlight, the highlight will be removed.
	 */
	highlightNode(uuid: string, toggle: boolean, colour: IRGB) {
		const node = this.uuidToNode.get(uuid);
		if (node) {
			// The node belongs to the loaded branch, so we can add it immediately
			if (toggle && node.highlight) {
				delete node.highlight;
			} else {
				node.highlight = colour;
			}
		} else {
			// The node is not yet loaded, so we put the highlight into the persistent
			// store.
			this.store.add(uuid, {
				highlight: colour,
			});
		}
		this.updated = true;
	}

	unhighlightNode(sharedId: string) {
		const node = this.suidToNode.get(sharedId);
		if (node.highlight) {
			delete node.highlight;
		}
		this.updated = true;
	}

	async loadAssetMaps(modelInfo: string) {
		const info = JSON.parse(modelInfo) as ModelInfo;

		// The tree must be loaded first because the legacy supermeshes loader
		// expects to find existing Nodes for all the meshes. We don't want to
		// create such nodes on-demand, because references to them will be
		// established so we don't want to be replacing them.
		await this.loadFullTreeJson(info);

		this.loadSupermeshesJson(info);

		console.log('MetadataManager: loadAssetMaps completed for ' + info.teamspace + '/' + info.container + '/' + info.revision);
	}

 	// modelInfo can be a container or federation for this method. In the
	// future this should be replaced by streamed branches per bundle.



	async loadSupermeshesJson(info: ModelInfo) {
		if (!info.revision) {
			info.revision = 'master/head';
		}

		const url = 'api/' + info.teamspace + '/' + info.container + '/revision/' + info.revision + '/supermeshes.json.mpc';

		const cookies = document?.cookie;
		const headers = {};
		if (cookies) {
			const tokenMatch = cookies.match(/(^| )csrf_token=([^;]+)/);
			if (tokenMatch) {
				headers['X-CSRF-TOKEN'] = tokenMatch[2];
			}
		}

		const response = await fetch(url, { headers });
		const json = await response.json();


		if (json.supermeshes) {
			for (const supermesh of json.supermeshes) {
				this.loadSupermesh(supermesh, info);
			}
		}

		if (json.submodels) {
			for (const submodel of json.submodels) {
				info.container = submodel.model;
				info.revision = '';
				for (const supermesh of submodel.supermeshes) {
					this.loadSupermesh(supermesh, info);
				}
			}
		}
	}

	loadSupermesh(supermesh, info: ModelInfo) {
		// The buffer holds all the flags for this supermesh/bundle, and is
		// shared by all the Nodes in the bundle's branch.

		const metadataBuffer = this.mapsManager.createBuffer(supermesh.id, supermesh.data.mapping.length);

		for (var i = 0; i < supermesh.data.mapping.length; i++) {
			const element = supermesh.data.mapping[i];

			const node = this.uuidToNode.get(element.name);
			if (!node) {
				throw new Error('Cannot find node for metadata entry. This legacy importer requires the tree to be created before the metadata is loaded');
			}

			node.metadata = new Metadata(metadataBuffer, i);

			const material = supermesh.data.materials[element.material];

			for (const usage of element.usage) {
				const meshIdx = Number(usage.split('_')[1]);

				// This must be called before any of the metadata properties
				// are initialised for the first time, or the flags will not
				// be correctly set.
				node.metadata.addFlagsGroup(meshIdx);
			}

			node.metadata.setColour(material.albedoColor);
			node.metadata.setTransparency(material.albedoColor.a);
			node.metadata.setSpecular(material.specularColor);
			node.metadata.setShininess(material.shininess);
			node.metadata.setGUID(this.guidManager.addNode(node));
		}

		// Tell the viewer about this supermesh. (Ideally, the viewer would get these
		// flags via another mechanism more closely related to the repobundle
		// itself, but its not the end of the world to do it here.)

		// This will result in the viewer creating a texture map for the metadata,
		// which at some point in the future will be registered to the mapsManager.

		this.viewer.SendMessage('ViewerControl', 'AddSupermeshMapInfo', JSON.stringify({
			containerId: info.container,
			revision: info.revision,
			supermeshId: supermesh.id,
			numElements: supermesh.data.mapping.length,
			albedoMap: supermesh.data.albedoMap,
			texelsPerElement: MetadataBuffer.TEXELS_PER_ELEMENT,
		}));
	}

	async fetchJson(uri: string): Promise<any> {
		const url = 'api/' + uri;

		const cookies = document?.cookie;
		const headers = {};
		if (cookies) {
			const tokenMatch = cookies.match(/(^| )csrf_token=([^;]+)/);
			if (tokenMatch) {
				headers['X-CSRF-TOKEN'] = tokenMatch[2];
			}
		}

		const response = await fetch(url, { headers });
		const json = await response.json();
		return json;
	}

	/*
	* Imports a tree using the existing fulltree.json API, turning into a node graph
	* and connecting with the Nodes established from loadAssetMaps.
	*/
	async loadFullTreeJson(info: ModelInfo) {
		if (!info.revision) {
			info.revision = 'master/head';
		}

		const json = await this.fetchJson(info.teamspace + '/' + info.container + '/revision/' + info.revision + '/fulltree.json');

		// Resolve children - we only do this for the top level tree as federations
		// are only one deep, though in theory we could do it for all subtrees too.

		const subTrees = new Map<string, string>();
		for (const node of json.subTrees) {
			subTrees.set(node._id, node.url);
		}

		for (var i = 0; i < json.mainTree.nodes.children.length; i++) {
			const node = json.mainTree.nodes.children[i];
			if (node.type === 'ref') {
				// This is a reference to a sub-tree, so we need to resolve it
				const url = subTrees.get(node._id);
				const response = await this.fetchJson(url);
				if (response && response.mainTree && response.mainTree.nodes) {
					const branch = response.mainTree.nodes;
					json.mainTree.nodes.children[i] = branch;
				}
			}
		}

		// Create the nodes top-down
		const branch = this.createNodeFromLegacyTree(json.mainTree.nodes);

		branch.revision = info.revision;
		branch.container = info.container;
		branch.teamspace = info.teamspace;

		this.mergeBranch(branch);
	}

	createNodeFromLegacyTree(legacyNode: any): Node {
		const node = new Node(legacyNode._id);
		node.sharedId = legacyNode.shared_id;
		node.name = legacyNode.name;

		if (legacyNode.name === 'rootNode') {
			node.container = legacyNode.project;
			node.teamspace = legacyNode.account;
			node.revision = 'master/head';
		}

		if (legacyNode.children) {
			node.children = new Map<string, Node>();
			for (const legacyChild of legacyNode.children) {
				const child = this.createNodeFromLegacyTree(legacyChild);
				child.parent = node;
				node.children.set(child.id, child);
			}
		}

		return node;
	}

	/**
	 * This next set of functions are for use by Unity
	 */

	registerSupermeshMap(uuid: string, texture: WebGLTexture) {
		this.mapsManager.registerTexture(uuid, texture);
	}

	registerSupermeshFlags(uuid: string, ptr: number, size: number) {
		this.mapsManager.registerFlags(uuid, ptr, size);
	}

	getMeshIdFromGuid(guid: number) {
		const node = this.guidManager.getNode(guid);
		if (node) {
			var root = node;
			while (root && !root.container) {
				root = root.parent;
			}
			return `${root.teamspace}.${root.container}.${root.revision}.${node.id}`;
		}
		return '';
	}

	onAnimationFrame() {
		this.update();
		requestAnimationFrame(this.animationFrameCallback);
	}

	describeTree() {
		const summary = {
			numNodes: 0,
			numLeaves: 0,
			depth: 0,
		};
		const gatherNode = (node: Node, depth: number) => {
			summary.numNodes++;
			if (!node.children || node.children.size === 0) {
				summary.numLeaves++;
			}
			summary.depth = Math.max(summary.depth, depth);
			if (node.children) {
				for (const child of node.children.values()) {
					gatherNode(child, depth + 1);
				}
			}
		};
		gatherNode(this.tree, 0);
		console.log('Tree summary:');
		console.log('Number of nodes: ' + summary.numNodes);
		console.log('Number of leaves: ' + summary.numLeaves);
		console.log('Tree depth: ' + summary.depth);
	}

}

export { MetadataManager, Metadata, Node, State, Overrides };
export type { IMetadataBuffer };
