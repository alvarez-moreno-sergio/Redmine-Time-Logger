let start = document.getElementById("startDate"); //$("#startDate");
let end = document.getElementById("endDate"); //$("#endDate");
start.addEventListener('change', function() {
    if (start.value) end.min = start.value;
}, false);

$(".theme a:nth-child(1)").on('click',function () {
    changeTheme();
});
$(".theme a:nth-child(2)").on('click',function () {
    toggleParticles();
});

let particlesOnName = 'particlesOn';
let actualParticlesOnValueString = getOnLocalStorage(particlesOnName);
let actualParticlesOnValueBoolean = actualParticlesOnValueString === 'true';
actualParticlesOnValueBoolean = actualParticlesOnValueString===''?true:actualParticlesOnValueBoolean;
setOnLocalStorage(particlesOnName,actualParticlesOnValueBoolean);
$(document).ready(function () {
    // Loading external library
    // Particles JS
    // https://github.com/VincentGarreau/particles.js/
    if (actualParticlesOnValueBoolean) init('#000'); // load black particles

    loadForm();
});


// DEPRECATED
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// REPLACED WITH
function getOnLocalStorage(name){
    let value = localStorage.getItem(name);
    return value===null?'':value;
}

// DEPRECATED
function setAPIKeyCookie(){
    const currentAPIKeyElem = document.getElementById("apiKey");
    let currentApiKeyCookie = getCookie('apiKey');
    if (currentAPIKeyElem.value === ''){
        currentAPIKeyElem.value = currentApiKeyCookie===undefined?'':currentApiKeyCookie;
    }
    else {
        let apiKeyCookie = `apiKey=${currentAPIKeyElem.value}`;
        document.cookie = apiKeyCookie;
    }
}

// REPLACED WITH
function setOnLocalStorage(name,value){
    if (typeof(Storage) !== undefined && value !== undefined)
        localStorage.setItem(name,value);
}

function saveForm(fieldsID){  
    fieldsID.forEach(function(element){
        setOnLocalStorage(element, $(`#${element}`).val());
    });
}

function loadForm(){
    if (typeof(Storage) !== undefined){
        $("form input[name!=''], textarea").each(function(){
            let localStorageValue = getOnLocalStorage(this.name);
            if (localStorageValue !== undefined)
                this.value = localStorageValue;
        });
    }
}

function send(){
    let elementsInForm = [];
    $("form input[name!=''], textarea").each(function(){elementsInForm.push(this.id)});
    saveForm(elementsInForm);

    return confirm('You sure?');
}

let currentWhiteTheme = getOnLocalStorage('currentWhiteTheme');
if (currentWhiteTheme === ''){
    currentWhiteTheme = true;
}
else {
    currentWhiteTheme = (currentWhiteTheme === 'true');
}

if (!currentWhiteTheme){
    $("body").addClass('black-theme');
    $(".main-div").addClass('black-main-div');
}
else {
    $("body").removeClass('black-theme');
    $(".main-div").removeClass('black-main-div');
}
setOnLocalStorage('currentWhiteTheme',currentWhiteTheme);

function changeTheme(){
    // Toggle white/black theme
    currentWhiteTheme = !currentWhiteTheme;
    setOnLocalStorage('currentWhiteTheme',currentWhiteTheme);

    $("body").toggleClass('black-theme');
    $(".main-div").toggleClass('black-main-div');

    stopParticlesJS();
    if (actualParticlesOnValueBoolean) init(
        currentWhiteTheme?"#000":"#fff"
    );
}

function toggleParticles(){
    actualParticlesOnValueBoolean = !actualParticlesOnValueBoolean;
    setOnLocalStorage(particlesOnName, actualParticlesOnValueBoolean);

    stopParticlesJS();
    if (actualParticlesOnValueBoolean) init(
        currentWhiteTheme?"#000":"#fff"
    );

}

function stopParticlesJS(){
    // Stop particles
    if (window.pJSDom[0]!==undefined) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window["pJSDom"] = [];
    }
}