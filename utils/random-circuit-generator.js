const generatePath = (width = 400, totalPoints = 8) => {
  const center = [width/2, width/2]
  const points = []
  let angle = 0
  for (let i = 0; i < totalPoints; i++) {
    angle += 2 * Math.PI/totalPoints
    let randomRadius = (Math.random() * .7 + .4 ) * width / 3.4
    let point = [
      center[0] + randomRadius * Math.cos(angle),
      center[1] + randomRadius * Math.sin(angle) /// 1.3 // give a ciruit shape
    ]
    
    let bezierAngle = angle - 2 * Math.PI/(2 * totalPoints) 
      + .3 * (Math.random() - .5)
    let bezierRadius = randomRadius * (1 + 1.15 * (Math.random() - .5))
    let bezierPoint1 = [
      center[0] + bezierRadius * Math.cos(bezierAngle),
      center[1] + bezierRadius * Math.sin(bezierAngle)
    ]
    let bezierPoint2 = [
      point[0] - (bezierPoint1[0] - point[0]),
      point[1] - (bezierPoint1[1] - point[1]),
    ]
    points.push({
      point: point,
      bezier: [
        bezierPoint1,
        bezierPoint2
      ]   
    })
  }
  
  /*
  points.forEach((p, k) => {
    if (k == 0) {
      points[0].bezier = [
        points[points.length - 1].point,
        points[1].point
      ]
      return
    }
    if (k == (points.length - 1)) {
      points[k].bezier = [
        points[k - 1].point,
        points[0].point
      ]
      return
    }

    points[k].bezier = [
      points[k - 1].point,
      points[k + 1].point
    ]
  })
  */
  
  return points
}


const randomCircuitGenerator = () => {
  
  const pathPoints = generatePath()

  let pathData = ``
  pathPoints.forEach((p, i) => {
    //first
    if (i == 0) {
      pathData += `
        M ${pathPoints[i].point[0]},${pathPoints[i].point[1]}
      `
      return
    }
    
    //last
    if (i == pathPoints.length - 1) {
      pathData += `
        C ${pathPoints[i-1].bezier[1][0]},${pathPoints[i-1].bezier[1][1]}
          ${pathPoints[i].bezier[0][0]},${pathPoints[i].bezier[0][1]}
          ${pathPoints[i].point[0]},${pathPoints[i].point[1]}

        C ${pathPoints[i].bezier[1][0]},${pathPoints[i].bezier[1][1]}
          ${pathPoints[0].bezier[0][0]},${pathPoints[0].bezier[0][1]}
          ${pathPoints[0].point[0]},${pathPoints[0].point[1]}
      `
      return
    }
    
    //all middle points
    pathData += `
        C ${pathPoints[i-1].bezier[1][0]},${pathPoints[i-1].bezier[1][1]}
          ${pathPoints[i].bezier[0][0]},${pathPoints[i].bezier[0][1]}
          ${pathPoints[i].point[0]},${pathPoints[i].point[1]}
    `
  })


  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg" filter="url(#blurMe)">

      <defs>
          <filter id="blurMe" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
      </defs>


      <path stroke="#000" stroke-width="1" fill="none" d="${pathData}"/>

      <!--
      ${pathPoints.map((p) => {
          return `
            <path stroke="#ff3439" 
              stroke-linecap="round" 
              d="M${p.point[0]},${p.point[1]}Z" 
              stroke-width="8"></path>

    
              ${p.bezier.map((b) => {
                return `
                  <path stroke="#00ff39" 
                      stroke-linecap="round" 
                      d="M${b[0]},${b[1]}Z" 
                      stroke-width="4"></path>
                `
              }).join('')}

          `
      }).join('')}

      -->


    </svg>
  `
}