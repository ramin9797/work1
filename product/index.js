const express = require('express');
require('express-async-errors');
const sequelize = require('./database.js');
const Order = require('./order.model.js');
const amqp = require('amqplib');

let channel;

async function createOrder(products, userEmail) {
  let total = 0;
  for (let t = 0; t < products.length; ++t) {
    total += +products[t].price;
  }

  products = products.map(product => {
    return product.id;
  });

  const newOrder = await Order.create({
    products,
    creator: userEmail,
    totalPrice: total,
  });

  return newOrder;
}

async function connect() {
  try{
    let isConnected = false;
    console.log('isss',isConnected)
    while(!isConnected){
      try {
        var amqp_url = process.env.CLOUDAMQP_URL || 'amqp://guest:guest@rabbitmq';
        console.log("amqp_url",amqp_url)
        const connection = await amqp.connect(amqp_url);
        channel = await connection.createChannel();
        await channel.assertQueue('ORDER');
        isConnected = true;
      } catch (error) {
        console.error("yeniden cehd");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    // setTimeout(async () => {
      
    // }, 10000);
    // conn = await amqplib.connect("am qp://stackcoder_user:StackCoderPass@localhost");
    
  }
  catch(e){
    console.log('22222222',e)
  }
}

// connect().then(() => {
//   channel.consume('ORDER', data => {
//     console.log('Consuming ORDER service');
//     const { products, userEmail } = JSON.parse(data.content);
//     createOrder(products, userEmail)
//       .then(newOrder => {
//         channel.ack(data);
//         channel.sendToQueue(
//           'PRODUCT',
//           Buffer.from(JSON.stringify({ newOrder }))
//         );
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   });
// });

const app = express();

app.use(express.json());

const port = process.env.PORT ?? 3003;

app.listen(port, () => {
  try {
    console.log(`Orders Service at ${port}`);
    connect();
  } catch (error) {
    console.log('errorr',error);
  }
});


app.post('/products/buy', isAuthenticated, async (req, res) => {
  channel.sendToQueue(
    'ORDER',
    Buffer.from(
      JSON.stringify({
          text:"Salam"
      })
    )
  );
  channel.consume('PRODUCT', data => {
    console.log("Consume product",data);
    // order = JSON.parse(data.content);
    // console.log(order);
  });
});

sequelize.sync();