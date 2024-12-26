class ParkingTimeCard extends HTMLElement {

    set hass(hass) {
        const entityId = this.config.entity;

        const state = hass.states[entityId];
        const parkingStartTime = new Date(state.state);

        const timeZone = this.config.time_zone;
        const locale = this.getLocale(hass);

        this.updateTime(parkingStartTime, locale, timeZone);

        if (!this.interval) {
            this.interval = setInterval(() => this.updateTime(parkingStartTime, timeZone), 1000);
        }
    }

    getLocale(hass) {
        const isValidLocale = locale => {
            const parts = locale.split('-');
            if (parts?.length !== 2) return false;
            try {
                new Intl.Locale(locale);
                return true;
            } catch {
                return false;
            }
        };

        if (isValidLocale(hass.language)) {
            return hass.language;
        } else {
            return 'en-SE'
        }
    }

    updateTime(startTime, locale, timeZone) {    
    
        // assign curent time values
        this.innerHTML = `
            <ha-alert title="Has been parked for" alert-type="info">
                <span slot="icon">
                    <ha-icon icon="mdi:parking"></ha-icon>
                </span>
                <div class="primary">
                    ${this.elapsedTimeString(startTime, locale, timeZone)}
                </div>
                <div class="secondary">
                    ${this.parkingTimeString(startTime, locale, timeZone)}
                </div>
            </ha-alert>`;
    }

    elapsedTimeString(startTime, locale, timeZone) {
        const now = new Date();
        const elapsed = now - startTime;
        const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        return `${days > 0 ? `${days}d ` : ''}${this.pad(hours)} h ${this.pad(minutes)} min ${this.pad(seconds)} s`;
    }

    parkingTimeString(startTime, locale, timeZone) {
        const options = {
            timeZone: timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        console.log(timeZone);
        return startTime.toLocaleString(locale, options);
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