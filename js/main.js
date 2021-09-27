"use strict";

document.getElementById("player").style.display = "none"; // Radera denna rad för att visa musikspelare

// Variabler
var mainnavlistEl = document.getElementById("mainnavlist");
var outputEl = document.getElementById("info");
var numrowsEl = document.getElementById("numrows");
var logoEl = document.getElementById("logo");
// Händelsehanterare
logoEl.addEventListener('click', loadFront, false); 
window.onload = loadData;
// Laddar om sidan vid klick på huvudrubriken i headern.
function loadFront(){
    location.reload(true);
}
// Funktion för AJAX anrop
function loadData() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            var jsonChannels = JSON.parse(xhr.responseText);
            DisplayChannelList(jsonChannels);
        } else {
            outputEl.innerHTML = "Fel vidanrop till webbtjänst. Felkod: " + xhr.status;
        }
    }
    var channelurl = "http://api.sr.se/api/v2/channels/?format=json";
    xhr.open('GET', channelurl, true);
    xhr.send(null);
    DisplayWelcomeInformation();
}
// Vid klick på kanal visas aktuell tablå
function DisplayChannelList(jsonNameArr) {
    var channelNames = jsonNameArr.channels;
    for (var i = 0; i < channelNames.length; i++) {
        mainnavlistEl.innerHTML += "<li onclick='DisplayProgram(\"" + channelNames[i].id+ "\"" + "," +"\""+channelNames[i].name +"\")' title='"+ channelNames[i].tagline +"'>" + channelNames[i].name + "</li>";
    }
}
// Funktion för utskrift av tablåer till skärm
function DisplayProgram(idnr, name) {
    outputEl.innerHTML = "";
    var today = new Date();
    DisplayHeaderDate(today, name);
    // AJAX anrop
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            var jsonPrograms = JSON.parse(xhr.responseText);
            // Loopar igenom progarmtablå
            for (var i = 0; i < jsonPrograms.schedule.length; i++) {
                var startTime = jsonPrograms.schedule[i].starttimeutc;
                var endTime = jsonPrograms.schedule[i].endtimeutc;
                var endTimeCheck = parseInt(endTime.substr(6));
                // Kontroll av aktuell tid, visar aktuella program fram till midnatt
                if (endTimeCheck >= today.getTime()) {
                    //Skapar ny article
                    var newarticleEl = document.createElement("article");
                    // Huvudtitel
                    var mainTitle = document.createElement("h3");
                    var mainTitleNode = document.createTextNode(jsonPrograms.schedule[i].title);
                    mainTitle.appendChild(mainTitleNode);
                    newarticleEl.appendChild(mainTitle);
                    // Tid för program
                    var programTime = document.createElement("h5");
                    // Anropar funktion för programtider som textnod
                    var start_end = document.createTextNode(GetProgramTime(startTime, endTime));
                    programTime.appendChild(start_end);
                    newarticleEl.appendChild(programTime);

                    // Kontroll om undertitel saknas eller är samma som huvudtitel  
                    if (jsonPrograms.schedule[i].program.name === jsonPrograms.schedule[i].title) {
                        // Programbeskrivning
                        var description = document.createElement("p");
                        var descNode = document.createTextNode(jsonPrograms.schedule[i].description);
                        description.appendChild(descNode);
                        newarticleEl.appendChild(description);
                        // Radbrytning
                        var bracket = document.createElement("br");
                        newarticleEl.appendChild(bracket);
                        outputEl.appendChild(newarticleEl);
                    } else {
                        // Undertitel
                        var secondTitle = document.createElement("h4");
                        var secondTitleNode = document.createTextNode(jsonPrograms.schedule[i].program.name);
                        secondTitle.appendChild(secondTitleNode);
                        newarticleEl.appendChild(secondTitle);
                        // Programbeskrivning
                        var description = document.createElement("p");
                        var descNode = document.createTextNode(jsonPrograms.schedule[i].description);
                        description.appendChild(descNode);
                        newarticleEl.appendChild(description);
                        // Radbrytning
                        var bracket = document.createElement("br");
                        newarticleEl.appendChild(bracket);
                        outputEl.appendChild(newarticleEl);
                    }
                } else {
                    jsonPrograms.schedule[i].innerHTML = "";
                }
            }
        } else {
            outputEl.innerHTML = "Fel vidanrop till webbtjänst. Felkod: " + xhr.status;
        }
    }
    var programurl = "http://api.sr.se/api/v2/scheduledepisodes?channelid=" + idnr + "&date=" + DisplayCurrentDate() + "&format=json&size=100";
    xhr.open('GET', programurl, true);
    xhr.send(null);
}
// Skapar programtider från json, visar start och sluttid i formatet "hh:mm - hh:mm"
function GetProgramTime(start, end) {
    var jsonArr = [start, end];
    var prgTimes = [];
    for (var i = 0; i < jsonArr.length; i++) {
        jsonArr[i] = new Date(parseInt(jsonArr[i].replace(/\D/g, '')));
        var hour = (jsonArr[i].getHours() < 10 ? '0' : '') + jsonArr[i].getHours();
        var min = (jsonArr[i].getMinutes() < 10 ? '0' : '') + jsonArr[i].getMinutes();
        var time = hour + ":" + min;
        prgTimes.push(time);
    }
    return (prgTimes[0] + "-" + prgTimes[1]);
}
// Hämtar aktuellt datum och skriver ut i formatet "yyyy-mm-dd"
function DisplayCurrentDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1);
    var thisday = (today.getDate() < 10 ? '0' : '') + today.getDate();
    var todayDate = year + "-" + month + "-" + thisday;
    return todayDate;
}
// Skriver ut dagens datum och tid i headern
function DisplayHeaderDate(today, jsonSchedule) {
    var daysArr = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
    var monthsArr = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
    var month = monthsArr[today.getMonth()];
    var nrDate = today.getDate();
    var nrDay = today.getDay();
    var day = daysArr[nrDay];
    var hour = ((today.getHours() < 10 ? '0' : '') + today.getHours());
    var min = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
    outputEl.innerHTML = "<h3>Idag är det " + day + " den " + nrDate + " " + month + " klockan " + hour + ":" + min + "</h3>";
    outputEl.innerHTML += "<h4><i>Just nu i " + jsonSchedule.fontcolor("#d04900") + ":</i></h4>";
}
function DisplayWelcomeInformation() {
    var welcomeHeader = document.createElement("h3");
    var headerTextnode = document.createTextNode("Välkommen till tablåer för Sveriges Radio");
    welcomeHeader.appendChild(headerTextnode);
    outputEl.appendChild(welcomeHeader);
    var linebreak = document.createElement("br");
    outputEl.appendChild(linebreak);
    var paragraphEl = document.createElement("p");
    var infoP = document.createTextNode("Denna webb-applikation använder Sveriges Radios öppna API för " +
        "tablåer och program. Välj kanal till vänster för att visa tablå för denna kanal.");
    paragraphEl.appendChild(infoP);
    outputEl.appendChild(paragraphEl);
}