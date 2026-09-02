const list=document.getElementById("commandList");

const viewer=document.getElementById("viewer");

const search=document.getElementById("search");

const docs=[

{

title:"say",

icon:"💬",

description:"Prints text to the screen.",

syntax:
`say "Hello"

say player`,

example:
`player is "Rivaan"

say "Hello" player`

},

{

title:"variables",

icon:"📦",

description:"Stores information.",

syntax:
`score is 10

player is "Rivaan"`,

example:
`birthday is 5

birthday is birthday plus 1`

},

{

title:"repeat",

icon:"🔁",

description:"Repeats code.",

syntax:
`repeat 5

say "Hello"

end`,

example:
`number is 5

repeat 5

say number

number is number minus 1

end`

},

{
title:"math",
icon:"🧮",
description:"Adds and subtracts numbers.",

syntax:
`score is score plus 1

lives is lives minus 1`,

example:
`coins is 10

coins is coins plus 5

say coins`
},

{
title:"if",
icon:"🧠",
description:"Runs code if a condition is true.",

syntax:
`if score is 10

say "Winner!"

end`,

example:
`coins is 100

if coins is 100

say "Rich!"

end`
},

{
title:"else",
icon:"😎",
description:"Runs if the IF condition was false.",

syntax:
`if score is 10

say "Winner"

else

say "Try Again"

end`,

example:
`coins is 0

if coins is 100

say "Rich"

else

say "Poor"

end`
},

{
title:"else if",
icon:"🤔",
description:"Checks another condition.",

syntax:
`if score is 10

...

else if score is 5

...

else

...

end`,

example:
`if health is 100

say "Full"

else if health is 50

say "Half"

else

say "Low"

end`
},

{
title:"repeat",
icon:"🔁",
description:"Repeats code a number of times.",

syntax:
`repeat 5

say "Hi"

end`,

example:
`number is 5

repeat 5

say number

number is number minus 1

end`
},

{
title:"forever",
icon:"♾",
description:"Runs forever until the program stops.",

syntax:
`forever

say "Running"

end`,

example:
`forever

wait for 1 seconds

say "Tick"

end`
},

{
title:"while",
icon:"🌀",
description:"Repeats while a condition is true.",

syntax:
`while lives is not 0

...

end`,

example:
`lives is 3

while lives is not 0

say lives

lives is lives minus 1

end`
},

{
title:"wait",
icon:"⏳",
description:"Pauses the program.",

syntax:
`wait for 2`,

example:
`say "Ready"

wait for 1

say "Go!"`
},

{
title:"colour",
icon:"🎨",
description:"Changes the output colour.",

syntax:
`colour is lime`,

example:
`colour is cyan

say "Hello!"`
},

{
title:"random",
icon:"🎲",
description:"Generates a random number.",

syntax:
`number is random 1 to 10`,

example:
`dice is random 1 to 6

say dice`
},

{
title:"functions",
icon:"🎉",
description:"Groups code together.",

syntax:
`function Jump

say "Jump!"

end

do Jump`,

example:
`function HappyBirthday

say "Happy Birthday!"

end

do HappyBirthday`
}

];

function render(filter=""){

    list.innerHTML="";

    docs

    .filter(doc=>

        doc.title

        .toLowerCase()

        .includes(

            filter.toLowerCase()

        )

    )

    .forEach(doc=>{

        const div=document.createElement("div");

        div.className="command";

        div.innerHTML=

        `${doc.icon} ${doc.title}`;

        div.onclick=()=>{

            viewer.innerHTML=

            `
            <h1>${doc.icon} ${doc.title}</h1>

            <p>${doc.description}</p>

            <h2>Syntax</h2>

            <code>${doc.syntax}</code>

            <h2>Example</h2>

            <code>${doc.example}</code>
            `;

        };

        list.appendChild(div);

    });

}

render();

search.oninput=()=>{

    render(search.value);

};