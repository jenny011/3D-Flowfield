let scene, camera, renderer,controls;
let geometry1, material1;
let geometry3, material3;
let geometry2, material2;
let points=[],cube,obstacle;
let angles=[],vectors=[];
var analyser,context,src,dataArray,bufferLength;
let params = {
	music:false,
	rotation:false,
	obstacle:true,
	fluctSpeed: 0.01,
	randomness: 0.082,
	xLength:10,
	yLength:10,
	zLength:10,
	particleColor:"#22CCDD",
	particleOpacity:0.25,
	obstacleColor:"#FFFFFF",
};

let gui = new dat.GUI();
gui.add(params, 'music');
gui.add(params, 'rotation');
gui.add(params, 'obstacle');
gui.add(params, 'fluctSpeed', 0.003, 0.03);
gui.add(params, 'randomness', 0, 0.1);
gui.add(params, 'xLength', 7, 15,1);
gui.add(params, 'yLength', 7, 15,1);
gui.add(params, 'zLength', 7, 15,1);

// //initialise simplex noise instance
// var noise = new SimplexNoise();

// the main visualiser function
///////debugger------------------////////////--------------------///////////

///////------------------////////////--------------------///////////


	scene = new THREE.Scene();
	let fov = 100;
	let aspect = window.innerWidth / window.innerHeight;
	let near = 0.1;
	let far = 100;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set(0,0,0);
	camera.lookAt(scene.position);

	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create an Audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 'audio/話がしたいよ.mp3', function( buffer ) {
		//Claude Debussy - La fille aux cheveux de lin
		sound.setBuffer( buffer );
		sound.setLoop(true);
		sound.setVolume(0.5);
		if(params.music==true){
			sound.play();
		}
	});

	// create an AudioAnalyser, passing in the sound and desired fftSize
	var analyser = new THREE.AudioAnalyser( sound, 512 );

	//renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	controls = new THREE.OrbitControls(camera,renderer.domElement);

	// geometry1 = new THREE.BoxGeometry( 0.5*params.xLength ,0.5*params.xLength ,0.5*params.xLength );
	// var color = new THREE.Color(5,5,5);
	// material1 = new THREE.MeshPhongMaterial( {
	// 	color: color ,
	// 	opacity:0.5,
	// 	transparent: true,
	// 	wireframe: true
	// } );
	// cube = new THREE.Mesh(geometry1, material1);
	// cube.position.set(0.5*params.xLength/2, 0.5*params.xLength/2 , 0.5*params.xLength/2);
	// scene.add(cube);

	geometry3 = new THREE.SphereGeometry( 0.3, 10, 10 );
	material3 = new THREE.MeshPhongMaterial( {
	  color: 0xFFFFFF,
	  // wireframe: true,
	  transparent: true,
	  opacity: 0.9
	} );

	geometry2 = new THREE.Geometry();
	geometry2.vertices.push(new THREE.Vector3());
	material2 = new THREE.PointsMaterial( {
	  color: 0x22CCDD,
	  size:0.06,
	  opacity:0.3,
	  transparent:true,
	  blending:THREE.AdditiveBlending
	} );

	gui.addColor(params, "particleColor").onChange(handleColorChange(material2.color));
	gui.add(params, "particleOpacity",0.1,0.5);
	gui.addColor(params, "obstacleColor").onChange(handleColorChange(material3.color));

	//<-------classes------->
	class Particle{
	  constructor(x,y,z){
	    this.point = new THREE.Points(geometry2,material2);
	    this.pos = new THREE.Vector3(x,y,z);
	    this.vel = new THREE.Vector3();
	    this.acc = new THREE.Vector3();
	    this.maxSpeed = 0.05;
			this.maxSteer = 0.005;
	    this.maxSteerForce = 0.008;
			this.avoidArea = 0.4;
	  }
	  init(){
			this.point.geometry.dynamic = true;
			this.point.geometry.verticesNeedUpdate = true;
			this.point.geometry.colorNeedUpdate = true;
	    this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
	    scene.add(this.point);
	  }
	  update(){
	    this.vel.add(this.acc);
	    this.pos.add(this.vel);
	    this.acc.set(0,0,0);
	  }
		reappear(){
			if(this.pos.x > 0.5*params.xLength){
				this.pos.x = Math.random();
			}
			if(this.pos.x < 0){
				this.pos.x = 0.5*params.xLength-Math.random();
			}
			if(this.pos.y > 0.5*params.yLength){
				this.pos.y = Math.random();
			}
			if(this.pos.y < 0){
				this.pos.y = 0.5*params.yLength-Math.random();
			}
			if(this.pos.z > 0.5*params.zLength){
				this.pos.z = Math.random();
			}
			if(this.pos.z < 0){
				this.pos.z = 0.5*params.zLength-Math.random();
			}
		}
	  applyForce(force){
	    let f = force.clone();
	    this.acc.add(f);
	  }
		avoidObstacle(obstacle){
	    let desired = new THREE.Vector3().subVectors(obstacle.pos, this.pos);
	    let distance = desired.length();
	    if (distance < this.avoidArea + obstacle.size) {
	      let s = distance/(this.avoidArea + obstacle.size)*(-0.008);
	      desired.multiplyScalar(s*1/distance);
	      let steer = new THREE.Vector3().subVectors(desired, this.vel);
	      steer.clampLength(0,this.maxSteerForce);
	      this.applyForce(steer);
		  }
		}
	  flow(desiredVel){
	    desiredVel.setLength(this.maxSpeed);
	    let steerForce = new THREE.Vector3();
	    steerForce.subVectors(desiredVel,this.vel);
			steerForce.multiplyScalar(100);
			steerForce.clampLength(0,this.maxSteer);
	    this.applyForce(steerForce);
	  }
		show(){
			this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
		}
	}

	class Obstacle{
		constructor(x,y,z){
	    this.sphere = new THREE.Mesh(geometry3,material3);
	    this.pos = new THREE.Vector3(x,y,z);
	    this.vel = new THREE.Vector3();
	    this.acc = new THREE.Vector3();
			this.size = geometry3.parameters.radius;
	  }
	  init(){
			this.sphere.geometry.dynamic = true;
			this.sphere.geometry.verticesNeedUpdate = true;
			this.sphere.geometry.needUpdate = true;
	    this.sphere.position.set(this.pos.x,this.pos.y,this.pos.z);
	    scene.add(this.sphere);
	  }
	}

	//<----init---->
	obstacle = new Obstacle(0.5*5,0.5*5,0.5*5);
	obstacle.init();


	//position
	for(let i=0; i<3000; i++){
		let p = new Particle(Math.random()*0.5*params.xLength,Math.random()*0.5*params.yLength,Math.random()*0.5*params.zLength);
		p.init()
		points.push(p);
	}

	//<-----light----->
	// let light;
	// light = new THREE.AmbientLight(0xffffff);
	// scene.add(light);
	let pointlight1;
	pointlight1 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight1.position.set( 0, params.yLength/4, params.zLength/4 );
	scene.add( pointlight1 );
	let pointlight2;
	pointlight2 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight2.position.set( params.xLength, params.yLength/4, params.zLength/4 );
	scene.add( pointlight2 );
	let pointlight3;
	pointlight3 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight3.position.set( params.xLength/4, 0, params.zLength/4 );
	scene.add( pointlight3 );
	let pointlight4;
	pointlight4 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight4.position.set( params.xLength/4, params.yLength, params.zLength/4 );
	scene.add( pointlight4 );
	let pointlight5;
	pointlight5 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight5.position.set( params.xLength/4, params.yLength/4, 0 );
	scene.add( pointlight5 );
	let pointlight6;
	pointlight6 = new THREE.PointLight( 0xffffff, 0.5, 100 );
	pointlight6.position.set( params.xLength/4, params.yLength/4, params.zLength );
	scene.add( pointlight6 );

	//start animation
	animate();


//--------------------draw--------------------
function animate() {
	requestAnimationFrame( animate ); //call itself after rendering everything
  render();
	renderer.render( scene, camera );
}

//*******************sketch********************
var fn = 'simplex';
var frameCount = 0;
var noiseOffset = Math.random()*100;
var data1Avg = analyser.getAverageFrequency();
function render(){
	if(params.music==true){
		if(!sound.isPlaying){
			sound.play();
		}
	}else{
		if(sound.isPlaying){
			sound.pause();
		}
	}
		data1Avg = analyser.getAverageFrequency()/255;

	material2.opacity = params.particleOpacity;
	frameCount ++ ;
	if(params.obstacle==true){
		scene.add(obstacle.sphere);
	}else{
		scene.remove(obstacle.sphere);
	}

	controls.update();
	controls.target.set(0.5*params.xLength/2,0.5*params.yLength/2,0.5*params.zLength/2);

	var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;

	//<---------------flowfield--------------->
  for(let i=points.length-1;i>=0;i--){
		let  p = points[i],freqX,freqY,freqZ;
		//get noise
		if(params.music == true){
			freqX = (p.pos.x+frameCount * data1Avg/8)*params.randomness;
	    freqY = (p.pos.y+frameCount * data1Avg/8)*params.randomness;
	    freqZ = (p.pos.z+frameCount * data1Avg/8)*params.randomness;
		}else{
			freqX = (p.pos.x+frameCount * params.fluctSpeed)*params.randomness;
	    freqY = (p.pos.y+frameCount * params.fluctSpeed)*params.randomness;
	    freqZ = (p.pos.z+frameCount * params.fluctSpeed)*params.randomness;
		}
		let angle,noise;
		noise = noisefn(freqX,freqY,freqZ)*Math.PI*2;
		// noise = noisefn(p.pos.x*params.randomness,p.pos.y*params.randomness,p.pos.z*params.randomness+noiseOffset+frameCount*params.fluctSpeed)*Math.PI*2;//from example code
		angle = new THREE.Euler(noise,noise,noise);
		let noiseVec = new THREE.Vector3(1,1,1);
		noiseVec.applyEuler(angle);
		noiseVec.clampLength(0,1/2);
    p.flow(noiseVec);
		if(params.obstacle == true){
			p.avoidObstacle(obstacle);
		}
		p.reappear();
    p.update();
		p.show();
  }
	if(params.rotation==true){
		scene.rotation.y += 0.01;
		scene.rotation.z += 0.01;
		scene.rotation.x += 0.01;
	}
}

	function handleColorChange( color ) {
		return function ( value ) {
			if ( typeof value === 'string' ) {
				value = value.replace( '#', '0x' );
			}
			color.setHex( value );
		};
	}


document.addEventListener('keydown',keyPressed,false);
function keyPressed(event){
	let x = Math.random()*params.xLength/2.5;
	let y = Math.random()*params.yLength/2.5;
	let z = Math.random()*params.zLength/2.5;
	obstacle.pos.set(x,y,z);
	obstacle.sphere.position.set(x,y,z);
	let r = (Math.random()+1)*0.2;
	obstacle.sphere.size = r;
	obstacle.sphere.scale.set(r/obstacle.sphere.geometry.parameters.radius,r/obstacle.sphere.geometry.parameters.radius,r/obstacle.sphere.geometry.parameters.radius);
}
function avg(array){
	var sum = 0;
	for(let i=0;i<array.length;i++){
		sum += array[i]
	}
  return (sum / array.length);
}

function max(array){
	var maximum = array[0];
	for(let i=1;i<array.length;i++){
		maximum = Math.max(maximum,array[i]);
	}
	return maximum;
}

function min(array){
	var minimum = array[0];
	for(let i=1;i<array.length;i++){
		minimum = Math.min(minimum,array[i]);
	}
	return minimum;
}
