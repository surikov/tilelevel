console.log('tilelevel.js v2.09');

function LevelEngine(svg) {
	var me = this;
	me.svgns = "http://www.w3.org/2000/svg";
	me.svg = svg;
	me.width = me.svg.clientWidth;
	me.height = me.svg.clientHeight;
	me.innerWidth = me.width;
	me.innerHeight = me.height;
	me.pxCmRatio = 1;
	me.twoZoom = false;
	me.startMouseScreenX = 0;
	me.startMouseScreenY = 0;
	me.clickX = 0;
	me.clickY = 0;
	me.clicked = false;
	me.valid = false;
	me.translateX = 0;
	me.translateY = 0;
	me.translateZ = 1;
	me.twodistance = 0;
	me.startedTouch = false;
	me.mx = 100;
	var rect = document.createElementNS(this.svgns, 'rect');
	rect.setAttributeNS(null, 'height', '1cm');
	rect.setAttributeNS(null, 'width', '1cm');
	me.svg.appendChild(rect);
	var tbb = rect.getBBox();
	me.tapSize = tbb.width;
	me.svg.removeChild(rect);
	me.applyZoomPosition = function () {
		me.svg.setAttribute('viewBox', '' + (-me.translateX) + ' ' + (-me.translateY) + ' ' + me.width * me.translateZ + ' ' + me.height * me.translateZ);
		if (me.model) {
			for (var k = 0; k < me.model.length; k++) {
				var m = me.model[k];
				var tx = 0;
				var ty = 0;
				var tz = 1;
				if (m.lockX) {
					tx = -me.translateX;
				}
				if (m.lockY) {
					ty = -me.translateY;
				}
				if (m.lockZ) {
					tz = me.translateZ;
				}
				m.g.setAttribute('transform', 'translate(' + tx + ',' + ty + ') scale(' + tz + ',' + tz + ')');
			}
		}
	};
	me.setModel = function (model) {
		me.model = model;
		me.valid = false;
	}
	me.adjustContentPosition = function () {

		if (me.translateX > 0) {
			me.translateX = 0;
		} else {
			if (me.width - me.translateX / me.translateZ > me.innerWidth / me.translateZ && me.width) {
				if (me.innerWidth / me.translateZ) {
					me.translateX = me.width * me.translateZ - me.innerWidth;
				} else {
					me.translateX = 0;
				}

			}
		}
		if (me.translateY > 0) {
			me.translateY = 0;
		} else {
			if (me.height - me.translateY / me.translateZ > me.innerHeight / me.translateZ) {
				if (me.height <= me.innerHeight / me.translateZ) {
					me.translateY = me.height * me.translateZ - me.innerHeight;
				} else {
					me.translateY = 0;
				}
			}
		}
		if (me.translateZ < 1) {
			me.translateZ = 1;
		} else {
			if (me.translateZ > me.mx) {
				me.translateZ = me.mx;
			}
		}
		me.applyZoomPosition();
	};
	me.slidetContentPosition = function () {
		var vX = me.translateX;
		var vY = me.translateY;
		var vZ = me.translateZ;
		//var wrong = 0;

		if (me.translateX > 0) {
			vX = 0;
			//wrong = 1;
		} else {
			if (me.width - me.translateX / me.translateZ > me.innerWidth / me.translateZ) {
				if (me.width * me.translateZ - me.innerWidth <= 0) {
					vX = me.width * me.translateZ - me.innerWidth;
					//wrong = 2;
				} else {
					vX = 0;
				}
			}
		}
		if (me.translateY > 0) {
			vY = 0;
			//wrong = 3;
		} else {
			//console.log(me.height - me.translateY / me.translateZ , me.innerHeight / me.translateZ,me.height ,me.innerHeight / me.translateZ);
			if (me.height - me.translateY / me.translateZ > me.innerHeight / me.translateZ) {
				if (me.height * me.translateZ - me.innerHeight <= 0) {
					vY = me.height * me.translateZ - me.innerHeight;
					//wrong = 4;
				} else {
					vY = 0;
				}
			}
		}
		if (me.translateZ < 1) {
			vZ = 1;
			//wrong = 5;
		} //else {
		if (me.translateZ > me.mx) {
			vZ = me.mx;
			//wrong = 6;
		}
		//}
		console.log(me.translateX, me.translateY, me.translateZ, '=>', vX, vY, vZ);
		if (vX != me.translateX || vY != me.translateY || vZ != me.translateZ) {
			console.log('startSlideTo');
			me.startSlideTo(vX, vY, vZ);
		}
	};
	me.moveZoom = function () {
		me.applyZoomPosition();
	};
	me.queueTiles = function () {
		me.clearUselessDetails();
		me.tileFromModel();
	};

	me.click = function () {
		me.clicked = true;
	};
	me.maxZoom = function () {
		return me.mx;
	};
	me.rakeMouseDown = function (mouseEvent) {
		mouseEvent.preventDefault();
		me.svg.addEventListener('mousemove', me.rakeMouseMove, true);
		me.svg.addEventListener('mouseup', me.rakeMouseUp, false);
		me.startMouseScreenX = mouseEvent.offsetX;
		me.startMouseScreenY = mouseEvent.offsetY;
		me.clickX = me.startMouseScreenX;
		me.clickY = me.startMouseScreenY;
		me.clicked = false;
	};
	me.rakeMouseMove = function (mouseEvent) {
		mouseEvent.preventDefault();
		var dX = mouseEvent.offsetX - me.startMouseScreenX;
		var dY = mouseEvent.offsetY - me.startMouseScreenY;
		me.translateX = me.translateX + dX * me.translateZ;
		me.translateY = me.translateY + dY * me.translateZ;
		me.startMouseScreenX = mouseEvent.offsetX;
		me.startMouseScreenY = mouseEvent.offsetY;
		//me.moveZoom();
		me.applyZoomPosition();
	};
	me.rakeMouseUp = function (mouseEvent) {
		mouseEvent.preventDefault();
		me.svg.removeEventListener('mousemove', me.rakeMouseMove, true);
		if (Math.abs(me.clickX - mouseEvent.offsetX) < me.translateZ * me.tapSize / 8 //
			 && Math.abs(me.clickY - mouseEvent.offsetY) < me.translateZ * me.tapSize / 8) {
			me.click();
		}
		//me.adjustContentPosition();
		me.slidetContentPosition();
		me.valid = false;
	};
	me.vectorDistance = function (xy1, xy2) {
		var xy = me.vectorSubstract(xy1, xy2);
		var n = me.vectorNorm(xy);
		return n;
	};
	me.vectorSubstract = function (xy1, xy2) {
		return {
			x: xy1.x - xy2.x,
			y: xy1.y - xy2.y
		};
	};
	me.vectorNorm = function (xy) {
		return Math.sqrt(me.vectorNormSquared(xy));
	};
	me.vectorNormSquared = function (xy) {
		return xy.x * xy.x + xy.y * xy.y;
	};
	me.vectorFromTouch = function (touch) {
		return {
			x: touch.clientX,
			y: touch.clientY
		};
	};
	me.vectorFindCenter = function (xy1, xy2) {
		var xy = me.vectorAdd(xy1, xy2);
		return me.vectorScale(xy, 0.5);
	};
	me.vectorAdd = function (xy1, xy2) {
		return {
			x: xy1.x + xy2.x,
			y: xy1.y + xy2.y
		};
	};
	me.vectorScale = function (xy, coef) {
		return {
			x: xy.x * coef,
			y: xy.y * coef
		};
	};
	me.startTouchZoom = function (touchEvent) {
		me.twoZoom = true;
		var p1 = me.vectorFromTouch(touchEvent.touches[0]);
		var p2 = me.vectorFromTouch(touchEvent.touches[1]);
		me.twocenter = me.vectorFindCenter(p1, p2);
		var d = me.vectorDistance(p1, p2);
		if (d <= 0) {
			d = 1;
		}
		me.twodistance = d;
	};
	me.rakeTouchStart = function (touchEvent) {
		touchEvent.preventDefault();
		me.startedTouch = true;
		if (touchEvent.touches.length < 2) {
			me.twoZoom = false;
			me.startMouseScreenX = touchEvent.touches[0].clientX;
			me.startMouseScreenY = touchEvent.touches[0].clientY;
			me.clickX = me.startMouseScreenX;
			me.clickY = me.startMouseScreenY;
			me.twodistance = 0;
			return;
		} else {
			me.startTouchZoom(touchEvent);
		}
		me.clicked = false;
	};
	me.rakeTouchMove = function (touchEvent) {
		touchEvent.preventDefault();
		if (touchEvent.touches.length < 2) {
			if (me.twoZoom) {
				//
			} else {
				var dX = touchEvent.touches[0].clientX - me.startMouseScreenX;
				var dY = touchEvent.touches[0].clientY - me.startMouseScreenY;
				me.translateX = me.translateX + dX * me.translateZ;
				me.translateY = me.translateY + dY * me.translateZ;
				me.startMouseScreenX = touchEvent.touches[0].clientX;
				me.startMouseScreenY = touchEvent.touches[0].clientY;
				//me.moveZoom();
				me.applyZoomPosition();
				return;
			}
		} else {
			if (!me.twoZoom) {
				me.startTouchZoom(touchEvent);
			} else {
				var p1 = me.vectorFromTouch(touchEvent.touches[0]);
				var p2 = me.vectorFromTouch(touchEvent.touches[1]);
				var d = me.vectorDistance(p1, p2);
				if (d <= 0) {
					d = 1;
				}
				var ratio = d / me.twodistance;
				me.twodistance = d;
				var zoom = me.translateZ / ratio;
				if (zoom < 1) {
					zoom = 1;
				}
				if (zoom > me.maxZoom()) {
					zoom = me.maxZoom();
				}
				me.translateX = me.translateX - (me.translateZ - zoom) * me.twocenter.x;
				me.translateY = me.translateY - (me.translateZ - zoom) * me.twocenter.y;
				me.translateZ = zoom;
				//me.adjustContentPosition();
				me.applyZoomPosition();
			}
		}
	};
	me.rakeTouchEnd = function (touchEvent) {
		touchEvent.preventDefault();
		me.valid = false;
		if (!me.twoZoom) {
			if (touchEvent.touches.length < 2) {
				if (me.startedTouch) {
					if (Math.abs(me.clickX - me.startMouseScreenX) < me.translateZ * me.tapSize / 8 //
						 && Math.abs(me.clickY - me.startMouseScreenY) < me.translateZ * me.tapSize / 8) {
						me.click();
					}
				} else {
					//console.log('touch ended already');
				}
				//me.adjustContentPosition();
				me.slidetContentPosition();
				//me.valid = false;
				return;
			}
		}
		me.twoZoom = false;
		me.startedTouch = false;
		//me.adjustContentPosition();
		me.slidetContentPosition();
		//me.valid = false;
	};
	me.rakeMouseWheel = function (e) {
		e.preventDefault();
		var wheelVal = e.wheelDelta || -e.detail;
		var min = Math.min(1, wheelVal);
		var delta = Math.max(-1, min);
		var zoom = me.translateZ + delta * (me.translateZ) * 0.077;
		if (zoom < 1) {
			zoom = 1;
		}
		if (zoom > me.maxZoom()) {
			zoom = me.maxZoom();
		}
		me.translateX = me.translateX - (me.translateZ - zoom) * e.offsetX;
		me.translateY = me.translateY - (me.translateZ - zoom) * e.offsetY;
		me.translateZ = zoom;
		me.moveZoom();
		me.adjustContentPosition();
		me.valid = false;
		return false;
	};
	me.msEdgeHook = function (g) {
		if (g.childNodes && (!(g.children))) {
			g.children = g.childNodes;
		}
	};
	me.tileGroup = function (g) {
		var gg = document.createElementNS(me.svgns, 'g');
		g.appendChild(gg);
		return gg;
	};
	me.clearUselessDetails = function () {
		if (me.model) {
			for (var k = 0; k < me.model.length; k++) {
				var group = me.model[k].g;
				me.clearUselessGroups(group, me.model[k].lockX, me.model[k].lockY, me.model[k].lockZ);
			}
		}
	};
	me.clearUselessGroups = function (group, lx, ly, lz) {
		var x = -me.translateX;
		var y = -me.translateY;
		var w = me.svg.clientWidth * me.translateZ;
		var h = me.svg.clientHeight * me.translateZ;
		if (lx) {
			x = 0;
		}
		if (ly) {
			y = 0;
		}
		if (lz) {
			if (!(lx)) {
				x = -me.translateX / me.translateZ;
				w = me.svg.clientWidth;
			}
			if (!(ly)) {
				y = -me.translateY / me.translateZ;
				h = me.svg.clientHeight;
			}
		}
		me.msEdgeHook(group);
		for (var i = 0; i < group.children.length; i++) {
			var child = group.children[i];
			if (me.outOfWatch(child, x, y, w, h) || child.minZoom > me.translateZ || child.maxZoom <= me.translateZ) {
				group.removeChild(child);
				i--;
			} else {
				if (child.localName == 'g') {
					me.clearUselessGroups(child, lx, ly, lz);
				}
			}
		}
	};
	me.tileFromModel = function () {
		if (me.model) {
			for (var k = 0; k < me.model.length; k++) {
				var group = me.model[k].g;
				var arr = me.model[k].m;
				for (var i = 0; i < arr.length; i++) {
					var a = arr[i];
					me.addGroupTile(group, a, me.model[k].lockX, me.model[k].lockY, me.model[k].lockZ);
				}
			}
		}
		me.valid = true;
	};
	me.addGroupTile = function (parentGroup, definitions, lx, ly, lz) {
		var x = -me.translateX;
		var y = -me.translateY;
		var w = me.svg.clientWidth * me.translateZ;
		var h = me.svg.clientHeight * me.translateZ;
		if (lx) {
			x = 0;
		}
		if (ly) {
			y = 0;
		}
		if (lz) {
			if (!(lx)) {
				x = -me.translateX / me.translateZ;
				w = me.svg.clientWidth;
			}
			if (!(ly)) {
				y = -me.translateY / me.translateZ;
				h = me.svg.clientHeight;
			}
		}
		if (definitions.z[0] <= me.translateZ && definitions.z[1] > me.translateZ) {
			if (me.collision(definitions.x * me.tapSize, definitions.y * me.tapSize, definitions.w * me.tapSize, definitions.h * me.tapSize //
				, x, y, w, h)) {
				var xg = me.childExists(parentGroup, definitions.id);
				if (xg) {
					for (var n = 0; n < definitions.l.length; n++) {
						var d = definitions.l[n];
						if (d.kind == 'g') {
							me.addElement(xg, d, lx, ly, lz);
						}
					}
				} else {
					var g = document.createElementNS(me.svgns, 'g');
					g.id = definitions.id;
					g.watchX = definitions.x * me.tapSize;
					g.watchY = definitions.y * me.tapSize;
					g.watchW = definitions.w * me.tapSize;
					g.watchH = definitions.h * me.tapSize;
					parentGroup.appendChild(g);
					g.minZoom = definitions.z[0];
					g.maxZoom = definitions.z[1];
					for (var n = 0; n < definitions.l.length; n++) {
						var d = definitions.l[n];
						me.addElement(g, d, lx, ly, lz);
					}
				}
			}
		}
	};
	me.addElement = function (g, d, lx, ly, lz) {
		var element = null;
		if (d.kind == 'r') {
			element = me.tileRectangle(g, d.x * me.tapSize, d.y * me.tapSize, d.w * me.tapSize, d.h * me.tapSize, d.rx * me.tapSize, d.ry * me.tapSize, d.css);
		}
		if (d.kind == 't') {
			element = me.tileText(g, d.x * me.tapSize, d.y * me.tapSize, d.t, d.css);
		}
		if (d.kind == 'p') {
			element = me.tilePath(g, d.x * me.tapSize, d.y * me.tapSize, d.z, d.l, d.css);
		}
		if (d.kind == 'l') {
			element = me.tileLine(g, d.x1 * me.tapSize, d.y1 * me.tapSize, d.x2 * me.tapSize, d.y2 * me.tapSize, d.css);
		}
		if (d.kind == 'g') {
			me.addGroupTile(g, d, lx, ly, lz);
		}
		if (element) {
			if (d.a) {
				element.onClickFunction = d.a;
				element.onclick = function () {
					if (me.clicked) {
						if (element) {
							if (element.onClickFunction) {
								var xx = element.getBoundingClientRect().x - me.svg.getBoundingClientRect().x;
								var yy = element.getBoundingClientRect().y - me.svg.getBoundingClientRect().y;
								element.onClickFunction(me.translateZ * (me.clickX - xx) / me.tapSize, me.translateZ * (me.clickY - yy) / me.tapSize);
							}
						}
					}
				}
				element.ontouchend = element.onclick
			}
		}
	};
	me.tilePath = function (g, x, y, z, data, cssClass) {
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
	me.tileRectangle = function (g, x, y, w, h, rx, ry, cssClass) {
		var rect = document.createElementNS(me.svgns, 'rect');
		rect.setAttributeNS(null, 'x', x);
		rect.setAttributeNS(null, 'y', y);
		rect.setAttributeNS(null, 'height', h);
		rect.setAttributeNS(null, 'width', w);
		if (rx) {
			rect.setAttributeNS(null, 'rx', rx);
		}
		if (ry) {
			rect.setAttributeNS(null, 'ry', ry);
		}
		if (cssClass) {
			rect.classList.add(cssClass);
		}
		g.appendChild(rect);
		return rect;
	};
	me.tileLine = function (g, x1, y1, x2, y2, cssClass) {
		var line = document.createElementNS(me.svgns, 'line');
		line.setAttributeNS(null, 'x1', x1);
		line.setAttributeNS(null, 'y1', y1);
		line.setAttributeNS(null, 'x2', x2);
		line.setAttributeNS(null, 'y2', y2);
		if (cssClass) {
			line.classList.add(cssClass);
		}
		g.appendChild(line);
		return line;
	};
	me.tileText = function (g, x, y, html, cssClass) {
		var txt = document.createElementNS(this.svgns, 'text');
		txt.setAttributeNS(null, 'x', x);
		txt.setAttributeNS(null, 'y', y);
		if (cssClass) {
			txt.setAttributeNS(null, 'class', cssClass);
		}
		txt.innerHTML = html;
		g.appendChild(txt);
		return txt;
	};
	me.addRakeDetails = function () {
		var x = -me.translateX;
		var y = -me.translateY;
		var w = me.svg.clientWidth * me.translateZ;
		var h = me.svg.clientHeight * me.translateZ;
	};

	me.childExists = function (group, id) {
		me.msEdgeHook(group);
		for (var i = 0; i < group.children.length; i++) {
			var child = group.children[i];
			if (child.id == id) {
				return child;
			}
		}
		return null;
	};
	me.clearAllDetails = function () {
		if (me.model) {
			for (var i = 0; i < me.model.length; i++) {
				var group = me.model[i].g;
				me.msEdgeHook(group);
				while (me.group.children.length) {
					me.group.removeChild(group.children[0]);
				}
			}
		}
	};
	me.outOfView = function (child, x, y, w, h) {
		var tbb = child.getBBox();
		return !(me.collision(tbb.x, tbb.y, tbb.width, tbb.height, x, y, w, h));
	};
	me.outOfWatch = function (g, x, y, w, h) {
		return !(me.collision(g.watchX, g.watchY, g.watchW, g.watchH, x, y, w, h));
	};
	me.collision = function (x1, y1, w1, h1, x2, y2, w2, h2) {
		if (this.collision2(x1, w1, x2, w2) && this.collision2(y1, h1, y2, h2)) {
			return true;
		} else {
			return false;

		}
	};
	me.startSlideTo = function (x, y, z) {

		var stepCount = 10;
		var dx = (x - me.translateX) / stepCount;
		var dy = (y - me.translateY) / stepCount;
		var dz = (z - me.translateZ) / stepCount;
		var xyz = [];
		for (var i = 0; i < stepCount; i++) {
			xyz.push({
				x: me.translateX + dx * i,
				y: me.translateY + dy * i,
				z: me.translateZ + dz * i
			});
		}
		xyz.push({
			x: x,
			y: y,
			z: z
		});
		me.stepSlideTo(xyz);
	};
	me.stepSlideTo = function (xyz) {
		var n = xyz.shift();
		if (n) {
			me.translateX = n.x;
			me.translateY = n.y;
			me.translateZ = n.z;
			//me.adjustContentPosition();
			me.applyZoomPosition();
			var main = me;
			setTimeout(function () {
				main.stepSlideTo(xyz);
			}, 20);
		} else {
			me.adjustContentPosition();
			me.valid = true;
			me.queueTiles();
		}
	};
	me.collision2 = function (x, w, left, width) {
		if (x + w <= left || x >= left + width) {
			return false;
		} else {
			return true;

		}
	};
	me.startLoop = function () {
		var last = new Date().getTime();
		var step = function (timestamp) {
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
	me.svg.addEventListener('mousedown', me.rakeMouseDown, false);
	me.svg.addEventListener("mousewheel", me.rakeMouseWheel, false);
	me.svg.addEventListener("DOMMouseScroll", me.rakeMouseWheel, false);
	me.svg.addEventListener("touchstart", me.rakeTouchStart, false);
	me.svg.addEventListener("touchmove", me.rakeTouchMove, false);
	me.svg.addEventListener("touchend", me.rakeTouchEnd, false);
	me.startLoop();
	return me;
}
