Grid = function() {
    return {
        // map size
        x : 20,
        y : 20,
        z : 20,
        
        // block dimensions
        cube_w:Math.floor(WIDTH/this.x),
        cube_h:Math.floor(HEIGHT/this.y),
        cube_d:Math.floor(400/this.z),
        
        // thresholds
        th : {
            lonely: 2,
            breed: {min: 3, max: 6},
            overcrowd: 9
        },
        
        // the actual map
        map: [],
        
        // functions!!!
        /** Initializes the map */
        init: function() {
            // clear the map
            this.map = [];
            
            // set the width and height of cubes
            this.cube_w=Math.floor(WIDTH/this.x);
            this.cube_h=Math.floor(HEIGHT/this.y);
            this.cube_d=Math.floor(400/this.z);
            
            var i = 0;
            var j = 0;
            var k = 0;
            
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
                        
                        // randomly decide if we should populate this cell (about 10% of cells will be populated)
                        if (Math.round(Math.random()*10)==1) {
                            this.map[i][j][k] = this.addCell(i,j,k);
                        }
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
            var min_x = (x > 0 ? x-1 : x);
            var max_x = (x < this.x-1 ? x+1: x);
            var min_y = (y > 0 ? y-1 : y);
            var max_y = (y < this.y-1 ? y+1: y);
            var min_z = (z > 0 ? z-1 : z);
            var max_z = (z < this.z-1 ? z+1: z);
            
            // initialise the number of neighbors
            var neighbours = 0;
            
            // the ijk vars
            var i = 0;
            var j = 0;
            var k = 0;
            
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
            var newmap = [];
            
            var i = 0;
            var j = 0;
            var k = 0;
            
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
                                var newcell = this.addCell(i,j,k);
                                
                                if (newcell) {
                                    // add the cell to the new map
                                    newmap[i][j][k] = newcell;
                                }
                            }
                        }
                    }
                }
            }
            
            // replace the map
            this.map = newmap;
            
            // draw
            renderer.render(scene, camera);
        },
        addCell: function (x,y,z) {
            if (!this.is_alive(x,y,z)) {
                var materials = [];
                for ( var l = 0; l < 6; l ++ ) {
                    materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) );
                }
                
                var newcell = new THREE.Mesh( new THREE.CubeGeometry( this.cube_w, this.cube_h, this.cube_d, 1, 1, 1, materials ), new THREE.MeshFaceMaterial() );
                
                // Position the cube
                newcell.position.x = Math.round(x*this.cube_w);
                newcell.position.y = Math.round(y*this.cube_h);
                newcell.position.z = Math.round(z*this.cube_d);
                
                // draw it
                newcell.overdraw = true;
                scene.add( newcell );
                
                return newcell;
            }
            
            return false;
        }
    };
} ();

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
    camera.position.x = 200;
    camera.position.y = 200;
    camera.position.z = 900;
    
    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);
    
    // attach the render-supplied DOM element
    stage.append(renderer.domElement);
    
    Grid.init();
    
    // draw!
    renderer.render(scene, camera);
}

$(document).ready(function () {
    init();
});