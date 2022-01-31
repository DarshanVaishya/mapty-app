"use strict";

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
	id = String(Date.now());

	constructor(coords, distance, duration) {
		this.coords = coords;
		this.distance = distance; // in kilometers
		this.duration = duration; // in minutes
	}

	_setDescription() {
		// prettier-ignore
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
			months[this.date.getMonth()]
		} ${this.date.getDate()}`;
	}
}

class Running extends Workout {
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
		this.type = "running";
		this._setDescription();
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
		this.type = "cycling";
		this._setDescription();
	}

	calcSpeed() {
		this.speed = (this.distance * 60) / this.duration;
	}
}

class App {
	#map;
	#mapEvent;
	#mapZoomLevel = 14;
	#workouts = [];

	constructor() {
		this._getPosition();

		inputType.addEventListener("change", this._toggleElevationField);
		form.addEventListener("submit", this._newWorkout.bind(this));
		containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
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
		this.#map = L.map("map").setView([latitude, longitude], this.#mapZoomLevel);

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

	_clearForm() {
		// Reseting the inputs
		inputDistance.value = "";
		inputDuration.value = "";
		inputCadence.value = "";
		inputElevation.value = "";

		// Hide the form
		form.classList.add("hidden");
	}

	_toggleElevationField() {
		cadenceRow.classList.toggle("form__row--hidden");
		elevationRow.classList.toggle("form__row--hidden");
	}

	_newWorkout(e) {
		e.preventDefault();

		const allPositive = (...nums) => nums.every((num) => num > 0);

		// Collecting data
		const distance = +inputDistance.value;
		const duration = +inputDuration.value;
		const type = inputType.value;
		const { lat, lng } = this.#mapEvent.latlng;
		let workout;

		if (!allPositive(distance, duration)) {
			alert("Invalid input");
			return;
		}

		if (type === "running") {
			const cadence = +inputCadence.value;
			if (!allPositive(cadence)) return alert("Invalid input");
			workout = new Running([lat, lng], distance, duration, cadence);
		}

		if (type === "cycling") {
			const elevation = +inputElevation.value;
			if (!allPositive(elevation)) return alert("Invalid input");
			workout = new Cycling([lat, lng], distance, duration, elevation);
		}
		this.#workouts.push(workout);

		// Display data
		this._renderWorkoutMarker(workout);
		this._renderWorkout(workout);

		this._clearForm();
	}

	_renderWorkoutMarker(workout) {
		// eslint-disable-next-line no-undef
		const options = L.popup({
			maxWidth: 250,
			minWidth: 100,
			autoClose: false,
			closeOnClick: false,
			className: `${workout.type}-popup`,
		});

		// eslint-disable-next-line no-undef
		L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(options)
			.setPopupContent(
				` ${workout.type === "running" ? "🏃‍♂️" : "🚴"} ${workout.description}`
			)
			.openPopup();
	}

	_renderWorkout(workout) {
		let HTML = `
				<li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
							workout.type === "running" ? "🏃‍♂️" : "🚴"
						}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
		`;

		if (workout.type === "running") {
			HTML += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
			`;
		} else {
			HTML += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
				</li>
			`;
		}

		form.insertAdjacentHTML("afterend", HTML);
	}

	_moveToPopup(e) {
		const workoutEl = e.target.closest(".workout");
		if (!workoutEl) return;

		const workout = this.#workouts.find(
			(work) => work.id === workoutEl.dataset.id
		);

		this.#map.setView(workout.coords, this.#mapZoomLevel, {
			animate: true,
			pan: {
				duration: 1,
			},
		});
	}
}

const app = new App();
