window.addEventListener('load', () => {
	parseGSX('1Fl4yFCPYMPU3_tdpOYBXDDdreYHaAKKIPYf4KRHRSRQ', init);
});

var init = data => {
	console.log(data);
	$sequences = document.querySelector('#sequences');

	for (let row of data) {
		$sequence = createEl('div', $sequences);
		$sequence.classList.add('sequence');

		h2 = createEl('h2', $sequence);
		author = createEl('a', $sequence);
		a.href = 'mailto:' + row['email'];
		author.textContent = row['name'];

		sequence = createEl('textarea', $sequence);
		sequence.textContent = row['sequence'];

		comment = createEl('div', $sequence);
		comment.textContent = row['comment'];

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
