import type { Compiler } from 'webpack';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { createGenerator } = require('ts-json-schema-generator');

const isPublicAndVisible = (member) => !member.modifiers?.some(({ kind }) => (
	kind === ts.SyntaxKind.PrivateKeyword || kind === ts.SyntaxKind.ProtectedKeyword
)) && !ts.isPrivateIdentifier(member.name)
	&& !ts.getJSDocTags(member).some(({ tagName }) => tagName.text === 'hidden');

const isBrowserNativeType = (type) => {
	const symbols = [type.aliasSymbol, type.getSymbol()].filter(Boolean);

	return symbols.some((symbol) => symbol.declarations?.some((declaration) => {
		const fileName = path.basename(declaration.getSourceFile().fileName);
		return fileName.startsWith('lib.dom.')
			|| fileName.startsWith('lib.webworker.')
			|| fileName.startsWith('lib.scripthost.');
	}));
};

const containsBrowserNativeType = (type, checker, visited = new Set()) => {
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
		return checker.getTypeArguments(type).some((memberType) => (
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

const getName = (name, sourceFile) => {
	if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)
		|| ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
		return name.text;
	}

	return name.getText(sourceFile);
};

const getCommentText = (comment) => {
	if (!comment) {
		return '';
	}

	return typeof comment === 'string' ? comment : ts.displayPartsToString(comment);
};

const getMethodMetadata = (method) => {
	const tags = ts.getJSDocTags(method).map((tag) => ({
		name: tag.tagName.text,
		...(ts.isJSDocParameterTag(tag) ? { parameterName: tag.name.getText() } : {}),
		text: getCommentText(tag.comment).trim(),
	}));
	const category = tags.find(({ name }) => name === 'category')?.text;
	const description = (method.jsDoc || [])
		.map(({ comment }) => getCommentText(comment).trim())
		.filter(Boolean)
		.join('\n\n');

	return { description, category, tags };
};

const collectSchemaReferences = (value, definitions, collected = {}) => {
	if (!value || typeof value !== 'object') {
		return collected;
	}

	if (typeof value.$ref === 'string') {
		const match = value.$ref.match(/^#\/definitions\/(.+)$/);
		if (match) {
			const name = decodeURIComponent(match[1]);
			if (definitions[name] && !collected[name]) {
				collected[name] = definitions[name];
				collectSchemaReferences(definitions[name], definitions, collected);
			}
		}
	}

	Object.values(value).forEach((child) => collectSchemaReferences(child, definitions, collected));
	return collected;
};

const getStandaloneSchema = (schema, definitionName, description = '') => {
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

const generateRuntimeMetadata = ({
	inputFile,
	outputFile,
	primaryClass
}: {inputFile: string, outputFile: string, primaryClass: string}) => {
	if (!inputFile || !outputFile || !primaryClass) {
		throw new TypeError('inputFile, outputFile, and primaryClass must be specified');
	}

	if (path.extname(inputFile) !== '.ts') {
		throw new TypeError(`The metadata input must be a TypeScript file: ${inputFile}`);
	}

	const source = fs.readFileSync(inputFile, 'utf8');
	const sourceFile = ts.createSourceFile(inputFile, source, ts.ScriptTarget.Latest, true);

	if (sourceFile.parseDiagnostics.length) {
		const diagnostic = sourceFile.parseDiagnostics[0];
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

	const programClass = programSource.statements.find((statement) => (
		ts.isClassDeclaration(statement)
		&& statement.name?.text === primaryClass
		&& statement.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)
	));
	const methods = programClass.members.filter((member) => (
		ts.isMethodDeclaration(member)
		&& member.modifiers?.some(({ kind }) => kind === ts.SyntaxKind.StaticKeyword)
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
		.map(({ name }) => name.text);
	const schemaTypes = exportedTypes.length
		? [`import type { ${exportedTypes.join(', ')} } from ${JSON.stringify(inputFile.replace(/\\/g, '/'))};`]
		: [];
	const commandEntries = [];

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
		const returnType = checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(method));
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
	}) => [inputTypeName, outputTypeName]));
	const commands = {};

	commandEntries.forEach(({
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
			inputSchema,
			outputSchema,
			...(metadata.category ? { category: metadata.category } : {}),
			tags: metadata.tags,
		};
	});

	const contents = `export const commands = ${JSON.stringify(commands, null, 2)};\n`;
	fs.mkdirSync(path.dirname(outputFile), { recursive: true });
	fs.writeFileSync(outputFile, contents);

	return commands;
};

class RuntimeMetadataPlugin {
	private options: {
		inputFile: string;
		outputFile: string;
		primaryClass: string;
	};

	constructor(options: {inputFile: string, outputFile: string, primaryClass: string}) {
		this.options = options;
	}

	apply(compiler: Compiler) {
		compiler.hooks.beforeCompile.tap('UnityUtilRuntimeMetadataPlugin', () => {
			generateRuntimeMetadata(this.options);
		});
	}
}

module.exports = { RuntimeMetadataPlugin, generateRuntimeMetadata };
