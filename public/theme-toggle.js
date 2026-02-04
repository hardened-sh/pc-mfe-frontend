(function() {
    const btnTheme = document.getElementById('btn-theme');
    if (!btnTheme) return;

    const themeLabel = btnTheme.querySelector('.theme-label');

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeLabel) themeLabel.textContent = 'Dark';
    }

    btnTheme.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';

        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            if (themeLabel) themeLabel.textContent = 'Light';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            if (themeLabel) themeLabel.textContent = 'Dark';
        }
    });
})();
