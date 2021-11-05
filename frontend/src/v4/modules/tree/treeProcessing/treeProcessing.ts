/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { Processing } from './processing';
import transformTree from './transforming';
import { ITreeProcessingData } from './treeProcessing.constants';

class TreeProcessing {
	private processing = {
		clearCurrentlySelected: Function.prototype
	} as Processing;

	get data() {
		return (this.processing || {}) as ITreeProcessingData;
	}

	public transformData = async (payload, setIsProcessed) => {
		const { nodesList, treePath, ...auxiliaryMaps } = await transformTree(payload) as any;
		this.processing = new Processing({
			nodesList,
			treePath,
			nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
			defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
			meshesByNodeId: auxiliaryMaps.meshesByNodeId,
			visibilityMap: auxiliaryMaps.nodesVisibilityMap,
			selectionMap: auxiliaryMaps.nodesSelectionMap,
			nodesBySharedIdsMap: auxiliaryMaps.nodesBySharedIdsMap,
			subModelsRootNodes: auxiliaryMaps.subModelsRootNodes
		});
		setIsProcessed(true);
		return { nodesList, treePath, auxiliaryMaps };
	}

	public selectNodes = (payload) => this.processing.selectNodes(payload);

	public deselectNodes = (payload) => this.processing.deselectNodes(payload);

	public updateVisibility = (payload) => this.processing.updateVisibility(payload);

	public showAllExceptMeshIDs = (ifcSpacesHidden, meshes) => {
		if (this.processing && this.processing.showAllExceptMeshIDs) {
			return this.processing.showAllExceptMeshIDs(ifcSpacesHidden, meshes);
		}
	}

	public isolateNodes = (payload) => this.processing.isolateNodes(payload);

	public getMeshesByNodeIds = (payload) => this.processing.getMeshesByNodeIds(payload);

	public clearSelected = () => this.processing.clearCurrentlySelected();

	public getParents = (node) => this.processing.getParentsByPath(node);

	public getParentsID = (node) => this.processing.getParentsID(node);

}

export default new TreeProcessing();
