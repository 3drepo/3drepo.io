/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import Ajv, { ValidateFunction } from 'ajv';

type JsonRpcId = string | number | null;
type JsonSchema = Record<string, unknown>;

type CommandMetadata = {
	parameterOrder: string[];
	inputSchema: JsonSchema;
	outputSchema: JsonSchema;
};

type CommandMetadataMap = Record<string, CommandMetadata>;

type JsonRpcResponse = {
	jsonrpc: '2.0';
	id: JsonRpcId;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: string;
	};
};

type CompiledCommand = {
	parameterOrder: string[];
	validateInput: ValidateFunction;
	validateOutput: ValidateFunction;
};

type RpcConnection = {
	socket: WebSocket;
	close: () => void;
};

type UnityUtilRpcApi = {
	connect: (url: string | URL) => RpcConnection;
};

declare global {
	interface Window {
		UnityUtilRPC: UnityUtilRpcApi;
	}
}

class RpcError extends Error {
	public code: number;

	public data?: string;

	constructor(code: number, message: string, data?: string) {
		super(message);
		this.code = code;
		this.data = data;
	}
}

const scriptUrl = (document.currentScript as HTMLScriptElement | null)?.src || document.baseURI;
const metadataUrl = new URL('./unity-util-api.js', scriptUrl).href;
const ajv = new Ajv({ allErrors: true });
const outputAjv = new Ajv({ allErrors: true, removeAdditional: true });

const isRecord = (value: unknown): value is Record<string, unknown> => (
	!!value && typeof value === 'object' && !Array.isArray(value)
);

const loadCommandMetadata = async (): Promise<CommandMetadataMap> => {
	const apiModule = await import(/* webpackIgnore: true */ metadataUrl) as { commands: unknown };
	const commands = apiModule.commands;
	if (!isRecord(commands)) {
		throw new Error('UnityUtil API metadata does not contain a command object');
	}

	const metadata: CommandMetadataMap = {};
	Object.entries(commands).forEach(([name, value]) => {
		if (!isRecord(value)
			|| !Array.isArray(value.parameterOrder)
			|| !value.parameterOrder.every((parameter) => typeof parameter === 'string')
			|| !isRecord(value.inputSchema)
			|| !isRecord(value.outputSchema)) {
			throw new Error(`UnityUtil API metadata for "${name}" is invalid`);
		}

		metadata[name] = {
			parameterOrder: value.parameterOrder,
			inputSchema: value.inputSchema,
			outputSchema: value.outputSchema,
		};
	});

	return metadata;
};

const toParamsObject = (
	params: unknown,
	parameterOrder: string[],
): Record<string, unknown> => {
	if (params === undefined) {
		return {};
	}

	if (isRecord(params)) {
		return params;
	}

	if (Array.isArray(params)) {
		if (params.length > parameterOrder.length) {
			throw new RpcError(-32602, 'Invalid params', 'Too many positional parameters');
		}

		return Object.fromEntries(params.map((value, index) => [parameterOrder[index], value]));
	}

	throw new RpcError(-32602, 'Invalid params', 'Params must be an object or array');
};

const getValidationError = (validator: ValidateFunction): string => (
	validator.errors?.map(({ dataPath, message }) => `${dataPath || '/'} ${message || 'is invalid'}`).join('; ')
		|| 'Schema validation failed'
);

const isValidId = (id: unknown): id is JsonRpcId => (
	id === null || typeof id === 'string' || typeof id === 'number'
);

const makeErrorResponse = (
	id: JsonRpcId,
	code: number,
	message: string,
	data?: string,
): JsonRpcResponse => ({
	jsonrpc: '2.0',
	id,
	error: {
		code,
		message,
		...(data ? { data } : {}),
	},
});

const makeSuccessResponse = (id: JsonRpcId, result: unknown): JsonRpcResponse => ({
	jsonrpc: '2.0',
	id,
	result: result === undefined ? null : result,
});

const dispatchRequest = async (
	request: unknown,
	getCommands: () => Promise<CommandMetadataMap>,
	compiledCommands: Map<string, CompiledCommand>,
): Promise<JsonRpcResponse | null> => {
	if (!isRecord(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
		return makeErrorResponse(null, -32600, 'Invalid Request');
	}

	const hasId = Object.prototype.hasOwnProperty.call(request, 'id');
	const id = hasId && isValidId(request.id) ? request.id : null;
	if (hasId && !isValidId(request.id)) {
		return makeErrorResponse(null, -32600, 'Invalid Request');
	}

	try {
		const commands = await getCommands();
		if (!Object.prototype.hasOwnProperty.call(commands, request.method)) {
			throw new RpcError(-32601, 'Method not found');
		}

		let command = compiledCommands.get(request.method);
		if (!command) {
			const metadata = commands[request.method];
			command = {
				parameterOrder: metadata.parameterOrder,
				validateInput: ajv.compile(metadata.inputSchema),
				validateOutput: outputAjv.compile(metadata.outputSchema),
			};
			compiledCommands.set(request.method, command);
		}

		const params = toParamsObject(request.params, command.parameterOrder);
		if (!command.validateInput(params)) {
			throw new RpcError(-32602, 'Invalid params', getValidationError(command.validateInput));
		}

		const unityUtil = window.UnityUtil as typeof import('./unity-util').UnityUtil | undefined;
		if (!unityUtil) {
			throw new Error('UnityUtil is not available on window');
		}

		const method: unknown = Reflect.get(unityUtil, request.method);
		if (typeof method !== 'function') {
			throw new Error(`UnityUtil method "${request.method}" is not available`);
		}

		const args = command.parameterOrder.map((parameter) => params[parameter]);
		const result: unknown = await Reflect.apply(method, unityUtil, args);
		const responseResult = result === undefined ? null : result;
		if (!command.validateOutput(responseResult)) {
			throw new Error(`UnityUtil method "${request.method}" returned an invalid result: ${
				getValidationError(command.validateOutput)
			}`);
		}

		return hasId ? makeSuccessResponse(id, responseResult) : null;
	} catch (error) {
		if (!hasId) {
			return null;
		}

		if (error instanceof RpcError) {
			return makeErrorResponse(id, error.code, error.message, error.data);
		}

		return makeErrorResponse(
			id,
			-32603,
			'Internal error',
			error instanceof Error ? error.message : String(error),
		);
	}
};

const dispatchMessage = async (
	data: unknown,
	getCommands: () => Promise<CommandMetadataMap>,
	compiledCommands: Map<string, CompiledCommand>,
): Promise<JsonRpcResponse | JsonRpcResponse[] | null> => {
	if (typeof data !== 'string') {
		return makeErrorResponse(null, -32700, 'Parse error', 'WebSocket message must be a JSON string');
	}

	let request: unknown;
	try {
		request = JSON.parse(data);
	} catch {
		return makeErrorResponse(null, -32700, 'Parse error');
	}

	if (!Array.isArray(request)) {
		return dispatchRequest(request, getCommands, compiledCommands);
	}

	if (!request.length) {
		return makeErrorResponse(null, -32600, 'Invalid Request');
	}

	const responses = await Promise.all(
		request.map((item) => dispatchRequest(item, getCommands, compiledCommands)),
	);
	const filteredResponses = responses.filter(
		(response): response is JsonRpcResponse => response !== null,
	);

	return filteredResponses.length ? filteredResponses : null;
};

const connect = (url: string | URL): RpcConnection => {
	const socket = new WebSocket(url);
	const compiledCommands = new Map<string, CompiledCommand>();
	let metadataPromise: Promise<CommandMetadataMap> | undefined;

	const getCommands = (): Promise<CommandMetadataMap> => {
		metadataPromise ||= loadCommandMetadata();
		return metadataPromise;
	};

	const onMessage = (event: MessageEvent): void => {
		void dispatchMessage(event.data, getCommands, compiledCommands)
			.then((response) => {
				if (response && socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify(response));
				}
			})
			.catch((error: unknown) => {
				if (socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify(makeErrorResponse(
						null,
						-32603,
						'Internal error',
						error instanceof Error ? error.message : String(error),
					)));
				}
			});
	};

	socket.addEventListener('message', onMessage);

	return {
		socket,
		close: () => {
			socket.removeEventListener('message', onMessage);
			if (socket.readyState < WebSocket.CLOSING) {
				socket.close();
			}
		},
	};
};

window.UnityUtilRPC = { connect };
