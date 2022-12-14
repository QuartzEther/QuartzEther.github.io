window.addEventListener('load', onLoad);

function onLoad() {
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();

			document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
				anchor.classList.remove('selected');
			});

			this.classList.toggle('selected');

			var selectorName = this.getAttribute('href').substr(1);
			console.log(selectorName);

			document.querySelectorAll('div[class^="card"]').forEach((anchor) => {
				if (!anchor.classList.contains(selectorName) && selectorName !== 'all') {
					anchor.classList.add('hidden-flag');
				} else {
					anchor.classList.remove('hidden-flag');
				}
			});
		});
	});
}
