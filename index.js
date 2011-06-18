	var audio = null;
	
	var WIDTH = 800;
	var PART_WIDTH = 200;

	var currentPart = -1;
	var parts;
	
	var shouldSeek = false;
	var startTime = 0;
	var preventProgress = false;
	var playing = false;



	function loaded()
	{
		// prevent selection
		document.onselectstart = function() {return false;} // ie
		document.onmousedown = function() {return false;} // mozilla

		initAudio();		
		
		initWithProgram(
			[	"media/tilosradio-20110614-2200.mp3",
				"media/tilosradio-20110614-2230.mp3",
				"media/tilosradio-20110614-2300.mp3",
				"media/tilosradio-20110614-2330.mp3"	]);
	
//		initWithProgram(["http://stream.tilos.hu:80/tilos_128.mp3"]);
		
		loadWeek();
	
		//setInterval(draw, 40);
	}
	
	function loadWeek()
	{
	
		var d = new Date();
		console.log(d.getDay());
		d.setTime( d.getTime() - (d.getDay()-1)*86400*1000 - d.getSeconds()*1000 - d.getMinutes()*1000*60 - d.getHours()*1000*3600);
		
	
		for(var i=0; i<7; i++)
		{
			var str = [d.getFullYear(), formatInt(d.getMonth()+1, 2), formatInt(d.getDate(), 2)].join('-');
			var url = 'http://tilosarchive.appspot.com/api/day/' + str;

			loadData(url, i);

			// step to the next day
			d.setTime(d.getTime() + 86400*1000);
		}
		
	}
	
	function formatInt(value, digits)
	{
		var s = value.toString();
		while(s.length < digits)
		{
			s = "0" + s;
		}
		return s;
	}
	
	function loadData(url, index)
	{
		var req = new XMLHttpRequest();
		
		req.onreadystatechange  = function() { 
			if(req.readyState  == 4){
				if(req.status  == 200)
				{
					var programs = eval("(" + req.responseText + ")");
					initTable(programs, index);
				}
			}
		};
		req.open('GET', url, true);
		req.send(null);
	}
	
	function initTable(data, column)
	{
	
		var index = 1000;
		var programsDiv = document.getElementById("programs");
		
//		var days = ['HÉTFŐ', 'KEDD', "SZERDA", "CSÜTÖRTÖK", "PÉNTEK", "SZOMBAT", "VASÁRNAP"];
		var days = ['h_', 'k_', "sze_", "cs_", "p_", "szo_", "v_"];
		
		var i = column;
		//for(var i=column; i<1; i++)
		{
			
			var color = Math.floor(Math.random() * 0xffffff);
			
			var d = document.createElement("div");
			d.className = "programheader";
			d.style.borderColor = "#" + color.toString(16);
			d.style.top = "0px";
			d.style.left = i * 151 + "px";
			d.style.zIndex = index;
			
			d.innerHTML = '<span class="header">' + days[i] + '</span>';
			d.firstChild.style.backgroundColor = "#" + color.toString(16);
			
			index--;
			programsDiv.appendChild(d);
			
			console.log(data);
			
			var programs = data.programs;

			for(var j=0; j<programs.length; j++)
			{
				var program = programs[j];
			
				if(program.to < program.from) program.to = 1440;
				var size = (program.to - program.from)/30;
				var start = program.from/30;
				
				var d = document.createElement("div");
				d.className = "program";
				
				d.style.top = 30 + start * 11 + "px";
				d.style.left = i * 151 + "px";
				d.style.zIndex = index;
				d.style.height = 11 * size + "px";
				d.style.borderColor = "#" + color.toString(16);
				
				var str = "";
				for(var k = 0; k< program.name.length; k++)
				{
					var char = program.name.charAt(k);
					if(char==" ") str+= " ";
					else str+= '<span class="header">' + char + '</span>';
				}
				d.innerHTML = str;
				
				console.log(program.name + "/" + size);
				
				programsDiv.appendChild(d);

				index--;
			}

		}
	}
	
	
	function initAudio()
	{
		audio = document.createElement("audio");
		audio.preload = true;
		audio.width = 800;
		audio.height = 50;
		audio.style.width = "800px";
		audio.style.height = "50px";
		audio.id = "audio";
		audio.controls = true;
		
		audio.addEventListener("timeupdate", function() {
			if(audio.currentTime >= 1798.2)
			{
				loadNext();
			}
			setProgress(audio.currentTime/1800);
		}, false);
		audio.addEventListener("loadeddata", function(){
			log('loadeddata event ' + shouldSeek);
			preventProgress = false;
			if(shouldSeek)
			{
				log(startTime + '/' + audio.duration);
				audio.currentTime = startTime;
			}
			if(playing)
				audio.play();
		}, false);
		audio.addEventListener("loadedmetadata", function(){
			log('loadedmetadata event');
		}, false);
		/*
		audio.addEventListener('ended', function(){
			loadNext();
		});
		*/
		audio.addEventListener('play', function(){
			playing = true;
		}, false);
		audio.addEventListener('pause', function(){
			playing = false;
		}, false);
		
		var logDiv = document.getElementById("log");
		logDiv.appendChild(audio);
	}
	
	
	var canvas = null;
	var counter = 0;
	
	var points = [	{x: -1, y:1, z:1},
					{x: 1, y:1, z:1},
					{x: -1, y:-1, z:1},
					{x: 1, y:-1, z:1},
						];
	
	var colors = null;
	
	function draw()
	{
		
		if(colors == null)
		{
			colors = [];
			for(var i=0; i<700; i++)
			{
				colors.push("#" + (i*2).toString(16));
			}
		}
		
		/*
		if(canvas == null)
		{
			canvas = document.getElementById("canvas");
			var ctx = canvas.getContext("2d");
			ctx.translate(525, 200);
		}
		var ctx = canvas.getContext("2d");
		ctx.save();
		
		ctx.clearRect(-525, -200, 1050, 400);
		
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "1px";
		ctx.beginPath();

		var len = points.length;
		
		for(var i=0; i<len; i++)
		{
			var p = points[i];
			var grad = counter/180*Math.PI;
			var f = i==0;
			if(f)
				ctx.moveTo(p.x * 525 * Math.cos(grad),  p.y * 200 * Math.sin(grad));
			else
				ctx.lineTo(p.x * 525 * Math.cos(grad),  p.y * 200 * Math.sin(grad));
		}
		ctx.stroke();
		
		ctx.restore();
		*/
		var spans = document.getElementsByTagName("span");
		for(var i=0; i<spans.length; i++)
		{
			spans[i].style.backgroundColor = colors[(counter+i)%colors.length];
		}
//		if(counter>50) counter=0;

		counter+=5;
	}
	
	function initWithProgram(urls)
	{
		parts = urls;
		PART_WIDTH = WIDTH / parts.length;
		loadAudio(0, 0);
	}
	
	function loadAudio(partIndex, time)
	{
		startTime = Math.floor(time);
		
		if(currentPart == partIndex)
		{
			shouldSeek = false;
			try{
				audio.currentTime = time;
			} catch(ex){}
		}
		else
		{
			preventProgress = true;
			
			currentPart = partIndex;
			shouldSeek = (time!=0);

			audio.src = parts[partIndex];
			//audio.currentTime = time;
		}
		
		setProgress(time/1800);
	}
	
	function loadNext()
	{
		if(currentPart < 3)
			loadAudio(currentPart+1, 0);
	}
	
	function setProgress(percent)
	{
		if(!preventProgress)
		{
			var progress = document.getElementById("progress");
			progress.style.left = PART_WIDTH * (currentPart + percent)-10 + "px";
		}
	}
	
	function controllerDown(event)
	{
		var div = document.getElementById("controller");
		
		var px = event.clientX - div.offsetLeft;
		var py = event.clientY - div.offsetTop;

		var part = Math.floor(px/PART_WIDTH);
		var time = (px - PART_WIDTH * part) / PART_WIDTH * 1800;
		
//		loadAudio(part, time);
	}
	function controllerUp(event)
	{
		var div = document.getElementById("controller");
		
		var px = event.clientX - div.offsetLeft;
		var py = event.clientY - div.offsetTop;

		var part = Math.floor(px/PART_WIDTH);
		var time = (px - PART_WIDTH * part) / PART_WIDTH * 1800;
		
		loadAudio(part, time);
	}
	
	function togglePlay()
	{
		if(playing)
		{
			audio.pause();
			playing = false;
			document.getElementById("play").style.borderStyle = "dashed";
		}
		else
		{
			audio.play();
			playing = true;
			document.getElementById("play").style.borderStyle = "solid";
		}
	}
	
	function programClick(event)
	{
		var div = event.currentTarget;
//		div.style.webkitTransform = "rotate(-2deg)";
		div.style.webkitTransform = "translate3d(600px, 0px, 0px)";
	}

	function log(str)
	{
//		var logDiv = document.getElementById("log");
		var textDiv = document.getElementById("text");
		textDiv.innerHTML = str + '<br/>' + textDiv.innerHTML;
	}
	
	function toggleLog()
	{
		var logDiv = document.getElementById("log");
		if(logDiv.offsetHeight > 20)
		{
			logDiv.style.height = "10px";
			logDiv.style.width = "0px";
		}
		else
		{
			logDiv.style.height = "200px";
			logDiv.style.width = "800px";
		}
	}
	
	function toggleArchive()
	{
		var programs =	document.getElementById("programs");
		var top = programs.offsetHeight;
		
		if(top == 600)
			programs.style.height = "15px";
		else
			programs.style.height = "600px";
	}
