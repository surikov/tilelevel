console.log('tilelevel.js v4.49');
var _tileLevel = null;
var TilePoint = /** @class */ (function () {
    function TilePoint() {
        this.x = 0;
        this.y = 0;
    }
    return TilePoint;
}());
var TileZoom = /** @class */ (function () {
    function TileZoom() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    return TileZoom;
}());
var TileModelLayer = /** @class */ (function () {
    function TileModelLayer() {
        this.g = null;
        this.mode = 'normal';
        //viceversa: boolean;
        this.definition = [];
    }
    return TileModelLayer;
}());
var TileLevel = /** @class */ (function () {
    function TileLevel(contentElement) {
        this.svgns = "http://www.w3.org/2000/svg";
        this.svg = null;
        this.viewWidth = 0;
        this.viewHeight = 0;
        this.innerWidth = 0;
        this.innerHeight = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.translateZ = 1;
        this.startedTouch = false;
        this.valid = false;
        this.clicked = false;
        this.mx = 100;
        this.startMouseScreenX = 0;
        this.startMouseScreenY = 0;
        this.dragZoom = 1;
        this.clickX = 0;
        this.clickY = 0;
        this.tapSize = 0;
        this.twoZoom = false;
        this.clickLimit = this.tapSize / 6;
        this.twodistance = 0;
        this.twocenter = null;
        this.model = [];
        this.layerLockX = 'lockX';
        this.layerNormal = 'normal';
        this.layerOverlay = 'overlay';
        this.layerLockY = 'lockY';
        this.layerStickBottom = 'stickBottom';
        this.layerStickRight = 'stickRight';
        _tileLevel = this;
        this.svg = contentElement;
        this.viewWidth = this.svg.clientWidth;
        this.viewHeight = this.svg.clientHeight;
        this.innerWidth = this.viewWidth;
        this.innerHeight = this.viewHeight;
        this.setupTapSize();
        this.svg.addEventListener('mousedown', this.rakeMouseDown, {
            capture: false
        });
        /*this.svg.addEventListener("mousewheel", this.rakeMouseWheel, {
            capture: false,
            passive: true
        });*/
        this.svg.addEventListener("wheel", this.rakeMouseWheel, {
            capture: false,
            passive: true
        });
        /*this.svg.addEventListener("DOMMouseScroll", this.rakeMouseWheel, {
            capture: false
        });*/
        this.svg.addEventListener("touchstart", this.rakeTouchStart, {
            capture: false,
            passive: true
        });
        this.svg.addEventListener("touchmove", this.rakeTouchMove, {
            capture: false,
            passive: true
        });
        this.svg.addEventListener("touchend", this.rakeTouchEnd, {
            capture: false
        });
        this.startLoop();
        console.log('constructor', this);
    }
    TileLevel.prototype.setupTapSize = function () {
        var rect = document.createElementNS(this.svgns, 'rect');
        rect.setAttributeNS(null, 'height', '1cm');
        rect.setAttributeNS(null, 'width', '1cm');
        this.svg.appendChild(rect);
        var tbb = rect.getBBox();
        this.tapSize = tbb.width;
        this.svg.removeChild(rect);
        this.clickLimit = this.tapSize / 6;
    };
    TileLevel.prototype.startDragZoom = function () {
        this.dragZoom = 1.01;
        this.applyZoomPosition();
    };
    ;
    TileLevel.prototype.cancelDragZoom = function () {
        this.dragZoom = 1.0;
        this.applyZoomPosition();
    };
    ;
    TileLevel.prototype.applyZoomPosition = function () {
        var rx = -this.translateX - this.dragZoom * this.translateZ * (this.viewWidth - this.viewWidth / this.dragZoom) * (this.clickX / this.viewWidth);
        var ry = -this.translateY - this.dragZoom * this.translateZ * (this.viewHeight - this.viewHeight / this.dragZoom) * (this.clickY / this.viewHeight);
        var rw = this.viewWidth * this.translateZ * this.dragZoom;
        var rh = this.viewHeight * this.translateZ * this.dragZoom;
        this.svg.setAttribute('viewBox', rx + ' ' + ry + ' ' + rw + ' ' + rh);
        if (this.model) {
            for (var k = 0; k < this.model.length; k++) {
                var layer = this.model[k];
                var tx = 0;
                var ty = 0;
                var tz = 1;
                var cX = 0;
                var cY = 0;
                var sX = 0;
                var sY = 0;
                if (this.viewWidth * this.translateZ > this.innerWidth) {
                    cX = (this.viewWidth * this.translateZ - this.innerWidth) / 2;
                }
                if (this.viewHeight * this.translateZ > this.innerHeight) {
                    cY = (this.viewHeight * this.translateZ - this.innerHeight) / 2;
                }
                if (layer.mode == this.layerOverlay) {
                    tz = this.translateZ;
                    tx = -this.translateX;
                    ty = -this.translateY;
                    cX = 0;
                    cY = 0;
                }
                else {
                    if (layer.mode == this.layerLockX) {
                        tx = -this.translateX;
                        cX = 0;
                        if (layer.shift) {
                            //let shiftX=layer.shiftX(this);
                            sX = layer.shift * this.tapSize * this.translateZ;
                        }
                    }
                    else {
                        if (layer.mode == this.layerLockY) {
                            ty = -this.translateY;
                            cY = 0;
                            if (layer.shift) {
                                //let shiftY=layer.shiftY(this);
                                sY = layer.shift * this.tapSize * this.translateZ;
                                /*}else{
                                    
                                    sY = (this.viewHeight+layer.shiftY * this.tapSize) * this.translateZ;
                                    console.log(sY,tz,(ty + cY + sY));
                                    */
                            }
                            /*
                            if (layer.viceversa) {
                                if (layer.shiftY) {
                                    sY = (this.viewHeight+layer.shiftY * this.tapSize) * this.translateZ;
                                    console.log(layer);
                                }
                            }*/
                        }
                        else {
                            if (layer.mode == this.layerStickBottom) {
                                ty = -this.translateY;
                                cY = 0;
                                sY = this.viewHeight * this.translateZ;
                                if (layer.shift) {
                                    sY = this.viewHeight * this.translateZ - layer.shift * this.tapSize;
                                }
                            }
                            else {
                                if (layer.mode == this.layerStickRight) {
                                    tx = -this.translateX;
                                    cX = 0;
                                    sX = this.viewWidth * this.translateZ;
                                    if (layer.shift) {
                                        sX = this.viewWidth * this.translateZ - layer.shift * this.tapSize;
                                    }
                                }
                            }
                        }
                    }
                }
                layer.g.setAttribute('transform', 'translate(' + (tx + cX + sX) +
                    ',' + (ty + cY + sY) + ') scale(' + tz + ',' + tz + ')');
            }
        }
    };
    TileLevel.prototype.setModel = function (layers) {
        this.model = layers;
        this.resetModel();
    };
    TileLevel.prototype.resetModel = function () {
        this.clearAllDetails();
        this.applyZoomPosition();
        this.adjustContentPosition();
        this.slideToContentPosition();
        this.valid = false;
    };
    TileLevel.prototype.adjustContentPosition = function () {
        var a = this.adjusted();
        if (a.x != this.translateX || a.y != this.translateY || a.z != this.translateZ) {
            this.translateX = a.x;
            this.translateY = a.y;
            this.translateZ = a.z;
            this.applyZoomPosition();
        }
    };
    TileLevel.prototype.slideToContentPosition = function () {
        var a = this.adjusted();
        if (a.x != this.translateX || a.y != this.translateY || a.z != this.translateZ) {
            this.startSlideTo(a.x, a.y, a.z, null);
        }
    };
    TileLevel.prototype.clearAllDetails = function () {
        if (this.model) {
            for (var i = 0; i < this.model.length; i++) {
                this.clearGroupDetails(this.model[i].g);
            }
        }
    };
    TileLevel.prototype.clearGroupDetails = function (group) {
        this.msEdgeHook(group);
        while (group.children.length) {
            group.removeChild(group.children[0]);
        }
    };
    TileLevel.prototype.msEdgeHook = function (g) {
        if (g.childNodes && (!(g.children))) {
            g.children = g.childNodes;
        }
    };
    TileLevel.prototype.adjusted = function () {
        var vX = this.translateX;
        var vY = this.translateY;
        var vZ = this.translateZ;
        if (this.translateX > 0) {
            vX = 0;
        }
        else {
            if (this.viewWidth - this.translateX / this.translateZ > this.innerWidth / this.translateZ) {
                if (this.viewWidth * this.translateZ - this.innerWidth <= 0) {
                    vX = this.viewWidth * this.translateZ - this.innerWidth;
                }
                else {
                    vX = 0;
                }
            }
        }
        if (this.translateY > 0) {
            vY = 0;
        }
        else {
            if (this.viewHeight - this.translateY / this.translateZ > this.innerHeight / this.translateZ) {
                if (this.viewHeight * this.translateZ - this.innerHeight <= 0) {
                    vY = this.viewHeight * this.translateZ - this.innerHeight;
                }
                else {
                    vY = 0;
                }
            }
        }
        if (this.translateZ < 1) {
            vZ = 1;
        }
        else {
            if (this.translateZ > this.mx) {
                vZ = this.mx;
            }
        }
        return {
            x: vX,
            y: vY,
            z: vZ
        };
    };
    TileLevel.prototype.startSlideTo = function (x, y, z, action) {
        this.startStepSlideTo(10, x, y, z, action);
    };
    TileLevel.prototype.startStepSlideTo = function (s, x, y, z, action) {
        var stepCount = s;
        var dx = (x - this.translateX) / stepCount;
        var dy = (y - this.translateY) / stepCount;
        var dz = (z - this.translateZ) / stepCount;
        var xyz = [];
        for (var i = 0; i < stepCount; i++) {
            xyz.push({
                x: this.translateX + dx * i,
                y: this.translateY + dy * i,
                z: this.translateZ + dz * i
            });
        }
        xyz.push({
            x: x,
            y: y,
            z: z
        });
        this.stepSlideTo(xyz, action);
    };
    TileLevel.prototype.stepSlideTo = function (xyz, action) {
        var n = xyz.shift();
        if (n) {
            this.translateX = n.x;
            this.translateY = n.y;
            this.translateZ = n.z;
            this.applyZoomPosition();
            var main_1 = this;
            setTimeout(function () {
                main_1.stepSlideTo(xyz, action);
            }, 10);
        }
        else {
            if (action) {
                action();
            }
            this.adjustContentPosition();
            this.valid = true;
            this.queueTiles();
        }
    };
    TileLevel.prototype.maxZoom = function () {
        return this.mx;
    };
    ;
    TileLevel.prototype.queueTiles = function () {
        this.clearUselessDetails();
        this.tileFromModel();
    };
    TileLevel.prototype.clearUselessDetails = function () {
        if (this.model) {
            for (var k = 0; k < this.model.length; k++) {
                var group = this.model[k].g;
                this.clearUselessGroups(group, this.model[k].mode);
            }
        }
    };
    TileLevel.prototype.clearUselessGroups = function (group, kind) {
        var x = -this.translateX;
        var y = -this.translateY;
        var w = this.svg.clientWidth * this.translateZ;
        var h = this.svg.clientHeight * this.translateZ;
        var cX = 0;
        var cY = 0;
        if (this.viewWidth * this.translateZ > this.innerWidth) {
            cX = (this.viewWidth * this.translateZ - this.innerWidth) / 2;
            x = x - cX;
        }
        if (this.viewHeight * this.translateZ > this.innerHeight) {
            cY = (this.viewHeight * this.translateZ - this.innerHeight) / 2;
            y = y - cY;
        }
        if (kind == this.layerOverlay) {
            x = 0;
            y = 0;
        }
        else {
            if (kind == this.layerLockX) {
                x = 0;
            }
            else {
                if (kind == this.layerLockY) {
                    y = 0;
                }
                else {
                    if (kind == this.layerStickRight) {
                        x = 0;
                    }
                    else {
                        if (kind == this.layerStickBottom) {
                            y = 0;
                        }
                    }
                }
            }
        }
        this.msEdgeHook(group);
        for (var i = 0; i < group.children.length; i++) {
            var child = group.children[i];
            if (this.outOfWatch(child, x, y, w, h) || child.minZoom > this.translateZ || child.maxZoom <= this.translateZ) {
                group.removeChild(child);
                i--;
            }
            else {
                if (child.localName == 'g') {
                    this.clearUselessGroups(child, kind);
                }
            }
        }
    };
    TileLevel.prototype.rakeMouseWheel = function (e) {
        //console.log('rakeMouseWheel',e.wheelDelta,e.detail,e.deltaX,e.deltaY,e.deltaZ,e);
        //e.preventDefault();
        //let wheelVal = e.wheelDelta || -e.detail;
        var wheelVal = e.deltaY;
        var min = Math.min(1, wheelVal);
        var delta = Math.max(-1, min);
        var zoom = _tileLevel.translateZ + delta * (_tileLevel.translateZ) * 0.077;
        if (zoom < 1) {
            zoom = 1;
        }
        if (zoom > _tileLevel.maxZoom()) {
            zoom = _tileLevel.maxZoom();
        }
        _tileLevel.translateX = _tileLevel.translateX - (_tileLevel.translateZ - zoom) * e.offsetX;
        _tileLevel.translateY = _tileLevel.translateY - (_tileLevel.translateZ - zoom) * e.offsetY;
        _tileLevel.translateZ = zoom;
        _tileLevel.applyZoomPosition();
        _tileLevel.adjustContentPosition();
        _tileLevel.valid = false;
        return false;
    };
    TileLevel.prototype.rakeMouseDown = function (mouseEvent) {
        //console.log('rakeMouseDown',mouseEvent,this);
        mouseEvent.preventDefault();
        _tileLevel.svg.addEventListener('mousemove', _tileLevel.rakeMouseMove, true);
        _tileLevel.svg.addEventListener('mouseup', _tileLevel.rakeMouseUp, false);
        _tileLevel.startMouseScreenX = mouseEvent.offsetX;
        _tileLevel.startMouseScreenY = mouseEvent.offsetY;
        _tileLevel.clickX = _tileLevel.startMouseScreenX;
        _tileLevel.clickY = _tileLevel.startMouseScreenY;
        _tileLevel.clicked = false;
        _tileLevel.startDragZoom();
    };
    TileLevel.prototype.rakeMouseMove = function (mouseEvent) {
        mouseEvent.preventDefault();
        var dX = mouseEvent.offsetX - _tileLevel.startMouseScreenX;
        var dY = mouseEvent.offsetY - _tileLevel.startMouseScreenY;
        _tileLevel.translateX = _tileLevel.translateX + dX * _tileLevel.translateZ;
        _tileLevel.translateY = _tileLevel.translateY + dY * _tileLevel.translateZ;
        _tileLevel.startMouseScreenX = mouseEvent.offsetX;
        _tileLevel.startMouseScreenY = mouseEvent.offsetY;
        _tileLevel.applyZoomPosition();
    };
    TileLevel.prototype.rakeMouseUp = function (mouseEvent) {
        mouseEvent.preventDefault();
        _tileLevel.svg.removeEventListener('mousemove', _tileLevel.rakeMouseMove, true);
        if (Math.abs(_tileLevel.clickX - mouseEvent.offsetX) < _tileLevel.clickLimit //
            &&
                Math.abs(_tileLevel.clickY - mouseEvent.offsetY) < _tileLevel.clickLimit) {
            _tileLevel.clicked = true;
        }
        _tileLevel.cancelDragZoom();
        _tileLevel.slideToContentPosition();
        _tileLevel.valid = false;
    };
    TileLevel.prototype.rakeTouchStart = function (touchEvent) {
        //touchEvent.preventDefault();
        _tileLevel.startedTouch = true;
        if (touchEvent.touches.length < 2) {
            _tileLevel.twoZoom = false;
            _tileLevel.startMouseScreenX = touchEvent.touches[0].clientX;
            _tileLevel.startMouseScreenY = touchEvent.touches[0].clientY;
            _tileLevel.clickX = _tileLevel.startMouseScreenX;
            _tileLevel.clickY = _tileLevel.startMouseScreenY;
            _tileLevel.twodistance = 0;
            _tileLevel.startDragZoom();
            return;
        }
        else {
            _tileLevel.startTouchZoom(touchEvent);
        }
        _tileLevel.clicked = false;
    };
    TileLevel.prototype.rakeTouchMove = function (touchEvent) {
        //touchEvent.preventDefault();
        if (_tileLevel.startedTouch) {
            if (touchEvent.touches.length < 2) {
                if (_tileLevel.twoZoom) {
                    //
                }
                else {
                    var dX = touchEvent.touches[0].clientX - _tileLevel.startMouseScreenX;
                    var dY = touchEvent.touches[0].clientY - _tileLevel.startMouseScreenY;
                    _tileLevel.translateX = _tileLevel.translateX + dX * _tileLevel.translateZ;
                    _tileLevel.translateY = _tileLevel.translateY + dY * _tileLevel.translateZ;
                    _tileLevel.startMouseScreenX = touchEvent.touches[0].clientX;
                    _tileLevel.startMouseScreenY = touchEvent.touches[0].clientY;
                    _tileLevel.applyZoomPosition();
                    return;
                }
            }
            else {
                if (!_tileLevel.twoZoom) {
                    _tileLevel.startTouchZoom(touchEvent);
                }
                else {
                    var p1 = _tileLevel.vectorFromTouch(touchEvent.touches[0]);
                    var p2 = _tileLevel.vectorFromTouch(touchEvent.touches[1]);
                    var d = _tileLevel.vectorDistance(p1, p2);
                    if (d <= 0) {
                        d = 1;
                    }
                    var ratio = d / _tileLevel.twodistance;
                    _tileLevel.twodistance = d;
                    var zoom = _tileLevel.translateZ / ratio;
                    if (zoom < 1) {
                        zoom = 1;
                    }
                    if (zoom > _tileLevel.maxZoom()) {
                        zoom = _tileLevel.maxZoom();
                    }
                    /*let cX:number = 0;
                    let cY:number = 0;
                    if (_tileLevel.viewWidth * _tileLevel.translateZ > _tileLevel.innerWidth) {
                        cX = (_tileLevel.viewWidth - _tileLevel.innerWidth / _tileLevel.translateZ) / 2;
                    }
                    if (_tileLevel.viewHeight * _tileLevel.translateZ > _tileLevel.innerHeight) {
                        cY = (_tileLevel.viewHeight - _tileLevel.innerHeight / _tileLevel.translateZ) / 2;
                    }*/
                    if (_tileLevel.viewWidth * _tileLevel.translateZ < _tileLevel.innerWidth) {
                        _tileLevel.translateX = _tileLevel.translateX - (_tileLevel.translateZ - zoom) * (_tileLevel.twocenter.x);
                    }
                    if (_tileLevel.viewHeight * _tileLevel.translateZ < _tileLevel.innerHeight) {
                        _tileLevel.translateY = _tileLevel.translateY - (_tileLevel.translateZ - zoom) * (_tileLevel.twocenter.y);
                    }
                    _tileLevel.translateZ = zoom;
                    _tileLevel.dragZoom = 1.0;
                    _tileLevel.applyZoomPosition();
                }
            }
        }
    };
    TileLevel.prototype.rakeTouchEnd = function (touchEvent) {
        touchEvent.preventDefault();
        _tileLevel.valid = false;
        if (!_tileLevel.twoZoom) {
            if (touchEvent.touches.length < 2) {
                if (_tileLevel.startedTouch) {
                    if (Math.abs(_tileLevel.clickX - _tileLevel.startMouseScreenX) < _tileLevel.translateZ * _tileLevel.clickLimit //
                        &&
                            Math.abs(_tileLevel.clickY - _tileLevel.startMouseScreenY) < _tileLevel.translateZ * _tileLevel.clickLimit) {
                        _tileLevel.clicked = true;
                    }
                }
                else {
                    //console.log('touch ended already');
                }
                _tileLevel.cancelDragZoom();
                _tileLevel.slideToContentPosition();
                return;
            }
        }
        _tileLevel.twoZoom = false;
        _tileLevel.startedTouch = false;
        _tileLevel.cancelDragZoom();
        _tileLevel.slideToContentPosition();
    };
    TileLevel.prototype.tileFromModel = function () {
        if (this.model) {
            for (var k = 0; k < this.model.length; k++) {
                var group = this.model[k].g;
                var arr = this.model[k].definition;
                for (var i = 0; i < arr.length; i++) {
                    var a = arr[i];
                    this.addGroupTile(group, a, this.model[k].mode);
                }
            }
        }
        this.valid = true;
    };
    TileLevel.prototype.addGroupTile = function (parentGroup, definitions, layerKind) {
        var x = -this.translateX;
        var y = -this.translateY;
        var w = this.svg.clientWidth * this.translateZ;
        var h = this.svg.clientHeight * this.translateZ;
        var cX = 0;
        var cY = 0;
        if (this.viewWidth * this.translateZ > this.innerWidth) {
            cX = (this.viewWidth * this.translateZ - this.innerWidth) / 2;
            x = x - cX;
        }
        if (this.viewHeight * this.translateZ > this.innerHeight) {
            cY = (this.viewHeight * this.translateZ - this.innerHeight) / 2;
            y = y - cY;
        }
        if (layerKind == this.layerOverlay) {
            x = 0;
            y = 0;
        }
        else {
            if (layerKind == this.layerLockX) {
                x = 0;
            }
            else {
                if (layerKind == this.layerLockY) {
                    y = 0;
                }
                else {
                    if (layerKind == this.layerStickRight) {
                        x = 0;
                    }
                    else {
                        if (layerKind == this.layerStickBottom) {
                            y = 0;
                        }
                    }
                }
            }
        }
        if (definitions.z[0] <= this.translateZ && definitions.z[1] > this.translateZ) {
            if (this.collision(definitions.x * this.tapSize, definitions.y * this.tapSize, definitions.w * this.tapSize, definitions.h * this.tapSize //
            , x, y, w, h)) {
                var xg = this.childExists(parentGroup, definitions.id);
                if (xg) {
                    for (var n = 0; n < definitions.sub.length; n++) {
                        var d = definitions.sub[n];
                        if (d.draw == 'group') {
                            this.addElement(xg, d, layerKind);
                        }
                    }
                }
                else {
                    var g = document.createElementNS(this.svgns, 'g');
                    g.id = definitions.id;
                    //let gg = g as any;
                    g.watchX = definitions.x * this.tapSize;
                    g.watchY = definitions.y * this.tapSize;
                    g.watchW = definitions.w * this.tapSize;
                    g.watchH = definitions.h * this.tapSize;
                    parentGroup.appendChild(g);
                    g.minZoom = definitions.z[0];
                    g.maxZoom = definitions.z[1];
                    for (var n = 0; n < definitions.sub.length; n++) {
                        var d = definitions.sub[n];
                        this.addElement(g, d, layerKind);
                    }
                }
            }
        }
    };
    TileLevel.prototype.startTouchZoom = function (touchEvent) {
        this.twoZoom = true;
        var p1 = this.vectorFromTouch(touchEvent.touches[0]);
        var p2 = this.vectorFromTouch(touchEvent.touches[1]);
        this.twocenter = this.vectorFindCenter(p1, p2);
        var d = this.vectorDistance(p1, p2);
        if (d <= 0) {
            d = 1;
        }
        this.twodistance = d;
    };
    ;
    TileLevel.prototype.tilePath = function (g, x, y, z, data, cssClass) {
        var path = document.createElementNS(this.svgns, 'path');
        path.setAttributeNS(null, 'd', data);
        var t = "";
        if ((x) || (y)) {
            t = 'translate(' + x + ',' + y + ')';
        }
        if (z) {
            t = t + ' scale(' + z + ')';
        }
        if (t.length > 0) {
            path.setAttributeNS(null, 'transform', t);
        }
        if (cssClass) {
            path.classList.add(cssClass);
        }
        g.appendChild(path);
        return path;
    };
    TileLevel.prototype.tileRectangle = function (g, x, y, w, h, rx, ry, cssClass) {
        var rect = document.createElementNS(this.svgns, 'rect');
        rect.setAttributeNS(null, 'x', '' + x);
        rect.setAttributeNS(null, 'y', '' + y);
        rect.setAttributeNS(null, 'height', '' + h);
        rect.setAttributeNS(null, 'width', '' + w);
        if (rx) {
            rect.setAttributeNS(null, 'rx', '' + rx);
        }
        if (ry) {
            rect.setAttributeNS(null, 'ry', '' + ry);
        }
        if (cssClass) {
            rect.classList.add(cssClass);
        }
        g.appendChild(rect);
        return rect;
    };
    TileLevel.prototype.tileLine = function (g, x1, y1, x2, y2, cssClass) {
        var line = document.createElementNS(this.svgns, 'line');
        line.setAttributeNS(null, 'x1', '' + x1);
        line.setAttributeNS(null, 'y1', '' + y1);
        line.setAttributeNS(null, 'x2', '' + x2);
        line.setAttributeNS(null, 'y2', '' + y2);
        if (cssClass) {
            line.classList.add(cssClass);
        }
        g.appendChild(line);
        return line;
    };
    TileLevel.prototype.tileText = function (g, x, y, html, cssClass) {
        var txt = document.createElementNS(this.svgns, 'text');
        txt.setAttributeNS(null, 'x', '' + x);
        txt.setAttributeNS(null, 'y', '' + y);
        if (cssClass) {
            txt.setAttributeNS(null, 'class', cssClass);
        }
        txt.innerHTML = html;
        g.appendChild(txt);
        return txt;
    };
    ;
    TileLevel.prototype.addElement = function (g, d, layerKind) {
        var element = null;
        if (d.draw == 'rectangle') {
            element = this.tileRectangle(g, d.x * this.tapSize, d.y * this.tapSize, d.w * this.tapSize, d.h * this.tapSize, d.rx * this.tapSize, d.ry * this.tapSize, d.css);
        }
        if (d.draw == 'text') {
            element = this.tileText(g, d.x * this.tapSize, d.y * this.tapSize, d.text, d.css);
        }
        if (d.draw == 'path') {
            element = this.tilePath(g, d.x * this.tapSize, d.y * this.tapSize, d.scale, d.points, d.css);
        }
        if (d.draw == 'line') {
            element = this.tileLine(g, d.x1 * this.tapSize, d.y1 * this.tapSize, d.x2 * this.tapSize, d.y2 * this.tapSize, d.css);
        }
        if (d.draw == 'group') {
            this.addGroupTile(g, d, layerKind);
        }
        if (element) {
            if (d.action) {
                //let e:any = element as any;
                //let e:TileSVGElement = element;
                element.onClickFunction = d.action;
                var me_1 = this;
                var click = function () {
                    if (me_1.clicked) {
                        if (element) {
                            if (element.onClickFunction) {
                                //console.log(element.getBoundingClientRect());
                                var xx = element.getBoundingClientRect().left - me_1.svg.getBoundingClientRect().left;
                                var yy = element.getBoundingClientRect().top - me_1.svg.getBoundingClientRect().top;
                                element.onClickFunction(me_1.translateZ * (me_1.clickX - xx) / me_1.tapSize, me_1.translateZ * (me_1.clickY - yy) / me_1.tapSize);
                            }
                        }
                    }
                };
                element.onclick = click;
                element.ontouchend = click;
            }
        }
    };
    TileLevel.prototype.outOfWatch = function (g, x, y, w, h) {
        var watchX = g.watchX;
        var watchY = g.watchY;
        var watchW = g.watchW;
        var watchH = g.watchH;
        return !(this.collision(watchX, watchY, watchW, watchH, x, y, w, h));
    };
    TileLevel.prototype.collision = function (x1, y1, w1, h1, x2, y2, w2, h2) {
        if (this.collision2(x1, w1, x2, w2) && this.collision2(y1, h1, y2, h2)) {
            return true;
        }
        else {
            return false;
        }
    };
    TileLevel.prototype.collision2 = function (x, w, left, width) {
        if (x + w <= left || x >= left + width) {
            return false;
        }
        else {
            return true;
        }
    };
    TileLevel.prototype.vectorFromTouch = function (touch) {
        return {
            x: touch.clientX,
            y: touch.clientY
        };
    };
    TileLevel.prototype.vectorDistance = function (xy1, xy2) {
        var xy = this.vectorSubstract(xy1, xy2);
        var n = this.vectorNorm(xy);
        return n;
    };
    TileLevel.prototype.vectorSubstract = function (xy1, xy2) {
        return {
            x: xy1.x - xy2.x,
            y: xy1.y - xy2.y
        };
    };
    TileLevel.prototype.vectorNorm = function (xy) {
        return Math.sqrt(this.vectorNormSquared(xy));
    };
    TileLevel.prototype.vectorNormSquared = function (xy) {
        return xy.x * xy.x + xy.y * xy.y;
    };
    TileLevel.prototype.vectorFindCenter = function (xy1, xy2) {
        var xy = this.vectorAdd(xy1, xy2);
        return this.vectorScale(xy, 0.5);
    };
    ;
    TileLevel.prototype.vectorAdd = function (xy1, xy2) {
        return {
            x: xy1.x + xy2.x,
            y: xy1.y + xy2.y
        };
    };
    ;
    TileLevel.prototype.vectorScale = function (xy, coef) {
        return {
            x: xy.x * coef,
            y: xy.y * coef
        };
    };
    ;
    TileLevel.prototype.childExists = function (group, id) {
        //console.log('childExists',group, id);
        //console.dir(group);
        this.msEdgeHook(group);
        for (var i = 0; i < group.children.length; i++) {
            var child = group.children[i];
            if (child.id == id) {
                return child;
            }
        }
        return null;
    };
    TileLevel.prototype.startLoop = function () {
        var last = new Date().getTime();
        var me = this;
        var step = function () {
            var now = new Date().getTime();
            if (last + 222 < now) {
                if (!(me.valid)) {
                    me.queueTiles();
                }
                last = new Date().getTime();
            }
            window.requestAnimationFrame(step);
        };
        step();
    };
    return TileLevel;
}());
