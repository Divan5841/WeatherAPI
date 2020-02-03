const requestUrl = 'https://api.openweathermap.org/data/2.5/forecast/daily';
const keyApi = 'dc963d586e747302682e9144d2ec250c';

const inputTown = document.querySelector('.input_name');
const buttonInput = document.querySelector('.submit_input_name');
const nameTown = document.querySelector('.name_town');
const temp = document.querySelector('.temp_town');
const desc = document.querySelector('.desc_town');
const sunrise = document.querySelector('.sunrise_town');
const sunset = document.querySelector('.sunset_town');
const container = document.querySelector('.forecast_weather');
const buttonAbort = document.querySelector('.abort_fetch_button');
const loaderBox = document.querySelector('.loader_box');
const errorBox = document.querySelector('.error_box');
const messageError = document.querySelector('.message_error');
const errorButton = document.querySelector('.error_button');

let controller;
const controllerStartWeather = new AbortController();

function requestStartTown(pos) {
    fetch(`${requestUrl}?lat=${Math.round(pos.coords.latitude)}&lon=${Math.round(pos.coords.longitude)}&appid=${keyApi}`, {signal: controllerStartWeather.signal})
        .then(response => response.json())
        .then(data => {
            closeLoader();
            displayWeather(data);
            displayWeek(data)
        })
        .catch(err => {
            if (err.name === 'AbortError') {
                temp.innerHTML = ''
            } else if (err.name === 'TypeError')
                displayError(`Что-то пошло не так...`);
            else throw err;
        });

}

function startTown() {
    navigator.geolocation.getCurrentPosition(requestStartTown);
}

function displayWeek(data) {
    container.innerHTML = '';
    const days = data['list'];
    days.forEach(item => {
        const gotDataWeek = {
            date: getDay(item['dt']),
            minTemp: Math.round(convertKelvinToCelsius(item['temp']['min'])),
            maxTemp: Math.round(convertKelvinToCelsius(item['temp']['max'])),
            img: `http://openweathermap.org/img/w/${item['weather'][0]['icon']}.png`,
            imgAlt: item['weather'][0]['description'],
        };

        const div = document.createElement('div');

        const firstDiv = `<div class="day_week"> ${gotDataWeek.date} </div>`;
        const secondDiv = `<div> <p> min: ${gotDataWeek.minTemp} C</p><p> max: ${gotDataWeek.maxTemp} C</p> </div>`;
        const thirdDiv = `<div> <img src="${gotDataWeek.img}" alt="${gotDataWeek.imgAlt}"> </div>`;

        div.innerHTML = ` ${firstDiv} ${secondDiv} ${thirdDiv}`;
        container.append(div);

    })
}

function displayWeather(data) {
    const gotDataWeather = {
        nameTown: data['city']['name'],
        tempTown: data['list'][0]['temp']['day'],
        descTown: data['list'][0]['weather'][0]['main'],
        sunriseTown: data['list'][0]['sunrise'],
        sunsetTown: data['list'][0]['sunset'],
    };
    nameTown.innerHTML = gotDataWeather.nameTown;
    temp.innerHTML = `Температура: ${convertKelvinToCelsius(gotDataWeather.tempTown)} C`;
    desc.innerHTML = translateDesc(gotDataWeather.descTown);
    sunrise.innerHTML = `Восход: ${getClock(gotDataWeather.sunriseTown)}`;
    sunset.innerHTML = `Закат: ${getClock(gotDataWeather.sunsetTown)}`;
}

function RequestWeather(requestUrl, keyApi) {
    if (inputTown.value === '') {
        displayError('Вы не ввели название города...');
        return;
    }
    controller = new AbortController();
    closeError();
    displayLoader(inputTown.value);
    controllerStartWeather.abort();
    fetch(`${requestUrl}?q=${inputTown.value}&mode=json&appid=${keyApi}`, {signal: controller.signal})
        .then(response => response.json())
        .then(data => {
            closeLoader();
            displayWeather(data);
            displayWeek(data)
        })
        .catch(err => {
            if (err.name === 'AbortError')
                displayError('Поиск отменен');
            else if (err.name === 'TypeError')
                displayError(`Город ${inputTown.value} не найден`);
            else
                throw err;
        })
}

function checkEnterInput(event) {
    if (event.key === 'Enter') {
        RequestWeather(requestUrl, keyApi);
    }
}

function getClock(gotSec) {
    const time = new Date(gotSec * 1000);
    return (`${time.getHours()}:${time.getMinutes()}`)
}

function getDay(gotSec) {
    const daysWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const time = new Date(gotSec * 1000);
    return (`${daysWeek[time.getDay()]}`);
}

function convertKelvinToCelsius(kelvin) {
    if (kelvin < (0)) {
        return 'below absolute zero (0 K)';
    } else {
        return (kelvin - 273.15);
    }
}

function translateDesc(desc) {
    const descRu = {
        'clear': 'Чистое небо',
        'few clouds': 'Мало облаков',
        'scattered clouds': 'Рассеянные облака',
        'broken clouds': 'Облачность',
        'shower rain': 'Град',
        'rain': 'Дождь',
        'thunderstorm': 'Гроза',
        'snow': 'Снег',
        'mist': 'Туман',
    };
    if (descRu[desc.toLowerCase()] !== undefined)
        return descRu[desc.toLowerCase()];
    else
        return desc
}

function closeLoader() {
    loaderBox.style.display = 'none';
}

function displayLoader(nameTown) {
    loaderBox.style.display = 'block';
    const p = document.getElementById('nameTown');
    p.innerHTML = `Уточняем погоду в ${nameTown}`;
}

function abortFetch() {
    controller.abort();
}

function closeError() {
    errorBox.style.display = 'none';
}

function displayError(message) {
    errorBox.style.display = 'block';
    messageError.innerHTML = message;
}

buttonInput.addEventListener('click', () => (RequestWeather(requestUrl, keyApi)));
inputTown.addEventListener('keypress', () => (checkEnterInput(event)));
window.addEventListener('load', startTown);
buttonAbort.addEventListener('click', closeLoader);
buttonAbort.addEventListener('click', abortFetch);
errorButton.addEventListener('click', closeError);







