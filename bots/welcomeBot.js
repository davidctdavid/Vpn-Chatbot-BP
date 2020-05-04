// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required Bot Framework classes.
const { ActionTypes, ActivityHandler, CardFactory, MessageFactory } = require('botbuilder');

// Welcomed User property name
const WELCOMED_USER = 'welcomedUserProperty';

class WelcomeBot extends ActivityHandler {
    /**
     *
     * @param {UserState} User state to persist boolean flag to indicate
     *                    if the bot had already welcomed the user
     */
    constructor(userState) {
        super();
        // Creates a new user property accessor.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.userState = userState;

        this.onMessage(async (context, next) => {
            // Read UserState. If the 'DidBotWelcomedUser' does not exist (first time ever for a user)
            // set the default to false.
            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

            // Your bot should proactively send a welcome message to a personal chat the first time
            // (and only the first time) a user initiates a personal chat with your bot.
            if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                const userName = context.activity.from.name;
                //await context.sendActivity('Estás viendo este mensaje porque este fue tu primer mensaje enviado a este bot.');
                // await context.sendActivity(`Es una buena práctica dar la bienvenida al usuario y brindar un saludo personal. Por ejemplo, bienvenido ${userName}.`);
                await context.sendActivity(`Hola, ${context.activity.text}.`);
                await context.sendActivity('Estoy dispuesto a solucionar tu problema de VPN🧑‍💻 si deseas iniciar una conversación. ' +
                    'Puedes llamarme con las siguientes palabras claves: \'hola\', \'Buenas tardes\', \'ayuda\' , \'inicio\'. ' +
                    'Pruébalo ahora, escribe \'hola\'');
                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(context, true);
            } else {
                // This example uses an exact match on user's input utterance.
                // Consider using LUIS or QnA for Natural Language Processing.
                const text = context.activity.text.toLowerCase();
                switch (text) {
                    case 'hola':
                    case 'Hola':
                    case 'Buenas tardes':
                    case 'buenas tardes':
                    case 'Buenos dias':
                    case 'buenas tardes':
                        ///   await context.sendActivity(`Mensaje: "${ context.activity.text }"`);
                        await context.sendActivity('¡Bienvenido!👋 Colaborar de Banco Pichincha🧑‍💼, estoy dispuesto ayudarte para comenzar escribe (inicio).');

                        break;
                    case 'inicio':
                    case 'ayuda':

                        await this.sendSuggestedActions(context);
                        break;
                    case 'salir':
                        await context.sendActivity('Adios, espero poder haber ayudado en tu problema');

                        break;
                    case 'soluciones':

                        await context.sendActivity('mira la siquiente soluciones');
                        await this.sendIntroCard(context);

                        break;

                    default:

                        await context.sendActivity('Hola👋 ¡Bienvenido! a VPN Chatbot BP 🤖');
                        await context.sendActivity('Estoy dispuesto a solucionar tu problema de VPN si deseas iniciar una conversación. ' +
                            'Puedes llamarme con las siguientes palabras claves: \'hola\', \'Buenas tardes\', \'ayuda\' , \'inicio\'. ' +
                            'Pruébalo ahora, escribe \'hola\'');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // Sends welcome messages to conversation members when they join the conversation.
        // Messages are only sent to conversation members who aren't the bot.
        this.onMembersAdded(async (context, next) => {
            // Iterate over all new members added to the conversation
            for (const idx in context.activity.membersAdded) {
                // Greet anyone that was not the target (recipient) of this message.
                // Since the bot is the recipient for events from the channel,
                // context.activity.membersAdded === context.activity.recipient.Id indicates the
                // bot was added to the conversation, and the opposite indicates this is a user.
                if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hola👋 ¡Bienvenido! a VPN Chatbot BP 🤖');
                    await context.sendActivity(`¿Cuál es tu nombre?`);

                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save state changes
        await this.userState.saveChanges(context);
    }

    async sendIntroCard6(context) {
        const card = CardFactory.heroCard(
            '¡Bienvenido al Chatbot!',
            'Selecciona una de las opciones: ',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.MessageBack,
                    title: '¿Quieres ver soluciones de errores comunes?'
                },
                {
                    type: ActionTypes.MessageBack,
                    title: '¿Quieres validar tu VPN?'

                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Banco Pichincha - Workplace',
                    value: 'https://www.pichicha.com'
                }
            ]
        );
        console.log(card)
        await context.sendActivity({ attachments: [card] });
    }

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            '¡Bienvenido al Chatbot!',
            'Selecciona una de las opciones: ',
            ['¿Quieres ver soluciones de errores comunes?'],

            ['¿Quieres ver soluciones de errores comunes?']
        );


        const message = MessageFactory.attachment(card);
        await context.sendActivity(message);


    }


    async sendSuggestedActions(turnContext) {
        /* var reply = MessageFactory.suggestedActions(['¿Quieres analizar el estado de tu VPN?', '¿Quieres ver soluciones de errores comunes?', 'Salir'], 'Selecciona una opción: ');
         await turnContext.sendActivity(reply);*/

        const message = MessageFactory.list([

            CardFactory.heroCard('¿Quieres ver soluciones de errores comunes? ', ['imageUrl1'], ['Soluciones']),
            CardFactory.heroCard('¿Quieres realizar un analisis de tu VPN?', ['imageUrl1'], ['Analizar']),
            CardFactory.heroCard('Salir', ['imageUrl1'], ['Salir'])
        ]);
        await turnContext.sendActivity(message);


    }

    async sendIntroCard3(context) {
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.0",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Your registration is almost complete",
                    "size": "Medium",
                    "weight": "Bolder"
                },
                {
                    "type": "TextBlock",
                    "text": "What type of food do you prefer?",
                    "wrap": true
                },
                {
                    "type": "ImageSet",
                    "imageSize": "medium",
                    "images": [
                        {
                            "type": "Image",
                            "url": "https://contososcubademo.azurewebsites.net/assets/steak.jpg",
                            "size": "Medium"
                        },
                        {
                            "type": "Image",
                            "url": "https://contososcubademo.azurewebsites.net/assets/chicken.jpg",
                            "size": "Medium"
                        },
                        {
                            "type": "Image",
                            "url": "https://contososcubademo.azurewebsites.net/assets/tofu.jpg",
                            "size": "Medium"
                        }
                    ]
                }
            ],
            "actions": [
                {
                    "type": "Action.ShowCard",
                    "title": "Steak",
                    "card": {
                        "type": "AdaptiveCard",
                        "body": [
                            {
                                "type": "TextBlock",
                                "text": "How would you like your steak prepared?",
                                "size": "Medium",
                                "wrap": true
                            },
                           
                            {
                                "type": "Input.Text",
                                "id": "SteakOther",
                                "isMultiline": true,
                                "placeholder": "Any other preparation requests?"
                            }
                        ],
                        "actions": [
                            {
                                "type": "Action.Submit",
                                "title": "OK",
                                "data": {
                                    "FoodChoice": "Steak"
                                }
                            }
                        ],
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
                    }
                },
                {
                    "type": "Action.ShowCard",
                    "title": "Chicken",
                    "card": {
                        "type": "AdaptiveCard",
                        "body": [
                            {
                                "type": "TextBlock",
                                "text": "Do you have any allergies?",
                                "size": "Medium",
                                "wrap": true
                            },
                            {
                                "type": "Input.ChoiceSet",
                                "id": "ChickenAllergy",
                                "style": "expanded",
                                "isMultiSelect": true,
                                "choices": [
                                    {
                                        "title": "I'm allergic to peanuts",
                                        "value": "peanut"
                                    }
                                ]
                            },
                            {
                                "type": "Input.Text",
                                "id": "ChickenOther",
                                "isMultiline": true,
                                "placeholder": "Any other preparation requests?"
                            }
                        ],
                        "actions": [
                            {
                                "type": "Action.Submit",
                                "title": "OK",
                                "data": {
                                    "FoodChoice": "Chicken"
                                }
                            }
                        ],
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
                    }
                },
                {
                    "type": "Action.ShowCard",
                    "title": "Tofu"
                }
                
            ]
        });

        const message = MessageFactory.attachment(card);

        await context.sendActivity(message);

    }

}

module.exports.WelcomeBot = WelcomeBot;
