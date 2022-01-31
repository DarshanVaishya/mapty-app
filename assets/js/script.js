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

class Workout {
	date = new Date();
	id = Date.now();

	constructor(coords, distance, duration) {
		this.coords = coords;
		this.distance = distance; // in kilometers
		this.duration = duration; // in minutes
	}
}

class Running extends Workout {
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
	}

	calcPace() {
		this.pace = this.duration / this.distance;
	}
}

class Cycling extends Workout {
	constructor(coords, distance, duration, elevation) {
		super(coords, distance, duration);
		this.elevation = elevation;
		this.calcSpeed();
	}

	calcSpeed() {
		this.speed = (this.distance * 60) / this.duration;
	}
}

class App {
	#map;
	#mapEvent;

	constructor() {
		this._getPosition();

		inputType.addEventListener("change", this._toggleElevationField);

		form.addEventListener("submit", this._newWorkout.bind(this));
	}

	_getPosition() {
		if (navigator.geolocation) {
			// learn/lecture/22649229#questions/16473574
			navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
				alert("Error encountered while fetching your location.")
			);
		}
	}

	_loadMap(position) {
		const { latitude, longitude } = position.coords;

		// 13 is zoom level
		// eslint-disable-next-line no-undef
		this.#map = L.map("map").setView([latitude, longitude], 14);

		// eslint-disable-next-line no-undef
		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);

		this.#map.on("click", this._showForm.bind(this));
	}

	_showForm(event) {
		this.#mapEvent = event;
		form.classList.remove("hidden");
		inputDistance.focus();
	}

	_toggleElevationField() {
		cadenceRow.classList.toggle("form__row--hidden");
		elevationRow.classList.toggle("form__row--hidden");
	}

	_newWorkout(e) {
		e.preventDefault();

		// Display data
		const { lat, lng } = this.#mapEvent.latlng;
		const type = inputType.value;
		app._createPin([lat, lng], `${type}-popup`);

		// Reseting the inputs
		inputDistance.value = "";
		inputDuration.value = "";
		inputCadence.value = "";
		inputElevation.value = "";

		// Hide the form
		form.classList.add("hidden");
	}

	_createPin(coords, className) {
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
			.addTo(this.#map)
			.bindPopup(options)
			.setPopupContent("Workout")
			.openPopup();
	}
}

const app = new App();
