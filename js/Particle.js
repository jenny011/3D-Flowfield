class Particle{
  constructor(x,y,z,index){
    this.point = new THREE.Points(geometry2,material2);
    this.index = index;
    this.pos = new THREE.Vector3(x,y,z);
    this.vel = new THREE.Vector3();
    this.acc = new THREE.Vector3();
    this.maxSpeed = 0.1;
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
    if(this.pos.x > params.boxSize){
      this.pos.x = Math.random(params.boxSize);
    }
    if(this.pos.x < 0){
      this.pos.x = Math.random(params.boxSize);
    }
    if(this.pos.y > params.boxSize){
      this.pos.y = Math.random(params.boxSize);
    }
    if(this.pos.y < 0){
      this.pos.y = Math.random(params.boxSize);
    }
    if(this.pos.z > params.boxSize){
      this.pos.z = Math.random(params.boxSize);
    }
    if(this.pos.z < 0){
      this.pos.z = Math.random(params.boxSize);
    }
    this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
  }
  applyForce(force){
    let f = force.clone();
    this.acc.add(f);
  }
  fluctuate(){
    this.point.position.x = this.point.position.x + Math.sin((frameCount*0.05+this.index));
    this.point.position.y = this.point.position.y + Math.sin((frameCount*0.05+this.index));
    this.point.position.z = this.point.position.z + Math.sin((frameCount*0.05+this.index));
  }
  flow(angle){
    let desiredVel = angle.toVector3();
    desiredVel.clampLength(-this.maxSpeed,this.maxSpeed);
    let steerForce = new THREE.Vector3();
    steerForce.subVectors(desiredVel,this.vel);
    this.applyForce(steerForce);
  }
}
