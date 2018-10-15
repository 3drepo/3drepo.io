import { ClientConfigService } from '../../../services/clientConfig';

export const ClientConfigServiceModule = angular
	.module("3drepo")
	.service("ClientConfigService", ClientConfigService);
