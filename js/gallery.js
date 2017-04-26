"use strict"
window.onload = function(){

  var numImages = 12,
    images = [],
    galleryRadius = 2200,
    galleryPhi = 2 * Math.PI / numImages,
    galleryFov = 75,
    imagesLoaded = false,
    mouseDown = false,
    origin,
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer(),
    loader = new THREE.TextureLoader(),
    ambientLight = new THREE.AmbientLight(0xffffff),
    camera = new THREE.PerspectiveCamera(
      galleryFov,
      window.innerWidth / window.innerHeight,
      0.1,
      4 * galleryRadius
    );

  scene.add(ambientLight);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  for(var i=0; i < numImages; i++){
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
    images.forEach(function(image, i){
      image.rotation.y = - i * galleryPhi;
      image.position.set(
        galleryRadius * Math.sin( i * galleryPhi ),
        0,
        - galleryRadius * Math.cos( i * galleryPhi ) 
      );
      scene.add(image);
    });
    imagesLoaded = true;
  }

  function render () {
    if( ! imagesLoaded && images.length === numImages) addImages();
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }
  render();

  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, 
    false
  );

  document.addEventListener(
    'mouseup',
    function(e){ mouseDown = false; },
    false
  );

  document.addEventListener(
    'mousedown', 
    function(e){
      mouseDown = e;
      origin = { 'angle' : camera.rotation.y, 'position' : camera.position };
    },
    false
  );

  document.addEventListener(
    'mousemove',
    function(e){
      if(mouseDown){
        camera.rotation.y = origin['angle'] + ( Math.PI * ( e.clientX - mouseDown.clientX ) / window.innerWidth );
        var newPosition = new THREE.Vector3( 
          origin['position'].x+(camera.getWorldDirection().normalize().x*galleryRadius*(-e.clientY + mouseDown.clientY)/window.innerWidth/10),
          0,
          origin['position'].z+(camera.getWorldDirection().normalize().z*galleryRadius*(-e.clientY + mouseDown.clientY)/window.innerWidth/10)
        );
        if( newPosition.length() < 0.9 * galleryRadius ){
          camera.position.set(newPosition.x, newPosition.y, newPosition.z);
        }
      }
    },
    false
  );
};