
class ScrollableFloatInput {

    // ...........................................................................................................

    constructor(elem_ref, on_value_change_callback) {

        // Store inputs
        this.elem_ref = elem_ref;
        this.value_change_cb = on_value_change_callback;

        // Pre-store step value (so we don't continuously re-read it)
        this.step = this.read_step_as_num();
        this.step_num_digits = this.get_decimal_places(this.step);

        // Initialize state variables
        this.drag_start_x, this.drag_start_value, this.is_changed_by_drag;
        this.last_num_steps, this.num_digits_to_render;
        this.reset_state();

        // Attach listeners
        this.elem_ref.addEventListener("pointerdown", this.pointer_start_cb);
        this.elem_ref.addEventListener("pointermove", this.pointer_move_cb);
        this.elem_ref.addEventListener("pointerup", this.pointer_end_db);
        this.elem_ref.addEventListener("change", this.direct_text_edit_cb);
    }

    // ...........................................................................................................

    read_input_as_num = () => Number(this.elem_ref.value);

    // ...........................................................................................................


    read_step_as_num() {

        // Use the step value, if provided
        let step_as_num = Number(this.elem_ref.step);
        const good_step_value = (step_as_num != 0);
        if (good_step_value) return step_as_num;

        // If no step value, try to infer it from the current value
        const curr_value = this.elem_ref.value;
        const curr_decimal_places = this.get_decimal_places(curr_value);
        step_as_num = Math.pow(10, -1 * curr_decimal_places);
        return step_as_num;
    }

    // ...........................................................................................................

    get_decimal_places(numerical_value, max_allowed_places = 5) {

        /*
        Helper used to figure out how many decimal places are in a given numerical values
        Ideally, we'd just calculate the decimal part and see how many digits there are
        But this approach can fail due to floating point inaccuracies (see: 1.23 - Math.floor(1.23))
        So this function uses strings instead. It also tries to catch cases where inaccurate
        floating point numbers are directly provided (though no guarantees it always works!)
        */

        // Force value into string format
        let value_as_str = String(numerical_value);

        // Handle case where there is no decimal (i.e integer values)
        const decimal_idx = value_as_str.indexOf(".");
        const no_decimal = (decimal_idx === -1);
        if (no_decimal) return 0;

        // Handle case where we get too many decimals to start due to floating point rounding errors
        // -> Try to get a 'clean' string version before we count the decimal places
        const is_small_int = (String(parseInt(value_as_str)).length < max_allowed_places);
        const too_many_digits = (value_as_str.length > max_allowed_places);
        if (is_small_int && too_many_digits) {
            const value_as_float = parseFloat(value_as_str);
            value_as_str = Number(value_as_float.toFixed(max_allowed_places)).toString();
        }

        // Check the length of the string representing everything after the decimal
        const decimal_part_of_str = value_as_str.slice(1 + decimal_idx);
        const num_decimal_places = decimal_part_of_str.length;

        return num_decimal_places;
    }

    // ...........................................................................................................

    reset_state() {
        this.is_changed_by_drag = false;
        this.drag_start_x = null;
        this.drag_start_value = null;
        this.last_num_steps = null;
        this.num_digits_to_render = null;
    }

    // ...........................................................................................................

    pointer_start_cb = (event) => {

        // Prevent usual text-editing prompt behavior
        event.preventDefault();

        // Record starting state for handling changes on-drag
        this.drag_start_x = event.pageX;
        this.drag_start_value = this.read_input_as_num();
        this.last_num_steps = 0;

        // Figure out how many digits to render on output
        const start_value_num_digits = this.get_decimal_places(this.drag_start_value);
        this.num_digits_to_render = Math.max(start_value_num_digits, this.step_num_digits);

        // This allows us to continue to register pointer move events
        // outside the bounds of the input element (i.e. so we can drag far from the input)
        this.elem_ref.setPointerCapture(event.pointerId);
    }

    // ...........................................................................................................

    pointer_move_cb = (event) => {

        // Bail if we're not actually dragging
        // (the move event occurs even if we're just hovering across the element!)
        const not_dragging = (this.drag_start_x === null);
        if (not_dragging) return;

        // Get the change in x position and convert to a number of steps for changing the input
        const x_delta = event.pageX - this.drag_start_x;
        const num_steps = Math.ceil(x_delta * (1/20));
        const no_step_change = (num_steps === this.last_num_steps);
        if (no_step_change) return;

        // If we get here, we've registered a change in input, so record step count for future checks
        this.is_changed_by_drag = true;
        this.last_num_steps = num_steps;

        // Update the input based on the number of steps
        const value_delta = num_steps * this.step;
        const new_value = this.drag_start_value + value_delta;
        this.elem_ref.value = new_value.toFixed(this.num_digits_to_render);

        // Propagate update
        const new_value_as_num = this.read_input_as_num();
        this.value_change_cb(new_value_as_num);
    }

    // ...........................................................................................................

    pointer_end_db = (event) => {

        // Auto select-all for the user to edit, if they didn't change the input by dragging
        if (!this.is_changed_by_drag) {
            this.elem_ref.select();
        }

        // Reset state variables
        this.reset_state();

        // Clean up out-of-bounds pointer capture
        // (we set this up to be able to scroll 'outside' of the input element, but we're done with it now)
        this.elem_ref.releasePointerCapture(event.pointerId);

        return;
    }

    // ...........................................................................................................

    direct_text_edit_cb = (event) => {

        /* Callback intended for use when input is directly changed (i.e. 'normal' click & typing) */
        
        // Bail on bad values (i.e. user left text blank)
        const new_value_as_num = this.read_input_as_num();
        const nan_value = isNaN(new_value_as_num);
        if (nan_value) return;

        // Update on good values
        this.value_change_cb(new_value_as_num);

        return;
    }

    // ...........................................................................................................
}