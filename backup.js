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
    // TODO: Add a preview to the active before sending it to the grid
    //      Basically, how Tetris does it, it has a "next block" window. Idea - set that window as a container and grab it when its ready to play
    // Creates the active by randomly selecting from blocks
    const block = blocks[Math.round(Math.random() * (blocks.length - 1))]
    const pos = block[0]
    const color = block[1]

    for (let i=0; i<pos.length; i++) {
        let sprite = new PIXI.Sprite(texture)
        sprite.tint = Math.floor(Math.random() * 16777216)
        let x = pos[i][0] + 5
        let y = pos[i][1] + 2

        sprite_move(sprite, x, y)
        active.push(sprite)
        container.addChild(sprite)
    }
}

function active_check(x, y) {
    // TODO: Allow y to go negative
    // Check if active can move to a position
    let check = true
    for (let i=0; i<active.length; i++) {
        let block = active[i]
        let tempX = x + block.gridX
        let tempY = y + block.gridY

        let temp = grid_grab(tempX, tempY)

        if (temp !== null) {
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
        return true
    }
    return false
}

function active_move_to(pos) {
    // TODO: Might want to rewrite this. Make it where it can go out of the way of blocks
    //      and not allow players to cheat by constantly rotating at the bottom
    // Moves to list of positions.
    // pos has to be an array of coordinates [x, y] with indexes matching Active.
    // Such as pos[0] is where to move active[0]. Same with pos[1] -> active[1], etc

    let old_pos = []        // Array of positions of where the blocks use to be
    let offset = [0, 0]     // If active is out of bounds, move by [x, y]

    function check(value, length, i) {
        // TODO: Ignore Y if its below zero
        if (value >= length) {
            value = (length - 1) - value
            if (offset[i] >= value)
                offset[i] = value

        } else if (value < 0) {
            value *= -1
            if (offset[i] <= value)
                offset[i] = value
        }
    }

    // Move the active by array of positions
    for (let i=0; i<pos.length; i++) {
        // Check if positions are valid
        let coord = pos[i]
        let temp = grid_grab(coord[0], coord[1])

        if (temp === undefined) {
            // Out of bounds, find out by how much
            // Checking X
            check(coord[0], grid[0].length, 0)
            // Checking Y
            check(coord[1], grid.length, 1)
        } else if (temp !== null) {
            // TODO: Add a check to move away from the block (similar as above)
            // block in the way, can't move. Return back to old positions
            active_move_to(old_pos)
            return false
        }
        // Grab the old positions then move the sprite.
        old_pos[i] = [active[i].gridX, active[i].gridY]
        sprite_move(active[i], coord[0], coord[1])
    }

    // Checking if active needs to be moved
    if (offset[0] !== 0 || offset[1] !== 0) {
        console.table(offset)
        let test = active_move_by(offset[0], offset[1])
        if (test === false)
            // Blocks in the way, move back to the old positions
            active_move_to(old_pos)

        return test
    }
    return true
}

function active_rotate() {
    // Rotates the active

    let coords = []

    // Grabbing the pivot
    let pivotX = active[0].gridX
    let pivotY = active[0].gridY

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
