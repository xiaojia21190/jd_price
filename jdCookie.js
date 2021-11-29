const axios = require('axios').default;
const getCookie = async () => {
    let res = await axios.get(process.env.getCookie);
    return res.data.result;
};

module.exports = { getCookie };
