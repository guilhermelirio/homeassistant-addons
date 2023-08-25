const axios = require('axios');
const SUPERVISOR = 'http://supervisor/core/api/states/';
const fs = require('fs');
const path = require('path');

class Util {

    async login(login, password) {

        try {

            const getCookies = await axios.post(`https://server.growatt.com/login?account=${login}&password=${password}`)

            console.log(getCookies)
            console.log("=======================")
            console.log(getCookies.data)

        } catch (error) {
            console.error(error)
        }
    }

    async getData() {
        const filePath = path.join(__dirname, 'data', 'options.json');

        if (!fs.existsSync(filePath)) throw new Error("Arquivo options.json não existe.");

        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const { login, password } = jsonData;

        if (login == "" || password == "") throw new Error("Preencha os campos nas configurações do addon.");

        return { error: false, login, password };
    }


    async createSensor() {

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
                await axios.get(`${SUPERVISOR}${entities[i]}`, {
                    headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
                });

                console.log(`Sensor ${entities[i]} already exists.`);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Trate o erro 404 (Not Found) aqui
                    try {
                        const response = await axios.post(`${SUPERVISOR}${entities[i]}`,
                            { headers: { "Authorization": 'Bearer ' + process.env.SUPERVISOR_TOKEN, "Content-Type": "application/json" } },
                            {
                                state: 0,
                                attributes: stateAttributes,
                            }
                        );

                        console.log('response', response.data);

                        console.log(`Sensor ${entities[i]} created.`);
                    } catch (createError) {
                        console.error(`Error creating sensor ${entities[i]}: ${createError}`);
                    }
                } else {
                    console.error(`Error checking sensor ${entities[i]}: ${error}`);
                }
            }
        }
    }

}

module.exports = new Util();