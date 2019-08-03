const SPREADSHEET_ID = '1-skfNnBOJsUmO6NR_1eDyFAH3d8GeTvpKCP2QWi-ZEw';
const CATEGORIES = ['promoter', 'terminator', 'coding_sequence', 'rbs'];
const HEADINGS = ['name', 'uses', 'category', 'description'];
const PARTS = [];
const EMPTY_STRING = 'Empty';

var PARTS_DATA;
var PREFIX = 'GACGCCAGGTTGAATGAATTCGCGGCCGCTTCTAGA';
var SUFFIX = 'TACTAGTAGCGGCCGCTGCAGTACCTCCAAATACGG';
var RBS = 'TCTAGAGAAAGAGGGGACAAACTAGATG';

var $categories = document.querySelector('#categories');
var $parts_available = document.querySelector('#parts_available');
var $parts_available_btn = document.querySelector('#parts_available button');
var $your_parts = document.querySelector('#your_parts');

window.addEventListener('load', () => {
	parseGSX(SPREADSHEET_ID, init);
	createCategories();
	createFilter();
});

var init = data => {
	PARTS_DATA = data;

	// create table
	table = createEl('table', $parts_available);
	thead = createEl('thead', table);
	tbody = createEl('tbody', table);
	tr = createEl('tr', thead);

	// create table headings
	for (heading of HEADINGS) {
		th = createEl('th');
		th.innerHTML = heading;
		tr.appendChild(th);
		thead.appendChild(tr);
	}

	table_clone = table.cloneNode(true);
	$your_parts.appendChild(table_clone);

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

		tr = createEl('tr', tbody);
		td1 = createEl('td', tr);
		td2 = createEl('td', tr);
		td3 = createEl('td', tr);
		td4 = createEl('td', tr);
		td5 = createEl('td', tr);
		link = createEl('a', td1);
		link.href = 'http://parts.igem.org/cgi/xml/part.cgi?part=' + part.name;
		link.innerHTML = part.name;
		link.target = '_blank';
		td2.innerHTML = part.uses;
		td3.innerHTML = part.category;
		td4.innerHTML = [part.description, part.community].join(' ');
		td5.innerHTML = `<button onclick="addPart('${part.name}')">+</button>`;
		tr.id = part.name;
		tr.classList.add('part');
		tr.setAttribute('data-category', part.category);
		tr.setAttribute('data-meta', [part.name, part.description, part.direction, part.community].join(' '));
	}
};

var createCategories = () => {
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
		style.innerHTML += `body[data-category=${cat}] #parts_available .part:not([data-category*="${cat}"]) { display: none; }\n`;
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
			style.innerHTML += `.part:not([data-meta*="${val}"]) { display: none; }\n`;
		}
	};
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
		if (select.previousElementSibling.innerHTML === 'RBS') tmp_sequence += `<strong>${RBS}</strong>`;
		var val = select.value;

		if (val !== EMPTY_STRING) {
			var part = getObjects(PARTS_DATA, 'name', val);
			tmp_sequence += `<span>${part[0].partsequence.toUpperCase()}</span>`;
		}
	}

	document.querySelector('#textarea').innerHTML = `<strong>${PREFIX}</strong>${tmp_sequence}<strong>${SUFFIX}</strong>`;
};

/* button functions */

var setParam = which => {
	val = prompt(`Enter ${which}`);
	if (val === null) return;
	switch (which) {
		case 'prefix':
			PREFIX = val;
			break;
		case 'suffix':
			SUFFIX = val;
			break;
		case 'rbs':
			RBS = val;
			break;
	}
	// updateSequence();
};

var addPart = part_name => {
	var partExists = PARTS.indexOf(part_name) > -1;

	if (partExists) {
		alert('Already added!');
		return;
	}

	part_clone = document.getElementById(part_name).cloneNode(true);
	part_clone.querySelector('td:nth-child(5)').style.display = 'none';
	$your_parts.querySelector('table').appendChild(part_clone);

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
