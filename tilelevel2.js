console.log('tilelevel.js v2.07');

function LevelEngine(svg, group) {
	var me = this;
	me.svgns = "http://www.w3.org/2000/svg";
	me.svg = svg;
	me.group = group;
	//me.left = 0;
	//me.top = 0;
	me.width = me.svg.clientWidth;
	me.height = me.svg.clientHeight;
	me.innerWidth = me.width;
	me.innerHeight = me.height;
	//me.zoom = 1;
	me.pxCmRatio = 1;
	me.twoZoom = false;
	me.startMouseScreenX = 0;
	me.startMouseScreenY = 0;
	me.clickX = 0;
	me.clickY = 0;
	me.clicked = false;
	me.translateX = 0;
	me.translateY = 0;
	me.translateZ = 1;
	me.twodistance = 0;
	me.startedTouch = false;
	var rect = document.createElementNS(this.svgns, 'rect');
	rect.setAttributeNS(null, 'height', '1cm');
	rect.setAttributeNS(null, 'width', '1cm');
	me.svg.appendChild(rect);
	var tbb = rect.getBBox();
	me.tapSize = tbb.width;
	//console.dir(me.tapSize);
	me.svg.removeChild(rect);
	me.applyZoomPosition = function () {
		me.svg.setAttribute('viewBox', '' + (-me.translateX) + ' ' + (-me.translateY) + ' ' + me.width * me.translateZ + ' ' + me.height * me.translateZ);
	};
	me.adjustContentPosition = function () {
		//me.left=-me.translateX;
		//me.top=-me.translateY;
		//me.zoom=me.translateZ;
		//console.log('adjustContentPosition', me.translateX, me.translateY, me.translateZ, '/', me.width, me.height, '/', me.innerWidth, me.innerHeight);
		if (me.width - me.translateX / me.translateZ > me.innerWidth / me.translateZ) {
			me.translateX = me.width * me.translateZ - me.innerWidth;
		}
		if (me.height - me.translateY / me.translateZ > me.innerHeight / me.translateZ) {
			me.translateY = me.height * me.translateZ - me.innerHeight;
		}
		if (me.translateX > 0) {
			me.translateX = 0;
		}
		if (me.translateY > 0) {
			me.translateY = 0;
		}
		if (me.translateZ < 1) {
			me.translateZ = 1;
		}
		me.applyZoomPosition();
	};
	me.moveZoom = function () {
		//me.left=-me.translateX;
		//me.top=-me.translateY;
		//me.zoom=me.translateZ;
		//console.log('moveZoom',me.left,me.top,me.zoom);
		me.applyZoomPosition();
	};
	me.queueTiles = function () {
		//
	};
	me.click = function () {
		//alert('click svg');
		me.clicked = true;
	};
	me.maxZoom = function () {
		return 99;
	};
	me.rakeMouseDown = function (mouseEvent) {
		mouseEvent.preventDefault();
		me.svg.addEventListener('mousemove', me.rakeMouseMove, true);
		me.svg.addEventListener('mouseup', me.rakeMouseUp, false);
		me.startMouseScreenX = mouseEvent.offsetX;
		me.startMouseScreenY = mouseEvent.offsetY;
		me.clickX = me.startMouseScreenX;
		me.clickY = me.startMouseScreenY;
		//console.log('rakeMouseDown',me.startMouseScreenX,me.startMouseScreenY);
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
		me.moveZoom();
	};
	me.rakeMouseUp = function (mouseEvent) {
		mouseEvent.preventDefault();
		me.svg.removeEventListener('mousemove', me.rakeMouseMove, true);
		if (Math.abs(me.clickX - mouseEvent.offsetX) < me.translateZ * me.tapSize / 8 //
			 && Math.abs(me.clickY - mouseEvent.offsetY) < me.translateZ * me.tapSize / 8) {
			me.click();
		}
		me.adjustContentPosition();
		me.queueTiles();
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
				me.moveZoom();
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
				me.adjustContentPosition();
			}
		}
	};
	me.rakeTouchEnd = function (touchEvent) {
		touchEvent.preventDefault();
		me.queueTiles();
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
				me.adjustContentPosition();
				return;
			}
		}
		me.twoZoom = false;
		me.startedTouch = false;
		me.adjustContentPosition();
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
		me.queueTiles();
		return false;
	};
	me.msEdgeHook = function (g) {
		if (g.childNodes && (!(g.children))) {
			g.children = g.childNodes;
		}
	};
	me.tileRectangle = function (g, x, y, w, h, className) {
		var rect = document.createElementNS(this.svgns, 'rect');
		rect.setAttributeNS(null, 'x', x);
		rect.setAttributeNS(null, 'y', y);
		rect.setAttributeNS(null, 'height', h);
		rect.setAttributeNS(null, 'width', w);
		if (className) {
			rect.classList.add(className);
		}
		g.appendChild(rect);
		return rect;
	};
	me.addRakeDetails = function () {
		var x = -me.translateX;
		var y = -me.translateY;
		var w = me.svg.clientWidth * me.translateZ;
		var h = me.svg.clientHeight * me.translateZ;
	};
	me.rakeGroup = function (id, x, y, w, h) {
		if (me.collision(x, y, w, h, -me.translateX, -me.translateY, me.svg.clientWidth * me.translateZ, me.svg.clientHeight * me.translateZ)) {
			if (!me.childExists(id)) {
				var g = document.createElementNS(me.svgns, 'g');
				g.id = id;
				me.group.appendChild(g);
				return g;
			}
		}
		return null;
	};
	me.childExists = function (id) {
		me.msEdgeHook(me.group);
		for (var i = 0; i < me.group.children.length; i++) {
			var child = me.group.children[i];
			if (child.id == id) {
				return true;
			}
		}
		return false;
	};
	me.clearUselessDetails = function () {
		var x = -me.translateX;
		var y = -me.translateY;
		var w = me.svg.clientWidth * me.translateZ;
		var h = me.svg.clientHeight * me.translateZ;
		me.msEdgeHook(me.group);
		for (var i = 0; i < me.group.children.length; i++) {
			var child = me.group.children[i];
			//console.log('check child', child, x, y, w, h);
			if (me.outOfView(child, x, y, w, h)) {
				//console.log('remove child', child);
				me.group.removeChild(child);
				i--;
			}
		}
	};
	/*me.clearUselessNodes = function (x, y, w, h,group) {
	me.msEdgeHook(group);
	console.log('check',group);
	if (me.outOfView(group, x, y, w, h)) {
	//me.g.removeChild(group);
	}
	};*/
	me.outOfView = function (child, x, y, w, h) {
		var tbb = child.getBBox();
		//console.log('check', tbb);
		return !(me.collision(tbb.x, tbb.y, tbb.width, tbb.height, x, y, w, h));
	};
	me.collision = function (x1, y1, w1, h1, x2, y2, w2, h2) {
		if (this.collision2(x1, w1, x2, w2) && this.collision2(y1, h1, y2, h2)) {
			return true;
		} else {
			return false;

		}
	};
	me.collision2 = function (x, w, left, width) {
		if (x + w <= left || x >= left + width) {
			return false;
		} else {
			return true;

		}
	};
	me.svg.addEventListener('mousedown', me.rakeMouseDown, false);
	me.svg.addEventListener("mousewheel", me.rakeMouseWheel, false);
	me.svg.addEventListener("DOMMouseScroll", me.rakeMouseWheel, false);
	me.svg.addEventListener("touchstart", me.rakeTouchStart, false);
	me.svg.addEventListener("touchmove", me.rakeTouchMove, false);
	me.svg.addEventListener("touchend", me.rakeTouchEnd, false);

	return me;
}
