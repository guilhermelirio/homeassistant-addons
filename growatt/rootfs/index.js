const Util = require('./util');
const cron = require('node-cron');

(async () => {

    await Util.createSensor();

    const dados = await Util.getData();
    const requestLogin = await Util.login(dados.login, dados.password);
    if (requestLogin.error) {
        throw new Error(requestLogin.msg);
    }
    await Util.getEnergy(requestLogin.data)

    //Every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        const dados = await Util.getData();
        const requestLogin = await Util.login(dados.login, dados.password);
        if (requestLogin.error) {
            throw new Error(requestLogin.msg);
        }
        await Util.getEnergy(requestLogin.data)
    });

})();

