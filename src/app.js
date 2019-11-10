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
    question("If real interest rate in America drops lower than real interest rate in Europe, what happens to the supply of loanable funds in America? 1. decreases, 2. increases, 3. stays the same", 1),
    question("What is no unemployment? 1. No frictional unemployment, 2. No cyclical unemployment, 3. No structural unemployment", 2),
    question("What does a private open economy not include? 1. consumption, 2. government spending, 3. net exports", 2),
    question("Which of the following is not a shortcoming of GDP? 1. It doesn't account for substitution of consumer goods, 2. It doesn't measure the value of leisure, 3. It doesn't account for the increase of quality of the products over time", 1),
    question("A barter government is different from a money economy in that a barter economy? 1. Has only a few assets that act as a medium of exchange, 2. Eliminates the need for a double coincidence of wants, 3. Involves higher cost for each transcription", 3),
    question("Which of the following is not a determinant of a country's productivity? 1. land capital, 2. machines used in production, 3. health", 3),
    question("What is a way to expand the production possibilities frontier? 1. Reducing unemployment, 2. improve technology, 3. nIncreasing productivity", 2)
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

    if(!alreadyAskedQuestions){
        return questionsList[0]
    }

    let counter = 0;
    let question = questionsList[counter];

    while(alreadyAskedQuestions.includes(question.id) && counter < questionsList.length ){
        counter+=1;
        question = questionsList[counter];
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

    const question = getANewQuestion(macro, jovoInstance.$session.$data.questionsAskedList);
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
    const response = correctAnswer === answer ? 'Good Job! Now next question. ' : 'You got it wrong! The right answer was '+correctAnswer +" .";

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
