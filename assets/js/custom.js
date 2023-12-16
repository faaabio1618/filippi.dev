document.addEventListener('DOMContentLoaded', init, false);

function init() {
    document.getElementById("years_experience").outerText = (new Date()).getFullYear() - 2013;
    document.getElementById("last_years").outerText = (new Date()).getFullYear() - 2021;
}
