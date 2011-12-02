var stage = $('#gameoflife');

// set the scene size
var WIDTH = 400,
    HEIGHT = 400;

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 1,
    FAR = 10000;

var renderer;
var camera;
var scene;

function init() {
    // create a canvas renderer, camera
    // and a scene
    renderer = new THREE.CanvasRenderer();
    camera = new THREE.PerspectiveCamera(
                   VIEW_ANGLE,
                   ASPECT,
                   NEAR,
                   FAR );
    
    scene = new THREE.Scene();
    
    // the camera starts at 0,0,0 so pull it back
    camera.position.y = 800;
    
    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);
    
    // attach the render-supplied DOM element
    stage.append(renderer.domElement);
    /*
    var geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( - 500, 0, 0 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 500, 0, 0 ) ) );
    
    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );
    
    for ( var i = 0; i <= 20; i ++ ) {
        var line = new THREE.Line( geometry, material );
        line.position.z = ( i * 50 ) - 500;
        scene.add( line );
    
        var line = new THREE.Line( geometry, material );
        line.position.x = ( i * 50 ) - 500;
        line.rotation.y = 90 * Math.PI / 180;
        scene.add( line );
    }
    
    // add some ambient light
    var ambientLight = new THREE.AmbientLight( 0x606060 );
    scene.add( ambientLight );
    
    var materials = [];

    for ( var i = 0; i < 6; i ++ ) {
        materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) );
    }
    
    cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
    cube.position.y = 150;
    cube.overdraw = true;
    scene.add( cube );
    */
    // draw!
    renderer.render(scene, camera);
}

$(document).ready(function () {
    init();
    Grid.init();
});

Grid = function() {
    
    return {
        // map size
        x : 20,
        y : 20,
        z : 20,
        
        cube_w:Math.floor(WIDTH/x),
        cube_h:Math.floor(HEIGHT/y),
        cube_d:Math.floor(400/z),
        
        // thresholds
        th : {
            lonely: 3,
            breed: {min: 4, max: 6},
            overcrowd: 8
        },
        
        // the actual map
        map: [],
        
        // functions!!!
        /** Initializes the map */
        init: function() {
            // clear the map
            this.map = [];
            
            // build out the (empty) map
            for (i=0;i<this.x;i++) {
                // add the sub array
                this.map[i] = [];
                for (j=0;j<this.y;j++) {
                    // add the sub array
                    this.map[i][j] = [];
                    for (k=0;k<this.z;k++) {
                        // set the position to 0
                        this.map[i][j][k] = false;
                    }
                }
            }
        },
        /** Gets the 'life' value of a position on the map
         * @param x The 'x' position
         * @param y The 'y' position
         * @param z The 'z' position
         * @returns {bool} true if alive, false if dead
         */
        is_alive: function (x,y,z) {
            return this.map[x][y][z];
        },
        /** Gets the number of living neighbours
         * @param x The 'x' position
         * @param y The 'y' position
         * @param z The 'z' position
         * @returns {int} The count of living neighbours
         */
        living_neighbours : function (x,y,z) {
            // get the min and max to search, respecting the grid boundries
            min_x = (x > 0 ? x-1 : x);
            max_x = (x < this.x-1 ? x+1: x);
            min_y = (y > 0 ? y-1 : y);
            max_y = (y < this.y-1 ? y+1: y);
            min_z = (z > 0 ? z-1 : z);
            max_z = (z < this.z-1 ? z+1: z);
            
            // initialise the number of neighbors
            neighbours = 0;
            
            // now perform the search
            for (i=min_x;i<=max_x;i++) {
                for (j=min_y;j<=max_y;j++) {
                    for (k=min_z;k<=max_z;k++) {
                        // ignore the item we're looking for neighbours for
                        if (i!=x && j!=y && k!=z) {
                            neighbours += (this.is_alive(i,j,k)?1:0);
                        }
                    }
                }
            }
            
            // return however many we found
            return neighbours;
        },
        render: function() {
            var newmap = []
            
            for (i=0;i<this.x;i++) {
                // add the sub array
                newmap[i] = [];
                for (j=0;j<this.y;j++) {
                    // add the sub array
                    newmap[i][j] = [];
                    for (k=0;k<this.z;k++) {
                        // set the position to 0
                        newmap[i][j][k] = false;
                        
                        var cell = this.is_alive(i,j,k);
                        var n = this.living_neighbours(i,j,k);
                        
                        // transpose
                        if (cell) {
                            // is the cell lonely or overcrowded?
                            if (n <= this.th.lonely || n >= this.th.overcrowd) {
                                // kill the cell off
                                scene.remove(cell);
                            } else {
                                // if not, just copy it across
                                newmap[i][j][k] = cell;
                            }
                        } else {
                            // check if we're in the breed threshold
                            if (n >= this.th.breed.min && n <= this.th.breed.max) {
                                var materials = [];
                                for ( var l = 0; l < 6; l ++ ) {
                                    materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) );
                                }
                                
                                var newcell = new THREE.Mesh( new THREE.CubeGeometry( this.cube_w, this.cube_h, this.cube_d, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
                                // Position the cube
                                newcell.position.x = i*this.cube_w;
                                newcell.position.y = j*this.cube_h;
                                newcell.position.z = k*this.cube_d;
                                
                                newcell.overdraw = true;
                                scene.add( newcell );
                            }
                        }
                    }
                }
            }
            
            // replace the map
            this.map = newmap;
        }
    };
} ();