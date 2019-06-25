export class TreeValue {
	name: string; 
	value: string; 
	children: TreeValue[];
}
export function Of(name: string, tree: TreeValue): TreeValue {
	for (let i = 0; i < tree.children.length; i++) {
		if (tree.children[i].name == name) {
			return tree.children[i];
		}
	}
	return { name: '', value: '', children: [] };
}
export function everyOf(name: string, tree: TreeValue): TreeValue[] {
	let r: TreeValue[] = [];
	for (let i = 0; i < tree.children.length; i++) {
		if (tree.children[i].name == name) {
			r.push(tree.children[i]);
		}
	}
	return r;
}
