let scene, camera, renderer,controls;
let geometry1, material1;
let geometry2, material2;
let geometry3=[],material3=[];
let cube=[],points=[]
let angles=[],vectors=[];
let lines=[];
let frameCount = 0;
let params = {
	size:3,
	offset: 0.1,
	offsetSpeed: 0.2,
	c:5,
	r:5,
	h:3,
};

let gui = new dat.GUI();
gui.add(params, 'size', 1, 100);
gui.add(params, 'offset', 0.05, 1);
gui.add(params, 'c', 1, 20);
gui.add(params, 'r', 1, 20);
gui.add(params, 'h', 1, 20);

//setup
init();
function init(){
  //create scene
  scene = new THREE.Scene();
  let fov = 100;
  let aspect = window.innerWidth / window.innerHeight;
  let near = 0.1;
  let far = 100;
  camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
  camera.position.set(0,0,params.size*params.h*2);

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera,renderer.domElement);

  //create the cube
  geometry1 = new THREE.BoxGeometry( params.size,params.size,params.size );
  var color = new THREE.Color(5,5,5);
  material1 = new THREE.MeshPhongMaterial( {
    color: color ,
    opacity:0.05,
    transparent: true,
    wireframe: true
  } ); //surface

  geometry2 = new THREE.Geometry();
  geometry2.vertices.push(new THREE.Vector3());
  material2 = new THREE.PointsMaterial( {
    color: 0xffff00,
    size:0.06,
    opacity:1,
    transparent:true,
    blending:THREE.AdditiveBlending
  } ); //surface

  class Particle{
    constructor(x,y,z){
      this.point = new THREE.Points(geometry2,material2);
      // this.index = index;
      this.pos = new THREE.Vector3(x,y,z);
			this.initPos = new THREE.Vector3(x,y,z);
      this.vel = new THREE.Vector3();
      this.acc = new THREE.Vector3();
      this.maxSpeed = 0.01;
      this.maxSteer = 0.1;
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
      this.acc.multiplyScalar(0);
      this.reappear();
      this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
    }
		reappear(){
			// if(this.pos.x > params.size*params.c||this.pos.x < 0||this.pos.y > params.size*params.r||this.pos.y < 0||this.pos.z > params.size*params.h||this.pos.z < 0){
      //   // this.pos.x = this.initPos.x;
			// 	// this.pos.y = this.initPos.y;
			// 	// this.pos.z = this.initPos.z;
			// 	this.pos.x = Math.random()*params.size*params.c;
			// 	this.pos.y = Math.random()*params.size*params.r;
			// 	this.pos.z = Math.random()*params.size*params.h;
      // }
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
    flow(desiredVel){
      desiredVel.setLength(this.maxSpeed);
      let steerForce = new THREE.Vector3();
      steerForce.subVectors(desiredVel,this.vel);
			steerForce.multiplyScalar(100);
			steerForce.clampLength(0,this.maxSteer);
      this.applyForce(steerForce);
    }
  }



  //position
  for(let k=0;k<params.h;k++){
    for(let j=0;j<params.r;j++){
      for(let i=0;i<params.c;i++){
				let index = k*params.r*params.c+j*params.c+i;
        cube.push(new THREE.Mesh(geometry1, material1));
        cube[index].position.set(i*params.size, j*params.size, k*params.size);
        scene.add(cube[index]);

        angles.push(new THREE.Euler(1,1,1));
				vectors.push(new THREE.Vector3());

				let g = new THREE.Geometry();
				g.vertices.push(new THREE.Vector3(), new THREE.Vector3(1,1,1));
				g.translate(i*params.size,j*params.size,k*params.size);
				geometry3.push(g);
				material3.push(new THREE.LineBasicMaterial( {
					color: 0xff0000,
					linewidth: 0.1,
					opacity:0.5,
					transparent:true
				} )); //surface
				lines.push(new THREE.Line(geometry3[index],material3[index]));
				scene.add(lines[index]);

				// let p = new Particle(i*params.size,j*params.size,k*params.size);
				// p.init();
				// points.push(p);
      }
    }
  }

	for(let i=0; i<1000; i++){
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
}

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
  for(let k=0;k<params.h;k++){
    for(let j=0;j<params.r;j++){
      for(let i=0;i<params.c;i++){
        index = k*params.r*params.c+j*params.c+i;
        let x = i*params.size;
        let y = j*params.size;
        let z = k*params.size;

				//get noise
        let randomness = 0.008;
        let fluctSpeed = 1;
        let freqX = (x+frameCount * fluctSpeed)*randomness;
        let freqY = (y+frameCount * fluctSpeed)*randomness;
        let freqZ = (z+frameCount * fluctSpeed)*randomness;
        let noise = PerlinNoise.noise(x+params.offset,y+params.offset,freqZ+params.offset)*Math.PI*2;
				let angle = angles[index]; angle.set(Math.cos(noise),Math.sin(noise),Math.cos(noise));
				let noiseVec = new THREE.Vector3();
				noiseVec = angle.toVector3();
				noiseVec.clampLength(0,params.size/2);
				vectors[index] = noiseVec;
				lines[index].geometry.vertices[1].addVectors(lines[index].geometry.vertices[0],noiseVec);
				lines[index].geometry.verticesNeedUpdate = true;
      }
    }
  }
  for(let i=0;i<points.length;i++){
    p = points[i];
    let ix = Math.floor(p.pos.x/params.size);
    let iy = Math.floor(p.pos.y/params.size);
    let iz = Math.floor(p.pos.z/params.size);
    let vecIndex = ix+iy*params.c+iz*params.c*params.r;
    if(vecIndex<vectors.length){
      p.flow(vectors[vecIndex]);
    }
    p.update();
  }

  //frameCount
  let t = performance.now()*0.001;
  let x = Math.sin(t)*80;
  let z = Math.sin(t)*80;
  // pointlight.position.set( x, 0, z );
}
