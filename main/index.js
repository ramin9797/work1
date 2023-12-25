const express = require('express');
require('express-async-errors');
const amqp = require('amqplib');
let channel;

async function connect() {
  try{
    let isConnected = false;
    while(!isConnected){
      try {
        var amqp_url = process.env.CLOUDAMQP_URL || 'amqp://guest:guest@rabbitmq';
        const connection = await amqp.connect(amqp_url);
        channel = await connection.createChannel();
        await channel.assertQueue('CALC_RESULT');
        isConnected = true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  catch(e){
    console.log('22222222',e)
  }
}

connect().then(() => {
  channel.consume('CALCULATE', data => {
    let d = JSON.parse(data.content);
    let { number } = d;
    number = parseInt(number ||0)
    console.log("1111111111111",number);
    channel.sendToQueue(
      'CALC_RESULT',
      Buffer.from(JSON.stringify({ result:number*2 }))
    );
  });
});

const app = express();

app.use(express.json());

const port = process.env.PORT ?? 3003;

app.listen(port, () => {
  try {
    console.log(`Orders Service at ${port}`);
  } catch (error) {
    console.log('errorr',error);
  }
});

app.get('/orders', async (req, res) => {
  const results = await Order.findAll();

  res.status(200).json(results);
});

// sequelize.sync();