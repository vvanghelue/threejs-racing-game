const getCheckpoints = async (svgUrl) => {
	const svgData = await (await fetch(svgUrl)).text()

	//console.log(svgData)
	const svgElement = createElement(svgData)
	const path = svgElement.querySelector('path')
	const length = path.getTotalLength()

	const step = length / 170
	let points = []

	console.log(path.getPointAtLength(0))
	console.log(path.getPointAtLength(100))
	console.log(path.getPointAtLength(length))

	let at = 0
	while (at < length) {
		const point = path.getPointAtLength(at)
		points.push({
			at: at,
			point: { x: point.x, y: point.y }
		})
		at += step
	}

	return points
}

const addCheckpointsToScene = async (checkpointsCoordinates, roadMesh, scene) => {
	const allCheckpoints = []
	checkpointsCoordinates.forEach((checkpointCoord) => {
		//console.log(checkpointCoord)
		let checkpointMesh = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 10), new THREE.MeshStandardMaterial( { color: 0xff0000} ))

		const checkpointPosition = new THREE.Vector3(
			checkpointCoord.point.x / 3.98 - 50.25, 
			30, 
			checkpointCoord.point.y / 3.98 - 50.25
		)

		checkpointMesh.position.copy(checkpointPosition)
		scene.add(checkpointMesh)

		const raycaster = new THREE.Raycaster(
			checkpointMesh.position,
			new THREE.Vector3(0, -1, 0),
			0,
			2000
		)

		const intersects = raycaster.intersectObjects([
			roadMesh
		], true)

		if (intersects[0]) {
			checkpointMesh.position.copy(intersects[0].point)
		}
	})
}

(async () => {

	var camera, orbitControl, transformControl, scene, renderer;

	var postprocessing = { enabled: false }
	//var postprocessing = { enabled: true }
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

		// ssaoPass.enabled = false
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
		// scene.background = new THREE.Color( 0x3fd8ff );
		scene.background = new THREE.Color( 0x44eeff );
		// scene.fog = new THREE.FogExp2( 0x44eeff, 0.01 );
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

		const roadPath = window.btoa(
			unescape(
				encodeURIComponent( randomCircuitGenerator() )
			)
		)

		let terrain = await ThreeHeightmap([
			// {
			// 	opacity: .3,
			// 	image: '/_path.svg'
			// },


			{
				opacity: 1,
				image: '/_terrain.png'
			}, 
			{
				opacity: 1,
				// image: '/_path.svg'
				image: 'data:image/svg+xml;base64,' + roadPath
			}
		], 8 * 20, 2.5)

		window.terrainMesh = terrain

		// terrain.material.shading = THREE.FlatShading


		
		var subdivisions = 1
		var modifier = new THREE.SubdivisionModifier( subdivisions )
		modifier.modify( terrain.geometry, subdivisions )
		terrain.geometry.computeFaceNormals()
		terrain.geometry.computeVertexNormals()
		
		
		// terrain.material.wireframe = true

		terrain.castShadow = true;
		terrain.receiveShadow = true;

		scene.add(terrain)
		terrain.position.set(0, 0, 0)

		/*
		const terrainSlices = sliceTerrain(terrain, 8)
		for (terrainSlice of terrainSlices) {
			scene.add(terrainSlice)
		}
		*/
		

		let road = await (async () => {

			let roadMesh = await ThreeHeightmap([
				{
					opacity: 1, 
					image: '/_terrain.png'
				}
				//, 
				// {
				// 	opacity: .1,
				// 	image: '/_path.svg'
				// }
			], 40, 2.6)

			let material = new THREE.MeshStandardMaterial({ 
				color: 0xccccaa,
				// shading: THREE.FlatShading
			});
			// let material = new THREE.MeshStandardMaterial( { color: 0xffffff} );
			material.roughness = .9
			material.metalness = .5

			
			roadMesh.material = material

			// roadMesh.material.wireframe = true

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
		road.position.set(0, -0, 0)
		scene.add(road)

		setTimeout(async () => {
			const checkpointsCoordinates = await getCheckpoints('/_path.svg')
			await addCheckpointsToScene(checkpointsCoordinates, road, scene)
		}, 1000)

		var light = new THREE.AmbientLight( 0xffffff, 1 );
		scene.add( light );

		let targetMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1))
		targetMesh.position.set(10, -10, 10)
		scene.add( targetMesh );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
		/*
		directionalLight.castShadow = true;
		directionalLight.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
		directionalLight.shadow.bias = 0.0001;
		directionalLight.shadow.mapSize.width = 512;
		directionalLight.shadow.mapSize.height = 512;
		*/

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