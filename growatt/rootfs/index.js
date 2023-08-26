const Util = require('./util');
const cron = require('node-cron');

(async () => {

    await Util.createSensor();

    const dados = await Util.getData();
    const requestLogin = await Util.login(dados.login, dados.password);
    if (requestLogin.error) throw new Error(requestLogin.msg);

    console.log('Login accepted.');

    const plant = await Util.getPlantId(requestLogin.data.Cookie);
    if (plant.error) throw new Error(plant.msg);
    await Util.getEnergy(requestLogin.data, plant.plantId)

    //Every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        const dados = await Util.getData();
        const requestLogin = await Util.login(dados.login, dados.password);
        if (requestLogin.error) throw new Error(requestLogin.msg);

        const plant = await Util.getPlantId(requestLogin.data.Cookie);
        if (plant.error) throw new Error(plant.msg);
        await Util.getEnergy(requestLogin.data, plant.plantId)
    });

})();

