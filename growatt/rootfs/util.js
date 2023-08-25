const axios = require('axios');
const SUPERVISOR = 'http://supervisor/core/api/states/';
const fs = require('fs');
const path = require('path');

class Util {

    async getData() {
        const filePath = path.join(__dirname, 'data', 'options.json');

        if (!fs.existsSync(filePath)) throw new Error("Arquivo options.json não existe.");

        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { login, password } = jsonData;

        if (login == "" || password == "") throw new Error("Preencha os campos nas configurações do addon.");

        return { error: false, login, password };
    }


    async createSensor() {

        const token = process.env.SUPERVISOR_TOKEN;

        const entities = ['sensor.daily_generation', 'sensor.monthly_generation'];

        const stateAttributes = [
            {
                friendly_name: 'Daily Energy Generation',
                min: 0,
                step: 1,
                unit_of_measurement: 'KWh',
                mode: 'box',
                icon: 'mdi:calendar-clock',
                editable: true
            },
            {
                friendly_name: 'Monthly Energy Generation',
                min: 0,
                step: 1,
                unit_of_measurement: 'KWh',
                mode: 'box',
                icon: 'mdi:calendar-month',
                editable: true
            },
        ];

        for (let i in entities) {

            try {
                // Verifica se o sensor já existe
                const existingSensor = await axios.get(`http://supervisor/core/api/states/${entities[i]}`, { headers: { 'Authorization': 'Bearer ' + process.env.SUPERVISOR_TOKEN } });

                console.log('existingSensor Data', existingSensor.data);
                console.log('existingSensor Status', existingSensor.data);

                // Se o sensor não existir, cria-o
                if (existingSensor.status == 404) {

                    const response = await axios.post(`http://supervisor/core/api/states/${entities[i]}`,
                        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.SUPERVISOR_TOKEN } },
                        {
                            "state": 0,
                            "attributes": stateAttributes,
                        }
                    );

                    console.log('response', response.data)

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