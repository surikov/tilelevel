"use strict";
exports.__esModule = true;
var tilelevel5_1 = require("./tilelevel5");
function letsgo() {
    console.log('letsgo');
}
var TreeValue = /** @class */ (function () {
    function TreeValue() {
    }
    return TreeValue;
}());
exports.TreeValue = TreeValue;
function of(name, tree) {
    for (var i = 0; i < tree.children.length; i++) {
        if (tree.children[i].name == name) {
            return tree.children[i];
        }
    }
    return { name: '', value: '', children: [] };
}
exports.of = of;
function all(name, tree) {
    var r = [];
    for (var i = 0; i < tree.children.length; i++) {
        if (tree.children[i].name == name) {
            r.push(tree.children[i]);
        }
    }
    return r;
}
exports.all = all;
var fileLoadActionHandler;
function onFileLoad(action) {
    fileLoadActionHandler = action;
    return handleFileSelect;
}
exports.onFileLoad = onFileLoad;
function handleFileSelect(event) {
    var file = event.target.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function (progressEvent) {
        var xml = progressEvent.target.result;
        var domParser = new DOMParser();
        var _document = domParser.parseFromString(xml, "text/xml");
        var tree = { name: '', value: '', children: readDocChildren(_document) };
        fileLoadActionHandler(tree);
    };
    fileReader.readAsText(file);
}
exports.handleFileSelect = handleFileSelect;
function readDocChildren(node) {
    var children = [];
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            var c = node.children[i];
            var t = '';
            if (c.childNodes && c.childNodes[0] && c.childNodes[0].nodeName == '#text') {
                t = ('' + c.childNodes[0].nodeValue).trim();
            }
            children.push({ name: c.localName, value: t, children: readDocChildren(c) });
        }
    }
    if (node.attributes) {
        for (var i = 0; i < node.attributes.length; i++) {
            var a = node.attributes[i];
            children.push({ name: a.localName, value: a.value, children: [] });
        }
    }
    return children;
}
exports.readDocChildren = readDocChildren;
var levelEngine = new tilelevel5_1.TileLevel(window.document.getElementById('contentSVG'));
var smallSize = 0.1;
var cellSize = 0.6;
var zoomSmall = cellSize; //6
var zoomMiddle = zoomSmall * 12; //72
var zoomBig = zoomMiddle * 4; //288
var zoomMax = 100;
var zoomMin = 0.1;
var zoomStep1 = 0.3;
var zoomStep2 = zoomStep1 * 3; //9
var zoomStep3 = zoomStep2 * 3; //27
var zoomStep4 = zoomStep3 * 3; //81
var zoomStep5 = zoomStep4 * 3; //243
var zoomStep6 = zoomStep5 * 3; //729
var zoomStep7 = zoomStep6 * 3; //2187
var width16th = (32 * 4 * (120 / 100) + 40 * 2 * (120 / 180) + 32 * 100 * (120 / 140)) * cellSize;
var height16th = 128 * cellSize;
var button = {
    draw: 'rectangle',
    x: 10,
    y: 3,
    w: 1,
    h: 1,
    css: 'backgroundFill',
    action: function (x, y) {
        console.log('over', x, y, levelEngine);
    }
};
levelEngine.start([{
        g: document.getElementById('backgroundGroup'),
        definition: fillBackgroundGroup()
    }, {
        g: document.getElementById('timelineGroup'),
        mode: levelEngine.layerLockY,
        definition: fillTimelineGroup()
    }, {
        g: document.getElementById('zoomGroup'),
        mode: levelEngine.layerStickBottom,
        definition: fillZoomGroup()
    }, {
        g: document.getElementById('leftScale'),
        mode: levelEngine.layerLockX,
        definition: fillLeftGroup()
    }, {
        g: document.getElementById('rightScale'),
        mode: levelEngine.layerStickRight,
        definition: fillRightGroup()
    }, {
        g: document.getElementById('overButton'),
        mode: levelEngine.layerOverlay,
        definition: [{
                x: 0,
                y: 0,
                w: width16th,
                h: height16th,
                z: [zoomMin, zoomMax + 1],
                sub: [button]
            }
        ]
    }], width16th * levelEngine.tapSize, height16th * levelEngine.tapSize, zoomMin, 20, zoomMax);
window.onresize = onWindowResize;
onWindowResize();
document.getElementById('filesinput').addEventListener('change', onFileLoad(function (tree) {
    console.log(tree);
    console.log('title:', of('credit-words', of('credit', of('score-partwise', tree))).value);
    console.log('software:', of('software', of('encoding', of('identification', of('score-partwise', tree)))).value);
    var traksList = all('score-part', of('part-list', of('score-partwise', tree)));
    var tracksParts = all('part', of('score-partwise', tree));
    //console.log('tracksParts:',tracksParts);
    for (var i = 0; i < traksList.length; i++) {
        var track = traksList[i];
        console.log('track:', of('id', track).value, of('part-name', track).value);
        for (var k = 0; k < tracksParts.length; k++) {
            var part = tracksParts[k];
            if (of('id', part).value == of('id', track).value) {
                var measures = all('measure', part);
                //console.log('part:',part,measures);
                for (var m = 0; m < measures.length; m++) {
                    var divisions = of('divisions', of('attributes', measures[m])).value;
                    if (divisions) {
                        console.log('divisions:', divisions);
                    }
                    var fifths = of('fifths', of('key', of('attributes', measures[m]))).value;
                    if (fifths) {
                        console.log('fifths:', fifths);
                    }
                }
            }
        }
    }
    //console.log(all('supports',of('encoding',of('identification',of('score-partwise',tree)))));
    //console.log(of('work-title',of('work',of('score-partwise2',tree))).value);
    //console.log(all('supports',of('encoding',of('identification',of('score-partwise2',tree)))));
}), false);
//console.log(levelEngine.tapSize,8000/levelEngine.tapSize);
/*levelEngine.setModel([{
        g: document.getElementById('backgroundGroup'),
        definition: fillBackgroundGroup()
    }]);
levelEngine.innerWidth = 30000 * levelEngine.tapSize;
levelEngine.innerHeight = 500 * levelEngine.tapSize;
levelEngine.mx = 999;
levelEngine.applyZoomPosition();*/
/*function of(name,tree){
    for(var i=0;i<tree.children.length;i++){
        if(tree.children[i].name==name){
            return tree.children[i];
        }
    }
    return {name:'',value:'',children:[]};
}
function all(name,tree){
    var r=[];
    for(var i=0;i<tree.children.length;i++){
        if(tree.children[i].name==name){
            r.push(tree.children[i]);
        }
    }
    return r;
}*/
/*function handleFileSelect(event) {
    console.log(event);
    var file = event.target.files[0];
    console.log(file);
    var fileReader = new FileReader();
    fileReader.onload = function (progressEvent ) {
        console.log(progressEvent);
        //var arrayBuffer = progressEvent.target.result;
        //var s=String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
        //console.log(arrayBuffer,s);
        //var midiFile = new MIDIFile(arrayBuffer);
        //var song = midiFile.parseSong();
        //startLoad(song);
        var xml=progressEvent.target.result;
        //console.log(xml);
        var domParser = new DOMParser();
        var _document = domParser.parseFromString(xml,"text/xml");
        console.dir(_document);
        var tree={name:'',value:'',children:readDocChildren(_document)};
        console.log(tree);
        //console.log(of('work-title',of('work',of('score-partwise',tree))).value);
        //console.log(all('supports',of('encoding',of('identification',of('score-partwise',tree)))));
        //console.log(of('work-title',of('work',of('score-partwise2',tree))).value);
        //console.log(all('supports',of('encoding',of('identification',of('score-partwise2',tree)))));
    };
    fileReader.readAsText(file);
}*/
/*function readDocChildren(node){
    var children=[];
    //console.dir(node);
    if(node.children){
        for(var i=0;i<node.children.length;i++){
            var c=node.children[i];
            var t='';
            if(c.childNodes && c.childNodes[0] && c.childNodes[0].nodeName=='#text'){t=(''+c.childNodes[0].nodeValue).trim();}
            //var t={name:c.tagName,value:'none',children:readDocChildren(node.children[i])};
            children.push({name:c.localName ,value:t ,children:readDocChildren(c) });
        }
    }
    if(node.attributes){
        for(var i=0;i<node.attributes.length;i++){
            var a=node.attributes[i];
            children.push({name:a.localName ,value:a.value ,children:[] });
        }
    }
    return children;
}*/
function onWindowResize() {
    var element = document.getElementById('contentSVG');
    button.x = element.clientWidth / levelEngine.tapSize - 1;
    button.y = element.clientHeight / levelEngine.tapSize - 2;
    levelEngine.readViewSize();
}
function fillTimelineGroup() {
    var content = [];
    var de10 = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomMin, zoomSmall],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + 2) {
        de10.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '' + i,
            css: 'decorFill textSize3 baselineHanging'
        });
    }
    content.push(de10);
    var de100 = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomSmall, zoomMiddle],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + 10) {
        de100.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '' + i,
            css: 'decorFill textSize20 baselineHanging'
        });
    }
    content.push(de100);
    var de1000 = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomMiddle, zoomBig],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + 100) {
        de1000.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '' + i,
            css: 'decorFill textSize100 baselineHanging'
        });
    }
    content.push(de1000);
    var de500 = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomBig, zoomMax + 1],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + 300) {
        de500.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '' + i,
            css: 'decorFill textSize500 baselineHanging'
        });
    }
    content.push(de500);
    return content;
}
function fillZoomGroup() {
    var content = [];
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [0.1, zoomStep1],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep3) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '1:' + Math.round(i),
            css: 'decorFill textZoomStep1'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep1,w: zoomStep1,h: zoomStep1,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep1, zoomStep2],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep4) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '2:' + Math.round(i),
            css: 'decorFill textZoomStep2'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep2,w: zoomStep2,h: zoomStep2,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep2, zoomStep3],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep5) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '3:' + Math.round(i),
            css: 'decorFill textZoomStep3'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep3,w: zoomStep3,h: zoomStep3,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep3, zoomStep4],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep6) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '4:' + Math.round(i),
            css: 'decorFill textZoomStep4'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep4,w: zoomStep4,h: zoomStep4,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep4, zoomStep5],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep7) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '5:' + Math.round(i),
            css: 'decorFill textZoomStep5'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep5,w: zoomStep5,h: zoomStep5,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep5, zoomStep6],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep7 * 3) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '6:' + Math.round(i),
            css: 'decorFill textZoomStep6'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep6,w: zoomStep6,h: zoomStep6,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep6, zoomMax + 1],
        sub: []
    };
    for (var i = 0; i < width16th; i = i + zoomStep7 * 3 * 3) {
        df.sub.push({
            draw: 'text',
            x: i,
            y: 0,
            text: '7:' + Math.round(i),
            css: 'decorFill textZoomStep7'
        });
        //df.sub.push({draw: 'rectangle',x: i,y: -zoomStep7,w: zoomStep7,h: zoomStep7,css: 'backgroundFill'});
    }
    content.push(df);
    return content;
}
function fillRightGroup() {
    var content = [];
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [0.1, zoomStep1],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep2) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '1:' + Math.round(i),
            css: 'decorFill textZoomStep1 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep1,y:i,w: zoomStep1,h: zoomStep1,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep1, zoomStep2],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep3) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '2:' + Math.round(i),
            css: 'decorFill textZoomStep2 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep2,y:i,w: zoomStep2,h: zoomStep2,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep2, zoomStep3],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep4) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '3:' + Math.round(i),
            css: 'decorFill textZoomStep3 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep3,y:i,w: zoomStep3,h: zoomStep3,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep3, zoomStep4],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep5) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '4:' + Math.round(i),
            css: 'decorFill textZoomStep4 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep4,y:i,w: zoomStep4,h: zoomStep4,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep4, zoomStep5],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep6) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '5:' + Math.round(i),
            css: 'decorFill textZoomStep5 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep5,y:i,w: zoomStep5,h: zoomStep5,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep5, zoomStep6],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep7) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '6:' + Math.round(i),
            css: 'decorFill textZoomStep6 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep6,y:i,w: zoomStep6,h: zoomStep6,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep6, zoomMax + 1],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep7 * 3) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '7:' + Math.round(i),
            css: 'decorFill textZoomStep7 baselineHanging anchorRight'
        });
        //df.sub.push({draw: 'rectangle',x: -zoomStep7,y:i,w: zoomStep7,h: zoomStep7,css: 'backgroundFill'});
    }
    content.push(df);
    //console.log(df);
    return content;
}
function fillLeftGroup() {
    var content = [];
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [0.1, zoomStep1],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep2) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '1:' + Math.round(i),
            css: 'decorFill textZoomStep1 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep1,h: zoomStep1,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep1, zoomStep2],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep3) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '2:' + Math.round(i),
            css: 'decorFill textZoomStep2 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep2,h: zoomStep2,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep2, zoomStep3],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep4) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '3:' + Math.round(i),
            css: 'decorFill textZoomStep3 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep3,h: zoomStep3,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep3, zoomStep4],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep5) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '4:' + Math.round(i),
            css: 'decorFill textZoomStep4 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep4,h: zoomStep4,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep4, zoomStep5],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep6) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '5:' + Math.round(i),
            css: 'decorFill textZoomStep5 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep5,h: zoomStep5,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep5, zoomStep6],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep7) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '6:' + Math.round(i),
            css: 'decorFill textZoomStep6 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep6,h: zoomStep6,css: 'backgroundFill'});
    }
    content.push(df);
    var df = {
        x: 0,
        y: 0,
        w: width16th,
        h: height16th,
        z: [zoomStep6, zoomMax + 1],
        sub: []
    };
    for (var i = 0; i < height16th; i = i + zoomStep7 * 3) {
        df.sub.push({
            draw: 'text',
            x: 0,
            y: i,
            text: '7:' + Math.round(i),
            css: 'decorFill textZoomStep7 baselineHanging'
        });
        //df.sub.push({draw: 'rectangle',x: 0,y:i,w: zoomStep7,h: zoomStep7,css: 'backgroundFill'});
    }
    content.push(df);
    return content;
}
function fillBackgroundGroup() {
    var content = [{
            x: 0,
            y: 0,
            w: width16th,
            h: height16th,
            z: [zoomMin, zoomMax + 1],
            sub: [{
                    draw: 'rectangle',
                    x: 0,
                    y: 0,
                    w: width16th,
                    h: height16th,
                    css: 'backgroundFill'
                }
                //,{draw: 'rectangle',x: 50,y: 50,w: 29900,h: 400,css: 'bluebackground'}
                //,{draw: 'rectangle',x: 100,y: 100,w: 29800,h: 300,css: 'bluebackground'}
                /*
                ,{draw: 'rectangle',x: 0,y: 20,w: 70,h: 70,css: 'backgroundFill'}
                ,{draw: 'rectangle',x: 100,y: 20,w: 70,h: 70,css: 'decorFill'}
                ,{draw: 'rectangle',x: 200,y: 20,w: 70,h: 70,css: 'alertFill'}
                ,{draw: 'rectangle',x: 300,y: 20,w: 70,h: 70,css: 'spotFill'}
                ,{draw: 'rectangle',x: 400,y: 20,w: 70,h: 70,css: 'mainRollFill'}
                ,{draw: 'rectangle',x: 500,y: 20,w: 70,h: 70,css: 'mainGridFill'}
                ,{draw: 'rectangle',x: 600,y: 20,w: 70,h: 70,css: 'backRollFill'}
                ,{draw: 'rectangle',x: 700,y: 20,w: 70,h: 70,css: 'backGridFill'}
                */
                ,
                {
                    draw: 'rectangle',
                    x: smallSize,
                    y: smallSize,
                    w: smallSize,
                    h: smallSize,
                    css: 'backGridFill',
                    action: function (x, y) {
                        console.log('smallSize', smallSize, x, y);
                    }
                }, {
                    draw: 'rectangle',
                    x: smallSize + smallSize + smallSize,
                    y: smallSize,
                    w: cellSize,
                    h: cellSize,
                    css: 'backGridFill',
                    action: function (x, y) {
                        console.log('cellSize', cellSize, x, y);
                    }
                }, {
                    draw: 'rectangle',
                    x: smallSize + smallSize + smallSize + cellSize + smallSize,
                    y: smallSize,
                    w: 12 * cellSize,
                    h: 12 * cellSize,
                    css: 'backGridFill',
                    action: function (x, y) {
                        console.log('12*cellSize', 12 * cellSize, x, y);
                    }
                }
            ]
        }];
    return content;
}
