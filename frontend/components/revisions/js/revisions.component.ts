import { selectRevisions } from '../../../modules/model';
import { getState } from '../../../helpers/migration';

class RevisionsController implements ng.IController {
	public static $inject: string[] = [
		'$scope',
		'$filter',
		'$location',
		'$state',

		'DialogService',
		'RevisionsService'
	];

	private revisionsLoading;
	private revisions;
	private revision;
	private revName;
	private model;
	private account;

	constructor(
		private $scope: ng.IScope,
		private $filter: any, // TODO: Figure out how to make Filters work with TSC
		private $location: ng.ILocationService,
		private $state,

		private DialogService,
		private RevisionsService
	) {}

	public $onInit() {
		this.revisionsLoading = true;
		this.watchers();
	}

	public watchers() {
		this.$scope.$watch(() => {
			return this.RevisionsService.status.ready;
		}, () => {

			const revisionDate = this.$filter('prettyDate');

			if (this.RevisionsService.status.ready === true) {

				this.revisions = this.RevisionsService.status.data[this.account + ':' + this.model];
				this.revisionsLoading = false;

				if (!this.revisions || !this.revisions[0]) {
					return;
				}

				if (!this.revision) {
					const filteredDate = revisionDate(this.revisions[0].timestamp, true);
					this.revName = this.revisions[0].tag || filteredDate;
					this.revisions[0].current = true;

				} else {

					this.revisions.forEach((rev, i) => {

						if (rev.tag === this.revision) {
							this.revName = this.revision;
							this.revisions[i].current = true;
						} else if (rev._id === this.revision) {
							this.revName = revisionDate(rev.timestamp, true);
							this.revisions[i].current = true;
						}

					});

				}

				this.RevisionsService.status.ready = false;

			}

		}, true);
	}

	public openDialog(event) {
		this.revisionsLoading = true;
		this.revisions = selectRevisions(getState());
		this.DialogService.showDialog('revisions-dialog.html', this.$scope, event, true);
	}

	public revisionTimestamp(timestamp: string) {
		return this.RevisionsService.revisionDateFilter(timestamp, true);
	}

	public goToRevision(revId) {
		this.revision = revId;
		this.DialogService.closeDialog();
		this.$state.go('app.viewer', {
			modelId: this.model,
			revision: revId
		});
	}

	public closeDialog() {
		this.DialogService.closeDialog();
	}

}

export const RevisionsComponent: ng.IComponentOptions = {
	bindings: {
		account: '=',
		model: '=',
		modelName: '=',
		revision: '='
	},
	controller: RevisionsController,
	controllerAs: 'vm',
	templateUrl: 'templates/revisions.html'
};

export const RevisionsComponentModule = angular
	.module('3drepo')
	.component('revisions', RevisionsComponent);
