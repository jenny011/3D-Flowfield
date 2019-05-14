let scene, camera, renderer,controls;
let geometry1, material1;
let geometry3, material3;
let geometry2, material2;
let points=[],cube,obstacle;
let angles=[],vectors=[];
let frameCount = 0;
let params = {
	size:0.5,
	offset: 1,
	offsetSpeed: 0.2,
	c:10,
	r:10,
	h:10,
};

let gui = new dat.GUI();
gui.add(params, 'size', 0.5,3);
gui.add(params, 'offset', 0.05, 1);
gui.add(params, 'c', 5, 10);
gui.add(params, 'r', 5, 10);
gui.add(params, 'h', 5, 10);

//setup
// init();
// function init(){
  //create scene
  scene = new THREE.Scene();
  let fov = 100;
  let aspect = window.innerWidth / window.innerHeight;
  let near = 0.1;
  let far = 100;
  camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set(0,0,params.size*params.h);

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera,renderer.domElement);

	geometry1 = new THREE.BoxGeometry( params.size*params.c ,params.size*params.c ,params.size*params.c );
	var color = new THREE.Color(5,5,5);
	material1 = new THREE.MeshPhongMaterial( {
		color: color ,
		opacity:0.5,
		transparent: true,
		wireframe: true
	} );
	cube = new THREE.Mesh(geometry1, material1);
	cube.position.set(params.size*params.c/2, params.size*params.c/2 , params.size*params.c/2);
	scene.add(cube);

	geometry3 = new THREE.SphereGeometry( 0.5, 10, 10 );
	material3 = new THREE.MeshPhongMaterial( {
	  color: 0xffffff,
	  // wireframe: true,
	  transparent: true,
	  opacity: 0.9
	} );
 	// obstacle = new THREE.Mesh( geometry3, material3 );
	// obstacle.position.set(params.size*params.c/2, params.size*params.c/2, params.size*params.c/2);
	// scene.add(obstacle);

  geometry2 = new THREE.Geometry();
  geometry2.vertices.push(new THREE.Vector3());
  material2 = new THREE.PointsMaterial( {
    color: 0xff3333,
    size:0.06,
    opacity:0.5,
    transparent:true,
    blending:THREE.AdditiveBlending
  } );

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
      this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
      scene.add(this.point);
    }
    update(){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.set(0,0,0);
    }
		reappear(){
			if(this.pos.x > params.size*params.c){
				this.pos.x = Math.random();
			}
			if(this.pos.x < 0){
				this.pos.x = params.size*params.c-Math.random();
			}
			if(this.pos.y > params.size*params.r){
				this.pos.y = Math.random();
			}
			if(this.pos.y < 0){
				this.pos.y = params.size*params.r-Math.random();
			}
			if(this.pos.z > params.size*params.h){
				this.pos.z = Math.random();
			}
			if(this.pos.z < 0){
				this.pos.z = params.size*params.h-Math.random();
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
      this.sphere.position.set(this.pos.x,this.pos.y,this.pos.z);
      scene.add(this.sphere);
    }
	}

	obstacle = new Obstacle(params.size*5,params.size*5,params.size*5);
	obstacle.init();


  //position
	for(let i=0; i<3000; i++){
		let p = new Particle(Math.random()*params.size*params.c,Math.random()*params.size*params.r,Math.random()*params.size*params.h);
		p.init()
		points.push(p);
	}




  //light
  let light;
  light = new THREE.AmbientLight(0xffffff);
  scene.add(light);
  //start animation
  animate();
// }

//--------------------draw--------------------
function animate() {
	requestAnimationFrame( animate ); //call itself after rendering everything
  render();
	renderer.render( scene, camera );
}

//*******************sketch********************
var fn = 'simplex';
function render(){
	var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;
  frameCount ++ ;

	//<------flowfield------>
  for(let i=points.length-1;i>=0;i--){
		let  p = points[i];
		let x = Math.ceil((p.pos.x)/params.size);
    let y = Math.ceil((p.pos.y)/params.size);
    let z = Math.ceil((p.pos.z)/params.size);
				//get noise
        let randomness = 0.03;
        let fluctSpeed = 0.05;
        let freqX = (x+frameCount * fluctSpeed)*randomness;
        let freqY = (y+frameCount * fluctSpeed)*randomness;
        let freqZ = (z+frameCount * fluctSpeed)*randomness;
        let noise = (noisefn(freqX,freqY,freqZ)+1)*Math.PI*2;
 				let angle = new THREE.Euler(noise,noise,noise);
				// let angle = new THREE.Euler(1,1,1);
				let noiseVec = new THREE.Vector3(1,1,1);
				noiseVec.applyEuler(angle);
				noiseVec.clampLength(0,params.size/2);

    p.flow(noiseVec);
		p.avoidObstacle(obstacle);
		p.reappear();
    p.update();
		p.show();
  }

  //frameCount
  let t = performance.now()*0.001;
  let x = Math.sin(t)*80;
  let z = Math.sin(t)*80;
  // pointlight.position.set( x, 0, z );
}
