const axios = require('axios').default;
const config = require('./config');
const getCookie = async () => {
    let token = await getToken();
    let client_url = config.client_url || process.env.client_url;
    let body = await axios.get(`${client_url}/open/envs?searchValue=JD_COOKIE&t=${Date.now()}`, {
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    });
    console.log(body);
    return body.data.data;
};

const getToken = async () => {
    let body;
    try {
        let client_id = config.client_id || process.env.client_id;
        let client_secret = config.client_secret || process.env.client_secret;
        let client_url = config.client_url || process.env.client_url;
        console.log(`${client_url}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`);
        body = await axios.get(`${client_url}/open/auth/token?client_id=${client_id}&client_secret=${client_secret}`);
        console.log(body);
    } catch (error) {
        console.log(error);
    }
    return body.data.token;
};

module.exports = { getCookie, getToken };
