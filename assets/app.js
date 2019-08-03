const SPREADSHEET_ID = '1-skfNnBOJsUmO6NR_1eDyFAH3d8GeTvpKCP2QWi-ZEw';
const CATEGORIES = ['promoter', 'terminator', 'coding_sequence', 'rbs'];
const STANDARDS = [['standard_igem', 'Standard iGEM', 'GACGCCAGGTTGAATGAATTCGCGGCCGCTTCTAGA', 'TACTAGTAGCGGCCGCTGCAGTACCTCCAAATACGG'], ['standard_coding', 'Standard Coding Sequences', 'GAATTCGCGGCCGCTTCTAGATG', 'TACTAGTAGCGGCCGCTGCAG'], ['bb-2', 'BB-2', 'GAATTCGCGGCCGCACTAGT', 'GCTAGCGCGGCCGCTGCAG'], ['bgl', 'BglBricks', 'GAATTCATGAGATCT', 'GGATCCTTACTCGAG'], ['silver', 'Silver', 'GAATTCGCGGCCGCTTCTAGA', 'GAATTCGCGGCCGCTTCTAGA'], ['freiburg', 'Freiburg', 'GAATTCGCGGCCGCTTCTAGATGGCCGGC', 'ACCGGTTAATACTAGTAGCGGCCGCTGCAG']];
const HEADINGS = ['name', 'uses', 'category', 'description'];
const PARTS = [];
const EMPTY_STRING = 'Empty';

var PARTS_DATA;
var PREFIX = '';
var SUFFIX = '';

window.addEventListener('load', () => {
	parseGSX(SPREADSHEET_ID, init);
	createCategories();
	createFilter();
	createStandards();
});

var init = data => {
	$parts_available = document.querySelector('#parts_available');

	PARTS_DATA = data;

	data.sort(function(a, b) {
		return b['uses'] - a['uses'];
	});

	// for each data entry
	for (let row of data) {
		const part = {
			name: row['name'],
			category: row['category'].toLowerCase(),
			description: row['description'],
			uses: row['uses'],
			direction: row['direction'],
			community: row['community']
		};

		part.url = `http://parts.igem.org/cgi/xml/part.cgi?part=${part.name}`;

		div = createEl('div', $parts_available);

		button = createEl('button', div);
		button.onclick = function() {
			addPart(part.name);
		};
		button.innerHTML = '+';

		link = createEl('a', div);
		link.href = `http://parts.igem.org/cgi/xml/part.cgi?part=${part.name}`;
		link.innerHTML = part.name;
		link.target = '_blank';

		meta = createEl('span', div);
		meta.innerHTML = ` (${part.uses})`;

		desc = createEl('div', div);
		desc.classList.add('description');
		desc.innerHTML = part.category + ', ' + [part.description, part.community].join(' ');

		div.id = part.name;
		div.classList.add('part');
		div.setAttribute('data-category', part.category);
		div.setAttribute('data-meta', [part.name, part.description, part.direction, part.community].join(' '));
	}
};

var createCategories = () => {
	$categories = document.querySelector('#categories');
	style = createEl('style', document.body);
	for (let cat of CATEGORIES) {
		group = createEl('div');
		label = createEl('label');
		input = createEl('input');
		input.type = 'radio';
		input.name = 'category';
		input.id = input.value = label.innerHTML = cat;
		label.setAttribute('for', cat);
		group.appendChild(input);
		group.appendChild(label);
		// $categories.appendChild(group);
		$categories.insertBefore(group, $categories.lastElementChild);
		input.addEventListener('change', () => {
			document.body.setAttribute('data-category', cat);
		});
		style.innerHTML += `body[data-category=${cat}] .part:not([data-category*="${cat}"]):not(.selected) { display: none; }\n`;
		if (cat === 'promoter') input.click();
	}
};

var createFilter = () => {
	$keywords = document.querySelector('#keywords');
	style = createEl('style', document.body);
	$keywords.onkeyup = event => {
		values = event.currentTarget.value.split(/[ ,.]+/);
		style.innerHTML = '';
		for (val of values) {
			if (val.length === 0) return;
			style.innerHTML += `.part:not([data-meta*="${val}"]) { display: none; }\n`;
		}
	};
};

var createStandards = () => {
	$standards = document.querySelector('#standards');
	for (let standard of STANDARDS) {
		div = createEl('div', $standards);
		let input = createEl('input', div);
		label = createEl('label', div);
		input.type = 'radio';
		input.name = 'standards';
		input.id = input.value = standard[0];
		label.innerHTML = standard[1];
		input.onchange = () => {
			PREFIX = standard[2];
			SUFFIX = standard[3];
		};
		label.setAttribute('for', standard);
	}
	$standards.querySelector('input').click();
};

var update = () => {
	$sequence = document.querySelector('#sequence');

	$sequence_select = document.querySelectorAll('#sequence select');

	var part_name = PARTS[PARTS.length - 1];

	for (let select of $sequence_select) {
		var option = document.createElement('option');
		option.value = part_name;
		option.innerHTML = part_name;
		select.appendChild(option);
	}
};

var updateSequence = () => {
	$sequence_select = document.querySelectorAll('#sequence select');

	var tmp_sequence = '';

	for (let select of $sequence_select) {
		var val = select.value;

		if (val !== EMPTY_STRING) {
			var part = getObjects(PARTS_DATA, 'name', val);
			tmp_sequence += `<span>${part[0].partsequence.toUpperCase()}</span>`;
		}
	}

	document.querySelector('#textarea').innerHTML = `${PREFIX}${tmp_sequence}${SUFFIX}`;
};

/* button functions */

var addPart = part_name => {
	var partExists = PARTS.indexOf(part_name) > -1;

	if (partExists) {
		alert('Already added!');
		return;
	}

	var part = document.getElementById(part_name);
	var parent = document.getElementById(part_name).parentNode;
	parent.insertBefore(part, parent.firstElementChild);
	part.classList.add('selected');

	PARTS.push(part_name);
	update();
};

var addPartPlaceholder = event => {
	var clone = event.previousElementSibling.cloneNode(true);
	event.parentNode.insertBefore(clone, event);
};

var copyClipboard = () => {
	var textarea = document.querySelector('#textarea');
	var range = document.createRange();
	range.selectNode(textarea);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand('copy');
};

var downloadFasta = event => {
	var sequence = document.querySelector('#textarea').textContent;

	if (sequence.length === 0) {
		alert('Generate a sequence first!');
		return;
	}

	var name = prompt(`Enter Fasta file name`);
	if (name.length === 0) name = ID();

	var fasta_sequence = `>${name}\n${sequence}`;
	var link = event.firstElementChild;
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fasta_sequence));
	link.setAttribute('download', `${name}.fasta`);
};

var sayIt = () => {
	if (window.speechSynthesis.getVoices().length == 0) {
		window.speechSynthesis.addEventListener('voiceschanged', function() {
			textToSpeech();
		});
	} else {
		textToSpeech();
	}
};

var generateSequence = () => {
	updateSequence();
};

function textToSpeech() {
	// get all voices that browser offers
	var available_voices = window.speechSynthesis.getVoices();

	// this will hold an english voice
	var english_voice = '';

	// find voice by language locale "en-US"
	// if not then select the first voice
	for (var i = 0; i < available_voices.length; i++) {
		if (available_voices[i].lang === 'en-US') {
			english_voice = available_voices[i];
			break;
		}
	}
	if (english_voice === '') english_voice = available_voices[0];

	// new SpeechSynthesisUtterance object
	var utter = new SpeechSynthesisUtterance();
	utter.rate = 10;
	utter.pitch = 10;
	utter.text = sequence;
	utter.voice = english_voice;

	// speak
	window.speechSynthesis.speak(utter);
}

var ID = function() {
	return (
		'_' +
		Math.random()
			.toString(36)
			.substr(2, 9)
	);
};

var createEl = (type, parent = false) => {
	el = document.createElement(type);
	if (parent) parent.appendChild(el);
	return el;
};

function compare(a, b) {
	if (a.time < b.time) return -1;
	if (a.time > b.time) return 1;
	return 0;
}

if (annyang) {
	var commands = {
		generate: function() {
			generateSequence();
		}
	};
	annyang.addCommands(commands);
	annyang.start();
}
