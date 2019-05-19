var levelEngine = null;

function start3() {
	console.log('start');
	levelEngine = new TileLevel(document.getElementById('contentSVG'));
	levelEngine.innerWidth = 30000 * levelEngine.tapSize;
	levelEngine.innerHeight = 500 * levelEngine.tapSize;
	levelEngine.mx = 999;
	//reset();

	reset();
	levelEngine.applyZoomPosition();
}

function createModel() {
	var layers = [{ //upper
		stick: 'all',
		tiles: []
	}, { //left
		stick: 'left',
		tiles: []
	}, { //right
		stick: 'right',
		tiles: []
	}, { //top
		stick: 'top',
		tiles: []
	}, { //bottom
		stick: 'bottom',
		tiles: []
	}, { //content
		tiles: []
	}, { //bckaground
		tiles: [{
			bounds: {
				x: 0,
				y: 0,
				w: 54321,
				h: 12345,
				z: [1, 100]
			}
		}]
	}];
	return layers;
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
	levelEngine.translateZ = 111;
	console.log('current xyz', levelEngine.translateX, levelEngine.translateY, levelEngine.translateZ);
	levelEngine.clearUselessDetails(); //-levelEngine.translateX,-levelEngine.translateY,levelEngine.svg.clientWidth*levelEngine.translateZ,levelEngine.svg.clientHeight*levelEngine.translateZ);
	
	levelEngine.setModel([{
		g: document.getElementById('bggroup'),
		m: createModel
	}]);
	//levelEngine.tileFromModel();
}