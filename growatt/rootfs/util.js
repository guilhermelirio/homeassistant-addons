const axios = require('axios');
const SUPERVISOR = 'http://supervisor/core/api/states/';

class Util {

    async verifyOptions() {
        const filePath = path.join(__dirname, 'data', 'options.json');

        if (!fs.existsSync(filePath)) throw new Error("Arquivo options.json não existe.");

        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { login, password } = jsonData;

        if (login == "" || password == "") throw new Error("Preencha os campos login/password no addon.");

        return true;
    }

    async createSensor() {

        const entities = ['sensor.daily_generation', 'sensor.monthly_generation'];

        const stateAttributes = [
            {
                friendly_name: 'Daily Energy Generation',
                min: 0,
                step: 1,
                unit_of_measurement: 'KWh',
                mode: box,
                icon: 'mdi:calendar-clock',
                editable: true
            },
            {
                friendly_name: 'Monthly Energy Generation',
                min: 0,
                step: 1,
                unit_of_measurement: 'KWh',
                mode: box,
                icon: 'mdi:calendar-month',
                editable: true
            },
        ]
        for (let x in entities) {
            try {

                // Verifica se o sensor já existe
                const existingSensor = await axios.get(`${SUPERVISOR}${entities[i]}`);

                if (!existingSensor.data) {
                    // Se o sensor não existir, cria-o
                    await axios.post(`${SUPERVISOR}${entities[i]}`, {
                        state: 0,
                        attributes: stateAttributes,
                    });
                    console.log(`Sensor ${entities[i]} created.`);
                } else {
                    console.log(`Sensor ${entities[i]} already exists.`);
                }

            } catch (error) {
                console.error(`Error checking/creating sensor ${entities[i]}: ${error}`);
            }
        }
    }

}

module.exports = new Util();