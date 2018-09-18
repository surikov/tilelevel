var levelEngine = null;

function start() {
	console.log('start');
	levelEngine = new LevelEngine(document.getElementById('contentSVG'));
	levelEngine.innerWidth = 30000 * levelEngine.tapSize;
	levelEngine.innerHeight = 500 * levelEngine.tapSize;
	levelEngine.mx = 999;
	//reset();
	levelEngine.applyZoomPosition();
	reset();
}
function clicked(e) {
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
}
function reset() {
	//var cm = levelEngine.tapSize;
	console.log('current xyz', levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
	levelEngine.clearUselessDetails(); //-levelEngine.translateX,-levelEngine.translateY,levelEngine.svg.clientWidth*levelEngine.translateZ,levelEngine.svg.clientHeight*levelEngine.translateZ);
	var m1 = [{
			id: 'a1',
			x: 2,
			y: 4,
			w: 1,
			h: 3,
			z: [1, 1000],
			l: [{
					kind: 'r',
					x: 2,
					y: 4,
					w: 1,
					h: 3,
					css: 'cell'
				}
			]

		}, {
			id: 'a2',
			x: 11,
			y: 21,
			w: 22,
			h: 12,
			z: [5, 999],
			l: [{
					kind: 'l',
					x1: 33,
					y1: 24,
					x2: 11,
					y2: 33,
					css: 'ln'
				}, {
					kind: 'l',
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
			l: [{
					kind: 'p',
					x: 21,
					y: 14,
					z: 1,
					css: 'cell',
					l: "M16.822,284.968h39.667v158.667c0,9.35,7.65,17,17,17h116.167c9.35,0,17-7.65,17-17V327.468h70.833v116.167    c0,9.35,7.65,17,17,17h110.5c9.35,0,17-7.65,17-17V284.968h48.167c6.8,0,13.033-4.25,15.583-10.483    c2.55-6.233,1.133-13.6-3.683-18.417L260.489,31.385c-6.517-6.517-17.283-6.8-23.8-0.283L5.206,255.785    c-5.1,4.817-6.517,12.183-3.967,18.7C3.789,281.001,10.022,284.968,16.822,284.968z M248.022,67.368l181.333,183.6h-24.367    c-9.35,0-17,7.65-17,17v158.667h-76.5V310.468c0-9.35-7.65-17-17-17H189.656c-9.35,0-17,7.65-17,17v116.167H90.489V267.968    c0-9.35-7.65-17-17-17H58.756L248.022,67.368z",
					a: function () {
						console.log('clicked');
						alert('Here');
					}
				}

			]
		}, {
			id: 'a4',
			x: 33,
			y: 42,
			w: 7,
			h: 1,
			z: [1, 1000],
			l: [{
					kind: 't',
					x: 33,
					y: 42,
					t: 'Qwerty',
					css: 'cell'
				}

			]
		}, {
			id: 'a5',
			x: 59,
			y: 33,
			w: 11,
			h: 3,
			z: [1, 1000],
			l: [{
					kind: 'r',
					x: 59,
					y: 33,
					w: 11,
					h: 3,
					css: 'cell'
				}
			]
		}
	];
	var m2 = [{
			id: 'a2',
			x: 11,
			y: 21,
			w: 22,
			h: 12,
			z: [1, 5],
			l: [{
					kind: 'l',
					x1: 11,
					y1: 22,
					x2: 11,
					y2: 30,
					css: 'ln2'
				}, {
					kind: 'l',
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
			l: [{
					kind: 'r',
					x: 29900,
					y: 450,
					w: 90,
					h: 40,
					css: 'cell'
				}
			]

		}
	];
	for (var x = 0; x < 30000; x = x + 500) {
		for (var y = 0; y < 500; y = y + 500) {
			m2.push({
				id: 'r1x' + x + 'x' + y,
				x: x ,
				y: y ,
				w: 500,
				h: 500,
				z: [100, 1000],
				l: [{
						kind: 'r',
						x: x  + 5,
						y: y  + 9,
						w: 444,
						h: 333,
						css: 'dbg'
					}
				]
			});
		}
	}
	for (var x = 0; x < 30000; x = x + 100) {
		for (var y = 0; y < 500; y = y + 100) {
			m2.push({
				id: 'r2x' + x + 'x' + y,
				x: x ,
				y: y ,
				w: 100,
				h: 100,
				z: [20, 100],
				l: [{
						kind: 'r',
						x: x  + 5,
						y: y  + 9,
						w: 44,
						h: 33,
						css: 'dbg'
					}
				]
			});
		}
	}
	for (var x = 0; x < 30000; x = x + 10) {
		for (var y = 0; y < 500; y = y + 10) {
			m2.push({
				id: 'r3x' + x + 'x' + y,
				x: x ,
				y: y ,
				w: 10,
				h: 10,
				z: [1, 20],
				l: [{
						kind: 'r',
						x: x  + 1,
						y: y  + 1,
						w: 5,
						h: 7,
						css: 'dbg'
					}
				]
			});
		}
	}
	//console.log(m1.length);
	//console.log(m2.length);
	levelEngine.setModel([{
				g: document.getElementById('bggroup'),
				m: m2
			}, {
				g: document.getElementById('cntntgroup'),
				m: m1
			}
		]);
	//levelEngine.tileFromModel();
}
