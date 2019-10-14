const SPREADSHEET_ID = '1-skfNnBOJsUmO6NR_1eDyFAH3d8GeTvpKCP2QWi-ZEw';
const CATEGORIES = ['promoter', 'rbs', 'coding_sequence', 'terminator'];
const STANDARDS = [['sthlm_2019', 'Sthlm 2019', 'TCGCCTAGAATTACCTACCAGAGACGCCAAGTTGAATGAC', 'CCTGAGGTACGCATCAATCTGTATGTGCAAGAAACCCAAG', 'This sequences are generated to have very low complexity. Therefore they are perfectly suited to use them as Primer binding sites or for hybridisation dependent cloning like NEB ™ HIFI Assembly. We had very good experience with this cloning technique, having assembled our construct within one week.'], ['standard_igem', 'Standard iGEM', 'GACGCCAGGTTGAATGAATTCGCGGCCGCTTCTAGA', 'TACTAGTAGCGGCCGCTGCAGTACCTCCAAATACGG', 'b'], ['standard_coding', 'Standard Coding Sequences', 'GAATTCGCGGCCGCTTCTAGATG', 'TACTAGTAGCGGCCGCTGCAG', 'c'], ['bb-2', 'BB-2', 'GAATTCGCGGCCGCACTAGT', 'GCTAGCGCGGCCGCTGCAG', 'd'], ['bgl', 'BglBricks', 'GAATTCATGAGATCT', 'GGATCCTTACTCGAG', 'e'], ['silver', 'Silver', 'GAATTCGCGGCCGCTTCTAGA', 'GAATTCGCGGCCGCTTCTAGA', 'f'], ['freiburg', 'Freiburg', 'GAATTCGCGGCCGCTTCTAGATGGCCGGC', 'ACCGGTTAATACTAGTAGCGGCCGCTGCAG', 'g']];
const HEADINGS = ['name', 'uses', 'category', 'description'];

var ALL_BRICKS;
var PREFIX = '';
var SUFFIX = '';

var mySound, myPhrase, myPart;

function preload() {
    mySound = loadSound('assets/beatbox.mp3');
}

function setup() {
    masterVolume(0.5);
}

window.addEventListener('load', () => {
    parseGSX(SPREADSHEET_ID, init);
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

    for (var a of document.querySelectorAll('a')) a.target = '_blank';
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
        $brick_box.addEventListener('dragend', dragend);
        $brick_box.addEventListener('click', () => {
            var clone = createClone(row['name']);
            $bricks_sequence.appendChild(clone);
        });

        $brick_description = createEl('a', $brick);
        $brick_description.classList.add('brick_description');
        $brick_description.href = `http://parts.igem.org/partsdb/edit_seq.cgi?part=${row['name']}`;
        $brick_description.innerHTML = `<span>${row['category']} <sup>${row['uses']}</sup></span><span>${row['description']}</span>`;
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
        input.id = input.value = cat;
        label.innerHTML = cat.replace(/_/g, ' ');
        if (cat.length < 4) label.innerHTML = label.innerHTML.toUpperCase();
        label.setAttribute('for', cat);
        group.appendChild(input);
        group.appendChild(label);
        input.addEventListener('change', () => {
            document.body.setAttribute('data-category', cat);
        });
        // style.innerHTML += `body[data-category=${cat}] .brick:not([data-category*="${cat}" i]):not(.selected) { display: none; }\n`;
        style.innerHTML += `body[data-category=${cat}] .brick:not([data-category*="${cat}" i]) { display: none; }\n`;
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
            style.innerHTML += `.brick:not(.selected):not([data-meta*="${val}" i]) { display: none; }\n`;
        }
    };
};

var createStandards = () => {
    $standard = document.querySelector('#bricks_sequence_standard');
    select = createEl('select', $standard);
    info = createEl('p');
    index = 0;

    $standard.appendChild(info);
    for (let standard of STANDARDS) {
        let option = createEl('option', select);
        option.name = 'standards';
        option.id = option.value = standard[0];
        option.textContent = standard[1];
    }

    select.onchange = event => {
        index = event.target.selectedIndex;
        update();
    };

    function update() {
        PREFIX = STANDARDS[index][2];
        SUFFIX = STANDARDS[index][3];
        info.innerHTML = STANDARDS[index][4];
    }

    update();

    PREFIX = STANDARDS[0][2];
    SUFFIX = STANDARDS[0][3];
};

function dragstart(e) {
    e.dataTransfer.setData('text', e.target.id);
    e.target.classList.add('highlight');
    document.body.classList.add('dragging');
}

function dragend(e) {
    document.body.classList.remove('dragging');
}

function dragover(e) {
    e.preventDefault();
}

function dragleave(e) {
    e.preventDefault();
    e.target.classList.remove('highlight');
}

function dragenter(e) {
    e.preventDefault();
}

function dragend(e) {
    e.preventDefault();
    document.body.classList.remove('dragging');
}

function drop(e) {
    id = e.dataTransfer.getData('text') || null;
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (id === null || id.includes('clone')) {
        e.preventDefault();
        return;
    }
    clone = createClone(id);
    e.currentTarget.appendChild(clone);
}

var createClone = id => {
    let el = document.getElementById(id);
    let clone = el.cloneNode(true);
    clone.id = 'clone-' + id;
    let category = el.parentNode.getAttribute('data-category');
    for (var cat of CATEGORIES) {
        if (category.includes(cat)) category = cat;
    }
    clone.innerHTML = `${category}\n${clone.textContent}`;
    el.parentNode.classList.add('selected');
    clone.addEventListener('dblclick', function() {
        clone.parentNode.removeChild(clone);
        el.parentNode.classList.remove('selected');
    });
    enableDragSort('drag-sort-enable');
    return clone;
};

var copySequence = () => {
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

    var name = prompt(`Enter Fasta file name (default is 'igem')`);
    if (name === null) name = 'igem';

    var fasta_sequence = `>${name}\n${sequence}`;
    var link = event.firstElementChild;
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fasta_sequence));
    link.setAttribute('download', `${name}.fasta`);
};

var getGenbank = event => {
    sequence = document.querySelector('#textarea').textContent;

    if (sequence.length === 0) {
        alert('Generate a sequence first!');
        return;
    }

    var name = prompt(`Enter Genbank file name (default is 'igem')`);
    if (name === null) name = 'igem';

    var link = event.firstElementChild;
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(genbank_sequence));
    link.setAttribute('download', `${name}.genbank`);
};

var fasta_sequence = '';
var genbank_sequence = '';
var getSequence = () => {
    bricks = document.querySelectorAll('#bricks_sequence > *');

    var sequence = '';

    var sequenceLength = 5028;
    var sequenceCount = 1;
    var sequences = '';
    genbank_sequence = `LOCUS                                82 bp    DNA              UNK 01-JAN-2007
DEFINITION  Possible describtion by user
ACCESSION   bbtest
VERSION     testtest
KEYWORDS    .
SOURCE      E.coli 
ORGANISM  .
COMMENT     Possible comments

FEATURES             Location/Qualifiers
    Constructname   1..${sequenceLength}
                     /organism=
                     /db_xref=
                     /chromosome=
                     /map="9"\r\n`;

    genbank_sequence += `    PREFIX 1..${PREFIX.length}\r\n`;
    sequenceCount += PREFIX.length;
    sequences += PREFIX;
    for (let brick of bricks) {
        id = brick.id.replace(/clone-/g, '');
        var part = getObjects(ALL_BRICKS, 'name', id);

        /* check RBS and CDS */

        var cat = part[0].category;
        var seq = part[0].partsequence;
        var last = seq.substr(seq.length - 3).toLowerCase();
        var first = seq.substr(0, 3).toLowerCase();

        if (cat.includes('RBS') && last === 'atg') {
            part[0].partsequence = part[0].partsequence.substr(0, seq.length - 3);
            // part[0].partsequence += 'atg';
        }

        if (cat.includes('coding_sequence') && first === 'atg') {
            part[0].partsequence = 'atg' + seq;
            // part[0].partsequence = part[0].partsequence.slice(3);
        }

        genbank_sequence += `    ${part[0].category}      ${sequenceCount}..${sequenceCount + part[0].partsequence.length}\r\n`;

        sequenceCount += part[0].partsequence.length;

        sequences += part[0].partsequence;

        sequence += `<span>${part[0].partsequence.toUpperCase()}</span>`;
    }
    sequences += SUFFIX;

    genbank_sequence += `    SUFFIX ${sequenceCount}..${sequenceCount + SUFFIX.length}\r\n`;
    sequenceCount += PREFIX.length;

    genbank_sequence += `ORIGIN
                   1 ${sequences}`;

    document.querySelector('#textarea').innerHTML = `${PREFIX}${sequence}${SUFFIX}`;
};

function textToSpeech(what) {
    var utter = new SpeechSynthesisUtterance();
    utter.rate = 10;
    utter.pitch = 8;
    utter.text = what;
    window.speechSynthesis.speak(utter);
}

function playSequence(what) {
    what = what.toLowerCase();
    what = what.replaceAll('g', '0');
    what = what.replaceAll('a', '1');
    what = what.replaceAll('t', '2');
    what = what.replaceAll('c', '3');
    var pattern = what
        .split('')
        .join(',')
        .split(',');

    myPhrase = new p5.Phrase('bbox', makeSound, pattern);
    myPart = new p5.Part();
    myPart.addPhrase(myPhrase);
    myPart.setBPM(60);

    function makeSound(time, playbackRate) {
        mySound.rate(playbackRate);
        mySound.play(time);
    }

    myPart.start();
}

var createEl = (type, parent = false) => {
    el = document.createElement(type);
    if (parent) parent.appendChild(el);
    return el;
};

String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), ignore ? 'gi' : 'g'), typeof str2 == 'string' ? str2.replace(/\$/g, '$$$$') : str2);
};

function compare(a, b) {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
}
