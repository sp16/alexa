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
    let  min = 0;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

let question_number = 0;

const question = function (question, answer) {
    question_number += 1;

    return {
        "question": question,
        "answer": answer,
        "id": question_number
    }
};

const macros = [
    question("What is it macro? 1. Job, 2. Water, 3. laptop", 2),
    question("question 2 macro?", 3)
];

const micros = [
    question("What is the definition of opportunity cost? 1. The most desirable alternative given up as the result of a decision 2. The explicit price of a good 3. The total implicit cost of a good", 1),
    question("Which of the following is not a factor of production? 1. natural resources 2. labor 3. government subsidies", 3),
    question("If two goods have a cross price elasticity of 4, what are they? 1. substitutes 2. complements", 1),
    question("If a producer can produce a good at the lowest opportunity cost, what kind of advantage do they have? 1. absolute advantage 2. comparative advantage", 2),
    question("What does a price ceiling cause? 1. a surplus 2. a shortage 3. unemployment", 2),
    question("Which does not cause a shift in the PPC curve? 1. unemployment 2. change in technology 3. trade", 1),
    question("Which is not a shifter of the demand curve? 1. change in taste 2. future expectations 3. technology", 3),
    question("Which has the lowest barrier to entry? 1. monopolistic competition 2. perfect competition 3. monopoly", 2),
    question("According to the law of demand, when price rises, when happens to demand? 1. it rises 2. it falls", 2),
    question("What is satisfaction measured in? 1. utilities 2. happys 3. utils", 3)
];

const getANewQuestion = function (macro, alreadyAskedQuestions) {

    const questionsList = macro ? macros : micros;
    let counter = 0;
    let question = macros[counter];

    while(alreadyAskedQuestions.includes(question.id) && counter < questionsList.length ){
        counter+=1;
        question = macros[counter];
    }
    if(counter>questionsList){
        return;
    }

    return question;
};

const askQuestion = function(jovoInstance, macro, response){
    //macro is a boolean
    if (!response)
        response = "";

    const question = getANewQuestion(true);
    if(!question){
        return jovoInstance.ask("You are done with the questions. Do you want to try something else?");
    }

    if(!jovoInstance.$session.$data.questionsAskedList){
        jovoInstance.$session.$data.questionsAskedList = [question.id]
    }
    else{
        jovoInstance.$session.$data.questionsAskedList.push(question.id)
    }

    if (macro){

        jovoInstance.$session.$data.type = "Macro";
        jovoInstance.$session.$data.answer = question.answer;

        return jovoInstance.ask(response + question.question);
    }

    jovoInstance.$session.$data.type = "Micro";
    jovoInstance.$session.$data.answer = question.answer;

    return jovoInstance.ask(response + question.question);
};

const checkAnswer = function (jovoInstance, answer) {
    const correctAnswer = jovoInstance.$session.$data.answer;
    const type = jovoInstance.$session.$data.type;
    const macro = type === "Macro";
    console.log(`Correct answer: ${correctAnswer}, Aprovided answer: ${answer}`)
    const response = correctAnswer === answer ? 'Good Job! Now next question. ' : 'You got it wrong!';

    return askQuestion(jovoInstance, macro, response);

};

app.setHandler({
    LAUNCH() {
        return this.toIntent('HelloWorldIntent');
    },
//this.tell is the last line
    MacroIntent() {

        return askQuestion(this, true);
    },
    MicroIntent() {

        return askQuestion(this, false);
    },

    OptionOneIntent(){
        return checkAnswer(this, 1);
    },

    OptionTwoIntent(){
        return checkAnswer(this, 2);

    },

    OptionThreeIntent(){
        return checkAnswer(this, 3);
    }

});

module.exports.app = app;
