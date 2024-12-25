class ParkingTimeCard extends HTMLElement {
    set hass(hass) {
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        this.innerHTML = `
            <ha-card>
                <div class="card-content">
                    Parking Time: ${state.state}
                </div>
            </ha-card>
        `;
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
}

customElements.define('parking-time-card', ParkingTimeCard);