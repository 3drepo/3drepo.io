import type { Compiler } from 'webpack';

const fs: typeof import('fs') = require('fs');
const path: typeof import('path') = require('path');
const ts: typeof import('typescript') = require('typescript');
const { createGenerator }: typeof import('ts-json-schema-generator') = require('ts-json-schema-generator');

type RuntimeJsonSchema = {
	$schema?: string;
	$ref?: string;
	description?: string;
	definitions?: Record<string, RuntimeJsonSchema>;
	properties?: Record<string, RuntimeJsonSchema>;
	[key: string]: unknown;
};

type GeneratorOptions = {
	inputFile: string;
	outputFile: string;
	primaryClass: string;
};

type MethodTag = {
	name: string;
	parameterName?: string;
	text: string;
};

type MethodMetadata = {
	description: string;
	category?: string;
	tags: MethodTag[];
};

type CommandEntry = {
	method: import('typescript').MethodDeclaration;
	methodName: string;
	inputTypeName: string;
	outputTypeName: string;
	metadata: MethodMetadata;
};

type GeneratedCommand = {
	description: string;
	parameterOrder: string[];
	inputSchema: RuntimeJsonSchema;
	outputSchema: RuntimeJsonSchema;
	category?: string;
	tags: MethodTag[];
};

const isPublicAndVisible = (
	member: import('typescript').MethodDeclaration | import('typescript').PropertyDeclaration
) => !member.modifiers?.some(({ kind }) => (
	kind === ts.SyntaxKind.PrivateKeyword || kind === ts.SyntaxKind.ProtectedKeyword
)) && !ts.isPrivateIdentifier(member.name)
	&& !ts.getJSDocTags(member).some(({ tagName }) => tagName.text === 'hidden');

const isBrowserNativeType = (type: import('typescript').Type): boolean => {
	const symbols = [type.aliasSymbol, type.getSymbol()]
		.filter((symbol): symbol is import('typescript').Symbol => symbol !== undefined);

	return symbols.some((symbol) => symbol.declarations?.some((declaration) => {
		const fileName = path.basename(declaration.getSourceFile().fileName);
		return fileName.startsWith('lib.dom.')
			|| fileName.startsWith('lib.webworker.')
			|| fileName.startsWith('lib.scripthost.');
	}));
};

const containsBrowserNativeType = (
	type: import('typescript').Type,
	checker: import('typescript').TypeChecker,
	visited: Set<import('typescript').Type> = new Set()
): boolean => {
	if (visited.has(type)) {
		return false;
	}

	visited.add(type);

	if (isBrowserNativeType(type)) {
		return true;
	}

	if (type.isUnionOrIntersection?.()) {
		return type.types.some((memberType) => containsBrowserNativeType(memberType, checker, visited));
	}

	if (!(type.flags & ts.TypeFlags.Object)) {
		return false;
	}

	if (checker.isArrayType(type) || checker.isTupleType(type)) {
		return checker.getTypeArguments(type as import('typescript').TypeReference).some((memberType) => (
			containsBrowserNativeType(memberType, checker, visited)
		));
	}

	if (type.getCallSignatures().length || type.getConstructSignatures().length) {
		return true;
	}

	return checker.getPropertiesOfType(type).some((property) => {
		const declaration = property.valueDeclaration || property.declarations?.[0];
		return declaration
			&& containsBrowserNativeType(
				checker.getTypeOfSymbolAtLocation(property, declaration),
				checker,
				visited
			);
	});
};

const getName = (
	name: import('typescript').Node,
	sourceFile: import('typescript').SourceFile
): string => {
	if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)
		|| ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
		return name.text;
	}

	return name.getText(sourceFile);
};

const getCommentText = (
	comment: string | import('typescript').NodeArray<import('typescript').JSDocComment> | undefined
): string => {
	if (!comment) {
		return '';
	}

	return typeof comment === 'string' ? comment : comment.map(({ text }) => text).join('');
};

const getMethodMetadata = (method: import('typescript').MethodDeclaration): MethodMetadata => {
	const tags = ts.getJSDocTags(method).map((tag) => ({
		name: tag.tagName.text,
		...(ts.isJSDocParameterTag(tag) ? { parameterName: tag.name.getText() } : {}),
		text: getCommentText(tag.comment).trim(),
	}));
	const category = tags.find(({ name }) => name === 'category')?.text || undefined;
	const description = ts.getJSDocCommentsAndTags(method)
		.filter(ts.isJSDoc)
		.map((doc) => getCommentText(doc.comment).trim())
		.filter(Boolean)
		.join('\n\n');

	return { description, category, tags };
};

const collectSchemaReferences = (
	value: unknown,
	definitions: Record<string, RuntimeJsonSchema>,
	collected: Record<string, RuntimeJsonSchema> = {}
): Record<string, RuntimeJsonSchema> => {
	if (!value || typeof value !== 'object') {
		return collected;
	}

	const schema = value as RuntimeJsonSchema;
	if (typeof schema.$ref === 'string') {
		const match = schema.$ref.match(/^#\/definitions\/(.+)$/);
		if (match) {
			const name = decodeURIComponent(match[1]);
			if (definitions[name] && !collected[name]) {
				collected[name] = definitions[name];
				collectSchemaReferences(definitions[name], definitions, collected);
			}
		}
	}

	Object.values(schema).forEach((child) => collectSchemaReferences(child, definitions, collected));
	return collected;
};

const getStandaloneSchema = (
	schema: RuntimeJsonSchema,
	definitionName: string,
	description = ''
): RuntimeJsonSchema => {
	const sourceDefinitions = schema.definitions || {};
	const rootDefinitions = new Set([definitionName]);
	let rootDefinition = sourceDefinitions[definitionName];

	while (rootDefinition?.$ref) {
		const match = rootDefinition.$ref.match(/^#\/definitions\/(.+)$/);
		if (!match) {
			break;
		}

		const referencedName = decodeURIComponent(match[1]);
		if (!sourceDefinitions[referencedName] || rootDefinitions.has(referencedName)) {
			break;
		}

		rootDefinitions.add(referencedName);
		rootDefinition = sourceDefinitions[referencedName];
	}

	if (!rootDefinition) {
		throw new Error(`Generated schema definition "${definitionName}" was not found`);
	}

	const definitions = collectSchemaReferences(rootDefinition, sourceDefinitions);
	rootDefinitions.forEach((name) => delete definitions[name]);

	return {
		$schema: schema.$schema,
		...rootDefinition,
		...(description ? { description } : {}),
		...(Object.keys(definitions).length ? { definitions } : {}),
	};
};

const ensureDirectoryExists = (directory: string): void => {
	if (fs.existsSync(directory)) {
		return;
	}

	const parentDirectory = path.dirname(directory);
	if (parentDirectory !== directory) {
		ensureDirectoryExists(parentDirectory);
	}

	fs.mkdirSync(directory);
};

const generateRuntimeMetadata = ({
	inputFile,
	outputFile,
	primaryClass
}: GeneratorOptions) => {
	if (!inputFile || !outputFile || !primaryClass) {
		throw new TypeError('inputFile, outputFile, and primaryClass must be specified');
	}

	if (path.extname(inputFile) !== '.ts') {
		throw new TypeError(`The metadata input must be a TypeScript file: ${inputFile}`);
	}

	const source = fs.readFileSync(inputFile, 'utf8');
	const sourceFile = ts.createSourceFile(inputFile, source, ts.ScriptTarget.Latest, true);
	const parseDiagnostics = ts.transpileModule(source, { reportDiagnostics: true }).diagnostics || [];

	if (parseDiagnostics.length) {
		const diagnostic = parseDiagnostics[0];
		const { line } = sourceFile.getLineAndCharacterOfPosition(diagnostic.start || 0);
		const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		throw new Error(`${inputFile}:${line + 1}: ${message}`);
	}

	const declaredClass = sourceFile.statements.find((statement) => (
		ts.isClassDeclaration(statement)
		&& statement.name?.text === primaryClass
		&& statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)
	));

	if (!declaredClass) {
		throw new Error(`Exported class "${primaryClass}" was not found in ${inputFile}`);
	}

	const configPath = ts.findConfigFile(path.dirname(inputFile), ts.sys.fileExists);
	const compilerOptions = configPath
		? ts.parseJsonConfigFileContent(
			ts.readConfigFile(configPath, ts.sys.readFile).config,
			ts.sys,
			path.dirname(configPath)
		).options
		: {};
	const program = ts.createProgram([inputFile], compilerOptions);
	const checker = program.getTypeChecker();
	const programSource = program.getSourceFile(inputFile);

	if (!programSource) {
		throw new Error(`Unable to load TypeScript program for ${inputFile}`);
	}

	const programClass = programSource.statements.find((statement): statement is import('typescript').ClassDeclaration => (
		ts.isClassDeclaration(statement)
		&& statement.name?.text === primaryClass
		&& Boolean(statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword))
	));
	if (!programClass) {
		throw new Error(`Unable to load exported class "${primaryClass}" from ${inputFile}`);
	}

	const methods = programClass.members.filter((member): member is import('typescript').MethodDeclaration => (
		ts.isMethodDeclaration(member)
		&& Boolean(member.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.StaticKeyword))
		&& isPublicAndVisible(member)
		&& !member.parameters.some((parameter) => (
			containsBrowserNativeType(checker.getTypeAtLocation(parameter), checker)
		))
	));

	const printer = ts.createPrinter();
	const typeNodeFlags = ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.InTypeAlias;
	const exportedTypes = sourceFile.statements
		.filter((statement) => (ts.isEnumDeclaration(statement)
			|| ts.isTypeAliasDeclaration(statement)
			|| ts.isInterfaceDeclaration(statement))
			&& statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword))
		.map((statement) => {
			if (ts.isEnumDeclaration(statement)
				|| ts.isTypeAliasDeclaration(statement)
				|| ts.isInterfaceDeclaration(statement)) {
				return statement.name.text;
			}

			throw new Error('Unsupported exported type declaration');
		});
	const schemaTypes: string[] = exportedTypes.length
		? [`import type { ${exportedTypes.join(', ')} } from ${JSON.stringify(inputFile.replace(/\\/g, '/'))};`]
		: [];
	const commandEntries: CommandEntry[] = [];

	methods.forEach((method, index) => {
		const inputTypeName = `CommandInput${index}`;
		const outputTypeName = `CommandOutput${index}`;
		const methodName = getName(method.name, programSource);
		const parameterProperties = method.parameters.map((parameter) => {
			const type = checker.getTypeAtLocation(parameter);
			const typeNode = checker.typeToTypeNode(type, method, typeNodeFlags);
			const parameterName = getName(parameter.name, programSource);
			const optional = Boolean(parameter.questionToken || parameter.initializer);

			return `${JSON.stringify(parameterName)}${optional ? '?' : ''}: ${
				typeNode ? printer.printNode(ts.EmitHint.Unspecified, typeNode, programSource) : 'unknown'
			};`;
		});
		const signature = checker.getSignatureFromDeclaration(method);
		if (!signature) {
			throw new Error(`Unable to resolve signature for "${methodName}"`);
		}

		const returnType = checker.getReturnTypeOfSignature(signature);
		const resolvedReturnType = checker.getAwaitedType(returnType) || returnType;
		const returnTypeNode = checker.typeToTypeNode(resolvedReturnType, method, typeNodeFlags);

		schemaTypes.push(
			`export type ${inputTypeName} = { ${parameterProperties.join(' ')} };`,
			`export type ${outputTypeName} = ${
				returnTypeNode
					? printer.printNode(ts.EmitHint.Unspecified, returnTypeNode, programSource)
					: 'unknown'
			};`
		);
		commandEntries.push({
			method,
			methodName,
			inputTypeName,
			outputTypeName,
			metadata: getMethodMetadata(method),
		});
	});

	const schemaSource = `${schemaTypes.join('\n')}\n`;
	let virtualFile = path.resolve(path.dirname(inputFile), `.__runtime-metadata-schema-${process.pid}.ts`);
	let virtualFileIndex = 0;
	while (ts.sys.fileExists(virtualFile)) {
		virtualFileIndex += 1;
		virtualFile = path.resolve(
			path.dirname(inputFile),
			`.__runtime-metadata-schema-${process.pid}-${virtualFileIndex}.ts`
		);
	}

	const host = ts.createCompilerHost(compilerOptions);
	const getSourceFile = host.getSourceFile.bind(host);
	const fileExists = host.fileExists.bind(host);
	const readFile = host.readFile.bind(host);

	host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => (
		path.resolve(fileName) === virtualFile
			? ts.createSourceFile(fileName, schemaSource, languageVersion, true)
			: getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
	);
	host.fileExists = (fileName) => path.resolve(fileName) === virtualFile || fileExists(fileName);
	host.readFile = (fileName) => (
		path.resolve(fileName) === virtualFile ? schemaSource : readFile(fileName)
	);

	const schemaProgram = ts.createProgram([inputFile, virtualFile], compilerOptions, host);
	const generator = createGenerator({
		tsProgram: schemaProgram,
		expose: 'all',
		jsDoc: 'extended',
		skipTypeCheck: true,
		functions: 'comment',
	});
	const generatedSchemas = generator.createSchema(commandEntries.flatMap(({
		inputTypeName,
		outputTypeName,
	}) => [inputTypeName, outputTypeName])) as unknown as RuntimeJsonSchema;
	const commands: Record<string, GeneratedCommand> = {};

	commandEntries.forEach(({
		method,
		methodName,
		inputTypeName,
		outputTypeName,
		metadata,
	}) => {
		const inputSchema = getStandaloneSchema(generatedSchemas, inputTypeName);
		const outputDescription = metadata.tags.find(({ name }) => name === 'returns'
			|| name === 'return')?.text;
		const outputSchema = getStandaloneSchema(
			generatedSchemas,
			outputTypeName,
			outputDescription
		);

		metadata.tags.filter(({ name }) => name === 'param').forEach(({ parameterName, text }) => {
			if (parameterName && inputSchema.properties?.[parameterName]) {
				inputSchema.properties[parameterName].description = text;
			}
		});

		commands[methodName] = {
			description: metadata.description,
			parameterOrder: method.parameters.map((parameter) => getName(parameter.name, programSource)),
			inputSchema,
			outputSchema,
			...(metadata.category ? { category: metadata.category } : {}),
			tags: metadata.tags,
		};
	});

	const contents = `export const commands = ${JSON.stringify(commands, null, 2)};\n`;
	ensureDirectoryExists(path.dirname(outputFile));
	fs.writeFileSync(outputFile, contents);

	return commands;
};

class RuntimeMetadataPlugin {
	private options: GeneratorOptions;

	constructor(options: GeneratorOptions) {
		this.options = options;
	}

	apply(compiler: Compiler) {
		compiler.hooks.beforeCompile.tap('UnityUtilRuntimeMetadataPlugin', () => {
			generateRuntimeMetadata(this.options);
		});
	}
}

module.exports = { RuntimeMetadataPlugin, generateRuntimeMetadata };
