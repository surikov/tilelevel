define("treeValue", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TreeValue = (function () {
        function TreeValue() {
        }
        return TreeValue;
    }());
    exports.TreeValue = TreeValue;
    function Of(name, tree) {
        for (var i = 0; i < tree.children.length; i++) {
            if (tree.children[i].name == name) {
                return tree.children[i];
            }
        }
        return { name: '', value: '', children: [] };
    }
    exports.Of = Of;
    function everyOf(name, tree) {
        var r = [];
        for (var i = 0; i < tree.children.length; i++) {
            if (tree.children[i].name == name) {
                r.push(tree.children[i]);
            }
        }
        return r;
    }
    exports.everyOf = everyOf;
});
define("MXMLReaderApp", ["require", "exports", "treeValue", "treeValue"], function (require, exports, treeValue_1, treeValue_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mxmlReaderApp = null;
    var MXMLReaderApp = (function () {
        function MXMLReaderApp() {
        }
        MXMLReaderApp.main = function () {
            console.log('here');
            mxmlReaderApp = new MXMLReaderApp();
            mxmlReaderApp.attachField();
        };
        MXMLReaderApp.prototype.handleFileSelect = function (event) {
            console.log('handleFileSelect', this);
            var t = this;
            var file = event.target.files[0];
            var fileReader = new FileReader();
            fileReader.onload = function (progressEvent) {
                var xml = progressEvent.target.result;
                var domParser = new DOMParser();
                var _document = domParser.parseFromString(xml, "text/xml");
                var tree = { name: '', value: '', children: t.readDocChildren(_document) };
                t.parseAction(tree);
            };
            fileReader.readAsText(file);
        };
        MXMLReaderApp.prototype.readDocChildren = function (node) {
            var children = [];
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    var c = node.children[i];
                    var t = '';
                    if (c.childNodes && c.childNodes[0] && c.childNodes[0].nodeName == '#text') {
                        t = ('' + c.childNodes[0].nodeValue).trim();
                    }
                    children.push({ name: c.localName, value: t, children: this.readDocChildren(c) });
                }
            }
            if (node.attributes) {
                for (var i = 0; i < node.attributes.length; i++) {
                    var a = node.attributes[i];
                    children.push({ name: a.localName, value: a.value, children: [] });
                }
            }
            return children;
        };
        MXMLReaderApp.prototype.parseAction = function (tree) {
            console.log(tree);
            console.log('title:', treeValue_1.Of('credit-words', treeValue_1.Of('credit', treeValue_1.Of('score-partwise', tree))).value);
            console.log('software:', treeValue_1.Of('software', treeValue_1.Of('encoding', treeValue_1.Of('identification', treeValue_1.Of('score-partwise', tree)))).value);
            var traksList = treeValue_2.everyOf('score-part', treeValue_1.Of('part-list', treeValue_1.Of('score-partwise', tree)));
            var tracksParts = treeValue_2.everyOf('part', treeValue_1.Of('score-partwise', tree));
            for (var i = 0; i < traksList.length; i++) {
                var track = traksList[i];
                console.log('track:', treeValue_1.Of('id', track).value, treeValue_1.Of('part-name', track).value);
                for (var k = 0; k < tracksParts.length; k++) {
                    var part = tracksParts[k];
                    if (treeValue_1.Of('id', part).value == treeValue_1.Of('id', track).value) {
                        var measures = treeValue_2.everyOf('measure', part);
                        for (var m = 0; m < measures.length; m++) {
                            var divisions = treeValue_1.Of('divisions', treeValue_1.Of('attributes', measures[m])).value;
                            if (divisions) {
                                console.log('divisions:', divisions);
                            }
                            var fifths = treeValue_1.Of('fifths', treeValue_1.Of('key', treeValue_1.Of('attributes', measures[m]))).value;
                            if (fifths) {
                                console.log('fifths:', fifths);
                            }
                        }
                    }
                }
            }
        };
        MXMLReaderApp.prototype.attachField = function () {
            var _this = this;
            document.getElementById('filesinput').addEventListener('change', function (event) { _this.handleFileSelect(event); });
        };
        return MXMLReaderApp;
    }());
    MXMLReaderApp.main();
});
//# sourceMappingURL=app.js.map