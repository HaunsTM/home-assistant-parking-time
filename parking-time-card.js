class ParkingTimeCard extends HTMLElement {
    set hass(hass) {
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const timestamp = new Date(state.state);
        const timeZone = this.config.time_zone;

        this.updateTime(timestamp, timeZone);

        if (!this.interval) {
            this.interval = setInterval(() => this.updateTime(timestamp, timeZone), 1000);
        }
    }

    updateTime(startTime, timeZone) {
        const now = new Date();
        const elapsed = now - startTime;
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timeZone
        };
        const localTimeString = startTime.toLocaleString(undefined, options).replace(',', '');

        this.innerHTML = `
            <ha-alert title="Has been parked for" alert-type="info">
                <div class="primary">
                    ${days > 0 ? `${days}d ` : ''}${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}
                </div>
                <div class="secondary">
                    Parked: ${localTimeString}
                </div>
            </ha-alert>`;
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