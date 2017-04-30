"use strict"
window.onload = function(){

  var numImages,
    galleryRadius,
    starCloud,
    origin,
    imagesLoaded = true,
    mouseDown = false,
    images = [],
    keyDown = [],
    starPaths=[],
    loadingBar = document.getElementById('loadingBar'),
    speedCoeff = document.getElementById('speedCoeff').value || 0.5,
    yaxis = new THREE.Vector3(0,1,0),
    loader =  new THREE.TextureLoader().setCrossOrigin('anonymous'),
    scene = new THREE.Scene().add( new THREE.AmbientLight(0xffffff) ),
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 ),
    renderer = new THREE.WebGLRenderer();

  loadImages();
  function loadImages(){
    if(!imagesLoaded) return(false);

    //Unload
    images.forEach(function(image){ scene.remove(image); });
    images = [];
    imagesLoaded = false;
    loadingBar.style.width = 0 + '%';
    document.body.classList.remove('imagesLoaded');

    //Preload
    numImages = 1 * ( document.getElementById('numImages').value || 12 );
    galleryRadius = 1024 * numImages / Math.PI / 1.8;
    var galleryPhi = 2 * Math.PI / numImages;
    if( camera.position.length() > galleryRadius ){ camera.position.set(0,0,0); }

    //Load
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
          image.position.set( galleryRadius * Math.sin( ind * galleryPhi ), 0, - galleryRadius * Math.cos( ind * galleryPhi ) );
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
    return true;
  }

  loadStars();
  function loadStars(){
    var starSpace = new THREE.Geometry();
    for(var i=0; i<1000; i++){
      starSpace.vertices.push( new THREE.Vector3( 0.5 - Math.random(), 0.5 - Math.random(), 0.5 - Math.random() ).normalize().multiplyScalar(4000 + (2000 * Math.random())));
      starSpace.colors.push(new THREE.Color( Math.random(), Math.random(), Math.random()));
      starPaths.push( { 'axis': new THREE.Vector3(0.5 - Math.random(), 0.5 - Math.random(), 0.5 - Math.random() ), 'speed' : 0.0015 * Math.random() } );
    }
    starCloud = new THREE.Points(
      starSpace,
      new THREE.PointsMaterial({ size: 12,vertexColors: THREE.VertexColors})
    );
    scene.add(starCloud);
  }
  function moveStars(){
    starCloud.geometry.vertices.forEach(function(vertex,i){
      vertex.applyAxisAngle( starPaths[i]['axis'], starPaths[i]['speed'] );
    });
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  render();
  function render() {

    if( ! imagesLoaded && images.length === numImages){
      images.forEach(function(image){ scene.add(image); });
      imagesLoaded = true;
      document.body.classList.add('imagesLoaded');      
    }

    keyNav();

    moveStars();
    starCloud.geometry.verticesNeedUpdate = true;
    
    renderer.render(scene, camera);
    requestAnimationFrame( render );
  }

  // Nav
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
      if( newPos.length() < 0.95 * galleryRadius ){
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
        if( newPos.length() < 0.95 * galleryRadius ){
          camera.position.set( newPos.x, 0, newPos.z);
        }
      }
    },
    false
  );

  //UI
  document.getElementById('close').addEventListener(
    'click',
    function(){ this.parentNode.style.display = 'none'; },
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
      if( loadImages() ){
        document.getElementById('numImagesLabel').innerHTML = 'Images: ' + this.value;
      }
      else{ this.value = numImages; }
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