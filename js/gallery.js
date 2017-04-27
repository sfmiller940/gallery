"use strict"
window.onload = function(){

  var numImages,
    images = [],
    galleryRadius,
    imagesLoaded = false,
    mouseDown = false,
    keyDown = [],
    origin,
    speedCoeff = document.getElementById('speedCoeff').value,
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
  function render() {
    if( ! imagesLoaded && images.length === numImages) addImages();
    keyNav();
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }
  render();

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
    document.body.classList.add('imagesLoaded');
  }

  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, 
    false
  );

  document.getElementById('close').addEventListener(
    'click',
    function(){ this.parentNode.style.display = 'none'; },
    false
  );

  document.getElementById('loadImages').addEventListener(
    'click',
    function(){
      loadImages();
      this.blur();
    },
    false
  );

  document.getElementById('speedCoeff').addEventListener(
    'change',
    function(){ 
      speedCoeff = document.getElementById('speedCoeff').value;
      this.blur();
    },
    false
  );  

  document.getElementById('numImages').addEventListener(
    'change',
    function(){
      loadImages();
      this.blur();
    },
    false
  );  

  document.addEventListener(
    'keydown',
    function(e){ 
      keyDown[e.key]=true;
      if( e.key === '-' ) camera.rotation.y += Math.PI;
    },
    false
  );

  document.addEventListener(
    'keyup',
    function(e){ keyDown[e.key]=false; },
    false
  );

  document.addEventListener(
    'mousedown', 
    function(e){
      mouseDown = e;
      origin = { 'angle' : camera.rotation.y, 'position' : camera.position };
      document.body.classList.add('mouseDown');
    },
    false
  );

  document.addEventListener(
    'mouseup',
    function(e){ 
      mouseDown = false;
      document.body.classList.remove('mouseDown');
    },
    false
  );

  document.addEventListener(
    'mousemove',
    function(e){
      var newPos;
      if(mouseDown){
        newPos = camera.getWorldDirection()
          .multiplyScalar( e.clientY - mouseDown.clientY );
        if(keyDown['Shift']){
          newPos.add( camera.getWorldDirection()
            .applyAxisAngle( yaxis, - Math.PI / 2)
            .multiplyScalar( e.clientX - mouseDown.clientX ) 
          );
        } else {
          camera.rotation.y = origin['angle'] + ( 2 * speedCoeff * Math.PI * ( e.clientX - mouseDown.clientX ) / window.innerWidth );
        }
        newPos
          .normalize()
          .multiplyScalar( speedCoeff * galleryRadius * (new THREE.Vector2( e.clientX, e.clientY ).distanceTo( new THREE.Vector2(mouseDown.clientX,mouseDown.clientY) ) ) / window.innerWidth / 5 ) 
          .add( origin['position'] );    
        if( newPos.length() < 0.9 * galleryRadius ){
          camera.position.set( newPos.x, newPos.y, newPos.z);
        }
      }
    },
    false
  );

  function keyNav(){
    var newPos = new THREE.Vector3(0,0,0);
    if( keyDown['ArrowLeft'] || keyDown['ArrowRight'] || keyDown['ArrowUp'] || keyDown['ArrowDown'] ){
      document.body.classList.add('keyDown');
      if( keyDown['ArrowUp'] || keyDown['ArrowDown'] ){
        newPos.add( camera.getWorldDirection().multiplyScalar( keyDown['ArrowUp'] ? 1 : -1 ) );
      }
      if( keyDown['ArrowLeft'] || keyDown['ArrowRight']){
        if( keyDown['Shift'] ){
          newPos.add( camera.getWorldDirection().applyAxisAngle( yaxis, (keyDown['ArrowLeft'] ? 1 : -1) * Math.PI / 2));
        } else {
          camera.rotation.y += (keyDown['ArrowLeft'] ? 1 : -1) * speedCoeff * Math.PI / 90;
        }
      }
      newPos
        .normalize()
        .multiplyScalar( speedCoeff * 10 * numImages )
        .add( camera.position );
      if( newPos.length() < 0.9 * galleryRadius ){
        camera.position.set( newPos.x, newPos.y, newPos.z );
      }
    }
    else{
      document.body.classList.remove('keyDown')
    }
  }
};