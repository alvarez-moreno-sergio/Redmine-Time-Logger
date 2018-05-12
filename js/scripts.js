let start = document.getElementById("startDate"); //$("#startDate");
let end = document.getElementById("endDate"); //$("#endDate");
start.addEventListener('change', function() {
    if (start.value) end.min = start.value;
}, false);

$(".theme a").on('click',function () {
    changeTheme();
});

$(document).ready(function () {
    // setAPIKeyCookie();
    // $("#apiKey").val(getOnLocalStorage('apiKey'));
    loadForm();
});


// DEPRECATED
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
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
    // setAPIKeyCookie();
    let elementsInForm = [];
    $("form input[name!=''], textarea").each(function(){elementsInForm.push(this.id)});
    saveForm(elementsInForm);
    // setOnLocalStorage('apiKey', $("#apiKey").val());

    return confirm('You sure?');
}

function changeTheme(){
    $("body").toggleClass('black-theme');
    $(".main-div").toggleClass('black-main-div');
}