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

var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;
var camera, scene, renderer, planes, plane;
var boid, boids;
var planeMat;
var sea;
var vv=0

init();
animate();


function init() {

    var Colors = {
        red:0xf25346,
        white:0xd8d0d1,
        pink:0xF5986E,
        brown:0x59332e,
        brownDark:0x23190f,
        blue:0x68c3c0,
    };

    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
    camera.position.z = 50;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xeeeeff, 0, 950 );





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




    // for (var i = 0; i < 1; i++) {
    //     boid = boids[i] = new Boid();
    //     boid.position.x = 100+Math.random() * 100;
    //     boid.position.y = 100+Math.random() * 800;
    //     boid.position.z = Math.random() * 50;
    //     boid.velocity.x = 100+Math.random() * 200 - 1;
    //     boid.velocity.y = 100+Math.random() * 1200 - 1;
    //     boid.velocity.z = Math.random() * 20 - 1;
    //     boid.setAvoidWalls(true);
    //     boid.setWorldSize(800, 400, 400);
    //     plane = planes[i] = new THREE.Mesh(new Plane(), planeMat);
    //     plane.geometry.scale(3, 3, 3);
    //     scene.add(plane);
    // }

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
    //plane.geometry.scale(18, 18, 18);
    scene.add(plane);

    plane.rotation.set(.3,-4.7,0)
    plane.geometry.center()


    renderer = new THREE.WebGLRenderer();



    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.body.appendChild(renderer.domElement);
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
    render();
    //sea.moveWaves();

    vv++

    if(vv==150){

        //renderer.setClearColor(Math.random()*0xCCCCFF, 1);
        plane.material.color.set(Math.random()*0xCCCCFF)
        vv=0
    }


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



   // plane.rotation.y += 2-Math.random()*.02
    document.getElementById('txt').innerHTML="x:"+Math.floor(accGravity.x)+"y:"+Math.floor(accGravity.y)+"id=8"
    plane.position.x+=(accGravity.x/10)

    //plane.position.y+=(Math.random()*(0.05))
    // plane.position.y+=1+Math.random()*-2

     plane.rotation.set(.2,accGravity.x/10,0)

    renderer.render(scene, camera);




}