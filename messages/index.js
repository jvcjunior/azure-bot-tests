var restify = require('restify');
var builder = require('botbuilder');
var moment = require('moment');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
    appId: 'c9231c3f-68c9-4b18-8da8-0c8933f3fac0',//process.env['MicrosoftAppId'],
    appPassword: 'egQ9hg9avpvoeMRCVQqt4DH',//process.env['MicrosoftAppPassword'],
});



// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
});

//teste
// Make sure you add code to validate these fields
var luisAppId = 'a361005c-6bdc-405e-b223-7f78f7fc85d6';//process.env.LuisAppId;
var luisAPIKey = '807e6aacb8404e3493f16b8f26738bed'//process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisModelUrl ='https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a361005c-6bdc-405e-b223-7f78f7fc85d6?subscription-key=807e6aacb8404e3493f16b8f26738bed&timezoneOffset=0&verbose=true&q='

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
.onDefault((session) => {
    session.send('Desculpa, Não entendi \'%s\'.', session.message.text);
});

bot.dialog('Cumprimentos.Iniciais', [
    function (session) {
        if(session.conversationData.alreadyStarted){
            session.beginDialog('Reservar');
        }else{
            session.send("Olá. Meu nome é Rhinos e eu vou lhe ajudar a marcar as suas férias!");
            session.conversationData.alreadyStarted = true;
            session.beginDialog('Reservar');
        }
    }
]).triggerAction({
    matches: 'Cumprimentos.Iniciais'
});

bot.dialog('Reservar', [
    function(session, args, next) {
        if (session.conversationData.dataInicial) {
            next();
        } else {
            session.beginDialog('DataInicial');
        }
    },
    function(session, results, next) {
        if (session.conversationData.dataFinal) {
            next();
        } else {
            session.beginDialog('DataFinal');
        }

    },
    function(session, results, next) {
        session.send('Verificando dados....');
        setTimeout(() => {
            var dataIni = moment(session.conversationData.dataInicial);
            var dataFin = moment(session.conversationData.dataFinal);

            // var welcomeCard = new builder.HeroCard(session)
            // .title('Confirmação')
            // .subtitle('Por favor confirme os dados abaixo')
            // .buttons([
            //     builder.CardAction.imBack(session, session.gettext(MainOptions.Shop), MainOptions.Shop),
            //     builder.CardAction.imBack(session, session.gettext(MainOptions.Support), MainOptions.Support)
            // ]);

            // session.send(new builder.Message(session)
            // .addAttachment(welcomeCard));
            const card = new builder.ThumbnailCard(session);
            card.buttons([
                new builder.CardAction(session).title('Sim').value('Add').type('imBack'),
                new builder.CardAction(session).title('Não').value('Help').type('imBack'),
            ]).text(`Confirma os dados?`);

            const message = new builder.Message(session);
            message.addAttachment(card);
            session.send(message);

        }, 5000);
    },
]);

bot.dialog('AddNumber', [
    (session, args, next) => {
        session.send('AEEE');
    },
]).triggerAction({matches: /^add$/i});

bot.dialog('AddNumber2', [
    (session, args, next) => {
        session.send('OWWW');
    },
]).triggerAction({matches: /^help$/i});

bot.dialog('DataInicial', [
    function(session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Insira a data inicial usando o formato: 'dd/mm/aaaa'")
        } else {
            builder.Prompts.text(session, 'Informe a data inicial, por favor. (Formato: dd/mm/aaaa)');
        }
    },
    function(session, results, next) {
        var dataInicial = results.response;
        var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
        if (regex.test(dataInicial)) {
             session.conversationData.dataInicial = dataInicial;
             session.endDialogWithResult({ response: session.conversationData.dataInicial });
        } else{
            session.replaceDialog('DataInicial', { reprompt: true });
        }
    }
]);

bot.dialog('DataFinal', [
    function(session, args) {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Insira a data final usando o formato: 'dd/mm/aaaa'")
        } else {
            builder.Prompts.text(session, 'Informe a data final, por favor. (Formato: dd/mm/aaaa)');
        }
    },
    function(session, results, next) {
        var dataFinal = results.response;
        var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
        if (regex.test(dataFinal)) {
             session.conversationData.dataFinal = dataFinal;
             session.endDialogWithResult({ response: session.conversationData.dataFinal });
        } else{
            session.replaceDialog('DataFinal', { reprompt: true });
        }
    }
]);

bot.dialog('ConfirmaDados', [
    function(session, args) {
        session.send('Aguarde enquanto verifico os seus dados...');
    }
]);


//teste

/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add
natural language support to a bot.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/
// "use strict";
// var builder = require("botbuilder");
// var botbuilder_azure = require("botbuilder-azure");
// var path = require('path');

// var useEmulator = true;//(process.env.NODE_ENV == 'development');

// var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
//     appId: 'c9231c3f-68c9-4b18-8da8-0c8933f3fac0',//process.env['MicrosoftAppId'],
//     appPassword: 'egQ9hg9avpvoeMRCVQqt4DH',//process.env['MicrosoftAppPassword'],
//     stateEndpoint: process.env['BotStateEndpoint'],
//     openIdMetadata: process.env['BotOpenIdMetadata']
// });

// var bot = new builder.UniversalBot(connector);
// bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
// var luisAppId = 'a361005c-6bdc-405e-b223-7f78f7fc85d6';//process.env.LuisAppId;
// var luisAPIKey = '807e6aacb8404e3493f16b8f26738bed'//process.env.LuisAPIKey;
// var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

// //const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
// const LuisModelUrl ='https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a361005c-6bdc-405e-b223-7f78f7fc85d6?subscription-key=807e6aacb8404e3493f16b8f26738bed&timezoneOffset=0&verbose=true&q='

// // Main dialog with LUIS
// var recognizer = new builder.LuisRecognizer(LuisModelUrl);
// bot.recognizer(recognizer);
// var intents = new builder.IntentDialog({ recognizers: [recognizer] })
// .onDefault((session) => {
//     session.send('Desculpa, Não entendi \'%s\'.', session.message.text);
// });

// bot.dialog('/', [
//     function (session, results) {
//         session.endDialog('Olá. Meu nome é RHinos e eu sou um bot que vai lhe ajudar a marcar as suas férias! ');
//     }
// ]);
// bot.dialog('Cumprimentos.Iniciais', [
//     function (session) {
//         if(session.conversationData.alreadyStarted){
//             session.beginDialog('Reservar');
//         }else{
//             session.send("Olá. Meu nome é Rhinos e eu vou lhe ajudar a marcar as suas férias!");
//             session.conversationData.alreadyStarted = true;
//             session.beginDialog('Reservar');
//         }
//         //builder.Prompts.text(session, `Olá. Seja bem-vindo! Meu nome é Rhinos. Posso saber o seu nome?`);
//     }
// ]).triggerAction({
//     matches: 'Cumprimentos.Iniciais'
// });

// bot.dialog('Reservar', [
//     function(session) {
//         session.beginDialog('DataInicial');
//     },
//     function(session, results, next) {
//         session.beginDialog('DataFinal');
//     },
//     function(session, results, next) {
//         session.beginDialog('ConfirmaDados');
//     },
//     function(session, results, next) {
//         session.send('Verificando dados....');
//     },
// ]);

// bot.dialog('DataInicial', [
//     function(session, args) {
//         if (args && args.reprompt) {
//             builder.Prompts.text(session, "Insira a data inicial usando o formato: 'dd/mm/aaaa'")
//         } else {
//             builder.Prompts.text(session, 'Informe a data inicial, por favor. (Formato: dd/mm/aaaa)');
//         }
//     },
//     function(session, results, next) {
//         var dataInicial = results.response;
//         var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
//         if (regex.test(dataInicial)) {
//              session.conversationData.dataInicial = dataInicial;
//              session.endDialogWithResult({ response: session.conversationData.dataInicial });
//         } else{
//             session.replaceDialog('DataInicial', { reprompt: true });
//         }
//     }
// ]);

// bot.dialog('DataFinal', [
//     function(session, args) {
//         if (args && args.reprompt) {
//             builder.Prompts.text(session, "Insira a data final usando o formato: 'dd/mm/aaaa'")
//         } else {
//             builder.Prompts.text(session, 'Informe a data final, por favor. (Formato: dd/mm/aaaa)');
//         }
//     },
//     function(session, results, next) {
//         var dataFinal = results.response;
//         var regex = /^[0-9]{2}[\/][0-9]{2}[\/][0-9]{4}$/g;
//         if (regex.test(dataFinal)) {
//              session.conversationData.dataFinal = dataFinal;
//              session.endDialogWithResult({ response: session.conversationData.dataFinal });
//         } else{
//             session.replaceDialog('DataFinal', { reprompt: true });
//         }
//     }
// ]);

// bot.dialog('ConfirmaDados', [
//     function(session, args) {

//     }
// ]);

/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
//docs: https://docs.microsoft.com/en-us/bot-framework/overview-introduction-bot-framework
//docs node:https://docs.microsoft.com/pt-br/bot-framework/nodejs/bot-builder-nodejs-overview
//charts: https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards
// .matches('Cumprimentos.Iniciais', (session) => {
//     session.send('Olá');
// })
// .matches('Cumprimentos.BemEstar', (session) => {
//     session.send('Estou melhor do que mereço. Obrigada!');
// })
// .matches('Ferias.Pedido.Reserva', (session) => {
//     session.send('Que bom! Poderia me informar o período que deseja tirar férias?');
// })
// .matches('Ferias.Dados.Reserva', (session) => {
//     session.send('Excelente período!');
// })
// .onDefault((session) => {
//     session.send('Desculpa, Não entendi \'%s\'.', session.message.text);
// });


//bot.dialog('/', intents);
/*
bot.dialog('Cumprimentos.Iniciais', [
    function (session) {
        builder.Prompts.text(session, `Olá. Seja bem-vindo! Meu nome é Rhinos. Posso saber o seu nome?`);
    },
    function (session, results) {
        session.userData.nome = results.response;
        session.endDialog('Olá %s! Como posso ajudar?', results.response);
        session.save();
    }
]).triggerAction({
    matches: 'Cumprimentos.Iniciais'
});
/*
bot.dialog('Ferias.Pedido.Reserva', [
    function (session, args, next) {
        builder.Prompts.text(session, 'Legal! Férias é sempre bom, não é ' + session.userData.nome);
    },
    function (session, results) {
        //teste time
        builder.Prompts.time(session, "What time would you like to set an alarm for?");
        //session.endDialog('Para quando deseja as suas férias?');
    },
    function (session, results) {
        //teste time
        session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "Time: " + session.dialogData.time);
        //session.endDialog('Para quando deseja as suas férias?');
    }
]).triggerAction({
    matches: 'Ferias.Pedido.Reserva'
});

bot.dialog('Ferias.Dados.Reserva', [
    function (session, args, next) {
        // Resolve and store any Note.Title entity passed from LUIS.
        var intent = args.intent;
        var DataInicial = builder.EntityRecognizer.findEntity(intent.entities, 'DataInicial');
        var DataFinal = builder.EntityRecognizer.findEntity(intent.entities, 'DataFinal');
        var Mes = builder.EntityRecognizer.findEntity(intent.entities, 'Mes');
        builder.Prompts.text(session, 'DataInicial: ' + JSON.stringify(DataInicial));
        builder.Prompts.text(session, 'DataFinal: ' + JSON.stringify(DataFinal));
        builder.Prompts.text(session, 'Mes: ' + JSON.stringify(Mes));
        builder.Prompts.text(session, 'Confere?');

        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .title("Requisição de férias")
                .subtitle("Por favor confira se os dados estão corretos")
                .text("Data inicial: " + DataInicial.entity)
                .text("Data final: " + DataFinal.entity)
                .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
                .buttons([
                    builder.CardAction.imBack(session, "confirmar requisição", "Confirmar")
                ])
        ]);
        session.send(msg).endDialog();
    },
    function (session, results) {
        // var msg = new builder.Message(session);
        // msg.attachmentLayout(builder.AttachmentLayout.carousel)
        // msg.attachments([
        //     new builder.HeroCard(session)
        //         .title("Classic White T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
        //         .buttons([
        //             builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy")
        //         ]),
        //     new builder.HeroCard(session)
        //         .title("Classic Gray T-Shirt")
        //         .subtitle("100% Soft and Luxurious Cotton")
        //         .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        //         .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/grayshirt.png')])
        //         .buttons([
        //             builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
        //         ])
        // ]);
        // session.send(msg).endDialog();
        //session.endDialog('Confirmando data...');
    }
]).triggerAction({
    matches: 'Ferias.Dados.Reserva'
});

// */
// if (useEmulator) {
//     var restify = require('restify');
//     var server = restify.createServer();
//     server.listen(3978, function() {
//         console.log('test bot endpont at http://localhost:3978/api/messages');
//     });
//     server.post('/api/messages', connector.listen());
// } else {
//     module.exports = { default: connector.listen() }
// }

