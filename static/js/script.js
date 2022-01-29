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
	const map = L.map("map").setView([latitude, longitude], 14);

	// eslint-disable-next-line no-undef
	L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(map);

	map.on("click", (event) => {
		const { lat, lng } = event.latlng;
		createPin([lat, lng], map, "running-popup");
	});
}

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(loadMap, () =>
		alert("Error encountered while fetching your location.")
	);
}
