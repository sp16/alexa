'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

function getRandomInt(max) {
    const min = 1;
    return Math.random() * (max - min) + min;
}

const question = function (question, answer) {
    return {
        "question": question,
        "answer": answer
    }
};

const macros = [
    question("What is it macro?", 2),
    question("question 2 macro?", 3)
];

const micros = [
    question("What is it micro?", 2),
    question("question 2 micro?", 3)
];

const askQuestion = function(macro, response){
    //macro is a boolean
    if (!response)
        response = "";

    if (macro){

        this.$session.$data.type = "Macro";
        const question = macros[getRandomInt(macros.length)];

        this.$session.$data.answer = question.answer;
        return this.ask(response + question.question);
    }

    this.$session.$data.type = "Micro";
    const question = micros[getRandomInt(micros.length)];

    this.$session.$data.answer = question.answer;
    return this.ask(response + question.question);
};

const checkAnswer = function (answer) {
    const correctAnswer = this.$session.$data.answer;
    const type = this.$session.$data.type;
    const macro = type === "Macro";

    const response = correctAnswer === answer ? 'Good Job! Now next question. ' : 'You got it wrong!';

    return askQuestion(macro, response);

};

app.setHandler({
    LAUNCH() {
        return this.toIntent('HelloWorldIntent');
    },
//this.tell is the last line
    MacroIntent() {

        return askQuestion(true);
    },
    MicroIntent() {

        return askQuestion(false);
    },

    OptionOneIntent(){
        return checkAnswer(1);
    },

    OptionTwoIntent(){
        return checkAnswer(2);

    },

    OptionThreeIntent(){
        return checkAnswer(3);
    }

});

module.exports.app = app;
