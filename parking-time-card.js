class ParkingTimeCard extends HTMLElement {
    set hass(hass) {
        this.hass = hass;
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const timestamp = new Date(state.state);
        const timeZone = hass.config.time_zone;
        const localTime = new Date(timestamp.toLocaleString("en-US", { timeZone }));

        this.updateTime(localTime);

        if (!this.interval) {
            this.interval = setInterval(() => this.updateTime(localTime), 1000);
        }
    }

    updateTime(startTime) {
        const now = new Date();
        const elapsed = now - startTime;
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        this.innerHTML = `
            <ha-card>
                <style>
                    @font-face {
                        font-family: 'Digital-7';
                        src: url('/local/fonts/digital-7.ttf') format('truetype');
                    }
                    .time-display {
                        font-family: 'Digital-7', sans-serif;
                        font-size: 2em;
                    }
                </style>
                <div class="card-content">
                    <div class="label">Elapsed time since parking:</div>
                    <div class="time-display">${days > 0 ? `${days}d ` : ''}${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}</div>
                </div>
            </ha-card>
        `;
    }

    pad(value) {
        return String(value).padStart(2, '0');
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }
        this.config = config;
    }

    getCardSize() {
        return 1;
    }

    disconnectedCallback() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

customElements.define('parking-time-card', ParkingTimeCard);