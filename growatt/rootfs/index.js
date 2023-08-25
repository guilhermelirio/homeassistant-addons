const Util = require('./util');

(async () => {

    await Util.createSensor();

    const dados = await Util.getData();

    const requestLogin = await Util.login(dados.login, dados.password);

    if (requestLogin.error) {
        throw new Error(requestLogin.msg);
    }

    await Util.getEnergy(requestLogin.data)

})();

