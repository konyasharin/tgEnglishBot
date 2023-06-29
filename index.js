require('dotenv').config();
const token = process.env.SECRET_CODE,
      chatId = process.env.CHAT_ID,
      providerToken = process.env.PROVIDER_TOKEN;
const src = "./docs/bot.pdf",
      { Telegraf, Markup } = require('telegraf'),
      text = require('./const'),
      bot = new Telegraf(token),
      fs =  require("fs"),
      b1 = "./docs/B1.pdf",
      b2 = "./docs/B2.pdf",
      c1 = "./docs/C1.pdf";
let levelAnswer = "",
    countDays = 0;

timeInterval = setInterval(check, 1000*60*10);

function check(){
    let read = fs.readFileSync("users.txt", "utf-8").toString().split('\n');
    for(let i = 0; i < read.length; i++){
        if(read[i] != ""){
            let string = read[i].split(' --- '),
                dateList = string[2].split('/'),
                nowNoSplit = new Date().toLocaleDateString(),
                now = nowNoSplit.split('/');
            console.log(dateList[0] + "---", now[0])
            console.log(string[2] == nowNoSplit, +dateList[0] < +now[0], +dateList[1] < +now[1])
            console.log(dateList[0], now[0], dateList[1],  now[1])
            if(string[2] == nowNoSplit || +dateList[0] < +now[0] || +dateList[1] < +now[1] || +dateList[2] < +now[2]){
                bot.telegram.sendMessage(+string[1], "У вас закончилась подписка, продлите если хотите продолжать заниматься английским.");
                bot.telegram.sendMessage(chatId, `Ирина, привет, у пользователя @${string[0]} (${string[3]}) закончилась подписка.`);
                read[i] = ""
            }
        }
    }
    fs.writeFileSync("users.txt", "")
    for(let i = 0; i < read.length - 1; i++){
        if(read[i] != ""){
            fs.appendFile("users.txt", `${read[i]}\n`, function(error){
                if(error) throw error; // если возникла ошибка
                             
                console.log("Запись файла завершена. Содержимое файла:")
                let data = fs.readFileSync("users.txt", "utf8");
                console.log(data);  // выводим считанные данные
            });
        }
    }
    // clearInterval(timeInterval);
}

bot.command('start', (ctx) => { //при запуске бота
    try{
        ctx.replyWithHTML(`Добрый день, ${ctx.message.from.first_name ? ctx.message.from.first_name: 'незнакомец'}!` +
                " На связи Ирина - преподаватель английского языка.  Отлично, что вы не стоите на месте, а продолжаете совершенствовать ваш английский👍🏻\n" +
                "\n" +
                "➡️ чтобы получить чек-лист «Летний челлендж английского», выберете команду «Я хочу чек-лист»\n" +
                "\n" +
                "➡️ если хотите пополнить свой словарный запас, вступайте в закрытый канал “I know this word!” и развивайте свой английский в кругу единомышленников. СТАРТ 26 ИЮНЯ!\n\n" +
                "➡️ не забудьте подписаться на мой <a href='https://t.me/irinayourteacher'>канал</a>, чтобы не пропускать всё самое интересное и полезное об изучении языка" ,
                Markup.keyboard(['Я хочу получить чек-лист', 'Я хочу попасть в закрытый телеграмм-канал']).resize());
            console.log(ctx.chat.id)
    }catch{
        console.error(e);
    }
});


bot.help((ctx) => ctx.reply(text.commands))
bot.launch();

bot.hears('Я хочу получить чек-лист', async (ctx) => { //отправка чек-листа
    try{
            await ctx.replyWithHTML("Ваш чек-лист. Желаю провести лето с пользой!")
            if(src !== false){
                await ctx.replyWithDocument({
                    source: src
                })
            }
    }catch{
        console.error(e);
    }
})


bot.hears('Я хочу попасть в закрытый телеграмм-канал', async (ctx) => { //закрытый тг канал
    try{
        await ctx.replyWithHTML("<b>Прежде чем получить доступ к каналу, ознакомьтесь с условиями участия:</b>\n\n" +
                        "1. Данный канал направлен на ежедневную практику новой лексики. Каждый участник самостоятельно формирует список слов на неделю, которые хочет выучить.\n\n" +
                        "2. Допускаются участники с уровнем <b>от B1 до С1.</b>\n\n" +
                        "3. Ежедневно вам будет необходимо составлять предложения со словами из вашего списка (3 новых слова = 3 предложения). Выполненное задание размещается в комментариях к соответствующей записи ежедневно с понедельника по пятницу. С субботы по воскресенье участник пишет связную историю со словами недели.\n\n" +
                        "Более подробное описание по <a href='https://drive.google.com/file/d/1y2zV3lb2QIJ9wwy83T52yYmuoiCb25US/view?usp=sharing'>ссылке</a>.",
                        Markup.keyboard(['Я согласен']).resize());

    }catch{
        console.error(e);
    }
})

bot.hears('Я согласен', async (ctx) => { //пользователь указывает его уровень
    try{
        await ctx.reply("Укажите свой уровень языка. Если не уверены, можно пройти тест на определение языкового уровня: https://www.efset.org/quick-check/",
                    Markup.keyboard([['B1', 'B2', 'C1']]).resize());
    
    }catch{
        console.error(e);
    }
})

function getLevel(level){ //получаем уровень и отсылаем данные админу
    bot.hears(level, async (ctx) => {
        levelAnswer = level;
        try{
            await ctx.reply("Стоимость участия:\n" +
                            "1 неделя - 250 рублей;\n\n" +
                            "При оплате от 2-х недель предоставляется скидка (стоимость 1 недели - 200 рублей) ⬇️\n" +
                            "2 недели - 400 рублей;\n" +
                            "3 недели - 600 рублей;\n" +
                            "Месяц - 800 рублей.",
                    Markup.keyboard([['1 неделя', '2 недели', '3 недели'], ['Месяц']]).resize());
        }catch{
            console.error(e);
        }
    })
}
getLevel('B1');
getLevel('B2');
getLevel('C1');
console.log(levelAnswer + "---")

const getInvoice = (id, price) => {
    const invoice = {
      chat_id: id, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
      provider_token: providerToken, // токен выданный через бот @SberbankPaymentBot 
      start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
      title: 'Оплата английского', // Название продукта, 1-32 символа
      description: 'Репетитор по английскому языку', // Описание продукта, 1-255 знаков
      currency: 'RUB', // Трехбуквенный код валюты ISO 4217
      prices: [{ label: 'Оплата английского', amount: 100 * price }], // Разбивка цен, сериализованный список компонентов в формате JSON 100 копеек * 100 = 100 рублей
      photo_url: '#', // URL фотографии товара для счета-фактуры. Это может быть фотография товара или рекламное изображение услуги. Людям больше нравится, когда они видят, за что платят.
      photo_width: 500, // Ширина фото
      photo_height: 281, // Длина фото
      payload: { // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
        unique_id: `${id}_${Number(new Date())}`,
        provider_token: providerToken 
      }
    }
  
    return invoice
  }

function checkHavePay(chatid){
    let read = fs.readFileSync("users.txt", "utf-8").toString().split('\n');
    for(let i = 0; i < read.length; i++){
        let string = read[i].split(' --- ');
        if(string[1] == chatid){
            return true;
        }
    }
    return false;
}
bot.hears('1 неделя', (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
  countDays = 7;
  if(checkHavePay(ctx.message.from.id)){
    return ctx.reply("Вы уже оплатили")
  }
  return ctx.replyWithInvoice(getInvoice(ctx.from.id, 250)) //  метод replyWithInvoice для выставления счета
})
bot.hears('2 недели', (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
    if(checkHavePay(ctx.message.from.id)){
        return ctx.reply("Вы уже оплатили")
    }
    countDays = 14;
    return ctx.replyWithInvoice(getInvoice(ctx.from.id, 400)) //  метод replyWithInvoice для выставления счета  
})
bot.hears('3 недели', (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
    if(checkHavePay(ctx.message.from.id)){
        return ctx.reply("Вы уже оплатили")
    }
    countDays = 21;
    return ctx.replyWithInvoice(getInvoice(ctx.from.id, 600)) //  метод replyWithInvoice для выставления счета  
})
bot.hears('Месяц', (ctx) => {  // это обработчик конкретного текста, данном случае это - "pay"
    if(checkHavePay(ctx.message.from.id)){
        return ctx.reply("Вы уже оплатили")
    }
    countDays = 31;
    return ctx.replyWithInvoice(getInvoice(ctx.from.id, 800)) //  метод replyWithInvoice для выставления счета  
})

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true)) // ответ на предварительный запрос по оплате

bot.on('successful_payment', async (ctx, next) => { // ответ в случае положительной оплаты
  await ctx.reply('Вступить в группу по ссылке: https://t.me/+xddYRRpV3KYxZjli\n' +
                  'Готовые списки слов по уровням⬇️\n\n',
  Markup.keyboard(['Я хочу получить чек-лист', 'Я хочу попасть в закрытый телеграмм-канал']).resize());
  if(b1 !== false){
    await ctx.replyWithDocument({
        source: b1
    })
  }
  if(b2 !== false){
    await ctx.replyWithDocument({
        source: b2
    })
  }
  if(c1 !== false){
    await ctx.replyWithDocument({
        source: c1
    })
  }
  let date = new Date();
  fs.appendFile("users.txt", `${ctx.message.from.username} --- ${ctx.chat.id} --- ${new Date(date.setDate(date.getDate() + countDays + 1)).toLocaleDateString()} --- ${ctx.message.from.first_name ? ctx.message.from.first_name: 'без имени'} ${ctx.message.from.last_name ? ctx.message.from.last_name: 'без фамилии'}\n`, function(error){
    if(error) throw error; // если возникла ошибка             
    console.log("Запись файла завершена. Содержимое файла:");
    let data = fs.readFileSync("users.txt", "utf8");
    console.log(data);  // выводим считанные данные
  });
  console.log(levelAnswer)
  bot.telegram.sendMessage(chatId, 
    `Привет, Ирина!\n` + 
    `У нас с вами новый ученик: ${ctx.message.from.first_name ? ctx.message.from.first_name: 'без имени'} ${ctx.message.from.last_name ? ctx.message.from.last_name: 'без фамилии'}\n` +
    `Уровень: ${levelAnswer}\n` +
    `Его ник в тг: @${ctx.message.from.username}\n` +
    `Его подписка действует с завтрашнего дня до: ${new Date(date.setDate(date.getDate())).toLocaleDateString()} (не включительно)`);
})


bot.use(async (ctx) => { //если пользователь ввел команду, которую бот не знает
    try{
        await ctx.reply('Что-то я запямятовал, не припомню такой команды...');
        await ctx.reply('Поэтому попробуй начать сначала, не совершай больше таких ошибок!',
              Markup.keyboard(['Я хочу получить чек-лист', 'Я хочу попасть в закрытый телеграмм-канал']).resize());
    }catch{
        console.error(e);
    }
})


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));