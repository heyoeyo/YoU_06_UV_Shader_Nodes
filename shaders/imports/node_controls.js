

class Vector {

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    update(component_letter, new_value) {
        const lowercase_component = component_letter.toLowerCase();
        if (lowercase_component === "x") this.x = new_value;
        if (lowercase_component === "y") this.y = new_value;
        if (lowercase_component === "z") this.z = new_value;
        if (lowercase_component === "w") this.w = new_value;

        return;
    }

    // ...............................................................................................................

    static * letter_iter(...data) {

        /*
        Helper used to loop over every entry of the provided data while also supplying vector labels
        Samples are returned in the same order that they are supplied, with the vector letter
        (e.g. X, Y, Z, W) returned as a final value.
        Example use:

        for (let [val_a, val_b, val_c, letter_label] of Vector.zip(data_a, data_b, data_c)) {
            ...
        }
        */

        // Figure out the largest data size, so we know to return that many letters
        let longest_data = 0;
        for (let d of data) {
            longest_data = Math.max(longest_data, d.length);
        }

        // Return each data sample/row along with the corresponding vector letter
        const vector_letters = ["X", "Y", "Z", "W"];
        for (let idx = 0; idx < longest_data; idx ++) {

            // Bundle data samples at the current index
            let data_samples = [];
            for (let d of data) {
                data_samples.push(d[idx]);
            }

            yield [...data_samples, vector_letters[idx]];
        }

        return;
    }
}


// ===================================================================================================================


class ControlGroup {

    // ...............................................................................................................

    constructor() {
        this._on_change_cb = () => console.warn(`Missing ctrlgroup on_change function!`);
    }

    // ...............................................................................................................

    to_array = (value) => Array.isArray(value) ? value : [value];

    // ...............................................................................................................

    on_change = (on_change_callback) => this._on_change_cb = on_change_callback;

    // ...............................................................................................................

    add_vector(control_label, default_value, step = null) {

        // Force default to be interpreted as a 'vector'
        const default_as_vector = this.to_array(default_value);

        // Set up step sizes as a vector if possible
        const has_step = (step != null);
        const step_as_vector = this.to_array(step);

        const new_vector = new Vector();
        for (let [value, step, letter_label] of Vector.letter_iter(default_as_vector, step_as_vector)) {

            // Construct element id
            const inp_elem_ref = create_control_elem(control_label, letter_label);

            // Set default value & step
            inp_elem_ref.value = value;
            if (has_step) inp_elem_ref.step = step;

            // Attach control to vector component
            const new_ctrl = new ScrollableFloatInput(inp_elem_ref, (new_ctrl_value) => {
                new_vector.update(letter_label, new_ctrl_value);
                this._on_change_cb();
            });
            new_vector.update(letter_label, new_ctrl.read_input_as_num());

        }

        return new_vector;
    }

    // ...............................................................................................................

}

