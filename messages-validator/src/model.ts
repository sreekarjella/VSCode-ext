
export class Message {
	id: number;
	text: string;
	locale: string;
	key: string;
	type: string;
	constructor(id: number, text: string, locale: string, key: string, type: string) {
		this.id = id;
		this.text = text;
		this.locale = locale;
		this.key = key;
		this.type = type;
	}
}