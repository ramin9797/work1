const express = require('express');
require('express-async-errors');
const amqp = require('amqplib');
const events = require('events')

let channel;
const emitter = new events.EventEmitter();


async function connect() {
  try{
    let isConnected = false;
    while(!isConnected){
      try {
        var amqp_url = process.env.CLOUDAMQP_URL || 'amqp://guest:guest@rabbitmq';
        console.log("amqp_url",amqp_url)
        const connection = await amqp.connect(amqp_url);
        channel = await connection.createChannel();
        await channel.assertQueue('CALCULATE');
        isConnected = true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  catch(e){
    console.log('e',e)
  }
}

connect().then(() => {
  console.log('connected')



  channel.consume('CALC_RESULT', data => {
    try {
      result = JSON.parse(data.content);
      console.log('1212121212',result)
      emitter.emit('newMessage', result)

      // Send the response to the client
    
    } catch (error) {
      console.log(error);
    } 
  });

});

const app = express();

app.use(express.json());

const port = process.env.PORT ?? 3004;

app.listen(port, () => {
  try {
    console.log(`Orders Service at ${port}`);
    // connect();
  } catch (error) {
    console.log('errorr',error);
  }
});



app.post('/calc/:number',(req, res) => {
  try {
    let number = parseInt(req.params?.number || 0);
    
    // Send initial request to the queue
    channel.sendToQueue(
      'CALCULATE',
      Buffer.from(
        JSON.stringify({
          number
        })
      )
    );


    emitter.once('newMessage', (message) => {
      console.log('mee',message);
      res.json(message)
    })


    // res.status(200).json(result);

    // Ensure the consumer is canceled even if no CALC_RESULT event is received
  } catch (e) {
    console.log('Error:', e);
  }
});

// sequelize.sync();