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
define("musicData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                console.log(t.parseAction(tree));
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
            var riffSong = { title: treeValue_1.Of('credit-words', treeValue_1.Of('credit', treeValue_1.Of('score-partwise', tree))).value, voices: [] };
            var traksList = treeValue_2.everyOf('score-part', treeValue_1.Of('part-list', treeValue_1.Of('score-partwise', tree)));
            var tracksParts = treeValue_2.everyOf('part', treeValue_1.Of('score-partwise', tree));
            var tempo = 120;
            for (var i = 0; i < traksList.length; i++) {
                var track = traksList[i];
                for (var k = 0; k < tracksParts.length; k++) {
                    var part = tracksParts[k];
                    if (treeValue_1.Of('id', part).value == treeValue_1.Of('id', track).value) {
                        var measures = treeValue_2.everyOf('measure', part);
                        var voices = [];
                        for (var m = 0; m < measures.length; m++) {
                            var measure = measures[m];
                            var notes = treeValue_2.everyOf('note', measures[m]);
                            for (var n = 0; n < notes.length; n++) {
                                var note = notes[n];
                                var voice = treeValue_1.Of('voice', note).value;
                                if (voices.indexOf(voice) < 0) {
                                    voices.push(voice);
                                }
                            }
                        }
                        for (var v = 0; v < voices.length; v++) {
                            var trackVoice = { title: treeValue_1.Of('part-name', track).value + ': ' + voices[v], measures: [] };
                            riffSong.voices.push(trackVoice);
                            for (var m = 0; m < measures.length; m++) {
                                var measure = measures[m];
                                tempo = this.txtNum(treeValue_1.Of('tempo', treeValue_1.Of('sound', treeValue_1.Of('direction', measure))).value, tempo);
                                var riffMeasure = { chords: [],
                                    fifths: 0,
                                    tempo: tempo,
                                    meter: { count: 0, fraction: 0 },
                                    transpose: 0,
                                    clef: 0
                                };
                                trackVoice.measures.push(riffMeasure);
                            }
                        }
                    }
                }
            }
            return riffSong;
        };
        MXMLReaderApp.prototype.txtNum = function (txt, defValue) {
            if (txt) {
                return parseInt(txt);
            }
            else {
                return defValue;
            }
        };
        MXMLReaderApp.prototype.parseAction_____________ = function (tree) {
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
                        var divisionNum = 99;
                        for (var m = 0; m < measures.length; m++) {
                            var divisions = treeValue_1.Of('divisions', treeValue_1.Of('attributes', measures[m])).value;
                            if (divisions) {
                                console.log('	' + m, 'divisions:', divisions);
                                divisionNum = parseInt(divisions);
                            }
                            var fifths = treeValue_1.Of('fifths', treeValue_1.Of('key', treeValue_1.Of('attributes', measures[m]))).value;
                            if (fifths) {
                                console.log('	' + m, 'fifths:', fifths);
                            }
                            var sign = treeValue_1.Of('sign', treeValue_1.Of('clef', treeValue_1.Of('attributes', measures[m]))).value;
                            if (sign) {
                                console.log('	' + m, 'sign:', sign, treeValue_1.Of('line', treeValue_1.Of('clef', treeValue_1.Of('attributes', measures[m]))).value);
                            }
                            var beats = treeValue_1.Of('beats', treeValue_1.Of('time', treeValue_1.Of('attributes', measures[m]))).value;
                            if (beats) {
                                console.log('	' + m, 'beats:', beats, '/', treeValue_1.Of('beat-type', treeValue_1.Of('time', treeValue_1.Of('attributes', measures[m]))).value);
                            }
                            var notes = treeValue_2.everyOf('note', measures[m]);
                            for (var n = 0; n < notes.length; n++) {
                                var d = parseInt(treeValue_1.Of('duration', notes[n]).value);
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