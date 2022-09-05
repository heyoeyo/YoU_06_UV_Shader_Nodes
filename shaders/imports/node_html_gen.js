
// -------------------------------------------------------------------------------------------------------------------
// Define functions

// ...................................................................................................................

const getbyid = (elem_id) => document.getElementById(elem_id);
const make_ctrlrow_id = (control_label) => `${control_label}_row`;
const make_input_id = (control_label, letter_label) => `${control_label}_${letter_label}`;
const make_ctrlcontainer_id = (control_label) => `${control_label}_ctrls_container`;

// ...................................................................................................................

function generate_empty_shader_node_html(node_title) {

    /*
    Function which generates 'boilerplate' html for shader nodes
    Does NOT include HTML for shader-specific controls
    -> these are added later when the shader code is defined (i.e. by control group class)
    */

    // Create header title bar for shader node
    const title_elem = newelem("h1", "node_title");
    title_elem.innerText = node_title;

    // Create empty space for controls + the actual canvas for rendering
    const ctrlspace_elem = newelem("ul", "ctrls_space", "ctrls");
    const canvas_elem = newelem("canvas", "plot_canvas");

    // Create hover indicator
    const indicator_elem = newelem("p", "xy_indicator");
    indicator_elem.innerHTML = "(<span class='x_coord'>+0.00</span>, <span class='y_coord'>+0.00</span>)";

    // Create image toggle
    const toggle_label = newelem("label", "toggle_label");
    toggle_label.innerText = "Use image data";
    toggle_label.htmlFor = "use_image_toggle";
    const img_toggle_elem = newelem("input", "image_toggle", "use_image_toggle");
    img_toggle_elem.type = "checkbox";
    const toggle_holder = newelem("div", "toggle_holder");
    toggle_holder.appendChild(img_toggle_elem);
    toggle_holder.appendChild(toggle_label);

    // Bundle all node graphics together
    const node_gfx_elem = newelem("div", "node_container");
    node_gfx_elem.appendChild(title_elem);
    node_gfx_elem.appendChild(ctrlspace_elem);
    node_gfx_elem.appendChild(canvas_elem);

    // Hacky: Assume a target holder exists and attach to it
    const centering_elem = getbyid("centering_holder")
    centering_elem.appendChild(node_gfx_elem);
    centering_elem.appendChild(indicator_elem);
    centering_elem.appendChild(toggle_holder);
}

// ...................................................................................................................

function create_control_elem(control_label, letter_label) {

    // Create (empty) html if the control hasn't been setup yet (i.e. we're creating first vector letter component)
    const row_id = make_ctrlrow_id(control_label);
    const row_ref = getbyid(row_id);
    const missing_row = (row_ref === null);
    if (missing_row) create_empty_control_row_html(control_label);

    // Set up lettered control input
    const label_elem = newelem("label", "letter_label");
    label_elem.innerText = letter_label;
    const inp_id = make_input_id(control_label, letter_label);
    const inp_elem = newelem("input", "ctrl_input", inp_id);
    inp_elem.type = "number";

    // Hacky: Attach to control container, assuming it's there
    const container_id = make_ctrlcontainer_id(control_label);
    const container_elem = getbyid(container_id);
    container_elem.appendChild(label_elem);
    container_elem.appendChild(inp_elem);

    return inp_elem;
}

// ...................................................................................................................

function create_empty_control_row_html(control_label) {

    /*
    Creates HTML like:
    <li class="ctrl_row" id=(row_id)>
        <label class="ctrl_label">(label)</label>
        <div class="ctrl_inputs_container" id=(container_id)></div>
    </li>
    */

    // Set up inner elements
    const label_elem = newelem("label", "ctrl_label");
    label_elem.innerText = control_label
    const container_id = make_ctrlcontainer_id(control_label);
    const container_elem = newelem("div", "ctrl_inputs_container", container_id);

    // Bundle everything into one row
    const row_id = make_ctrlrow_id(control_label);
    const row_elem = newelem("li", "ctrl_row", row_id);
    row_elem.appendChild(label_elem);
    row_elem.appendChild(container_elem);

    // Hacky: Assume a target holder and attach html
    const holder_elem = document.querySelector(".ctrls_space");
    holder_elem.appendChild(row_elem);

    return;
}

// ...................................................................................................................

function newelem(tag, elem_class = NO_CLASS, elem_id = NO_ID) {
    
    /* Helper used to create new HTML elements for less messy code */
    
    const new_elem = document.createElement(tag);
    if (elem_id != NO_ID) new_elem.id = elem_id;
    if (elem_class != NO_CLASS) new_elem.className = elem_class;
    
    return new_elem;
}

// ...................................................................................................................


// -------------------------------------------------------------------------------------------------------------------
// Globals

const NO_CLASS = null;
const NO_ID = null;