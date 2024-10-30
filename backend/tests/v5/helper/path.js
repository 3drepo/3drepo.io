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

const Path = require('path');

const PathHelper = {};

PathHelper.tmpDir = require('os').tmpdir();

PathHelper.src = `${__dirname}/../../../src/v5`;
PathHelper.srcV4 = `${__dirname}/../../../src/v4`;
PathHelper.utilScripts = `${__dirname}/../../../src/scripts/utility`;
PathHelper.modelFolder = `${__dirname}/../resources/models`;
PathHelper.imagesFolder = `${__dirname}/../resources/images`;
PathHelper.objModel = Path.join(PathHelper.modelFolder, 'dummy.obj');
PathHelper.dwgModel = Path.join(PathHelper.modelFolder, 'dummy.dwg');
PathHelper.image = Path.join(PathHelper.imagesFolder, 'valid.png');
PathHelper.svg = Path.join(PathHelper.imagesFolder, 'chevron.svg');
PathHelper.oversizedImage = Path.join(PathHelper.imagesFolder, 'tooBig.png');
PathHelper.objModelUppercaseExt = Path.join(PathHelper.modelFolder, 'dummyUppercaseExt.OBJ');
PathHelper.dwgModelUppercaseExt = Path.join(PathHelper.modelFolder, 'dummyUppercaseExt.DWG');
PathHelper.pdfModel = Path.join(PathHelper.modelFolder, 'model.pdf');
PathHelper.emptyPdf = Path.join(PathHelper.modelFolder, 'empty.pdf');

module.exports = PathHelper;
