function ParticleSystem(pshaderProgram,pamount,poutput,plifetime,pcolor){
	var pArray = [];
	var rand;
	var outputtype = poutput;
	var start;
	var dir;
	var amount = pamount;
	var startamount = pamount;
	var lifetime = plifetime;
	var hexrgb = "#000000";
	var color = pcolor;

	//console.log(pcolor+","+poutput+","+plifetime);

	this.createParticle = function(){
		start = [(Math.random()-0.5),1.0,(Math.random()-0.5)];
		//var end = [Math.random()-0.5,-1.0,Math.random()-0.5];
		if(outputtype == 0){
			dir = [0.0,-1.0,0.0];
		}else if(outputtype == 1){
			dir = [Math.random()*2-1,-1.0,Math.random()*2-1];
		}else{
			dir = [(Math.random()*2-1),(Math.random()*2-1),(Math.random()*2-1)];
		}
		//var end = [start[0],1.0,start[2]];
		pArray.push(new Particle(pshaderProgram,start,dir,5.0*Math.random(1.0,1.5),pcolor));

		amount++;
	}

	for(var i = 0; i < startamount; i++){
		this.createParticle();
		pArray[i].change(outputtype);
		pArray[i].setLifetime(plifetime);
		pArray[i].setColor(pcolor);
	}

	this.setEmitter = function(pvalue){
		outputtype = pvalue;
		for(var i = 0; i < pArray.length; i++){
			pArray[i].change(pvalue);
		}
	}

	this.getEmitter = function(){
		return outputtype;
	}

	this.setLifetime = function(pvalue){
		lifetime = pvalue;
		for(var i = 0; i < pArray.length; i++){
			pArray[i].setLifetime(pvalue);
		}
	}

	this.getLifetime = function(){
		return lifetime;
	}

	this.getAmount = function(){
		return amount;
	}

	this.getSize = function(){
		return pArray.length;
	}

	this.setSize = function(pvalue){
		pArray.length = pvalue;
		amount = pvalue;
	}

	this.sethexrgb = function(pvalue){
		hexrgb = pvalue;
	}

	this.gethexrgb = function(){
		return hexrgb;
	}

	this.getColor = function(){
		return color;
	}

	this.setColor = function(pvalue){
		color = pvalue;
		for(var i = 0; i < pArray.length; i++){
			pArray[i].setColor(color);
		}
	}

	this.update = function(){
		for (var i = 0; i < pArray.length; i++){
			pArray[i].update(deltaTime);
		}
	}

	this.draw = function(){
		for(var i = 0; i < pArray.length; i++){
			pArray[i].draw();
		}
	}
}