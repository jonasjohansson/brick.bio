const GALLERY_ID = '1NBdYD9d4TDNCyloiUFu8qi7XwihIp1TCje0MotoESg4';
const CATEGORIES = ['promoter', 'terminator', 'coding_sequence', 'rbs'];
const STANDARDS = [['standard_igem', 'Standard iGEM', 'GACGCCAGGTTGAATGAATTCGCGGCCGCTTCTAGA', 'TACTAGTAGCGGCCGCTGCAGTACCTCCAAATACGG'], ['standard_coding', 'Standard Coding Sequences', 'GAATTCGCGGCCGCTTCTAGATG', 'TACTAGTAGCGGCCGCTGCAG'], ['bb-2', 'BB-2', 'GAATTCGCGGCCGCACTAGT', 'GCTAGCGCGGCCGCTGCAG'], ['bgl', 'BglBricks', 'GAATTCATGAGATCT', 'GGATCCTTACTCGAG'], ['silver', 'Silver', 'GAATTCGCGGCCGCTTCTAGA', 'GAATTCGCGGCCGCTTCTAGA'], ['freiburg', 'Freiburg', 'GAATTCGCGGCCGCTTCTAGATGGCCGGC', 'ACCGGTTAATACTAGTAGCGGCCGCTGCAG']];
const HEADINGS = ['name', 'uses', 'category', 'description'];

var ALL_BRICKS;
var PREFIX = '';
var SUFFIX = '';

window.addEventListener('load', () => {
	for (var a of document.querySelectorAll('a')) {
		a.target = '_blank';
	}
	parseGSX('1-skfNnBOJsUmO6NR_1eDyFAH3d8GeTvpKCP2QWi-ZEw', init);
});

var init = data => {
	document.body.classList.remove('loading');
	ALL_BRICKS = data;

	data.sort(function(a, b) {
		return b['uses'] - a['uses'];
	});

	createBricks(data);
	createBricksSequence();
	createFilter();
	createStandards();
};

var createBricks = data => {
	$bricks = document.querySelector('#bricks');
	$bricks_sequence = document.querySelector('#bricks_sequence');

	for (let row of data) {
		const part = {
			name: row['name'],
			category: row['category'].toLowerCase(),
			description: row['description'],
			uses: row['uses'],
			direction: row['direction'],
			community: row['community']
		};

		$brick = createEl('div', $bricks);
		$brick.classList.add('brick');

		$brick.setAttribute('data-category', part.category);

		$brick.setAttribute('data-meta', [part.name, part.description, part.direction, part.community].join(' '));

		$brick_box = createEl('button', $brick);
		$brick_box.classList.add('brick_box');
		$brick_box.id = row['name'];
		$brick_box.setAttribute('draggable', true);
		$brick_box.textContent = row['name'];
		$brick_box.addEventListener('dragstart', dragstart);
		$brick_box.addEventListener('click', () => {
			var clone = createClone(row['name']);
			$bricks_sequence.appendChild(clone);
		});

		$brick_description = createEl('div', $brick);
		$brick_description.classList.add('brick_description');
		$brick_description.innerHTML = `<sub>${row['description']}</sub> ${row['description']} <sup>${row['uses']}</sup> `;
	}
};

var createBricksSequence = () => {
	$bricks_sequence = document.querySelector('#bricks_sequence');
	$bricks_sequence.addEventListener('dragover', dragover);
	$bricks_sequence.addEventListener('dragleave', dragleave);
	$bricks_sequence.addEventListener('dragenter', dragenter);
	$bricks_sequence.addEventListener('drop', drop);
};

var createFilter = () => {
	var $filter = document.querySelector('#bricks_filter');

	var filter_categories = createEl('div', $filter);
	var style = createEl('style', document.body);

	for (let cat of CATEGORIES) {
		var group = createEl('div', filter_categories);
		var label = createEl('label');
		var input = createEl('input');
		input.type = 'radio';
		input.name = 'category';
		input.id = input.value = label.innerHTML = cat;
		if (cat.length < 4) label.innerHTML = label.innerHTML.toUpperCase();
		label.setAttribute('for', cat);
		group.appendChild(input);
		group.appendChild(label);
		input.addEventListener('change', () => {
			document.body.setAttribute('data-category', cat);
		});
		style.innerHTML += `body[data-category=${cat}] .brick:not([data-category*="${cat}"]):not(.selected) { display: none; }\n`;
		if (cat === 'promoter') input.click();
	}

	var filter_keyword = createEl('div', $filter);
	var label = createEl('label', filter_keyword);
	var input = createEl('input', filter_keyword);

	input.id = input.name = label.innerHTML = 'keyword';
	label.setAttribute('for', 'keyword');

	style = createEl('style', document.body);

	input.onkeyup = event => {
		values = event.currentTarget.value.split(/[ ,.]+/);
		style.innerHTML = '';
		for (val of values) {
			if (val.length === 0) return;
			style.innerHTML += `.brick:not(.selected):not([data-meta*="${val}"]) { display: none; }\n`;
		}
	};
};

var createStandards = () => {
	$standard = document.querySelector('#bricks_sequence_standard');
	select = createEl('select', $standard);
	for (let standard of STANDARDS) {
		let option = createEl('option', select);
		option.name = 'standards';
		option.id = option.value = standard[0];
		option.textContent = standard[1];
	}
	select.onchange = event => {
		index = event.target.selectedIndex;
		PREFIX = STANDARDS[index][2];
		SUFFIX = STANDARDS[index][3];
	};

	PREFIX = STANDARDS[0][2];
	SUFFIX = STANDARDS[0][3];
};

function dragstart(e) {
	e.dataTransfer.setData('text', e.target.id);
	e.target.classList.add('highlight');
}

function dragover(e) {
	e.preventDefault();
	e.target.classList.remove('highlight');
}

function dragleave(e) {
	e.preventDefault();
}

function dragenter(e) {
	e.preventDefault();
}

function dragend(e) {
	e.preventDefault();
}

function drop(e) {
	id = e.dataTransfer.getData('text');
	if (id.includes('clone')) {
		e.preventDefault();
		return;
	}
	clone = createClone(id);
	e.currentTarget.appendChild(clone);
	enableDragSort('drag-sort-enable');
}

var createClone = id => {
	let el = document.getElementById(id);
	let clone = el.cloneNode(true);
	el.parentNode.classList.add('selected');
	clone.addEventListener('dblclick', function() {
		clone.parentNode.removeChild(clone);
		el.parentNode.classList.remove('selected');
	});
	return clone;
};

/* button functions */

var copyClipboard = () => {
	var textarea = document.querySelector('#textarea');
	var range = document.createRange();
	range.selectNode(textarea);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand('copy');
};

var getFasta = event => {
	sequence = document.querySelector('#textarea').textContent;

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
	textToSpeech(document.querySelector('#textarea').textContent);
};

var generateSequence = () => {
	bricks = document.querySelectorAll('#bricks_sequence > *');

	var sequence = '';

	for (let brick of bricks) {
		var part = getObjects(ALL_BRICKS, 'name', brick.id);
		sequence += `<span>${part[0].partsequence.toUpperCase()}</span>`;
	}

	document.querySelector('#textarea').innerHTML = `${PREFIX}${sequence}${SUFFIX}`;
};

function textToSpeech(what) {
	var utter = new SpeechSynthesisUtterance();
	utter.rate = 10;
	utter.pitch = 8;
	utter.text = what;
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
