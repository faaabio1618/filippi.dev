document.addEventListener('DOMContentLoaded', main_init, false);

function chooseColor() {
    let colors = [
        {'base': '#218787', 'darker': '#1d6e6e'},
        {'base': '#876d21', 'darker': '#7a5f1d'},
        {'base': '#872154', 'darker': '#7a1d4b'}
    ];
    colors.sort(() => Math.random() - 0.5);
    for (let i = 1; i <= 3; i++) {
        document.documentElement.style.setProperty(`--var-color${i}`, colors[i - 1]['base']);
        document.documentElement.style.setProperty(`--var-color${i}-darker`, colors[i - 1]['darker']);
    }
}

function spinNumber(elementId, finalNumber, duration = 2000, interval = 100, min = 0, max = 100) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let spinner = setInterval(() => {
        el.innerText = (Math.floor(Math.random() * (max - min + 1)) + min) + "";
    }, interval);
    setTimeout(() => {
        clearInterval(spinner);
        el.innerText = finalNumber;
    }, duration);
}

function main_init() {
    if (location.pathname === "/") {
        const yearsOfExperience = new Date().getFullYear() - 2013;
        spinNumber("years_experience", yearsOfExperience, 2000, 100, 10,100);
        const lastYears = new Date().getFullYear() - 2021;
        spinNumber("last_years", lastYears, 2000, 100, 0, 10);
    }
    chooseColor();
    setInterval(chooseColor, 60000);
}
