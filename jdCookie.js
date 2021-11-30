const axios = require('axios').default;
const config = require('./config');
const getCookie = async () => {
    let res = await axios.get(process.env.getCookie || config.url);
    return res.data.result;
};

module.exports = { getCookie };
