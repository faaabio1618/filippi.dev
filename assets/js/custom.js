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

function spinNumber(elementId, finalNumber, duration, min, max) {
    const el = document.getElementById(elementId);
    const elSuffix = document.getElementById("year_suffix");

    const interval = duration / 100;
    if (!el) return;
    let currentInterval = interval;
    let forceValue = false;

    function getNumber() {
        let number = Math.floor(Math.random() * (max - min + 1)) + min;
        if (number === finalNumber) {
            return getNumber();
        }
        return number;
    }

    let spinner = setTimeout(function spin() {
        let number;
        if (forceValue) {
            number = finalNumber;
            clearTimeout(spinner);
        } else {
            number = getNumber();
            currentInterval = currentInterval + currentInterval / 10;
            spinner = setTimeout(spin, currentInterval);
        }
        el.innerText = number + "";
        if (elementId === "last_years") {
            if (number === 1) {
                elSuffix.style.visibility = 'hidden';
            } else {
                elSuffix.style.visibility = 'visible';
            }
        }
    }, currentInterval);
    setTimeout(() => {
        forceValue = true;
    }, duration);

}

function main_init() {
    if (location.pathname === "/") {
        const yearsOfExperience = new Date().getFullYear() - 2013;
        spinNumber("years_experience", yearsOfExperience, 3000, 10, 99);
        const lastYears = new Date().getFullYear() - 2021;
        spinNumber("last_years", lastYears, 3000, 1, 9);
    }
    chooseColor();
    setInterval(chooseColor, 60000);
}
