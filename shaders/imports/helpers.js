

// Constants
const PI = Math.PI;
const TWO_PI = 2 * PI;
const ONE_OVER_TWO_PI = 1.0 / TWO_PI;

// For convenience, used by several shader functions
const length_xy = (x, y) => Math.sqrt(x * x + y * y);

// Helper used to streamline/standardize plot setup
function setup_shader_plot(node_title, render_implementation_class) {

    // Make sure the base graphics are setup
    generate_empty_shader_node_html(node_title);

    // Set up render implementation, which will also attach
    // controls to base HTML (very hacky, but easy to use...)
    const ctrls = new ControlGroup();
    const render_implementation = new render_implementation_class(ctrls);

    // Set up canvas rendering with render implementation & attach update listeners
    const plot = new UVShaderPlot(render_implementation);
    ctrls.on_change(plot.update);

    return [ctrls, render_implementation, plot];
}
