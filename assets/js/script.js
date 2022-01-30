"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const cadenceRow = inputCadence.closest(".form__row");
const elevationRow = inputElevation.closest(".form__row");

let map;
let mapEvent;

function createPin(coords, map, className) {
	// eslint-disable-next-line no-undef
	const options = L.popup({
		maxWidth: 250,
		minWidth: 100,
		autoClose: false,
		closeOnClick: false,
		className,
	});

	// eslint-disable-next-line no-undef
	L.marker(coords)
		.addTo(map)
		.bindPopup(options)
		.setPopupContent("Workout")
		.openPopup();
}

function loadMap(position) {
	const { latitude, longitude } = position.coords;

	// 13 is zoom level
	// eslint-disable-next-line no-undef
	map = L.map("map").setView([latitude, longitude], 14);

	// eslint-disable-next-line no-undef
	L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	map.on("click", (event) => {
		mapEvent = event;
		form.classList.remove("hidden");
		inputDistance.focus();
	});
}

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(loadMap, () =>
		alert("Error encountered while fetching your location.")
	);
}

inputType.addEventListener("change", () => {
	cadenceRow.classList.toggle("form__row--hidden");
	elevationRow.classList.toggle("form__row--hidden");
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	// Display data
	const { lat, lng } = mapEvent.latlng;
	const type = inputType.value;
	createPin([lat, lng], map, `${type}-popup`);

	// Reseting the inputs
	inputType.value = "running";
	inputDistance.value = "";
	inputDuration.value = "";
	inputCadence.value = "";
	inputElevation.value = "";

	// Hide the form
	form.classList.add("hidden");
});
