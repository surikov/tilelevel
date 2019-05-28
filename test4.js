var levelEngine = null;

function start4() {
	console.log('start');
	levelEngine = new TileLevel(document.getElementById('contentSVG'));
	levelEngine.innerWidth = 30000 * levelEngine.tapSize;
	levelEngine.innerHeight = 500 * levelEngine.tapSize;
	levelEngine.mx = 999;
	//reset();

	reset();
	levelEngine.applyZoomPosition();
}
/*function createModel() {
	var layers = [{ //upper
			stick:'all',tiles: []
		}, { //left
			stick:'left',tiles: []
		}, { //right
			stick:'right',tiles: []
		}, { //top
			stick:'top',tiles: []
		}, { //bottom
			stick:'bottom',tiles: []
		}, { //content
			tiles: []
		}, { //bckaground
			tiles: [
				{bounds:{x:0,y:0,w:54321,h:12345,z:[1,100]}}
			]
		}
	];
	return layers;
}*/
/*function clicked(e) {
	e.stopPropagation();
	if (levelEngine.clicked) {
		document.getElementById('stat').innerText = 'one clicked ' + (new Date());
		console.log('1', levelEngine.clickX * levelEngine.translateZ, levelEngine.clickY * levelEngine.translateZ);
	}
}
function clicked2(e) {
	e.stopPropagation();
	//alert('two click');
	if (levelEngine.clicked) {
		document.getElementById('stat').innerText = 'two clicked ' + (new Date());
		console.log('2', levelEngine.clickX * levelEngine.translateZ, levelEngine.clickY * levelEngine.translateZ);
	}
}*/
function reset() {
	//var cm = levelEngine.tapSize;
	levelEngine.translateZ = 111;
	console.log('current xyz', levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
	levelEngine.clearUselessDetails();
	var m1 = [{
			id: 'a1',
			x: 2,
			y: 4,
			w: 1,
			h: 3,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 2,
					y: 4,
					w: 1,
					h: 3,
					css: 'cell'
				}
			]
		}, {
			id: 'a5',
			x: 12,
			y: 3,
			w: 7.5,
			h: 1,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 12,
					y: 3,
					w: 7.5,
					h: 1,
					css: 'cell'
				}

			]
		}, {
			id: 'a4',
			x: 12,
			y: 3,
			w: 7.5,
			h: 1,
			z: [1, 1000],
			sub: [{
					draw: 'text',
					x: 12,
					y: 4,
					text: 'Qwerty asdfg zxcv',
					css: 'tx'
				}

			]
		}, {
			id: 'a6',
			x: 4,
			y: 3,
			w: 9,
			h: 9,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 4,
					y: 3,
					w: 9,
					h: 9,
					css: 'dbg'
				}, {
					draw: 'group',
					id: 'a7',
					x: 7,
					y: 5,
					w: 2,
					h: 1,
					z: [1, 1000],
					sub: [{
							draw: 'rectangle',
							x: 7,
							y: 5,
							w: 2,
							h: 1,
							css: 'cell'
						}, {
							draw: 'text',
							x: 7,
							y: 6,
							text: 'Test',
							css: 'tx'
						}

					]
				}
			]
		}, {
			id: 'a2',
			x: 11,
			y: 21,
			w: 22,
			h: 12,
			z: [5, 999],
			sub: [{
					draw: 'line',
					x1: 33,
					y1: 24,
					x2: 11,
					y2: 33,
					css: 'ln'
				}, {
					draw: 'line',
					x1: 23,
					y1: 21,
					x2: 16,
					y2: 25,
					css: 'ln'
				}
			]

		}, {
			id: 'a3',
			x: 21,
			y: 14,
			w: 11,
			h: 11,
			z: [1, 1000],
			sub: [{
					draw: 'path',
					x: 21,
					y: 14,
					scale: 10,
					css: 'cell',
					points: "M16.822,284.968h39.667v158.667c0,9.35,7.65,17,17,17h116.167c9.35,0,17-7.65,17-17V327.468h70.833v116.167    c0,9.35,7.65,17,17,17h110.5c9.35,0,17-7.65,17-17V284.968h48.167c6.8,0,13.033-4.25,15.583-10.483    c2.55-6.233,1.133-13.6-3.683-18.417L260.489,31.385c-6.517-6.517-17.283-6.8-23.8-0.283L5.206,255.785    c-5.1,4.817-6.517,12.183-3.967,18.7C3.789,281.001,10.022,284.968,16.822,284.968z M248.022,67.368l181.333,183.6h-24.367    c-9.35,0-17,7.65-17,17v158.667h-76.5V310.468c0-9.35-7.65-17-17-17H189.656c-9.35,0-17,7.65-17,17v116.167H90.489V267.968    c0-9.35-7.65-17-17-17H58.756L248.022,67.368z",
					a: function (xx, yy) {
						console.log('clicked 2', xx, yy);
						//alert('Here');
					}
				}

			]

		}, {
			id: 'a5',
			x: 59,
			y: 33,
			w: 11,
			h: 3,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 59,
					y: 33,
					w: 11,
					h: 3,
					css: 'cell'
				}
			]
		}
	];
	var m2 = [
		{
			id: 'bgsq',
			x: 0,
			y: 0,
			w: 3000,
			h: 500,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 0,
					y: 0,
					w: 3000,
					h: 500,
					css: 'redborder'
				}
			]
		}, {
			id: 'a2',
			x: 11,
			y: 21,
			w: 22,
			h: 12,
			z: [1, 5],
			sub: [{
					draw: 'line',
					x1: 11,
					y1: 22,
					x2: 11,
					y2: 30,
					css: 'ln2'
				}, {
					draw: 'line',
					x1: 27,
					y1: 22,
					x2: 12,
					y2: 23,
					css: 'ln2'
				}
			]

		}, {
			id: 'a1',
			x: 29900,
			y: 450,
			w: 90,
			h: 40,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 29900,
					y: 450,
					w: 90,
					h: 40,
					css: 'cell'
				}
			]

		}
	];
	for (var x = 0; x < 30000; x = x + 1000) {
		for (var y = 0; y < 500; y = y + 500) {
			m2.push({
				id: 'r0x' + x + 'x' + y,
				x: x,
				y: y,
				w: 1000,
				h: 500,
				z: [200, 1000],
				sub: [{
						draw: 'rectangle',
						x: x + 5,
						y: y + 200,
						w: 888,
						h: 144,
						css: 'dbg'
					}, {
						draw: 'text',
						x: x,
						y: y + 300,
						text: '' + x + 'x' + y,
						css: 'tx1000'
					}
				]
			});
		}
	}
	for (var x = 0; x < 30000; x = x + 500) {
		for (var y = 0; y < 500; y = y + 500) {
			m2.push({
				id: 'r1x' + x + 'x' + y,
				x: x,
				y: y,
				w: 500,
				h: 500,
				z: [20, 300],
				sub: [{
						draw: 'rectangle',
						x: x + 5,
						y: y + 9,
						w: 444,
						h: 333,
						css: 'dbg'
					}, {
						draw: 'text',
						x: x,
						y: y + 300,
						text: '' + x + 'x' + y,
						css: 'tx500'
					}
				]
			});
		}
	}
	for (var x = 0; x < 30000; x = x + 100) {
		for (var y = 0; y < 500; y = y + 100) {
			m2.push({
				id: 'r2x' + x + 'x' + y,
				x: x,
				y: y,
				w: 100,
				h: 100,
				z: [4, 50],
				sub: [{
						draw: 'rectangle',
						x: x + 5,
						y: y + 9,
						w: 44,
						h: 9,
						css: 'dbg'
					}, {
						draw: 'text',
						x: x,
						y: y + 20,
						text: '' + x + 'x' + y,
						css: 'tx100'
					}
				]
			});
		}
	}
	for (var x = 0; x < 30000; x = x + 100) {
		for (var y = 0; y < 500; y = y + 100) {

			var gg = {
				id: 'r3x' + x + 'x' + y,
				x: x,
				y: y,
				w: 100,
				h: 100,
				z: [1, 5],
				sub: []
			};

			for (var xx = 0; xx < 10; xx++) {
				for (var yy = 0; yy < 10; yy++) {
					gg.sub.push({
						draw: 'rectangle',
						x: x + 1 + xx * 10,
						y: y + 1 + yy * 10,
						w: 2,
						h: 7,
						css: 'dbg'
					});
					gg.sub.push({
						draw: 'text',
						x: x + 1 + xx * 10,
						y: y + 1 + yy * 10 + 2,
						text: '' + (x + xx) + 'x' + (y + yy),
						css: 'tx2'
					});
				}
			}
			m2.push(gg);

		}
	};
	var overDef = [{
			id: 'a99',
			x: 1.5,
			y: 4,
			w: 4,
			h: 2,
			z: [1, 1000],
			sub: [{
					draw: 'rectangle',
					x: 1.5,
					y: 4,
					w: 2,
					h: 2,
					rx: 0.2,
					ry: 0.2,
					css: 'overlayButton',
					action: function (xx, yy) {
						console.log('over clicked', xx, yy, levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
						//alert('Anchor');
					}
				},{
					draw: 'text',
					x: 1.5,
					y: 4,
					text: 'over',
					css: 'tx2'
				}
			]
		}
	];
	var clmnDef = [{
		id: 'a1199',
		x: 1.5,
		y: 4,
		w: 4,
		h: 2,
		z: [1, 1000],
		sub: [{
				draw: 'rectangle',
				x: 5.5,
				y: 4,
				w: 4,
				h: 4,
				rx: 0.2,
				ry: 0.2,
				css: 'columnButton',
				action: function (xx, yy) {
					console.log('lock X clicked', xx, yy, levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
					//alert('Anchor');
				}
			},{
				draw: 'text',
				x: 5.5,
				y: 4,
				text: 'lock X',
				css: 'tx2'
			}
		]
	}
];
var rwlrDef = [{
	id: 'a221199',
	x: 0,
	y: 0,
	w: 400,
	h: 400,
	z: [1, 1000],
	sub: [{
			draw: 'rectangle',
			x: 0,
			y: 0,
			w: 400,
			h: 400,
			rx: 1,
			ry: 1,
			css: 'rowButton',
			action: function (xx, yy) {
				console.log('lock Y clicked', xx, yy, levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
				//alert('Anchor');
			}
		},{
			draw: 'text',
			x: 3.5,
			y: 2,
			text: 'lock Y',
			css: 'tx2'
		}
	]
}
];
	//console.log(m1.length);
	//console.log(m2.length);
	levelEngine.setModel([{
				g: document.getElementById('bggroup'),
				definition: m2
			}, {
				g: document.getElementById('cntntgroup'),
				definition: m1
				//shiftX: function(t){return 100;}//100
			}, {
				g: document.getElementById('over'),
				definition: overDef,
				mode: levelEngine.layerOverlay
			}, {
				g: document.getElementById('clmn'),
				definition: clmnDef,
				shift: 10,
				mode: levelEngine.layerLockX
			}, {
				g: document.getElementById('rwlr'),
				definition: rwlrDef,
				shift:400,
				viceversa: true,
				mode: levelEngine.layerStickRight//layerStickBottom
			}
		]);
	//levelEngine.tileFromModel();
}
