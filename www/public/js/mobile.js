(() => {
	const menuToggle = document.querySelector('.menu-toggle');
	const navbar = document.querySelector('nav');
	const navMenu = document.querySelector('.nav-menu');
	if (!menuToggle || !navbar) return;

	const closeMenu = () => {
		navbar.classList.remove('active');
	};

	const toggleMenu = e => {
		e.stopPropagation();
		navbar.classList.toggle('active');
	};

	menuToggle.addEventListener('click', toggleMenu);

	document.addEventListener('click', e => {
		if (navbar.classList.contains('active')) {
			const navContainer = navbar.querySelector('.nav-container');
			if (!navContainer.contains(e.target) && !navMenu.contains(e.target)) {
				closeMenu();
			}
		}
	});

	if (navMenu) {
		navMenu.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				if (window.innerWidth <= 1024) closeMenu();
			});
		});
	}

	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && navbar.classList.contains('active')) {
			closeMenu();
		}
	});

	if ('vibrate' in navigator && window.innerWidth <= 1024) {
		menuToggle.addEventListener('click', () => navigator.vibrate(10));
	}
})();