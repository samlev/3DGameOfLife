/** Builds the "Game Of Life" env. */
function build() {
    Grid.init();
    
}

var stage = document.getElementByID('gameoflife');

// set the scene size
var WIDTH = stage.width,
    HEIGHT = stage.height;

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

// create a renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera = new THREE.PerspectiveCamera(
                   VIEW_ANGLE,
                   ASPECT,
                   NEAR,
                   FAR );

var scene = new THREE.Scene();

// the camera starts at 0,0,0 so pull it back
camera.position.z = 300;

// start the renderer
renderer.setSize(WIDTH, HEIGHT);

// attach the render-supplied DOM element
$container.append(renderer.domElement);

Grid = function() {
    
    return {
        // map size
        x : 30,
        y : 20,
        z : 10,
        
        // thresholds
        th : {
            lonely: 3,
            breed: 4,
            overcrowd: 6
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
        }
    };
} ();