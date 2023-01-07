import document from "document";
import { me } from "appbit";
import { display } from "display";
import exercise from "exercise";
import { geolocation } from "geolocation";
import clock from "clock";
import { vibration } from "haptics";

// Bootcamptraining van 1 uur
const T1=40; // Hiervoor beeld op zwart, trilling en beeld op aantal km en tijd
const T2=44; // Beeld op zwart
const T3=50; // Trilling en beeld aan

var TijdMinuten=0;

const STOPPED=-1;
const STATUSKM=1;
var Status=STOPPED,KM=0,Klokdisplay="--:--";

const ZWART=0;
const BEELDAAN=1;
var BeeldStatus=ZWART;

var txtKm = document.getElementById("txtKm");
var txtKlok = document.getElementById("txtKlok");
var taptarget= document.getElementById("tap-target");
var bell  = document.getElementById("bell");

Init();
setInterval(UpdateScherm, 6000);
setInterval(UpdateAan, 2000);
Bell(false);

var BELL=true;
function Bell(toon) {
 BELL=toon;
 if(toon) {   
  bell.style.display="inline";
  txtKm.style.display="none";
  txtKlok.style.display="none";   
 }
 else {
  bell.style.display="none";
  txtKm.style.display="inline";
  txtKlok.style.display="inline";   
 }
}

clock.granularity = "minutes";
clock.addEventListener("tick", (evt) => {
 let s = convertUTCDateToLocalDate(evt.date).toTimeString().slice(0, -7); // 88:88
 Klokdisplay = s; 
 TijdMinuten++;
 if(Status==STOPPED) TijdMinuten=0;
 if(TijdMinuten>=T1 && TijdMinuten<T2 && BELL) {  
  vibration.start("alert");
  setTimeout(function(){vibration.stop();},3000);  
  Bell(false);
 }
 else if(TijdMinuten>=T2 && TijdMinuten<T3 && !BELL) {  
  Bell(true); 
 }
 else if(TijdMinuten>=T3 && BELL) {  
  vibration.start("alert");
  setTimeout(function(){vibration.stop();},3000);  
  Bell(false); 
 }  
});

taptarget.addEventListener("click", (evt) => {
 Volgende();
});

var NumPresses=0;
document.onkeypress = function(e) {  
 console.log("Knopje ingedrukt: " + e.key);
 e.preventDefault();
 NumPresses+=1;
 if(NumPresses==2)
  me.exit();
 setTimeout(function(){NumPresses=0;},4000);
}

function Init() {
 let s = document.getElementById("root");   
 s.style.fill="maroon";  
 txtKm.text="GO!";  
 txtKlok.text="";
}

function Volgende() {  
 if(Status==STOPPED) {
  // We zijn nog gestopt: start de training!  
  let s = document.getElementById("root"); 
  s.style.fill="black";   
  KM=0;
  exercise.start("run",{disableTouch:false,autopause:false,gps:true});
  TijdMinuten=0; 
  Bell(true); 
 }
 Status=STATUSKM; 
 UpdateScherm();  
}

function UpdateAan() {
 display.poke(); 
}

display.addEventListener("change", () => { 
 display.on = true; 
});

var watchId = geolocation.watchPosition((position) => { 
 if(Status==STOPPED) {
  txtKlok.text="Fix!";
  let s = document.getElementById("root"); 
  s.style.fill="fb-green-press";
 }  
 vibration.start("alert");
 setTimeout(function(){vibration.stop();},3000);
 geolocation.clearWatch(watchId);   
});

function UpdateScherm() {  
 if(Status==STOPPED) { return;}
  
 bell.x=Math.random()*201;
 bell.y=Math.random()*201; 
   
 if(!exercise || !exercise.stats || !exercise.stats.distance) txtKm.text="0";
 else {
  let km=exercise.stats.distance/1000.0;
  km=Math.round(km*10)/10;
  txtKm.text=km;         
 }   
      
 txtKlok.text=Klokdisplay;          
} 

function convertUTCDateToLocalDate(date) {
 var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
 var offset = date.getTimezoneOffset() / 60;
 var hours = date.getHours();
 newDate.setHours(hours - offset);
 return newDate;   
}
