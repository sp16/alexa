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

const biology = [
    question("Which is not part of cellular respiration? 1. Citric acid cycle 2. Krebs Cycle 3. Calvin Cycle", 3),
    question("What is not true about water? 1. hydrogen bonds 2. low specific heat 3. cohesion", 2),
    question("What type of speciation involves a geographic barrier? 1. allopatric 2. sympatric", 1),
    question("Which is not an autotroph? 1. kelp 2. grasshopper 3. mushroom", 2),
    question("What system controls hormones? 1. lymphatic 2. endocrine 3. integumentary", 2),
    question("Which nucleic acid is not in RNA? 1. thymine 2. uracil 3. adenine", 1),
    question("What are the DNA strands of the lagging strand called? 1. mRNA 2. DNA Polymerase 3. Okazaki Fragments", 3),
    question("What plant did Gregor Mendel primarily work with? 1. Arabidopsis Thaliana 2. pea plants 3. Wheat", 2),
    question("Who coined the term 'survival of the fittest'? 1. Watson and Crick 2. Charles Darwin 3. Hershey and Chase", 2),
    question("What model does replication follow? 1. conservative 2. dispersive 3. semiconservative", 3)
];

const getANewQuestion = function (subject, alreadyAskedQuestions) {

    let questionsList;

    switch (subject) {

        case "Macro": questionsList = macros; break;
        case "Micro": questionsList = micros; break;
        case "Biology": questionsList = biology; break;
    }

    let counter = 0;
    if (!alreadyAskedQuestions) {
        return questionsList[counter]
    }

    let question = questionsList[counter];

    while (counter < questionsList.length && alreadyAskedQuestions.includes(question.id)){
        counter += 1;
        question = questionsList[counter];
    }

    if (counter > questionsList) {
        return;
    }

    return question;

};

const askQuestion = function(jovoInstance, subject, response) {

    if (!response)
        response = "";

    const question = getANewQuestion(subject, jovoInstance.$session.$data.questionsAskedList);

    if (!question) {
        return jovoInstance.ask("You are done with the questions. Do you want to try something else?");
    }

    if (!jovoInstance.$session.$data.questionsAskedList) {
        jovoInstance.$session.$data.questionsAskedList = [question.id]
    } else {
        jovoInstance.$session.$data.questionsAskedList.push(question.id)
    }

    jovoInstance.$session.$data.type = subject;
    jovoInstance.$session.$data.answer = question.answer;
    jovoInstance.$googleAction.showSuggestionChips(['1', '2', '3']);

    return jovoInstance.ask(response + question.question);

};

const checkAnswer = function (jovoInstance, answer) {
    const correctAnswer = jovoInstance.$session.$data.answer;
    const type = jovoInstance.$session.$data.type;

    console.log(`Correct answer: ${correctAnswer}, Aprovided answer: ${answer}`);
    const response = correctAnswer === answer ? 'Good Job! Now next question. ' : 'You got it wrong! The right answer was the option '+correctAnswer +" .";

    return askQuestion(jovoInstance, type, response);

};

app.setHandler({
    LAUNCH() {
        return this.toIntent('HelloWorldIntent');
    },
//this.tell is the last line
    MacroIntent() {

        return askQuestion(this, "Macro");
    },
    MicroIntent() {

        return askQuestion(this, "Micro");
    },
    BiologyIntent() {
        console.log("hello");
        return askQuestion(this, "Biology");
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
