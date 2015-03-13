(function() {


	var Canvas = require('canvas')
		, fs = require('fs')
		, xml2js = require('xml2js')
		, program = require('commander')
		, d3 = require('d3')
		, xmldom = require('xmldom');


	

	program
	  .version('0.0.1')
	  .option('-f, --file [filename]', 'The EAD filename or directory (many eads) to process', 'tilden.xml')
	  .option('-m, --mode [png|svg]', 'The file output type', 'svg')
	  .option('-w, --width [number]', 'How wide to make your mini finding aid, default 200', 200)
	  .option('-s, --shrink [float]', 'What percentage to shrink by, default: 0.85', 0.85)
	  .parse(process.argv);




	var miniEad =  	{

		self : this,

		debug:  false,

		eadText: "",

		processCounter : 0,
		processActive : false,

		totalWrites: 0,

		config : {


			//base font info
			baseFontSize : 12,
			baseFontStyle : "Helvetica-Light",
			baseFill : "black",	
			baseInline : false,
			baseDisplay: true,
			baseTrailSpace: 0,	


			//how much to reduce everything by
			shrinkRay : program.shrink,

			//the width of the col.
			width: program.width,

			maxHeight: 300001,
			maxWidth: 1584,


			//generate meta data, keep track of unit ids and their pixle start and stop pos and output and date information
			meta : true,




			componentElements : ['c','c01','c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21'],



			//supported EAD elements
			//they return the base font info other overwritten values

			elements : {


				//elements to support in the overview section
				overview : {	

					unittitle : { 
									size : function(){ return 46},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return self.config.baseDisplay}
								},

					unitdate : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return self.config.baseDisplay}
								}, 

					unitid : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return false}
								}, 

					origination : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return false}
								}, 

					repository : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return false}
								}, 

					physdesc : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return self.config.baseDisplay}
								}, 

					abstract : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								}, 

					physloc : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return self.config.baseDisplay}
								},

					extent : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								}, 

					p : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								} , 
					_ : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								} , 
					control : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 2},
									display : function(){ return self.config.baseDisplay}
								} 

				},

				//elements to support in the conatiner list
				//we sort by key name to determin order so why there are some "aaa"
				container : {

					aaaunittitle : { 
									size : function(){ return 14},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 13},
									display : function(){ return self.config.baseDisplay}
								},
					aabunitdate : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return 'darkgrey'},
									inline : function(){ return true},
									trailSpace : function(){ return self.config.baseTrailSpace},
									display : function(){ return self.config.baseDisplay}
								},

					abstract : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								}, 

					scopecontent : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 12},
									display : function(){ return self.config.baseDisplay}
								}, 

					p : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return self.config.baseDisplay}
								}, 

					unitid : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return false}
								}, 
					dao : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return false}
								}, 
					physdesc : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return false}
								},
					origination : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return false}
								},
					controlaccess : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return self.config.baseDisplay}
								},
					bioghist : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return self.config.baseInline},
									trailSpace : function(){ return 6},
									display : function(){ return self.config.baseDisplay}
								},

					container : { 
									size : function(){ return self.config.baseFontSize},
									font : function(){ return self.config.baseFontStyle},
									fill : function(){ return self.config.baseFill},
									inline : function(){ return true},
									trailSpace : function(){ return 6},
									display : function(){ return self.config.baseDisplay}
								}  


				}


			}





		},	



		canvas : null,
		ctx : null,
		canvasStash : [],
		svg : null,
		activeYear : null,

		//global tracker of x/y pos
		currentX : 0,
		currentY : 0,
		globalY: 0,
		globalSize : 0,
		globalRemainder: 0,
		superGlobalX: 0,

		superGlobalY: 0,

		superGlobalRemainder: this.maxHeight,

		printDecades: true,
		activeDecade: 0,

		totalHeight: 0,

		offsetX : 20,
		offsetY : 103,

		measurePass : false,

		ignoreDates : ['undated','n.d.','nd','n.d'],

		yearRegex : new RegExp(/[0-9]{4}/),

		nyplStuff : { title: null, biggestLevel: 0, localIdType: null, localId : null, imageNames : [], containerList : {}, dateList: [], collectionDateList : [] },







		initCanvas : function(ySize){

			this.canvas = new Canvas(this.config.width,ySize);
			this.ctx = this.canvas.getContext('2d');


		},

		initSVG : function(ySize){


			d3.select("svg").remove();

			this.svg = d3.select("body").append("svg")
			    .attr("width", self.config.width + "px")
			    .attr("height", ySize + 'px');




		},


		// //xml2js does not like nested elements, it really messed up the placement, so quick hack to change all the possible nested elements into the same elements so their placement order is mantained
		// cleanEad : function(data){
		
		// 	data = data.replace(/ source="lcsh"/g,'');
		// 	data = data.replace(/ source="naf"/g,'');
		// 	data = data.replace(/ source="aat"/g,'');

		// 	data = data.replace(/<title>/g,'<control>').replace(/<\/title>/g,'</control>')
		// 	data = data.replace(/<corpname/g,'<control').replace(/<\/corpname>/g,'</control>')
		// 	data = data.replace(/<famname/g,'<control').replace(/<\/famname>/g,'</control>')
		// 	data = data.replace(/<function/g,'<control').replace(/<\/function>/g,'</control>')
		// 	data = data.replace(/<genreform/g,'<control').replace(/<\/genreform>/g,'</control>')
		// 	data = data.replace(/<geogname/g,'<control').replace(/<\/geogname>/g,'</control>')
		// 	data = data.replace(/<name/g,'<control').replace(/<\/name>/g,'</control>')
		// 	data = data.replace(/<occupation/g,'<control').replace(/<\/occupation>/g,'</control>')
		// 	data = data.replace(/<persname/g,'<control').replace(/<\/persname>/g,'</control>')
		// 	data = data.replace(/<subject/g,'<control').replace(/<\/subject>/g,'</control>')


		// 	return data;
		// },

		//xml2js does not like nested elements, it really messed up the placement, so quick hack to change all the possible nested elements into the same elements so their placement order is mantained
		cleanEad : function(data){

		

			data = data.replace(/<title>/g,'').replace(/<\/title>/g,'')
			data = data.replace(/<corpname.*?>/g,'').replace(/<\/corpname>/g,'')
			data = data.replace(/<famname.*?>/g,'').replace(/<\/famname>/g,'')
			data = data.replace(/<function.*?>/g,'').replace(/<\/function>/g,'')
			data = data.replace(/<genreform.*?>/g,'').replace(/<\/genreform>/g,'')
			data = data.replace(/<geogname.*?>/g,'').replace(/<\/geogname>/g,'')
			data = data.replace(/<name.*?>/g,'').replace(/<\/name>/g,'')
			data = data.replace(/<occupation.*?>/g,'').replace(/<\/occupation>/g,'')
			data = data.replace(/<persname.*?>/g,'').replace(/<\/persname>/g,'')
			data = data.replace(/<subject.*?>/g,'').replace(/<\/subject>/g,'')
			
			return data;
		},

		//open the file and turn the xml into a js object
		parseEad : function(filepath,callback){

			var self = this;

			var parser = new xml2js.Parser();


			fs.readFile(filepath, function(err, data) {


				self.eadText = data.toString();

				data = self.cleanEad(data.toString());




			    parser.parseString(data, function (err, result) {
			        

			    	if (err){

			    		console.log("Error parseing the EAD:", filepath);
			    		console.log(err);
			    		process.exit();

			    	}

			        console.log('Loaded ', filepath);


			        callback(result);

			    });
			});
		},


		checkGlobalHeight: function(){

			if (this.superGlobalRemainder < 0){

				console.log("Resting currentY",this.superGlobalRemainder)

				this.superGlobalY = 0;
				this.currentY = 0;
				this.superGlobalX = this.superGlobalX + this.config.width;
				this.superGlobalRemainder = this.config.maxHeight;



			}


		},




		//pass the xml 
		buildMini : function(ead){

			var self = this;
			
			var archdesc = {};


			if (ead.ead) ead = ead.ead;

			if (ead.archdesc) archdesc = ead.archdesc;

			if (ead.archdesc[0]) archdesc = ead.archdesc[0];

			//console.log(archdesc)

			if (archdesc.did){
				//this some nypl stuff
				if (this.config.meta){
					if (archdesc.did[0].unitid){
						for (id in archdesc.did[0].unitid){
							if (self.debug) console.log("390",id);
							if (archdesc.did[0].unitid[id]['_']){
								if (!isNaN(archdesc.did[0].unitid[id]['_']) &&  (archdesc.did[0].unitid[id]['$']['type'] == 'local_mss' || archdesc.did[0].unitid[id]['$']['type'] == 'local_mms')){
									
									self.nyplStuff.localIdType = archdesc.did[0].unitid[id]['$']['type'];
									self.nyplStuff.localId = archdesc.did[0].unitid[id]['_'];
								
								}

							}

						}
					}	
				}



				if (self.printDecades){

					var thisDecade = Math.round(self.activeYear / 10) * 10;


					if (self.activeDecade != thisDecade && self.activeDecade != 0){


						
						if (program.mode=='svg'){



							this.currentY = this.currentY + ( 16*this.config.shrinkRay );

							if (!self.measurePass){

								var c = yearToRGB(self.activeYear);


								self.doc
									.fontSize(this.config.elements.overview['unittitle'].size()*this.config.shrinkRay)
									.fillColor(hexFromRGB(c.r, c.g, c.b)).font('Year Font')
									.text(thisDecade, (self.offsetX + this.currentX + this.superGlobalX + 1.5), (self.offsetY + this.currentY + this.superGlobalY));

							}


							this.currentY = this.currentY + this.config.elements.overview['unittitle'].size()*this.config.shrinkRay + ( 16*this.config.shrinkRay );


						}



						self.activeDecade= thisDecade;						
					

					}else if (self.activeDecade===0){

						self.activeDecade= thisDecade;		


					}

					


				}



				for (x in archdesc.did){

					var a = archdesc.did[x]

					for (anElement in a){


						//do we have this element defined in the config to know wahat to do with it
						if (this.config.elements.overview[anElement]){



							//do we display this element
							if (this.config.elements.overview[anElement].display()){

								var fullValue = "";

								//loop through all the values and make one string
								if (a[anElement]){


									for (n in a[anElement]){


										if (a[anElement]){

											var value = a[anElement][n];

											if (typeof value === 'string'){
												fullValue += value + ' ';


												//grab the date ranges if it is
												if (anElement =='unitdate'){
													var dateList = self.dateMalarky(value);
													for (aDate in dateList){
														self.nyplStuff.collectionDateList.push(dateList[aDate]);
													}											
												}



											}else{


												for (aSubEl in value){

													

													//do we have this sub-element
													if (this.config.elements.overview[aSubEl]){


														var subValue = value[aSubEl];

														if (typeof subValue === 'string'){
															fullValue += subValue + ' ';
														}else{


															for (q in subValue){
																
																fullValue += subValue[q] + ' ';

															}


														}
										

														anElement = aSubEl;


													}else{

														console.log(aSubEl, " element not supported, add it to the config definition. (overview)");


													}

												}

												

											}
										}

										if (anElement == 'unittitle'){
											self.nyplStuff.title = fullValue.trim();
										}
									}



								}

					


								this.currentX = 0;
								var textHeight = 0;


								if (program.mode=='png'){


									//first build the dispaly, number of lines ect
									lines = this.formatTextToBlock(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);



									//write them to the context
									this.ctx.textBaseline = "top";
									this.ctx.fillStyle = this.config.elements.overview[anElement].fill();

									this.ctx.font = this.config.elements.overview[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.overview[anElement].font();

									for(var n = 0; n < lines.length; n++) {
										this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);							
										textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
									}


								} 
								if (program.mode=='svg'){


										var svgText = self.svg.append("svg:text")

										.attr('x', this.currentX + 'px')
										.attr('y', this.currentY + textHeight + 'px')
										.attr("style", "font-size: " + this.config.elements.overview[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.overview[anElement].font())

										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

										for(var n = 0; n < lines.length; n++) {
											svgText.append("svg:tspan").attr("x", "0px").attr("dy", (this.config.elements.overview[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


								}
								


								//if we want trail space add it
								textHeight = textHeight + this.config.elements.overview[anElement].trailSpace() *this.config.shrinkRay;
								this.currentY = this.currentY + textHeight;
								//if (!self.measurePass){
								//	self.superGlobalRemainder = self.superGlobalRemainder - textHeight;
								//}


							}


						}else{


							console.log(anElement, " element not supported, add it to the config definition. (overview)");


						}

					}				



				}

			}


			//self.checkGlobalHeight();

			//figure out the bioghist
			if (archdesc.bioghist){
				for (x in archdesc.bioghist){
					var value = archdesc.bioghist[x];
					fullValue = "";

					if (typeof value === 'string'){
						fullValue += value + ' ';
					}else{
						for (z in value){
							if (this.config.elements.overview[z]){
								for (y in value[z]){

									if (typeof value[z][y] === 'string'){
										fullValue = value[z][y];
									}else{
										//this is a hack around the xml2js turning nested elements into a weird object with placement issues
										fullValue = self.fixNested(value[z][y]);

									}

									anElement = z;
									textHeight = 0;

									if (typeof fullValue == 'undefined')
										fullValue="";




									if (program.mode=='png'){


										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlock(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);



										//write them to the context
										this.ctx.textBaseline = "top";
										this.ctx.fillStyle = this.config.elements.overview[anElement].fill();

										this.ctx.font = this.config.elements.overview[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.overview[anElement].font();

										for(var n = 0; n < lines.length; n++) {
											this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);							
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


									}
									if (program.mode=='svg'){


										var svgText = self.svg.append("svg:text")

										.attr('x', this.currentX + 'px')
										.attr('y', this.currentY + textHeight + 'px')
										.attr("style", "font-size: " + this.config.elements.overview[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.overview[anElement].font())


										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

										for(var n = 0; n < lines.length; n++) {
											svgText.append("svg:tspan").attr("x", "0px").attr("dy", (this.config.elements.overview[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


									}
	

									//if we want trail space add it
									textHeight = textHeight + this.config.elements.overview[anElement].trailSpace() *this.config.shrinkRay;
									this.currentY = this.currentY + textHeight;




								}






							}


						}
					}

				}
			}




			//self.checkGlobalHeight();


			//figure out the bioghist
			if (archdesc.custodhist){

				this.currentY  = this.currentY  + this.config.baseFontSize*this.config.shrinkRay;
				if (!self.measurePass){
					self.superGlobalRemainder = self.superGlobalRemainder -  this.config.baseFontSize*this.config.shrinkRay;
				}

				for (x in archdesc.custodhist){
					var value = archdesc.custodhist[x];
					fullValue = "";

					if (typeof value === 'string'){
						fullValue += value + ' ';
					}else{
						for (z in value){
							if (this.config.elements.overview[z]){
								for (y in value[z]){

									if (typeof value[z][y] === 'string'){
										fullValue = value[z][y];
									}else{
										//this is a hack around the xml2js turning nested elements into a weird object with placement issues
										fullValue = self.fixNested(value[z][y]);
									}

									if (typeof fullValue == 'undefined')
										fullValue="";


									anElement = z;
									textHeight = 0;


									if (program.mode=='png'){


										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlock(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);



										//write them to the context
										this.ctx.textBaseline = "top";
										this.ctx.fillStyle = this.config.elements.overview[anElement].fill();

										this.ctx.font = this.config.elements.overview[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.overview[anElement].font();

										for(var n = 0; n < lines.length; n++) {
											this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);							
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


									} 
									if (program.mode=='svg'){



											var svgText = self.svg.append("svg:text")

											.attr('x', this.currentX + 'px')
											.attr('y', this.currentY + textHeight + 'px')
											.attr("style", "font-size: " + this.config.elements.overview[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.overview[anElement].font())

											//first build the dispaly, number of lines ect
											lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

											for(var n = 0; n < lines.length; n++) {
												svgText.append("svg:tspan").attr("x", "0px").attr("dy", (this.config.elements.overview[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
												textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
											}


									}


									//if we want trail space add it
									textHeight = textHeight + this.config.elements.overview[anElement].trailSpace() *this.config.shrinkRay;
									this.currentY = this.currentY + textHeight;




								}






							}


						}
					}

				}
			}




			//self.checkGlobalHeight();


			//figure out the scopecontent
			if (archdesc.scopecontent){
				this.currentY  = this.currentY  + this.config.baseFontSize*this.config.shrinkRay;
				if (!self.measurePass){
					self.superGlobalRemainder = self.superGlobalRemainder -  this.config.baseFontSize*this.config.shrinkRay;
				}

				for (x in archdesc.scopecontent){
					var value = archdesc.scopecontent[x];
					fullValue = "";

					if (typeof value === 'string'){
						fullValue += value + ' ';
					}else{
						for (z in value){
							if (this.config.elements.overview[z]){
								for (y in value[z]){

									if (typeof value[z][y] === 'string'){
										fullValue = value[z][y];
									}else{
										//this is a hack around the xml2js turning nested elements into a weird object with placement issues
										fullValue = self.fixNested(value[z][y]);
									}

									anElement = z;
									textHeight = 0;

									if (typeof fullValue == 'undefined') fullValue = '';


									if (program.mode=='png'){


										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlock(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

										//write them to the context
										this.ctx.textBaseline = "top";
										this.ctx.fillStyle = this.config.elements.overview[anElement].fill();

										this.ctx.font = this.config.elements.overview[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.overview[anElement].font();

										for(var n = 0; n < lines.length; n++) {
											this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);							
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


									} 

									if (program.mode=='svg'){



											var svgText = self.svg.append("svg:text")

											.attr('x', this.currentX + 'px')
											.attr('y', this.currentY + textHeight + 'px')
											.attr("style", "font-size: " + this.config.elements.overview[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.overview[anElement].font())

											//first build the dispaly, number of lines ect
											lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

											for(var n = 0; n < lines.length; n++) {
												svgText.append("svg:tspan").attr("x", "0px").attr("dy", (this.config.elements.overview[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
												textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
											}

									}

								
									//if we want trail space add it
									textHeight = textHeight + this.config.elements.overview[anElement].trailSpace() *this.config.shrinkRay;
									this.currentY = this.currentY + textHeight;


								}


							}


						}
					}

				}
			}

			//self.checkGlobalHeight();
			

			//figure out the controlaccess
			if (archdesc.controlaccess){

				this.currentY  = this.currentY  + this.config.baseFontSize*this.config.shrinkRay;

				if (!self.measurePass){
					self.superGlobalRemainder = self.superGlobalRemainder -  this.config.baseFontSize*this.config.shrinkRay;
				}

				for (x in archdesc.controlaccess){

					var value = archdesc.controlaccess[x];

					fullValue = "";

					if (value['control']){


						anElement = 'control';

						for (z in value['control']){

							if (value['control'][z]['_']){

								fullValue = value['control'][z]['_'];

								textHeight = 0;

									if (program.mode=='png'){


										//first build the dispaly, number of lines ect
										lines = this.formatTextToBlock(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

										//write them to the context
										this.ctx.textBaseline = "top";
										this.ctx.fillStyle = this.config.elements.overview[anElement].fill();

										this.ctx.font = this.config.elements.overview[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.overview[anElement].font();

										for(var n = 0; n < lines.length; n++) {
											this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);							
											textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
										}


									}

									if (program.mode=='svg'){



											var svgText = self.svg.append("svg:text")

											.attr('x', this.currentX + 'px')
											.attr('y', this.currentY + textHeight + 'px')
											.attr("style", "font-size: " + this.config.elements.overview[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.overview[anElement].font())

											//first build the dispaly, number of lines ect
											lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.overview[anElement].size(), this.config.elements.overview[anElement].font(), this.config.width);

											for(var n = 0; n < lines.length; n++) {
												svgText.append("svg:tspan").attr("x", "0px").attr("dy", (this.config.elements.overview[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
												textHeight = textHeight + this.config.elements.overview[anElement].size()*this.config.shrinkRay;	
											}


									}

									//if we want trail space add it
									textHeight = textHeight + (this.config.elements.overview[anElement].trailSpace() * this.config.shrinkRay) * 3;
									this.currentY = this.currentY + textHeight;

							}

						}

					}

				}
			}






			//ohhhhhh gosshh, time for the detailed description
			if (archdesc.dsc){

				this.currentY  = this.currentY  + this.config.baseFontSize*this.config.shrinkRay * 2;

				if (!self.measurePass){
					self.superGlobalRemainder = self.superGlobalRemainder -  this.config.baseFontSize*this.config.shrinkRay * 2;
				}

				//going to assume here there is only one dec for this finding aid
				if (archdesc.dsc.length == 1)
					archdesc.dsc = archdesc.dsc[0];

				for (x in archdesc.dsc){




					//likely c01, 
					if (self.config.componentElements.indexOf(x)>-1){	
					

						var cxx = archdesc.dsc[x];	

						for (z in cxx){		
							//simulate it as an array of one to kick off the c01s	
							this.buildComponent([cxx[z]],x);
						}
					}



				}
				

			}



			//draw a little line at the end

			if (program.mode=='png'){

				this.currentY = this.currentY + ( 12 *this.config.shrinkRay);

				this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				this.ctx.beginPath();
				this.ctx.moveTo(0, this.currentY);
				this.ctx.lineTo(this.config.width, this.currentY);
				this.ctx.stroke();

				this.currentY = this.currentY + ( 12 *this.config.shrinkRay);

			}else{



				if (!self.measurePass){
					var c = yearToRGB(self.activeYear);

				}



			}





		},



		buildComponent: function (nodes, level){


			var self = this;


			level = parseInt(level.replace('c',''));

			


			if (level > self.nyplStuff.biggestLevel) self.nyplStuff.biggestLevel = level;

			//throw a break in there before a series 01 title
			if (level == 1 && self.nyplStuff.biggestLevel > 1){


				this.currentY = this.currentY + ( 12 *this.config.shrinkRay);


				if (!self.measurePass){
					self.superGlobalRemainder = self.superGlobalRemainder -  ( 12 *this.config.shrinkRay);
				}
			}




			this.globalY = this.currentY;


			if (program.mode=='png'){

				//do we need to build a new canavas if we are doing canvas
				if (this.globalY>30000){

					//is this for reall?
					if (self.globalRemainder != 0){


						self.globalRemainder = self.globalRemainder - this.currentY;

						//yes, stash the current canvas and start a new one
						var newCanvas = self.canvas;
						self.canvasStash.push(newCanvas);
						var newSize = (self.globalRemainder>=30000) ? 30000 : self.globalRemainder;
						self.initCanvas(newSize);

						console.log("Resting canvas, over 30K pixles, there are now:",self.canvasStash.length+1," images.")

						this.currentY = 0;
					}
				}



			}




			for (aNode in nodes){

				//they are not using ordered components....ohhh....myyyyy..godddddddd
				if (nodes[aNode]['$'] && isNaN(level) ){
					if (nodes[aNode]['$']['level']){
						if (nodes[aNode]['$']['level'] == 'series'){
							level = 1
						}else{
							level = 2
						}
					}
					
				}



				//if it is the last col.
				if (self.offsetX + self.superGlobalX  >= (self.config.maxWidth - (self.offsetX))){
					return;
				}


				self.checkGlobalHeight();

				processData = {};
				fireRecursive = null;
				fireRecursiveLevel = "";


				for (element in nodes[aNode]){					
					if (self.config.componentElements.indexOf(element)>-1){
						fireRecursive = nodes[aNode][element];
						fireRecursiveLevel = element;

					}else{
						processData[element] = nodes[aNode][element];

					}			
				}
			
				//we now built an object for this component, build the data


				if (processData.did){
					processData.did = processData.did[0];

					for (aDid in processData.did){

						var aDidUseVal = '';
						for (aDidValue in processData.did[aDid]){
							aDidUseVal = aDidUseVal + processData.did[aDid][aDidValue];
						}


						if (aDid == "unittitle"){
							processData["aaa" + aDid] = aDidUseVal;
						}else if ( aDid == "unitdate"){
							processData["aab" + aDid] = aDidUseVal;

							//process the date
							var possibleDates = self.dateMalarky(aDidUseVal);

							for (aDate in possibleDates){

								if (self.nyplStuff.dateList.indexOf(possibleDates[aDate])==-1 && possibleDates[aDate] >= 1000 && possibleDates[aDate] <= 2014 ){
									self.nyplStuff.dateList.push(possibleDates[aDate]);
								}

							}


						}else if ( aDid == "container"){

							aDidUseVal = '';

							for (aC in processData.did[aDid]){

								if (typeof processData.did[aDid][aC] == 'string'){
									aDidUseVal = aDidUseVal + processData.did[aDid][aC];
								}else{

									if (processData.did[aDid][aC]['$']){
										if (processData.did[aDid][aC]['$']['type']){
											aDidUseVal = aDidUseVal + ' ' + processData.did[aDid][aC]['$']['type'][0] + '.';
										}	
									}

									if (processData.did[aDid][aC]['_']){
										aDidUseVal = aDidUseVal + processData.did[aDid][aC]['_'];
									}





								}

							}

							processData[aDid] = aDidUseVal.trim();

						}else{
							processData[aDid] = aDidUseVal;
						}
						

						//[aDidValue] = aDidUseVal;


					}
				}


				//braek the width upinto 6 units and each level is indented x of thoses units
				this.currentX = (this.config.width/6) * (level - 1);
				var stepWidth = this.config.width/6;

				//if there are a ton of levels we can't do as much space
				if (self.nyplStuff.biggestLevel >= 6){
					this.currentX = (this.config.width/12) * (level - 1);
					stepWidth = this.config.width/12;
				}

				//its the big one!
				if (self.nyplStuff.biggestLevel >= 10){
					this.currentX = (this.config.width/14) * (level - 1);
					stepWidth = this.config.width/14;
				}

				var remainder = this.config.width - this.currentX;



				//kind of selective here, building the way it looks
				var lastXEndingPos = 0;
				var lastTextHeight = 0;
				var startingY = this.currentY;

				//this is some dumb hack to get the order othe elements into order, object properties by alpha so make the ones that need to up front first
			    var keys = Object.keys(processData);
			    var i, len = keys.length;

				keys.sort();

				for (i = 0; i < len; i++){

					var p = keys[i];	


					if (p != 'did' && p != '$' ){

						if (self.config.elements.container[p]){

							if (!self.config.elements.container[p].display())
								continue;

							textHeight = 0;

							

							var fontSize = this.config.elements.container[p].size();

							fontSize = fontSize - ((level-1) * 2);
							if (fontSize<10){
								fontSize = 10;
							}

							var fullValue = "";


							if (typeof processData[p] === 'string'){

								fullValue = processData[p];
							}else{

								for (para in processData[p]){

									if (typeof processData[p][para]=== 'string'){
										fullValue = processData[p][para];
									}else{

										for (subPara in processData[p][para]){


	
											if (self.config.elements.container[subPara]){

												for (l in processData[p][para][subPara]){



													if (typeof processData[p][para][subPara][l] === 'string'){
														fullValue = processData[p][para][subPara][l];
													}else{
														//this is a hack around the xml2js turning nested elements into a weird object with placement issues
														fullValue = self.fixNested(processData[p][para][subPara][l]);
													}


												}



											}

										}
									}
								}
							}

							var anElement = p;

							if (typeof fullValue == 'undefined')
								fullValue="";




							if (program.mode=='png'){

								lines = this.formatTextToBlock(fullValue.trim(), fontSize, this.config.elements.container[anElement].font(), remainder);

							}else if (program.mode=='svg'){

								lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.container[anElement].size(), this.config.elements.container[anElement].font(), remainder);

							}

						



							if (this.config.elements.container[p].inline()){


								if (p==='container') {

									if (program.mode=='png'){

										//try to make the container a little smaller
										fullValue = fullValue.trim().replace(" - ","-");
										this.ctx.fillText(fullValue.trim(), 0, startingY);
										this.containerWidth = this.ctx.measureText(fullValue.trim()).width;




									} 


									if (program.mode=='svg'){


											lines = this.formatTextToBlockSVG(fullValue.trim(), this.config.elements.container[anElement].size(), this.config.elements.container[anElement].font(), stepWidth);

											var svgText = self.svg.append("svg:text")
											.attr('y', startingY + this.config.elements.container[anElement].size()*this.config.shrinkRay  + 'px')
											.attr('width', stepWidth + 'px')
											.attr("style", "font-size: " + this.config.elements.container[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.container[anElement].font())

											svgText.append("svg:tspan").attr("x", 0 + "px").attr("dy", 0 + "px").text(lines[0]);
											//textHeight = textHeight + this.config.elements.container[anElement].size()*this.config.shrinkRay;	

									}




								}else{

									//not doing dates right now....
									//if we are doing this inline, we need to write it at the ending X pos of the 
									//this.ctx.fillText(useVal, lastXEndingPos, this.currentY - lastTextHeight);	

								}


	

							}else{


								if (program.mode=='png'){


									//write them to the context
									this.ctx.textBaseline = "top";
									this.ctx.fillStyle = this.config.elements.container[anElement].fill();

									this.ctx.font = this.config.elements.container[anElement].size()*this.config.shrinkRay + "px " + this.config.elements.container[anElement].font();
									
									//there is often overlap in the second level if the container list is longer
									if (level == 2){
										if (this.currentX < this.containerWidth){
											this.currentX = this.currentX + (stepWidth/1.25);
										} 
									}									

									for(var n = 0; n < lines.length; n++) {
										this.ctx.fillText(lines[n], this.currentX, this.currentY + textHeight);		
										textHeight = textHeight + this.config.elements.container[anElement].size()*this.config.shrinkRay;	
									}


								}


								if (program.mode=='svg'){



										var svgText = self.svg.append("svg:text")
										//.attr('dx', this.currentX + 'px')
										.attr('y', this.currentY + textHeight + 'px')
										.attr('width', remainder + 'px')
										.attr("style", "font-size: " + this.config.elements.container[anElement].size()*this.config.shrinkRay +"px; font-family: " + this.config.elements.container[anElement].font())

										for(var n = 0; n < lines.length; n++) {
											svgText.append("svg:tspan").attr("x", this.currentX + "px").attr("dy", (this.config.elements.container[anElement].size()*this.config.shrinkRay) + "px").text(lines[n]);
											textHeight = textHeight + this.config.elements.container[anElement].size()*this.config.shrinkRay;	


										}


								}


							}

							//if we want trail space add it
							if (level > 1){
								textHeight = textHeight + self.config.baseTrailSpace *this.config.shrinkRay;

								self.superGlobalRemainder = self.superGlobalRemainder - self.config.baseTrailSpace *this.config.shrinkRay;
								self.checkGlobalHeight();



							}else{
								textHeight = textHeight + this.config.elements.container[p].trailSpace() *this.config.shrinkRay;
								self.superGlobalRemainder = self.superGlobalRemainder - this.config.elements.container[p].trailSpace() *this.config.shrinkRay;
								self.checkGlobalHeight();


							}
							

							this.currentY = this.currentY + textHeight;

							lastTextHeight = textHeight;

							



						}else{

							
								console.log(p, ' element not supported yet add it to the definition (container)');
							
						}
					}



				}


				if (fireRecursive !== null){

					this.buildComponent(fireRecursive,fireRecursiveLevel);

				}









			}




		},


		fixNested: function(obj){


			//lists
			if (obj['list']){

				var newObj = {}

				newObj['_'] = '';
				newObj['control'] = [];

				for (u in obj['list'][0]['item'] ) {
					if (self.debug) console.log("1234",u);

					newObj['_'] +=  obj['list'][0]['item'][u]['_']

					if (newObj['_'] +=  obj['list'][0]['item'][u]['control']){

						for (aControl in obj['list'][0]['item'][u]['control']){
							if (self.debug) console.log("1153",aControl);
							newObj['control'].push(obj['list'][0]['item'][u]['control'][aControl]);
						}

					}


				}

				obj = newObj;

			}
			


			if (obj['_'] && obj['control']){

					var text = obj['_'].split(/\s\s|\s,\s/);

					var joinedText='';

					for(var n = 0; n < text.length; n++) {

						if (self.debug) console.log("1265",n);


						if (obj['control'][n]){

							joinedText = joinedText + text[n] + " " + obj['control'][n] + " ";

						}else{

							joinedText = joinedText + text[n] + ' ';

						}

					}

			}






			if (typeof joinedText === 'undefined'){
				if (obj['_']){
					joinedText = obj['_'];
				}

			}

			return joinedText;

		},


		dateMalarky: function(yearString){




			var dates = yearString.replace(';',',').split(',');

			useDates = [];

			for (aDate in dates){

				if (self.debug) console.log("1310",aDate);


				test = dates[aDate].replace(' -',' - ').replace(' -  ',' - ').replace('-1',' - 1').replace('ca.','').trim();

				if (this.ignoreDates.indexOf(test)!= -1)
					continue;


				if (!isNaN(test)){

					if (useDates.indexOf(parseInt(test))==-1)
						useDates.push(parseInt(test));

				}else if ( test.search(' - ') >-1){

					var yearOne = test.split(' - ')[0];
					var yearTwo = test.split(' - ')[1];

					if (!isNaN(yearOne)&&!isNaN(yearTwo)){

						yearOne = parseInt(yearOne);
						yearTwo = parseInt(yearTwo);

						if (yearOne>=1000 && yearTwo <= 2014){

							for (n=yearOne; n<=yearTwo; n++){

								if (self.debug) console.log("1342",n,yearOne,yearTwo);


								if (useDates.indexOf(n)==-1)
									useDates.push(n);
							}
						}

					}


				}


				if (useDates.length == 0){
					var found = test.match(this.yearRegex);
					if (found!=null){
							useDates.push(parseInt(found[0]));						
					}else{
						//console.log("No REGEX FOund", test)
					}
				}				
			}


			return useDates;

		},


		formatTextToBlockSVG: function(text, fontSize, fontStyle, width){



			//we know ther is a specifc number of lines width of lines we can have so loop through each word, see if it would push it over the width,
	        var words = text.split(' ');
	        var line = '';

	        var lineArray = [];

			var aCanvas = new Canvas(0,0);
			var aCtx = aCanvas.getContext('2d');

			aCtx.font =  fontSize*this.config.shrinkRay + "px " + fontStyle;




	        for(var n = 0; n < words.length; n++) {

	          var testLine = line + words[n] + ' ';
	          var metrics = aCtx.measureText(testLine);	          
	          var testWidth = metrics.width;	

	          

	          if (testWidth > width && n > 0) {

	          	lineArray.push(line);
	          	line = words[n] + ' ';

	          	

	          }else{

	          	line = testLine;

	          	
	          }


	        }


	        lineArray.push(line);

	        var newAry = [];


	        for (aLine in lineArray){
	        	if (lineArray[aLine].trim().split(' ').length == 1){

		          var metrics = aCtx.measureText(lineArray[aLine]);	          
		          var testWidth = metrics.width;
		          if (testWidth > width){

		          	var newWord1 = lineArray[aLine].substring(0, lineArray[aLine].length - Math.floor(lineArray[aLine].length/2)  );
		          	var newWord2 = lineArray[aLine].substring(lineArray[aLine].length - Math.floor(lineArray[aLine].length/2));

		          	lineArray[aLine] = newWord1.trim() + '-';

		          	//lineArray.splice(aLine,0,newWord2);

		          	newAry.push(newWord1.trim() + '-');
		          	newAry.push(newWord2);



		          }else{
		          	newAry.push(lineArray[aLine]);
		          }


	        	}else{
		          	newAry.push(lineArray[aLine]);
		        }

	        }


	        



	        return newAry;


		},

		formatTextToBlock: function(text, fontSize, fontStyle, width){


			//we know ther is a specifc number of lines width of lines we can have so loop through each word, see if it would push it over the width,
	        var words = text.split(' ');
	        var line = '';

	        var lineArray = [];

			this.ctx.font =  fontSize*this.config.shrinkRay + "px " + fontStyle;

			

	        for(var n = 0; n < words.length; n++) {

	        	if (self.debug) console.log("1382",n);


	          var testLine = line + words[n] + ' ';
	          var metrics = this.ctx.measureText(testLine);	          
	          var testWidth = metrics.width;	

	          if (testWidth > width && n > 0) {
	          	lineArray.push(line);
	          	line = words[n] + ' ';
	          }else{
	          	line = testLine;
	          }


	        }

	        lineArray.push(line);

	        return lineArray;


		},


		save: function(){

			var self = this;

			//make sure the last one is in there
			self.canvasStash.push(self.canvas);

		
			for (x in self.canvasStash){

				if (self.debug) console.log("1417",x);

				var canvas = self.canvasStash[x];

				if (self.nyplStuff.localIdType != null){
					var filename = self.nyplStuff.localIdType + "_" + self.nyplStuff.localId + ".json";
					var id = self.nyplStuff.localIdType + '_' + self.nyplStuff.localId;
				}else{
					var id = 'collection_' + self.filename.replace('.xml','').replace('data/ead/','');
				}

				

				self.nyplStuff.imageNames.push(id + '-' + x + '.png');



				//async javascript...... 
				(function(){

					var out = fs.createWriteStream(__dirname + '/data/images/' + id + '-' + x + '.png')
					  , stream = canvas.pngStream();

					stream.on('data', function(chunk){
					  out.write(chunk);
					});

					stream.on('end', function(){
					  console.log('saved png');
					});


				}).call();



			}



		},


		saveSVG: function(){

			var self = this;

			var svgGraph = d3.select('svg')
			  .attr('xmlns', 'http://www.w3.org/2000/svg');
			var svgXML = (new xmldom.XMLSerializer()).serializeToString(svgGraph[0][0]);

			if (self.nyplStuff.localIdType != null){
				var filename = self.nyplStuff.localIdType + "_" + self.nyplStuff.localId + ".json";
				var id = self.nyplStuff.localIdType + '_' + self.nyplStuff.localId;
			}else{
				var id = 'collection_' + self.filename.replace('.xml','').replace('data/ead/','');
			}

			fs.writeFile(__dirname + '/data/images/' + id + '-' + '0' + '.svg', lowerXML(svgXML));


		},




		saveMeta: function(){

			var self = this;

			var sum = 0;

			var dateList = (self.nyplStuff.dateList.length==0) ? self.nyplStuff.collectionDateList : self.nyplStuff.dateList;

			//if both are empty...
			if (dateList.length==0){

				if (self.eadText.match(/1[0-9]{3}-1[0-9]{3}/)){
					dateList = self.dateMalarky(self.eadText.match(/1[0-9]{3}-1[0-9]{3}/)[0]);
				}


			}


			for(var i = 0; i < dateList.length; i++){
				if (self.debug) console.log("1463",i);
			    sum += parseInt(dateList[i]);
			}

			var avg = sum/dateList.length;

			self.nyplStuff.dateAvg =  Math.round(avg);

			if (isNaN(self.nyplStuff.dateAvg)){
				//could not find date by components go for the main
				console.log("Error could not find date for this collection");		
			}


			self.nyplStuff.height = this.globalY;


			if (self.nyplStuff.localIdType != null){
				var filename = self.nyplStuff.localIdType + "_" + self.nyplStuff.localId + ".json";
			}else{
				var filename = 'collection_' + self.filename.replace('.xml','').replace('data/ead/',''); + '.json';
			}

			fs.writeFile(__dirname + '/data/meta/' + filename, JSON.stringify(self.nyplStuff) , function (err) {
			  if (err) throw err;
			  console.log('It\'s saved!');
			});



		},

		initMulti: function(directory){


			self = this;

			var fileList = [];

			self.superGlobalRemainder = self.config.maxHeight;

			fs.readdir(directory, function(err, files) {
				for (aFile in files){
					var filename = files[aFile];
					if (filename.substr(-4) == '.xml'){
						fileList.push(filename);
					}
				}
			});






			var time = setInterval(function(){


				if (!self.processActive && fileList[self.processCounter]){

					self.canvasStash = []
					self.currentX = 0
					self.currentY = 0
					self.globalY= 0
					self.globalSize = 0
					self.globalRemainder= 0
					self.superGlobalX= 0
					self.superGlobalY= 0
					self.superGlobalRemainder= self.maxHeight
					self.totalHeight= 0
					self.canvas = null
					self.ctx = null
					self.svg = null
					self.activeYear = null

					var filePath = directory + fileList[self.processCounter];

					console.log(self.processCounter, fileList.length);

					console.log('------','processing',filePath, self.processCounter,fileList.length-1,'--------',self.totalHeight, "px tall.", self.offsetX + self.superGlobalX,"Total writes:",self.totalWrites);
					self.init(filePath);	

					self.processCounter++;



				}

				if(self.processCounter == fileList.length)
					clearInterval(time)


			},5);





		},

		init: function(filename){

			self = this;

			self.filename = filename;




			self.processActive = true;

			this.parseEad(filename, function(result){

				self.measurePass = true;
				var tempActiveDecade = self.activeDecade;

				if (program.mode=='png'){
					self.initCanvas(0);
				}else if (program.mode =='svg'){
					self.initSVG(0);
				}


				self.buildMini(result);


				if (program.mode=='png'){
					var newSize =  (self.currentY>30000) ? 30000 : self.currentY ;
				}else if (program.mode =='svg'){
					var newSize = self.currentY ;
				}



				self.totalHeight+=newSize;


				self.measurePass = false;

				console.log("Rebuilding ", self.currentY, "px tall");


				self.activeDecade = tempActiveDecade;


				self.globalSize = self.currentY;
				self.globalRemainder= self.currentY;

				
				if (program.mode=='png'){
					self.initCanvas(newSize);
				}else if (program.mode =='svg'){
					self.initSVG(newSize);
				}


				self.currentY = 0;
				self.buildMini(result);

				if (program.mode=='png'){
					self.save();
				}else if (program.mode =='svg'){
					self.saveSVG();
				}

				self.superGlobalY = self.superGlobalY + self.currentY;

				//self.superGlobalRemainder = self.config.maxHeight - self.currentY;

				//console.log("======>",self.superGlobalRemainder);


				

				

				self.saveMeta();
			

				self.processActive = false;

				
			});

		}



	}


	program.width = parseInt(program.width)
	program.shrink = parseFloat(program.shrink)


	miniEad.config.shrinkRay = program.shrink
	miniEad.config.width = program.width


	if (program.file=="tilden.xml"){
		console.log("'node convert.js -h' to see options")
		process.exit()
	}


	//are we running it on a directory:
	if (fs.lstatSync(program.file).isDirectory()){

		miniEad.initMulti(program.file);

	}else{
		miniEad.init(program.file);
	}



  var max_year = 2013, min_year = 1200;
  var max_year = 1900, min_year = 1300;



  function hexFromRGB(r, g, b) {
    var hex = [
      r.toString( 16 ),
      g.toString( 16 ),
      b.toString( 16 )
    ];
    for (var i=0;i<hex.length;i++) {
    	var val = hex[i];
      if ( val.length === 1 ) {
        hex[ i ] = "0" + val;
      }
    }
    return "#" + hex.join( "" ).toUpperCase();
  }
	function HSVtoRGB(h, s, v) {
	    var r, g, b, i, f, p, q, t;
	    if (h && s === undefined && v === undefined) {
	        s = h.s, v = h.v, h = h.h;
	    }
	    i = Math.floor(h * 6);
	    f = h * 6 - i;
	    p = v * (1 - s);
	    q = v * (1 - f * s);
	    t = v * (1 - (1 - f) * s);
	    switch (i % 6) {
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }
	    return {
	        r: Math.floor(r * 255),
	        g: Math.floor(g * 255),
	        b: Math.floor(b * 255)
	    };
	}
	function yearToRGB(year) {
	    var p = .02+.55*(year-min_year)/(max_year-min_year);

	    var h=p
	    ,s=1
	    ,v=.8;
	    var rgb = HSVtoRGB(h, s, v);

	    return {
	        r:rgb.r
	        ,g:rgb.g
	        ,b:rgb.b
	    }
	}

	  String.prototype.encodeHTML = function () {
	    return this.replace(/&/g, '&amp;')
	               .replace(/</g, '&lt;')
	               .replace(/>/g, '&gt;')
	               .replace(/"/g, '&quot;')
	               .replace(/'/g, '&apos;');
	  };

	function lowerXML(ds){

		//serializeToString is broken and returns uppercase elements, since we know what elements we use we can fix it


		return ds.replace(/<SVG/gi,"<svg")
				 .replace(/<\/SVG>/gi,"</svg>")	
				 .replace(/<TEXT/gi,"<text")
				 .replace(/<\/TEXT>/gi,"</text>")	
				 .replace(/<TSPAN/gi,"<tspan")
				 .replace(/<\/TSPAN>/gi,"</tspan>")	

	}

}).call(this);