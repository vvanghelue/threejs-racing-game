

(async () => {

	var camera, orbitControl, transformControl, scene, renderer;

	var postprocessing = { enabled: true }
	// var postprocessing = { enabled: false }
	var effectComposer


	let initPostProssessing = () => {
		// Setup render pass
		var renderPass = new THREE.RenderPass( scene, camera );

		// Setup SSAO pass
		ssaoPass = new THREE.SSAOPass( scene, camera );
		ssaoPass.renderToScreen = true
		// ssaoPass.onlyAO = true
		ssaoPass.radius = 5
		ssaoPass.aoClamp = 0.25
		ssaoPass.lumInfluence = .9
		// ssaoPass.lumInfluence = 1
		// ssaoPass.size = new THREE.Vector2( 512, 512 )

		// Add pass to effect composer
		effectComposer = new THREE.EffectComposer( renderer );
		effectComposer.addPass( renderPass );
		effectComposer.addPass( ssaoPass );
		// effectComposer.addPass( renderPass );
	}


	let init = async () => {

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x3fd8ff );
		scene.fog = new THREE.FogExp2( 0xffffff, 0.01 );
		// scene.fog = new THREE.FogExp2( 0x3fd8ff, 0.01 );

		renderer = new THREE.WebGLRenderer( { /*antialias: true*/ } );
		renderer.setPixelRatio( window.devicePixelRatio / 2 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
		// renderer.autoClear = false;

		document.body.appendChild( renderer.domElement );


		// var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
		// scene.add( light );
		
		// var light = new THREE.PointLight( 0xffffff, 1, 100 );
		// light.position.set( 50, 50, 50 );
		// scene.add( light );


		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set( 40, 40, 40 );

		// controls

		transformControl = new THREE.TransformControls( camera, renderer.domElement );
		transformControl.addEventListener( 'change', render );
		scene.add(transformControl)

		transformControl.attach(light)
		
		orbitControl = new THREE.OrbitControls( camera, renderer.domElement );
		// orbitControl = new THREE.TrackballControls( camera, renderer.domElement );


		//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

		orbitControl.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		orbitControl.dampingFactor = 0.25;

		orbitControl.screenSpacePanning = true;

		orbitControl.minDistance = 1;
		orbitControl.maxDistance = 500

		orbitControl.maxPolarAngle = Math.PI;


		let terrain = await ThreeHeightmap(['/_path.svg', '/_terrain.png', '/_path.svg'], 130)
		terrain.castShadow = true;
		terrain.receiveShadow = true;

		scene.add(terrain)
		terrain.position.set(10, 0, 10)



		let road = await (async () => {

			let roadMesh = await ThreeHeightmap(['/_terrain.png'], 30)

			let material = new THREE.MeshStandardMaterial( { color: 0xccccaa} );
			// let material = new THREE.MeshStandardMaterial( { color: 0xffffff} );
			material.roughness = .9
			material.metalness = .5
			
			roadMesh.material = material
			return roadMesh;

			/*

			let geometry = new THREE.PlaneGeometry(100, 100, 1, 1);

			let material = new THREE.MeshStandardMaterial( { color: 0xccccaa} );
			// let material = new THREE.MeshStandardMaterial( { color: 0xffffff} );
			material.roughness = .9
			material.metalness = .5
			
			// let material = new THREE.MeshLambertMaterial( { color: 0x999999} );
			
			let plane = new THREE.Mesh( geometry, material );
			plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1 * Math.PI/2);
			return plane
			*/
		})()


		road.castShadow = false;
		road.receiveShadow = true;
		scene.add(road)
		road.position.set(10, -1.5, 10)



		var light = new THREE.AmbientLight( 0xffffff, 1 );
		scene.add( light );


		let targetMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1))
		targetMesh.position.set(10, -10, 10)
		scene.add( targetMesh );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
		directionalLight.castShadow = true;
		directionalLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
		directionalLight.shadow.bias = 0.0001;
		directionalLight.shadow.mapSize.width = 512;
		directionalLight.shadow.mapSize.height = 512;

		directionalLight.target = targetMesh
		// directionalLight.target.position.set( 110, -10, 10 );
		scene.add( directionalLight );



		// let torusMaterial = new THREE.MeshStandardMaterial( { color: 0x88cc44} );
		// torusMaterial.roughness = 1
		// torusMaterial.metalness = .5

		let torusMaterial = new THREE.MeshStandardMaterial( { color: 0xcc8844} );
		torusMaterial.roughness = .5
		torusMaterial.metalness = .5
		
		let torus = new THREE.Mesh(new THREE.TorusKnotBufferGeometry( 3, 1, 100, 10 ), torusMaterial)
		torus.position.set(10, 20, 10)
		scene.add( torus );
		transformControl.attach(torus)





		initPostProssessing()
		//

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate() {

		requestAnimationFrame( animate );

		orbitControl.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

		render();

	}

	function render() {

		// camera.position.set( 3*Math.sin(new Date().getTime() / 300), 50, 40 + 3*Math.sin(new Date().getTime() / 300) );

		transformControl.update();

		if (postprocessing.enabled) {
			effectComposer.render();
		} else {
			renderer.render( scene, camera );
		}

	}


	await init();
	//render(); // remove when using next line for animation loop (requestAnimationFrame)
	animate();

})()