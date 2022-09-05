
class TruchetImage {

    NUM_TILES = 4;
    TILE_SIZE_PX = 75;
    SIDE_LENGTH_PX = this.NUM_TILES * this.TILE_SIZE_PX;

    BG_COLOR = "rgb(70,40,80)";
    FG_COLOR = "rgb(145, 20, 85)";
    FG_OUTLINE_COLOR = "rgba(0,0,0,0.5)";

    // .......................................................................................................

    constructor() {

        const canvas_ref = document.createElement("canvas");
        canvas_ref.width = this.SIDE_LENGTH_PX;
        canvas_ref.height = this.SIDE_LENGTH_PX
        this.ctx = canvas_ref.getContext("2d");

        // Draw initial canvas image!
        this.ctx.fillStyle = this.BG_COLOR;
        this.ctx.fillRect(0, 0, this.SIDE_LENGTH_PX, this.SIDE_LENGTH_PX);
        this.draw_tiles();
    }

    // .......................................................................................................

    get_image_wh() {
        return [this.SIDE_LENGTH_PX, this.SIDE_LENGTH_PX];
    }

    // .......................................................................................................

    get_pixel_data() {
        return this.ctx.getImageData(0, 0, this.SIDE_LENGTH_PX, this.SIDE_LENGTH_PX).data;
    }

    // .......................................................................................................

    draw_tiles() {

        for (let row = 0; row < this.NUM_TILES; row++) {
            for (let col = 0; col < this.NUM_TILES; col++) {

                const x_off = col * this.TILE_SIZE_PX;
                const y_off = row * this.TILE_SIZE_PX;

                this.draw_one_tile(x_off, y_off);                
            }
        }

        return;
    }

    // .......................................................................................................
    
    draw_one_tile = (x_offset, y_offset) => {

        // Get tile corner co-ords.
        const x1 = x_offset;
        const x2 = x1 + this.TILE_SIZE_PX;
        const y1 = y_offset;
        const y2 = y1 + this.TILE_SIZE_PX;
        
        // For clarity
        const deg_90 = Math.PI / 2;
        const deg_180 = Math.PI;
        const deg_270 = 3 * Math.PI / 2;
        
        // Draw one of two truchet patterns, randomly chosen
        const random_flag = Math.random() > 0.5;
        const tile_radius = (this.TILE_SIZE_PX / 2);
        let circ_top, circ_bot;
        if (random_flag) {
            circ_top = [x1, y1, tile_radius, 0, deg_90];
            circ_bot = [x2, y2, tile_radius, deg_180, deg_270];
        } else {
            circ_top = [x2, y1, tile_radius, deg_90, deg_180];
            circ_bot = [x1, y2, tile_radius, -deg_90, 0];
        }

        // For convenience, define styling here
        const styling = [
            [this.FG_OUTLINE_COLOR, this.TILE_SIZE_PX / 4],
            [this.FG_COLOR, this.TILE_SIZE_PX / 8]
        ];

        // Draw pattern twice, once with outline style, then again with fg style
        for (let [color, line_width] of styling) {

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = line_width;

            this.ctx.beginPath();
            this.ctx.arc(...circ_top);
            this.ctx.stroke();
            this.ctx.closePath();
            
            this.ctx.beginPath();
            this.ctx.arc(...circ_bot);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

}