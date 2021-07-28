function Particle(pshaderProgram,pstart,pdir,plifetime,pcolor){
	var indexArray;
	var vertexArray;
	var ibuffer;
	var vbuffer;
	var time = 0.0;
	var dir = pdir;
	var start = pstart;
	var lifetime = plifetime;
	var emitter = 0;
	var color = pcolor;

	indexArray = new Uint16Array([0,1,2,1,2,3]);
	vertexArray = new Float32Array([0.1,0.1,1.0,-0.1,0.1,1.0,0.1,-0.1,1.0,-0.1,-0.1,1.0]);
	textureArray = new Float32Array([0.0,0.0,
									0.0,1.0,
									1.0,0.0,
									1.0,1.0]);

	ibuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);

	vbuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vbuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
	var position = gl.getAttribLocation(shaderProgram, "position");
	gl.enableVertexAttribArray(position);

	gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);

	textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,textureArray,gl.STATIC_DRAW);
	var textureAtrib = gl.getAttribLocation(shaderProgram,"atexture");
	gl.vertexAttribPointer(textureAtrib,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(textureAtrib);

	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,new Uint8Array([color[0]*255,color[1]*255,color[2]*255,255]));

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	var image = new Image();
	image.src = "snow.png";

	image.addEventListener('load',function(){
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	});

	gl.activeTexture(gl.TEXTURE0);

	var sampler = gl.getUniformLocation(shaderProgram, "sampler");
	var scolor = gl.getUniformLocation(shaderProgram, "acolor");

	var ustart = gl.getUniformLocation(pshaderProgram, "start");
	var uend = gl.getUniformLocation(pshaderProgram, "dir");
	var timeshader = gl.getUniformLocation(pshaderProgram, "time");

	this.change = function(pemitter){
		emitter = pemitter;

		start = [(Math.random()-0.5),1.0,(Math.random()-0.5)];

		if(emitter == 0){
			dir = [0.0,-1.0,0.0];
		}else if(emitter == 1){
			dir = [Math.random()*2-1,-1.0,Math.random()*2-1];
		}else{
			dir = [(Math.random()*2-1),(Math.random()*2-1),(Math.random()*2-1)];
		}
	}

	this.setLifetime = function(pvalue){
		lifetime = pvalue * Math.random(1.0,1.5);
	}

	this.setColor = function(pvalue){
		color = pvalue;
	}

	this.getTime = function(){
		return time;
	}

	this.update = function(ptime){
		if(time < lifetime){
			time += ptime;
		}else{
			time = 0.0;
			this.change(emitter);
		}
	}

	this.draw = function(){
		gl.bindBuffer(gl.ARRAY_BUFFER,vbuffer);
		gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
		gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
		gl.vertexAttribPointer(textureAtrib,2,gl.FLOAT,false,0,0);

		gl.uniform3fv(ustart, start);
		gl.uniform3fv(uend, dir);
		gl.uniform1f(timeshader, time);
		gl.uniform1i(sampler, 0);
		gl.uniform3fv(scolor, color);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibuffer);
		gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);
	}
}