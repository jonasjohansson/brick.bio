const SPREADSHEET_ID = '1Fl4yFCPYMPU3_tdpOYBXDDdreYHaAKKIPYf4KRHRSRQ';

window.addEventListener('load', () => {
	for (var a of document.querySelectorAll('a')) a.target = '_blank';
	parseGSX(SPREADSHEET_ID, init);
});

var init = data => {
	console.log(data);
	$sequences = document.querySelector('#sequences');

	for (let row of data) {
		$sequence = createEl('section', document.body);
		$sequence.classList.add('sequence');

		h2 = createEl('h3', $sequence);
		author = createEl('a', h2);
		author.href = 'mailto:' + row['email'];
		author.textContent = row['name'];

		comment = createEl('div', $sequence);
		comment.textContent = row['comment'];

		// note = createEl('div', $sequence);
		// note.textContent = row['note'];

		p = createEl('p', $sequence);
		download = createEl('a', p);
		download.href = row['file'];
		download.textContent = 'Download FASTA';
	}
};

var createEl = (type, parent = false) => {
	el = document.createElement(type);
	if (parent) parent.appendChild(el);
	return el;
};
