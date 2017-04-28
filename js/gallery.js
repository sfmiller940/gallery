"use strict"
window.onload = function(){

  var numImages,
    images = [],
    galleryRadius,
    imagesLoaded = false,
    mouseDown = false,
    keyDown = [],
    origin,
    speedCoeff = document.getElementById('speedCoeff').value || 0.5,
    yaxis = new THREE.Vector3(0,1,0),
    renderer = new THREE.WebGLRenderer(),
    loader =  new THREE.TextureLoader().setCrossOrigin('anonymous'),
    scene = new THREE.Scene().add( new THREE.AmbientLight(0xffffff) ),
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 ),
    loadingBar = document.getElementById('loadingBar');

  function loadImages(){
    images = [];
    imagesLoaded = false;
    document.body.classList.remove('imagesLoaded');
    loadingBar.style.width = 0 + '%';
    while(scene.children.length > 0){ scene.remove(scene.children[0]); }

    numImages = 1 * ( document.getElementById('numImages').value || 12 );
    galleryRadius = 1024 * numImages / Math.PI / 1.8;
    var galleryPhi = 2 * Math.PI / numImages;
    if( camera.position.length() > galleryRadius ){ camera.position.set(0,0,0); }

    for(var i=0; i < numImages; i++){ loadImage(i); }
    function loadImage(ind){
      loader.load(
        'https://unsplash.it/1024/512/?random&nocache' + ind + Date.now(),
        function ( texture ) {
          var image = new THREE.Mesh(
            new THREE.PlaneGeometry(1024, 512), 
            new THREE.MeshBasicMaterial({ map: texture })
          );
          image.minFilter = THREE.LinearFilter;
          image.overdraw = true;
          image.rotation.y = - ind * galleryPhi;
          image.position.set(
            galleryRadius * Math.sin( ind * galleryPhi ),
            0,
            - galleryRadius * Math.cos( ind * galleryPhi ) 
          );
          images.push(image);
          loadingBar.style.width = Math.round( 100 * images.length / numImages ) + '%';
        },
        function ( xhr ) {
          console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function ( xhr ) {
          console.log( 'An error happened' );
          loadImage(ind);
        }
      );
    }
  }
  loadImages();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  function render() {
    if( ! imagesLoaded && images.length === numImages){
      images.forEach(function(image){ scene.add(image); });
      imagesLoaded = true;
      document.body.classList.add('imagesLoaded');      
    }
    keyNav();
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }
  render();

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
          camera.rotation.y += (keyDown['ArrowLeft'] ? 1 : -1) * speedCoeff * Math.PI / 60;
        }
      }
      newPos
        .normalize()
        .multiplyScalar( speedCoeff * 7 * numImages )
        .add( camera.position );
      if( newPos.length() < 0.9 * galleryRadius ){
        camera.position.set( newPos.x, 0, newPos.z );
      }
    }
    else{
      document.body.classList.remove('keyDown')
    }
  } 

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
          camera.rotation.y = origin['angle'] + ( 1.5 * speedCoeff * Math.PI * ( e.clientX - mouseDown.clientX ) / window.innerWidth );
        }
        newPos
          .normalize()
          .multiplyScalar( speedCoeff * galleryRadius * (new THREE.Vector2( e.clientX, e.clientY ).distanceTo( new THREE.Vector2(mouseDown.clientX,mouseDown.clientY) ) ) / window.innerWidth / 10 ) 
          .add( origin['position'] );    
        if( newPos.length() < 0.9 * galleryRadius ){
          camera.position.set( newPos.x, 0, newPos.z);
        }
      }
    },
    false
  );

  document.getElementById('close').addEventListener(
    'click',
    function(){ this.parentNode.style.display = 'none'; },
    false
  );

  document.getElementById('speedCoeff').addEventListener(
    'change',
    function(){ 
      speedCoeff = this.value;
      document.getElementById('speedCoeffLabel').innerHTML = 'Speed: ' + Math.round( this.value * 100 ) + '%';
      this.blur();
    },
    false
  );  

  document.getElementById('numImages').addEventListener(
    'change',
    function(){
      loadImages();
      document.getElementById('numImagesLabel').innerHTML = 'Images: ' + this.value;
      this.blur();
    },
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

  document.getElementById('minMax').addEventListener(
    'click',
    function(){
      this.parentNode.classList.toggle('hidden');
      this.blur();
    },
    false
  );

  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    }, 
    false
  );
};