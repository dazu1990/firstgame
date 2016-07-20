// get the DOM element to attach to
// - assume we've got jQuery to hand
var $player;
var frameRunner = new heliosFrameRunner();
// var cachedscore = JSON.parse(localStorage.getItem("names"));




gm={
	state: "intro",
	framecount: 0,
	//this is speed of code change
	resetkeyint: 200,
	//this is speed of life loss
	droplife: 200,
	//this is speed of falling blocks/game speed
	blockspeed: 50,
	resetgridint: 50,
	totalkeys: (90),
	//player position
	playerpos: 76,
	cntrlpos: { up: false, down: false, left: false, right: false},
	// left and right movement limits relative to player position
	playerxlimit: {l: (71 + 1), r: 79},
	// base value needed to move player up one row
	ymove: 9,
	// all possible xlimits according to grid
	xarrays: [],
	// this are the tiles that will be blockers
	nulltiles: [],
	// this are the tiles that will contain lifepoints
	lifepoints: [],
    //gamescore
    score: 0,
    highscore: Number(JSON.parse(localStorage.getItem("cybersprinterscore"))) || 0,
	// number of colour schemes
	playercolors: 21,
	lastcolor: "",
	keycodes: [],
	alphabet: '0123456789abcdefghijklmnopqrstuvwxyz',
	directions: ['up','down','left', 'right'],
	keys: {
		'disabled': false,
		'active': false,
		'up': {
			'press': false
		},
		'down': {
			'press': false
		},
		'left': {
			'press': false
		},
		'right': {
			'press': false
		}
	},


	init: init,
	moveplayer: moveplayer,
	drawcntrls: drawcntrls,
	draw: draw,
	resetgame: resetgame,
	riselife: riselife,
}

gm.init();

frameRunner.start();
frameRunner.add('gmDraw', 'everyFrame', function() {
    gm.draw();
})




function init() {


	var values = [];
	var setvalue = setvalue,
		setkeycodes = setkeycodes,
		setgrid = setgrid,
		cntrlinput = cntrlinput,
		runvaluechecks = runvaluechecks,
		setupkeys = setupkeys,
		setlife = setlife;

	// set up array of key objects that have a letter and keycode
	setkeycodes();

	setgrid();

    if (gm.highscore) {
       $('#highscore').html(gm.highscore); 
    };

	$(".cntrlinput").keydown(function(o,i){
		// map inital player movement gm.keys to input
		cntrlinput();
		
	})

	//this draws the player		
	gm.moveplayer();

	// this binds the play movement gm.keys to the movement function
	setupkeys();
	setsoundtrack();
	setinfobtn();

	function setinfobtn() {
		var previous = false;
		var prevstate = false;

		
		$('#info').click(function(){
			console.log('test', previous);

			
			if ( $('.start').hasClass('active') && !previous) {
				previous = 'start';
			}else if( $('.end').hasClass('active') && !previous){
				previous = 'end';
			}

			$('.infobox').toggleClass('active')
			if (previous) {
				$('.'+previous).toggleClass('active')
				// previous = false;
			}
			if (gm.state !== 'pause') {
				prevstate = gm.state
				gm.state = 'pause';
			}else{
				gm.state = prevstate;
			}
		})
	}

	function setsoundtrack(){
		// var audio = new Audio('assets/soundtrack.mp3');
		// audio.play();

		// var sound = new Audio('../assets/soundtrack.mp3');
		// sound.play();

		var soundtrack = document.getElementById('soundtrack');
		soundtrack.autoplay = true;
		soundtrack.loop = true;
		soundtrack.load();
		soundtrack.volume = 0.075;

		$('#mute').click(function(){
			console.log('test');
			soundtrack.muted = !soundtrack.muted;
			// soundtrack.volume = 0;
		})


	}


	function setkeycodes(){
		// for total amount of gm.keys assign a key code to that key

		for (var i = 0; i < 48; i++ ){
			var code = (i + 48);
			if (code < 58 || code > 64 && code < 91) {
				gm.keycodes.push({
					'letter':  String.fromCharCode(i + 48),
					'code': code
				});
			};
			
		};
	}

	function setgrid(){
		//set up grid
		gm.directions = ['up','down','left', 'right']
		for (var i = gm.totalkeys; i >= 0; i--) {
			var tileclass = '';
			if (i < (1 + gm.ymove)) {
				tileclass = 'lower';
			};
			$('#grid').append('<li class="tile '+tileclass+'" id="tile'+i+
				'"><div class="inner">'+
					'<span class="text"></span>'+
				'</div></li>');
		};

		for (var i = 0; i < 10; i++) {
			gm.xarrays.push([ i*gm.ymove, ((i*gm.ymove) + gm.ymove - 1)])
		};
		$('.gamewrapper').addClass('set'+_.random( 0, gm.playercolors ));
	}
	

	function setvalue(letter){
		//this applys the chosen values from the intro screen to the movement gm.keys
		gm.keys.disabled = false;
		values.push(letter);

		switch(values.length) {

		    case 1:
		    	var key = _.findWhere(gm.keycodes,{"letter" : values[0]})
		    	gm.keys.up.letter = values[0];
		    	gm.keys.up.code = key.code;
		        break;

		    case 2:
		    	var key = _.findWhere(gm.keycodes,{"letter" : values[1]})
		    	gm.keys.down.letter = values[1];
		    	gm.keys.down.code = key.code;
		        break;

		    case 3:
		    	var key = _.findWhere(gm.keycodes,{"letter" : values[2]})
		    	gm.keys.left.letter = values[2];
		    	gm.keys.left.code = key.code;
		        break;
		        
		    case 4:
		    	var key = _.findWhere(gm.keycodes,{"letter" : values[3]})
		    	gm.keys.right.letter = values[3];
		    	gm.keys.right.code = key.code;
		        break;
		}
	}
	function runvaluechecks(letter){
		//this reg expression checks if string is alphanumeric
		var reg = /[^A-Za-z0-9 ]/;
		var targetclass;


		if(reg.test(letter) || letter === " "){
			targetclass = '.numberletter';
		}else if ( _.contains(values, letter)) {
			targetclass = '.different';
		}

		if(targetclass){
			//this adds animation to the appropriate text if the input value is a repeat or a not alphanumeric

			gm.keys.disabled = true;
			$(targetclass).addClass('glitch');
			$('.cntrlinput').addClass('shake');
			setTimeout(function() {
				$('.cntrlinput').removeClass('shake');
			}, 200);
			setTimeout(function() {
				$(targetclass).removeClass('glitch');
			}, 500);
			return false;

		}else{
			// if input passes checks add value to keycodes
			return true;
			// console.log(values);
		}

	}
	function cntrlinput(){
		var letter = String.fromCharCode(event.which)
		letter  = letter.toUpperCase();

		if (values.length === 3) {
			// on the last key stroke set the letter and start the game
			// setvalue(letter);
			if (runvaluechecks(letter)) {
				setvalue(letter)
				$('.starttext').addClass('glitch');
				setTimeout(function() {
					setlife();
					$('.start').removeClass('active');
					$('.overlay').addClass('fadeout');
					setTimeout(function(){

						//GAME STARTS HERE!!!!
						gm.state = "play";
						gm.resetgridint = gm.framecount + gm.blockspeed;
						gm.resetkeyint = gm.framecount + gm.blockspeed + 300;
						gm.droplife = gm.framecount +  200;

						gm.moveplayer();
					},1000)
				}, 800);
			}else{
				return false;
			}
			
		    // return false;
		}else{
			
			// if input passes checks add value to keycodes
			if (runvaluechecks(letter)) {
				setvalue(letter)
			}else{
				return false;
			}
		}
	}
	function setlife () {
		var setdelay = function(i){
			setTimeout(function(){
				$('#life'+i).addClass('full')
			},100*i)

		}
		for (var i = 0; i < 10; i++) {
			setdelay(i);
		};
	}
	function setupkeys(){
		// this sets up the inital key mapping
		$( window ).keydown(function( event ) {
			gm.keys.active= true;
			if (!gm.inputfocused) {
				//W up
				if ( event.which == gm.keys.up.code  ) {
					gm.keys.up.press = true;
					// event.preventDefault();
				}
				//A down
				if ( event.which == gm.keys.down.code  ) {
					gm.keys.down.press = true;
					// event.preventDefault();
				}
				//S left 
				if ( event.which == gm.keys.left.code ) {
					gm.keys.left.press = true;
					// event.preventDefault();
				}
				//D right
				if ( event.which == gm.keys.right.code  ) {
					gm.keys.right.press = true;
					// event.preventDefault();
				}
			};
			
		});
		$( window ).keyup(function( event ) {
			gm.keys.active = false;
			if (!gm.inputfocused) {
				//W up
				if ( event.which == gm.keys.up.code ) {
					gm.keys.up.press = false;
					gm.moveplayer('up');

					// event.preventDefault();
				}
				//A down
				if ( event.which == gm.keys.down.code ) {
					gm.keys.down.press = false;
					gm.moveplayer('down');

					// event.preventDefault();
				}
				//S left 
				if ( event.which == gm.keys.left.code ) {
					gm.keys.left.press = false;
					gm.moveplayer('left');

					// event.preventDefault();
				}
				//D right
				if ( event.which == gm.keys.right.code ) {
					gm.keys.right.press = false;
					gm.moveplayer('right');
					// event.preventDefault();
				}
			};
		});
	};
};

function moveplayer(direction) {
    var resetxlimit = resetxlimit;

    // ███╗   ███╗ ██████╗ ██╗   ██╗███████╗    ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗ 
    // ████╗ ████║██╔═══██╗██║   ██║██╔════╝    ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
    // ██╔████╔██║██║   ██║██║   ██║█████╗      ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
    // ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝      ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
    // ██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗    ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
    // ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝    ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝



    if (!gm.keys.disabled) {
        // get the current pos of player
        var newpos = gm.playerpos;

        // this switch case does not allow player to break through borders of the game while moving the player to a new position
        switch (direction) {
            case 'up':
                if (newpos > 8) {
                    newpos -= gm.ymove;
                } else {
                    gm.cntrlpos.up = false;
                }
                break;
            case 'down':
                if (newpos < (gm.totalkeys - 9)) {
                    newpos += gm.ymove;
                } else {
                    gm.cntrlpos.down = false;
                }
                break;
            case 'left':
                if (newpos > gm.playerxlimit.l) {
                    newpos--;

                } else {
                    setTimeout(function() {
                        $('.player').removeClass('bump-' + direction)
                    }, 200);
                    gm.cntrlpos.left = false;

                };
                break;
            case 'right':
                if (newpos < gm.playerxlimit.r) {
                    newpos++;

                } else {

                    setTimeout(function() {
                        $('.player').removeClass('bump-' + direction)
                    }, 200);

                    gm.cntrlpos.right = false;
                }
                break;
        }

        //check if player can move to the new tile
        if (!$('.tile').eq(newpos).hasClass('blocker')) {

            gm.playerpos = newpos;

            resetxlimit(newpos);

        } else {

            $('.player').addClass('bump-' + direction)
            setTimeout(function() {
                $('.player').removeClass('bump-' + direction)
            }, 200);
            gm.cntrlpos[direction] = false;

        }

        $('.player').removeClass('player')
        $(gm.lastcolor).removeClass('set' + gm.lastcolor);

        $player = $('.tile').eq(gm.playerpos);

        $player.addClass('player');

        //if tile player is moving to has a lifepoint, add to the life bar
        if ($('.player').hasClass('lifepoint')) {
            // console.log('firing')
            gm.riselife();
        }

        gm.drawcntrls();

    };

    function resetxlimit(pos) {
        // this makes sure that you can't move the player past the horizontal border of the grid
        _.each(gm.xarrays, function(o, i) {
            if (pos >= o[0] && pos <= o[1]) {
                gm.playerxlimit.l = o[0];
                gm.playerxlimit.r = o[1];
            };
        });

    };

};

function drawcntrls() {
    // this redraws the current player controls in the tiles surrounding the player
    _.each(gm.directions, function(o, i) {
        $('.tile .inner .text').removeClass(o);
    })

    _.each(gm.cntrlpos, function(o, i, x) {
        switch (i) {
            case 'up':
                o = (gm.playerpos - gm.ymove)
                break;
            case 'down':
                o = (gm.playerpos + gm.ymove)
                break;
            case 'left':
                // o = (gm.playerpos -1)
                if (gm.playerpos > gm.playerxlimit.l) {
                    o = (gm.playerpos - 1)
                } else {
                    o = false
                }
                break;
            case 'right':
                if (gm.playerpos < gm.playerxlimit.r) {
                    o = (gm.playerpos + 1)
                } else {
                    o = false
                }
                break;
        }
        if (o) {
            $('.tile').eq(o).find(' .inner .text').addClass(i)
        }
    })

    _.each(gm.directions, function(o, i) {
        $('.tile .inner .text.' + o).html(gm.keys[o].letter);
    })

};

function riselife() {
    // console.log('riselife!', $('.life').not('.life.full').last())
    $('.life').not('.life.full').last().addClass('full');
    $('.player').removeClass('lifepoint');

    gm.score ++;
    console.log(gm.score, gm.highscore);
    if ( gm.score >= gm.highscore) {
        gm.highscore = gm.score;
        localStorage.setItem("cybersprinterscore", JSON.stringify(gm.score));
        $('#highscore').html(gm.score);

    };
    $('#score').html(gm.score);

}


function resetgame() {
    // ██████╗ ███████╗███████╗███████╗████████╗
    // ██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝
    // ██████╔╝█████╗  ███████╗█████╗     ██║   
    // ██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║   
    // ██║  ██║███████╗███████║███████╗   ██║   
    // ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝  

    // this resets the game

    //remove all blockers and lifepoints
    $('.lifepoint').removeClass('lifepoint')
    $('.blocker').removeClass('blocker');

    gm.nulltiles = [];
    gm.playerpos = 76;
    gm.moveplayer();

    gm.keys = {
        'active': false,
        'disabled': false,
        'up': {
            'letter': 'W',
            'code': 87,
            'press': false
        },
        'down': {
            'letter': 'S',
            'code': 83,
            'press': false
        },
        'left': {
            'letter': 'A',
            'code': 65,
            'press': false
        },
        'right': {
            'letter': 'D',
            'code': 68,
            'press': false
        }
    }
    gm.drawcntrls();
    var setdelay = function(i) {
        setTimeout(function() {
            $('#life' + i).addClass('full')
        }, 100 * i)

    }
    for (var i = 0; i < 10; i++) {
        setdelay(i);
    };

    $('.overlay').removeClass('fadeout');
    $('.end').addClass('active');
    gm.state = 'pause';

    setTimeout(function() {
        $('.overlay').addClass('fadeout');
        $('.end').removeClass('active');
        gm.state = 'play';


    }, 2000);
};



function draw  (argument) {
	var cyclebg = cyclebg,
		resetcodes = resetcodes,
		drawlifepoint = drawlifepoint,
		movegrid = movegrid;


	gm.framecount = frameRunner.frameCount();

	if (gm.framecount >= gm.droplife && gm.state === "play" && gm.framecount > 500) {
		lowerlife();
	};

	if (gm.framecount >= gm.resetkeyint && gm.state === "play") {
		resetcodes();
		drawlifepoint();
	};

	if (gm.framecount === gm.resetgridint && gm.state === "play") {
		movegrid();
		cyclebg();
	}else if(gm.framecount === gm.resetgridint ){
		cyclebg();
	}

	function drawlifepoint () {
		// console.log('running drawlifepoint', $('.lifepoint').length)
		var nonblockers = [];
		//clear all lifepoints

		if ($('.lifepoint').length == 2) {
			$('.lifepoint').eq(1).removeClass('lifepoint');
		}
		

		for (var i = gm.totalkeys; i >= 0; i--) {
			var tile = $('.tile').eq(i);
			if (!tile.hasClass('blocker') && !tile.hasClass('player') && !tile.hasClass('lifpoint')) {
				nonblockers.push(i)
			}
		};
		var tileindex = _.random(0, (nonblockers.length - 1)) 
		$('.tile').eq(nonblockers[tileindex]).addClass('lifepoint');		
		
	}

	

	function lowerlife () {
		console.log('lower');
		$('.life.full').eq(0).removeClass('full');
		if ($('.life.full').length === 0) {
			gm.resetgame();
		};
		gm.droplife = gm.droplife + 200;
	}

	function cyclebg(){
		var mdletters = ['ba','bb','bc','bd','be']
		_.each(mdletters, function(o,i){
			$('.tile').removeClass(o);
		})

		for (var i = 0; i < gm.totalkeys; i++) {
			var randletter =  mdletters[ _.random(0, (mdletters.length - 1)) ];
			$('.tile').eq(i).addClass( randletter);
		};

		gm.resetgridint = gm.resetgridint + gm.blockspeed;
	};

	function movegrid() {
		var ispastmid = false;
		var movedown = movedown;

		// ███╗   ███╗ ██████╗ ██╗   ██╗███████╗     ██████╗ ██████╗ ██╗██████╗ 
		// ████╗ ████║██╔═══██╗██║   ██║██╔════╝    ██╔════╝ ██╔══██╗██║██╔══██╗
		// ██╔████╔██║██║   ██║██║   ██║█████╗      ██║  ███╗██████╔╝██║██║  ██║
		// ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝      ██║   ██║██╔══██╗██║██║  ██║
		// ██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗    ╚██████╔╝██║  ██║██║██████╔╝
		// ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝ 

		_.each(gm.nulltiles,function(o,i){
			// if any o f the blockers are past the midpoint of the grid, set past mid
			if(o > 31 && !ispastmid){
				ispastmid = true;
			}
		})
		if (gm.nulltiles.length === 0 || ispastmid) {
			//if there are no blockers or blockers are past the midpoint then create a new blocker

			for (var i = _.random(0,7); i >= 0; i--) {
				var push =  _.random(0,1);
				if (push) {
					gm.nulltiles.push( i )
				};
			};

			_.each(gm.nulltiles,function(o,i){
				$('.tile').eq(o).addClass('blocker ');
			});
			
			movedown ();
			
		}else{ 
			
			movedown ();
		}
		if ( $('.player.blocker').length > 0 ) {
			//when a player is blocked they get pushed down one row
			gm.moveplayer("down");

			if (gm.playerpos > (gm.totalkeys - gm.ymove)) {
				gm.resetgame();
			};
		}

		function movedown () {
			//this moves all the blockers down

			$('.blocker').removeClass('blocker');
			
			_.each(gm.nulltiles,function(o,i){
				$('.tile').eq(o).addClass('blocker ');
			});

			var blockstoremove = [];
			_.each(gm.nulltiles,function(o,i){
				gm.nulltiles[i] = o + gm.ymove;
				if (gm.nulltiles[i] >= gm.totalkeys + 1) {
					blockstoremove.push(i)
				};
			});

			_.each(blockstoremove,function(o,i){
				gm.nulltiles.splice(o, 1);
			})
		}
	};


	function resetcodes() {
		console.log('reset code');

	// ██████╗ ███████╗███████╗███████╗████████╗    ██╗  ██╗███████╗██╗   ██╗███████╗
	// ██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝    ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝
	// ██████╔╝█████╗  ███████╗█████╗     ██║       █████╔╝ █████╗   ╚████╔╝ ███████╗
	// ██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║       ██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║
	// ██║  ██║███████╗███████║███████╗   ██║       ██║  ██╗███████╗   ██║   ███████║
	// ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝
	                                                                              
		// this color from list and remove any remaining colors from tiles. add color class to player-----------------------------------------------

		
		var setkey = setkey;
		// var animatekey = animatekey;
		var newcolor = _.random( 0, gm.playercolors );
		var direction = gm.directions[_.random(0,3)],
			//select a direction at random 
			keytochange = gm.keys[ direction ],
			//swap the code for the direction with a random code from the key array - > gm.keycodes
			randomkeyindex =  _.random(0,gm.keycodes.length - 1),
			isrepeat = _.where(gm.keys, {letter: gm.keycodes[ randomkeyindex ].letter} || {code: gm.keycodes[ randomkeyindex ].code} );

		for (var i = 0; i < gm.playercolors + 1; i++) {
			$('.gamewrapper').removeClass('set'+i);
			if ($('.tile.set'+i)) {
				gm.lastcolor =  i;
				$('.tile.set'+i).removeClass('set'+i);
			};
		};

		gm.lastcolor =  newcolor;
		$('.gamewrapper').addClass('set'+newcolor);
		setkey();

		// this resets intval for new code switch

		gm.resetkeyint = gm.resetkeyint + gm.blockspeed + 300;

		
		for (var i = 0; i < 50; i++) { 
            if (i < 49) {
                
                setTimeout(function() {
                    var randomletter = gm.keycodes[  _.random( 0, gm.keycodes.length - 1) ].letter;
                    $('.tile .inner .text.'+direction).html(randomletter)
                }, 10*i)  
            }else{
                setTimeout(function() {
                    console.log('t1est');
                    _.each(gm.directions, function(o,i){
                        $('.tile .inner .text.'+o).html(gm.keys[o].letter);
                    })
                }, 10*i)
            }   
                      
        }

		$('.tile .inner .text.'+direction).addClass("glitch")
		setTimeout(function() {
			$('.tile .inner .text.'+direction).removeClass("glitch")
		}, 1000);


		function setkey(){
			// this checks if the new code is being used
			if (isrepeat.length > 0) {
				randomkeyindex =  _.random(0,gm.keycodes.length - 1);
				isrepeat = _.where(gm.keys, {letter: gm.keycodes[ randomkeyindex ].letter});
				setkey();
			}else{
				keytochange.letter = gm.keycodes[ randomkeyindex ].letter;
				keytochange.code = gm.keycodes[ randomkeyindex ].code;
				return;
			}
		}
	};

};
