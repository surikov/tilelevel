console.log('tilelevel.js v4.49');
let _tileLevel: TileLevel = null;
//enum LayerKind { normal, overlay, column, row };
type TileDefinition = {
	id: string
	, draw: string
	, css: string
	, x: number
	, y: number
	, w: number
	, h: number
	, action: (x: number, y: number) => void
	, z: number[]
	, scale: number
	, rx: number
	, ry: number
	, x1: number
	, x2: number
	, y1: number
	, y2: number
	, text: string
	, points: string//path definition
	, sub: TileDefinition[]
};
type TileSVGElement = SVGElement & {
	onClickFunction: (x: number, y: number) => void
	, watchX: number
	, watchY: number
	, watchW: number
	, watchH: number
	, minZoom: number
	, maxZoom: number
};
class TilePoint {
	x: number = 0;
	y: number = 0;
}
class TileZoom {
	x: number = 0;
	y: number = 0;
	z: number = 0;
}
class TileModelLayer {
	g: SVGElement = null;
	mode: string = 'normal';
	shift: number;
	//viceversa: boolean;
	definition: TileDefinition[] = [];
}
class TileLevel {
	svgns: string = "http://www.w3.org/2000/svg";
	svg: SVGElement = null;
	viewWidth: number = 0;
	viewHeight: number = 0;
	innerWidth: number = 0;
	innerHeight: number = 0;
	translateX: number = 0;
	translateY: number = 0;
	translateZ: number = 1;
	startedTouch: boolean = false;
	valid: boolean = false;
	clicked: boolean = false;
	mx: number = 100;
	startMouseScreenX: number = 0;
	startMouseScreenY: number = 0;
	dragZoom: number = 1;
	clickX: number = 0;
	clickY: number = 0;
	tapSize: number = 0;
	twoZoom: boolean = false;
	clickLimit: number = this.tapSize / 6;
	twodistance: number = 0;
	twocenter: TilePoint = null;
	model: TileModelLayer[] = [];
	layerLockX: string = 'lockX';
	layerNormal: string = 'normal';
	layerOverlay: string = 'overlay';
	layerLockY: string = 'lockY';
	layerStickBottom: string = 'stickBottom';
	layerStickRight: string = 'stickRight';
	constructor(contentElement: SVGElement) {
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
	setupTapSize() {
		let rect: Element = document.createElementNS(this.svgns, 'rect');
		rect.setAttributeNS(null, 'height', '1cm');
		rect.setAttributeNS(null, 'width', '1cm');
		this.svg.appendChild(rect);
		let tbb: DOMRect = (rect as SVGSVGElement).getBBox();
		this.tapSize = tbb.width;
		this.svg.removeChild(rect);
		this.clickLimit = this.tapSize / 6;
	}
	startDragZoom() {
		this.dragZoom = 1.01;
		this.applyZoomPosition();
	};
	cancelDragZoom() {
		this.dragZoom = 1.0;
		this.applyZoomPosition();
	};
	applyZoomPosition() {
		let rx: number = -this.translateX - this.dragZoom * this.translateZ * (this.viewWidth - this.viewWidth / this.dragZoom) * (this.clickX / this.viewWidth);
		let ry: number = -this.translateY - this.dragZoom * this.translateZ * (this.viewHeight - this.viewHeight / this.dragZoom) * (this.clickY / this.viewHeight);
		let rw: number = this.viewWidth * this.translateZ * this.dragZoom;
		let rh: number = this.viewHeight * this.translateZ * this.dragZoom;
		this.svg.setAttribute('viewBox', rx + ' ' + ry + ' ' + rw + ' ' + rh);
		if (this.model) {
			for (let k: number = 0; k < this.model.length; k++) {
				let layer: TileModelLayer = this.model[k];
				let tx: number = 0;
				let ty: number = 0;
				let tz: number = 1;
				let cX: number = 0;
				let cY: number = 0;
				let sX: number = 0;
				let sY: number = 0;
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
				} else {
					if (layer.mode == this.layerLockX) {
						tx = -this.translateX;
						cX = 0;
						if (layer.shift) {
							//let shiftX=layer.shiftX(this);
							sX = layer.shift * this.tapSize * this.translateZ;
						}
					} else {
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
						} else {
							if (layer.mode == this.layerStickBottom) {
								ty = -this.translateY;
								cY = 0;
								sY = this.viewHeight * this.translateZ;
								if (layer.shift) {
									sY = this.viewHeight * this.translateZ - layer.shift * this.tapSize;
								}
							}else{
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
	}
	setModel(layers: TileModelLayer[]) {
		this.model = layers;
		this.resetModel();

	}
	resetModel() {
		this.clearAllDetails();
		this.applyZoomPosition();
		this.adjustContentPosition();
		this.slideToContentPosition();
		this.valid = false;
	}
	adjustContentPosition() {
		let a = this.adjusted();
		if (a.x != this.translateX || a.y != this.translateY || a.z != this.translateZ) {
			this.translateX = a.x;
			this.translateY = a.y;
			this.translateZ = a.z;
			this.applyZoomPosition();
		}
	}
	slideToContentPosition() {
		let a = this.adjusted();
		if (a.x != this.translateX || a.y != this.translateY || a.z != this.translateZ) {
			this.startSlideTo(a.x, a.y, a.z, null);
		}
	}
	clearAllDetails() {
		if (this.model) {
			for (let i: number = 0; i < this.model.length; i++) {
				this.clearGroupDetails(this.model[i].g);
			}
		}
	}
	clearGroupDetails(group: SVGElement) {
		this.msEdgeHook(group);
		while (group.children.length) {
			group.removeChild(group.children[0]);
		}
	}
	msEdgeHook(g: SVGElement) {
		if (g.childNodes && (!(g.children))) {
			(g as any).children = g.childNodes;
		}
	}
	adjusted(): TileZoom {
		let vX: number = this.translateX;
		let vY: number = this.translateY;
		let vZ: number = this.translateZ;
		if (this.translateX > 0) {
			vX = 0;
		} else {
			if (this.viewWidth - this.translateX / this.translateZ > this.innerWidth / this.translateZ) {
				if (this.viewWidth * this.translateZ - this.innerWidth <= 0) {
					vX = this.viewWidth * this.translateZ - this.innerWidth;
				} else {
					vX = 0;
				}
			}
		}
		if (this.translateY > 0) {
			vY = 0;
		} else {
			if (this.viewHeight - this.translateY / this.translateZ > this.innerHeight / this.translateZ) {
				if (this.viewHeight * this.translateZ - this.innerHeight <= 0) {
					vY = this.viewHeight * this.translateZ - this.innerHeight;
				} else {
					vY = 0;
				}
			}
		}
		if (this.translateZ < 1) {
			vZ = 1;
		} else {
			if (this.translateZ > this.mx) {
				vZ = this.mx;
			}
		}
		return {
			x: vX,
			y: vY,
			z: vZ
		};
	}
	startSlideTo(x: number, y: number, z: number, action: () => void) {
		this.startStepSlideTo(10, x, y, z, action);
	}
	startStepSlideTo(s: number, x: number, y: number, z: number, action: () => void) {
		let stepCount: number = s;
		let dx: number = (x - this.translateX) / stepCount;
		let dy: number = (y - this.translateY) / stepCount;
		let dz: number = (z - this.translateZ) / stepCount;
		let xyz: TileZoom[] = [];
		for (let i: number = 0; i < stepCount; i++) {
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
	}
	stepSlideTo(xyz: TileZoom[], action: () => void) {
		let n: TileZoom = xyz.shift();
		if (n) {
			this.translateX = n.x;
			this.translateY = n.y;
			this.translateZ = n.z;
			this.applyZoomPosition();
			let main: TileLevel = this;
			setTimeout(function () {
				main.stepSlideTo(xyz, action);
			}, 10);
		} else {
			if (action) {
				action();
			}
			this.adjustContentPosition();
			this.valid = true;
			this.queueTiles();
		}
	}
	maxZoom() {
		return this.mx;
	};
	queueTiles() {
		this.clearUselessDetails();
		this.tileFromModel();
	}
	clearUselessDetails() {
		if (this.model) {
			for (let k = 0; k < this.model.length; k++) {
				let group: SVGElement = this.model[k].g;
				this.clearUselessGroups(group, this.model[k].mode);
			}
		}
	}
	clearUselessGroups(group: SVGElement, kind: string) {
		let x: number = -this.translateX;
		let y: number = -this.translateY;
		let w: number = this.svg.clientWidth * this.translateZ;
		let h: number = this.svg.clientHeight * this.translateZ;
		let cX: number = 0;
		let cY: number = 0;
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
		} else {
			if (kind == this.layerLockX) {
				x = 0;
			} else {
				if (kind == this.layerLockY) {
					y = 0;
				} else {
					if (kind == this.layerStickRight) {
						x = 0;
					} else {
						if (kind == this.layerStickBottom) {
							y = 0;
						}
					}
				}
			}
		}
		this.msEdgeHook(group);
		for (let i: number = 0; i < group.children.length; i++) {
			let child: TileSVGElement = group.children[i] as TileSVGElement;
			if (this.outOfWatch(child, x, y, w, h) || child.minZoom > this.translateZ || child.maxZoom <= this.translateZ) {
				group.removeChild(child);
				i--;
			} else {
				if (child.localName == 'g') {
					this.clearUselessGroups(child, kind);
				}
			}
		}
	}
	rakeMouseWheel(e: WheelEvent) {
		//console.log('rakeMouseWheel',e.wheelDelta,e.detail,e.deltaX,e.deltaY,e.deltaZ,e);
		//e.preventDefault();
		//let wheelVal = e.wheelDelta || -e.detail;
		let wheelVal: number = e.deltaY;
		let min: number = Math.min(1, wheelVal);
		let delta: number = Math.max(-1, min);
		let zoom: number = _tileLevel.translateZ + delta * (_tileLevel.translateZ) * 0.077;
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
	}
	rakeMouseDown(mouseEvent: MouseEvent) {
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
	}
	rakeMouseMove(mouseEvent: MouseEvent) {
		mouseEvent.preventDefault();
		let dX: number = mouseEvent.offsetX - _tileLevel.startMouseScreenX;
		let dY: number = mouseEvent.offsetY - _tileLevel.startMouseScreenY;
		_tileLevel.translateX = _tileLevel.translateX + dX * _tileLevel.translateZ;
		_tileLevel.translateY = _tileLevel.translateY + dY * _tileLevel.translateZ;
		_tileLevel.startMouseScreenX = mouseEvent.offsetX;
		_tileLevel.startMouseScreenY = mouseEvent.offsetY;
		_tileLevel.applyZoomPosition();
	}
	rakeMouseUp(mouseEvent: MouseEvent) {
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
	}
	rakeTouchStart(touchEvent: TouchEvent) {
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
		} else {
			_tileLevel.startTouchZoom(touchEvent);
		}
		_tileLevel.clicked = false;
	}
	rakeTouchMove(touchEvent: TouchEvent) {
		//touchEvent.preventDefault();
		if (_tileLevel.startedTouch) {
			if (touchEvent.touches.length < 2) {
				if (_tileLevel.twoZoom) {
					//
				} else {
					let dX: number = touchEvent.touches[0].clientX - _tileLevel.startMouseScreenX;
					let dY: number = touchEvent.touches[0].clientY - _tileLevel.startMouseScreenY;
					_tileLevel.translateX = _tileLevel.translateX + dX * _tileLevel.translateZ;
					_tileLevel.translateY = _tileLevel.translateY + dY * _tileLevel.translateZ;
					_tileLevel.startMouseScreenX = touchEvent.touches[0].clientX;
					_tileLevel.startMouseScreenY = touchEvent.touches[0].clientY;
					_tileLevel.applyZoomPosition();
					return;
				}
			} else {
				if (!_tileLevel.twoZoom) {
					_tileLevel.startTouchZoom(touchEvent);
				} else {
					let p1: TilePoint = _tileLevel.vectorFromTouch(touchEvent.touches[0]);
					let p2: TilePoint = _tileLevel.vectorFromTouch(touchEvent.touches[1]);
					let d: number = _tileLevel.vectorDistance(p1, p2);
					if (d <= 0) {
						d = 1;
					}
					let ratio: number = d / _tileLevel.twodistance;
					_tileLevel.twodistance = d;
					let zoom: number = _tileLevel.translateZ / ratio;
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
	}
	rakeTouchEnd(touchEvent: TouchEvent) {
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
				} else {
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
	}
	tileFromModel() {
		if (this.model) {
			for (let k = 0; k < this.model.length; k++) {
				let group: SVGElement = this.model[k].g;
				let arr: TileDefinition[] = this.model[k].definition;
				for (let i: number = 0; i < arr.length; i++) {
					let a: TileDefinition = arr[i];
					this.addGroupTile(group, a, this.model[k].mode);
				}
			}
		}
		this.valid = true;
	}
	addGroupTile(parentGroup: SVGElement, definitions: TileDefinition, layerKind: string) {
		let x: number = -this.translateX;
		let y: number = -this.translateY;
		let w: number = this.svg.clientWidth * this.translateZ;
		let h: number = this.svg.clientHeight * this.translateZ;
		let cX: number = 0;
		let cY: number = 0;
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
		} else {
			if (layerKind == this.layerLockX) {
				x = 0;
			} else {
				if (layerKind == this.layerLockY) {
					y = 0;
				} else {
					if (layerKind == this.layerStickRight) {
						x = 0;
					} else {
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
				let xg: SVGElement = this.childExists(parentGroup, definitions.id);
				if (xg) {
					for (let n = 0; n < definitions.sub.length; n++) {
						let d = definitions.sub[n];
						if (d.draw == 'group') {
							this.addElement(xg, d, layerKind);
						}
					}
				} else {
					let g: TileSVGElement = document.createElementNS(this.svgns, 'g') as TileSVGElement;
					g.id = definitions.id;
					//let gg = g as any;
					g.watchX = definitions.x * this.tapSize;
					g.watchY = definitions.y * this.tapSize;
					g.watchW = definitions.w * this.tapSize;
					g.watchH = definitions.h * this.tapSize;
					parentGroup.appendChild(g);
					g.minZoom = definitions.z[0];
					g.maxZoom = definitions.z[1];
					for (let n = 0; n < definitions.sub.length; n++) {
						let d = definitions.sub[n];
						this.addElement(g, d, layerKind);
					}
				}
			}
		}
	}

	startTouchZoom(touchEvent: TouchEvent) {
		this.twoZoom = true;
		let p1: TilePoint = this.vectorFromTouch(touchEvent.touches[0]);
		let p2: TilePoint = this.vectorFromTouch(touchEvent.touches[1]);
		this.twocenter = this.vectorFindCenter(p1, p2);
		let d: number = this.vectorDistance(p1, p2);
		if (d <= 0) {
			d = 1;
		}
		this.twodistance = d;
	};
	tilePath(g: SVGElement, x: number, y: number, z: number, data: string, cssClass: string): TileSVGElement {
		let path: TileSVGElement = document.createElementNS(this.svgns, 'path') as TileSVGElement;
		path.setAttributeNS(null, 'd', data);
		let t: string = "";
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
	}
	tileRectangle(g: SVGElement, x: number, y: number, w: number, h: number, rx: number, ry: number, cssClass: string): TileSVGElement {
		let rect: TileSVGElement = document.createElementNS(this.svgns, 'rect') as TileSVGElement;
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
	}
	tileLine(g: SVGElement, x1: number, y1: number, x2: number, y2: number, cssClass: string): TileSVGElement {
		let line: TileSVGElement = document.createElementNS(this.svgns, 'line') as TileSVGElement;
		line.setAttributeNS(null, 'x1', '' + x1);
		line.setAttributeNS(null, 'y1', '' + y1);
		line.setAttributeNS(null, 'x2', '' + x2);
		line.setAttributeNS(null, 'y2', '' + y2);
		if (cssClass) {
			line.classList.add(cssClass);
		}
		g.appendChild(line);
		return line;
	}
	tileText(g: SVGElement, x: number, y: number, html: string, cssClass: string): TileSVGElement {
		let txt: TileSVGElement = document.createElementNS(this.svgns, 'text') as TileSVGElement;
		txt.setAttributeNS(null, 'x', '' + x);
		txt.setAttributeNS(null, 'y', '' + y);
		if (cssClass) {
			txt.setAttributeNS(null, 'class', cssClass);
		}
		txt.innerHTML = html;
		g.appendChild(txt);
		return txt;
	};
	addElement(g: SVGElement, d: TileDefinition, layerKind: string) {
		let element: TileSVGElement = null;
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
				let me: TileLevel = this;
				let click: () => void = function () {
					if (me.clicked) {
						if (element) {
							if (element.onClickFunction) {
								//console.log(element.getBoundingClientRect());
								let xx: number = element.getBoundingClientRect().left - me.svg.getBoundingClientRect().left;
								let yy: number = element.getBoundingClientRect().top - me.svg.getBoundingClientRect().top;
								element.onClickFunction(me.translateZ * (me.clickX - xx) / me.tapSize, me.translateZ * (me.clickY - yy) / me.tapSize);
							}
						}
					}
				};
				element.onclick = click;
				element.ontouchend = click;
			}
		}
	}
	outOfWatch(g: TileSVGElement, x: number, y: number, w: number, h: number): boolean {
		let watchX: number = g.watchX;
		let watchY: number = g.watchY;
		let watchW: number = g.watchW;
		let watchH: number = g.watchH;
		return !(this.collision(watchX, watchY, watchW, watchH, x, y, w, h));
	}
	collision(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
		if (this.collision2(x1, w1, x2, w2) && this.collision2(y1, h1, y2, h2)) {
			return true;
		} else {
			return false;
		}
	}
	collision2(x: number, w: number, left: number, width: number): boolean {
		if (x + w <= left || x >= left + width) {
			return false;
		} else {
			return true;
		}
	}
	vectorFromTouch(touch: Touch): TilePoint {
		return {
			x: touch.clientX,
			y: touch.clientY
		};
	}
	vectorDistance(xy1: TilePoint, xy2: TilePoint): number {
		let xy: TilePoint = this.vectorSubstract(xy1, xy2);
		let n: number = this.vectorNorm(xy);
		return n;
	}
	vectorSubstract(xy1: TilePoint, xy2: TilePoint): TilePoint {
		return {
			x: xy1.x - xy2.x,
			y: xy1.y - xy2.y
		};
	}
	vectorNorm(xy: TilePoint): number {
		return Math.sqrt(this.vectorNormSquared(xy));
	}
	vectorNormSquared(xy: TilePoint): number {
		return xy.x * xy.x + xy.y * xy.y;
	}
	vectorFindCenter(xy1: TilePoint, xy2: TilePoint): TilePoint {
		let xy: TilePoint = this.vectorAdd(xy1, xy2);
		return this.vectorScale(xy, 0.5);
	};
	vectorAdd(xy1: TilePoint, xy2: TilePoint): TilePoint {
		return {
			x: xy1.x + xy2.x,
			y: xy1.y + xy2.y
		};
	};
	vectorScale(xy: TilePoint, coef: number): TilePoint {
		return {
			x: xy.x * coef,
			y: xy.y * coef
		};
	};
	childExists(group: SVGElement, id: string): SVGElement {//SVGGraphicsElement/SVGElement
		//console.log('childExists',group, id);
		//console.dir(group);
		this.msEdgeHook(group);
		for (let i: number = 0; i < group.children.length; i++) {
			let child: SVGElement = group.children[i] as SVGElement;
			if (child.id == id) {
				return child;
			}
		}
		return null;
	}

	startLoop() {
		let last: number = new Date().getTime();
		let me: TileLevel = this;
		let step: () => void = function () {
			let now = new Date().getTime();
			if (last + 222 < now) {
				if (!(me.valid)) {
					me.queueTiles();
				}
				last = new Date().getTime();
			}
			window.requestAnimationFrame(step);
		};
		step();
	}
}

