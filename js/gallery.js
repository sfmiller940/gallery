"use strict"
window.onload = function(){

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 1, 1000); 
  camera.position.y = -250; 
  camera.position.z = 400; 
  camera.rotation.x = 45 * (Math.PI / 180); 

  var scene = new THREE.Scene();
  scene.add(camera);

  var numImages = 12;
  var images = [];
  THREE.TextureLoader.prototype.crossOrigin = '';
  var loader = new THREE.TextureLoader();

  for(let i = 0; i<numImages; i++){
    loader.load(
      'https://unsplash.it/1024/512/?random',
      function ( texture ) {
        var img = new THREE.MeshBasicMaterial( {
          map: texture
        });
        images[i] = new THREE.Mesh(new THREE.PlaneGeometry(1024, 512),img);
        images[i].minFilter = THREE.LinearFilter;
        images[i].overdraw = true;
        scene.add(images[i]);
      },
      function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function ( xhr ) {
        console.log( 'An error happened' );
      }
    );
  }

  var ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  renderer.render(scene,camera);

  // Camera controls
  var controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );

  var render = function () {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame( render );
  }
  render();

  window.addEventListener( 'resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );
};