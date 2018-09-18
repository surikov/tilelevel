console.log('tilelevel.js v2.07');

function LevelEngine(svg) {
	var me = this;
	me.svgns = "http://www.w3.org/2000/svg";
	me.svg = svg;

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
	//console.dir(me.tapSize);
	me.svg.removeChild(rect);
	me.applyZoomPosition = function () {
		me.svg.setAttribute('viewBox', '' + (-me.translateX) + ' ' + (-me.translateY) + ' ' + me.width * me.translateZ + ' ' + me.height * me.translateZ);
	};
	me.setModel = function (model) {
		me.model = model;
		me.valid = false;
	}
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
		var now = new Date().getTime();
		console.log('queueTiles',new Date());
		me.clearUselessDetails();
		me.tileFromModel();
		console.log('delay',(new Date().getTime()-now)/1000,'sec');
	};
	me.click = function () {
		//alert('click svg');
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
		//me.queueTiles();
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
		//me.queueTiles();
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
				me.valid = false;
				return;
			}
		}
		me.twoZoom = false;
		me.startedTouch = false;
		me.adjustContentPosition();
		me.valid = false;
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
		//me.queueTiles();
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

	/*me.tileFromArray = function (arr) {
	for (var i = 0; i < arr.length; i++) {
	var a = arr[i];
	//console.log(arr[i]);
	var g = me.rakeGroup(a.id, a.x, a.y, a.w, a.h);
	//console.log(a.id);
	if (g) {
	for (var n = 0; n < a.l.length; n++) {
	var o = a.l[n];
	//console.log(o.o[0]);
	for (var k = 0; k < o.o.length; k++) {
	var d = o.o[k];
	//console.log(d);
	if(d.kind=='r'){
	me.tileRectangle(g, d.x, d.y, d.w, d.h, d.rx, d.ry,d.css);
	}
	if(d.kind=='t'){
	me.tileText(g, d.x, d.y, d.t,d.css);
	}
	if(d.kind=='p'){
	me.tilePath(g, d.x, d.y, d.z,d.l,d.css);
	}
	if(d.kind=='l'){
	me.tileLine(g, d.x1, d.y1, d.x2, d.y2,d.css);
	}
	}
	}
	}
	}
	};*/
	me.clearUselessDetails = function () {
		//console.log('clearUselessDetails');
		var cntr=0;
		if (me.model) {
			for (var k = 0; k < me.model.length; k++) {
				var group = me.model[k].g;
				var x = -me.translateX;
				var y = -me.translateY;
				var w = me.svg.clientWidth * me.translateZ;
				var h = me.svg.clientHeight * me.translateZ;
				me.msEdgeHook(group);
				for (var i = 0; i < group.children.length; i++) {
					var child = group.children[i];
					//console.log('check child', child, x, y, w, h);
					//if (me.outOfView(child, x, y, w, h) || child.minZoom > me.translateZ || child.maxZoom <= me.translateZ) {
					if (me.outOfWatch(child, x, y, w, h) || child.minZoom > me.translateZ || child.maxZoom <= me.translateZ) {	
						//console.log('remove child', child, x, y, w, h, me.outOfWatch(child, x, y, w, h),child.getBoundingClientRect());
						group.removeChild(child);
						cntr++;
						i--;
					}
				}
			}
		}
		console.log('removed',cntr,'objects');
	};
	me.tileFromModel = function () {
		//console.log(me.model);
		var cntr=0;
		if (me.model) {
			for (var k = 0; k < me.model.length; k++) {
				//console.log('model',k);
				var group = me.model[k].g;
				var arr = me.model[k].m;
				//console.log(group);
				for (var i = 0; i < arr.length; i++) {
					var a = arr[i];
					//console.log(me.translateZ,a);
					if (a.z[0] <= me.translateZ && a.z[1] > me.translateZ) {
						var g = me.rakeGroup(group, a.id, a.x * me.tapSize, a.y * me.tapSize, a.w * me.tapSize, a.h * me.tapSize);
						//console.log(a.id,a.x * me.tapSize, a.y * me.tapSize, a.w * me.tapSize, a.h * me.tapSize);
						if (g) {
							g.minZoom = a.z[0];
							g.maxZoom = a.z[1];
							//console.log(g.minZoom,g.maxZoom,g);
							for (var n = 0; n < a.l.length; n++) {
								var d = a.l[n];
								//console.log(d);
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
								if (element) {
									if (d.a) {
										//console.log(d.a);
										element.onClickFunction = d.a;
										element.onclick = function () {
											if (me.clicked) {
												if (element) {
													if (element.onClickFunction) {
														element.onClickFunction();
													}
												}
											}
										}
										element.ontouchend = element.onclick
									}
								}
							}
							cntr++;
						}
					}
				}
			}
		}
		me.valid = true;
		console.log('added',cntr,'objects');
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
		//console.log('tileSongName',html);
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
	me.rakeGroup = function (group, id, x, y, w, h) {
		if (me.collision(x, y, w, h, -me.translateX, -me.translateY, me.svg.clientWidth * me.translateZ, me.svg.clientHeight * me.translateZ)) {
			if (!me.childExists(group, id)) {
				var g = document.createElementNS(me.svgns, 'g');
				g.id = id;
				g.watchX=x;
				g.watchY=y;
				g.watchW=w;
				g.watchH=h;
				group.appendChild(g);
				return g;
			}
		}
		return null;
	};
	me.childExists = function (group, id) {
		me.msEdgeHook(group);
		for (var i = 0; i < group.children.length; i++) {
			var child = group.children[i];
			if (child.id == id) {
				return true;
			}
		}
		return false;
	};
	me.clearAllDetails = function () {
		if (me.model) {
			for (var i = 0; i < me.model.length; i++) {
				var group = me.model[i].g;
				me.msEdgeHook(group);
				while (me.group.children.length) {
					//console.log(me.group.children[0]);
					me.group.removeChild(group.children[0]);
				}
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
	me.outOfWatch = function (g, x, y, w, h) {
		//var tbb = child.getBBox();
		//console.log('check', tbb);
		return !(me.collision(g.watchX, g.watchY, g.watchW, g.watchH, x, y, w, h));
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
	me.startLoop = function () {
		var last = new Date().getTime();
		var step = function (timestamp) {
			var now = new Date().getTime();
			//console.log(last,now);
			if (last + 222 < now) {
				//console.log('letsgo',last);
				if(!(me.valid)){
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
