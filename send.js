const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const data = require('dotenv').parse(fs.readFileSync( path.join(__dirname, '../.env') ));
const key = data.SENDKEY;

(async () => {
    const ret = await sc_send('主人服务器宕机了 via JS', "第一行\n\n第二行", key);
    console.log(ret);
})();

async function sc_send(text, desp = '', key = '[SENDKEY]') {
    const postData = querystring.stringify({ text, desp });
    // 根据 sendkey 是否以 'sctp' 开头，选择不同的 API URL
    const url = String(key).match(/^sctp(\d+)t/i) 
    ? `https://${key.match(/^sctp(\d+)t/i)[1]}.push.ft07.com/send/${key}.send`
    : `https://sctapi.ftqq.com/${key}.send`;
  
    console.log("url", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      body: postData
    });
  
    const data = await response.text();
    return data;
  }