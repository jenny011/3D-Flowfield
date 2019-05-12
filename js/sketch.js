let scene, camera, renderer,controls;
let geometry1, material1;
let geometry2, material2;
let cube=[],points=[],angles=[];
let c=5,r=5,h=5;
let size = 3;
let frameCount = 0;
let params = {
	boxSize: (c-1)*size,
	noiseScale: 0.10,
	noiseSpeed: 0.009,
	noiseStrength: 0.08,
	noiseFreeze: false,
	particleCount: 3000,
	particleSize: 0.22,
	particleSpeed: 0.1,
	particleDrag: 0.9,
	particleColor: 0x41a5ff, //0x41a5ff, 0xff6728
	bgColor: 0x000000,
	particleBlending: THREE.AdditiveBlending
};

let gui = new dat.GUI();

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
  camera.position.set(0,0,10*size);

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  controls = new THREE.OrbitControls(camera,renderer.domElement);

  //create the cube
  geometry1 = new THREE.BoxGeometry( size,size,size );
  var color = new THREE.Color(5,5,5);
  material1 = new THREE.MeshPhongMaterial( {
    color: color ,
    opacity:0.02,
    transparent: true
    // wireframe: true
  } ); //surface

  geometry2 = new THREE.Geometry();
  geometry2.vertices.push(new THREE.Vector3());
  material2 = new THREE.PointsMaterial( {
    color: 0xffffff,
    size:0.1,
    // opacity:0.8,
    // transparent:true,
    blending:THREE.AdditiveBlending
  } ); //surface

  class Particle{
    constructor(x,y,z){
      this.point = new THREE.Points(geometry2,material2);
      // this.index = index;
      this.pos = new THREE.Vector3(x,y,z);
      this.vel = new THREE.Vector3();
      this.acc = new THREE.Vector3();
      this.maxSpeed = 0.15;
      this.maxSteer = 0.01;
    }
    init(){
      this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
      scene.add(this.point);
    }
    update(){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.multiplyScalar(0);
      // if(this.pos.x > params.boxSize){
      //   this.pos.x = Math.random()*size;
      // }
      // if(this.pos.x < 0){
      //   this.pos.x = params.boxSize+Math.random()*size;
      // }
      // if(this.pos.y > params.boxSize){
      //   this.pos.y = Math.random()*size;
      // }
      // if(this.pos.y < 0){
      //   this.pos.y = params.boxSize+Math.random()*size;
      // }
      // if(this.pos.z > params.boxSize){
      //   this.pos.z = Math.random()*size;
      // }
      // if(this.pos.z < 0){
      //   this.pos.z = params.boxSize+Math.random()*size;
      // }
      this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
    }
    applyForce(force){
      let f = force.clone();
      this.acc.add(f);
    }
    flow(angle){
      let desiredVel = angle.toVector3();
      desiredVel.clampLength(-this.maxSpeed,this.maxSpeed);
      let steerForce = new THREE.Vector3();
      steerForce.subVectors(desiredVel,this.vel);
      this.applyForce(steerForce);
    }
  }



  //position
  for(let k=0;k<h;k++){
    for(let j=0;j<r;j++){
      for(let i=0;i<c;i++){
        cube.push(new THREE.Mesh(geometry1, material1));
        cube[k*r*c+j*c+i].position.set(i*size, j*size, k*size);
        scene.add(cube[k*r*c+j*c+i]);

        angles.push(new THREE.Euler(1,1,1));

				let p = new Particle(i*size,j*size,k*size);
				p.init()
				points.push(p);
      }
    }
  }

  // for(let i=0; i<1000; i++){
  //     points.push(new Particle(Math.random()*params.boxSize, Math.random()*params.boxSize, Math.random()*params.boxSize));
  //     points[i].init();
  // }

  //light
  let light;
  light = new THREE.AmbientLight(0xffffff);
  scene.add(light);
  //start animation
  animate();
}

//draw
function animate() {
	requestAnimationFrame( animate ); //call itself after rendering everything
  render();
	renderer.render( scene, camera );
}

//sketch
var fn = 'simplex';
function render(){
	var noisefn = fn === 'simplex' ? noise.simplex3 : noise.perlin3;
  frameCount ++ ;
  // scene.rotation.y += 0.01;
  for(let k=0;k<h;k++){
    for(let j=0;j<r;j++){
      for(let i=0;i<c;i++){
        index = k*r*c+j*c+i;
        let x = i*size;
        let y = j*size;
        let z = k*size;
        let randomness = 0.008;
        let fluctSpeed = 0.9;
        let freqX = (x+frameCount * fluctSpeed)*randomness;
        let freqY = (y+frameCount * fluctSpeed)*randomness;
        let freqZ = (z+frameCount * fluctSpeed)*randomness;
        noiseVal = noisefn(freqX+0.02,freqY+0.05,freqZ);
				angles[index].set(Math.PI*2*(noiseVal+1),Math.PI*2*(noiseVal+1),Math.PI*2*(noiseVal+1));
      }
    }
  }
  for(let i=0;i<points.length;i++){
    p = points[i];
    let ix = Math.floor(p.pos.x/size);
    let iy = Math.floor(p.pos.y/size);
    let iz = Math.floor(p.pos.z/size);
    let angleIndex = ix+iy*c+iz*c*r;
    if(angleIndex<angles.length){
      p.flow(angles[angleIndex]);
    }
    p.update();
  }

  //frameCount
  let t = performance.now()*0.001;
  let x = Math.sin(t)*80;
  let z = Math.sin(t)*80;
  // pointlight.position.set( x, 0, z );
}
