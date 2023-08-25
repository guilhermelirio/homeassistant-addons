const axios = require('axios');
const SUPERVISOR = 'http://supervisor/core/api/states/';
const fs = require('fs');
const path = require('path');

class Util {

    async login(login, password) {

        const data = {};

        try {

            const getCookies = await axios.post(`https://server.growatt.com/login?account=${login}&password=${password}`)

            if (getCookies.data.result == 1) {

                data['Cookie'] = getCookies.headers['set-cookie'].toString();
                data['mesAtual'] = new Date().toISOString().substr(0, 7);

                console.log('Login accepted.')

                return { error: false, msg: 'ok', data };
            }

            return { error: true, msg: "Erro ao fazer login.", data: null };

        } catch (error) {
            console.error(error)
            return { error: true, msg: error.response.data, data: null };
        }
    }

    async getEnergy(data) {

        const urls = ['https://server.growatt.com/panel/tlx/getTLXTotalData?plantId=602355&tlxSn=DXH2B020D4', `https://server.growatt.com/panel/tlx/getTLXEnergyMonthChart?tlxSn=DXH2B020D4&date=${data.mesAtual}&plantId=602355`];

        try {
            const responses = await axios.all(urls.map(url => axios.post(url, null, { headers: { 'Cookie': data.Cookie } })));

            const energyDailyResponse = responses[0];
            const energyMonthlyResponse = responses[1];

            console.log('Primeira resposta:', energyDailyResponse.data);
            console.log('Segunda resposta:', energyMonthlyResponse.data);

            if (energyDailyResponse.data.result == 1 && energyMonthlyResponse.data.result) {

                let arrayMonthly = energyMonthlyResponse.data.obj.charts.energy;
                let totalMonthly = 0;

                //Calcula o total no mês
                for (var i in arrayMonthly) {
                    totalMonthly += arrayMonthly[i];
                }

                await this.setSensor('sensor.daily_generation', energyDailyResponse.data.obj.eToday);
                await this.setSensor('sensor.monthly_generation', totalMonthly.toFixed(2));

            }

            return { error: true, daily: null, monthly: null }

        } catch (error) {
            console.error('Erro:', error);
            return { error: true, daily: null, monthly: null, msg: "Failed to get data." }
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

    async setSensor(sensor, value) {

        const sensors = [
            {
                name: "sensor.daily_generation",
                attributes: {
                    "friendly_name": 'Daily Energy Generation',
                    "min": 0,
                    "step": 1,
                    "unit_of_measurement": 'KWh',
                    "mode": 'box',
                    "icon": 'mdi:calendar-clock',
                    "editable": true
                },
            },
            {
                name: "sensor.monthly_generation",
                attributes: {
                    "friendly_name": 'Monthly Energy Generation',
                    "min": 0,
                    "step": 1,
                    "unit_of_measurement": 'KWh',
                    "mode": 'box',
                    "icon": 'mdi:calendar-month',
                    "editable": true
                }
            }
        ];

        const sensorExistis = sensors.filter(s => s.name === sensor);

        if (sensorExistis[0]) {

            try {

                const response = await axios.post(`${SUPERVISOR}${sensor}`,
                    {
                        "state": value,
                        "attributes": stateAttributes[i],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token
                        }
                    },
                );

                console.log(`Sensor ${sensor} updated.`);
            } catch (createError) {
                console.log(createError.response.data)
                console.error(`Error updating sensor ${sensor}: ${createError}`);
            }
        } else {
            console.log(`Sensor ${sensor} not updated.`);
        }
    }


    async createSensor() {

        const token = process.env.SUPERVISOR_TOKEN;

        const entities = ['sensor.daily_generation', 'sensor.monthly_generation'];

        const stateAttributes = [
            {
                "friendly_name": 'Daily Energy Generation',
                "min": 0,
                "step": 1,
                "unit_of_measurement": 'KWh',
                "mode": 'box',
                "icon": 'mdi:calendar-clock',
                "editable": true
            },
            {
                "friendly_name": 'Monthly Energy Generation',
                "min": 0,
                "step": 1,
                "unit_of_measurement": 'KWh',
                "mode": 'box',
                "icon": 'mdi:calendar-month',
                "editable": true
            },
        ];

        for (let i in entities) {


            try {
                // Verifica se o sensor já existe
                await axios.get(`${SUPERVISOR}${entities[i]}`, {
                    headers: { Authorization: 'Bearer ' + token },
                });

                console.log(`Sensor ${entities[i]} already exists.`);

            } catch (error) {
                if (error.response && error.response.status === 404) {

                    console.log(`Sensor ${entities[i]} not exists. Creating...`);

                    // Trate o erro 404 (Not Found) aqui
                    try {
                        const response = await axios.post(`${SUPERVISOR}${entities[i]}`,
                            {
                                "state": 0,
                                "attributes": stateAttributes[i],
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: 'Bearer ' + token
                                }
                            },
                        );

                        console.log(`Sensor ${entities[i]} created.`);
                    } catch (createError) {
                        console.log(createError.response.data)
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