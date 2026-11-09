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

// This schema mirrors the shape of config/development/config.js (the most
// up to date, env-var driven config template) and encodes the defaults that
// used to be applied via coalesce() in the old v4 config loader.
const Yup = require('yup');
const { types } = require('./helper/yup');

const threeHoursMs = (1000 * 60 * 60) * 3;

// Some config templates feed values through parseInt(process.env.X) without a
// fallback, which yields NaN when the env var is unset. Treat NaN as "not set"
// so the yup default kicks in instead of failing type validation.
const numberWithDefault = (defaultValue) => Yup.number()
	.transform((value) => (Number.isNaN(value) ? undefined : value))
	.default(defaultValue);

const serverSchema = Yup.object({
	service: Yup.string().required(),
	subdomain: Yup.string(),
	subdirectory: Yup.string(),
	hostname: Yup.string(),
	port: Yup.number(),
	http_port: Yup.number(),
	https_port: Yup.number(),
	public_port: Yup.number(),
	public_protocol: Yup.string(),
	chatOnPublicPort: Yup.boolean().default(false),
	external: Yup.boolean().default(false),
	type: Yup.string(),
});

const ConfigSchema = Yup.object({
	maintenanceMode: Yup.boolean().default(false),
	host: Yup.string().default('127.0.0.1'),
	HTTPSredirect: Yup.boolean().default(false),
	http_port: numberWithDefault(80),
	https_port: numberWithDefault(443),
	timeout: Yup.number().default(30 * 60), // seconds
	chat_reconnection_attempts: Yup.number().default(5),
	uploadSizeLimit: numberWithDefault(209715200),
	resourceUploadSizeLimit: Yup.number().default(104857600),
	drawingSizeLimit: Yup.number().default(524288000),
	imageSizeLimit: Yup.number().default(1048576),

	servers: Yup.array().of(serverSchema).min(1).required(),

	cookie: Yup.object({
		secret: Yup.string().required(),
		parser_secret: Yup.string().required(),
		maxAge: Yup.number().integer().positive().default(threeHoursMs),
		domain: Yup.string(),
	}).default({}),

	db: Yup.object({
		host: Yup.mixed().required(),
		port: Yup.mixed().default(27017),
		username: Yup.string(),
		password: Yup.string(),
		replicaSet: Yup.string(),
		authSource: Yup.string().default(''),
	}).default({}),

	logfile: Yup.object({
		filename: Yup.string(),
		logDirectory: Yup.string(),
		console_level: Yup.string().default('info'),
		file_level: Yup.string().default('info'),
		jsonOutput: Yup.boolean().default(false),
		noColors: Yup.boolean().default(false),
		silent: Yup.boolean().default(false),
	}).default({}),

	cn_queue: Yup.object({
		host: Yup.string(),
		model_queue: Yup.string(),
		clash_queue: Yup.string(),
		drawing_queue: Yup.string(),
		callback_queue: Yup.string(),
		upload_dir: Yup.string(),
		shared_storage: Yup.string(),
		event_exchange: Yup.string(),
		maxRetries: Yup.number().default(3),
	}).default({}),

	contact: Yup.object({
		support: Yup.string().default('support@3drepo.com'),
		email: Yup.string(),
	}).default({}),

	cachePolicy: Yup.object({
		maxAge: Yup.number().default(60 * 60 * 24 * 30),
	}).default({}),

	subscriptions: Yup.object({
		basic: Yup.mixed().default({ collaborator: 0, data: 0 }),
	}).default({}),

	// config.fs is always required - it backs the default (FS) file storage
	// (see src/v5/handler/fs.js FSHandlerInterface.getHandler).
	fs: Yup.object({
		path: Yup.string().required(),
		levels: Yup.number().integer().min(0),
	}).required(),

	// config.externalFS is only required when the EXTERNAL_FS storage type is
	// used (see src/v5/handler/fs.js). Yup objects implicitly default to {}
	// when absent, so default(undefined) is needed to keep it truly optional.
	externalFS: Yup.object({
		path: Yup.string().required(),
	}).default(undefined),

	// config.mail is read eagerly on startup by src/v5/services/mailer/index.js,
	// which exits the process if config.mail.sender/smtpConfig are missing
	// (unless generateCredentials is set, in which case smtpConfig is generated).
	mail: Yup.object({
		sender: Yup.string().required(),
		generateCredentials: Yup.boolean().default(false),
		smtpConfig: Yup.object({
			host: Yup.string().required(),
			port: Yup.number().required(),
			secure: Yup.boolean().default(false),
			auth: Yup.object({
				user: Yup.string(),
				pass: Yup.string(),
			}),
		}).when('generateCredentials', {
			is: true,
			then: (schema) => schema.notRequired(),
			otherwise: (schema) => schema.required(),
		}),
	}).required(),

	// config.sso.frontegg is validated the same way in
	// src/v5/services/sso/frontegg/components/connections.js - kept in sync
	// here. Optional overall since the legacy v4 test config (config/test)
	// predates frontegg and doesn't define it.
	sso: Yup.object({
		frontegg: Yup.object({
			appUrl: Yup.string().required(), // https://{appId}.frontegg.com
			appId: Yup.string().required(), // appId from the application created
			clientId: Yup.string().required(), // clientId is the vendor clientId
			key: Yup.string().required(), // vendor API key
			userRole: Yup.string().required(), // Default role assigned to an application user
			vendorDomain: Yup.string().required(), // the API server to connect to for vendor API
		}).default(undefined),
	}).default(undefined),

	intercom: Yup.object({
		license: Yup.string(), // used to identify the app in the intercom client (see src/v4/routes/config.js)
		secretKey: Yup.string(), // used to hash the user identity (see src/v5/services/intercom.js)
		accessToken: Yup.string(), // used for the intercom API requests (see src/v4/models/intercom.js)
	}).default({}),

	apryse: Yup.object({
		licenseKey: Yup.string(), // License key for the Apryse WebViewer SDK (see src/v4/routes/config.js)
	}).default({}),

	// see src/v5/services/maps/osm.js - config.osm is destructured directly, so it must be an object
	osm: Yup.object({
		domain: Yup.string(),
		prefix: Yup.string(),
		key: Yup.string(),
	}).default({}),

	// see src/v5/services/maps/here.js - config.here.apiKey is read directly, so it must be an object
	here: Yup.object({
		apiKey: Yup.string(),
	}).default({}),

	// Node's own HTTPS termination (see setupSSL() in src/v4/3drepo.js). This
	// is unrelated to authentication (frontegg handles that separately) - it
	// configures the TLS certs for the web server itself, so it stays
	// optional: deployments that terminate TLS upstream (e.g. behind a proxy)
	// omit it.
	ssl: Yup.lazy((value) => {
		if (!value) return Yup.mixed().notRequired();
		const certGroupSchema = Yup.object({
			key: Yup.string().required(),
			cert: Yup.string().required(),
			ca: Yup.string(),
		});
		const shape = {};
		Object.keys(value).forEach((certGroup) => {
			shape[certGroup] = certGroupSchema;
		});
		return Yup.object(shape).test(
			'has-default-cert-group',
			'ssl.default certificate group is required when ssl is configured',
			(v) => !v || Object.prototype.hasOwnProperty.call(v, 'default'),
		);
	}),
});

const getEnv = (envName) => process.env[envName];
const createStringSchemaWithEnvDefault = (
	envName, required = true) => Yup.string().default(getEnv(envName)).required(required);

ConfigSchema.apmSchema = Yup.object({
	serviceName: createStringSchemaWithEnvDefault('APP_WEB_APM_SERVICENAME'),
	secretToken: createStringSchemaWithEnvDefault('APP_WEB_APM_SECRET_TOKEN'),
	serverUrl: createStringSchemaWithEnvDefault('APP_WEB_APM_SERVER_URL'),
	logLevel: createStringSchemaWithEnvDefault('APP_WEB_APM_LOG_LEVEL', false),
});

ConfigSchema.sslSchema = Yup.object({
	key: types.strings.filePath.default(getEnv('APP_WEB_SSL_KEY')).required(),
	cert: types.strings.filePath.default(getEnv('APP_WEB_SSL_CERT')).required(),
	ca: types.strings.filePath.default(getEnv('APP_WEB_SSL_CA')),
});

ConfigSchema.serverSchema = Yup.object({
	host: createStringSchemaWithEnvDefault('APP_WEB_DNS'),
	bindAddress: Yup.string().default('0.0.0.0'),
	port: Yup.number().required(),
	httpPort: Yup.number().default(80), // only used for http redirect to https, if https is enabled
	isHTTPS: Yup.boolean().default(false),
	sslConfig: ConfigSchema.sslSchema.default(undefined),
	timeout: Yup.number().default(1800000), // milliseconds
	httpsRedirect: Yup.boolean().default(getEnv('APP_WEB_HTTPS_REDIRECT') === 'true'),
});

ConfigSchema.chatSchema = Yup.object({
	port: Yup.number().default(3000),
	chatOnPublicPort: Yup.boolean().default(false),
	subDomain: Yup.string().default('chat'),
	path: Yup.string().default('/chat'),
	reconnectionAttempts: Yup.number().default(5),
});

ConfigSchema.logSchema = Yup.object({
	consoleLevel: createStringSchemaWithEnvDefault('APP_WEB_LOGFILE_CONSOLE_LEVEL'),
	jsonOutput: Yup.boolean().default(getEnv('APP_WEB_LOGFILE_JSONOUTPUT') === 'true'),
	noColors: Yup.boolean().default(getEnv('APP_WEB_LOGFILE_NOCOLORS') === 'true'),
});

ConfigSchema.dataLimitsSchema = Yup.object({
	modelUploadSize: Yup.number().default(Number(getEnv('APP_WEB_UPLOADSIZELIMIT')) ?? 1073741824),
	resourceUploadSize: Yup.number().default(Number(getEnv('APP_WEB_RESOURCEUPLOADSIZELIMIT')) ?? 104857600),
	imageSizeLimit: Yup.number().default(Number(getEnv('APP_WEB_IMAGESIZELIMIT')) ?? 1048576),
});

module.exports = ConfigSchema;
