let ThreeHeightmap


const loadImage = async (imageUrl) => {
	return new Promise((resolve) => {
		var img = new Image()
		img.src = imageUrl
		img.onload = () => {
			resolve(img)
		}
	})
}

const resizeCanvas = (img, canvas, context) => {
	// set size proportional to image
    canvas.height = canvas.width * (img.height / img.width);

    // step 1 - resize to 50%
    var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

    oc.width = img.width * 0.5;
    oc.height = img.height * 0.5;
    octx.drawImage(img, 0, 0, oc.width, oc.height);

    // step 2
    octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

    // step 3, resize to final size
    ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
    0, 0, canvas.width, canvas.height);
}


function getHeightData(layers, scale, segments) {


	const width = layers[0].width
	const height = layers[0].height

	// StackBlur.image(roadImg, targetCanvas, radius, blurAlphaChannel);

	let factor = (segments + 1) / width
  
    if (scale == undefined) scale=1;
  
    var canvas = document.createElement( 'canvas' );
    canvas.width = width * factor;
    canvas.height = height * factor;
    var context = canvas.getContext( '2d' );
    // context.filter = 'blur(3px)';

    context.fillStyle = "#aaaaaa"
	context.fillRect(0,0, width * factor, height * factor)
	
	document.querySelector('.heightmap-container').appendChild(canvas)

 
    var size = width * height * factor * factor;
    var data = new Float32Array( size );
 
 	// context.globalAlpha = 0.5
    // context.drawImage(roadImg, 0, 0, width * factor, height * factor)

    for (const layer of layers) {
	    context.globalAlpha = 1
	    context.drawImage(layer, 0, 0, width * factor, height * factor)
	}
 
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }

    // resizeCanvas(img, )
 
    var imgd = context.getImageData(0, 0, width * factor, height * factor);
    var pix = imgd.data;
 
 	console.log(pix.length)

    var j=0;
    for (var i = 0; i< pix.length; i += 4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }

    /*
    for (var i = 0; i < 10; i++) {
	    for (var j = 0; i < 10; i++) {

	    }
    }
    */
     
    return data;

}

(() => {

	ThreeHeightmap = async (layers, size = 310) => {

		let layersImages = []
		for (const layerSource of layers) {
			let layerImage = await loadImage(layerSource)
			layersImages.push(layerImage)
		}


		//get height data from img
		var data = getHeightData(layersImages, 1.8, size);

		// plane
		var geometry = new THREE.PlaneGeometry(100, 100, size, size);
		// var texture = THREE.ImageUtils.loadTexture( 'images/heightmap2.png' );
		//var material = new THREE.MeshStandardMaterial({color: '#aa0022', /*wireframe: true*/} /*{ map: texture }*/ );
		var material = new THREE.MeshStandardMaterial( { color: 0xcfff65 , /*side: THREE.DoubleSide*/} );
		material.roughness = 1
		material.metalness = .3
		// material.flatShading = true;
		plane = new THREE.Mesh( geometry, material );

		plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), -1 * Math.PI/2);
		// plane.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI/2);


		//set height of vertices
		for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
			plane.geometry.vertices[i].z = 1 * data[i];
			// plane.geometry.vertices[i].z = Math.random()

			// plane.geometry.vertices[i].z = i
		}

		plane.geometry.mergeVertices();
		plane.geometry.verticesNeedUpdate	= true
		plane.geometry.computeFaceNormals()
		plane.geometry.computeVertexNormals(true)
		plane.geometry.normalsNeedUpdate	= true


		window.plane = plane

		// plane.geometry.computeFaceNormals() 
		// plane.geometry.computeVertexNormals() 

		// delete plane.geometry.vertices[27]
		// delete plane.geometry.vertices[28]

		return plane
	}
})()