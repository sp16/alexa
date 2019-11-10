function getRandomInt(max) {
    let  min = 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
console.log(getRandomInt( 2));
