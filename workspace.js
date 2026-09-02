console.log("💻 Workspace Loaded!");

const renameModal=document.getElementById("renameModal");
const renameInput=document.getElementById("renameInput");

const overlay = document.getElementById("paletteOverlay");
const input = document.getElementById("commandInput");
const commandList = document.getElementById("commandList");

const workspaceOverlay =
document.getElementById("workspaceOverlay");

const workspaceList =
document.getElementById("workspaceList");

const workspaceSearch =
document.getElementById("workspaceSearch");

const newWorkspaceCard =
document.getElementById("newWorkspaceCard");

const newWorkspaceOverlay =
document.getElementById("newWorkspaceOverlay");

const workspaceNameInput =
document.getElementById("workspaceNameInput");

const cancelWorkspace =
document.getElementById("cancelWorkspace");

const createWorkspaceBtn =
document.getElementById("createWorkspaceBtn");

let renameIndex=-1;

let files = [];
let folders = [];
let openTabs = [0];
let selectedFile = 0;

let selectedIndex = 0;

const savedWorkspace =
JSON.parse(localStorage.getItem("codeosWorkspace"));

if(savedWorkspace){

    files = savedWorkspace.files || [];

    folders = savedWorkspace.folders || [];

    openTabs = savedWorkspace.openTabs || [0];

    selectedFile = savedWorkspace.selectedFile || 0;

}
else{

    files = [

    {
        name:"main.cdx",
        icon:"📄",
        content:'say("Hello World")',
        folder:null
    }

    ];

}

const commands = [

{
    icon:"🚀",
    name:"Launch Workspace",
    action:()=>{}
},

{
    icon:"📂",
    name:"Open Workspace",
    action:()=>showWorkspaceManager()
},

{
    icon:"✨",
    name:"New Workspace",
    action:()=>newWorkspace()
},

{
    icon:"⚙",
    name:"Settings",
    action:()=>alert("Settings Coming Soon!")
},

{
    icon:"🤖",
    name:"Ask AI",
    action:()=>alert("AI Coming Soon!")
},

{
    icon:"📖",
    name:"Documentation",
    action:()=>window.location.href="documentation.html"
},

{
    icon:"🕒",
    name:"Timeline",
    action:()=>alert("Timeline Coming Soon!")
}

];

function getWorkspaces(){

    return JSON.parse(
        localStorage.getItem("codeosWorkspaces")
        || "[]"
    );

}

async function saveWorkspace(name) {

    let list = getWorkspaces();

    let existingIndex = list.findIndex(
        w => w.name === name
    );

    let project = {
        id: existingIndex >= 0
            ? list[existingIndex].id
            : "codeos-" + Date.now(),

        name: name,

        type: "codeos",

        files: structuredClone(files),

        folders: structuredClone(folders),

        openTabs: structuredClone(openTabs),

        selectedFile: selectedFile,

        date: Date.now()
    };

    if (existingIndex >= 0) {
        list[existingIndex] = project;
    } else {
        list.push(project);
    }

    // Save locally
    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    // Save to Firebase if Firebase is available
    if (
        window.codeosFirebase &&
        window.codeosFirebase.db
    ) {

        try {

            await window.codeosFirebase.set(
                window.codeosFirebase.ref(
                    window.codeosFirebase.db,
                    "codeosWorkspaces/" + project.id
                ),
                project
            );

            console.log(
                "☁️ Workspace saved to Firebase:",
                project.id
            );

        } catch (error) {

            console.error(
                "❌ Failed to save workspace to Firebase:",
                error
            );

        }
    }

    return project;
}

const fileList=document.getElementById("fileList");

let hoveringFolder = false;

const editor = document.querySelector("textarea");

const imagePreview=document.getElementById("imagePreview");

editor.addEventListener("input",()=>{

    files[selectedFile].content = editor.value;

    saveWorkspaceState();

});

const tab = document.querySelector(".tab");

const tabs=document.getElementById("tabs");

const saveProjectBtn=document.getElementById("saveProjectBtn");
const loadProjectBtn=document.getElementById("loadProjectBtn");
const projectPicker=document.getElementById("projectPicker");

function renderFiles(){

    fileList.innerHTML="";

    folders.forEach(folder=>{

    const div=document.createElement("div");

    div.className="file";

    div.innerHTML=`${folder.open ? "📂" : "📁"} ${folder.name}`;

    div.onclick=()=>{

        folder.open=!folder.open;

        renderFiles();

        saveWorkspaceState();

    };

    div.addEventListener("dragover",(e)=>{

    e.preventDefault();

    hoveringFolder = true;

});

div.addEventListener("dragleave",()=>{

    hoveringFolder = false;

});

div.addEventListener("drop",(e)=>{

    e.preventDefault();

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=folder.name;

    renderFiles();

    saveWorkspaceState();

});

    fileList.appendChild(div);

    if(folder.open){

        const rootDrop=document.createElement("div");

rootDrop.style.height="8px";

rootDrop.style.marginBottom="6px";

rootDrop.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

rootDrop.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=null;

    hoveringFolder = false;

    window.draggedFile=undefined;

    renderFiles();

    saveWorkspaceState();

});

fileList.appendChild(rootDrop);

    files.forEach((file,index)=>{

        if(file.folder!==folder.name) return;

        const child=document.createElement("div");

child.className="file";

child.draggable=true;

child.dataset.index=index;

child.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        child.style.paddingLeft="28px";

        if(index===selectedFile){

            child.classList.add("active");

        }

        child.innerHTML=`${file.icon} ${file.name}`;

        child.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            if(file.icon==="🖼"){

    editor.style.display="none";

    showImage(file.content);

}else{

    imagePreview.style.display="none";
    editor.style.display="block";

    editor.value=file.content;

}

            renderFiles();

            saveWorkspaceState();

        };

        child.ondblclick=()=>{

            renameIndex=index;

            const dot=file.name.lastIndexOf(".");

            renameInput.value=file.name.substring(0,dot);

            renameModal.classList.remove("hidden");

            renameInput.focus();

            renameInput.select();

        };

        fileList.appendChild(child);

    });

}

});

    files.forEach((file,index)=>{

        if(file.folder!==null){

    return;

}

        const div=document.createElement("div");

div.className="file";

div.draggable=true;

div.dataset.index=index;

div.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        if(index===selectedFile){

            div.classList.add("active");

        }

        div.innerHTML=`${file.icon} ${file.name}`;

        div.onclick=()=>{

    selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

    if(files[index].icon==="🖼"){

    editor.style.display="none";

    showImage(files[index].content);

}else{

    imagePreview.style.display="none";

    editor.style.display="block";

    if(files[index].icon === "🖼"){

    editor.style.display = "none";

    showImage(files[index].content);

}
else{

    imagePreview.style.display = "none";

    editor.style.display = "block";

    editor.value = files[index].content;

}

}

    renderFiles();

    saveWorkspaceState();

};

div.ondblclick=()=>{

    renameIndex=index;

    const dot=files[index].name.lastIndexOf(".");

    renameInput.value=files[index].name.substring(0,dot);

    renameModal.classList.remove("hidden");

    renameInput.focus();

    renameInput.select();

};

        fileList.appendChild(div);

    });

}

renderFiles();

saveWorkspaceState();

const modal=document.getElementById("fileModal");
const fileName=document.getElementById("fileName");
const fileType=document.getElementById("fileType");
const imagePicker=document.getElementById("imagePicker");

let uploadedImage=null;

imagePicker.addEventListener("change",()=>{

    const file=imagePicker.files[0];

    if(!file){

        fileType.value="cdx";

        return;

    }

    uploadedImage=file;

    fileName.value=file.name.replace(/\.[^/.]+$/,"");

});

document.getElementById("newFileBtn").onclick=()=>{

    modal.classList.remove("hidden");

    fileName.value="";

    fileName.focus();

};

document.getElementById("cancelFile").onclick=()=>{

    modal.classList.add("hidden");

};

document.getElementById("closeWorkspacePopup").onclick = () => {
    workspaceOverlay.classList.add("hidden");
};


document.getElementById("createFile").onclick=()=>{

    const name=fileName.value.trim();

    if(!name) return;

    const type=fileType.value;

    let icon="📄";
    let content="";

    if(type==="image"){

    if(!uploadedImage){

        alert("Choose an image first.");

        return;

    }

    const reader = new FileReader();

reader.onload = () => {

    files.push({

        name: uploadedImage.name,

        icon: "🖼",

        folder: null,

        content: reader.result

    });

    saveWorkspaceState();

    uploadedImage = null;

    modal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

};

reader.readAsDataURL(uploadedImage);

return;

    uploadedImage=null;

    modal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

    return;

}

    switch(type){

        case "html":
            content=`<!DOCTYPE html>
<html>
<head>

</head>
<body>

</body>
</html>`;
            break;

        case "css":
            content=`body{

}`;
            break;

        case "js":
            content=`console.log("Hello World");`;
            break;

        case "json":
            content=`{

}`;
            break;

        case "cdx":
            content=`say("Hello World")`;
            break;

    }

    if(type==="html") icon="🌐";
    if(type==="css") icon="🎨";
    if(type==="js") icon="🟨";
    if(type==="json") icon="🟫";

    files.push({

        name:name+"."+type,

        icon,

        content,

        folder:null

    });

    saveWorkspaceState();

    renderFiles();

    saveWorkspaceState();

    modal.classList.add("hidden");

};

// =============================
// RESIZABLE EXPLORER
// =============================

const explorer = document.querySelector(".explorer");
const divider = document.querySelector(".divider");

let resizing = false;

divider.addEventListener("mousedown", () => {

    resizing = true;

    document.body.style.cursor = "ew-resize";

});

document.addEventListener("mousemove", (e) => {

    if(!resizing) return;

    let width = e.clientX;

    width = Math.max(180, width);
    width = Math.min(500, width);

    explorer.style.width = width + "px";

});

document.addEventListener("mouseup", () => {

    resizing = false;

    document.body.style.cursor = "default";

});

// Open the first file on startup

editor.value = files[selectedFile].content;

const lessonCode = localStorage.getItem("lessonWorkspaceCode");

if(lessonCode){

    files.push({

        name: "Lesson.cdx",

        icon: "📄",

        content: lessonCode,

        folder: null

    });

    saveWorkspaceState();

    selectedFile = files.length - 1;

    if(!openTabs.includes(selectedFile)){
        openTabs.push(selectedFile);
    }

    editor.value = lessonCode;

    renderFiles();

    saveWorkspaceState();

    renderTabs();

    localStorage.removeItem("lessonWorkspaceCode");

}

document.getElementById("deleteFileBtn").onclick = () => {

    if (files.length <= 1) {
        alert("You must have at least one file.");
        return;
    }

    if (!confirm(`Delete "${files[selectedFile].name}"?`))
        return;

    files.splice(selectedFile, 1);

    selectedFile = 0;
    openTabs = [0];

    imagePreview.style.display = "none";
    editor.style.display = "block";
    editor.value = files[0].content;

    saveWorkspaceState();
    renderFiles();
    renderTabs();

};

document.getElementById("cancelRename").onclick=()=>{

    renameModal.classList.add("hidden");

};

document.getElementById("homeButton").onclick = () => {

    window.location.href = "code.html";

};

document.addEventListener("keydown",(e)=>{

    // Open Palette
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="k"){

        e.preventDefault();

        overlay.classList.add("show");

        selectedIndex = 0;

        input.value = "";

        renderCommands();

        input.focus();

        return;

    }

    // Ignore everything if palette isn't open
    if(!overlay.classList.contains("show")) return;

    const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(input.value.toLowerCase())
    );

    if(e.key==="Escape"){

        overlay.classList.remove("show");

        input.value="";

        return;

    }

    if(e.key==="ArrowDown"){

        e.preventDefault();

        selectedIndex = (selectedIndex + 1) % filtered.length;

        renderCommands(input.value);

    }

    if(e.key==="ArrowUp"){

        e.preventDefault();

        selectedIndex--;

        if(selectedIndex < 0){

            selectedIndex = filtered.length - 1;

        }

        renderCommands(input.value);

    }

    if(e.key==="Enter"){

        e.preventDefault();

        filtered[selectedIndex].action();

        overlay.classList.remove("show");

        input.value="";

    }

});

document.getElementById("confirmRename").onclick=renameFile;

renameInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        renameFile();

    }

    if(e.key==="Escape"){

        renameModal.classList.add("hidden");

    }

});

function renameFile(){

    if(renameIndex===-1) return;

    const newName=renameInput.value.trim();

    if(!newName) return;

    const dot=files[renameIndex].name.lastIndexOf(".");

    const extension=files[renameIndex].name.substring(dot);

    files[renameIndex].name=newName+extension;

    saveWorkspaceState();

    renameModal.classList.add("hidden");

    renderFiles();

    saveWorkspaceState();

}

document.getElementById("newFolderBtn").onclick=()=>{

    const name=prompt("Folder name");

    if(!name) return;

    folders.push({

    name:name.trim(),

    open:true

});

    renderFiles();

    saveWorkspaceState();

};

document.getElementById("moveFileBtn").onclick=()=>{

    if(folders.length===0){

        alert("Create a folder first.");

        return;

    }

    const names=folders.map(f=>f.name).join("\n");

    const choice=prompt(
`Move "${files[selectedFile].name}" to:

${names}

(Type the folder name exactly)`
    );

    if(!choice) return;

    const folder=folders.find(f=>
        f.name.toLowerCase()===choice.toLowerCase()
    );

    if(!folder){

        alert("Folder not found.");

        return;

    }

    files[selectedFile].folder=folder.name;

    saveWorkspaceState();

    renderFiles();
};

fileList.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

fileList.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    if(hoveringFolder) return;

    files[window.draggedFile].folder = null;

    window.draggedFile = undefined;

    renderFiles();

    renderTabs();

    saveWorkspaceState();

});

function renderTabs(){

    tabs.innerHTML="";

    openTabs.forEach(index=>{

        const t=document.createElement("div");

        t.draggable=true;

        t.className="tab";

t.addEventListener("dragstart",()=>{

    window.draggedTab=index;

});

t.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

t.addEventListener("drop",()=>{

    if(window.draggedTab===undefined) return;

    const from=openTabs.indexOf(window.draggedTab);
    const to=openTabs.indexOf(index);

    if(from===-1 || to===-1) return;

    const moving=openTabs.splice(from,1)[0];

    openTabs.splice(to,0,moving);

    renderTabs();

});

t.addEventListener("dragend",()=>{

    window.draggedTab=undefined;

});

        if(index===selectedFile){

            t.classList.add("active");

        }

        t.innerHTML=`
            ${files[index].icon}
            ${files[index].name}
            <span class="tabClose">✕</span>
        `;

        t.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            if(files[index].icon === "🖼"){

    editor.style.display = "none";

    showImage(files[index].content);

}
else{

    imagePreview.style.display = "none";

    editor.style.display = "block";

    editor.value = files[index].content;

}

            renderFiles();  

            saveWorkspaceState();

        };

        t.querySelector(".tabClose").onclick=(e)=>{

            e.stopPropagation();

            if(openTabs.length===1) return;

            openTabs=openTabs.filter(i=>i!==index);

            if(selectedFile===index){

                selectedFile=openTabs[0];

                editor.value=files[selectedFile].content;

            }

            renderTabs();

        };

        tabs.appendChild(t);

    });

}

fileType.addEventListener("change",()=>{

    if(fileType.value==="image"){

        imagePicker.click();

    }

});

function showImage(src){

    editor.style.display = "none";

    imagePreview.src = src;

    imagePreview.style.display = "block";

}

saveProjectBtn.onclick=()=>{

    const project={

        files,
        folders,
        openTabs,
        selectedFile

    };

    const json=JSON.stringify(project,null,2);

    const blob=new Blob([json],{

        type:"application/json"

    });

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="MyProject.codeos";

    a.click();

    URL.revokeObjectURL(a.href);

};

loadProjectBtn.onclick=()=>{

    projectPicker.click();

};

projectPicker.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=()=>{

        const project=JSON.parse(reader.result);

        files=project.files||[];

        folders=project.folders||[];

        openTabs=project.openTabs||[0];

        selectedFile=project.selectedFile||0;

        editor.value=files[selectedFile].content;

        renderFiles();

        renderTabs();

        saveWorkspaceState();

    };

    reader.readAsText(file);

});

function compileCode(code){

    let lines = code.split("\n");

    let compiled="";


    lines.forEach(line=>{


        line=line.trim();


        if(line==="") return;


        // comments

        if(line.startsWith("//")){

            return;

        }


        // say()

        if(line.startsWith("say(")){


            compiled += line + ";\n";


        }


    });


    return compiled;

}

document.getElementById("runBtn").onclick = () => {

    saveWorkspaceState();

    createTimelineSnapshot();

    localStorage.setItem(
        "codeosProgram",
        editor.value
    );

    localStorage.setItem(
        "codeosFiles",
        JSON.stringify(files)
    );

    window.location.href = "run.html";
};

function saveWorkspaceState(){

    localStorage.setItem(
        "codeosWorkspace",
        JSON.stringify({

            files,
            folders,
            openTabs,
            selectedFile

        })
    );

}

// ========================================
// 🌐 OPEN COMMUNITY PROJECT
// ========================================

const communityProjectId =
    new URLSearchParams(window.location.search)
        .get("communityProject");

async function loadCommunityProject() {

    if (!communityProjectId) return;

    console.log(
        "🌐 Community project requested:",
        communityProjectId
    );

    // Wait for Firebase to become available
    let attempts = 0;

    while (
        !window.codeosFirebase &&
        attempts < 100
    ) {

        await new Promise(resolve =>
            setTimeout(resolve, 100)
        );

        attempts++;
    }

    const firebase = window.codeosFirebase;

    if (!firebase) {

        console.error(
            "❌ Firebase never loaded."
        );

        alert(
            "❌ Could not connect to Firebase."
        );

        return;
    }

    console.log(
        "🔥 Firebase ready. Loading project..."
    );

    try {

        const snapshot = await firebase.get(
            firebase.ref(
                firebase.db,
                "codeosWorkspaces/" +
                communityProjectId
            )
        );

        if (!snapshot.exists()) {

            console.error(
                "❌ Project does not exist in Firebase:",
                communityProjectId
            );

            alert(
                "❌ This CodeOS project could not be found."
            );

            return;
        }

        const project = snapshot.val();

        console.log(
            "✅ EXACT COMMUNITY PROJECT DATA:",
            project
        );

        // ========================================
        // LOAD THE ACTUAL PROJECT
        // ========================================

        files = structuredClone(
            project.files || []
        );

        folders = structuredClone(
            project.folders || []
        );

        openTabs = structuredClone(
            project.openTabs ||
            (files.length ? [0] : [])
        );

        selectedFile =
            project.selectedFile ?? 0;

        // Safety check
        if (
            files.length === 0 ||
            selectedFile < 0 ||
            selectedFile >= files.length
        ) {

            selectedFile = 0;
        }

        // ========================================
        // SHOW THE ACTUAL FILE
        // ========================================

        if (files.length > 0) {

            const currentFile =
                files[selectedFile];

            if (currentFile.icon === "🖼") {

                editor.style.display = "none";

                showImage(
                    currentFile.content
                );

            } else {

                imagePreview.style.display =
                    "none";

                editor.style.display =
                    "block";

                editor.value =
                    currentFile.content;
            }
        }

        // ========================================
        // REFRESH CODEOS UI
        // ========================================

        renderFiles();

        renderTabs();

        saveWorkspaceState();

        console.log(
            "🚀 EXACT COMMUNITY PROJECT LOADED!"
        );

        console.log(
            "📁 Files:",
            files
        );

        console.log(
            "📄 Selected file:",
            files[selectedFile]
        );

        // Remove ?communityProject=... from URL
        window.history.replaceState(
            {},
            document.title,
            "workspace.html"
        );

    } catch (error) {

        console.error(
            "❌ Failed to load community project:",
            error
        );

        alert(
            "❌ Failed to load the community project."
        );
    }
}

loadCommunityProject();

function renderCommands(search=""){

    commandList.innerHTML="";

    const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if(filtered.length===0){

        commandList.innerHTML="<div class='command'>😔 No commands found.</div>";

        return;

    }

    filtered.forEach((command,index)=>{

        const div=document.createElement("div");

        div.className="command";

        if(index===selectedIndex){

            div.classList.add("selected");

        }

        div.innerHTML=`${command.icon} ${command.name}`;

        div.onclick=()=>command.action();

        div.onmouseenter=()=>{

            selectedIndex=index;

            renderCommands(input.value);

        };

        commandList.appendChild(div);

    });

}

renderCommands();

function showWorkspaceManager() {
    console.log("Open Workspace clicked!");

    renderWorkspaceList();

    workspaceOverlay.classList.remove("hidden");
}

function newWorkspace(){

    workspaceNameInput.value = "";

    newWorkspaceOverlay.classList.remove("hidden");

    workspaceNameInput.focus();

}

input.addEventListener("input",()=>{

    selectedIndex = 0;

    renderCommands(input.value);

});

overlay.addEventListener("click",(e)=>{

    if(e.target===overlay){

        overlay.classList.remove("show");

        input.value="";

    }

});

function renderWorkspaceList(){

    workspaceList.innerHTML = "";

    const workspaces = getWorkspaces();

    if(workspaces.length === 0){

        workspaceList.innerHTML = `
            <div class="workspaceEmpty">
                No workspaces yet.
            </div>
        `;

        return;
    }

    workspaces.forEach(workspace=>{

        const card=document.createElement("div");

        card.className="workspaceCard";

        card.innerHTML=`
            <div class="workspaceName">
                🚀 ${workspace.name}
            </div>

            <div class="workspaceInfo">
                📅 ${new Date(workspace.date).toLocaleString()}<br>
                📄 ${workspace.files.length} files
            </div>

            <div class="workspaceButtons">

    <button class="openBtn">
        Open
    </button>

    <button class="webforgeBtn" style="display:none;">
        ⚡ Open in WebForge
    </button>

    <button class="renameBtn">
        Rename
    </button>

    <button class="duplicateBtn">
        Duplicate
    </button>

    <button class="deleteBtn">
        Delete
    </button>

</div>
        `;

        const openBtn = card.querySelector(".openBtn");

        const webforgeBtn = card.querySelector(".webforgeBtn");

const hasHTML = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".html")
);

const hasCSS = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".css")
);

const hasJS = workspace.files.some(file =>
    file.name.toLowerCase().endsWith(".js")
);

const canOpenInWebForge =
    hasHTML && hasCSS && hasJS;

if (canOpenInWebForge) {

    webforgeBtn.style.display = "block";

}

webforgeBtn.onclick = (e) => {

    e.stopPropagation();

    if (!canOpenInWebForge) return;

    const htmlFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".html")
    );

    const cssFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".css")
    );

    const jsFile = workspace.files.find(file =>
        file.name.toLowerCase().endsWith(".js")
    );

    const webforgeProject = {

        workspaceName: workspace.name,

        html: htmlFile.content,

        css: cssFile.content,

        js: jsFile.content

    };

    localStorage.setItem(
        "webforgeProject",
        JSON.stringify(webforgeProject)
    );

    window.location.href = "webforge.html";

};

openBtn.onclick = (e) => {

    e.stopPropagation();

    files = workspace.files;
    folders = workspace.folders;
    openTabs = workspace.openTabs;
    selectedFile = workspace.selectedFile;

    editor.value = files[selectedFile].content;

    renderFiles();
    renderTabs();

    saveWorkspaceState();

    workspaceOverlay.classList.add("hidden");

};

const renameBtn = card.querySelector(".renameBtn");

renameBtn.onclick = (e) => {

    e.stopPropagation();

    const newName = prompt(
        "Rename workspace:",
        workspace.name
    );

    if(!newName) return;

    const list = getWorkspaces();

    const item = list.find(w => w.name === workspace.name);

    if(item){

        item.name = newName.trim();

    }

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

const duplicateBtn = card.querySelector(".duplicateBtn");

duplicateBtn.onclick = (e) => {

    e.stopPropagation();

    const list = getWorkspaces();

    const copy = structuredClone(workspace);

    copy.name += " Copy";

    copy.date = Date.now();

    list.push(copy);

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

const deleteBtn = card.querySelector(".deleteBtn");

deleteBtn.onclick = (e) => {

    e.stopPropagation();

    if(!confirm(`Delete "${workspace.name}"?`))
        return;

    let list = getWorkspaces();

    list = list.filter(
        w => w.name !== workspace.name
    );

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

    renderWorkspaceList();

};

        workspaceList.appendChild(card);

    });

}

newWorkspaceCard.onclick = () => {

    newWorkspace();

};

cancelWorkspace.onclick = () => {

    newWorkspaceOverlay.classList.add("hidden");

};

createWorkspaceBtn.onclick = () => {

    const name = workspaceNameInput.value.trim();

    if(!name){

        alert("Enter a workspace name.");

        return;

    }

    saveWorkspace(name);

    newWorkspaceOverlay.classList.add("hidden");

    renderWorkspaceList();

};

/* =========================================
   🕒 CODEOS TIMELINE
========================================= */

const timelineBtn = document.getElementById("timelineBtn");
const timelineOverlay = document.getElementById("timelineOverlay");
const timelineList = document.getElementById("timelineList");
const closeTimeline = document.getElementById("closeTimeline");


/*
    Get timeline snapshots
*/

function getTimeline() {

    return JSON.parse(
        localStorage.getItem("codeosTimeline") || "[]"
    );

}


/*
    Save timeline
*/

function saveTimeline(timeline) {

    localStorage.setItem(
        "codeosTimeline",
        JSON.stringify(timeline)
    );

}


/*
    Create a snapshot
*/

function createTimelineSnapshot() {

    if (!files || files.length === 0) {
        return;
    }

    const timeline = getTimeline();

    const snapshot = {

        id: Date.now(),

        date: Date.now(),

        files: structuredClone(files),

        folders: structuredClone(folders),

        openTabs: structuredClone(openTabs),

        selectedFile: selectedFile

    };

    // NEWEST VERSION GOES FIRST
    timeline.unshift(snapshot);

    // Keep only the newest 50
    if (timeline.length > 50) {
        timeline.splice(50);
    }

    saveTimeline(timeline);
}


/*
    Open Timeline
*/

function openTimeline() {

    renderTimeline();

    timelineOverlay.classList.remove("hidden");

}


/*
    Close Timeline
*/

function closeTimelineWindow() {

    timelineOverlay.classList.add("hidden");

}


/*
    Timeline button
*/

if (timelineBtn) {

    timelineBtn.onclick = () => {

        openTimeline();

    };

}


/*
    Close button
*/

if (closeTimeline) {

    closeTimeline.onclick = () => {

        closeTimelineWindow();

    };

}


/*
    Click outside popup
*/

if (timelineOverlay) {

    timelineOverlay.addEventListener("click", (e) => {

        if (e.target === timelineOverlay) {

            closeTimelineWindow();

        }

    });

}


/*
    ESC closes Timeline
*/

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        if (
            timelineOverlay &&
            !timelineOverlay.classList.contains("hidden")
        ) {

            closeTimelineWindow();

        }

    }

});


/*
    Render Timeline
*/

function renderTimeline() {

    timelineList.innerHTML = "";

    const timeline = getTimeline();


    /*
        No snapshots
    */

    if (timeline.length === 0) {

        timelineList.innerHTML = `

            <div class="timelineEmpty">

                <div class="timelineEmptyIcon">
                    🕒
                </div>

                <h3>No versions yet</h3>

                <p>
                    Start editing your project and
                    CodeOS will create timeline versions.
                </p>

            </div>

        `;

        return;

    }


    timeline.forEach((snapshot, index) => {

        const item = document.createElement("div");

        item.className = "timelineItem";


        /*
            The newest snapshot is the
            current version.
        */

        if (index === 0) {

            item.classList.add("current");

        }


        const date = new Date(snapshot.date);


        const formattedDate =
            date.toLocaleDateString([], {

                day: "numeric",

                month: "short",

                year: "numeric"

            });


        const formattedTime =
            date.toLocaleTimeString([], {

                hour: "2-digit",

                minute: "2-digit"

            });


        const totalFiles =
            snapshot.files?.length || 0;


        const totalFolders =
            snapshot.folders?.length || 0;


        item.innerHTML = `

            <div class="timelineItemHeader">

                <div>

                    <div class="timelineVersionName">

                        ${
                            index === 0
                                ? "🟢 Current Version"
                                : "🕒 Version " +
                                  (timeline.length - index)
                        }

                    </div>

                    <div class="timelineDate">

                        ${formattedDate}
                        at
                        ${formattedTime}

                    </div>

                </div>

                ${
                    index === 0
                        ? `
                            <div class="timelineCurrentBadge">
                                CURRENT
                            </div>
                          `
                        : ""
                }

            </div>


            <div class="timelineInfo">

                <span>
                    📄 ${totalFiles} files
                </span>

                <span>
                    📁 ${totalFolders} folders
                </span>

            </div>


            <div class="timelineActions">

                ${
                    index !== 0
                        ? `
                            <button
                                class="timelineRestore"
                                data-id="${snapshot.id}"
                            >
                                ↩ Restore
                            </button>
                          `
                        : ""
                }

                ${
                    index !== 0
                        ? `
                            <button
                                class="timelineDelete"
                                data-delete="${snapshot.id}"
                            >
                                🗑 Delete
                            </button>
                          `
                        : ""
                }

            </div>

        `;


        /*
            Restore button
        */

        const restoreBtn =
            item.querySelector(".timelineRestore");


        if (restoreBtn) {

            restoreBtn.onclick = () => {

                restoreTimelineSnapshot(
                    snapshot.id
                );

            };

        }


        /*
            Delete button
        */

        const deleteBtn =
            item.querySelector(".timelineDelete");


        if (deleteBtn) {

            deleteBtn.onclick = () => {

                deleteTimelineSnapshot(
                    snapshot.id
                );

            };

        }


        timelineList.appendChild(item);

    });

}


/*
    Restore version
*/

function restoreTimelineSnapshot(id) {

    const timeline = getTimeline();

    const snapshot = timeline.find(
        version => version.id === id
    );

    if (!snapshot) {
        alert("Timeline version not found.");
        return;
    }

    const confirmed = confirm(
        "Restore this version?\n\n" +
        "Your current workspace will be backed up first."
    );

    if (!confirmed) {
        return;
    }

    // --------------------------------
    // BACK UP CURRENT VERSION
    // --------------------------------

    createTimelineSnapshot();

    // --------------------------------
    // RESTORE SNAPSHOT
    // --------------------------------

    files = structuredClone(snapshot.files || []);

    folders = structuredClone(snapshot.folders || []);

    openTabs = structuredClone(snapshot.openTabs || []);

    selectedFile = snapshot.selectedFile ?? 0;

    // Safety
    if (
        files.length === 0 ||
        selectedFile < 0 ||
        selectedFile >= files.length
    ) {
        selectedFile = 0;
    }

    // --------------------------------
    // UPDATE EDITOR
    // --------------------------------

    if (files.length > 0) {

        const currentFile = files[selectedFile];

        if (currentFile.icon === "🖼") {

            editor.style.display = "none";

            showImage(currentFile.content);

        } else {

            imagePreview.style.display = "none";

            editor.style.display = "block";

            editor.value = currentFile.content;

        }

    }

    // --------------------------------
    // UPDATE UI
    // --------------------------------

    renderFiles();

    renderTabs();

    saveWorkspaceState();

    // --------------------------------
    // UPDATE TIMELINE
    // --------------------------------

    renderTimeline();

    alert("↩️ Timeline version restored!");
}


/*
    Delete version
*/

function deleteTimelineSnapshot(id) {

    const confirmed = confirm(
        "Delete this timeline version?"
    );


    if (!confirmed) {

        return;

    }


    let timeline = getTimeline();


    timeline = timeline.filter(
        snapshot => snapshot.id !== id
    );


    saveTimeline(timeline);


    renderTimeline();

}