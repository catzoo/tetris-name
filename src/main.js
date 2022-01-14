// Create the application helper and add its render target to the page
const app = new PIXI.Application({
        resizeTo: window,
        // height: window.innerHeight,
        // width: window.innerWidth,
        backgroundAlpha: 0
    }
);

document.body.appendChild(app.view);

// Grabbing the texture
const texture = PIXI.Texture.from("img/sample.png");
// Width / Height of the texture. This is a bit smaller than the texture's actual width / height
const t_width = 28
const t_height = 28

let container = new PIXI.Container()
app.stage.addChild(container)

const act_fall = 60 // Configuration, when will active fall.
let elapsed = 0     // How long its been since last fall

// This will help keep track of all current blocks in the game.
// This doesn't contain the active falling blocks
let grid = [
    // [null or PIXI.Sprite]
]

// Active falling blocks
let active = [
    // PIXI.Sprite
]

// Keep track of active's pivot.
// Could be undefined which means to use active[0] as the pivot
let active_pivot = undefined


function grid_create(height, width) {
    let row = []
    for (let i=0; i < width; i++) {
        row.push(null)
    }
    for (let i=0; i < height; i++) {
        grid.push(row.slice())
    }
}

function grid_grab(x, y) {
    // Grabs from the grid. This just does grid[y][x] but with a check wrapping it.
    // If TypeError is raised, it'll return undefined, else it'll return the value at x, y
    let value = null
    try {
        value = grid[y][x]
    } catch (TypeError) {
        return undefined
    }
    return value
}

function grid_set(x, y, value) {
    // Sets a value in the grid at x, y. This just does grid[y][x] = value
    // This will return a bool if the value was successfully set
    if (grid_grab(x, y) === undefined) {
        return false
    } else {
        grid[y][x] = value
        return true
    }
}

function grid_row_move(y, t_y) {
    // Moves the row at y by t_y. Basically, if y = 0 and t_y = 1, it'll move the whole row at 0 by 1
    // Could easily just swap the two rows (by doing grid[y] = grid[y + t_y]), but need to move the sprites first
    let row = grid[y]
    for (let x=0; x<row.length; x++) {
        let sprite = grid[y][x]
        if (sprite !== null) {
            // Moving the sprite
            sprite_move(sprite, x, y + t_y)
            // Moving it on the grid
            grid_set(x, y + t_y, sprite)
            grid_set(x, y, null)
        }
    }
}

function grid_row_remove(y) {
    // Removes a row at y
    // Could easily just set grid[y][x] = Array(row.length).fill(null)
    // But need to destroy the sprites for PixiJS so its not rendering / have a memory leak
    let row = grid[y]
    for (let x=0; x<row.length; x++) {
        let sprite = grid[y][x]
        if (sprite !== null) {
            // Destroying the sprite
            sprite.destroy()
            // Setting it to null
            grid_set(x, y, null)
        }
    }
}

function sprite_move(sprite, x, y) {
    // Updating the sprite's grid coords
    sprite.gridX = x
    sprite.gridY = y

    // Grabbing the container coordinates
    x = x * t_width;
    y = y * t_height;

    // Setting the position
    sprite.x = x
    sprite.y = y
}

function active_create() {
    // TODO: Add a chance system for each block or, don't create the same block as last time

    // TODO: Add a preview to the active before sending it to the grid
    //      Basically, how Tetris does it, it has a "next block" window. Idea - set that window as a container and grab it when its ready to play
    // Creates the active by randomly selecting from blocks
    const block = blocks[Math.round(Math.random() * (blocks.length - 1))]

    // Grabbing info from the block
    const pos = block["coords"]
    const color = block["color"]
    // Grabbing the pivot
    if (block["pivot"] == null) {
        active_pivot = undefined
    } else {
        active_pivot = block["pivot"].slice()
    }

    let sizeX = [0, 0]
    let sizeY = [0, 0]

    // Creating the block
    for (let i=0; i<pos.length; i++) {
        let sprite = new PIXI.Sprite(texture)
        sprite.tint = Math.floor(Math.random() * 16777216)
        //sprite.tint = color
        let x = pos[i][0]
        let y = pos[i][1]

        // TODO: Figure out how to grab the size
        if (x > sizeX[1])
            sizeX[1] = x
        else if (x < sizeX[0])
            sizeX[0] = x

        if (y > sizeY[1])
            sizeY[1] = y
        else if (y < sizeY[0])
            sizeY[0] = y

        sprite_move(sprite, x, y)
        active.push(sprite)
        container.addChild(sprite)
    }

    if (!active_move_by(4, 0)) {
        // TODO: Stop the game here
        console.log("Game end")
    }

}

function active_check(x, y) {
    // Check if active can move to a position
    let check = true
    for (let i=0; i<active.length; i++) {
        let block = active[i]
        let tempX = x + block.gridX
        let tempY = y + block.gridY

        let temp = grid_grab(tempX, tempY)

        if (temp === undefined) {
            if (!(tempY < 0 && 0 <= tempX && tempX < grid[0].length)) {
                check = false
            }
        } else if (temp !== null) {
            check = false
        }
    }
    return check
}

function active_move_by(x, y) {
    // Moves the active blocks by x, y
    if (active_check(x, y)) {
        for (let i=0; i<active.length; i++) {
            let sprite = active[i]
            sprite_move(sprite, sprite.gridX + x, sprite.gridY + y)
        }
        if (active_pivot != null) {
            active_pivot[0] += x
            active_pivot[1] += y
        }

        return true
    }
    return false
}

function active_move_to(pos) {
    // Moves to list of positions.
    // pos has to be an array of coordinates [x, y] with indexes matching Active.
    // Such as pos[0] is where to move active[0]. Same with pos[1] -> active[1], etc

    let old_pos = []        // Array of positions of where the blocks use to be
    let check = true        // if a block is in the way or active is out of bounds

    // Move the active by array of positions
    for (let i=0; i<pos.length; i++) {
        // Check if positions are valid
        let coord = pos[i]
        let temp = grid_grab(coord[0], coord[1])

        if (temp === undefined || temp !== null) {
            // Block is out of bounds or something is in the way
            check = false
        }
        // Grab the old positions then move the sprite.
        old_pos[i] = [active[i].gridX, active[i].gridY]
        sprite_move(active[i], coord[0], coord[1])
    }

    // Checking if active needs to be moved
    if (!check) {
        // Checking first before moving active. Doing this just in case check changes and it messes up here
        // Also there was a bug, when active was in a correct spot (-y), but it kept moving up everytime it rotated
        if (active_check(0, 0)) {
            return true
        }
        // This isn't efficient and doesn't feel like tetris. Basically, it moves active by x or y seeing if it'll fit
        let stage = [[0, -1], [-1, 0], [1, 0]]
        let i = 0

        for (let i=0; i<stage.length; i++) {
            // Going through each "stage" and modifying it
            let st = stage[i]

            for (let k=1; k<=active.length; k++) {
                // Going through each x, y and testing it
                let x = st[0] * k
                let y = st[1] * k
                if (active_move_by(x, y))
                    // Found a possible spot, return true
                    return true
            }
        }
        // can't move out of the way
        active_move_to(old_pos)
        return false
    }
    return true
}

function active_rotate() {
    // Rotates the active
    let coords = []

    // Grabbing the pivot
    let pivotX, pivotY

    if (active_pivot != null) {
        pivotX = active_pivot[0]
        pivotY = active_pivot[1]

    } else {
        pivotX = active[0].gridX
        pivotY = active[0].gridY
    }

    // Go through each block getting the new coordinates
    for (let i=0; i<active.length; i++) {
        let block = active[i]

        // Grabbing x / y and the radius
        let x = block.gridX - pivotX
        let y = block.gridY - pivotY
        let r = Math.sqrt(x * x + y * y)

        if (r !== 0) {
            // Grabbing the angle the block is at (comparing with the pivot)
            let angle = Math.atan2(y, x);
            // Converting 90 degrees into radians and adding to the angle
            angle += 90 * (Math.PI / 180);

            // Grabbing the new position
            let x2 = Math.round(Math.cos(angle) * r + pivotX)
            let y2 = Math.round(Math.sin(angle) * r + pivotY)

            coords.push([x2, y2])
        } else {
            coords.push([pivotX, pivotY])
        }
    }
    // Moving the blocks to position
    active_move_to(coords)
}

function active_remove() {
    // Remove from active and add to the grid
    for (let i=0; i<active.length; i++) {
        let block = active[i]
        grid_set(block.gridX, block.gridY, block)
    }
    active = []
}

function check_rows() {
    // Check if any rows are complete
    let move = 0
    for (let y=grid.length-1; y>=0; y--) {
        let row = grid[y]
        let complete = true
        for (let r = 0; r < row.length; r++) {
            if (row[r] === null) {
                complete = false
                break
            }
        }
        if (complete) {
            move += 1
            grid_row_remove(y)
        } else {
            if (move !== 0)
                grid_row_move(y, move)
        }
    }
}

function active_move_down() {
    // This moves active but removes it if it can't go down anymore.
    // This just calls other functions, but separating it since its used in two other functions
    let check = active_move_by(0, 1)
    if (check === false) {
        // Can't move down anymore
        active_remove()
        // Check if any rows are completed
        check_rows()
        // Recreate active
        active_create()
    }
}

function ticker(delta) {
    // Used to update the game every "tick"
    if (elapsed > act_fall) {
        elapsed = 0
        active_move_down()
    }
    elapsed += delta
    // TODO: When a row is complete, add a falling animation
    //      Basically, make an array with [y, move_by] entries and loop through
}

document.addEventListener("keydown", event => {
    // TODO: Don't allow user to hold down to spam inputs
    switch (event.key) {
        case 'ArrowUp':
            active_move_by(0, -1)
            break;
        case 'ArrowDown':
            // Clearing elapsed, so it doesn't fall twice on the player
            elapsed = 0
            // Using move_down rather than move_by to do checks
            active_move_down()
            break;
        case 'ArrowLeft':
            active_move_by(-1, 0)
            break;
        case 'ArrowRight':
            active_move_by(1, 0)
            break;
        case 'r':
        case 'R':
            active_rotate()
            break;
    }
})

function setup() {
    // TODO: add mask after testing
    // TODO: Add configuration for height / width
    const height = 20
    const width = 10
    const graphics = new PIXI.Graphics()

    // draw borders
    graphics.lineStyle(4, 0x0, 1, 0.5)
    graphics.beginFill(0x828282, 1)
    graphics.drawRect(0, 0, width * t_width + 4, height * t_height + 4)
    graphics.endFill()

    container.addChildAt(graphics, 0)
    container.x = 8
    container.y = 8

    // Create the grid
    grid_create(height, width)
    active_create()

    app.ticker.add(ticker)
}

setup()
