var Boid = function() {
    var vector = new THREE.Vector3(),
        _acceleration, _width = 500,
        _height = 500,
        _depth = 200,
        _goal, _neighborhoodRadius = 25,
        _maxSpeed = 4,
        _maxSteerForce = 0.1,
        _avoidWalls = false;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    _acceleration = new THREE.Vector3();
    this.setGoal = function(target) {
        _goal = target;
    };
    this.setAvoidWalls = function(value) {
        _avoidWalls = value;
    };
    this.setWorldSize = function(width, height, depth) {
        _width = width;
        _height = height;
        _depth = depth;
    };
    //draw the plane

    this.run = function(boids) {
        if (_avoidWalls) {
            vector.set(-_width, this.position.y, this.position.z);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
            vector.set(_width, this.position.y, this.position.z);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
            vector.set(this.position.x, -_height, this.position.z);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
            vector.set(this.position.x, _height, this.position.z);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
            vector.set(this.position.x, this.position.y, -_depth);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
            vector.set(this.position.x, this.position.y, _depth);
            vector = this.avoid(vector);
            vector.multiplyScalar(5);
            _acceleration.add(vector);
        }


        if (Math.random() > 0.5) {
            this.flock(boids);
        }
        this.move();
    };
    this.flock = function(boids) {
        if (_goal) {
            _acceleration.add(this.reach(_goal, 0.005));
        }
        _acceleration.add(this.alignment(boids));
        _acceleration.add(this.cohesion(boids));
        _acceleration.add(this.separation(boids));
    };
    this.move = function() {
        this.velocity.add(_acceleration);
        var l = this.velocity.length();
        if (l > _maxSpeed) {
            this.velocity.divideScalar(l / _maxSpeed);
        }
        this.position.add(this.velocity);
        _acceleration.set(0, 0, 0);
    };
    this.checkBounds = function() {
        if (this.position.x > _width) this.position.x = -_width;
        if (this.position.x < -_width) this.position.x = _width;
        if (this.position.y > _height) this.position.y = -_height;
        if (this.position.y < -_height) this.position.y = _height;
        if (this.position.z > _depth) this.position.z = -_depth;
        if (this.position.z < -_depth) this.position.z = _depth;
    };
    //
    this.avoid = function(target) {
        var steer = new THREE.Vector3();
        steer.copy(this.position);
        steer.sub(target);
        steer.multiplyScalar(1 / this.position.distanceToSquared(target));
        return steer;
    };
    this.repulse = function(target) {
        var distance = this.position.distanceTo(target);
        if (distance < 200) {
            var steer = new THREE.Vector3();
            steer.subVectors(this.position, target);
            steer.multiplyScalar(0.5 / distance);
            _acceleration.add(steer);
        }
    };
    this.reach = function(target, amount) {
        var steer = new THREE.Vector3();
        steer.subVectors(target, this.position);
        steer.multiplyScalar(amount);
        return steer;
    };
    this.alignment = function(boids) {
        var boid, velSum = new THREE.Vector3(),
            count = 0;
        for (var i = 0, il = boids.length; i < il; i++) {
            if (Math.random() > 0.6) continue;
            boid = boids[i];
            distance = boid.position.distanceTo(this.position);
            if (distance > 0 && distance <= _neighborhoodRadius) {
                velSum.add(boid.velocity);
                count++;
            }
        }
        if (count > 0) {
            velSum.divideScalar(count);
            var l = velSum.length();
            if (l > _maxSteerForce) {
                velSum.divideScalar(l / _maxSteerForce);
            }
        }
        return velSum;
    };
    this.cohesion = function(boids) {
        var boid, distance,
            posSum = new THREE.Vector3(),
            steer = new THREE.Vector3(),
            count = 0;
        for (var i = 0, il = boids.length; i < il; i++) {
            if (Math.random() > 0.6) continue;
            boid = boids[i];
            distance = boid.position.distanceTo(this.position);
            if (distance > 0 && distance <= _neighborhoodRadius) {
                posSum.add(boid.position);
                count++;
            }
        }
        if (count > 0) {
            posSum.divideScalar(count);
        }
        steer.subVectors(posSum, this.position);
        var l = steer.length();
        if (l > _maxSteerForce) {
            steer.divideScalar(l / _maxSteerForce);
        }
        return steer;
    };
    this.separation = function(boids) {
        var boid, distance,
            posSum = new THREE.Vector3(),
            repulse = new THREE.Vector3();
        for (var i = 0, il = boids.length; i < il; i++) {
            if (Math.random() > 0.6) continue;
            boid = boids[i];
            distance = boid.position.distanceTo(this.position);
            if (distance > 0 && distance <= _neighborhoodRadius) {
                repulse.subVectors(this.position, boid.position);
                repulse.normalize();
                repulse.divideScalar(distance);
                posSum.add(repulse);
            }
        }
        return posSum;
    }
}

var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    pink:0xF5986E,
    brown:0x59332e,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

// var Cloud = function(){
//     this.mesh = new THREE.Object3D();
//     this.mesh.name = "cloud";
//     var geom = new THREE.CubeGeometry(20,20,20);
//     var mat = new THREE.MeshPhongMaterial({
//         color:Colors.white,
//     });
//
//     var nBlocs = 3+Math.floor(Math.random()*3);
//     for (var i=0; i<nBlocs; i++ ){
//         var m = new THREE.Mesh(geom.clone(), mat);
//         m.position.x = i*15;
//         m.position.y = Math.random()*10;
//         m.position.z = Math.random()*10;
//         m.rotation.z = Math.random()*Math.PI*2;
//         m.rotation.y = Math.random()*Math.PI*2;
//         var s = .1 + Math.random()*.9;
//         m.scale.set(s,s,s);
//         m.castShadow = true;
//         m.receiveShadow = true;
//         this.mesh.add(m);
//     }
// }

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var camera, scene, renderer, planes, plane;
var boid, boids;
var planeMat;
var sea;
var vv=0
var sky;
var clouds = [];

var start_time = Date.now();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var container;
var mesh, geometry, material;
var collidableMeshList = [];


var crash = false;

var id = 0;
var crashId = " ";
var lastCrashId = " ";
var collideMeshList = [];
var cubes = [];
var gg

init();
//animate();


function init() {

    container = document.body;
    var canvas = document.createElement( 'canvas' );
    canvas.width = 32;
    canvas.height = window.innerHeight;

    var context = canvas.getContext( '2d' );

    var gradient = context.createLinearGradient( 0, 0, 0, canvas.height );
    gradient.addColorStop(0, "#1e4877");
    gradient.addColorStop(0.5, "#4584b4");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
    container.style.backgroundSize = '32px 100%';



     camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
     camera.position.z = 8000;

    // camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 3000 );
    // camera.position.z = 6000;






    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xeeeeff, 0, 950 );


    // var wallGeometry = new THREE.CubeGeometry(100, 100, 100, 10, 10, 10);
    // var wallMaterial = new THREE.MeshBasicMaterial({
    //     color: 0x8888ff
    // });
    //
    // wall = new THREE.Mesh(wallGeometry, wallMaterial);
    // wall.position.set(0, 0, 6200);
    // scene.add(wall);
    // collidableMeshList.push(wall);
    //
    //



    geometry = new THREE.Geometry();

    var texture = new THREE.TextureLoader().load( 'images/cloud.png', animate );
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;


    var fog = new THREE.Fog( 0x4584b4, - 100, 3000 );

    material = new THREE.ShaderMaterial( {

        uniforms: {

            "map": { type: "t", value: texture },
            "fogColor" : { type: "c", value: fog.color },
            "fogNear" : { type: "f", value: fog.near },
            "fogFar" : { type: "f", value: fog.far },

        },
        vertexShader: document.getElementById( 'vs' ).textContent,
        fragmentShader: document.getElementById( 'fs' ).textContent,
        depthWrite: true,
        depthTest: true,
        transparent: true,
        opacity:Math.random()*0.5


    } );

    var cloud = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );

    for ( var i = 0; i < 8000; i++ ) {

        cloud.position.x = Math.random() * 1000 - 500;
        cloud.position.y = - Math.random() * Math.random() * 200 +50;
        cloud.position.z = i;
        cloud.rotation.z = Math.random() * Math.PI;
        cloud.scale.x = cloud.scale.y = Math.random() * Math.random() * 1.5 + 0.5;


        cloud.updateMatrix();

        geometry.merge(cloud.geometry, cloud.matrix);

    }

    mesh = new THREE.Mesh( geometry, material );

    //mesh.position.z = 0;
    scene.add( mesh );

    // mesh = new THREE.Mesh( geometry, material );
    //
    // scene.add( mesh );


    //灯光
    var light = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.5); //0xeeeeff
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    var light = new THREE.DirectionalLight(0xFFFFFF, 0.7); //0xefefff
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    var light = new THREE.DirectionalLight(0xeeeeff, 1); //0xffefef
    light.position.set(-1, -1, -1).normalize();
    scene.add(light);


    planes = [];
    boids = [];


    planeMat = new THREE.MeshStandardMaterial({
        color:0xCCCCFF,
        metalness: 0,
        emissive: 1,
        vertexColors: THREE.FaceColors,

        side: THREE.DoubleSide
    });






// 定义一个天空对象
//     Sky = function(){
//         this.mesh = new THREE.Object3D();
//         this.nClouds = 20;
//
//         var stepAngle = 0
//         for(var i=0; i<this.nClouds; i++){
//             var c = new Cloud();
//             clouds.push(c);
//            var a = stepAngle*i;
//            var h = 350 + Math.random()*200;
//             c.mesh.position.y = 0;
//             c.mesh.position.x = 0;
//             c.mesh.position.z = -400-Math.random()*400;
//             c.mesh.rotation.z = a + Math.PI/2;
//            var s = 1+Math.random()*1;
//            c.mesh.scale.set(s,s,s);
//             this.mesh.add(c.mesh);
//         }
//     }

// 现在我们实例化天空对象，而且将它放置在屏幕中间稍微偏下的位置。



   // function createSky(){




        // sky = new Sky();
        // sky.mesh.position.y = -300;
        // scene.add(sky.mesh);



    //}

    //createSky()

    boid= new Boid();
    boid.position.x = 0;
    boid.position.y = 0;
    boid.position.z = 0;
    boid.velocity.x = 0;
    boid.velocity.y = 0;
    boid.velocity.z = 0;
    boid.setAvoidWalls(true);
    boid.setWorldSize(400, 400, 400);
    plane = new THREE.Mesh(new Plane(), planeMat);
    plane.geometry.scale(2, 2, 2);
    //plane.position.z =0
    plane.rotation.set(.3,-4.7,0)
    plane.geometry.center()
    scene.add(plane);


    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.shadowMap.enabled = true;
    // container = document.getElementById('world');
    // container.appendChild(renderer.domElement);
    container.appendChild( renderer.domElement );


    document.addEventListener('mousemove', onDocumentMouseMove, false);
    //document.body.appendChild(renderer.domElement);
    //
    window.addEventListener('resize', onWindowResize, false);


    // Controls
    // var controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.target.set( 0, 1, 0 );
    // controls.update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    // var vector = new THREE.Vector3(event.clientX - SCREEN_WIDTH_HALF, -event.clientY + SCREEN_HEIGHT_HALF, 0);
    // for (var i = 0, il = boids.length; i < il; i++) {
    //     boid = boids[i];
    //     vector.z = boid.position.z;
    //     boid.repulse(vector);
    // }




}
//
function animate() {
    requestAnimationFrame(animate);

    //sea.moveWaves();



    position = ( ( Date.now() - start_time ) * 0.13 ) % 8000;

    //camera.position.x += ( mouseX - camera.position.x ) * 0.1;
    //camera.position.y += ( - mouseY - camera.position.y ) * 0.1;
    mesh.position.z =0+position;
    plane.position.z =7900;





    // clearText()
    //
    // //碰撞
    //
    // var originPoint = plane.position.clone();
    // for (var vertexIndex = 0; vertexIndex < plane.geometry.vertices.length; vertexIndex++) {
    //     var localVertex = plane.geometry.vertices[vertexIndex].clone();
    //     var globalVertex = localVertex.applyMatrix4(plane.matrix);
    //     var directionVector = globalVertex.sub(plane.position);
    //
    //     var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    //     var collisionResults = ray.intersectObjects(collidableMeshList);
    //     if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
    //         appendText(" Hit ");
    //         //scene.remove(wall);
    //
    // }

    //wall.position.z=6000+position


    var originPoint = plane.position.clone();

    for (var vertexIndex = 0; vertexIndex < plane.geometry.vertices.length; vertexIndex++) {
        // 顶点原始坐标
        var localVertex = plane.geometry.vertices[vertexIndex].clone();
        // 顶点经过变换后的坐标
        var globalVertex = localVertex.applyMatrix4(plane.matrix);
        var directionVector = globalVertex.sub(plane.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }

    if (crash) {
        //            message.innerText = "crash";
        plane.material.color.setHex(0x346386);
        console.log("Crash");
        if (crashId !== lastCrashId) {
            //score -= 100;
            vv++
            lastCrashId = crashId;
            document.getElementById("message").innerHTML=vv;

            //gg=8000
            //plane.position.z+=(gg-plane.position.z)*0.5
            //plane.position.y+=(Math.random()*50-plane.position.y)*0.5
           // plane.rotation.z+=(100-plane.position.z)*0.5
            plane.rotateX(Math.PI/360);//绕x轴旋转π/4



        }

        //document.getElementById('explode_sound').play()

    } else {
        //            message.innerText = "Safe";
        plane.material.color.setHex(0x694300);

        plane.rotateX(0);//绕x轴旋转π/4

       // plane.position.z=7900
        //plane.rotation.z=0
        //plane.position.y=0


    }

    if (Math.random() < 0.03 && cubes.length < 30) {

        makeRandomCube();
    }

    for (var i = 0; i < cubes.length; i++) {

        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);

        } else {

            cubes[i].position.z += 10;

        }
        //                renderer.render(scene, camera);
    }






    // smallSphere.position.set(
    //     Math.cos( timer * 0.1 ) * 30,
    //     Math.abs( Math.cos( timer * 0.2 ) ) * 20 + 5,
    //     Math.sin( timer * 0.1 ) * 30
    // );




    //console.log(plane.geometry.vertices.length)

    //console.log(mesh.position.z)
    render();



    // if(vv==20){
    //
    //     //renderer.setClearColor(Math.random()*0xCCCCFF, 1);
    //     //plane.material.color.set(Math.random()*0xCCCCFF)
    //
    //
    //     var c = new Cloud();
    //     clouds.push(c);
    //     c.mesh.position.y = 100+Math.random()*-200;
    //     c.mesh.position.x = Math.random()*100;
    //     c.mesh.position.z = -6000;
    //     c.mesh.scale.set(4,4,4);
    //     scene.add(c.mesh);
    //
    //     //console.log("///")
    //
    //     new TWEEN.Tween( c.mesh.position )
    //             .delay(100)
    //             .to( { x: 2000+Math.random() * -4000, y: 2000+Math.random() * -4000 , z: 4000 }, 5000 )
    //             .start();
    //
    //     vv=0
    // }
    //
    //
    // for(var i=0;i<clouds.length;i++){
    //
    //     if(clouds[i].mesh.position.z==4000){
    //
    //         scene.remove(clouds[i].mesh);
    //         clouds.splice(i,1)
    //     }
    //
    // }

    //console.log(clouds.length)



    // for(var i=0;i<clouds.length;i++){
    //
    //     //clouds[i].mesh.position.x+=1
    //     new TWEEN.Tween( clouds[i].mesh.position )
    //         .delay(i/100)
    //         .to( { x: Math.random() * -4000, y: Math.random() * 1000 , z: Math.random() * 4000 }, 10000 )
    //         .start();
    //
    // }

    //sky.mesh.position.x+= 1.01;
    //sky.mesh.position.x += 1.01;
    //sky.mesh.position.y += 1.01;
   // plane.rotation.x = .1;
   // plane.rotation.set(.28,-4.7,0)
   // plane.rotation.z += 0.01;









}

function render() {
    // for (var i = 0, il = planes.length; i < il; i++) {
    //     boid = boids[i];
    //     boid.run(boids);
    //     plane = planes[i];
    //     plane.position.copy(boids[i].position);
    //
    //     plane.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
    //     plane.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
    //
    // }

    //TWEEN.update();

   // plane.rotation.y += 2-Math.random()*.02
    //document.getElementById('txt').innerHTML="x:"+Math.floor(accGravity.x)+"y:"+Math.floor(accGravity.y)+"id=13"
    plane.position.x+=(accGravity.x/5)
    mesh.position.x+=(-accGravity.x/5)
    plane.rotateX(accGravity.x/200)




    //plane.rotation.y+=(accGravity.x/10) * Math.PI / 180;


    //plane.position.y+=(Math.random()*(0.05))
    // plane.position.y+=1+Math.random()*-2

    //plane.rotation.set(.3,-4.7+accGravity.x/10,0)

    renderer.render(scene, camera);




}

// 返回一个介于min和max之间的随机数
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// 返回一个介于min和max之间的整型随机数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function makeRandomCube() {

    // var a = 1 * 50,
    //     b = getRandomInt(1, 3) * 50,
    //     c = 1 * 50;
    var geometry = new THREE.IcosahedronBufferGeometry( 15, 0 );
    // var material = new THREE.MeshBasicMaterial({
    //     color: Math.random() * 0xffffff,
    //     //size: 3
    // });
    var material = new THREE.MeshPhongMaterial( { color: 0x0dc3b4, emissive: 0x333333, flatShading: true } )


    var box = new THREE.Mesh(geometry, material);
    //var box = new THREE.BoxHelper(object,0x0dc3b4);
    box.material.color.setHex(Math.random() * 0xffffff);
    //box.material.color.setHex(0xff0000);

    box.position.x = getRandomArbitrary(-250, 250);
    //box.position.y = 1 + getRandomInt(1, 3) * 50 / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    box.scale.x = box.scale.y = Math.random() * Math.random() * 2 + 0.5;
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);

    // var sphereGeometry = new THREE.SphereGeometry(7, 25, 25);
    // var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
    // var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);



}