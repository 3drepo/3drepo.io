/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("bidDocs", bidDocs);

	function bidDocs () {
		return {
			restrict: 'E',
			templateUrl: 'bidDocs.html',
			scope: {
				packageName: "=",
				inviteAccepted: "="
			},
			controller: BidDocsCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidDocsCtrl.$inject = ["$scope", "$mdDialog", "$sce", "BidService"];

	function BidDocsCtrl ($scope, $mdDialog, $sce, BidService) {
		var vm = this,
			promise;

		vm.predefinedDocs = [
			{title: "Bill of Quantities", id: ""},
			{title: "Scope of Works", id: ""}
		];

		vm.boq = [
			{type: "Single-Flush: 800 x 2100", code: 3, quantity: 7},
			{type: "Pocket_Slider_Door_5851: 2.027 x 0.945", code: 51, quantity: 3},
			{type: "Entrance door: Entrance door", code: 60, quantity: 2},
			{type: "M_Double-Flush: 1730 x 2134mm", code: 65, quantity: 1},
			{type: "Curtain Wall Dbl Glass: Curtain Wall Dbl Glass", code: 68, quantity: 3}
		];

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.bidInviteAccepted = response.data.accepted;
					}
					if (vm.bidInviteAccepted) {
						showDocs();
					}
				});
			}
		});

		$scope.$watch("vm.inviteAccepted", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.bidInviteAccepted = true;
				showDocs();
			}
		});

		function showDocs () {
			var i, j, length, jLength, exists;
			vm.docs = [];
			if (BidService.currentPackage.hasOwnProperty("attachments")) {
				for (i = 0, length = BidService.currentPackage.attachments.length; i < length; i += 1) {
					// Ignore duplicates
					exists = false;
					for (j = 0, jLength = vm.docs.length; j < jLength; j += 1) {
						if (vm.docs[j].id === BidService.currentPackage.attachments[i]) {
							exists = true;
							break;
						}
					}
					if (!exists) {
						vm.docs.push({
							title: "Drawing " + BidService.currentPackage.attachments[i],
							id: BidService.currentPackage.attachments[i]
						});
					}
				}
			}
		}

		vm.sow =
			"<p><span class='bidDocsUnderline'>Scope of the Sub‐Contract Works</span></p>" +
			"<p>The following defines the ‘Fixed Price Lump Sum’ Scope of the Sub‐Contract Works for the completion of the Partitions,  Ceilings  and  Passive  Fire  Protection  Works  and  is  further  defined  in  the  Documents,  Drawings, Specifications, Protocols and Policies incorporated or referred to within this Tender Enquiry.</p>" +
			"<p>The Health and Safety of all Visitors, Staff, Site Personnel and the General Public is paramount at all times and compliance  with  the  Balfour  Beatty  Construction  Health,  Safety,  Quality  and  Environmental  Conditions  is mandatory. A copy of this document is contained in Numbered Document 7.</p>" +
			"<p>The Sub‐Contractor <span class='bidDocsBold'>shall not</span> sub‐let any part of the sub‐contract works without the prior knowledge and writtenacceptance of BB.</p>" +
			"<p>The Sub‐Contractor shall manufacture, supply, deliver, install, execute, test and commission and complete the Partitions, Ceilings and Passive Fire Protection Works including all necessary labour, plant,  tools, equipment, materials, supervision, off‐loading, distribution around site, removal of waste and protection of the works at the project  known  as  the  Baltic Triangle,  Liverpool,  all    as  described  herein  within  this  Scope  of Works  and  the Documents,  Drawings,  Specifications,  Protocols  and  Polices  incorporated  or  referred  to  within  this  Tender Enquiry.</p>" +
			"<p>The tender Sum is to be fixed until October 2016.</p>" +
			"<p>The Sub‐Contractor has made allowances for all works necessary to carry out and complete the Sub‐Contract Works all as denoted on the Drawings, Specifications and Documents incorporated within this Tender Enquiry. All items which are normally deemed extra over in accordance with the SMM7 or/and NRM2 measurement rules shall also be deemed included within the Sub‐Contract Sum.</p>" +
			"<p>The Sub‐Contractor is deemed to have acquainted themselves with the constraints of the Site and acknowledges and accepts that it is required to co‐ordinate and integrate the Works with the designs, works and programmes of the following associated works: ‐ Precast Concrete Works, Car Park Works, Roofing, Structural Steel, incoming services, M&E installations, Kitchen and Wardrobes installation, and Finishes Generally.</p>" +
			"<p>Notwithstanding  the  need  for  the  Sub‐Contract Works  to  be  properly  co‐ordinated  and  integrated  with  the design, works and programmes of others, the Sub‐Contractor acknowledges and accepts that it will not have exclusive access to and / or possession of the site or any part or parts thereof and that it will be required to work alongside  the  Employer,  Contractor,  the  Competent  Authority  and  other  trades,  Sub‐Contractors  and  /  or suppliers.</p>";

		vm.sowProcessed = vm.sow.split("</p>");

		vm.showPredefinedDocDialog = function (index) {
			vm.docIndex = index;
			vm.showPredefinedDoc = true;
			vm.showDoc = false;
			showDialog();
		};

		vm.showDocDialog = function (index) {
			vm.docIndex = index;
			vm.showPredefinedDoc = false;
			vm.showDoc = true;
			promise = BidService.getFile(BidService.currentPackage.name, vm.docs[index].id);
			promise.then(function (response) {
				var blob = new Blob([response.data], { type: 'application/pdf' });
				vm.pdfUrl = URL.createObjectURL(blob);
				showDialog();
			});
		};

		function showDialog (event) {
			$mdDialog.show({
				controller: bidDocsDialogController,
				templateUrl: 'bidDocsDialog.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		}

		vm.trustSrc = function(src) {
			return $sce.trustAsResourceUrl(src);
		};

		vm.closeDialog = function () {
			$mdDialog.cancel();

			// Free the resources associated with the created url
			if (vm.showDoc) {
				var worker = new Worker(vm.pdfUrl);
				URL.revokeObjectURL(vm.pdfUrl);
			}
		};

		function removeDialog () {
			vm.closeDialog();
		}

		function bidDocsDialogController ($scope) {
		}
	}
}());
