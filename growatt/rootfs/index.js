const Util = require('./util');
const cron = require('node-cron');

(async () => {

    await Util.createSensor();

    const dados = await Util.getData();
    const requestLogin = await Util.login(dados.login, dados.password);
    console.log('Login accepted.');
    const plant = await Util.getPlantId(requestLogin.data.Cookie);
    await Util.getEnergy(requestLogin.data, plant.plantId)

    //Every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        const dados = await Util.getData();
        const requestLogin = await Util.login(dados.login, dados.password);
        const plant = await Util.getPlantId(requestLogin.data.Cookie);
        await Util.getEnergy(requestLogin.data, plant.plantId)
    });

})();

