var cvs = document.getElementById("cvs");
var gl = cvs.getContext("webgl");

var translate = [0.0,0.0,5.0];
var translatez = 0.0;

var rotationx = 0.0;
var rotationy = 0.0;

var rotatex = [1.0,0.0,0.0,0.0,
				0.0,1.0,0.0,0.0,
				0.0,0.0,1.0,0.0,
				0.0,0.0,0.0,1.0];

var rotatey = [1.0,0.0,0.0,0.0,
				0.0,1.0,0.0,0.0,
				0.0,0.0,1.0,0.0,
				0.0,0.0,0.0,1.0];

var rotate = [1.0,0.0,0.0,
				0.0,1.0,0.0,
				0.0,0.0,1.0];

var vertshader = 		"attribute vec3 position;"+
						"attribute vec2 atexture;"+
						"varying vec2 texture;"+
						"varying vec3 color;"+
						"uniform vec3 translation;"+
						"uniform mat4 rotationx;"+
						"uniform mat4 rotationy;"+
						"uniform vec3 start;"+
						"uniform vec3 dir;"+
						"uniform float time;"+
						"uniform vec3 acolor;"+
						"void main(){"+
						"texture = atexture;"+
						"color = acolor;"+
						"mat4 rotation = rotationy * rotationx;"+
						"vec4 astart = vec4(start,1.0) * rotation;"+
						"vec4 aend = vec4(dir,1.0) * rotation;"+
						"vec4 aposition = astart + time * aend;"+ //v0 + t * (v1 - v0);
						"vec4 bposition = vec4(position,1.0) + aposition;"+
						"vec4 cposition = bposition - vec4(translation,1.0);"+
						"gl_Position = vec4(cposition.x/cposition.z,cposition.y/cposition.z,cposition.z/100.0,1.0);"+
						"}";

var fragshader = 	"varying highp vec2 texture;"+
					"varying highp vec3 color;"+
					"uniform sampler2D sampler;"+
					"void main(){"+
					//"gl_FragColor = vec4(color.x,color.y,color.z,1.0);"+
					//"gl_FragColor = vec4(color,1.0);"+
					"gl_FragColor = texture2D(sampler,texture)*vec4(color,1.0);"+
					//"gl_FragColor = texture2D(sampler,texture);"+
					"}";


var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertshader);
gl.compileShader(vertexShader);

if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
}

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragshader);
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
}

var shaderProgram = gl.createProgram();

gl.attachShader(shaderProgram,vertexShader);
gl.attachShader(shaderProgram,fragmentShader);

gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

var translateu = gl.getUniformLocation(shaderProgram, "translation");
var rotationxu = gl.getUniformLocation(shaderProgram, "rotationx");
var rotationyu = gl.getUniformLocation(shaderProgram, "rotationy");

var particleSystemList = [];
particleSystemList.push(new ParticleSystem(shaderProgram,50,0,5,[1.0,0.0,0.0]));
particleSystemList.push(new ParticleSystem(shaderProgram,100,0,2,[1.0,1.0,0.0]));
particleSystemList.push(new ParticleSystem(shaderProgram,50,1,5,[0.39,0.39,0.39]));

var tempElement;
var selected = 0;
var inputAmount;
var tempsize;
var hexrgb;
var r;
var g;
var b;

var countdown = 10.0;
var rendertimes = [10];
var counter;

for(var j = 0; j < particleSystemList.length; j++){
	tempElement = document.createElement("option");
	tempElement.text = "ParticleSystem"+j;
	document.getElementById("ps").add(tempElement);
}

document.getElementById("ps").size = document.getElementById("ps").length;

var now = Date.now();
var deltaTime;

function newPS(){
	particleSystemList.push(new ParticleSystem(shaderProgram,5,0,5,[1.0,1.0,1.0]));

	tempElement = document.createElement("option");
	tempElement.text = "ParticleSystem"+(particleSystemList.length-1);
	document.getElementById("ps").add(tempElement);

	document.getElementById("ps").size = document.getElementById("ps").length;
}

function deletePS(){
	document.getElementById("ps").remove(document.getElementById("ps").selectedIndex);

	particleSystemList.splice(document.getElementById("ps").selectedIndex,1);

	document.getElementById("ps").size = particleSystemList.length;

	if(particleSystemList.length == 1){
		selected = 0;
	}
}

function switchPS(){
	selected = document.getElementById("ps").selectedIndex;
	document.getElementById("emitter").value = particleSystemList[selected].getEmitter();
	document.getElementById("amount").value = particleSystemList[selected].getSize();
	document.getElementById("lifetime").value = particleSystemList[selected].getLifetime();
	document.getElementById("color").value = particleSystemList[selected].gethexrgb();
}

function switchEmitter(){
	particleSystemList[selected].setEmitter(document.getElementById("emitter").selectedIndex);
}

document.getElementById("amount").addEventListener("change",function(){
	inputAmount = document.getElementById("amount").value;
	if(inputAmount > particleSystemList[selected].getSize()){
		tempsize = (inputAmount - particleSystemList[selected].getSize());
		for(var i = 0; i < tempsize; i++){
			particleSystemList[selected].createParticle();
		}

		particleSystemList[selected].amount = tempsize;
	}else{
		particleSystemList[selected].setSize(inputAmount);
	}

	for(var i = 0; i < particleSystemList[selected].getSize(); i++){
		particleSystemList[selected].setEmitter(particleSystemList[selected].getEmitter());
		particleSystemList[selected].setColor(particleSystemList[selected].getColor());
	}
});

function changeLifetime(){
	particleSystemList[selected].setLifetime(document.getElementById("lifetime").value);
}

function changeColor(){
	hexrgb = document.getElementById("color").value;
	particleSystemList[selected].sethexrgb(hexrgb);
	r = 0;
	g = 0;
	b = 0;
	for(var i = 1; i < hexrgb.length; i++){
		if(hexrgb[i] == "a"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else if(hexrgb[i] == "b"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else if(hexrgb[i] == "c"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else if(hexrgb[i] == "d"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else if(hexrgb[i] == "e"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else if(hexrgb[i] == "f"){
			if(i == 1){
				r += 16 * 15;
			}else if(i == 2){
				r += 15;
			}else if(i == 3){
				g += 16 * 15;
			}else if(i == 4){
				g += 15;
			}else if(i == 5){
				b += 16 * 15;
			}else if(i == 6){
				b += 15;
			}
		}else{
			if(i == 1){
				r += 16 * parseInt(color[i]);
			}else if(i == 2){
				r += parseInt(color[i]);
			}else if(i == 3){
				g += 16 * parseInt(color[i]);
			}else if(i == 4){
				g += parseInt(color[i]);
			}else if(i == 5){
				b += 16 * parseInt(color[i]);
			}else if(i == 6){
				b += parseInt(color[i]);
			}
		}
	}

	particleSystemList[selected].setColor([r/255,g/255,b/255]);
}

document.getElementById("cvs").addEventListener("mousedown", function(event){
	if(event.button == 0){
		document.getElementById("cvs").onmousemove = function(event){
			rotationx += event.movementY;

			rotatex = [
				1.0,0.0,0.0,0.0,
				0.0,Math.cos(rotationx*(Math.PI/180.0)),-Math.sin(rotationx*(Math.PI/180.0)),0.0,
				0.0,Math.sin(rotationx*(Math.PI/180.0)),Math.cos(rotationx*(Math.PI/180.0)),0.0,
				0.0,0.0,0.0,1.0
			];

			rotationy += event.movementX;

			rotatey = [
				Math.cos(rotationy*(Math.PI/180.0)),0.0,Math.sin(rotationy*(Math.PI/180.0)),0.0,
				0.0,1.0,0.0,0.0,
				-Math.sin(rotationy*(Math.PI/180.0)),0,Math.cos(rotationy*(Math.PI/180.0)),0.0,
				0.0,0.0,0.0,1.0
			];
		}
	}
});

document.getElementById("cvs").addEventListener("mouseup", function(event){
	document.getElementById("cvs").onmousemove = null;
});

document.getElementById("cvs").addEventListener("wheel", function(event){
	event.preventDefault();

	if(translatez < 2.0){
		translatez = 2.0;
	}else{
		translatez += event.deltaY*0.001;
	}

	translate = 
	[
		0.0,0.0,translatez
	];
});

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

this.loop = function(){
	deltaTime = (Date.now() - now)*0.001;
	now = Date.now();
	/*if(countdown > 0){
		rendertimes[Math.ceil(countdown)] = deltaTime;
		countdown -= deltaTime;
		console.log(countdown);
	}else{
		//console.log(rendertimes);
	}*/

	document.getElementById("renderTime").innerHTML = deltaTime;

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.uniform3fv(translateu, translate);
	gl.uniformMatrix4fv(rotationxu, false, rotatex);
	gl.uniformMatrix4fv(rotationyu, false, rotatey);

	for(var i = 0; i < particleSystemList.length; i++){
		particleSystemList[i].update();
		particleSystemList[i].draw();
	}

	/*particleSystem.update();
	particleSystem.draw();

	particleSystem2.update();
	particleSystem2.draw();*/

	window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);