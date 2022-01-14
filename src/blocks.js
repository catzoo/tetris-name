// const texture = PIXI.Texture.from("sample.png");
//
// function createBlock(info, color) {
//     let container = new PIXI.Container()
//     let coords = info[0]
//
//     for (let i = 0; i < coords.length; i++) {
//         let block = new PIXI.Sprite(texture);
//         let x = coords[i][0] * (texture.width - 4);
//         let y = coords[i][1] * (texture.height - 4);
//
//         block.tint = color;
//
//         block.x = x;
//         block.y = y;
//
//         container.addChild(block)
//
//         if (info[1] === i) {
//             container.pivot.x = x + (texture.width) / 2;
//             container.pivot.y = y + (texture.height) / 2;
//         }
//     }
//     return container
// }

const blocks = [
    // TODO: Fix colors a bit more
    { // l
        coords: [[-1, 0], [0, 0], [1, 0], [2, 0]],
        color: 0x01F0F1,
        pivot: [0.5, 0.5]
    },
    { // O
        coords: [[0, 0], [0, -1], [1, -1], [1, 0]],
        color: 0xF0F100,
        pivot: [0.5, -0.5]
    },
    { // T
        coords: [[0, 0], [-1, 0], [1, 0], [0, -1]],
        color: 0xA000F3
    },
    { // J
        coords: [[0, 0], [1, 0], [-1, 0], [-1, -1]],
        color: 0x0101EE
    },
    { // L
        coords: [[0, 0], [-1, 0], [1, 0], [1, -1]],
        color: 0xEFA000
    },
    { // S
        coords: [[0, 0], [-1, 0], [0, -1], [1, -1]],
        color: 0x00F100
    },
    { // Z
        coords: [[0, 0], [1, 0], [0, -1], [-1, -1]],
        color: 0xF00100
    }
]
