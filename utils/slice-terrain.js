const sliceTerrain = (terrain, subdivisionFactor = 2) => {

	// window.terrain = terrain
	console.log(terrain.geometry.computeBoundingBox())
	console.log(terrain.geometry.boundingBox)
	console.log(terrain.geometry.boundingBox.min.x)

	// const subdivisionFactor = 8

	// 16
	const originalSegmentCount = Math.sqrt(terrain.geometry.faces.length / 2)

	/*
	if (originalSegmentCount && (originalSegmentCount & (originalSegmentCount - 1)) !== 0) {
		throw new Error('geometry side segment is not a power of 2')
	}
	*/

	const sideSegmentsCount = originalSegmentCount / subdivisionFactor

	const originalSizeX = Math.abs(terrain.geometry.boundingBox.min.x - terrain.geometry.boundingBox.max.x)
	const originalSizeZ = Math.abs(terrain.geometry.boundingBox.min.z - terrain.geometry.boundingBox.max.z)


	const sizeX = originalSizeX/subdivisionFactor
	const sizeY = originalSizeZ/subdivisionFactor


	// console.log({
	// 	originalSizeZ,
	// 	sideSegmentsCount
	// })


	const terrainMeshes = []

	for (let i = 0; i < subdivisionFactor; i++) {
		for (let j = 0; j < subdivisionFactor; j++) {
			// let geometry = new THREE.PlaneGeometry(, sizeX, sizeY)

			let geometry = new THREE.PlaneGeometry(sizeX, sizeY, sideSegmentsCount, sideSegmentsCount)
			
			let material = new THREE.MeshStandardMaterial({ 
				color: 0x00aa00,
				shading: THREE.FlatShading 
			})
			material.roughness = 1
			material.metalness = .3
			// material.wireframe = true

			let mesh = new THREE.Mesh(geometry, material)

			geometry.rotateX(-1 * Math.PI/2)

			// mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1 * Math.PI/2)

			// scene.add(mesh)

			// mesh.position.set(
			// 	i * sizeX - sizeX * subdivisionFactor / 2, 
			// 	20 + Math.random() * 4, 
			// 	j * sizeY - sizeY * subdivisionFactor / 2
			// )

			// mesh.position.set(
			// 	-1 * originalSizeX/2 + i * sizeX + sizeX/2, 
			// 	20 + Math.random() * 4, 
			// 	-1 * originalSizeY/2 + j * sizeY + sizeY/2
			// )

			let positionX = -1 * originalSizeX/2 + i * sizeX + sizeX/2
			// let positionY = 30 + Math.random() * 2
			let positionY = terrain.position.y + .1
			let positionZ = -1 * originalSizeZ/2 + j * sizeY + sizeY/2

			mesh.position.set(
				positionX, 
				positionY, 
				positionZ
			)

			mesh.updateMatrixWorld()

			geometry.vertices.forEach((vertice, k) => {
				
				// if (k > 1) {
				// 	return;
				// }

				let verticePosition = mesh.localToWorld(vertice.clone())

				let found = false
				terrain.geometry.vertices.forEach((originalVertice) => {

					if (found) {
						return
					}

					// console.log('check')

					// console.log({positionX, positionZ, v: vertice.y})
					if (
						Math.abs(verticePosition.x - originalVertice.x) < .001
						&& 
						Math.abs(verticePosition.z - originalVertice.z) < .001
						// verticePosition.z == originalVertice.z
					) {
						vertice.y = originalVertice.y
						// vertice.x = originalVertice.x
						// vertice.z = originalVertice.z
						// console.log('FOUND')
						found = true
					}
				})
			})

			// mesh.visible = false

			geometry.mergeVertices();
			geometry.verticesNeedUpdate	= true
			geometry.computeFaceNormals()
			geometry.computeVertexNormals(true)
			geometry.normalsNeedUpdate	= true
			geometry.verticesNeedUpdate = true



			terrainMeshes.push(mesh)
			// console.log(mesh)

			// console.log(i, j)
		}
	}

	for (mesh of terrainMeshes) {
		// scene.add(mesh)
	}

	return terrainMeshes
}