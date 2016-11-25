#!/usr/bin/env python
#-*- coding:utf-8 -*-

from PyQt4 import QtCore, QtGui
import json

lines = []
columns = ["level", "method", "username", "uid", "timestamp", "httpCode", "message"]

class myWindow(QtGui.QMainWindow):
    def __init__(self, parent=None):
        super(myWindow, self).__init__(parent)
        self.centralwidget  = QtGui.QWidget(self)
        self.lineEdit       = QtGui.QLineEdit(self.centralwidget)
        self.view           = QtGui.QTableView(self.centralwidget)
        self.comboBox       = QtGui.QComboBox(self.centralwidget)
        self.label          = QtGui.QLabel(self.centralwidget)

        self.gridLayout = QtGui.QGridLayout(self.centralwidget)
        self.gridLayout.addWidget(self.lineEdit, 0, 1, 1, 1)
        self.gridLayout.addWidget(self.view, 1, 0, 1, 3)
        self.gridLayout.addWidget(self.comboBox, 0, 2, 1, 1)
        self.gridLayout.addWidget(self.label, 0, 0, 1, 1)

        self.setCentralWidget(self.centralwidget)
        self.label.setText("Regex Filter")

        self.model = QtGui.QStandardItemModel(self)
        self.model.setHorizontalHeaderLabels(columns)

        for line in lines:
            self.model.invisibleRootItem().appendRow(
                [ QtGui.QStandardItem(str(line.get(column, ""))) for column in columns ]
            )


        self.proxy = QtGui.QSortFilterProxyModel(self)
        self.proxy.setSourceModel(self.model)

        self.view.setModel(self.proxy)
        self.view.verticalHeader().setVisible(False)
        self.comboBox.addItems([columns[x] for x in range(self.model.columnCount())])
        self.view.resizeColumnsToContents()

        self.lineEdit.textChanged.connect(self.on_lineEdit_textChanged)
        self.comboBox.currentIndexChanged.connect(self.on_comboBox_currentIndexChanged)

        self.horizontalHeader = self.view.horizontalHeader()
        self.horizontalHeader.sectionClicked.connect(self.on_view_horizontalHeader_sectionClicked)

    @QtCore.pyqtSlot(int)
    def on_view_horizontalHeader_sectionClicked(self, logicalIndex):
        self.logicalIndex   = logicalIndex
        self.menuValues     = QtGui.QMenu(self)
        self.signalMapper   = QtCore.QSignalMapper(self)

        self.comboBox.blockSignals(True)
        self.comboBox.setCurrentIndex(self.logicalIndex)
        self.comboBox.blockSignals(True)

        valuesUnique = [    self.model.item(row, self.logicalIndex).text()
                            for row in range(self.model.rowCount())
                            ]


        actionAll = QtGui.QAction("All", self)
        actionAll.triggered.connect(self.on_actionAll_triggered)
        self.menuValues.addAction(actionAll)
        self.menuValues.addSeparator()

        for actionNumber, actionName in enumerate(sorted(list(set(valuesUnique)))):
            action = QtGui.QAction(actionName, self)
            self.signalMapper.setMapping(action, actionNumber)
            action.triggered.connect(self.signalMapper.map)
            self.menuValues.addAction(action)

        self.signalMapper.mapped.connect(self.on_signalMapper_mapped)

        headerPos = self.view.mapToGlobal(self.horizontalHeader.pos())

        posY = headerPos.y() + self.horizontalHeader.height()
        posX = headerPos.x() + self.horizontalHeader.sectionPosition(self.logicalIndex)

        self.menuValues.exec_(QtCore.QPoint(posX, posY))

    @QtCore.pyqtSlot()
    def on_actionAll_triggered(self):
        filterColumn = self.logicalIndex
        filterString = QtCore.QRegExp(  "",
                                        QtCore.Qt.CaseInsensitive,
                                        QtCore.QRegExp.RegExp
                                        )

        self.proxy.setFilterRegExp(filterString)
        self.proxy.setFilterKeyColumn(filterColumn)

    @QtCore.pyqtSlot(int)
    def on_signalMapper_mapped(self, i):
        stringAction = self.signalMapper.mapping(i).text()
        filterColumn = self.logicalIndex
        filterString = QtCore.QRegExp(  stringAction,
                                        QtCore.Qt.CaseSensitive,
                                        QtCore.QRegExp.FixedString
                                        )

        self.proxy.setFilterRegExp(filterString)
        self.proxy.setFilterKeyColumn(filterColumn)

    @QtCore.pyqtSlot(str)
    def on_lineEdit_textChanged(self, text):
        search = QtCore.QRegExp(    text,
                                    QtCore.Qt.CaseInsensitive,
                                    QtCore.QRegExp.RegExp
                                    )

        self.proxy.setFilterRegExp(search)

    @QtCore.pyqtSlot(int)
    def on_comboBox_currentIndexChanged(self, index):
        self.proxy.setFilterKeyColumn(index)


if __name__ == "__main__":
    import sys

    with open(sys.argv[1]) as f:
        lines = f.readlines()
        lines = [json.loads(line) for line in lines]
        for line in lines:
            if line.get("message", -1) != -1:
                line["message"] = line["message"].split("\t")[-1]

    app  = QtGui.QApplication(sys.argv)
    main = myWindow()
    main.show()
    main.resize(400, 600)
    sys.exit(app.exec_())
