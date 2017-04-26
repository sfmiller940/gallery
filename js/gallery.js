"use strict"
window.onload = function(){

  var numImages,
    images = [],
    galleryRadius,
    imagesLoaded = false,
    mouseDown = false,
    shiftDown = false,
    origin,
    yaxis = new THREE.Vector3(0,1,0),
    scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer(),
    loader = new THREE.TextureLoader(),
    ambientLight = new THREE.AmbientLight(0xffffff),
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      4 * 1024 * 16 / Math.PI
    );

  scene.add(ambientLight);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  function loadImages(){
    imagesLoaded = false;
    images = [];
    numImages = 1 * ( document.getElementById('numImages').value || 12 );
    galleryRadius = 1024 * numImages / Math.PI / 1.8;
    if( camera.position.length() > galleryRadius ){ camera.position.set(0,0,0); }
    document.body.classList.remove('imagesLoaded');
    while(scene.children.length > 0){ scene.remove(scene.children[0]); }
    for(var i=0; i < numImages; i++){
      loader.load(
        'https://unsplash.it/1024/512/?random&nocache' + i + Date.now(),
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
  }
  loadImages();

  function addImages(){
    var galleryPhi = 2 * Math.PI / numImages;
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
    document.body.className += " imagesLoaded";
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

  document.getElementById('button--loadImages').addEventListener(
    'click',
    loadImages,
    false
  );

  document.getElementById('numImages').addEventListener(
    'change',
    loadImages,
    false
  );  

  document.addEventListener(
    'keydown',
    function(e){ if(e.keyCode === 16) shiftDown=true; },
    false
  );

  document.addEventListener(
    'keyup',
    function(e){ if(e.keyCode === 16) shiftDown=false; },
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
      var gamma, newPos;
      if(mouseDown){
        gamma = galleryRadius / window.innerWidth / 20;
        newPos = camera.getWorldDirection()
          .multiplyScalar( gamma*(e.clientY - mouseDown.clientY) )
          .add( origin['position'] );
        if(shiftDown){
          newPos.add( camera.getWorldDirection()
            .applyAxisAngle( yaxis, - Math.PI / 2)
            .multiplyScalar( gamma*(e.clientX - mouseDown.clientX) ) 
          );
        } else {
          camera.rotation.y = origin['angle'] + ( Math.PI * ( e.clientX - mouseDown.clientX ) / window.innerWidth );
        }          
        if( newPos.length() < 0.9 * galleryRadius ){
          camera.position.set( newPos.x, newPos.y, newPos.z);
        }
      }
    },
    false
  );
};