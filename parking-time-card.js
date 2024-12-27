class ParkingTimeCard extends HTMLElement {
    constructor() {
        super();
        Object.defineProperty(this, 'timeZone', {
            value: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/Stockholm",
            writable: false
        });
        Object.defineProperty(this, 'locale', {
            value: 'en-SE',
            writable: false
        });
    }

    set hass(hass) {
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const parkingStartTime = new Date(state.state);

        this.updateTime(parkingStartTime);

        if (!this.interval) {
            this.interval = setInterval(() => this.updateTime(parkingStartTime), 1000);
        }
    }

    updateTime(startTime) {
        this.innerHTML = `
            <ha-alert title="Has been parked for" alert-type="info">
                <span slot="icon">
                    <ha-icon icon="mdi:parking"></ha-icon>
                </span>
                <div class="primary">
                    ${this.elapsedTimeString(startTime)}
                </div>
                <div class="secondary">
                    ${this.parkingTimeString(startTime)}
                </div> 
            </ha-alert>`;
    }

    elapsedTimeString(startTime) {
        const now = new Date();
        const elapsed = now - startTime;
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        return `${days > 0 ? `${days}d ` : ''}${this.pad(hours)} h ${this.pad(minutes)} min ${this.pad(seconds)} s`;
    }

    parkingTimeString(startTime) {
        const options = {
            hour12: false,
            timeZone: this.timeZone
        };

        try {
            return startTime.toLocaleString(this.locale, options);
        } catch (error) {
            console.error(error);
        }
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