var Plane = function() {

    var scope = this;

    THREE.Geometry.call(this);

    v(15, 0, 0);
    v(0, 0, -4);
    v(0, 0, -1);
    v(0, -2.5, 0);
    v(0, 0, 1);
    v(0, 0, 4);
    //houdu
    v(-0.9, 0, -1.9);
    v(-0.9, 0, 1.9);

    //top
    f3(0, 2, 1, 0xFFFFFF); //0xFFCC99
    f3(0, 2, 3, 0xFFFFFF);
    f3(0, 4, 3, 0xFFFFFF);
    f3(0, 4, 5, 0xFFFFFF);
    //bottom
    f3(0, 1, 6, 0xFFFFFF);//"#cedae8"
    f3(0, 6, 3, 0xFFFFFF);
    f3(0, 3, 7, 0xFFFFFF);
    f3(0, 7, 5, 0xFFFFFF);
    //back
    f3(1, 2, 6, 0xFFFFFF);
    f3(2, 6, 3, 0xFFFFFF);
    f3(4, 4, 7, 0xFFFFFF);
    f3(4, 7, 5, 0xFFFFFF);

    this.computeFaceNormals();

    function v(x, y, z) {

        scope.vertices.push(new THREE.Vector3(x, y, z));

    }

    function f3(a, b, c, color = 0xff0000) {
        var face = new THREE.Face3(a, b, c);
        face.color = new THREE.Color(color);
        scope.faces.push(face);
        return face;
    }

}

Plane.prototype = Object.create(THREE.Geometry.prototype);
Plane.prototype.constructor = Plane;