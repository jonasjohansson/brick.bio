window.addEventListener('load', () => {
	parseGSX('1Fl4yFCPYMPU3_tdpOYBXDDdreYHaAKKIPYf4KRHRSRQ', init);
});

var init = data => {
	console.log(data);
	$sequences = document.querySelector('#sequences');

	for (let row of data) {
		$sequence = createEl('div', $sequences);
		$sequence.classList.add('sequence');

		$sequence.innerHTML = row['name'];
	}
};

var createEl = (type, parent = false) => {
	el = document.createElement(type);
	if (parent) parent.appendChild(el);
	return el;
};
