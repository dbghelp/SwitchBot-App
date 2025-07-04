const axios = require('axios');
var express = require('express');
var router = express.Router();
var { setKeyValue, getValueByKey, getAllVariables, deleteVariable, dropVariablesTable } = require('../services/localVariablesService');
const { init } = require('../services/switchBotService');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const { table } = require('../config/localDB');
const crypto = require('crypto');

var switchBotAPI;

router.get('/geticons', async function (req, res) {
    try {
        let url = "https://prod-switchbot-icons.s3.amazonaws.com/wo_device_icon.json";
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching icons:', error);
        res.status(500).json({ error: 'Failed to fetch icons' });
    }
});

router.post('/login', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/account/api/v2/user/login";
        const { email, encryptedPassword } = req.body;

        const bytes = CryptoJS.AES.decrypt(encryptedPassword, "github.com/dbghelp");
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        const uuid = uuidv4().replace(/-/g, '');
        const deviceId =
            uuid.slice(0, 4) + '-' +
            uuid.slice(4, 8) + '-' +
            uuid.slice(8, 12) + '-' +
            uuid.slice(12, 16);

        const deviceName = "Galaxy S20 Ultra 5G";
        const model = "SM-G988B/DS";
        const appVersion = "9.12";

        const response = await axios.post(url, {
            "clientId": "5nnwmhmsa9xxskm14hd85lm9bm",
            "deviceInfo": {
                "appVersion": appVersion,
                "deviceId": deviceId,
                "deviceName": deviceName,
                "model": model
            },
            "grantType": "password",
            "password": decryptedPassword,
            "username": email,
            "verifyCode": ""
        });

        setKeyValue('appVersion', appVersion);
        setKeyValue('deviceId', deviceId);
        setKeyValue('deviceName', deviceName);
        setKeyValue('model', model);
        setKeyValue('email', email);
        setKeyValue('encryptedPassword', encryptedPassword);
        setKeyValue('TOKEN', response.data.body.access_token);

        async function retryUntilSuccess(fn, maxRetries = 5, delay = 1000) {
            let attempt = 0;
            while (attempt < maxRetries) {
                try {
                    return await fn();
                } catch (err) {
                    attempt++;
                    if (attempt >= maxRetries) throw err;
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        }

        await retryUntilSuccess(() => axios.post('http://localhost:8089/switchbot/userinfo'));
        await retryUntilSuccess(() => axios.post('http://localhost:8089/switchbot/endpoint'));
        await retryUntilSuccess(() => axios.post('http://localhost:8089/switchbot/getdevice'));
        await retryUntilSuccess(() => axios.post('http://localhost:8089/switchbot/token'));

        switchBotAPI = await init();

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.post('/userinfo', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/account/api/v1/user/userinfo";
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const response = await axios.post(url, {}, { headers: headers });
        res.status(200).json(response.data);
        setKeyValue('botRegion', response.data.body.botRegion);
    } catch (error) {
        console.error('Error getting user info', error);
        res.status(500).json({ error: 'Error getting user info' });
    }
});

router.post('/checkLogin', async function (req, res) {
    try {
        if (!getValueByKey('TOKEN')) {
            return res.status(401).json({ error: 'Unauthorized: No token found', 'Logged in': false });
        }

        if (!getValueByKey('email') || !getValueByKey('encryptedPassword')) {
            return res.status(401).json({ error: 'Unauthorized: No email or password found', 'Logged in': false });
        }

        let userInfoResponse;
        try {
            userInfoResponse = await axios.post('http://localhost:8089/switchbot/userinfo');
        } catch (err) {
            try {
                await axios.post('http://localhost:8089/switchbot/login', {
                    email: getValueByKey('email'),
                    encryptedPassword: getValueByKey('encryptedPassword')
                });
                userInfoResponse = await axios.post('http://localhost:8089/switchbot/userinfo');
            } catch (loginErr) {
                return res.status(401).json({ error: 'Re-login failed', 'Logged in': false });
            }
        }

        if (!userInfoResponse || userInfoResponse.status !== 200) {
            return res.status(401).json({ error: 'User info fetch failed', 'Logged in': false });
        }

        res.status(200).json({ 'Logged in': true });
    } catch (error) {
        console.error('Not logged in', error);
        res.status(500).json({ error: 'Internal error', 'Logged in': false });
    }
});


router.post('/endpoint', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/admin/admin/api/v1/botregion/endpoint";
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const body = {
            "botRegion": getValueByKey('botRegion')
        }
        const response = await axios.post(url, body, { headers: headers });

        const wonderlabsItem = response.data.data.find(item => item.name === "wonderlabs");

        setKeyValue('wonderlabsAPI', wonderlabsItem.host);
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on endpoint', error);
        res.status(500).json({ error: 'Error on endpoint' });
    }
});


//get groupID
router.post('/getdevice', async function (req, res) {
    try {
        const url = `${getValueByKey('wonderlabsAPI')}/wonder/device/v3/getdevice`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const body = {
            "required_type": "All"
        }
        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.body.Items);
        setKeyValue('groupID', response.data.body.Items[0].groupID);
    } catch (error) {
        console.error('Error on getdevice', error);
        res.status(500).json({ error: 'Error on getdevice' });
    }
});

router.post('/getList', async function (req, res) {
    try {
        const url = `${getValueByKey('wonderlabsAPI')}/scene/v1/scene/getList`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const body = {
            "groupID": getValueByKey('groupID'),
            "sceneType": "automation"
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on getList', error);
        res.status(500).json({ error: 'Error on getList' });
    }
});

router.post('/getall', async function (req, res) {
    try {
        //await axios.post('http://localhost:8089/switchbot/getdevice');
        const url = `${getValueByKey('wonderlabsAPI')}/homepage/v1/device/getall`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const body = {
            "groupID": getValueByKey('groupID'),
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on getall', error);
        res.status(500).json({ error: 'Error on getall' });
    }
});


router.post('/dataDetail', async function (req, res) {
    try {
        //await axios.post('http://localhost:8089/switchbot/getdevice');
        const url = `${getValueByKey('wonderlabsAPI')}/devicedata/v1/data/detail`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }
        const { deviceId } = req.body;
        const currentTime = Date.now();
        const body = {
            "dataMetricsTypes": [
                "temperature",
                "humidity"
            ],
            "deviceID": deviceId,
            "deviceType": "WoMeter",
            "end": currentTime,
            "start": currentTime
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on dataDetail', error);
        res.status(500).json({ error: 'Error on dataDetail' });
    }
});


router.post('/remoteinfo', async function (req, res) {
    try {
        const url = `${getValueByKey('wonderlabsAPI')}/homepage/v1/device/remoteinfo`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }

        const body = {
            "remoteID": req.body.remoteID,
            "ownerUserID": req.body.userID
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on remoteinfo', error);
        res.status(500).json({ error: 'Error on remoteinfo' });
    }
});

router.post('/sceneChangeEnable', async function (req, res) {
    try {
        const url = `${getValueByKey('wonderlabsAPI')}/scene/v1/scene/changeEnable`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }

        const body = {
            "enable": req.body.enable,
            "isOld": false,
            "sceneID": req.body.sceneID
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data.data);
    } catch (error) {
        console.error('Error on sceneChangeEnable', error);
        res.status(500).json({ error: 'Error on sceneChangeEnable' });
    }
});

router.post('/token', async function (req, res) {
    try {
        const url = `${getValueByKey('wonderlabsAPI')}/wonder/openapi/openUser/token`;
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }

        const body = {
            "operation": "get",
            "version": 2
        }

        const response = await axios.post(url, body, { headers: headers });

        const encryptedAppToken = response.data.body.token;
        const encryptedSecretKey = response.data.body.secretKey;
        
        function decryptToHex(encryptedHex) {
            try {
                const key = 'lrQ0OTvwp9RTsXxk';
                const iv = '4mdN27rI3bk2LzWa'; 
                const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
                const keyBuffer = Buffer.from(key, 'utf8');
                const ivBuffer = Buffer.from(iv, 'utf8');
        
                const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
                const decryptedBuffer = Buffer.concat([
                    decipher.update(encryptedBuffer),
                    decipher.final()
                ]);
        
                return decryptedBuffer.toString('hex');
            } catch (err) {
                console.error('Decryption failed:', err.message);
                return '';
            }
        }

        const appToken = decryptToHex(encryptedAppToken);
        const secretKey = decryptToHex(encryptedSecretKey);

        setKeyValue('appToken', appToken);
        setKeyValue('secretKey', secretKey);

        res.status(200).json({'token' : appToken, 'secretKey': secretKey});
    } catch (error) {
        console.error('Error on token', error);
        res.status(500).json({ error: 'Error on token' });
    }
});


router.post('/controlDevice', async function (req, res) {
    try {
        const { deviceId, command, parameter } = req.body;

        const response = await switchBotAPI.controlDevice(deviceId, command, parameter, 'customize');

        //console.log(response);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error on controlDevice', error);
        res.status(500).json({ error: 'Error on controlDevice' });
    }
});

router.post('/getDeviceStatus', async function (req, res) {
    try {
        const { deviceId } = req.body;

        const status = await switchBotAPI.getDeviceStatus(deviceId)

        //console.log(status);

        res.status(200).json(status);
    } catch (error) {
        console.error('Error on getDeviceStatus', error);
        res.status(500).json({ error: 'Error on getDeviceStatus' });
    }
});

router.post('/sendCode', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/account/api/v2/verification/code/send";
        const headers = {
            'authorization': getValueByKey('TOKEN')
        }

        const body = {
            "clientId": "5nnwmhmsa9xxskm14hd85lm9bm",
            "lang": "en",
            "method": "email",
            "ops": "change"
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error on sendCode', error);
        res.status(500).json({ error: 'Error on sendCode' });
    }
});

router.post('/changePassword', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/account/api/v3/user/password/change";
        const { newPassword, credential } = req.body;

        const headers = {
            'authorization': getValueByKey('TOKEN')
        }

        const body = {
            "auth": {
                "credential": credential,
                "method": "email"
            },
            "clientId": "5nnwmhmsa9xxskm14hd85lm9bm",
            "deviceInfo": {
                "deviceId": getValueByKey('deviceId'),
                "deviceName": getValueByKey('deviceName'),
                "model": getValueByKey('model')
            },
            "lang": "en",
            "password": newPassword
        }

        const response = await axios.post(url, body, { headers: headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error on changePassword', error);
        res.status(500).json({ error: 'Error on changePassword' });
    }
});

router.post('/dropTable', async function (req, res) {
    try {
        await dropVariablesTable();
        res.status(200).json({ message: 'Variables table dropped successfully' });
    } catch (error) {
        console.error('Failed to drop Variables table', error);
        res.status(500).json({ error: 'Failed to drop Variables table' });
    }
});

router.post('/refreshToken', async function (req, res) {
    try {
        const url = "https://account.api.switchbot.net/account/api/v2/user/login";
        
        const encryptedPassword = getValueByKey('encryptedPassword');
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, "github.com/dbghelp");
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

        const response = await axios.post(url, {
            "clientId": "5nnwmhmsa9xxskm14hd85lm9bm",
            "deviceInfo": {
                "appVersion": getValueByKey('appVersion'),
                "deviceId": getValueByKey('deviceId'),
                "deviceName": getValueByKey('deviceName'),
                "model": getValueByKey('model')
            },
            "grantType": "password",
            "password": decryptedPassword,
            "username": getValueByKey('email'),
            "verifyCode": ""
        });

        setKeyValue('TOKEN', response.data.body.access_token);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error on refreshToken:', error);
        res.status(500).json({ error: 'Error on refreshToken' });
    }
});


module.exports = router;