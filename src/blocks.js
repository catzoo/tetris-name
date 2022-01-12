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
    // [[coordinates], color] - [coordinates][0] will be the pivot
    // TODO: Fix colors a bit more
    //[[[0, 0], [3, 0], [1, 0], [2, 0]], 0x01F0F1]  // l
    // [[[0, 0], [-1, 0], [1, 0], [0, 1]], 0xA000F3],      // T
    // [[[0, 0], [1, 0], [-1, 0], [-1, -1]], 0x0101EE],    // J
    // [[[0, 0], [-1, 0], [1, 0], [1, -1]], 0xEFA000],     // L
    //[[[0, 0], [0, -1], [1, -1], [1, 0]], 0xF0F100]    // O
    //[[[0, 0], [1, 0], [0, 1], [1, 1]], 0x0] // O
    // [[[0, 0], [-1, 0], [0, -1], [1, -1]], 0x00F100],    // S
    // [[[0, 0], [1, 0], [0, -1], [-1, -1]], 0xF00100]     // Z

    //[[[0, 0], [1, 0], [2, 0], [3, 0]], 0x0], // l
    [[[0, 0], [0, 1], [1, 1], [1, 0]], 0x0], // O
    //[[[0, 0], [1, 0], [2, 0], [2, 1]], 0x0] // L
]
