console.log("👾 CodeOS Runner Started");


const output = document.getElementById("output");


let code = localStorage.getItem("codeosProgram");

const loadingScreen = document.getElementById("loadingScreen");

const loadingFill = document.getElementById("loadingFill");


let variables = {};

const sprites = {};

// 🖱️ CLICK + ⌨️ KEY EVENTS
const clickedSprites = {};
const pressedKeys = {};
const consumedKeys = {};

function normalizeKey(key) {
    key = key.toLowerCase();

    const keyMap = {
        " ": "space",
        "arrowup": "up",
        "arrowdown": "down",
        "arrowleft": "left",
        "arrowright": "right",
        "enter": "enter",
        "escape": "escape",
        "shift": "shift",
        "control": "ctrl",
        "alt": "alt",
        "backspace": "backspace",
        "tab": "tab"
    };

    return keyMap[key] || key;
}

document.addEventListener("keydown", (event) => {
    const key = normalizeKey(event.key);

    // Only register the first keydown
    if (!pressedKeys[key]) {
        pressedKeys[key] = true;
        consumedKeys[key] = false;
    }
});

document.addEventListener("keyup", (event) => {
    const key = normalizeKey(event.key);

    pressedKeys[key] = false;
    consumedKeys[key] = false;
});

const projectFiles =
JSON.parse(
    localStorage.getItem("codeosFiles") || "[]"
);


const functions = {};




if(!code){

    output.style.display = "block";

    loadingScreen.style.display = "none";

    output.innerHTML = "😭 No program found";

}
else{

    boot();

}

async function boot(){

    loadingFill.style.width = "100%";

    await new Promise(resolve=>{

        setTimeout(resolve,2000);

    });

    loadingScreen.style.display = "none";

    output.style.display = "block";

    run(code);

}




async function run(code){


    output.style.display="block";


    let lines = code.split("\n");

    // 📚 Find all functions

// 📚 Scan functions
for(let i = 0; i < lines.length; i++){

    let line = lines[i].trim();

    if(line.startsWith("function ")){

        let name = line.substring(9).trim();

        let depth = 1;
        let end = i + 1;

        while(depth > 0 && end < lines.length){

            let current = lines[end].trim();

            if(
                current.startsWith("function ") ||
                current.startsWith("if ") ||
                current.startsWith("repeat ") ||
                current.startsWith("while ") ||
                current === "forever"
            ){
                depth++;
            }

            if(current === "end"){
                depth--;
            }

            end++;
        }

        // Store the ACTUAL function body
        functions[name] = {
            body: lines.slice(i + 1, end - 1)
        };

    }
}

let skipMode = false;
let ifRunning = false;
let ifPassed = false;
let elseChain = false;
let loopRunning = true;



    for(let i = 0; i < lines.length; i++){

    let line = lines[i];


        line=line.trim();


        if(line==="") continue;

        // 📦 FUNCTION DEFINITION

if(line.startsWith("function ")){

    while(lines[i].trim() !== "end"){
        i++;
    }

    continue;

}

 // ♾️ FOREVER LOOP

if(line==="forever"){

    let start = i + 1;

    let end = start;

    while(
        end < lines.length &&
        lines[end].trim() !== "end"
    ){

        end++;

    }


    while(true){

        await run(
            lines
                .slice(start, end)
                .join("\n")
        );

        // 💤 Give the browser time to breathe
        await new Promise(resolve => {
            setTimeout(resolve, 16);
        });

    }

}

// 🧠 WHILE LOOP

if(line.startsWith("while ")){

    let start=i+1;

    let end=start;


    while(lines[end].trim() !== "end"){

        end++;

    }


    let condition=line.substring(6);


    while(checkCondition(condition)){


        await run(
            lines.slice(start,end).join("\n")
        );


    }


    i=end;

    continue;

}

// 🔁 REPEAT UNTIL

if(line.startsWith("repeat until ")){

    let condition =
        line.substring("repeat until ".length).trim();

    let start = i + 1;
    let end = start;

    while(
        end < lines.length &&
        lines[end].trim() !== "end"
    ){

        end++;

    }

    while(!checkCondition(condition)){

        await run(
            lines
                .slice(start, end)
                .join("\n")
        );

    }

    i = end;

    continue;

}

// 🔁 REPEAT LOOP

if(line.startsWith("repeat ")){

    let amount = Number(
        line.replace("repeat ","")
    );


    let start = i + 1;


    let end = start;


    while(lines[end].trim() !== "end"){

        end++;

    }


    for(let x = 0; x < amount; x++){

        await run(
            lines.slice(start,end).join("\n")
        );

    }


    i = end;

    continue;

}

        // IF STATEMENT
// 🧠 IF STATEMENT

if(line.startsWith("if ")){

    ifRunning = true;
    elseChain = true;

    let condition = line.substring(3).trim();

    if(checkCondition(condition)){

        skipMode = false;
        ifPassed = true;

    }
    else{

        skipMode = true;
        ifPassed = false;

    }

    continue;

}



// ELSE IF
if(line.startsWith("else if ")){

    if(ifPassed){

        skipMode = true;

    }
    else{

        let condition=line.substring(8);

        let parts=condition.split(" is ");

        let variable=parts[0].trim();

        let value=parts[1].trim();


        if(value.startsWith('"')){
            value=value.replaceAll('"',"");
        }
        else if(!isNaN(value)){
            value=Number(value);
        }


        if(variables[variable] == value){

            skipMode=false;
            ifPassed=true;

        }
        else{

            skipMode=true;

        }

    }


    continue;

}



// ELSE
if(line==="else"){

    if(ifPassed){

        skipMode=true;

    }
    else{

        skipMode=false;
        ifPassed=true;

    }


    continue;

}



// END
if(line==="end"){

    skipMode=false;
    ifRunning=false;
    ifPassed=false;
    elseChain=false;


    continue;

}

// ↩️ RETURN
if(line.startsWith("return ")){

    let value = line.substring(7).trim();

    return getValue(value);
}

        // SAY

        // SKIP FALSE IF BLOCKS
// SKIP FALSE IF BLOCKS
if(skipMode 
&& !line.startsWith("else")
&& line !== "end"){

    continue;

}

if(line.startsWith("say ")){

    let text = line.substring(4);


    let parts = text.match(/"[^"]*"|\S+/g);


    let result = "";


    parts.forEach(part=>{


        if(part.startsWith('"')){

            result += part.slice(1,-1) + " ";

        }

        else if(variables[part] !== undefined){

            result += variables[part] + " ";

        }

        else{

            result += part + " ";

        }


    });


    output.innerHTML += result.trim()+"<br>";

}

// 🖼 IMAGE

else if(line.startsWith("image is ")){

    let name =
    line.substring(9)
    .replaceAll('"',"")
    .trim();


    variables.image=name;


}

// SHOW IMAGE

else if(line==="show image"){

    let img=document.createElement("img");


    img.src=variables.image;


    img.style.width="200px";


    output.appendChild(img);

}

// 💬 ASK
else if(line.startsWith("ask ")){

    let input = line.substring(4).trim();

    // Find the closing quote of the prompt
    let firstQuote = input.indexOf('"');
    let secondQuote = input.indexOf('"', firstQuote + 1);

    if(firstQuote === -1 || secondQuote === -1){

        output.innerHTML +=
            '❌ Ask syntax: ask "prompt" type [variable]<br>';

        continue;
    }

    let question =
        input.substring(
            firstQuote + 1,
            secondQuote
        );

    let options =
        input.substring(secondQuote + 1).trim();

    let parts = options.split(/\s+/);

    let type = parts[0]?.toLowerCase();
    let variableName = parts[1] || "answer";

    // Check type
    if(
        type !== "number" &&
        type !== "text" &&
        type !== "boolean"
    ){

        output.innerHTML +=
            "❌ Unknown ask type: " +
            type +
            "<br>";

        continue;
    }

    // Ask the user
    let answer = prompt(question);

    if(answer === null){
        answer = "";
    }

    // 🔢 NUMBER
    if(type === "number"){

        let number = Number(answer);

        if(isNaN(number)){

            output.innerHTML +=
                "❌ " +
                variableName +
                " must be a number<br>";

            continue;
        }

        variables[variableName] = number;
    }

    // 📝 TEXT
    else if(type === "text"){

        variables[variableName] = answer;
    }

    // 🔘 BOOLEAN
    else if(type === "boolean"){

        let value = answer.toLowerCase();

        if(value === "true" || value === "yes"){

            variables[variableName] = true;

        }
        else if(value === "false" || value === "no"){

            variables[variableName] = false;

        }
        else{

            output.innerHTML +=
                "❌ " +
                variableName +
                " must be true/false or yes/no<br>";

            continue;
        }
    }

    console.log(
        "👾 ASK:",
        variableName,
        "=",
        variables[variableName],
        "(" + type + ")"
    );
}

// 🎲 RANDOM NUMBER

else if(line.includes(" is random ")){

    let parts = line.split(" is random ");

    let name = parts[0].trim();


    let range = parts[1].split(" to ");


    let min = Number(range[0]);

    let max = Number(range[1]);


    variables[name] =
    Math.floor(
        Math.random() * (max-min+1)
    ) + min;


}

// 🚀 DO FUNCTION
// 🚀 DO FUNCTION
else if(line.startsWith("do ")){

    let name = line.substring(3).trim();

    console.log("👾 DO:", name);

    if(!functions[name]){

        output.innerHTML +=
            "❌ Function not found: " +
            name +
            "<br>";

        continue;
    }

    let func = functions[name];

    // Run the stored function body
    await run(
        func.body.join("\n")
    );
}

// 👾 CREATE SPRITE

else if(line.startsWith("create sprite ")){

    let name = line.substring(14).trim();

    let div = document.createElement("img");

    div.style.position = "absolute";

    div.style.left = "0px";

    div.style.top = "0px";

    div.style.width = "64px";

    document.body.appendChild(div);

    sprites[name] = {

    element: div,

    x: 0,

    y: 0,

    image: ""

};

clickedSprites[name] = false;

div.addEventListener("click", () => {
    clickedSprites[name] = true;
});

}

// 🖼 PLAYER IMAGE

else if(line.includes(" image is ")){

    let parts = line.split(" image is ");

    let sprite = parts[0].trim();

    let image = parts[1]
        .replaceAll('"',"")
        .trim();

    if(sprites[sprite]){

        const file = projectFiles.find(
    f => f.name === image
);

if(file){

    sprites[sprite].image = file.content;

    sprites[sprite].element.src = file.content;

}
else{

    output.innerHTML +=
    "❌ Image not found: " + image + "<br>";

}

    }

}

// 📍 POSITION

else if(line.includes(" x is ")){

    let parts=line.split(" x is ");

    let sprite=parts[0].trim();

    let x=Number(parts[1]);

    if(sprites[sprite]){

        sprites[sprite].x=x;

        sprites[sprite].element.style.left=x+"px";

    }

}

// 📏 SIZE

else if(line.includes(" size is ")){

    let parts = line.split(" size is ");

    let sprite = parts[0].trim();

    let size = Number(parts[1]);

    if(sprites[sprite]){

        sprites[sprite].element.style.width = size + "px";
        sprites[sprite].element.style.height = size + "px";

    }

}

// 📍 Y

else if(line.includes(" y is ")){

    let parts=line.split(" y is ");

    let sprite=parts[0].trim();

    let y=Number(parts[1]);

    if(sprites[sprite]){

        sprites[sprite].y=y;

        sprites[sprite].element.style.top=y+"px";

    }

}

// 🧮 ADVANCED MATH

else if(
    line.includes(" is ") &&
    line.includes(" multiply ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let equation = parts[1].trim();

    let values = equation.split(" multiply ");

    let first = values[0].trim();
    let second = values[1].trim();

    let firstValue =
        variables[first] !== undefined
        ? variables[first]
        : Number(first);

    let secondValue =
        variables[second] !== undefined
        ? variables[second]
        : Number(second);

    variables[name] =
        Number(firstValue) * Number(secondValue);

}


else if(
    line.includes(" is ") &&
    line.includes(" divide ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let equation = parts[1].trim();

    let values = equation.split(" divide ");

    let first = values[0].trim();
    let second = values[1].trim();

    let firstValue =
        variables[first] !== undefined
        ? variables[first]
        : Number(first);

    let secondValue =
        variables[second] !== undefined
        ? variables[second]
        : Number(second);

    if(Number(secondValue) === 0){

        output.innerHTML +=
            "❌ Cannot divide by zero<br>";

    }
    else{

        variables[name] =
            Number(firstValue) / Number(secondValue);

    }

}


else if(
    line.includes(" is ") &&
    line.includes(" floor ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let value = parts[1]
        .replace("floor ", "")
        .trim();

    let number =
        variables[value] !== undefined
        ? variables[value]
        : Number(value);

    variables[name] =
        Math.floor(Number(number));

}


else if(
    line.includes(" is ") &&
    line.includes(" ceiling ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let value = parts[1]
        .replace("ceiling ", "")
        .trim();

    let number =
        variables[value] !== undefined
        ? variables[value]
        : Number(value);

    variables[name] =
        Math.ceil(Number(number));

}


else if(
    line.includes(" is ") &&
    line.includes(" sqrt ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let value = parts[1]
        .replace("sqrt ", "")
        .trim();

    let number =
        variables[value] !== undefined
        ? variables[value]
        : Number(value);

    variables[name] =
        Math.sqrt(Number(number));

}


else if(
    line.includes(" is ") &&
    line.includes(" square ")
){

    let parts = line.split(" is ");

    let name = parts[0].trim();
    let value = parts[1]
        .replace("square ", "")
        .trim();

    let number =
        variables[value] !== undefined
        ? variables[value]
        : Number(value);

    variables[name] =
        Number(number) * Number(number);

}





        // VARIABLE CREATION

        // COLOUR
else if(line.startsWith("colour is ")){

    let colour = line.substring(10).trim();

    output.style.color = colour;

}
        else if(
    line.includes(" is ")
    &&
    !line.includes(" plus ")
    &&
    !line.includes(" minus ") &&
    !line.startsWith("wait until ") &&
    !line.startsWith("repeat until ")
){


            let parts=line.split(" is ");


            let name=parts[0].trim();


            let value=parts[1].trim();

// ↩️ FUNCTION RETURN VALUE
if(value.startsWith("do ")){

    let functionName = value.substring(3).trim();

    if(!functions[functionName]){

        output.innerHTML +=
            "❌ Function not found: " +
            functionName + "<br>";

        continue;
    }

    let func = functions[functionName];

    let result = await run(
    func.body.join("\n")
);

    variables[name] = result;

    console.log(
        "👾 Function:",
        functionName,
        "returned:",
        result,
        "Type:",
        typeof result
    );

    continue;
}



            if(value.startsWith('"')){

                variables[name]=value.replaceAll('"',"");

            }

            else if(!isNaN(value)){

                variables[name]=Number(value);

            }

            else{

                variables[name]=value;

            }


        }





        // MATH
        // MATH
// 🧮 MATH COMMANDS

else if(
    line.includes(" is ")
    &&
    (
        line.includes(" plus ")
        ||
        line.includes(" minus ")
    )
){

    let parts=line.split(" is ");


    let name=parts[0].trim();


    let equation=parts[1].trim();


    let operation;


    if(equation.includes(" plus ")){
        operation="plus";
    }
    else{
        operation="minus";
    }



    let values=equation.split(
        " " + operation + " "
    );


    let first=values[0].trim();

    let second=values[1].trim();



    let firstValue =
    variables[first] !== undefined
    ? variables[first]
    : Number(first);



    let secondValue =
    variables[second] !== undefined
    ? variables[second]
    : Number(second);



    if(operation==="plus"){

        variables[name] =
        Number(firstValue)+Number(secondValue);

    }


    if(operation==="minus"){

        variables[name] =
        Number(firstValue)-Number(secondValue);

    }


}

// ⏳ WAIT UNTIL

else if(line.startsWith("wait until ")){

    let condition =
        line.substring("wait until ".length).trim();

    while(!checkCondition(condition)){

        await new Promise(resolve => {
            setTimeout(resolve, 50);
        });

    }

}





        // WAIT
        else if(line.startsWith("wait for ")){

            let seconds =
            Number(
                line
                .replace("wait for ","")
                .replace(" seconds","")
            );


            await new Promise(resolve=>{

                setTimeout(resolve,seconds*1000);

            });


        }





        else{

            output.innerHTML +=
            "❌ I don't understand: "+line+"<br>";

        }


    }


}

function getValue(value){

    value = value.trim();

    // 📝 String
    if(
        value.startsWith('"') &&
        value.endsWith('"')
    ){

        return value.slice(1, -1);

    }

    // 📦 Variable
    if(
        variables[value] !== undefined
    ){

        return variables[value];

    }

    // 🔢 Number
    if(!isNaN(value)){

        return Number(value);

    }

    return value;

}


function checkCondition(condition){

    condition = condition.trim();


    // 🖱️ SPRITE CLICKED

if(condition.endsWith(" clicked")){

    let spriteName =
        condition.substring(
            0,
            condition.length - " clicked".length
        ).trim();

    if(clickedSprites[spriteName] === true){

        // Consume the click so it only triggers once
        clickedSprites[spriteName] = false;

        return true;
    }

    return false;
}


    // ⌨️ KEY PRESSED
if(condition.endsWith(" pressed")){

    let key =
        condition.substring(
            0,
            condition.length - " pressed".length
        ).trim();

    key = normalizeKey(
        key.replaceAll('"', "")
    );

    if(
        pressedKeys[key] === true &&
        consumedKeys[key] === false
    ){
        consumedKeys[key] = true;
        return true;
    }

    return false;
}


    // 🚫 NOT

    if(condition.startsWith("not ")){

        return !checkCondition(
            condition.substring(4).trim()
        );

    }


    // 🧩 AND
    if(condition.includes(" and ")){

        let parts = condition.split(" and ");

        return parts.every(part =>
            checkCondition(part)
        );

    }


    // 🔀 OR
    if(condition.includes(" or ")){

        let parts = condition.split(" or ");

        return parts.some(part =>
            checkCondition(part)
        );

    }


    // 🔎 CONTAINS
    if(condition.includes(" contains ")){

        let parts =
            condition.split(" contains ");

        let first =
            getValue(parts[0]);

        let second =
            getValue(parts[1]);

        return String(first).includes(
            String(second)
        );

    }


    // 🚫 IS NOT
    if(condition.includes(" is not ")){

        let parts =
            condition.split(" is not ");

        return getValue(parts[0]) !=
               getValue(parts[1]);

    }


    // ⬆️ GREATER THAN OR EQUAL
    if(condition.includes(" is greater than or equal to ")){

        let parts =
            condition.split(
                " is greater than or equal to "
            );

        return Number(getValue(parts[0])) >=
               Number(getValue(parts[1]));

    }


    // ⬇️ LESS THAN OR EQUAL
    if(condition.includes(" is less than or equal to ")){

        let parts =
            condition.split(
                " is less than or equal to "
            );

        return Number(getValue(parts[0])) <=
               Number(getValue(parts[1]));

    }


    // ⬆️ GREATER THAN
    if(condition.includes(" is greater than ")){

        let parts =
            condition.split(
                " is greater than "
            );

        return Number(getValue(parts[0])) >
               Number(getValue(parts[1]));

    }


    // ⬇️ LESS THAN
    if(condition.includes(" is less than ")){

        let parts =
            condition.split(
                " is less than "
            );

        return Number(getValue(parts[0])) <
               Number(getValue(parts[1]));

    }


    // 🟰 IS
    if(condition.includes(" is ")){

        let parts =
            condition.split(" is ");

        return getValue(parts[0]) ==
               getValue(parts[1]);

    }


    return false;

}