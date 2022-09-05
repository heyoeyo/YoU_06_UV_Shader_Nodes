

class UVShaderPlot {

    side_length_px = 250;
    max_px_idx = this.side_length_px - 1;

    // ...............................................................................................................

    constructor(render_implementation) {

        // Store inputs & get context for re-use when drawing
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.render_from_uv_func = render_implementation.from_uvs;
        
        // Set the canvas to the desired size
        this.canvas.width = this.side_length_px;
        this.canvas.height = this.side_length_px;

        // Set up some helpful pre-calculated values
        this.w_px_to_norm = 1 / this.max_px_idx;
        this.h_px_to_norm = 1 / this.max_px_idx;
        
        // Image data stuff
        this.use_input_image = true;
        this.truchet_canvas = new TruchetImage();
        this.input_img_wh = this.truchet_canvas.get_image_wh();
        this.input_pixel_data = this.truchet_canvas.get_pixel_data();

        // Perform initial render
        this.anim_request = null;
        this.set_initial_color(1, 0.1, 1);
        this._rerender();

        // Set up listeners
        this.attach_hover_callback();
        this.attach_toggle_callback();
    }

    // ...............................................................................................................

    set_initial_color(red_norm, green_norm, blue_norm) {

        // Convert from 0.0/1.0 range to 0/255 range
        const red_uint8 = norm_to_uint8(red_norm);
        const green_uint8 = norm_to_uint8(green_norm);
        const blue_uint8 = norm_to_uint8(blue_norm);
        const rgb_str = `rgb(${red_uint8}, ${green_uint8}, ${blue_uint8})`;

        // Draw rectangle over full canvas to set all initial pixel values
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = rgb_str;
        this.ctx.fill();
    }

    // ...............................................................................................................

    update = () => {
        if(this.anim_request != null) cancelAnimationFrame(this.anim_request);
        this.anim_request = requestAnimationFrame(this._rerender);
    }

    // ...............................................................................................................

    _rerender = () => {

        // Get iteration boundaries
        const x1 = 0, y1 = 0;
        const x2 = this.canvas.width;
        const y2 = this.canvas.height;
        
        // Get existing data
        const image_data = this.ctx.getImageData(x1, y1, x2, y2);
        const pixel_data = image_data.data;

        let pixel_idx = 0;
        let u, v;
        let u_warp, v_warp;
        let r, g, b;
        let max_row = -1;
        let max_col = -1;
        let min_row = 1000;
        let min_col = 1000;
        let min_u = 1000;
        let min_v = 1000;
        let max_u = -1;
        let max_v = -1;
        for(let row = y1; row < y2; row++) {
            for(let col = x1; col < x2; col++) {

                // Generate pixel values based on (normalized) positioning
                [u, v] = this.get_xy_norm(col, row);
                [u_warp, v_warp] = this.render_from_uv_func(u, v); 
                [r, g, b] = this.output_from_uv(u_warp, v_warp);

                // Fill in pixel RGB(A) values
                pixel_idx = (row * this.side_length_px + col) * 4;
                pixel_data[pixel_idx + 0] = r;
                pixel_data[pixel_idx + 1] = g;
                pixel_data[pixel_idx + 2] = b;

                max_col = Math.max(max_col, col);
                max_row = Math.max(max_row, row);
                max_u = Math.max(max_u, u);
                max_v = Math.max(max_v, v);

                min_col = Math.min(min_col, col);
                min_row = Math.min(min_row, row);
                min_u = Math.min(min_u, u);
                min_v = Math.min(min_v, v);
            }
        }

        // Update pixel data on-screen
        this.ctx.putImageData(image_data, 0, 0);

        console.log("U:", min_u, max_u);
        console.log("V:", min_v, max_v);
        console.log("C:", min_col, max_col);
        console.log("R:", min_row, max_row);
    }

    // ...............................................................................................................

    get_xy_norm = (x_px, y_px) => [x_px * this.w_px_to_norm, (this.max_px_idx - y_px) * this.h_px_to_norm];

    // ...............................................................................................................

    get_plot_value(x_norm, y_norm) {
        return this.render_from_uv_func(x_norm, y_norm);
    }

    // ...............................................................................................................

    output_from_uv = (u, v) => {

        let r,g,b;
        if (this.use_input_image) {

            // For clarity
            const [in_w, in_h] = this.input_img_wh;
            const w_max = in_w - 1;
            const h_max = in_h - 1;

            // Use provided UVs to sample from a reference image
            const frac_u = u - Math.floor(u);
            const frac_v = v - Math.floor(v);
            let col_idx = Math.round(frac_u * w_max);
            let row_idx = Math.round(h_max * (1 - frac_v));

            const in_idx = (row_idx * in_w + col_idx) * 4;
            r = this.input_pixel_data[in_idx + 0];
            g = this.input_pixel_data[in_idx + 1];
            b = this.input_pixel_data[in_idx + 2];

        } else {

            // Render red/green UV image
            r = norm_to_uint8(u);
            g = norm_to_uint8(v);
            b = 0;
        }

        return [r, g, b];
    }

    // ...............................................................................................................

    attach_hover_callback() {

        /* Callback used to provide indicator of plot value at mouse hover position */

        // Assume specific element are on the page
        const x_text_ref = document.querySelector(".x_coord");
        const y_text_ref = document.querySelector(".y_coord");

        const this_ref = this;
        function _callback(event) {
    
            // Get mouse position, relative to canvas top-left coord.
            const x_px = event.offsetX;
            const y_px = event.offsetY;
    
            // Normalize coords. Also flip y, so we're measuring relative to bottom-left
            const x_norm = x_px / this_ref.canvas.width;
            const y_norm = 1.0 - (y_px / this_ref.canvas.height);
    
            // Update x/y elements with plot values
            const [x,y] = this_ref.get_plot_value(x_norm, y_norm);
            x_text_ref.innerText = nice_number_str(x);
            y_text_ref.innerText = nice_number_str(y);
        }

        // Update text whenever we hover the canvas
        this.canvas.addEventListener("mousemove", _callback);

        return;
    }

    // ...............................................................................................................

    attach_toggle_callback() {

        // Hacky: Assume the toggle element exists
        const toggle_elem = document.getElementById("use_image_toggle");

        const this_ref = this;
        function _callback(event) {
            this_ref.use_input_image = toggle_elem.checked;
            this_ref._rerender();
        }

        _callback();
        toggle_elem.addEventListener("change", _callback);
    }

    // ...............................................................................................................

}


function nice_number_str(value) {
        
    /* Helper which takes in a numerical value and converts to a string with a plus sign if needed */
    
    let value_as_str = Number(value).toFixed(2);
    const is_negative = (value < 0);
    if (!is_negative) {
        value_as_str = `+${value_as_str}`;
    }
    
    return value_as_str;
}

function norm_to_uint8 (norm_value) {
    return Math.round(255 * norm_value);
}