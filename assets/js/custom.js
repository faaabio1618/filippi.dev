document.addEventListener('DOMContentLoaded', init, false);

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

function init() {
    document.getElementById("years_experience").outerText = (new Date()).getFullYear() - 2013;
    document.getElementById("last_years").outerText = (new Date()).getFullYear() - 2021;
    chooseColor();
    setInterval(chooseColor, 60000);
}
