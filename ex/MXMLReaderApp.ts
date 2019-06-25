import { TreeValue } from "./treeValue";
import { Of } from "./treeValue";
import { everyOf } from "./treeValue";

let mxmlReaderApp: MXMLReaderApp = null;

class MXMLReaderApp {
	public static main() {
		console.log('here');
		//let a:TreeValue={name:"test",value:'123',children:[]};
		//console.log(a);
		mxmlReaderApp = new MXMLReaderApp();
		mxmlReaderApp.attachField();
	}
	//fileLoadActionHandler: (treeValue: TreeValue) => {};
	handleFileSelect(event: Event) {
		console.log('handleFileSelect',this);
		let t: MXMLReaderApp = this;
		
		let file: File = (event.target as any).files[0];
		let fileReader: FileReader = new FileReader();
		fileReader.onload = function (progressEvent: ProgressEvent) {
			let xml: string = (progressEvent.target as any).result;
			var domParser: DOMParser = new DOMParser();
			var _document: Document = domParser.parseFromString(xml, "text/xml");
			var tree: TreeValue = { name: '', value: '', children: t.readDocChildren(_document) };
			t.parseAction(tree);
		};
		fileReader.readAsText(file);
	}
	/*onFileLoad(action: (treeValue: TreeValue) => {}) {
		this.fileLoadActionHandler = action;
		return this.handleFileSelect;
	}*/
	readDocChildren(node: any): TreeValue[] {
		let children: TreeValue[] = [];
		if (node.children) {
			for (let i = 0; i < node.children.length; i++) {
				let c = node.children[i];
				let t = '';
				if (c.childNodes && c.childNodes[0] && c.childNodes[0].nodeName == '#text') {
					t = ('' + c.childNodes[0].nodeValue).trim();
				}
				children.push({ name: c.localName, value: t, children: this.readDocChildren(c) });
			}
		}
		if (node.attributes) {
			for (let i = 0; i < node.attributes.length; i++) {
				let a = node.attributes[i];
				children.push({ name: a.localName, value: a.value, children: [] });
			}
		}
		return children;
	}
	parseAction(tree: TreeValue){
		console.log(tree);
		console.log('title:', Of('credit-words', Of('credit', Of('score-partwise', tree))).value);
		console.log('software:', Of('software', Of('encoding', Of('identification', Of('score-partwise',
			tree)))).value);
		var traksList = everyOf('score-part', Of('part-list', Of('score-partwise', tree)));
		var tracksParts = everyOf('part', Of('score-partwise', tree));
		//console.log('tracksParts:',tracksParts);
		for (var i = 0; i < traksList.length; i++) {
			var track = traksList[i];
			console.log('track:', Of('id', track).value, Of('part-name', track).value);
			for (var k = 0; k < tracksParts.length; k++) {
				var part = tracksParts[k];
				if (Of('id', part).value == Of('id', track).value) {
					var measures = everyOf('measure', part);
					//console.log('part:',part,measures);
					for (var m = 0; m < measures.length; m++) {
						var divisions = Of('divisions', Of('attributes', measures[m])).value;
						if (divisions) {
							console.log('divisions:', divisions);
						}
						var fifths = Of('fifths', Of('key', Of('attributes', measures[m]))).value;
						if (fifths) {
							console.log('fifths:', fifths);
						}
					}
				}
			}
		}
	}
	attachField() {
		document.getElementById('filesinput').addEventListener('change',(event: Event)=>{this.handleFileSelect(event);});
	}
}

MXMLReaderApp.main();

