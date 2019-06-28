import { TreeValue } from "./treeValue";
import { Of } from "./treeValue";
import { everyOf } from "./treeValue";
import { RiffSong } from "./musicData";
import { RiffVoice } from "./musicData";
import { RiffMeasure } from "./musicData";
import { RiffChord } from "./musicData";
import { RiffPoint } from "./musicData";
import { RiffPitch } from "./musicData";
import { RiffDuration } from "./musicData";

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
			console.log(t.parseAction(tree));
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
	parseAction(tree: TreeValue):RiffSong{
		let riffSong:RiffSong={title:Of('credit-words', Of('credit', Of('score-partwise', tree))).value,voices:[]};
		let traksList:TreeValue[] = everyOf('score-part', Of('part-list', Of('score-partwise', tree)));
		let tracksParts:TreeValue[] = everyOf('part', Of('score-partwise', tree));
		let tempo:number=120;
		for (let i = 0; i < traksList.length; i++) {
			let track:TreeValue = traksList[i];
			//console.log('track:',track);
			for (let k = 0; k < tracksParts.length; k++) {
				let part = tracksParts[k];
				if (Of('id', part).value == Of('id', track).value) {
					let measures:TreeValue[] = everyOf('measure', part);
					let voices:string[]=[];
					for (let m = 0; m < measures.length; m++) {
						let measure:TreeValue=measures[m];
						var notes:TreeValue[]=everyOf('note', measures[m]);
						for (var n = 0; n < notes.length; n++) {
							let note:TreeValue=notes[n];
							let voice=Of('voice', note).value;
							if(voices.indexOf(voice) < 0){
								voices.push(voice);
							}
						}
					}
					//console.log(voices);
					for(let v=0;v<voices.length;v++){
						let trackVoice:RiffVoice={title: Of('part-name', track).value+': '+voices[v], measures: []};
						riffSong.voices.push(trackVoice);
						for (let m = 0; m < measures.length; m++) {
							let measure:TreeValue=measures[m];
							tempo=this.txtNum(Of('tempo', Of('sound', Of('direction', measure))).value,tempo);
							let riffMeasure:RiffMeasure = {chords: []
								, fifths: 0
								, tempo: tempo
								, meter: {count: 0, fraction: 0}
								, transpose: 0
								, clef: 0
							};
							trackVoice.measures.push(riffMeasure);
						}
					}
				}
			}
		}
		return riffSong;
	}
	txtNum(txt:string,defValue:number):number{
		if(txt){
			return parseInt(txt);
		}else{
			return defValue;
		}
	}
	parseAction_____________(tree: TreeValue){
		console.log(tree);
		console.log('title:', Of('credit-words', Of('credit', Of('score-partwise', tree))).value);
		console.log('software:', Of('software', Of('encoding', Of('identification', Of('score-partwise',
			tree)))).value);
		var traksList:TreeValue[] = everyOf('score-part', Of('part-list', Of('score-partwise', tree)));
		var tracksParts:TreeValue[] = everyOf('part', Of('score-partwise', tree));
		//console.log('tracksParts:',tracksParts);
		for (var i = 0; i < traksList.length; i++) {
			var track = traksList[i];
			console.log('track:', Of('id', track).value, Of('part-name', track).value);
			for (var k = 0; k < tracksParts.length; k++) {
				var part = tracksParts[k];
				if (Of('id', part).value == Of('id', track).value) {
					var measures:TreeValue[] = everyOf('measure', part);
					//console.log('part:',part,measures);
					var divisionNum=99;
					for (var m = 0; m < measures.length; m++) {
						var divisions = Of('divisions', Of('attributes', measures[m])).value;
						if (divisions) {
							console.log('	'+m,'divisions:', divisions);
							divisionNum=parseInt(divisions);
						}
						var fifths = Of('fifths', Of('key', Of('attributes', measures[m]))).value;
						if (fifths) {
							console.log('	'+m,'fifths:', fifths);
						}
						var sign = Of('sign', Of('clef', Of('attributes', measures[m]))).value;
						if (sign) {
							console.log('	'+m,'sign:', sign,Of('line', Of('clef', Of('attributes', measures[m]))).value);
						}
						var beats = Of('beats', Of('time', Of('attributes', measures[m]))).value;
						if (beats) {
							console.log('	'+m,'beats:', beats,'/',Of('beat-type', Of('time', Of('attributes', measures[m]))).value);
						}
						//console.log('	notes'+m,everyOf('note', measures[m]));
						var notes:TreeValue[]=everyOf('note', measures[m]);
						for (var n = 0; n < notes.length; n++) {
							var d=parseInt(Of('duration', notes[n]).value);
							/*console.log('		'
								,Of('voice', notes[n]).value,':'
								,'(',Of('step',Of('pitch', notes[n])).value
								,Of('alter',Of('pitch', notes[n])).value
								,')'
								,Of('octave',Of('pitch', notes[n])).value
								
								,':',Of('duration', notes[n]).value
								,Of('type', notes[n]).value
								,':',Of('duration', notes[n]).value,'/',divisionNum,'=',d/divisionNum,'/4'
								);*/
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

