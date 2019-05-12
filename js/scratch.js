// function Particle(x,y,z,index){
//     this.point = new THREE.Points(geometry2,material2);
//     this.index = index;
//     this.pos = new THREE.Vector3(x,y,z);
//     this.vel = new THREE.Vector3(0,0,0);
//     this.acc = new THREE.Vector3(0,0,0);
//   }
// Particle.prototype.init=function(){
//     this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
//     scene.add(this.point);
// }
// Particle.prototype.update=function(){
//     this.vel.add(this.acc);
//     this.pos.add(this.vel);
//     this.acc.multiplyScalar(0);
//     this.point.position.set(this.pos.x,this.pos.y,this.pos.z);
// }
// Particle.prototype.fluctuate=function(){
//   this.point.position.x = this.point.position.x + Math.sin((frameCount*0.05+this.index));
//   this.point.position.y = this.point.position.y + Math.sin((frameCount*0.05+this.index));
//   this.point.position.z = this.point.position.z + Math.sin((frameCount*0.05+this.index));
// }




// for(let i=0; i<c*r*h; i++){
//   cube.push(new THREE.Mesh(geometry1, material1));
//   scene.add(cube[i]);
//   // points.push(new THREE.Points(geometry2,material2));
//   points.push(new Particle(0,0,0));
//   points[i].init();
//   // scene.add(points[i]);
// }
// b.applyEuler(a);

// geometry2 = new THREE.SphereGeometry( 3, 10, 10 );
// material2 = new THREE.MeshPhongMaterial( {
//   color: 0xffffff,
//   // wireframe: true,
//   transparent: true,
//   opacity: 0.9
// } );
// sphere = new THREE.Mesh( geometry2, material2 );
// scene.add( sphere );
