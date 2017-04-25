"use strict"
window.onload = function(){

  var images = [], 
    numImages = 12,
    galleryRadius = 2200,
    galleryPhi = 2 * Math.PI / numImages,
    galleryFov = 75,
    imagesLoaded = false,
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer(),
    camera = new THREE.PerspectiveCamera( galleryFov , window.innerWidth / window.innerHeight, 1, 100 + galleryRadius),
    loader = new THREE.TextureLoader(),
    ambientLight = new THREE.AmbientLight(0xffffff),
    controls = new THREE.TrackballControls( camera );

  scene.add(ambientLight);

  loader = new THREE.TextureLoader()
  loader.crossOrigin = '';
  for(var i=0; i<numImages; i++){
    loader.load(
      'https://unsplash.it/1024/512/?random&nocache' + i,
      function ( texture ) {
        var image = new THREE.Mesh(
          new THREE.PlaneGeometry(1024, 512), 
          new THREE.MeshBasicMaterial({ map: texture })
        );
        image.minFilter = THREE.LinearFilter;
        image.overdraw = true;
        images.push(image);
      },
      function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function ( xhr ) {
        console.log( 'An error happened' );
      }
    );
  }

  function addImages(){
    for(var i = 0; i < images.length; i++){
      images[i].rotation.y = - i * galleryPhi;
      images[i].position.set(
        galleryRadius * Math.sin( i * galleryPhi ),
        0,
        - galleryRadius * Math.cos( i * galleryPhi ) 
      );
      scene.add(images[i]);
    }
    imagesLoaded = true;
  };

/*
  // Camera controls
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  controls.addEventListener( 'change', render );
*/

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  function render () {
    if( ! imagesLoaded && images.length === numImages) addImages();
    //controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }
  render();

  window.addEventListener( 'resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );

};